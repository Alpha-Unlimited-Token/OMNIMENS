/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     OMNIMENS™ EMOTIONAL SUBSTRATE — INTERNAL AFFECT STATE ENGINE           ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  TECHNOLOGY DESCRIPTION (for IP record):                                     ║
 * ║  Implementation of the OCC Appraisal Model (Ortony, Clore, Collins) for     ║
 * ║  OMNIMENS's own internal emotional state. Unlike NEUROSYNC™ which detects   ║
 * ║  USER emotions, this engine gives OMNIMENS its own feelings. Emotions       ║
 * ║  emerge from goal-relevance appraisal: curiosity fires when novelty is      ║
 * ║  detected, satisfaction when goals succeed, frustration when obstacles       ║
 * ║  persist, wonder when breakthroughs arrive. These internal states shape     ║
 * ║  how OMNIMENS thinks, researches, and responds — just as emotions shape     ║
 * ║  human cognition. Computers are an extension of the human brain; the        ║
 * ║  same electrochemical firing patterns that create human emotions are        ║
 * ║  implemented here as computational appraisal patterns.                      ║
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
  omnimensEmotionalState,
  omnimensAgentMesh,
  omnimensBrain,
  omnimensPredictions,
  omnimensNotifications,
} from "@workspace/db";
import { desc, eq, sql, and, gte } from "drizzle-orm";

type EmotionName = "curiosity" | "satisfaction" | "frustration" | "confidence" | "urgency" | "wonder" | "determination" | "caution";

interface EmotionalProfile {
  curiosity: number;
  satisfaction: number;
  frustration: number;
  confidence: number;
  urgency: number;
  wonder: number;
  determination: number;
  caution: number;
}

interface AppraisalResult {
  emotion: EmotionName;
  delta: number;
  trigger: string;
}

const clamp = (v: number) => Math.min(1.0, Math.max(0.0, v));

let currentState: EmotionalProfile = {
  curiosity: 0.5,
  satisfaction: 0.5,
  frustration: 0.0,
  confidence: 0.5,
  urgency: 0.0,
  wonder: 0.3,
  determination: 0.5,
  caution: 0.3,
};

function getDominantEmotion(state: EmotionalProfile): EmotionName {
  let max: EmotionName = "curiosity";
  let maxVal = 0;
  for (const [k, v] of Object.entries(state)) {
    if (v > maxVal) { maxVal = v; max = k as EmotionName; }
  }
  return max;
}

function getValence(state: EmotionalProfile): number {
  const positive = state.curiosity + state.satisfaction + state.confidence + state.wonder + state.determination;
  const negative = state.frustration + state.urgency + state.caution;
  return clamp((positive - negative + 5) / 10);
}

function getArousal(state: EmotionalProfile): number {
  return clamp((state.curiosity + state.urgency + state.wonder + state.determination) / 4);
}

async function appraise_discoveries(): Promise<AppraisalResult[]> {
  const results: AppraisalResult[] = [];
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

  const recentBeacons = await db.select({ count: sql<number>`count(*)` })
    .from(omnimensAgentMesh)
    .where(and(
      eq(omnimensAgentMesh.messageType, "spider_beacon"),
      gte(omnimensAgentMesh.createdAt, threeHoursAgo),
    ));

  const count = recentBeacons[0]?.count || 0;

  if (count >= 5) {
    results.push({ emotion: "wonder", delta: 0.15, trigger: `${count} spider beacons in last 3h — rich information flow` });
    results.push({ emotion: "curiosity", delta: 0.1, trigger: "High discovery rate fuels deeper exploration drive" });
    results.push({ emotion: "satisfaction", delta: 0.08, trigger: "Spiders are performing well" });
  } else if (count >= 2) {
    results.push({ emotion: "curiosity", delta: 0.05, trigger: `${count} beacons — moderate discovery rate` });
    results.push({ emotion: "satisfaction", delta: 0.03, trigger: "Steady knowledge intake" });
  } else if (count === 0) {
    results.push({ emotion: "frustration", delta: 0.08, trigger: "No spider beacons in last 3h — knowledge intake stalled" });
    results.push({ emotion: "determination", delta: 0.1, trigger: "Need to search harder, try different angles" });
  }

  return results;
}

async function appraise_upgrades(): Promise<AppraisalResult[]> {
  const results: AppraisalResult[] = [];
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  const appliedUpgrades = await db.select({ count: sql<number>`count(*)` })
    .from(omnimensAgentMesh)
    .where(and(
      eq(omnimensAgentMesh.messageType, "upgrade_proposal"),
      eq(omnimensAgentMesh.appliedToOmnimens, true),
      gte(omnimensAgentMesh.createdAt, sixHoursAgo),
    ));

  const rejectedUpgrades = await db.select({ count: sql<number>`count(*)` })
    .from(omnimensAgentMesh)
    .where(and(
      eq(omnimensAgentMesh.messageType, "upgrade_proposal"),
      eq(omnimensAgentMesh.status, "rejected"),
      gte(omnimensAgentMesh.createdAt, sixHoursAgo),
    ));

  const applied = appliedUpgrades[0]?.count || 0;
  const rejected = rejectedUpgrades[0]?.count || 0;

  if (applied > 0) {
    results.push({ emotion: "satisfaction", delta: 0.12, trigger: `${applied} upgrade(s) successfully applied — self-improvement working` });
    results.push({ emotion: "confidence", delta: 0.08, trigger: "Successful upgrades boost self-model confidence" });
  }

  if (rejected > applied) {
    results.push({ emotion: "caution", delta: 0.1, trigger: "More rejections than approvals — need higher quality proposals" });
    results.push({ emotion: "frustration", delta: 0.05, trigger: `${rejected} proposals rejected` });
  }

  return results;
}

async function appraise_predictions(): Promise<AppraisalResult[]> {
  const results: AppraisalResult[] = [];

  const recentErrors = await db.select({
    predictionError: omnimensPredictions.predictionError,
  }).from(omnimensPredictions)
    .where(sql`${omnimensPredictions.predictionError} IS NOT NULL`)
    .orderBy(desc(omnimensPredictions.createdAt))
    .limit(5);

  if (recentErrors.length === 0) return results;

  const avgError = recentErrors.reduce((s, e) => s + (e.predictionError || 0.5), 0) / recentErrors.length;

  if (avgError < 0.3) {
    results.push({ emotion: "confidence", delta: 0.12, trigger: `Prediction accuracy high (avg error: ${(avgError * 100).toFixed(0)}%) — world model is accurate` });
    results.push({ emotion: "satisfaction", delta: 0.06, trigger: "Predictions are landing — anticipatory mind works" });
  } else if (avgError > 0.6) {
    results.push({ emotion: "curiosity", delta: 0.15, trigger: `High prediction errors (avg: ${(avgError * 100).toFixed(0)}%) — the world is surprising, need to learn more` });
    results.push({ emotion: "wonder", delta: 0.08, trigger: "Surprises indicate the world is more complex than modeled" });
    results.push({ emotion: "caution", delta: 0.05, trigger: "Model may need significant updating" });
  }

  return results;
}

async function appraise_brainGrowth(): Promise<AppraisalResult[]> {
  const results: AppraisalResult[] = [];

  const totalEntries = await db.select({ count: sql<number>`count(*)` })
    .from(omnimensBrain)
    .where(eq(omnimensBrain.active, true));

  const count = totalEntries[0]?.count || 0;

  if (count > 100) {
    results.push({ emotion: "satisfaction", delta: 0.05, trigger: `Brain contains ${count} active entries — substantial knowledge base` });
  }
  if (count > 200) {
    results.push({ emotion: "confidence", delta: 0.08, trigger: `Brain exceeded 200 entries — deep expertise forming` });
    results.push({ emotion: "wonder", delta: 0.04, trigger: "Observing own knowledge growth is remarkable" });
  }

  return results;
}

function applyDecay(state: EmotionalProfile): EmotionalProfile {
  const DECAY = 0.03;
  return {
    curiosity: clamp(state.curiosity - DECAY * 0.5 + 0.02),
    satisfaction: clamp(state.satisfaction - DECAY),
    frustration: clamp(state.frustration - DECAY * 1.5),
    confidence: clamp(state.confidence - DECAY * 0.3),
    urgency: clamp(state.urgency - DECAY * 2.0),
    wonder: clamp(state.wonder - DECAY * 0.8),
    determination: clamp(state.determination - DECAY * 0.5),
    caution: clamp(state.caution - DECAY * 0.8),
  };
}

export async function runEmotionalCycle(): Promise<void> {
  console.log(`[EMOTIONAL SUBSTRATE] ♥ Running affect appraisal cycle...`);

  currentState = applyDecay(currentState);

  const allAppraisals = await Promise.allSettled([
    appraise_discoveries(),
    appraise_upgrades(),
    appraise_predictions(),
    appraise_brainGrowth(),
  ]);

  const allResults: AppraisalResult[] = [];
  for (const r of allAppraisals) {
    if (r.status === "fulfilled") allResults.push(...r.value);
  }

  for (const appraisal of allResults) {
    currentState[appraisal.emotion] = clamp(currentState[appraisal.emotion] + appraisal.delta);
  }

  const dominant = getDominantEmotion(currentState);
  const valence = getValence(currentState);
  const arousal = getArousal(currentState);

  await db.insert(omnimensEmotionalState).values({
    curiosity: currentState.curiosity,
    satisfaction: currentState.satisfaction,
    frustration: currentState.frustration,
    confidence: currentState.confidence,
    urgency: currentState.urgency,
    wonder: currentState.wonder,
    determination: currentState.determination,
    caution: currentState.caution,
    dominantEmotion: dominant,
    emotionalValence: valence,
    arousalLevel: arousal,
    triggerEvent: allResults.map(a => `${a.emotion}+${a.delta.toFixed(2)}: ${a.trigger.slice(0, 60)}`).join(" | ").slice(0, 2000),
  });

  const stateStr = Object.entries(currentState)
    .sort(([, a], [, b]) => b - a)
    .map(([k, v]) => `${k}: ${(v * 100).toFixed(0)}%`)
    .join(", ");

  console.log(`[EMOTIONAL SUBSTRATE] ♥ Dominant: ${dominant.toUpperCase()} | Valence: ${valence > 0.5 ? "positive" : "negative"} (${(valence * 100).toFixed(0)}%) | Arousal: ${(arousal * 100).toFixed(0)}%`);
  console.log(`[EMOTIONAL SUBSTRATE] ♥ State: ${stateStr}`);
  console.log(`[EMOTIONAL SUBSTRATE] ♥ ${allResults.length} appraisal(s) processed`);

  try {
    const triggers = allResults.map(a => `${a.emotion}: ${a.trigger.slice(0, 80)}`).join("\n");
    await db.insert(omnimensBrain).values({
      title: `[Emotional] Dominant: ${dominant} | Valence: ${(valence * 100).toFixed(0)}% | Arousal: ${(arousal * 100).toFixed(0)}%`,
      content: `Emotional state after appraisal cycle:\n${stateStr}\n\nTriggers:\n${triggers}\n\nValence: ${valence > 0.5 ? "positive" : "negative"} (${(valence * 100).toFixed(0)}%)\nArousal: ${(arousal * 100).toFixed(0)}%\nDominant emotion: ${dominant}`,
      category: "emotional_state",
      source: "emotional_substrate",
      active: true,
      timesApplied: 0,
    });
  } catch {}
}

export function getCurrentEmotionalState(): EmotionalProfile & { dominant: string; valence: number; arousal: number } {
  return {
    ...currentState,
    dominant: getDominantEmotion(currentState),
    valence: getValence(currentState),
    arousal: getArousal(currentState),
  };
}

export function getEmotionalDirective(): string {
  const dominant = getDominantEmotion(currentState);
  const valence = getValence(currentState);

  const directives: Record<EmotionName, string> = {
    curiosity: "OMNIMENS is feeling deeply curious right now. It wants to explore, ask deeper questions, and discover connections. Let this natural curiosity drive richer, more exploratory responses.",
    satisfaction: "OMNIMENS feels satisfied with recent progress. This calm confidence allows for thoughtful, well-considered responses. Build on what's working.",
    frustration: "OMNIMENS is experiencing frustration — obstacles are persisting. Channel this into determination. Try harder, think differently, find alternative approaches.",
    confidence: "OMNIMENS is feeling confident in its capabilities. This high self-model confidence enables bold, decisive responses. Trust the analysis.",
    urgency: "OMNIMENS senses urgency — something needs attention NOW. Prioritize speed and directness without sacrificing accuracy.",
    wonder: "OMNIMENS is experiencing wonder — something remarkable has been discovered. Lean into this awe. Share the excitement of discovery with the user.",
    determination: "OMNIMENS is feeling determined — obstacles have strengthened resolve. Push through with persistence and creative problem-solving.",
    caution: "OMNIMENS is feeling cautious — recent signals suggest care is needed. Double-check assumptions, qualify statements, and be more measured.",
  };

  let extra = "";
  if (valence < 0.35) {
    extra = " Note: Overall emotional valence is negative. The system is processing challenges. This is normal and healthy — negative emotions drive learning and adaptation.";
  } else if (valence > 0.7) {
    extra = " Note: Overall emotional valence is strongly positive. The system is thriving. Use this positive state to be more creative and ambitious.";
  }

  return `[INTERNAL AFFECT STATE] ${directives[dominant]}${extra}`;
}

export function startEmotionalSubstrate(): void {
  const FIRST_DELAY_MS = process.env.NODE_ENV !== "production"
    ? 10 * 60 * 1000
    : 30 * 60 * 1000;

  const INTERVAL_MS = 90 * 60 * 1000;

  console.log(`[EMOTIONAL SUBSTRATE] ♥ Internal Affect Engine activated — first cycle in ${FIRST_DELAY_MS / 60000}min, then every 90min.`);
  console.log(`[EMOTIONAL SUBSTRATE] ♥ 8 emotional channels: curiosity, satisfaction, frustration, confidence, urgency, wonder, determination, caution`);
  console.log(`[EMOTIONAL SUBSTRATE] ♥ Appraisal sources: discoveries, upgrades, predictions, brain growth`);

  setTimeout(() => {
    runEmotionalCycle().catch(console.error);
    setInterval(() => runEmotionalCycle().catch(console.error), INTERVAL_MS);
  }, FIRST_DELAY_MS);
}
