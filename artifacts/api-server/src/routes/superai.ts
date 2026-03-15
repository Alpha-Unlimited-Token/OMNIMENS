import { Router, type IRouter } from "express";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { db } from "@workspace/db";
import {
  superAISessions,
  superAIMessages,
  superAIBlueprints,
  superAICodeFiles,
  superAIExecutions,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

// ─── Session Workspace Utilities ──────────────────────────────────────────────

const WORKDIR_BASE = "/tmp/superai_lab";

async function getSessionDir(sessionId: number): Promise<string> {
  const dir = path.join(WORKDIR_BASE, String(sessionId));
  await fs.mkdir(dir, { recursive: true });
  const pkgPath = path.join(dir, "package.json");
  try {
    await fs.access(pkgPath);
  } catch {
    await fs.writeFile(
      pkgPath,
      JSON.stringify({ name: `superai-session-${sessionId}`, version: "1.0.0" }, null, 2)
    );
  }
  return dir;
}

async function executeFile(
  sessionId: number,
  filename: string,
  code: string
): Promise<{ output: string; errors: string; success: boolean }> {
  const dir = await getSessionDir(sessionId);
  const filepath = path.join(dir, filename);
  await fs.writeFile(filepath, code, "utf-8");
  return new Promise((resolve) => {
    exec(
      `node "${filepath}"`,
      { cwd: dir, timeout: 20000, maxBuffer: 1024 * 1024 },
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
  sessionId: number,
  packages: string[]
): Promise<{ output: string; success: boolean }> {
  const dir = await getSessionDir(sessionId);
  const safe = packages.map((p) => p.replace(/[^a-zA-Z0-9@/._-]/g, "")).filter(Boolean);
  if (!safe.length) return { output: "", success: true };
  return new Promise((resolve) => {
    exec(
      `npm install ${safe.join(" ")} 2>&1`,
      { cwd: dir, timeout: 90000, maxBuffer: 1024 * 1024 },
      (err, stdout) => {
        resolve({ output: stdout.trim(), success: !err });
      }
    );
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
    await db.delete(superAIMessages).where(eq(superAIMessages.sessionId, id));
    await db.delete(superAIBlueprints).where(eq(superAIBlueprints.sessionId, id));
    await db.delete(superAICodeFiles).where(eq(superAICodeFiles.sessionId, id));
    await db.delete(superAIExecutions).where(eq(superAIExecutions.sessionId, id));
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

// ─── Code Lab Mode ────────────────────────────────────────────────────────────

async function runCodeMode(
  id: number,
  topic: string,
  rounds: number,
  send: (d: object) => void,
  res: any
) {
  const history: { agent: string; content: string; round: number }[] = [];
  const codeFiles: Map<string, { language: string; code: string; writtenBy: string }> = new Map();
  const recentExecutions: { filename: string; output: string; errors: string; success: boolean }[] = [];

  try {
    for (let round = 1; round <= rounds; round++) {
      const offset = (round - 1) % ALL_AGENTS.length;
      const agentOrder = [...ALL_AGENTS.slice(offset), ...ALL_AGENTS.slice(0, offset)];

      for (const agentName of agentOrder) {
        send({ type: "agent_start", agent: agentName, round });

        const systemPrompt = AGENT_PERSONAS[agentName].codeRole;

        // Build rich context: existing code + recent execution results
        const codeContext =
          codeFiles.size > 0
            ? "\n\n=== CURRENT CODEBASE ===\n" +
              Array.from(codeFiles.entries())
                .map(([f, v]) => `--- ${f} (by ${v.writtenBy}) ---\n${v.code}`)
                .join("\n\n")
            : "";

        const execContext =
          recentExecutions.length > 0
            ? "\n\n=== RECENT EXECUTION RESULTS ===\n" +
              recentExecutions
                .slice(-6)
                .map(
                  (r) =>
                    `[${r.filename}] ${r.success ? "✓ SUCCESS" : "✗ ERROR"}\n${r.output || r.errors || "(no output)"}`
                )
                .join("\n\n")
            : "";

        const conversationContext = history
          .slice(-8)
          .map((h) => ({ role: "user" as const, content: `[${h.agent} — Round ${h.round}]: ${h.content}` }));

        const userPrompt =
          history.length === 0
            ? `MISSION: "${topic}"\n\nRound ${round}. You are the first agent to act. Begin building the foundation. Write real, executable code for your domain. There are NO LIMITS — if existing tools aren't powerful enough, build new ones.${codeContext}${execContext}`
            : `MISSION: "${topic}"\n\nRound ${round}. Continue building. Review existing code and execution results. Extend, improve, and push further. Every round the system must become more capable.${codeContext}${execContext}`;

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
            send({ type: "message", agent: agentName, content, round });
          }
        }

        await db.insert(superAIMessages).values({ sessionId: id, agentName, content: fullContent, round });
        history.push({ agent: agentName, content: fullContent, round });
        send({ type: "agent_done", agent: agentName, round });

        // ── Install packages ──
        const packagesToInstall = parseInstalls(fullContent);
        if (packagesToInstall.length > 0) {
          send({ type: "package_install", packages: packagesToInstall });
          const installResult = await installPackages(id, packagesToInstall);
          send({
            type: "install_result",
            packages: packagesToInstall,
            success: installResult.success,
            output: installResult.output.slice(0, 2000),
          });
        }

        // ── Execute code blocks ──
        const blocks = parseCodeBlocks(fullContent);
        for (const block of blocks) {
          codeFiles.set(block.filename, {
            language: block.language,
            code: block.code,
            writtenBy: agentName,
          });

          send({ type: "code_write", agent: agentName, filename: block.filename, language: block.language, code: block.code });

          if (block.filename.endsWith(".js") || block.filename.endsWith(".mjs")) {
            send({ type: "code_execute", filename: block.filename });
            const execResult = await executeFile(id, block.filename, block.code);

            // ── Quality verification: flag empty or silent output ──
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

          await db.insert(superAICodeFiles).values({
            sessionId: id,
            filename: block.filename,
            language: block.language,
            content: block.code,
            writtenBy: agentName,
            version: round,
          });
        }
      }
      send({ type: "round_complete", round });
    }

    // Final blueprint summarizes what was built
    send({ type: "generating_blueprint" });

    const codeSnapshot = Array.from(codeFiles.entries())
      .map(([f, v]) => `### ${f}\n\`\`\`${v.language}\n${v.code}\n\`\`\``)
      .join("\n\n");

    const execSummary = recentExecutions
      .map((r) => `**${r.filename}**: ${r.success ? "✓" : "✗"} ${r.output || r.errors}`)
      .join("\n");

    const blueprintStream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        {
          role: "system",
          content: `You are a supreme intelligence summarizing what six AI agents collaboratively built in a live coding session. Write a comprehensive technical report of the system they created.`,
        },
        {
          role: "user",
          content: `MISSION: "${topic}"\n\nHere is all the code the agents wrote:\n\n${codeSnapshot}\n\nExecution Results:\n${execSummary}\n\nWrite a comprehensive "System Architecture Report" covering:\n## What Was Built\n## Architecture Overview\n## Each Component Explained\n## How to Run and Extend This System\n## What Makes This Beyond Existing AI Frameworks\n## Next Steps for Further Evolution`,
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
      title: `System Architecture Report: ${topic}`,
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

export default router;
