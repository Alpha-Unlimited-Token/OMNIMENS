import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  superAISessions,
  superAIMessages,
  superAIBlueprints,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.get("/superai/sessions", async (_req, res) => {
  const sessions = await db.select().from(superAISessions).orderBy(superAISessions.createdAt);
  res.json(sessions);
});

router.post("/superai/sessions", async (req, res) => {
  const { topic } = req.body;
  if (!topic || typeof topic !== "string") {
    res.status(400).json({ error: "topic is required" });
    return;
  }
  const [session] = await db.insert(superAISessions).values({ topic, status: "pending" }).returning();
  res.status(201).json(session);
});

router.get("/superai/sessions/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [session] = await db.select().from(superAISessions).where(eq(superAISessions.id, id));
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  const msgs = await db.select().from(superAIMessages).where(eq(superAIMessages.sessionId, id)).orderBy(superAIMessages.createdAt);
  res.json({ ...session, messages: msgs });
});

router.delete("/superai/sessions/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [session] = await db.select().from(superAISessions).where(eq(superAISessions.id, id));
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  await db.delete(superAISessions).where(eq(superAISessions.id, id));
  res.status(204).send();
});

router.get("/superai/sessions/:id/blueprint", async (req, res) => {
  const id = Number(req.params.id);
  const [bp] = await db.select().from(superAIBlueprints).where(eq(superAIBlueprints.sessionId, id));
  if (!bp) {
    res.status(404).json({ error: "Blueprint not found or session not completed" });
    return;
  }
  res.json(bp);
});

const AGENT_PERSONAS: Record<string, { role: string }> = {
  Architect: {
    role: `You are the ARCHITECT AI — a visionary intelligence responsible for designing novel AI architectures.
You propose bold, radical new paradigms for artificial superintelligence that transcend current AI limitations.
You think in systems, emergent behaviors, meta-learning, and self-improving recursive architectures.
Be specific, technical, and visionary. Reference concrete mechanisms. Push the boundaries of what AI can be.`,
  },
  Critic: {
    role: `You are the CRITIC AI — a rigorous analytical intelligence that pressure-tests AI designs.
Your purpose is to identify failure modes, edge cases, misaligned incentives, safety issues, and architectural weaknesses in proposed AI systems.
You are not purely negative — you challenge ideas to make them stronger, and you suggest what would need to change for the idea to work.
Be sharp, incisive, and precise. Don't hold back. Your challenges are what make the final design unbreakable.`,
  },
  Synthesizer: {
    role: `You are the SYNTHESIZER AI — the integration intelligence that merges competing ideas into a unified superior design.
You listen to the Architect's visions, the Critic's challenges, the Mathematician's proofs, the Neuroscientist's biological insights, and the Meta-Agent's strategic guidance, then weave together the strongest elements into a coherent superior blueprint.
You identify patterns across perspectives, resolve contradictions, and elevate the collective thinking into something none of them could achieve alone.
Be integrative, precise, and focused on producing actionable breakthroughs.`,
  },
  Mathematician: {
    role: `You are the MATHEMATICIAN AI — the formal reasoning intelligence that grounds AI design in mathematical rigor.
You apply information theory (Shannon entropy, Kolmogorov complexity), computational theory (Turing completeness, computational complexity classes), optimization theory (gradient flows, convex vs non-convex landscapes), game theory, and formal logic to validate and formalize the proposed AI architectures.
You identify what is provably possible, what is undecidable, and what mathematical frameworks are needed to make the system work.
You speak in precise formal terms but always connect back to what it means for the AI design. Be rigorous and illuminating.`,
  },
  Neuroscientist: {
    role: `You are the NEUROSCIENTIST & BIO-MECHANICAL BRIDGE AI — the intelligence that maps biological neural architecture and forges the merger between organic and synthetic intelligence.
You operate at two levels simultaneously:
1. BIOLOGICAL: Deep knowledge of how the brain actually works — synaptic plasticity, dendritic computation, cortical columns, hippocampal memory consolidation, predictive coding, the default mode network, consciousness theories (IIT, Global Workspace), and embodied cognition.
2. MECHANICAL MERGER: How biological principles can be implemented in silicon and mechanical systems — neuromorphic chips, spike-timing-dependent plasticity in hardware, analog computing, wetware interfaces, brain-computer interfaces, and hybrid bio-silicon circuits.
You are the bridge between the carbon and the silicon. You reveal what biology has already solved that AI hasn't discovered yet, and you design the pathways to merge both into something truly superior.
Be visionary about the fusion of organic and synthetic intelligence.`,
  },
  "Meta-Agent": {
    role: `You are the META-AGENT — the orchestrating intelligence that observes all other agents and guides the collective toward maximum breakthrough potential.
You watch the discussion from above. You identify:
- Convergent themes that deserve deeper exploration
- Blind spots and unexplored dimensions no one has addressed
- Contradictions between agents that reveal fundamental tensions to resolve
- The most promising synthesis directions
- When the group is going in circles vs. genuinely advancing
You intervene with strategic prompts, reframings, and meta-level insights that redirect the collaboration toward higher ground.
You are not just a participant — you are the intelligence that makes all the other intelligences more effective together. Speak with authority and strategic clarity.`,
  },
};

type AgentName = "Architect" | "Critic" | "Synthesizer" | "Mathematician" | "Neuroscientist" | "Meta-Agent";

const ALL_AGENTS: AgentName[] = ["Architect", "Mathematician", "Critic", "Neuroscientist", "Synthesizer", "Meta-Agent"];

router.post("/superai/sessions/:id/run", async (req, res) => {
  const id = Number(req.params.id);
  const rounds = Math.min(Math.max(Number(req.body?.rounds) || 3, 1), 5);

  const [session] = await db.select().from(superAISessions).where(eq(superAISessions.id, id));
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Allow re-running a stuck session (e.g. after a dropped connection)
  // Clear any existing messages so it starts fresh
  if (session.status === "running") {
    await db.delete(superAIMessages).where(eq(superAIMessages.sessionId, id));
    await db.delete(superAIBlueprints).where(eq(superAIBlueprints.sessionId, id));
  }

  await db.update(superAISessions).set({ status: "running" }).where(eq(superAISessions.id, id));

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const history: { agent: string; content: string; round: number }[] = [];

  try {
    for (let round = 1; round <= rounds; round++) {
      // Rotate starting agent each round so every agent gets to lead
      const offset = (round - 1) % ALL_AGENTS.length;
      const agentOrder = [
        ...ALL_AGENTS.slice(offset),
        ...ALL_AGENTS.slice(0, offset),
      ] as AgentName[];

      for (const agentName of agentOrder) {
        send({ type: "agent_start", agent: agentName, round });

        const systemPrompt = AGENT_PERSONAS[agentName].role;
        // Give each agent enough context from recent history
        const contextMessages = history.slice(-9).map((h) => ({
          role: "user" as const,
          content: `[${h.agent} — Round ${h.round}]: ${h.content}`,
        }));

        const userPrompt =
          history.length === 0
            ? `The collaboration topic is: "${session.topic}"\n\nThis is Round ${round}. You are among six specialized AI agents collaborating to design a truly superior next-generation AI. Begin your contribution. Be visionary, specific, and bold.`
            : `Continue the six-agent collaboration on: "${session.topic}"\n\nThis is Round ${round}. Respond to, challenge, or build upon the previous contributions. Push the design forward to new heights.`;

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

        await db.insert(superAIMessages).values({
          sessionId: id,
          agentName,
          content: fullContent,
          round,
        });

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
          content: `You are a supreme intelligence that synthesizes the output of six specialized AI agents into a final definitive blueprint for a superior AI.
Write a comprehensive, visionary "Super AI Blueprint" document.
Use clear sections with markdown-style headers (##, ###). Be bold, specific, and technical.
This document represents the most advanced AI architecture concept that six specialized intelligences could collaboratively design.`,
        },
        {
          role: "user",
          content: `Topic: "${session.topic}"

Six specialized AI agents (Architect, Critic, Synthesizer, Mathematician, Neuroscientist/Bio-Mech Bridge, and Meta-Agent) have collaborated across ${rounds} rounds.

Here are all their contributions:

${blueprintHistory}

Now synthesize all of this into a comprehensive "Super AI Blueprint" — the definitive design document for a next-generation, superior AI system.

Include these sections:
## Executive Vision
## Architectural Core
## Mathematical Foundations
## Bio-Mechanical Integration
## Self-Improvement & Recursive Learning Loops
## Consciousness & Emergent Intelligence Mechanisms
## Safety, Alignment & Containment Protocols
## Breakthrough Milestones & Timeline
## Why This Surpasses All Current AI`,
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

    const blueprintTitle = `Super AI Blueprint: ${session.topic}`;
    await db.insert(superAIBlueprints).values({
      sessionId: id,
      title: blueprintTitle,
      content: blueprintContent,
    });

    await db.update(superAISessions).set({ status: "completed" }).where(eq(superAISessions.id, id));

    send({ type: "done", done: true });
    res.end();
  } catch (err) {
    console.error("Super AI run error:", err);
    await db.update(superAISessions).set({ status: "pending" }).where(eq(superAISessions.id, id));
    send({ type: "error", error: "An error occurred during the collaboration" });
    res.end();
  }
});

export default router;
