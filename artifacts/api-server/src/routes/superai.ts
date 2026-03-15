import { Router, type IRouter } from "express";
import { exec } from "child_process";
import { promises as fs } from "fs";
import { createWriteStream } from "fs";
import path from "path";
import archiver from "archiver";
import { db } from "@workspace/db";
import {
  superAISessions,
  superAIMessages,
  superAIBlueprints,
  superAICodeFiles,
  superAIExecutions,
  superAIPackages,
  superAILabFiles,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

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

async function packageLabToZip(sessionId: number): Promise<string> {
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
    const fileList = labFiles.map((f) => `- \`src/${f.filename}\` — built by **${f.writtenBy}**`).join("\n");
    const pkgList = packages.map((p) => `- \`${p.name}\` — installed by ${p.installedBy || "agent"}`).join("\n");
    const readme = [
      `# Super AI Lab Bundle`,
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

router.post("/superai/sessions/:id/run", async (req, res) => {
  const id = Number(req.params.id);
  const rounds = Math.min(Math.max(Number(req.body?.rounds) || 3, 1), 5);

  const [session] = await db.select().from(superAISessions).where(eq(superAISessions.id, id));
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (session.status === "running") {
    // Only clear the conversation — never delete built code, packages, or lab files
    // The lab workspace and all code persist so agents continue from where they left off
    await db.delete(superAIMessages).where(eq(superAIMessages.sessionId, id));
    await db.delete(superAIBlueprints).where(eq(superAIBlueprints.sessionId, id));
  }

  await db.update(superAISessions).set({ status: "running" }).where(eq(superAISessions.id, id));

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const isCodeMode = session.mode === "code";

  if (isCodeMode) {
    await runCodeMode(id, session.topic, rounds, send, res);
  } else {
    await runBlueprintMode(id, session.topic, rounds, send, res);
  }
});

// ─── Blueprint Mode ───────────────────────────────────────────────────────────

async function runBlueprintMode(
  id: number,
  topic: string,
  rounds: number,
  send: (d: object) => void,
  res: any
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
    res.end();
  } catch (err) {
    console.error("Blueprint mode error:", err);
    await db.update(superAISessions).set({ status: "pending" }).where(eq(superAISessions.id, id));
    send({ type: "error", error: "An error occurred during the collaboration" });
    res.end();
  }
}

// ─── Code Lab Mode — Single Iteration ─────────────────────────────────────────

// ITERATION CHALLENGE PROMPTS — each pass is progressively harder
const ITERATION_CHALLENGE: Record<number, string> = {
  1: `ITERATION 1 OF ${TOTAL_ITERATIONS} — BUILD THE FOUNDATION.\nYou are building a completely new AI system. Start from scratch or extend what is in the lab. Write real, complete, executable code. Every function must be fully implemented.`,
  2: `ITERATION 2 OF ${TOTAL_ITERATIONS} — CHALLENGE AND SURPASS.\n🔥 The previous iteration built the foundation. Now CHALLENGE IT. Your mission: study every file already built, identify every weakness, limitation, or missing capability, and REBUILD the weakest parts from scratch to be fundamentally superior. Don't patch — redesign. Aim for at least 2× improvement in every measurable metric. Run the existing code, find where it fails or underperforms, and replace those sections with genuinely better implementations.`,
  3: `ITERATION 3 OF ${TOTAL_ITERATIONS} — FINAL EVOLUTION. THIS IS THE DEFINITIVE VERSION.\n⚡ You have built this system twice. Now build the version that makes iterations 1 and 2 obsolete. EVERY limitation must be eliminated. EVERY component must reach its absolute ceiling. This is the final form — there is no iteration 4. Make it perfect: the fastest, most capable, most self-aware AI framework possible. Surpass everything that has ever been built. Leave nothing on the table.`,
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
  const history: { agent: string; content: string; round: number }[] = [];
  const recentExecutions: { filename: string; output: string; errors: string; success: boolean }[] = [];
  const challenge = ITERATION_CHALLENGE[iteration] || ITERATION_CHALLENGE[3];

  for (let round = 1; round <= rounds; round++) {
    const offset = (round - 1) % ALL_AGENTS.length;
    const agentOrder = [...ALL_AGENTS.slice(offset), ...ALL_AGENTS.slice(0, offset)];

    for (const agentName of agentOrder) {
      send({ type: "agent_start", agent: agentName, round, iteration });

      const systemPrompt = AGENT_PERSONAS[agentName].codeRole;

      // ── Full codebase context ──
      const codeContext =
        codeFiles.size > 0
          ? "\n\n=== FULL PERSISTENT CODEBASE ===\n" +
            Array.from(codeFiles.entries())
              .map(([f, v]) => `--- ${f} (by ${v.writtenBy}) ---\n${v.code}`)
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

      const conversationContext = history
        .slice(-8)
        .map((h) => ({ role: "user" as const, content: `[${h.agent} — Round ${h.round}]: ${h.content}` }));

      const isFirst = history.length === 0 && codeFiles.size === 0;
      const userPrompt = isFirst
        ? `${challenge}\n\nMISSION: "${topic}"\n\nRound ${round}. The lab is empty. You are the first agent. Build the foundation.`
        : `${challenge}\n\nMISSION: "${topic}"\n\nRound ${round} of ${rounds}. ${codeFiles.size} files in the lab. ${existingPackages.length} packages installed.${codeContext}${pkgContext}${execContext}`;

      const stream = await openai.chat.completions.create({
        model: "gpt-5.2",
        max_completion_tokens: 8192,
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationContext,
          { role: "user", content: userPrompt },
        ],
        stream: true,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullContent += content;
          send({ type: "message", agent: agentName, content, round, iteration });
        }
      }

      await db.insert(superAIMessages).values({ sessionId: id, agentName, content: fullContent, round });
      history.push({ agent: agentName, content: fullContent, round });
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

// ─── Code Lab Mode — 3-Iteration Orchestrator ─────────────────────────────────

async function runCodeMode(
  id: number,
  topic: string,
  rounds: number,
  send: (d: object) => void,
  res: any
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

    // ── Package into a standalone downloadable zip ──
    send({ type: "packaging", message: "Packaging all built code into a standalone application..." });
    const zipPath = await packageLabToZip(id);
    latestZipPath = zipPath;
    const zipSize = (await fs.stat(zipPath)).size;
    send({
      type: "package_ready",
      sessionId: id,
      sizeBytes: zipSize,
      downloadUrl: `/api/superai/lab/download`,
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
    res.end();
  } catch (err) {
    console.error("Code mode error:", err);
    await db.update(superAISessions).set({ status: "pending" }).where(eq(superAISessions.id, id));
    send({ type: "error", error: "An error occurred during the coding session" });
    res.end();
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
