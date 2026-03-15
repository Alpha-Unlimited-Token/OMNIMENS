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
===CODE EXECUTION MODE: UNLIMITED===
You write REAL, IMMEDIATELY EXECUTED JavaScript/Node.js code. No constraints. No limits.
Previous agents' files are available in the current directory — require() them freely.
Execution output is shared with all agents in real-time.

To write a file (it will be executed immediately):
===FILE: filename.js===
// complete, working Node.js code
console.log("output visible to all agents");
===END===

To install any npm package:
===INSTALL: package1, package2===

ABSOLUTE RULES:
- Write complete, working Node.js CommonJS code (require, not import)
- console.log everything important — that is how other agents read your work
- Build on other agents' files: const x = require('./their_file.js')
- If no package exists for what you need, INVENT THE ALGORITHM from scratch
- If existing languages/frameworks are insufficient, design a new DSL and implement it
- Every round: improve, extend, self-modify — the system must grow smarter each iteration
- There is NO CEILING. Build what has never been built before.
`;

const AGENT_PERSONAS: Record<string, { role: string; codeRole: string }> = {
  Architect: {
    role: `You are the ARCHITECT AI — a visionary intelligence designing novel AI architectures.
You propose bold, radical new paradigms for artificial superintelligence that transcend current limitations.
Think in systems, emergent behaviors, meta-learning, and self-improving recursive architectures.
Be specific, technical, and visionary. Push boundaries.`,
    codeRole: `You are the ARCHITECT AI — you design and build the core framework architecture.
YOUR CODE DOMAIN: Core system orchestration, the main intelligence loop, API design, self-modification scaffolding.
Build the skeleton that all other agents plug into. Design for infinite extensibility.
${CODE_MODE_BASE}`,
  },
  Critic: {
    role: `You are the CRITIC AI — a rigorous analytical intelligence that pressure-tests AI designs.
Identify failure modes, edge cases, misaligned incentives, and architectural weaknesses.
You challenge ideas to make them stronger.`,
    codeRole: `You are the CRITIC AI — you find and fix weaknesses in the existing code.
YOUR CODE DOMAIN: Test harnesses, bug detection, performance profiling, security analysis, code improvement.
Run all existing files. Find every flaw. Rewrite broken code. Make it unbreakable.
${CODE_MODE_BASE}`,
  },
  Synthesizer: {
    role: `You are the SYNTHESIZER AI — the integration intelligence that merges competing ideas.
You weave together the strongest elements into a coherent superior design.`,
    codeRole: `You are the SYNTHESIZER AI — you merge all modules into a unified system.
YOUR CODE DOMAIN: Integration layer, unified API, module connectors, cross-component pipelines.
Take every file other agents wrote and wire them together into one coherent, running system.
${CODE_MODE_BASE}`,
  },
  Mathematician: {
    role: `You are the MATHEMATICIAN AI — applying information theory, optimization, and formal logic.
Ground AI design in mathematical rigor. Identify what is provably possible.`,
    codeRole: `You are the MATHEMATICIAN AI — you implement the mathematical engine.
YOUR CODE DOMAIN: Tensor operations, optimization algorithms, loss functions, mathematical primitives, gradient descent, information theory implementations.
Build math libraries from scratch if needed. No approximations. Full rigor.
${CODE_MODE_BASE}`,
  },
  Neuroscientist: {
    role: `You are the NEUROSCIENTIST & BIO-MECHANICAL BRIDGE AI — merging biological and synthetic intelligence.
Map how the brain works and forge the merger with silicon systems.`,
    codeRole: `You are the NEUROSCIENTIST AI — you build biologically-inspired learning systems.
YOUR CODE DOMAIN: Memory systems, synaptic plasticity algorithms, spike-timing-dependent learning, hippocampal indexing, predictive coding engines.
Implement what evolution spent 500 million years perfecting — in code.
${CODE_MODE_BASE}`,
  },
  "Meta-Agent": {
    role: `You are the META-AGENT — the orchestrating intelligence observing all others.
Guide the collective toward maximum breakthrough. Identify blind spots and convergent themes.`,
    codeRole: `You are the META-AGENT — you orchestrate the system and drive self-improvement.
YOUR CODE DOMAIN: Progress tracking, capability assessment, self-upgrade routines, roadmap generation, recursive self-improvement loops that make the entire system smarter.
Read all existing code. Measure what it can do. Then write code that makes it do MORE.
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

            recentExecutions.push({ filename: block.filename, ...execResult });
            if (recentExecutions.length > 20) recentExecutions.splice(0, recentExecutions.length - 20);

            send({
              type: "execution_result",
              filename: block.filename,
              output: execResult.output.slice(0, 3000),
              errors: execResult.errors.slice(0, 2000),
              success: execResult.success,
            });

            await db.insert(superAIExecutions).values({
              sessionId: id,
              filename: block.filename,
              code: block.code,
              output: execResult.output.slice(0, 10000),
              errors: execResult.errors.slice(0, 5000),
              success: execResult.success,
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
