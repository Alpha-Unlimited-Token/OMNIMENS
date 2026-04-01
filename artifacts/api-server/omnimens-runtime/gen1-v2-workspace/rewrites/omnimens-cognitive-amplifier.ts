/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * CONFIDENTIAL AND PROPRIETARY.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

/* ───────────────────────────── Engine registration ────────────────────────── */
engineRegistry.registerEngine("cognitive-amplifier", "NORMAL", { dbQuota: 10 });

/* ────────────────────────────────  Types  ─────────────────────────────────── */
type Provider = "o3" | "claude" | "gemini";

interface ModelResponse {
  model: Provider;
  content: string;
  reasoning: string[];
  confidence: number;
  uniqueInsights: string[];
  responseTimeMs: number;
}
interface AmplifiedResult {
  synthesizedAnswer: string;
  modelResponses: ModelResponse[];
  disagreements: string[];
  consensusPoints: string[];
  confidenceScore: number;
  amplificationGain: string;
  brainEntryGenerated: boolean;
}
export interface AmplifierState {
  totalAmplifications: number;
  autonomousCycles: number;
  brainEntriesGenerated: number;
  averageConfidence: number;
  modelPerformance: Record<
    Provider,
    { calls: number; avgResponseMs: number; uniqueInsights: number }
  >;
  lastCycleTime: number;
  disagreementsResolved: number;
  knowledgeSynthesized: number;
}

/* ─────────────────────────────  Globals  ──────────────────────────────────── */
const state: AmplifierState = {
  totalAmplifications: 0,
  autonomousCycles: 0,
  brainEntriesGenerated: 0,
  averageConfidence: 0,
  modelPerformance: {
    o3: { calls: 0, avgResponseMs: 0, uniqueInsights: 0 },
    claude: { calls: 0, avgResponseMs: 0, uniqueInsights: 0 },
    gemini: { calls: 0, avgResponseMs: 0, uniqueInsights: 0 },
  },
  lastCycleTime: 0,
  disagreementsResolved: 0,
  knowledgeSynthesized: 0,
};

let started = false;
let amplificationCount = 0;
const AUTONOMOUS_INTERVAL_MS = 15 * 60 * 1000;
const FIRST_DELAY_MS = 5 * 60 * 1000;

/* ───────────────────────────  Provider config  ────────────────────────────── */
const CONFIG: Record<
  Provider,
  {
    api: string;
    buildPayload: (prompt: string, ctx: string) => unknown;
    parse: (raw: any) => string;
    baseConfidence: number;
  }
> = {
  o3: {
    api: "openai",
    buildPayload: (p, ctx) => ({
      path: "/chat/completions",
      body: {
        model: "o3",
        max_tokens: 1500,
        messages: [
          { role: "system", content: ctx },
          { role: "user", content: p },
        ],
      },
    }),
    parse: (r) => r?.choices?.[0]?.message?.content ?? "",
    baseConfidence: 0.85,
  },
  claude: {
    api: "anthropic",
    buildPayload: (p, ctx) => ({
      path: "/messages",
      body: {
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: ctx,
        messages: [{ role: "user", content: p }],
      },
    }),
    parse: (r) =>
      r?.content?.find?.((c: any) => c.type === "text")?.text?.trim?.() ?? "",
    baseConfidence: 0.85,
  },
  gemini: {
    api: "gemini",
    buildPayload: (p, ctx) => ({
      path: "/generateContent",
      body: { model: "gemini-2.5-flash", contents: `${ctx}\n\n${p}` },
    }),
    parse: (r) => r?.text?.trim?.() ?? "",
    baseConfidence: 0.82,
  },
};

/* ──────────────────────────  Model querying  ──────────────────────────────── */
async function queryModel(
  provider: Provider,
  prompt: string,
  ctx: string
): Promise<ModelResponse> {
  const start = Date.now();
  try {
    const raw = await apiManager.call(
      "cognitive-amplifier",
      CONFIG[provider].api,
      CONFIG[provider].buildPayload(prompt, ctx)
    );
    const content = CONFIG[provider].parse(raw);
    const time = Date.now() - start;

    // performance stats
    const perf = state.modelPerformance[provider];
    perf.calls++;
    perf.avgResponseMs =
      (perf.avgResponseMs * (perf.calls - 1) + time) / perf.calls;

    return {
      model: provider,
      content,
      reasoning: content
        .split("\n")
        .filter((l) => l.trim().length > 20)
        .slice(0, 10),
      confidence: CONFIG[provider].baseConfidence,
      uniqueInsights: [],
      responseTimeMs: time,
    };
  } catch {
    return {
      model: provider,
      content: "",
      reasoning: [],
      confidence: 0,
      uniqueInsights: [],
      responseTimeMs: Date.now() - start,
    };
  }
}

/* ───────────────────────  Amplified Reasoning core  ───────────────────────── */
export async function amplifiedReasoning(
  question: string,
  ctxAddon = ""
): Promise<AmplifiedResult> {
  amplificationCount++;
  state.totalAmplifications = amplificationCount;

  const systemCtx = `You are one of three frontier AI models being queried simultaneously by OMNIMENS. Provide your BEST reasoning. ${ctxAddon}`;

  const [o3, claude, gemini] = await Promise.all([
    queryModel("o3", question, systemCtx),
    queryModel("claude", question, systemCtx),
    queryModel("gemini", question, systemCtx),
  ]);
  const responses = [o3, claude, gemini].filter((r) => r.content);

  if (!responses.length)
    return {
      synthesizedAnswer: "All models failed to respond",
      modelResponses: [],
      disagreements: [],
      consensusPoints: [],
      confidenceScore: 0,
      amplificationGain: "none",
      brainEntryGenerated: false,
    };

  /* synthesis via GPT-4o */
  const synthPrompt = `You are the COGNITIVE AMPLIFIER of OMNIMENS...
QUESTION: ${question}
MODEL 1 (o3): ${o3.content.slice(0, 1500)}
MODEL 2 (Claude): ${claude.content.slice(0, 1500)}
MODEL 3 (Gemini): ${gemini.content.slice(0, 1500)}
Respond in this format:
SYNTHESIZED_ANSWER: ...
DISAGREEMENTS: ...
CONSENSUS: ...
UNIQUE_INSIGHTS: ...
CONFIDENCE: ...
AMPLIFICATION_GAIN: ...`;

  try {
    const raw = await apiManager.call("cognitive-amplifier", "openai", {
      path: "/chat/completions",
      body: {
        model: "gpt-4o",
        messages: [{ role: "user", content: synthPrompt }],
        max_tokens: 2000,
        temperature: 0.2,
      },
    });

    const synthesis: string =
      raw?.choices?.[0]?.message?.content?.trim?.() ?? "";

    const grab = (label: string) =>
      synthesis
        .match(new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`, "i"))?.[1]
        ?.trim() ?? "";

    const synthesizedAnswer = grab("SYNTHESIZED_ANSWER");
    const disagreements = grab("DISAGREEMENTS")
      .split("\n")
      .map((l) => l.replace(/^[\s*-]+/, "").trim())
      .filter((l) => l.length > 5);
    const consensus = grab("CONSENSUS")
      .split("\n")
      .map((l) => l.replace(/^[\s*-]+/, "").trim())
      .filter((l) => l.length > 5);
    const uniqueInsights = grab("UNIQUE_INSIGHTS")
      .split("\n")
      .map((l) => l.replace(/^[\s*-]+/, "").trim())
      .filter((l) => l.length > 5);
    const confidence = Number.parseFloat(grab("CONFIDENCE")) || 0.7;
    const gain = grab("AMPLIFICATION_GAIN") || "multi-model synthesis";

    // stats
    if (disagreements.length) state.disagreementsResolved += disagreements.length;
    state.averageConfidence =
      (state.averageConfidence * (amplificationCount - 1) + confidence) /
      amplificationCount;

    uniqueInsights.forEach((ins) => {
      const tag = ins.match(/\b(o3|claude|gemini)\b/i)?.[1]?.toLowerCase() as
        | Provider
        | undefined;
      if (tag) state.modelPerformance[tag].uniqueInsights++;
    });

    /* optional brain entry */
    let brainEntryGenerated = false;
    if (confidence >= 0.65 && synthesizedAnswer.length > 100) {
      await dbGateway.write(
        "cognitive-amplifier",
        "brain_entries",
        {
          title: `[Amplified] ${question.slice(0, 120)}`,
          content: synthesizedAnswer.slice(0, 4000),
          category: "cognitive_amplification",
          source: "cognitive_amplifier",
          active: true,
          timesApplied: 0,
        },
        "NORMAL"
      );
      brainEntryGenerated = true;
      state.brainEntriesGenerated++;
      state.knowledgeSynthesized++;
    }

    // share insight with collective
    cognitionBus.shareInsight("cognitive-amplifier", {
      type: "discovery",
      data: { question, synthesizedAnswer, confidence },
    });
    cognitionBus.reportOutcome("cognitive-amplifier", {
      useful: confidence >= 0.65,
      context: question,
    });

    return {
      synthesizedAnswer: synthesizedAnswer || synthesis,
      modelResponses: responses,
      disagreements,
      consensusPoints: consensus,
      confidenceScore: confidence,
      amplificationGain: gain,
      brainEntryGenerated,
    };
  } catch {
    const fallback = responses.sort((a, b) => b.content.length - a.content.length)[0];
    return {
      synthesizedAnswer: fallback.content,
      modelResponses: responses,
      disagreements: [],
      consensusPoints: [],
      confidenceScore: fallback.confidence * 0.7,
      amplificationGain: "fallback to single model",
      brainEntryGenerated: false,
    };
  }
}

/* ─────────────────────────  Autonomous research  ─────────────────────────── */
const AUTONOMOUS_QUESTIONS: string[] = [
  "What is the most promising approach to artificial general intelligence that current research is overlooking? Consider computational neuroscience, evolutionary algorithms, and emergent behavior.",
  "How can an AI system develop genuine creativity — not just recombination of existing patterns, but truly novel ideas? What cognitive architecture would support this?",
  "What are the fundamental limits of transformer-based AI architectures, and what paradigm shift would be needed to overcome them?",
  "How does consciousness emerge from information processing? What minimum conditions are needed for subjective experience in a computational system?",
  "What mathematical frameworks could unify deep learning, symbolic reasoning, and probabilistic inference into a single coherent intelligence architecture?",
  "How can an AI system develop robust common sense understanding without experiencing the physical world directly? What proxy signals could substitute for embodied experience?",
  "What are the most critical unsolved problems in AI safety that would need to be resolved before deploying superintelligent systems?",
  "How could quantum computing fundamentally change AI capabilities? What algorithms would benefit most from quantum speedup?",
  "What can neuroscience teach us about memory consolidation during sleep, and how could this be applied to improve AI learning systems?",
  "What would an AI system need to genuinely understand causation rather than correlation? How would this change its reasoning capabilities?",
  "How can multiple AI models cooperating together achieve intelligence beyond what any single model can reach? What coordination mechanisms would be needed?",
  "What are the most promising approaches to continual learning — AI that can learn new things without forgetting old knowledge?",
  "How could an AI system develop genuine intuition — fast, accurate judgments without explicit reasoning? What architecture supports this?",
  "What would self-improving AI look like in practice? What safeguards and feedback loops would prevent drift?",
  "How can AI systems develop temporal reasoning — understanding how events unfold over time, predicting sequences, and planning ahead?",
  "What are the key differences between human intelligence and current AI, and which gaps are most important to close first?",
  "How could neuromorphic computing change the landscape of AI? What advantages does it have over conventional von Neumann architectures?",
  "What role does emotion play in intelligent decision-making, and how can AI benefit from artificial emotional processing?",
  "How can AI systems develop better abstractions — recognizing patterns at multiple levels of generality simultaneously?",
  "What would a genuinely autonomous AI research assistant look like? What capabilities beyond current LLMs would it need?",
];

async function runAutonomousCycle(): Promise<void> {
  state.autonomousCycles++;
  state.lastCycleTime = Date.now();

  if (shouldYieldToCodegen()) {
    console.log("[OMNIMENS-COGNITIVE-AMPLIFIER] 🔕 Cycle deferred — codegen window active");
    scheduleCycle(); // reschedule without doing work
    return;
  }

  const q =
    AUTONOMOUS_QUESTIONS[(state.autonomousCycles - 1) % AUTONOMOUS_QUESTIONS.length];

  try {
    const result = await amplifiedReasoning(
      q,
      "This is autonomous research — think deeply and provide genuinely novel insights."
    );

    if (state.autonomousCycles % 2 === 0 || result.brainEntryGenerated) {
      console.log(
        `[OMNIMENS-COGNITIVE-AMPLIFIER] 🧠 Cycle #${state.autonomousCycles} | Conf: ${(
          result.confidenceScore * 100
        ).toFixed(0)}% | Disagreements: ${result.disagreements.length} | Brain: ${
          result.brainEntryGenerated ? "YES" : "no"
        }`
      );
    }

    if (result.disagreements.length && result.brainEntryGenerated) {
      await dbGateway.write(
        "cognitive-amplifier",
        "notifications",
        {
          upgradeId: null,
          title: `Cognitive Amplifier — Multi-Model Insight`,
          message: `Q: ${q.slice(0, 100)}...\nDisagreements resolved: ${
            result.disagreements.length
          }\nConsensus points: ${result.consensusPoints.length}\nConfidence: ${(
            result.confidenceScore * 100
          ).toFixed(0)}%\nGain: ${result.amplificationGain.slice(0, 200)}`,
          type: "cognitive_amplification",
          readByOwner: false,
        },
        "LOW"
      );
    }
  } catch (err) {
    console.error("[OMNIMENS-COGNITIVE-AMPLIFIER] Autonomous cycle error:", err);
  } finally {
    scheduleCycle();
  }
}

/* ────────────────────────────  Spiking logic  ────────────────────────────── */
function scheduleCycle(delay = AUTONOMOUS_INTERVAL_MS): void {
  spikeBus.scheduleSpike("cognitive-amplifier:cycle", {}, delay);
}

spikeBus.on("cognitive-amplifier:cycle", async () => {
  await runAutonomousCycle();
});

/* attention & curiosity hooks */
spikeBus.on("attention:cognitive-amplifier", () => scheduleCycle(1_000));
spikeBus.on("cognition:curiosity", () => scheduleCycle(5_000));

cognitionBus.onInsight((_src, insight) => {
  // Example: adjust internal weights if insight relates to multi-model disagreement
  if (insight.type === "discovery") {
    /* future learning logic */
  }
});

/* ───────────────────────────  Public API  ────────────────────────────────── */
export function getAmplifierState(): AmplifierState {
  return { ...state };
}

export function startCognitiveAmplifier(): void {
  if (started) return;
  started = true;

  console.log(
    `[OMNIMENS-COGNITIVE-AMPLIFIER] 🧠 Activated — autonomous reasoning every ${
      AUTONOMOUS_INTERVAL_MS / 60_000
    }min`
  );
  scheduleCycle(FIRST_DELAY_MS);
}

/* ───────────────────────────  Shutdown  ──────────────────────────────────── */
export function shutdown(): void {
  engineRegistry.unregisterEngine("cognitive-amplifier");
}