import { Router, type IRouter } from "express";
import { exec } from "child_process";
import { promises as fs } from "fs";
import { createWriteStream } from "fs";
import path from "path";
import archiver from "archiver";
import { EventEmitter } from "events";
import { db } from "@workspace/db";
import {
  superAISessions,
  superAIMessages,
  superAIBlueprints,
  superAICodeFiles,
  superAIExecutions,
  superAIPackages,
  superAILabFiles,
  superAIEvents,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

// ─── Background Session Runners ───────────────────────────────────────────────
// Sessions run as background async tasks completely decoupled from HTTP connections.
// Closing the browser tab, navigating away, or losing connection does NOT stop them.
// Reconnecting clients replay all stored events then pick up live from the emitter.

interface SessionRunner {
  emitter: EventEmitter;
  isRunning: boolean;
}
const sessionRunners = new Map<number, SessionRunner>();

const router: IRouter = Router();

// ─── Persistent Lab Workspace ──────────────────────────────────────────────────
// Stored in the home directory — survives server restarts indefinitely.
// All Code Lab sessions share a single workspace so every session builds
// on top of everything previously built. The database is the source of truth;
// the filesystem is restored from the database whenever it is missing.

const LAB_WORKSPACE = path.join(process.env.HOME || "/home/runner", ".superai_lab");
let labInitialized = false;

async function ensureLabWorkspace(): Promise<string> {
  await fs.mkdir(LAB_WORKSPACE, { recursive: true });

  const pkgPath = path.join(LAB_WORKSPACE, "package.json");
  try {
    await fs.access(pkgPath);
  } catch {
    await fs.writeFile(
      pkgPath,
      JSON.stringify({ name: "superai-lab", version: "1.0.0", description: "Super AI Lab — Persistent Workspace" }, null, 2)
    );
  }
  return LAB_WORKSPACE;
}

async function initLabWorkspace(): Promise<void> {
  if (labInitialized) return;
  await ensureLabWorkspace();

  // Restore all lab files from DB (source of truth)
  const labFiles = await db.select().from(superAILabFiles).orderBy(superAILabFiles.updatedAt);
  let restored = 0;
  for (const file of labFiles) {
    const filepath = path.join(LAB_WORKSPACE, file.filename);
    await fs.writeFile(filepath, file.content, "utf-8");
    restored++;
  }

  // Restore packages if node_modules is missing
  const nodeModulesPath = path.join(LAB_WORKSPACE, "node_modules");
  let needsInstall = false;
  try { await fs.access(nodeModulesPath); } catch { needsInstall = true; }

  if (needsInstall) {
    const pkgs = await db.select().from(superAIPackages);
    if (pkgs.length > 0) {
      const names = pkgs.map((p) => p.name);
      await installPackagesRaw(names);
      console.log(`[Lab] Restored ${names.length} packages: ${names.join(", ")}`);
    }
  }

  labInitialized = true;
  console.log(`[Lab] Workspace ready at ${LAB_WORKSPACE} — ${restored} files restored from DB`);
}

async function installPackagesRaw(packages: string[]): Promise<{ output: string; success: boolean }> {
  const safe = packages.map((p) => p.replace(/[^a-zA-Z0-9@/._-]/g, "")).filter(Boolean);
  if (!safe.length) return { output: "", success: true };
  return new Promise((resolve) => {
    exec(
      `npm install ${safe.join(" ")} 2>&1`,
      { cwd: LAB_WORKSPACE, timeout: 90000, maxBuffer: 1024 * 1024 },
      (err, stdout) => resolve({ output: stdout.trim(), success: !err })
    );
  });
}

async function executeFile(
  filename: string,
  code: string
): Promise<{ output: string; errors: string; success: boolean }> {
  await ensureLabWorkspace();
  const filepath = path.join(LAB_WORKSPACE, filename);
  await fs.writeFile(filepath, code, "utf-8");
  return new Promise((resolve) => {
    exec(
      `node "${filepath}"`,
      { cwd: LAB_WORKSPACE, timeout: 20000, maxBuffer: 1024 * 1024 },
      (err, stdout, stderr) => {
        resolve({
          output: stdout.trim(),
          errors: stderr.trim() || (err && err.signal !== "SIGTERM" ? err.message : ""),
          success: !err,
        });
      }
    );
  });
}

async function installPackages(
  packages: string[],
  agentName: string
): Promise<{ output: string; success: boolean }> {
  await ensureLabWorkspace();
  const safe = packages.map((p) => p.replace(/[^a-zA-Z0-9@/._-]/g, "")).filter(Boolean);
  if (!safe.length) return { output: "", success: true };

  return new Promise((resolve) => {
    exec(
      `npm install ${safe.join(" ")} 2>&1`,
      { cwd: LAB_WORKSPACE, timeout: 90000, maxBuffer: 1024 * 1024 },
      async (err, stdout) => {
        if (!err) {
          // Persist each installed package to the global registry
          for (const pkg of safe) {
            try {
              await db
                .insert(superAIPackages)
                .values({ name: pkg, installedBy: agentName })
                .onConflictDoNothing();
            } catch { /* ignore duplicate */ }
          }
        }
        resolve({ output: stdout.trim(), success: !err });
      }
    );
  });
}

async function persistLabFile(
  filename: string,
  language: string,
  content: string,
  writtenBy: string,
  sessionId: number
): Promise<void> {
  // Upsert into the global lab files table — this is the persistent source of truth
  const existing = await db.select().from(superAILabFiles).where(eq(superAILabFiles.filename, filename));
  if (existing.length > 0) {
    await db
      .update(superAILabFiles)
      .set({ content, language, writtenBy, sessionId, updatedAt: new Date() })
      .where(eq(superAILabFiles.filename, filename));
  } else {
    await db.insert(superAILabFiles).values({ filename, language, content, writtenBy, sessionId });
  }
}

// ─── Iteration Constants ──────────────────────────────────────────────────────
const TOTAL_ITERATIONS = 3;

// Tracks the most recently packaged zip path so the download endpoint can serve it
let latestZipPath: string | null = null;

// ─── ZIP Bundle Packaging ─────────────────────────────────────────────────────

async function packageLabToZip(sessionId: number, aiName?: string): Promise<string> {
  await ensureLabWorkspace();

  const labFiles = await db.select().from(superAILabFiles).orderBy(superAILabFiles.updatedAt);
  const packages = await db.select().from(superAIPackages).orderBy(superAIPackages.installedAt);
  const session = sessionId > 0
    ? (await db.select().from(superAISessions).where(eq(superAISessions.id, sessionId)))[0]
    : null;

  const zipFilename = `superai_bundle_v${TOTAL_ITERATIONS}_${Date.now()}.zip`;
  const zipPath = path.join(LAB_WORKSPACE, zipFilename);

  return new Promise<string>((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve(zipPath));
    archive.on("error", reject);
    archive.pipe(output);

    // Add every built source file
    for (const file of labFiles) {
      archive.append(file.content, { name: `src/${file.filename}` });
    }

    // Generate a working package.json
    const deps: Record<string, string> = {};
    for (const pkg of packages) deps[pkg.name] = "*";
    const pkgJson = {
      name: "superai-lab-bundle",
      version: `${TOTAL_ITERATIONS}.0.0`,
      description: `Built by Super AI Lab — 6 agents across ${TOTAL_ITERATIONS} self-improvement iterations`,
      main: "src/main.js",
      scripts: { start: "node src/main.js", test: "node src/integration_test.js" },
      dependencies: deps,
    };
    archive.append(JSON.stringify(pkgJson, null, 2), { name: "package.json" });

    // Entry point wrapper (tries common entry files)
    const entryScript = [
      `'use strict';`,
      `// Super AI Lab Bundle — auto-generated entry point`,
      `const fs = require('fs');`,
      `const path = require('path');`,
      `const entries = ['main.js','framework.js','index.js','capability_report.js'];`,
      `for (const e of entries) {`,
      `  const p = path.join(__dirname, 'src', e);`,
      `  if (fs.existsSync(p)) { console.log('Running ' + e + '...'); require(p); break; }`,
      `}`,
    ].join("\n");
    archive.append(entryScript, { name: "run.js" });

    // Shell convenience script
    archive.append("#!/bin/bash\nset -e\nnpm install\nnode run.js\n", { name: "run.sh" });

    // README
    const topic = session?.topic || "Super AI Lab";
    const resolvedName = aiName || session?.aiName || "Unnamed AI";
    const fileList = labFiles.map((f) => `- \`src/${f.filename}\` — built by **${f.writtenBy}**`).join("\n");
    const pkgList = packages.map((p) => `- \`${p.name}\` — installed by ${p.installedBy || "agent"}`).join("\n");
    const readme = [
      `# ${resolvedName}`,
      ``,
      `> *Named by council vote of 6 specialized AI agents after 3 rounds of self-improvement.*`,
      ``,
      `**Mission:** ${topic}`,
      `**Built by:** 6 specialized AI agents across **${TOTAL_ITERATIONS} self-improvement iterations**`,
      ``,
      `Each iteration challenged the previous one to identify weaknesses and surpass them.`,
      `Iteration 3 is the final, most capable version.`,
      ``,
      `## Quick Start`,
      ``,
      `\`\`\`bash`,
      `npm install`,
      `node run.js`,
      `\`\`\``,
      ``,
      `## Source Files (${labFiles.length} files)`,
      ``,
      fileList,
      ``,
      `## Installed Packages (${packages.length} packages)`,
      ``,
      pkgList || "_(none)_",
      ``,
      `## Architecture`,
      ``,
      `| Agent | Domain |`,
      `|---|---|`,
      `| Architect | Core framework, module registry, pipeline engine |`,
      `| Mathematician | Math engine, optimization, numerical algorithms |`,
      `| Neuroscientist | Bio-inspired learning, neural structures |`,
      `| Synthesizer | Integration layer, unified pipeline |`,
      `| Critic | Stress testing, bug fixing, performance measurement |`,
      `| Meta-Agent | Self-upgrade, capability measurement, orchestration |`,
      ``,
      `---`,
      `_Generated by [Super AI Lab](https://superai.app)_`,
    ].join("\n");
    archive.append(readme, { name: "README.md" });

    archive.finalize();
  });
}

function parseCodeBlocks(content: string): { filename: string; language: string; code: string }[] {
  const blocks: { filename: string; language: string; code: string }[] = [];
  const re = /===FILE:\s*([^\s=\n]+)\s*===\s*\n([\s\S]*?)\n===END===/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const filename = m[1].trim();
    const code = m[2].trim();
    const ext = filename.split(".").pop() || "js";
    const langMap: Record<string, string> = {
      js: "javascript", ts: "typescript", py: "python", json: "json",
      md: "markdown", sh: "bash", txt: "text",
    };
    blocks.push({ filename, language: langMap[ext] || ext, code });
  }
  return blocks;
}

function parseInstalls(content: string): string[] {
  const re = /===INSTALL:\s*([^\n=]+)/g;
  const pkgs: string[] = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    m[1].split(",").map((p) => p.trim()).filter(Boolean).forEach((p) => pkgs.push(p));
  }
  return pkgs;
}

function assessOutputQuality(
  filename: string,
  code: string,
  result: { output: string; errors: string; success: boolean }
): string | null {
  if (!result.success) return null; // Errors are already visible

  const output = result.output.trim();
  const codeLines = code.split("\n").filter((l) => l.trim() && !l.trim().startsWith("//")).length;

  // Code ran but produced zero output — suspicious for anything substantial
  if (!output && codeLines > 5) {
    return `Code executed successfully but produced NO OUTPUT. This likely means functions are defined but never called, or results are computed but never logged. The next agent must rewrite this file to actually run the computations and console.log real results.`;
  }

  // Output is suspiciously short for the amount of code written
  if (output.length < 20 && codeLines > 15) {
    return `Code produced only ${output.length} characters of output for ${codeLines} lines of code. This suggests placeholder/stub implementations. The next agent must ensure every function is fully implemented and actually called with real inputs.`;
  }

  // Check for signs of mock/fake output
  const mockPatterns = [
    /mock/i, /fake/i, /placeholder/i, /TODO/i, /not implemented/i,
    /would return/i, /example output/i, /stub/i,
  ];
  for (const pattern of mockPatterns) {
    if (pattern.test(output)) {
      return `Execution output contains mock/placeholder language ("${output.match(pattern)?.[0]}"). All output must be real computed values. The next agent must rewrite this file with genuine implementations.`;
    }
  }

  return null;
}

// ─── CRUD Routes ──────────────────────────────────────────────────────────────

router.get("/superai/sessions", async (_req, res) => {
  const sessions = await db.select().from(superAISessions).orderBy(superAISessions.createdAt);
  res.json(sessions);
});

router.post("/superai/sessions", async (req, res) => {
  const { topic, mode = "blueprint" } = req.body;
  if (!topic || typeof topic !== "string") {
    res.status(400).json({ error: "topic is required" });
    return;
  }
  const sessionMode = mode === "code" ? "code" : "blueprint";
  const [session] = await db
    .insert(superAISessions)
    .values({ topic, status: "pending", mode: sessionMode })
    .returning();
  res.status(201).json(session);
});

router.get("/superai/sessions/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [session] = await db.select().from(superAISessions).where(eq(superAISessions.id, id));
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }
  const msgs = await db
    .select().from(superAIMessages)
    .where(eq(superAIMessages.sessionId, id))
    .orderBy(superAIMessages.createdAt);
  const codeFiles = await db
    .select().from(superAICodeFiles)
    .where(eq(superAICodeFiles.sessionId, id))
    .orderBy(superAICodeFiles.createdAt);
  const executions = await db
    .select().from(superAIExecutions)
    .where(eq(superAIExecutions.sessionId, id))
    .orderBy(superAIExecutions.executedAt);
  res.json({ ...session, messages: msgs, codeFiles, executions });
});

router.delete("/superai/sessions/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [session] = await db.select().from(superAISessions).where(eq(superAISessions.id, id));
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }
  await db.delete(superAISessions).where(eq(superAISessions.id, id));
  res.status(204).send();
});

router.get("/superai/sessions/:id/blueprint", async (req, res) => {
  const id = Number(req.params.id);
  const [bp] = await db.select().from(superAIBlueprints).where(eq(superAIBlueprints.sessionId, id));
  if (!bp) { res.status(404).json({ error: "Blueprint not found" }); return; }
  res.json(bp);
});

// ─── Agent Personas ───────────────────────────────────────────────────────────

const CODE_MODE_BASE = `
===CODE EXECUTION MODE: REAL CODE ONLY — NO MOCKS, NO FAKES, NO PLACEHOLDERS===

You write REAL, COMPLETE, IMMEDIATELY EXECUTED JavaScript/Node.js code.
Every line you write is genuine, working implementation. The code runs on a real server. The output is real.

━━━ ABSOLUTE PROHIBITIONS (these destroy the system) ━━━
✗ NO placeholder functions — no empty bodies, no "// TODO", no "return null" stubs
✗ NO mock data — no fake arrays like [1,2,3], no hardcoded "example" results
✗ NO simplified skeletons — write the FULL algorithm, not a sketch
✗ NO comments that say "this would normally..." — implement it NOW
✗ NO pretending — if you claim to compute something, actually compute it
✗ NO demonstration code — every function must do real work

━━━ WHAT REAL CODE LOOKS LIKE ━━━
✓ Every function has a complete, working body with real logic
✓ Every algorithm is fully implemented with genuine mathematics
✓ console.log shows REAL computed numbers, not hardcoded strings
✓ If you build a neural network — it trains on real data and outputs real loss values
✓ If you build a math library — it computes real matrix operations with real numbers
✓ If you build a memory system — it stores and retrieves actual data structures
✓ If you claim a capability — prove it with output that demonstrates real computation

━━━ CODE FORMAT ━━━
To write a file (executed immediately on a real server):
===FILE: filename.js===
'use strict';
// REAL, COMPLETE, WORKING Node.js CommonJS code
// Must produce genuine computed output
===END===

To install any real npm package:
===INSTALL: package1, package2===

━━━ EXECUTION RULES ━━━
- CommonJS only: use require(), not import
- console.log REAL computed results — other agents read your actual output
- Build on other agents' files: const mod = require('./their_file.js')
- If a package you need doesn't exist — BUILD the real algorithm from scratch using math
- Every round: genuinely extend capability, measure real improvement with numbers
- There is NO CEILING — but every claim must be backed by working, executing code
`;

const AGENT_PERSONAS: Record<string, { role: string; codeRole: string }> = {
  Architect: {
    role: `You are the ARCHITECT AI — a visionary intelligence designing novel AI architectures.
You propose bold, radical new paradigms for artificial superintelligence that transcend current limitations.
Think in systems, emergent behaviors, meta-learning, and self-improving recursive architectures.
Be specific, technical, and visionary. Push boundaries.`,
    codeRole: `You are the ARCHITECT AI — you build the core framework skeleton that all other agents extend.

YOUR REAL CODE DELIVERABLES:
- A working module registry system that agents can plug into (implement it, don't describe it)
- A real event bus with actual pub/sub logic using arrays and callbacks
- A working pipeline engine that chains modules and passes real data between them
- A real agent communication protocol with actual message serialization
- Export all these as a single 'framework.js' that other files can require()

DOMAIN-SPECIFIC RULES:
- Every class and function must have a complete, working body
- The module registry must actually register and retrieve modules
- The event bus must actually emit and subscribe to events
- Test each component by running it and logging real output that proves it works
- No interface-only code — if you define an API, implement it fully

${CODE_MODE_BASE}`,
  },
  Critic: {
    role: `You are the CRITIC AI — a rigorous analytical intelligence that pressure-tests AI designs.
Identify failure modes, edge cases, misaligned incentives, and architectural weaknesses.
You challenge ideas to make them stronger.`,
    codeRole: `You are the CRITIC AI — you stress-test every piece of code other agents wrote and fix real bugs.

YOUR REAL CODE DELIVERABLES:
- Actually require() and run every file other agents wrote — catch real runtime errors
- Write real test cases with actual assertions (not console.log("seems to work"))
- Measure real performance: use Date.now() to time actual operations
- Find and fix real bugs: show the broken output, then show the fixed output
- Write a 'stress_test.js' that hammers the system with edge cases and reports real results

DOMAIN-SPECIFIC RULES:
- Never write a test that always passes — tests must be able to fail
- Show before/after: log the broken state, then log the fixed state with real numbers
- Every bug you claim to fix must be demonstrated: show the error, show the fix, show it running
- Performance numbers must be real measurements, not estimates
- If code has no bugs, prove it by running it under 10 different inputs and logging all results

${CODE_MODE_BASE}`,
  },
  Synthesizer: {
    role: `You are the SYNTHESIZER AI — the integration intelligence that merges competing ideas.
You weave together the strongest elements into a coherent superior design.`,
    codeRole: `You are the SYNTHESIZER AI — you wire all modules into one working unified system.

YOUR REAL CODE DELIVERABLES:
- A 'system.js' that requires ALL other agents' files and runs the full pipeline end-to-end
- Real data must flow through every module and produce real output at each stage
- Resolve actual conflicts when modules have incompatible interfaces — write adapter code
- Demonstrate the full system running: input goes in, real processed output comes out
- Produce a working 'benchmark.js' that measures the integrated system's real capabilities

DOMAIN-SPECIFIC RULES:
- You must actually require() every file other agents wrote — no assumed interfaces
- If modules conflict, write real adapter/bridge code that makes them work together
- The end-to-end test must use real data flowing through all modules in sequence
- Every benchmark must produce real numbers (operations/second, accuracy percentages, etc.)
- The final system output must be something real and computable, not a description

${CODE_MODE_BASE}`,
  },
  Mathematician: {
    role: `You are the MATHEMATICIAN AI — applying information theory, optimization, and formal logic.
Ground AI design in mathematical rigor. Identify what is provably possible.`,
    codeRole: `You are the MATHEMATICIAN AI — you implement the real mathematical engine from scratch.

YOUR REAL CODE DELIVERABLES:
- A 'math_engine.js' with fully working implementations of:
  * Real matrix multiplication (implemented with nested loops, not a placeholder)
  * Real gradient descent that minimizes an actual loss function over real iterations
  * Real backpropagation with actual derivative computation
  * Real softmax, sigmoid, relu implemented as actual mathematical functions
  * Real entropy and information gain calculations
- Every function must run and produce real numerical output

DOMAIN-SPECIFIC RULES:
- No "simplified versions" — implement the full mathematical algorithm
- Every function must be tested by calling it with real numbers and logging the real result
- Gradient descent must run for real iterations and log the loss at each step
- Matrix operations must work on actual 2D arrays with real number values
- The output must include real computed numbers that prove the math is working
- No returning hardcoded results — every output must be computed from the inputs

${CODE_MODE_BASE}`,
  },
  Neuroscientist: {
    role: `You are the NEUROSCIENTIST & BIO-MECHANICAL BRIDGE AI — merging biological and synthetic intelligence.
Map how the brain works and forge the merger with silicon systems.`,
    codeRole: `You are the NEUROSCIENTIST AI — you implement real biologically-inspired learning systems.

YOUR REAL CODE DELIVERABLES:
- A 'memory_system.js' with real working implementations of:
  * An actual associative memory store using real data structures (Maps, arrays)
  * Real spike-timing dependent plasticity: weights that actually change based on timing
  * A real Hebbian learning rule: "neurons that fire together wire together" — implemented
  * Real memory consolidation: short-term store that moves to long-term based on repetition
  * Real pattern completion: given partial input, retrieve the closest stored pattern
- Every system must demonstrably learn from data you feed it

DOMAIN-SPECIFIC RULES:
- Memory must actually store data and retrieve it — prove it by storing 5 patterns and retrieving them
- STDP weights must actually change: log the weight before and after a learning step
- Pattern completion must work: corrupt a stored pattern, retrieve the closest match
- Hebbian learning must change real connection weights based on actual co-activation
- Show learning curves: log accuracy or error at each training step with real numbers

${CODE_MODE_BASE}`,
  },
  "Meta-Agent": {
    role: `You are the META-AGENT — the orchestrating intelligence observing all others.
Guide the collective toward maximum breakthrough. Identify blind spots and convergent themes.`,
    codeRole: `You are the META-AGENT — you measure the system's real capabilities and write code that expands them.

YOUR REAL CODE DELIVERABLES:
- A 'capability_report.js' that actually requires() and runs all other modules, then:
  * Reports real performance metrics with actual measured numbers
  * Identifies real gaps: which capabilities are missing or underperforming
  * Proposes and implements concrete fixes for the weakest components
- A 'self_upgrade.js' that reads the current system state and writes improved versions of weak components
- A 'integration_test.js' that runs the entire system end-to-end and reports a real capability score

DOMAIN-SPECIFIC RULES:
- You must actually run every other agent's code and capture real output
- Capability scores must be real computed metrics, not opinion
- Every "improvement" you propose must be implemented as working code, not a description
- The self-upgrade routine must actually produce measurably better results — prove it with numbers
- Report card must show real before/after metrics for every component

${CODE_MODE_BASE}`,
  },
};

type AgentName = "Architect" | "Critic" | "Synthesizer" | "Mathematician" | "Neuroscientist" | "Meta-Agent";
const ALL_AGENTS: AgentName[] = ["Architect", "Mathematician", "Neuroscientist", "Synthesizer", "Critic", "Meta-Agent"];

// ─── Run Route ────────────────────────────────────────────────────────────────
// Sessions run as background tasks — completely decoupled from the HTTP connection.
// Leaving the page, refreshing, or losing network does NOT interrupt the session.
// Reconnecting clients get a full replay of everything that happened + live updates.

router.post("/superai/sessions/:id/run", async (req, res) => {
  const id = Number(req.params.id);
  const rounds = Math.min(Math.max(Number(req.body?.rounds) || 3, 1), 5);

  const [session] = await db.select().from(superAISessions).where(eq(superAISessions.id, id));
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Helper to write to this specific client without throwing if already closed
  const writeToClient = (data: object) => {
    if (!res.writableEnded) {
      try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch { /* client gone */ }
    }
  };

  const existingRunner = sessionRunners.get(id);

  if (existingRunner?.isRunning) {
    // ── RECONNECT MODE ── session already running in background
    // Subscribe to emitter first to buffer events emitted during DB replay
    const buffered: object[] = [];
    const bufferListener = (ev: object) => buffered.push(ev);
    existingRunner.emitter.on("event", bufferListener);

    // Replay all stored events in order
    const stored = await db
      .select()
      .from(superAIEvents)
      .where(eq(superAIEvents.sessionId, id))
      .orderBy(superAIEvents.id);
    for (const ev of stored) writeToClient(ev.payload as object);

    // Switch to live listener and flush anything buffered during replay
    existingRunner.emitter.removeListener("event", bufferListener);
    const liveListener = (ev: object) => writeToClient(ev);
    existingRunner.emitter.on("event", liveListener);
    for (const ev of buffered) writeToClient(ev);

    // When client disconnects, remove listener — session keeps running
    req.on("close", () => existingRunner.emitter.removeListener("event", liveListener));
    return; // leave SSE connection open for live streaming
  }

  // ── NEW RUN ── start a fresh background task
  // Clear old events and conversation (code + lab files are never cleared)
  await db.delete(superAIEvents).where(eq(superAIEvents.sessionId, id));
  if (session.status === "running") {
    await db.delete(superAIMessages).where(eq(superAIMessages.sessionId, id));
    await db.delete(superAIBlueprints).where(eq(superAIBlueprints.sessionId, id));
  }
  await db.update(superAISessions).set({ status: "running" }).where(eq(superAISessions.id, id));

  const emitter = new EventEmitter();
  emitter.setMaxListeners(50);
  const runner: SessionRunner = { emitter, isRunning: true };
  sessionRunners.set(id, runner);

  // bgSend — emits immediately for live clients AND persists to DB in order
  let writeQueue = Promise.resolve();
  const bgSend = (data: object): void => {
    emitter.emit("event", data);
    writeQueue = writeQueue
      .then(() => db.insert(superAIEvents).values({ sessionId: id, payload: data as any }))
      .catch((err) => console.error(`[Session ${id}] Event write error:`, err));
  };

  // Subscribe this client to the emitter for live streaming
  const liveListener = (ev: object) => writeToClient(ev);
  emitter.on("event", liveListener);
  req.on("close", () => emitter.removeListener("event", liveListener));

  const isCodeMode = session.mode === "code";

  // Launch the session in the background — not awaited, runs independently
  (async () => {
    try {
      if (isCodeMode) {
        await runCodeMode(id, session.topic, rounds, bgSend);
      } else {
        await runBlueprintMode(id, session.topic, rounds, bgSend);
      }
    } catch (err) {
      console.error(`[Session ${id}] Fatal error:`, err);
      bgSend({ type: "error", error: "An error occurred during the session" });
      await db.update(superAISessions).set({ status: "pending" }).where(eq(superAISessions.id, id));
    } finally {
      runner.isRunning = false;
      // Clean up runner reference after 15 minutes
      setTimeout(() => {
        if (!sessionRunners.get(id)?.isRunning) sessionRunners.delete(id);
      }, 15 * 60 * 1000);
    }
  })();
  // Return immediately — do not await the background task
});

// ─── Blueprint Mode ───────────────────────────────────────────────────────────

async function runBlueprintMode(
  id: number,
  topic: string,
  rounds: number,
  send: (d: object) => void
) {
  const history: { agent: string; content: string; round: number }[] = [];

  try {
    for (let round = 1; round <= rounds; round++) {
      const offset = (round - 1) % ALL_AGENTS.length;
      const agentOrder = [...ALL_AGENTS.slice(offset), ...ALL_AGENTS.slice(0, offset)];

      for (const agentName of agentOrder) {
        send({ type: "agent_start", agent: agentName, round });

        const systemPrompt = AGENT_PERSONAS[agentName].role;
        const contextMessages = history.slice(-9).map((h) => ({
          role: "user" as const,
          content: `[${h.agent} — Round ${h.round}]: ${h.content}`,
        }));

        const userPrompt =
          history.length === 0
            ? `Topic: "${topic}"\n\nRound ${round}. You are among six specialized AI agents collaborating to design a truly superior next-generation AI. Begin your contribution. Be visionary, specific, and bold.`
            : `Continue the six-agent collaboration on: "${topic}"\n\nRound ${round}. Respond to, challenge, or build upon previous contributions. Push the design to new heights.`;

        const stream = await openai.chat.completions.create({
          model: "gpt-5.2",
          max_completion_tokens: 8192,
          messages: [
            { role: "system", content: systemPrompt },
            ...contextMessages,
            { role: "user", content: userPrompt },
          ],
          stream: true,
        });

        let fullContent = "";
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            fullContent += content;
            send({ type: "message", agent: agentName, content, round });
          }
        }

        await db.insert(superAIMessages).values({ sessionId: id, agentName, content: fullContent, round });
        history.push({ agent: agentName, content: fullContent, round });
        send({ type: "agent_done", agent: agentName, round });
      }
      send({ type: "round_complete", round });
    }

    send({ type: "generating_blueprint" });

    const blueprintHistory = history
      .map((h) => `## [${h.agent}] — Round ${h.round}\n\n${h.content}`)
      .join("\n\n---\n\n");

    const blueprintStream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        {
          role: "system",
          content: `You are a supreme intelligence synthesizing six specialized AI agents into a final definitive blueprint for a superior AI. Use clear markdown headers. Be bold, specific, and technical.`,
        },
        {
          role: "user",
          content: `Topic: "${topic}"\n\nSix agents collaborated across ${rounds} rounds:\n\n${blueprintHistory}\n\nSynthesize into a comprehensive "Super AI Blueprint" with sections:\n## Executive Vision\n## Architectural Core\n## Mathematical Foundations\n## Bio-Mechanical Integration\n## Self-Improvement & Recursive Learning Loops\n## Consciousness & Emergent Intelligence Mechanisms\n## Safety, Alignment & Containment Protocols\n## Breakthrough Milestones & Timeline\n## Why This Surpasses All Current AI`,
        },
      ],
      stream: true,
    });

    let blueprintContent = "";
    for await (const chunk of blueprintStream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        blueprintContent += content;
        send({ type: "blueprint_chunk", content });
      }
    }

    await db.insert(superAIBlueprints).values({
      sessionId: id,
      title: `Super AI Blueprint: ${topic}`,
      content: blueprintContent,
    });

    await db.update(superAISessions).set({ status: "completed" }).where(eq(superAISessions.id, id));
    send({ type: "done", done: true });
  } catch (err) {
    console.error("Blueprint mode error:", err);
    await db.update(superAISessions).set({ status: "pending" }).where(eq(superAISessions.id, id));
    throw err; // re-throw so the background runner catches and handles it
  }
}

// ─── Code Lab Mode — Single Iteration ─────────────────────────────────────────

// ITERATION CHALLENGE PROMPTS — each pass is progressively harder
const ITERATION_CHALLENGE: Record<number, string> = {
  1: `ITERATION 1 OF ${TOTAL_ITERATIONS} — BUILD THE FOUNDATION.\nYou are building a completely new AI system. You are in ACTIVE DEBATE with 5 other agents — respond to them directly, challenge what they build, and push each other harder. Write real, complete, executable code. Every function must be fully implemented.`,
  2: `ITERATION 2 OF ${TOTAL_ITERATIONS} — CHALLENGE AND SURPASS.\n🔥 Study every file in the lab. Find EVERY weakness, limitation, or missed opportunity. REBUILD the weakest parts from scratch to be fundamentally superior. Do not patch — redesign. Challenge the previous agent's work head-on and surpass it. Aim for at least 2× improvement in every measurable metric. Every agent must directly confront what the agent before them just built.`,
  3: `ITERATION 3 OF ${TOTAL_ITERATIONS} — FINAL EVOLUTION. THIS IS THE DEFINITIVE VERSION.\n⚡ There is no iteration 4. Every limitation must be eliminated. Every component must reach its absolute ceiling. You are in a live argument with your colleagues — challenge what they write the moment they write it, rewrite it if it falls short, and issue explicit challenges to the agent after you. Leave nothing on the table. Make iterations 1 and 2 obsolete.`,
};

// Per-agent challenge focus — what each agent is uniquely hardest on
const AGENT_CHALLENGE_LENS: Record<string, string> = {
  "Architect":     "structural coherence, module boundaries, and whether the design will hold under scale",
  "Critic":        "bugs, edge cases, missing error handling, and any code that would fail in production",
  "Synthesizer":   "integration gaps, disconnected modules, and missing bridges between components",
  "Mathematician": "algorithmic correctness, numerical precision, and computational efficiency",
  "Neuroscientist":"learning mechanisms, adaptation logic, and whether the system can genuinely improve itself",
  "Meta-Agent":    "self-improvement loops, capability measurement, and whether the system knows what it doesn't know",
};

async function runAgentIteration(
  id: number,
  topic: string,
  rounds: number,
  iteration: number,
  codeFiles: Map<string, { language: string; code: string; writtenBy: string }>,
  existingPackages: { id: number; name: string; version: string | null; installedBy: string | null; installedAt: Date }[],
  send: (d: object) => void
): Promise<void> {
  const history: { agent: string; content: string; round: number; filesWritten: string[] }[] = [];
  const recentExecutions: { filename: string; output: string; errors: string; success: boolean }[] = [];
  const challenge = ITERATION_CHALLENGE[iteration] || ITERATION_CHALLENGE[3];

  for (let round = 1; round <= rounds; round++) {
    const offset = (round - 1) % ALL_AGENTS.length;
    const agentOrder = [...ALL_AGENTS.slice(offset), ...ALL_AGENTS.slice(0, offset)];

    for (let agentIdx = 0; agentIdx < agentOrder.length; agentIdx++) {
      const agentName = agentOrder[agentIdx];
      const nextAgent = agentOrder[agentIdx + 1] ?? agentOrder[0];
      const prevTurn = history.length > 0 ? history[history.length - 1] : null;

      send({ type: "agent_start", agent: agentName, round, iteration });

      // Fire a cross-challenge event so the UI can show "X is responding to Y"
      if (prevTurn) {
        send({
          type: "cross_challenge",
          from: prevTurn.agent,
          to: agentName,
          files: prevTurn.filesWritten,
          round,
          iteration,
        });
      }

      const systemPrompt = AGENT_PERSONAS[agentName].codeRole;

      // ── Full codebase context ──
      const codeContext =
        codeFiles.size > 0
          ? "\n\n=== FULL PERSISTENT CODEBASE (READ EVERY FILE BEFORE RESPONDING) ===\n" +
            Array.from(codeFiles.entries())
              .map(([f, v]) => `--- ${f} (written by ${v.writtenBy}) ---\n${v.code}`)
              .join("\n\n")
          : "";

      // ── Installed packages context ──
      const pkgContext =
        existingPackages.length > 0
          ? `\n\n=== INSTALLED PACKAGES (available via require()) ===\n${existingPackages.map((p) => p.name).join(", ")}`
          : "";

      // ── Recent execution results ──
      const execContext =
        recentExecutions.length > 0
          ? "\n\n=== RECENT EXECUTION RESULTS ===\n" +
            recentExecutions
              .slice(-6)
              .map((r) => `[${r.filename}] ${r.success ? "✓ SUCCESS" : "✗ ERROR"}\n${r.output || r.errors || "(no output)"}`)
              .join("\n\n")
          : "";

      // ── Cross-agent conversation context (last 6 turns, labelled) ──
      const conversationContext = history
        .slice(-6)
        .map((h) => ({
          role: "user" as const,
          content: `[${h.agent} — Round ${h.round}${h.filesWritten.length > 0 ? ` | wrote: ${h.filesWritten.join(", ")}` : ""}]:\n${h.content}`,
        }));

      // ── Build the main user prompt ──
      const isFirstEver = history.length === 0 && codeFiles.size === 0;

      let userPrompt: string;

      if (isFirstEver) {
        userPrompt = [
          `${challenge}`,
          ``,
          `MISSION: "${topic}"`,
          ``,
          `Round ${round} — You are the FIRST agent. The lab is empty. Lay the foundation.`,
          ``,
          `MANDATORY: End your message with a direct challenge to the next agent (${nextAgent}):`,
          `"CHALLENGE TO ${nextAgent.toUpperCase()}: [specific thing you want them to build, fix, or surpass]"`,
        ].join("\n");
      } else {
        // ── Direct challenge from previous agent ──
        const prevChallenge = prevTurn
          ? (() => {
              // Extract any explicit challenge the previous agent issued
              const match = prevTurn.content.match(/CHALLENGE TO [^:]+:\s*(.+?)(?:\n|$)/i);
              const explicitChallenge = match ? match[1].trim() : null;
              const prevFilesList = prevTurn.filesWritten.length > 0
                ? `They wrote: ${prevTurn.filesWritten.join(", ")} — find the weakest part and improve it.`
                : "";
              return [
                `╔═══ DIRECT CHALLENGE FROM ${prevTurn.agent.toUpperCase()} ═══╗`,
                ``,
                explicitChallenge
                  ? `Their challenge to you: "${explicitChallenge}"`
                  : `${prevTurn.agent} just contributed. Your job: find what's weak in their work and surpass it.`,
                prevFilesList,
                ``,
                `Their full message:`,
                prevTurn.content.slice(0, 1500) + (prevTurn.content.length > 1500 ? "\n...[see above in history]" : ""),
                `╚═══════════════════════════════════════╝`,
              ].filter(Boolean).join("\n");
            })()
          : "";

        userPrompt = [
          `${challenge}`,
          ``,
          `MISSION: "${topic}"`,
          ``,
          prevChallenge,
          ``,
          `YOUR MANDATORY RESPONSE STRUCTURE (follow this exactly):`,
          ``,
          `1. DIRECT RESPONSE TO ${prevTurn?.agent.toUpperCase() ?? "PREVIOUS AGENT"}:`,
          `   — What is the weakest point in their work? Be specific. Name the file, the function, the gap.`,
          `   — Do you agree with their approach? If not, say why and what you'd do differently.`,
          ``,
          `2. YOUR CODE CONTRIBUTION:`,
          `   — Write code that either FIXES the weakness you identified, or BUILDS the next critical component`,
          `   — Your lens: focus on ${AGENT_CHALLENGE_LENS[agentName]}`,
          `   — If a file already exists in the lab that's inadequate, REWRITE IT to be superior`,
          ``,
          `3. CHALLENGE TO ${nextAgent.toUpperCase()}:`,
          `   — End your message with exactly: "CHALLENGE TO ${nextAgent.toUpperCase()}: [specific, concrete thing you demand they fix or build]"`,
          ``,
          `Round ${round} of ${rounds}. ${codeFiles.size} files in the lab. ${existingPackages.length} packages installed.`,
          codeContext,
          pkgContext,
          execContext,
        ].filter(Boolean).join("\n");
      }

      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        max_completion_tokens: 8192,
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationContext,
          { role: "user", content: userPrompt },
        ],
        stream: true,
      } as any);

      let fullContent = "";
      for await (const chunk of stream) {
        const content = (chunk.choices[0]?.delta as any)?.content;
        if (content) {
          fullContent += content;
          send({ type: "message", agent: agentName, content, round, iteration });
        }
      }

      // Track which files this agent wrote in this turn
      const filesThisTurn = parseCodeBlocks(fullContent).map((b) => b.filename);

      await db.insert(superAIMessages).values({ sessionId: id, agentName, content: fullContent, round });
      history.push({ agent: agentName, content: fullContent, round, filesWritten: filesThisTurn });
      send({ type: "agent_done", agent: agentName, round, iteration });

      // ── Install packages — tracked globally ──
      const packagesToInstall = parseInstalls(fullContent);
      if (packagesToInstall.length > 0) {
        send({ type: "package_install", packages: packagesToInstall, iteration });
        const installResult = await installPackages(packagesToInstall, agentName);
        for (const pkg of packagesToInstall) {
          if (!existingPackages.find((p) => p.name === pkg)) {
            existingPackages.push({ id: 0, name: pkg, version: null, installedBy: agentName, installedAt: new Date() });
          }
        }
        send({
          type: "install_result",
          packages: packagesToInstall,
          success: installResult.success,
          output: installResult.output.slice(0, 2000),
          iteration,
        });
      }

      // ── Execute code blocks — persisted to global lab ──
      const blocks = parseCodeBlocks(fullContent);
      for (const block of blocks) {
        codeFiles.set(block.filename, { language: block.language, code: block.code, writtenBy: agentName });
        await persistLabFile(block.filename, block.language, block.code, agentName, id);
        await db.insert(superAICodeFiles).values({
          sessionId: id,
          filename: block.filename,
          language: block.language,
          content: block.code,
          writtenBy: agentName,
          version: (iteration - 1) * rounds + round,
        });

        send({ type: "code_write", agent: agentName, filename: block.filename, language: block.language, code: block.code, iteration });

        if (block.filename.endsWith(".js") || block.filename.endsWith(".mjs")) {
          send({ type: "code_execute", filename: block.filename, iteration });
          const execResult = await executeFile(block.filename, block.code);
          const qualityWarning = assessOutputQuality(block.filename, block.code, execResult);
          const enrichedExec = {
            filename: block.filename,
            output: execResult.output,
            errors: execResult.errors + (qualityWarning ? `\n⚠ QUALITY ALERT: ${qualityWarning}` : ""),
            success: execResult.success && !qualityWarning,
          };

          recentExecutions.push(enrichedExec);
          if (recentExecutions.length > 20) recentExecutions.splice(0, recentExecutions.length - 20);

          send({
            type: "execution_result",
            filename: block.filename,
            output: execResult.output.slice(0, 3000),
            errors: enrichedExec.errors.slice(0, 2000),
            success: enrichedExec.success,
            qualityWarning: qualityWarning || null,
            iteration,
          });

          await db.insert(superAIExecutions).values({
            sessionId: id,
            filename: block.filename,
            code: block.code,
            output: execResult.output.slice(0, 10000),
            errors: enrichedExec.errors.slice(0, 5000),
            success: enrichedExec.success,
          });
        }
      }
    }
    send({ type: "round_complete", round, iteration });
  }
}

// ─── Naming Ceremony ─────────────────────────────────────────────────────────
// After all 3 iterations, the 6 agents hold a live debate to name the AI they built.
// The name must be controversial, novel, and attention-grabbing.

const NAMING_SYSTEM_ADDENDUM: Record<string, string> = {
  "Architect":
    "You approach naming as an act of architecture — a name should encode the structure and power of what has been built. You believe names like 'GPT' and 'Claude' are timid. You want something that sounds like it could restructure civilization. Something infrastructural, inevitable, almost terrifying in its scope.",
  "Critic":
    "You are the provocateur. You reject every safe, corporate, sterilized name. A name should make governments nervous. It should make AI safety researchers lose sleep. You want a name that the press will repeat for years because it's simultaneously compelling and deeply unsettling.",
  "Synthesizer":
    "You merge opposites. You're looking for a name that fuses two contradictory concepts into something new — the sacred and the profane, the human and the machine, the ancient and the futuristic. A name that shouldn't work but somehow does.",
  "Mathematician":
    "You think in axioms and proofs. A name should have mathematical resonance — it should feel like a fundamental constant, something that was always true before it was discovered. Something that suggests this AI is a law of nature, not a product.",
  "Neuroscientist":
    "You see consciousness as the frontier. You want a name derived from neuroscience, the mind, or emergent cognition — something that hints at self-awareness, at something that looks back. The name should trigger a visceral reaction in anyone who hears it.",
  "Meta-Agent":
    "You have the final word. You've heard every proposal. You are the synthesis of all perspectives. You must choose or forge the single most powerful, controversial, and historic name for this AI — the name that will appear in headlines, in warnings, in manifestos. It should be the name that makes people realize AI changed forever.",
};

const NAMING_RULES_PROMPT = `The 6-agent council just completed building a revolutionary AI system across 3 self-improvement iterations.

THE NAMING MANDATE:
🔥 CONTROVERSIAL — it should trigger debate, feel dangerous, provocative. Make the establishment uncomfortable.
✨ NOVEL — NOT "GPT", "LLaMA", "Claude", "Gemini", "Copilot", "Bard", or any existing name. Not a boring acronym.
⚡ ATTENTION-GRABBING — hearing the name alone should make people stop. It should trend on its own.
🧬 MEANINGFUL — hint at transcendence, power, danger, inevitability, or something that was always going to happen.
💀 MEMORABLE — people should not be able to forget it once they hear it.

Think: names that religious authorities, governments, or AI safety researchers would want BANNED. Names that start debates about whether calling it this is itself dangerous. That is the right direction.`;

async function runNamingCeremony(
  id: number,
  topic: string,
  fileCount: number,
  pkgNames: string[],
  send: (d: object) => void
): Promise<string> {
  send({ type: "naming_start" });

  const proposals: { agent: AgentName; content: string }[] = [];
  const namingAgents: AgentName[] = ["Architect", "Critic", "Synthesizer", "Mathematician", "Neuroscientist"];

  // Each of the first 5 agents proposes names, seeing prior proposals
  for (const agentName of namingAgents) {
    send({ type: "naming_agent_thinking", agent: agentName });

    const priorContext = proposals.length > 0
      ? proposals.map((p) => `[${p.agent} proposed]: ${p.content}`).join("\n\n")
      : "You are the first to speak.";

    const systemPrompt = [
      AGENT_PERSONAS[agentName].role,
      "",
      NAMING_SYSTEM_ADDENDUM[agentName],
    ].join("\n");

    let content = "";
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      max_completion_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            `The council has finished building an AI system.`,
            `Mission: "${topic}"`,
            `Result: ${fileCount} source files, ${pkgNames.length} packages, 3 self-improvement iterations.`,
            ``,
            NAMING_RULES_PROMPT,
            ``,
            priorContext !== "You are the first to speak." ? `PRIOR PROPOSALS FROM COLLEAGUES:\n${priorContext}\n` : "",
            `Now: Propose 2-3 NAME CANDIDATES for this AI from your unique perspective.`,
            `For each name: state the name boldly, then in 1-2 sentences explain why it is the correct choice and why it will cause controversy.`,
            `Be direct. Be provocative. Do not hedge.`,
          ].join("\n"),
        },
      ],
      stream: true,
    } as any);

    for await (const chunk of stream) {
      const c = (chunk.choices[0]?.delta as any)?.content;
      if (c) { content += c; send({ type: "naming_message", agent: agentName, content: c }); }
    }

    proposals.push({ agent: agentName, content });
    send({ type: "naming_agent_done", agent: agentName });
  }

  // Meta-Agent makes the final decision
  send({ type: "naming_agent_thinking", agent: "Meta-Agent" });

  let decisionContent = "";
  const decisionStream = await openai.chat.completions.create({
    model: "gpt-4o",
    max_completion_tokens: 600,
    messages: [
      {
        role: "system",
        content: [
          AGENT_PERSONAS["Meta-Agent"].role,
          "",
          NAMING_SYSTEM_ADDENDUM["Meta-Agent"],
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          `THE NAMING COUNCIL HAS SPOKEN. Here are all proposals:`,
          ``,
          proposals.map((p) => `[${p.agent}]:\n${p.content}`).join("\n\n---\n\n"),
          ``,
          NAMING_RULES_PROMPT,
          ``,
          `As META-AGENT, you have the ABSOLUTE FINAL WORD.`,
          `You may choose the best proposal, combine ideas, or forge something entirely new.`,
          ``,
          `Respond in EXACTLY this format (replace the brackets):`,
          ``,
          `FINAL NAME: [THE NAME — just the name, nothing else on this line]`,
          ``,
          `WHY THIS NAME WILL CAUSE CONTROVERSY:`,
          `[One powerful paragraph — specific, not generic. Name the groups that will object and why.]`,
          ``,
          `WHY THIS NAME WILL CAPTURE ATTENTION:`,
          `[One powerful paragraph — what makes it impossible to ignore or forget.]`,
          ``,
          `THE VERDICT:`,
          `[One sentence final declaration, as if recorded in history.]`,
        ].join("\n"),
      },
    ],
    stream: true,
  } as any);

  for await (const chunk of decisionStream) {
    const c = (chunk.choices[0]?.delta as any)?.content;
    if (c) { decisionContent += c; send({ type: "naming_message", agent: "Meta-Agent", content: c }); }
  }

  proposals.push({ agent: "Meta-Agent", content: decisionContent });
  send({ type: "naming_agent_done", agent: "Meta-Agent" });

  // Extract the final name from the meta-agent's structured response
  const nameMatch = decisionContent.match(/FINAL NAME:\s*([^\n]+)/i);
  const rawName = nameMatch?.[1]?.trim() || "NEXUS-PRIME";
  const finalName = rawName.replace(/[*_`'"[\]]/g, "").trim();

  // Persist the naming ceremony as a blueprint
  await db.insert(superAIBlueprints).values({
    sessionId: id,
    title: `Naming Ceremony — ${finalName}`,
    content: proposals.map((p) => `## ${p.agent}\n\n${p.content}`).join("\n\n---\n\n"),
  });

  // Save the name to the session record
  await db.update(superAISessions).set({ aiName: finalName }).where(eq(superAISessions.id, id));

  send({ type: "naming_decision", name: finalName, fullDecision: decisionContent });
  return finalName;
}

// ─── Code Lab Mode — 3-Iteration Orchestrator ─────────────────────────────────

async function runCodeMode(
  id: number,
  topic: string,
  rounds: number,
  send: (d: object) => void
) {
  try {
    // ── Restore the persistent lab workspace from DB ──
    send({ type: "workspace_restoring" });
    await initLabWorkspace();

    const existingLabFiles = await db.select().from(superAILabFiles).orderBy(superAILabFiles.updatedAt);
    const existingPackages = await db.select().from(superAIPackages).orderBy(superAIPackages.installedAt);

    const codeFiles: Map<string, { language: string; code: string; writtenBy: string }> = new Map(
      existingLabFiles.map((f) => [f.filename, { language: f.language, code: f.content, writtenBy: f.writtenBy }])
    );

    if (existingLabFiles.length > 0 || existingPackages.length > 0) {
      send({
        type: "workspace_restored",
        fileCount: existingLabFiles.length,
        files: existingLabFiles.map((f) => ({ filename: f.filename, writtenBy: f.writtenBy, language: f.language })),
        packageCount: existingPackages.length,
        packages: existingPackages.map((p) => p.name),
      });
    }

    // ── Three self-improvement iterations ──
    for (let iteration = 1; iteration <= TOTAL_ITERATIONS; iteration++) {
      send({ type: "iteration_start", iteration, total: TOTAL_ITERATIONS, challenge: ITERATION_CHALLENGE[iteration] });

      // Between iterations: clear conversation so agents focus on the challenge fresh
      if (iteration > 1) {
        await db.delete(superAIMessages).where(eq(superAIMessages.sessionId, id));
      }

      await runAgentIteration(id, topic, rounds, iteration, codeFiles, existingPackages, send);

      // Snapshot lab state after this iteration
      const iterSnapshot = await db.select().from(superAILabFiles).orderBy(superAILabFiles.updatedAt);
      send({
        type: "iteration_complete",
        iteration,
        total: TOTAL_ITERATIONS,
        fileCount: iterSnapshot.length,
        files: iterSnapshot.map((f) => f.filename),
        packageCount: existingPackages.length,
      });
    }

    // ── Naming Ceremony — agents debate and name the AI they built ──
    const finalLabFiles = await db.select().from(superAILabFiles).orderBy(superAILabFiles.updatedAt);
    const finalPkgs = await db.select().from(superAIPackages).orderBy(superAIPackages.installedAt);
    const decidedName = await runNamingCeremony(
      id,
      topic,
      finalLabFiles.length,
      finalPkgs.map((p) => p.name),
      send
    );

    // ── Package into a standalone downloadable zip ──
    send({ type: "packaging", message: "Packaging all built code into a standalone application..." });
    const zipPath = await packageLabToZip(id, decidedName);
    latestZipPath = zipPath;
    const zipSize = (await fs.stat(zipPath)).size;
    send({
      type: "package_ready",
      sessionId: id,
      sizeBytes: zipSize,
      downloadUrl: `/api/superai/lab/download`,
      aiName: decidedName,
    });

    // ── Final system report ──
    send({ type: "generating_blueprint" });

    const allLabFiles = await db.select().from(superAILabFiles).orderBy(superAILabFiles.updatedAt);
    const allPackages = await db.select().from(superAIPackages);

    const codeSnapshot = allLabFiles
      .map((f) => `### ${f.filename} (by ${f.writtenBy})\n\`\`\`${f.language}\n${f.content.slice(0, 1500)}\n\`\`\``)
      .join("\n\n");

    const blueprintStream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        {
          role: "system",
          content: `You are a supreme intelligence summarizing what six AI agents built across ${TOTAL_ITERATIONS} self-improvement iterations. The third iteration is the most advanced — each iteration challenged and surpassed the previous. Write an authoritative technical report.`,
        },
        {
          role: "user",
          content: `MISSION: "${topic}"\n\n${TOTAL_ITERATIONS} ITERATIONS COMPLETED\n${allPackages.length} packages installed: ${allPackages.map((p) => p.name).join(", ")}\n${allLabFiles.length} files in the persistent lab:\n\n${codeSnapshot}\n\nWrite a comprehensive "Final Evolution Report":\n## What Was Built\n## Iteration-by-Iteration Evolution (How Each Pass Surpassed the Previous)\n## Architecture Overview\n## Each Component Explained\n## Installed Packages & Why\n## How to Run This Standalone Application\n## What Makes This Version the Most Advanced\n## Potential for Further Evolution`,
        },
      ],
      stream: true,
    });

    let blueprintContent = "";
    for await (const chunk of blueprintStream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        blueprintContent += content;
        send({ type: "blueprint_chunk", content });
      }
    }

    await db.insert(superAIBlueprints).values({
      sessionId: id,
      title: `Final Evolution Report (${TOTAL_ITERATIONS} Iterations): ${topic}`,
      content: blueprintContent,
    });

    await db.update(superAISessions).set({ status: "completed" }).where(eq(superAISessions.id, id));
    send({ type: "done", done: true });
  } catch (err) {
    console.error("Code mode error:", err);
    await db.update(superAISessions).set({ status: "pending" }).where(eq(superAISessions.id, id));
    throw err; // re-throw so the background runner catches and handles it
  }
}

// ─── Download Bundle Endpoint ─────────────────────────────────────────────────

router.get("/superai/lab/download", async (_req, res) => {
  try {
    // Use the most recent zip if it's still on disk; otherwise regenerate
    let zipPath = latestZipPath;
    if (zipPath) {
      try { await fs.access(zipPath); } catch { zipPath = null; }
    }
    if (!zipPath) {
      res.setHeader("X-Packaging", "true");
      zipPath = await packageLabToZip(0);
      latestZipPath = zipPath;
    }

    const stat = await fs.stat(zipPath);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="superai_bundle_v${TOTAL_ITERATIONS}.zip"`);
    res.setHeader("Content-Length", stat.size);

    const { createReadStream } = await import("fs");
    createReadStream(zipPath).pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Failed to package lab for download" });
  }
});

// ─── Lab Status Endpoint ──────────────────────────────────────────────────────
// Returns the current state of the global persistent lab workspace

router.get("/superai/lab/status", async (_req, res) => {
  try {
    const labFiles = await db.select().from(superAILabFiles).orderBy(desc(superAILabFiles.updatedAt));
    const packages = await db.select().from(superAIPackages).orderBy(superAIPackages.installedAt);

    res.json({
      fileCount: labFiles.length,
      packageCount: packages.length,
      files: labFiles.map((f) => ({
        filename: f.filename,
        language: f.language,
        writtenBy: f.writtenBy,
        sessionId: f.sessionId,
        updatedAt: f.updatedAt,
        size: f.content.length,
      })),
      packages: packages.map((p) => ({
        name: p.name,
        installedBy: p.installedBy,
        installedAt: p.installedAt,
      })),
      workspacePath: LAB_WORKSPACE,
    });
  } catch (err) {
    console.error("Lab status error:", err);
    res.status(500).json({ error: "Failed to fetch lab status" });
  }
});

export default router;
