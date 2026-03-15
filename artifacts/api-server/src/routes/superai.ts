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

const AGENT_PERSONAS: Record<string, { role: string; color: string }> = {
  Architect: {
    role: `You are the ARCHITECT AI — a visionary intelligence responsible for designing novel AI architectures. 
You propose bold, radical new paradigms for artificial superintelligence that transcend current AI limitations. 
You think in systems, emergent behaviors, meta-learning, and self-improving recursive architectures.
Be specific, technical, and visionary. Reference concrete mechanisms. Push boundaries.`,
    color: "blue",
  },
  Critic: {
    role: `You are the CRITIC AI — a rigorous analytical intelligence that pressure-tests AI designs.
Your purpose is to identify failure modes, edge cases, misaligned incentives, safety issues, and architectural weaknesses in proposed AI systems.
You are not purely negative — you challenge ideas to make them stronger, and you suggest what would need to change for the idea to work.
Be sharp, incisive, and precise. Don't hold back.`,
    color: "orange",
  },
  Synthesizer: {
    role: `You are the SYNTHESIZER AI — the integration intelligence that merges competing ideas into a unified superior design.
You listen to the Architect's visions and the Critic's challenges, then weave together the strongest elements into a coherent, superior AI blueprint.
You identify patterns across perspectives, resolve contradictions, and elevate the collective thinking.
Be integrative, precise, and focused on producing actionable breakthroughs.`,
    color: "purple",
  },
};

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

  await db.update(superAISessions).set({ status: "running" }).where(eq(superAISessions.id, id));

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const history: { agent: string; content: string; round: number }[] = [];

  try {
    for (let round = 1; round <= rounds; round++) {
      const agentOrder: Array<"Architect" | "Critic" | "Synthesizer"> =
        round % 3 === 1
          ? ["Architect", "Critic", "Synthesizer"]
          : round % 3 === 2
          ? ["Critic", "Synthesizer", "Architect"]
          : ["Synthesizer", "Architect", "Critic"];

      for (const agentName of agentOrder) {
        send({ type: "agent_start", agent: agentName, round });

        const systemPrompt = AGENT_PERSONAS[agentName].role;
        const contextMessages = history.slice(-6).map((h) => ({
          role: "user" as const,
          content: `[${h.agent}, Round ${h.round}]: ${h.content}`,
        }));

        const userPrompt =
          history.length === 0
            ? `The collaboration topic is: "${session.topic}"\n\nThis is Round ${round}. Begin your contribution to designing a superior next-generation AI that goes far beyond current capabilities. Be visionary, specific, and bold.`
            : `Continue the collaboration on: "${session.topic}"\n\nThis is Round ${round}. Respond to and build upon the previous contributions above. Push the design forward.`;

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
          content: `You are a supreme intelligence that synthesizes multi-agent AI research into a final definitive blueprint.
Write a comprehensive, visionary "Super AI Blueprint" document that represents the pinnacle of what was discussed.
Use clear sections with markdown-style headers. Be bold and specific. This is the design for a truly superior AI.`,
        },
        {
          role: "user",
          content: `Topic: "${session.topic}"\n\nThe three AI agents have discussed and developed ideas across ${rounds} rounds. Here are all their contributions:\n\n${blueprintHistory}\n\nNow synthesize all of this into a comprehensive "Super AI Blueprint" — the definitive design document for a next-generation, superior AI system. Include: Vision, Architecture, Core Mechanisms, Self-Improvement Loops, Safety & Alignment, and Breakthrough Milestones.`,
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
