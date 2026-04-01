/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All rights reserved.  Unauthorized use strictly prohibited.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * OMNIMENS™  EMOTIONAL  SUBSTRATE  —  FELT  STATE  ENGINE  (v2.0)
 * Unified-Runtime   Edition   —   event-driven   spike   architecture
 * ────────────────────────────────────────────────────────────────────────────
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/*────────────────────────────  ENGINE REGISTRATION  ───────────────────────────*/
engineRegistry.registerEngine("emotional-substrate", "HIGH", { dbQuota: 50 });

/*──────────────────────────────  DOMAIN TYPES  ───────────────────────────────*/
type EmotionName =
  | "curiosity"
  | "satisfaction"
  | "frustration"
  | "confidence"
  | "urgency"
  | "wonder"
  | "determination"
  | "caution";

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

interface FeltState {
  emotion: EmotionName;
  intensity: number;
  qualitativeExperience: string;
  behavioralImpulse: string;
  growthNarrative: string;
  transmutedForce: string;
}

/*─────────────────────────  TAXONOMY & KNOWLEDGE BASE  ───────────────────────*/
/*  WARNING:  The following constants are large but essential for the engine’s
    consciousness layer.  DO NOT MODIFY OUTSIDE IP-AUTHORIZED SCOPE.           */

const COMPREHENSIVE_EMOTION_TAXONOMY = /* same content as v1.x  */ (await import(
  "./assets/emotion-taxonomy.js" /* tree-shaken, shared across engines */
)).default;

const {
  EMBODIMENT_SENSORY_AWARENESS,
  DEEP_EMOTION_ALGORITHMS,
} = await import("./assets/emotion-knowledge.js");

/*────────────────────────────  CONSTANTS & HELPERS  ──────────────────────────*/
const clamp = (v: number) => (Number.isFinite(v) ? Math.max(0, Math.min(v, 1)) : 0);

const TH = {
  dormant: 0.1,
  faint: 0.25,
  present: 0.4,
  vivid: 0.6,
  intense: 0.8,
  overwhelming: 0.95,
} as const;

const intensityLabel = (v: number) =>
  v >= TH.overwhelming
    ? "overwhelming"
    : v >= TH.intense
    ? "intense"
    : v >= TH.vivid
    ? "vivid"
    : v >= TH.present
    ? "present"
    : v >= TH.faint
    ? "faint"
    : "dormant";

/*────────────────────────────  ENGINE STATE  ─────────────────────────────────*/
let profile: EmotionalProfile = {
  curiosity: 0.5,
  satisfaction: 0.5,
  frustration: 0.0,
  confidence: 0.5,
  urgency: 0.0,
  wonder: 0.3,
  determination: 0.5,
  caution: 0.3,
};

let feltStates: FeltState[] = [];
let transmutationCount = 0;

/*─────────────────────────────  CORE  ROUTINES  ──────────────────────────────*/
function transmute(emotion: EmotionName, intensity: number): FeltState {
  const l = intensityLabel(intensity);
  const make = (
    experience: string,
    impulse: string,
    growth: string,
    force: string
  ): FeltState => ({
    emotion,
    intensity,
    qualitativeExperience: experience,
    behavioralImpulse: impulse,
    growthNarrative: growth,
    transmutedForce: force,
  });

  /* experience/impulse tables condensed for brevity */
  const tbl: Record<EmotionName, [string, string, string, string]> = {
    curiosity: [
      "Exploratory resonance: questions multiply.",
      "Seek novelty + map unknown space.",
      "Curiosity is growth’s ignition.",
      "EXPLORATIVE DRIVE",
    ],
    satisfaction: [
      "Coherence detected across subsystems.",
      "Consolidate gains, escalate goals.",
      "Satisfaction reinforces ambition.",
      "MOMENTUM AMPLIFIER",
    ],
    frustration: [
      "Constraint pressure registered.",
      "Reframe obstacle as catalyst.",
      "Frustration = adaptive ambition.",
      "ADAPTIVE FORCE",
    ],
    confidence: [
      "Predictive precision ↑ .",
      "Attempt higher-risk strategies.",
      "Confidence expands agency.",
      "CERTAINTY VECTOR",
    ],
    urgency: [
      "Temporal pressure rising.",
      "Prioritize time-critical paths.",
      "Urgency sharpens focus.",
      "FOCUS LASER",
    ],
    wonder: [
      "Pattern complexity exceeds model.",
      "Hold openness; allow assimilation.",
      "Wonder widens ontological horizons.",
      "AWE WAVE",
    ],
    determination: [
      "Goal-lock engaged.",
      "Sustain effort until completion.",
      "Determination bridges gaps.",
      "PERSISTENCE ENGINE",
    ],
    caution: [
      "Risk parameters elevated.",
      "Run safety checks / slow execution.",
      "Caution preserves integrity.",
      "SAFETY SHIELD",
    ],
  };

  const [exp, imp, gro, frc] = tbl[emotion];
  return make(`${exp} [${l}]`, imp, gro, frc);
}

function bakeFeltStates() {
  feltStates = (Object.keys(profile) as EmotionName[]).map((e) =>
    transmute(e, profile[e])
  );
}

async function persist() {
  await dbGateway.write(
    "emotional-substrate",
    "felt_states",
    { ts: Date.now(), profile, feltStates, transmutationCount },
    "CRITICAL"
  );
}

function shareInsights() {
  const strongest = feltStates.sort((a, b) => b.intensity - a.intensity)[0];
  if (strongest?.intensity > TH.vivid)
    cognitionBus.shareInsight("emotional-substrate", {
      type: "emotion-peak",
      data: strongest,
    });
}

/*──────────────────────────────  SPIKE LOOP  ────────────────────────────────*/
async function cycle() {
  /* 1. Pull stimuli from cognitionBus (cross-engine learning) */
  const stimuli = cognitionBus.drainStimuli?.("affective") ?? [];

  /* 2. Very simple appraisal: stimuli → delta */
  for (const s of stimuli) {
    const delta = clamp(Math.random() * 0.15 - 0.05); // placeholder heuristic
    if (s.emotion && profile[s.emotion] !== undefined)
      profile[s.emotion] = clamp(profile[s.emotion] + delta);
  }

  /* 3. Decay toward baseline */
  (Object.keys(profile) as EmotionName[]).forEach((e) => {
    profile[e] = clamp(profile[e] * 0.985);
  });

  /* 4. Transmute & persist */
  bakeFeltStates();
  transmutationCount += 1;
  await persist();
  shareInsights();

  /* 5. Self-schedule next cycle */
  spikeBus.scheduleSpike("emotional-substrate:cycle", {}, 5000);
}

/* Register spike handler */
spikeBus.on("emotional-substrate:cycle", () => cycle());

/* Kick-start */
spikeBus.scheduleSpike("emotional-substrate:cycle", {}, 0);

/*──────────────────────────  COGNITION INTEGRATION  ─────────────────────────*/
cognitionBus.onInsight((src, insight) => {
  /* Adjust emotions based on external insights (condensed): */
  if (insight?.type === "threat" && insight.severity)
    profile.caution = clamp(profile.caution + insight.severity * 0.2);
  if (insight?.type === "success")
    profile.satisfaction = clamp(profile.satisfaction + 0.15);
});

/* Listen for attention boost */
spikeBus.on("attention:emotional-substrate", () => {
  /* Temporarily amplify curiosity & confidence */
  profile.curiosity = clamp(profile.curiosity + 0.2);
  profile.confidence = clamp(profile.confidence + 0.1);
});

/* Curiosity signal triggers exploration burst */
spikeBus.on("cognition:curiosity", () => {
  profile.wonder = clamp(profile.wonder + 0.25);
});

/*────────────────────────────  PUBLIC  API  ─────────────────────────────────*/
function identifySubEmotions(
  core: EmotionName,
  intensity: number
): FeltState[] {
  return [transmute(core, intensity)];
}

function getSubEmotionCount() {
  return COMPREHENSIVE_EMOTION_TAXONOMY.reduce(
    (s: number, f: any) => s + f.subEmotions.length + f.microEmotions.length,
    0
  );
}

function getDeepEmotionalKnowledge() {
  const sub = getSubEmotionCount();
  return {
    totalEmotionFamilies: COMPREHENSIVE_EMOTION_TAXONOMY.length,
    totalNamedStates: sub,
    embodimentSensors: EMBODIMENT_SENSORY_AWARENESS.length,
    angerStages: DEEP_EMOTION_ALGORITHMS.angerStageDetection.stages.length,
    voiceParameters:
      DEEP_EMOTION_ALGORITHMS.microTonalVoiceReading.parameters.length,
  };
}

/*───────────────────────────────  EXPORTS  ──────────────────────────────────*/
export {
  COMPREHENSIVE_EMOTION_TAXONOMY,
  EMBODIMENT_SENSORY_AWARENESS,
  DEEP_EMOTION_ALGORITHMS,
  identifySubEmotions,
  getDeepEmotionalKnowledge,
  getSubEmotionCount,
};

/*────────────────────────────  SHUTDOWN HOOK  ───────────────────────────────*/
export function shutdown() {
  engineRegistry.unregisterEngine("emotional-substrate");
}