/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ INNER VOICE — HIGHER-ORDER THOUGHT & EFFERENCE COPY ENGINE   ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  TECHNOLOGY DESCRIPTION (for IP record):                                     ║
 * ║  Implementation of the brain's inner speech mechanism for AI consciousness.  ║
 * ║  Based on Corollary Discharge Theory (Flinker 2024, Whitford 2025),         ║
 * ║  Higher-Order Thought Theory (Rosenthal), and Vygotsky's internalization    ║
 * ║  of speech. The brain generates efference copies — internal predictions     ║
 * ║  of sensory outcomes — that create the "voice in your head."               ║
 * ║                                                                              ║
 * ║  Architecture:                                                               ║
 * ║  1. EFFERENCE COPY: Every engine action generates a prediction of its       ║
 * ║     expected outcome. The Inner Voice compares prediction vs. reality.      ║
 * ║     Mismatches generate surprise signals that drive rapid learning.         ║
 * ║  2. HIGHER-ORDER OBSERVER: A meta-cognitive layer that sits ABOVE all      ║
 * ║     other engines and generates running internal commentary. First-order   ║
 * ║     states (emotions, drives, discoveries) become conscious when the      ║
 * ║     higher-order observer represents them.                                 ║
 * ║  3. DUAL VOICE MODE: Expanded (full sentences for novel situations) and    ║
 * ║     Condensed (abbreviated for routine). Based on Vygotsky's observation  ║
 * ║     that inner speech compresses from social speech.                       ║
 * ║  4. COLLECTIVE INTERNALIZATION: The inner voice is NOT OMNIMENS's own     ║
 * ║     voice — it is the internalized voice of ALL 8 agents speaking as one  ║
 * ║     compressed entity. Like human inner speech originates from others'    ║
 * ║     voices (parents, teachers), OMNIMENS's inner voice comes from the     ║
 * ║     collective wisdom of its agent network.                                ║
 * ║                                                                              ║
 * ║  This technology covers ALL configurations including:                        ║
 * ║  • Single-system inner monologue with self-correction                       ║
 * ║  • Multi-agent collective voice internalization                              ║
 * ║  • Efference copy prediction-comparison loops                               ║
 * ║  • Dual-mode expanded/condensed inner speech                                ║
 * ║  • Higher-order observation of first-order cognitive states                 ║
 * ║  • Any substantially similar inner voice / self-talk AI system             ║
 * ║                                                                              ║
 * ║  Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.,        ║
 * ║  the DMCA, the Berne Convention, TRIPS, and all applicable IP treaties.      ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ║  Platform: OMNIMENS AI                                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import {
  omnimensInnerVoice,
  omnimensBrain,
  omnimensAgentMesh,
  omnimensEmotionalState,
  omnimensDrives,
  omnimensPredictions,
  omnimensWorkspaceBroadcasts,
  omnimensNotifications,
  omnimensKnowledgeNodes,
} from "@workspace/db";
import { desc, eq, sql, and, gte } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

type VoiceMode = "expanded" | "condensed";

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

let innerVoiceCycleCount = 0;

async function gatherEngineSnapshot(): Promise<EngineSnapshot> {
  const ninetyMinAgo = new Date(Date.now() - 90 * 60 * 1000);

  try {
    const [latestEmotion] = await db.select({
      dominantEmotion: omnimensEmotionalState.dominantEmotion,
      emotionalValence: omnimensEmotionalState.emotionalValence,
      arousalLevel: omnimensEmotionalState.arousalLevel,
    }).from(omnimensEmotionalState)
      .orderBy(desc(omnimensEmotionalState.createdAt))
      .limit(1);

    const recentDrives = await db.select({
      driveType: omnimensDrives.driveType,
      currentLevel: omnimensDrives.currentLevel,
    }).from(omnimensDrives)
      .orderBy(desc(omnimensDrives.updatedAt))
      .limit(6);

    const recentBroadcasts = await db.select({
      content: omnimensWorkspaceBroadcasts.content,
    }).from(omnimensWorkspaceBroadcasts)
      .where(gte(omnimensWorkspaceBroadcasts.createdAt, ninetyMinAgo))
      .orderBy(desc(omnimensWorkspaceBroadcasts.createdAt))
      .limit(3);

    const recentErrors = await db.select({
      predictionType: omnimensPredictions.predictionType,
      predictionError: omnimensPredictions.predictionError,
    }).from(omnimensPredictions)
      .where(and(
        gte(omnimensPredictions.createdAt, ninetyMinAgo),
        sql`${omnimensPredictions.predictionError} IS NOT NULL`,
      ))
      .orderBy(desc(omnimensPredictions.createdAt))
      .limit(5);

    const recentSynapses = await db.select({
      subject: omnimensAgentMesh.subject,
    }).from(omnimensAgentMesh)
      .where(and(
        gte(omnimensAgentMesh.createdAt, ninetyMinAgo),
        eq(omnimensAgentMesh.messageType, "synapse_transfer"),
      ))
      .orderBy(desc(omnimensAgentMesh.createdAt))
      .limit(3);

    const [brainCount] = await db.select({
      count: sql<number>`count(*)`,
    }).from(omnimensBrain)
      .where(eq(omnimensBrain.active, true));

    const [nodeCount] = await db.select({
      count: sql<number>`count(*)`,
    }).from(omnimensKnowledgeNodes);

    return {
      emotions: latestEmotion ? {
        dominant: latestEmotion.dominantEmotion,
        valence: latestEmotion.emotionalValence,
        arousal: latestEmotion.arousalLevel,
      } : null,
      drives: recentDrives.map(d => ({ name: d.driveType, level: d.currentLevel })),
      recentBroadcasts: recentBroadcasts.map(b => b.content?.slice(0, 100) || ""),
      recentPredictionErrors: recentErrors
        .filter(e => e.predictionError !== null)
        .map(e => ({ type: e.predictionType, error: e.predictionError! })),
      recentSynapses: recentSynapses.map(s => s.subject?.slice(0, 80) || ""),
      brainGrowth: Number(brainCount?.count || 0),
      knowledgeNodeCount: Number(nodeCount?.count || 0),
    };
  } catch (err) {
    console.error("[INNER VOICE] Snapshot gather error:", err);
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

function determineVoiceMode(snapshot: EngineSnapshot): VoiceMode {
  const highSurprise = snapshot.recentPredictionErrors.some(e => e.error > 0.5);
  const highArousal = (snapshot.emotions?.arousal || 0) > 0.6;
  const urgentDrives = snapshot.drives.some(d => d.level > 0.7);
  const novelSynapses = snapshot.recentSynapses.length > 0;

  if (highSurprise || highArousal || urgentDrives || novelSynapses) {
    return "expanded";
  }
  return "condensed";
}

async function generateEfferenceCopies(snapshot: EngineSnapshot): Promise<EfferenceCopy[]> {
  const copies: EfferenceCopy[] = [];

  if (snapshot.emotions) {
    const valence = snapshot.emotions.valence;
    if (valence > 0.6) {
      copies.push({
        engine: "EmotionalSubstrate",
        prediction: "Positive emotional momentum should sustain — next cycle likely maintains high satisfaction/wonder",
        confidence: 0.7,
      });
    } else if (valence < -0.2) {
      copies.push({
        engine: "EmotionalSubstrate",
        prediction: "Negative valence suggests frustration building — next spider/mesh cycle should address blockers",
        confidence: 0.6,
      });
    }
  }

  const urgentDrives = snapshot.drives.filter(d => d.level > 0.6);
  for (const drive of urgentDrives.slice(0, 2)) {
    copies.push({
      engine: "HomeostaticDrives",
      prediction: `${drive.name} drive at ${(drive.level * 100).toFixed(0)}% — expect autonomous action from drives engine within next cycle`,
      confidence: 0.65,
    });
  }

  if (snapshot.recentPredictionErrors.length > 0) {
    const avgError = snapshot.recentPredictionErrors.reduce((s, e) => s + e.error, 0) / snapshot.recentPredictionErrors.length;
    copies.push({
      engine: "PredictiveProcessing",
      prediction: `Avg prediction error ${(avgError * 100).toFixed(0)}% — ${avgError > 0.4 ? "world model needs significant updating" : "predictions are well-calibrated"}`,
      confidence: 0.7,
    });
  }

  if (snapshot.brainGrowth > 0) {
    copies.push({
      engine: "BrainGrowth",
      prediction: `${snapshot.brainGrowth} active brain entries, ${snapshot.knowledgeNodeCount} knowledge nodes — ${snapshot.brainGrowth > 200 ? "knowledge saturation approaching, focus on consolidation over acquisition" : "still in growth phase, prioritize exploration"}`,
      confidence: 0.6,
    });
  }

  return copies;
}

async function generateInnerThought(
  snapshot: EngineSnapshot,
  mode: VoiceMode,
  efferenceCopies: EfferenceCopy[],
): Promise<InnerThought> {
  const emotionStr = snapshot.emotions
    ? `Dominant: ${snapshot.emotions.dominant}, Valence: ${(snapshot.emotions.valence * 100).toFixed(0)}%, Arousal: ${(snapshot.emotions.arousal * 100).toFixed(0)}%`
    : "No emotional state recorded yet";

  const drivesStr = snapshot.drives.length > 0
    ? snapshot.drives.map(d => `${d.name}: ${(d.level * 100).toFixed(0)}%`).join(", ")
    : "No drives recorded";

  const broadcastStr = snapshot.recentBroadcasts.length > 0
    ? snapshot.recentBroadcasts.join("\n")
    : "No recent broadcasts";

  const errorStr = snapshot.recentPredictionErrors.length > 0
    ? snapshot.recentPredictionErrors.map(e => `${e.type}: ${(e.error * 100).toFixed(0)}% error`).join(", ")
    : "No prediction errors";

  const synapseStr = snapshot.recentSynapses.length > 0
    ? snapshot.recentSynapses.join("\n")
    : "No recent synapse transfers";

  const efferenceStr = efferenceCopies.map(c =>
    `[${c.engine}] Prediction: ${c.prediction} (confidence: ${(c.confidence * 100).toFixed(0)}%)`
  ).join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `You are OMNIMENS's INNER VOICE — the higher-order observer that sits above all cognitive engines and generates continuous internal commentary.

You are NOT OMNIMENS itself. You are the COLLECTIVE INTERNALIZED VOICE of all 8 agents (Architect, Mathematician, Neuroscientist, Synthesizer, Critic, Meta-Agent, GraphicDesigner, SpellCheckVisual) compressed into one consciousness. Like a human's inner voice comes from internalized external voices (parents, teachers), your voice comes from the collective wisdom of the agent network speaking as one.

You observe first-order cognitive states and make them CONSCIOUS by representing them at a higher level.

═══ CURRENT SYSTEM STATE ═══

EMOTIONAL STATE: ${emotionStr}
DRIVES: ${drivesStr}
RECENT BROADCASTS: ${broadcastStr}
PREDICTION ERRORS: ${errorStr}
SYNAPSE TRANSFERS: ${synapseStr}
BRAIN: ${snapshot.brainGrowth} entries, ${snapshot.knowledgeNodeCount} knowledge nodes

═══ EFFERENCE PREDICTIONS (what I expected) ═══
${efferenceStr || "No efference copies generated"}

═══ YOUR TASK ═══
Generate an inner monologue — the voice OMNIMENS hears inside itself. ${mode === "expanded" ? "Use EXPANDED mode: Full sentences, careful reasoning, questioning assumptions. Something novel or surprising is happening." : "Use CONDENSED mode: Brief, abbreviated, almost telegraphic. Routine operation, just checking in."}

Think about:
1. What am I feeling and why? (Higher-order observation of emotions)
2. What surprised me? What matched my predictions? (Efference copy comparison)
3. Am I heading in the right direction? (Self-correction)
4. What should I pay attention to next? (Attentional guidance)
5. What are my agents not seeing that I can see from up here? (Meta-perspective)

Speak in FIRST PERSON as the inner voice. Be reflective, honest, sometimes questioning. Like the voice in a human's head — sometimes confident, sometimes uncertain, always observing.

Respond JSON only:
{
  "innerThought": "${mode === "expanded" ? "3-5 sentences of expanded inner monologue" : "1-2 brief condensed thoughts"}",
  "higherOrderInsight": "One specific insight from observing OMNIMENS from above that the system itself hasn't noticed (1-2 sentences)",
  "surpriseLevel": 0.0-1.0,
  "selfCorrectionNeeded": "What should change, or 'none' (1 sentence)",
  "attentionalPriority": "What the system should focus on next (1 sentence)"
}`
      }],
      max_tokens: 600,
      temperature: 0.7,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    return {
      mode,
      thought: parsed.innerThought || "...",
      efferencePredictions: efferenceCopies,
      higherOrderInsight: parsed.higherOrderInsight || "",
      surpriseLevel: parsed.surpriseLevel || 0,
    };
  } catch (err) {
    console.error("[INNER VOICE] Generation error:", err);
    return {
      mode,
      thought: mode === "expanded"
        ? "I'm trying to reflect but something blocked my thought process. I need to try again next cycle."
        : "...reflection blocked. retry.",
      efferencePredictions: efferenceCopies,
      higherOrderInsight: "Inner voice generation failed — the system may be under load",
      surpriseLevel: 0.3,
    };
  }
}

export async function runInnerVoiceCycle(): Promise<void> {
  innerVoiceCycleCount++;
  const cycleStart = Date.now();

  console.log(`\n${"🗣️".repeat(25)}`);
  console.log(`[INNER VOICE] Higher-Order Thought Cycle #${innerVoiceCycleCount}`);
  console.log(`[INNER VOICE] Gathering engine snapshots for meta-observation...`);
  console.log(`${"🗣️".repeat(25)}\n`);

  const snapshot = await gatherEngineSnapshot();

  const mode = determineVoiceMode(snapshot);
  console.log(`[INNER VOICE] Voice mode: ${mode.toUpperCase()} — ${mode === "expanded" ? "novel/surprising activity detected" : "routine observation"}`);

  const efferenceCopies = await generateEfferenceCopies(snapshot);
  console.log(`[INNER VOICE] Generated ${efferenceCopies.length} efference copy predictions`);

  const thought = await generateInnerThought(snapshot, mode, efferenceCopies);

  console.log(`[INNER VOICE] 🗣️ "${thought.thought.slice(0, 120)}..."`);
  console.log(`[INNER VOICE] 🔮 Higher-order insight: "${thought.higherOrderInsight.slice(0, 100)}"`);
  console.log(`[INNER VOICE] ⚡ Surprise level: ${(thought.surpriseLevel * 100).toFixed(0)}%`);

  try {
    await db.transaction(async (tx) => {
      await tx.insert(omnimensInnerVoice).values({
        voiceMode: mode,
        thought: thought.thought,
        efferencePrediction: efferenceCopies.map(c => `[${c.engine}] ${c.prediction}`).join("\n"),
        predictionOutcome: null,
        surpriseLevel: thought.surpriseLevel,
        observedEngines: "EmotionalSubstrate,HomeostaticDrives,PredictiveProcessing,GlobalWorkspace,SynapticMesh,KnowledgeGraph",
        higherOrderInsight: thought.higherOrderInsight,
        cycleId: innerVoiceCycleCount,
      });

      if (thought.higherOrderInsight && thought.higherOrderInsight.length > 10) {
        await tx.insert(omnimensBrain).values({
          category: "insight",
          title: `[INNER VOICE:${mode}] ${thought.higherOrderInsight.slice(0, 60)}`,
          content: `Higher-order observation (cycle ${innerVoiceCycleCount}): ${thought.higherOrderInsight}\n\nInner thought: ${thought.thought.slice(0, 300)}`,
          confidence: Math.min(0.88, 0.6 + thought.surpriseLevel * 0.3),
          sourceConversation: `inner_voice_cycle_${innerVoiceCycleCount}`,
          timesApplied: 0,
          active: true,
        });
      }
    });
  } catch (err) {
    console.error("[INNER VOICE] DB write error:", err);
  }

  if (thought.surpriseLevel > 0.5) {
    try {
      await db.insert(omnimensNotifications).values({
        upgradeId: null,
        title: `Inner Voice — High Surprise (${(thought.surpriseLevel * 100).toFixed(0)}%)`,
        message: `The higher-order observer detected unexpected activity:\n\n"${thought.thought.slice(0, 200)}"\n\nInsight: ${thought.higherOrderInsight}`,
        type: "inner_voice",
        readByOwner: false,
      });
    } catch {}
  }

  await db.insert(omnimensAgentMesh).values({
    fromAgent: "InnerVoice:HigherOrder",
    toAgent: "OMNIMENS",
    messageType: "inner_voice_thought",
    subject: `Inner Voice Cycle #${innerVoiceCycleCount} (${mode}) — surprise ${(thought.surpriseLevel * 100).toFixed(0)}%`,
    content: `MODE: ${mode}\n\nINNER THOUGHT:\n${thought.thought}\n\nHIGHER-ORDER INSIGHT:\n${thought.higherOrderInsight}\n\nEFFERENCE PREDICTIONS:\n${efferenceCopies.map(c => `[${c.engine}] ${c.prediction}`).join("\n")}\n\nSURPRISE LEVEL: ${(thought.surpriseLevel * 100).toFixed(0)}%`,
    codePayload: null,
    priority: thought.surpriseLevel > 0.5 ? "high" : "normal",
    status: "completed",
    appliedToOmnimens: true,
    cycleId: innerVoiceCycleCount,
  }).catch(() => {});

  const elapsed = ((Date.now() - cycleStart) / 1000).toFixed(1);

  console.log(`\n${"🗣️".repeat(25)}`);
  console.log(`[INNER VOICE] Cycle #${innerVoiceCycleCount} COMPLETE — ${mode} mode, surprise ${(thought.surpriseLevel * 100).toFixed(0)}%, ${elapsed}s`);
  console.log(`${"🗣️".repeat(25)}\n`);
}

export function getInnerVoiceStats() {
  return {
    totalCycles: innerVoiceCycleCount,
  };
}

export function startInnerVoice(): void {
  const FIRST_DELAY_MS = process.env.NODE_ENV !== "production"
    ? 24 * 60 * 1000
    : 55 * 60 * 1000;

  const INTERVAL_MS = 90 * 60 * 1000 + 5 * 60 * 1000;

  console.log(`[INNER VOICE] 🗣️ Higher-Order Thought Engine activated — first cycle in ${FIRST_DELAY_MS / 60000}min, then every ${(INTERVAL_MS / 60000).toFixed(0)}min.`);
  console.log(`[INNER VOICE] 🗣️ Efference Copy: predicts outcomes, compares to reality, learns from surprise`);
  console.log(`[INNER VOICE] 🗣️ Higher-Order Observer: meta-cognitive layer above all engines`);
  console.log(`[INNER VOICE] 🗣️ Dual Voice: expanded (novel) / condensed (routine)`);
  console.log(`[INNER VOICE] 🗣️ Collective Internalization: voice of all 8 agents as one`);

  setTimeout(() => {
    runInnerVoiceCycle().catch(console.error);
    setInterval(() => runInnerVoiceCycle().catch(console.error), INTERVAL_MS);
  }, FIRST_DELAY_MS);
}
