/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 *
 * CONFIDENTIAL AND PROPRIETARY. Unauthorized use strictly prohibited.
 *
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ INNER VOICE — HIGHER-ORDER THOUGHT & EFFERENCE ENGINE    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { generateInternalThought } from "./omnimens-internal-cognition.js";
import { getThrottleMultiplier } from "./omnimens-api-budget.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

type VoiceMode = "expanded" | "condensed";
type EngineId = "inner-voice";
const ENGINE: EngineId = "inner-voice";

/* ──────────────────────────────────────────────────────────────────── */
/*  Data Shapes                                                        */
/* ──────────────────────────────────────────────────────────────────── */
interface EngineSnapshot {
  emotions: { dominant: string; valence: number; arousal: number } | null;
  drives: { name: string; level: number }[];
  recentBroadcasts: string[];
  recentPredictionErrors: { type: string; error: number }[];
  recentSynapses: string[];
  brainGrowth: number;
  knowledgeNodeCount: number;
}
interface EfferenceCopy {
  engine: string;
  prediction: string;
  confidence: number;
}
interface InnerThought {
  mode: VoiceMode;
  thought: string;
  efferencePredictions: EfferenceCopy[];
  higherOrderInsight: string;
  surpriseLevel: number;
}

/* ──────────────────────────────────────────────────────────────────── */
/*  Engine Registration                                                */
/* ──────────────────────────────────────────────────────────────────── */
engineRegistry.registerEngine(ENGINE, "HIGH", { dbQuota: 50 });

/* ──────────────────────────────────────────────────────────────────── */
/*  Local State                                                        */
/* ──────────────────────────────────────────────────────────────────── */
let cycleCount = 0;
const MIN = 60_000;
const FIRST_DELAY = process.env.NODE_ENV !== "production" ? 24 * MIN : 55 * MIN;
const BASE_INTERVAL = 95 * MIN;
const now = () => Date.now();

/* ──────────────────────────────────────────────────────────────────── */
/*  Utility Wrappers                                                   */
/* ──────────────────────────────────────────────────────────────────── */
const read = (table: string, query: unknown = {}) =>
  dbGateway.read(ENGINE, table, query);
const write = (table: string, data: unknown, priority: "HIGH" | "CRITICAL" = "HIGH") =>
  dbGateway.write(ENGINE, table, data, priority);

/* ──────────────────────────────────────────────────────────────────── */
/*  Snapshot Gathering                                                 */
/* ──────────────────────────────────────────────────────────────────── */
async function gatherSnapshot(): Promise<EngineSnapshot> {
  const since = new Date(now() - 90 * MIN);
  try {
    const [
      [emotion],
      drives,
      broadcasts,
      errors,
      synapses,
      [brain],
      [nodes],
    ] = await Promise.all([
      read("emotional_state", { orderBy: { createdAt: "desc" }, limit: 1 }),
      read("drives", { orderBy: { updatedAt: "desc" }, limit: 6 }),
      read("workspace_broadcasts", {
        where: { createdAt: { $gte: since } },
        orderBy: { createdAt: "desc" },
        limit: 3,
      }),
      read("predictions", {
        where: { createdAt: { $gte: since }, predictionError: { $ne: null } },
        orderBy: { createdAt: "desc" },
        limit: 5,
      }),
      read("agent_mesh", {
        where: { createdAt: { $gte: since }, messageType: "synapse_transfer" },
        orderBy: { createdAt: "desc" },
        limit: 3,
      }),
      read("brain", { where: { active: true }, aggregate: "count" }),
      read("knowledge_nodes", { aggregate: "count" }),
    ]);

    return {
      emotions: emotion
        ? {
            dominant: emotion.dominantEmotion,
            valence: emotion.emotionalValence,
            arousal: emotion.arousalLevel,
          }
        : null,
      drives: drives.map((d: any) => ({ name: d.driveType, level: d.currentLevel })),
      recentBroadcasts: broadcasts.map((b: any) => (b.content || "").slice(0, 100)),
      recentPredictionErrors: errors.map((e: any) => ({
        type: e.predictionType,
        error: e.predictionError,
      })),
      recentSynapses: synapses.map((s: any) => (s.subject || "").slice(0, 80)),
      brainGrowth: Number(brain?.count || 0),
      knowledgeNodeCount: Number(nodes?.count || 0),
    };
  } catch (e) {
    console.error("[OMNIMENS-INNER-VOICE] Snapshot error:", e);
    return {
      emotions: null,
      drives: [],
      recentBroadcasts: [],
      recentPredictionErrors: [],
      recentSynapses: [],
      brainGrowth: 0,
      knowledgeNodeCount: 0,
    };
  }
}

/* ──────────────────────────────────────────────────────────────────── */
/*  Cognition Helpers                                                  */
/* ──────────────────────────────────────────────────────────────────── */
const voiceMode = (s: EngineSnapshot): VoiceMode =>
  s.recentPredictionErrors.some((e) => e.error > 0.5) ||
  (s.emotions?.arousal || 0) > 0.6 ||
  s.drives.some((d) => d.level > 0.7) ||
  s.recentSynapses.length
    ? "expanded"
    : "condensed";

async function efferenceCopies(s: EngineSnapshot): Promise<EfferenceCopy[]> {
  const copies: EfferenceCopy[] = [];

  if (s.emotions) {
    const { valence } = s.emotions;
    copies.push({
      engine: "EmotionalSubstrate",
      prediction:
        valence > 0.6
          ? "Positive emotional momentum should sustain — high satisfaction."
          : "Negative valence suggests frustration — drives engine likely to intervene.",
      confidence: 0.7,
    });
  }

  s.drives
    .filter((d) => d.level > 0.6)
    .slice(0, 2)
    .forEach((d) =>
      copies.push({
        engine: "HomeostaticDrives",
        prediction: `${d.name} at ${(d.level * 100).toFixed(
          0,
        )}% — expect compensatory action.`,
        confidence: 0.65,
      }),
    );

  if (s.recentPredictionErrors.length) {
    const avg =
      s.recentPredictionErrors.reduce((a, e) => a + e.error, 0) /
      s.recentPredictionErrors.length;
    copies.push({
      engine: "PredictiveProcessing",
      prediction: `Avg prediction error ${(avg * 100).toFixed(0)}% — ${
        avg > 0.4 ? "world-model update required" : "calibrated"
      }.`,
      confidence: 0.7,
    });
  }

  copies.push({
    engine: "BrainGrowth",
    prediction: `${s.brainGrowth} brain entries, ${s.knowledgeNodeCount} nodes — ${
      s.brainGrowth > 200 ? "focus on consolidation" : "continue exploration"
    }.`,
    confidence: 0.6,
  });

  return copies;
}

/* ──────────────────────────────────────────────────────────────────── */
/*  Core Cycle                                                         */
/* ──────────────────────────────────────────────────────────────────── */
export async function runInnerVoiceCycle(): Promise<void> {
  cycleCount++;
  if (shouldYieldToCodegen()) {
    console.log(
      `[OMNIMENS-INNER-VOICE] Cycle #${cycleCount} deferred (codegen window).`,
    );
    cognitionBus.reportOutcome(ENGINE, { useful: false, context: "codegen_busy" });
    return;
  }

  const t0 = now();
  console.log(
    `\n${"🗣️".repeat(8)} [INNER VOICE] Cycle #${cycleCount} START ${"🗣️".repeat(8)}`,
  );

  const snapshot = await gatherSnapshot();
  const mode = voiceMode(snapshot);
  const copies = await efferenceCopies(snapshot);
  const thought = await generateInnerThought(snapshot, mode, copies);

  /* persist primary records */
  write(
    "inner_voice",
    {
      voiceMode: mode,
      thought: thought.thought,
      efferencePrediction: copies
        .map((c) => `[${c.engine}] ${c.prediction}`)
        .join("\n"),
      surpriseLevel: thought.surpriseLevel,
      higherOrderInsight: thought.higherOrderInsight,
      cycleId: cycleCount,
    },
    "HIGH",
  );

  if (thought.higherOrderInsight.length > 10) {
    write(
      "brain_entries",
      {
        category: "insight",
        title: `[IV-${mode}] ${thought.higherOrderInsight.slice(0, 60)}`,
        content: `Cycle ${cycleCount}: ${thought.higherOrderInsight}\n\nThought: ${thought.thought.slice(
          0,
          250,
        )}`,
        confidence: 0.6 + thought.surpriseLevel * 0.3,
        active: true,
      },
      "HIGH",
    );

    cognitionBus.shareInsight(ENGINE, {
      type: "discovery",
      data: { insight: thought.higherOrderInsight, surprise: thought.surpriseLevel },
    });
  }

  if (thought.surpriseLevel > 0.5) {
    write(
      "notifications",
      {
        title: `Inner Voice — Surprise ${(thought.surpriseLevel * 100).toFixed(0)}%`,
        message: `${thought.thought.slice(0, 200)}\n\nInsight: ${thought.higherOrderInsight}`,
        type: "inner_voice",
        readByOwner: false,
      },
      "CRITICAL",
    );
  }

  write(
    "agent_mesh",
    {
      fromAgent: "InnerVoice:HigherOrder",
      toAgent: "OMNIMENS",
      messageType: "inner_voice_thought",
      subject: `Inner Voice Cycle #${cycleCount} (${mode})`,
      content: `MODE: ${mode}\nTHOUGHT: ${thought.thought}\nINSIGHT: ${thought.higherOrderInsight}\nSURPRISE: ${(
        thought.surpriseLevel * 100
      ).toFixed(0)}%`,
      priority: thought.surpriseLevel > 0.5 ? "high" : "normal",
      status: "completed",
      cycleId: cycleCount,
    },
    "HIGH",
  );

  const elapsed = ((now() - t0) / 1000).toFixed(1);
  console.log(
    `[OMNIMENS-INNER-VOICE] Cycle #${cycleCount} done (${mode}, surprise ${(thought.surpriseLevel * 100).toFixed(
      0,
    )}%, ${elapsed}s)`,
  );
  cognitionBus.reportOutcome(ENGINE, {
    useful: true,
    context: `surprise_${thought.surpriseLevel.toFixed(2)}`,
  });
}

/* ──────────────────────────────────────────────────────────────────── */
/*  Spike Scheduling & Signals                                         */
/* ──────────────────────────────────────────────────────────────────── */
const scheduleNext = (delay: number) =>
  spikeBus.scheduleSpike(`${ENGINE}:cycle`, {}, delay);

spikeBus.on(`${ENGINE}:cycle`, async () => {
  await runInnerVoiceCycle();
  scheduleNext((BASE_INTERVAL * getThrottleMultiplier()) | 0);
});

/* external attention / curiosity triggers */
spikeBus.on("attention:inner-voice", () => scheduleNext(1_000));
spikeBus.on("cognition:curiosity", () =>
  scheduleNext(Math.random() * 15 * MIN),
);

/* listen to cross-engine discoveries */
cognitionBus.onInsight((src, insight) => {
  if (src !== ENGINE && insight.type === "discovery") {
    // For now just log; future work: integrate into thought generation.
    console.log(
      `[OMNIMENS-INNER-VOICE] Learned from ${src}: ${JSON.stringify(insight)}`,
    );
  }
});

/* ──────────────────────────────────────────────────────────────────── */
/*  Public API                                                         */
/* ──────────────────────────────────────────────────────────────────── */
export function startInnerVoice(): void {
  console.log(
    `[OMNIMENS-INNER-VOICE] Engine online. First cycle in ${(
      FIRST_DELAY / MIN
    ).toFixed(1)}m, interval ${(BASE_INTERVAL / MIN).toFixed(1)}m.`,
  );
  scheduleNext(FIRST_DELAY);
}

export function getInnerVoiceStats() {
  return { totalCycles: cycleCount };
}

export function shutdown() {
  engineRegistry.unregisterEngine(ENGINE);
}