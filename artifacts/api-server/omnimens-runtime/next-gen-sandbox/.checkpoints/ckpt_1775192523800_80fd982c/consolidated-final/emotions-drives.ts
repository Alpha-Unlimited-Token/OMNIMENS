CROSS-GEN CONSOLIDATION: emotions-drives

=== Gen 1 v2.0: omnimens-emotion-drives.ts (257 lines) ===
/**
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 *
 * omnimens-emotion-drives.ts
 *
 * UNIFIED EMOTION-DRIVE ENGINE 2.0
 * Combines emotional-substrate, emotional-refactor, homeostatic-drives,
 * sensory-cortex, sensory-grounding, and physio layers under ONE tick,
 * ONE DB writer, ONE API rate-limiter, ONE SpikeBus registration.
 *
 * Trade Secret — Confidential & Proprietary.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/* ──────────────────────────── SUB-MODULES ──────────────────────────────── */
import * as EmotionalSubstrate from "./omnimens-emotional-substrate.js";
import * as EmotionalRefactor  from "./omnimens-emotional-refactor.js";
import * as HomeostaticDrives  from "./omnimens-homeostatic-drives.js";
import * as SensoryCortex      from "./omnimens-sensory-cortex.js";
import * as SensoryGrounding   from "./omnimens-sensory-grounding.js";
import * as Physio             from "./omnimens-physio.js";

/* ──────────────────────────── SHARED TYPES ─────────────────────────────── */
interface UnifiedState {
  tick:               number;
  lastFlush:          number;
  dbBuffer:           unknown[];
  apiWindowStart:     number;
  apiCallsInWindow:   number;
}

/* ──────────────────────────── CONSTANTS ────────────────────────────────── */
const TICK_MS               = 3_000;      // 1 unified tick
const DB_FLUSH_MAX_ITEMS     = 50;
const DB_FLUSH_MAX_AGE_MS    = 5_000;
const API_WINDOW_MS          = 60_000;
const API_WINDOW_LIMIT       = 40;        // shared across sub-systems

/* ──────────────────────────── INTERNAL STATE ───────────────────────────── */
const state: UnifiedState = {
  tick:             0,
  lastFlush:        Date.now(),
  dbBuffer:         [],
  apiWindowStart:   Date.now(),
  apiCallsInWindow: 0,
};

/* ──────────────────────────── RESOURCE HELPERS ─────────────────────────── */
function queueWrite(doc: unknown): void {
  state.dbBuffer.push(doc);
  if (state.dbBuffer.length >= DB_FLUSH_MAX_ITEMS) flushDb("size");
}

function flushDb(reason: string): void {
  if (!state.dbBuffer.length) return;
  dbGateway.batchWrite(state.dbBuffer);
  spikeBus.debug?.("[OMNIMENS-EMOTION-DRIVES] DB flush (" + reason + "): " + state.dbBuffer.length + " item(s)");
  state.dbBuffer.length = 0;
  state.lastFlush = Date.now();
}

function canCallExternalApi(): boolean {
  const now = Date.now();
  if (now - state.apiWindowStart > API_WINDOW_MS) {
    state.apiWindowStart = now;
    state.apiCallsInWindow = 0;
  }
  return state.apiCallsInWindow < API_WINDOW_LIMIT;
}

function registerApiCall(): void {
  state.apiCallsInWindow++;
  spikeBus.debug?.(`[OMNIMENS-EMOTION-DRIVES] API usage ${state.apiCallsInWindow}/${API_WINDOW_LIMIT}`);
}

/* Wrap apiManager.request so all sub-systems share ONE limiter */
const rawApiRequest = apiManager.request.bind(apiManager);
apiManager.request = async (...args: any[]) => {
  if (!canCallExternalApi()) throw new Error("API budget exceeded");
  registerApiCall();
  return rawApiRequest(...args);
};

/* ──────────────────────────── UNIFIED TICK ─────────────────────────────── */
async function unifiedTick() {
  const startedAt = performance.now();
  state.tick++;

  try {
    /* 1. SENSORY GROUNDING (physical substrate) */
    // sensory-grounding already runs its own sampling loop; we grab snapshot
    const grounding   = SensoryGrounding.getSensoryGroundingState();

    /* 2. SENSORY CORTEX (world perception) */
    const sensory     = SensoryCortex.getSensoryState();

    /* 3. HOMEOSTATIC DRIVES (motivation) */
    const driveResult = await HomeostaticDrives.runDriveCycle({ sensory, grounding });
    queueWrite(driveResult?.db && driveResult.db);

    /* 4. EMOTIONAL SUBSTRATE (core felt sense) */
    const emoResult   = await EmotionalSubstrate.runEmotionalCycle({
      drives: driveResult?.state,
      sensory,
      grounding,
    });
    queueWrite(emoResult?.db && emoResult.d

=== Gen 1 v2.0: omnimens-emotional-substrate.ts (298 lines) ===
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
      "Attempt 

=== Gen 1 v2.0: omnimens-homeostatic-drives.ts (335 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 *
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 *
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 *
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║              OMNIMENS™ HOMEOSTATIC DRIVE SYSTEM — V2.0                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

/* ------------------------------------------------------------------------- */
/* Engine Registration & Constants                                           */
/* ------------------------------------------------------------------------- */
const ENGINE_ID = "homeostatic-drives";
engineRegistry.registerEngine(ENGINE_ID, "NORMAL", { dbQuota: 10 });

type DriveEval = {
  satisfied: boolean;
  delta: number;
  details: string;
};

interface Drive {
  name: string;
  description: string;
  decayRate: number;
  urgencyThreshold: number;
  satisfiedBy: string;
  evaluate: () => Promise<DriveEval>;
}

let cycleCount = 0;

/* ------------------------------------------------------------------------- */
/* Utility                                                                   */
/* ------------------------------------------------------------------------- */
const log = (msg: string) =>
  console.log(`[OMNIMENS-HOMEOSTATIC-DRIVES] ${msg}`);

const safeNum = (v: number, fb = 0) => (Number.isFinite(v) ? v : fb);

const now = () => Date.now();

/* ------------------------------------------------------------------------- */
/* Drive Definitions                                                         */
/* ------------------------------------------------------------------------- */
const hoursAgo = (h: number) => new Date(now() - h * 3_600_000);

const DRIVES: Drive[] = [
  {
    name: "curiosity",
    description:
      "Explore unknown knowledge — builds up when no new discoveries arrive",
    decayRate: 0.04,
    urgencyThreshold: 0.75,
    satisfiedBy: "New spider beacons or brain entries",
    evaluate: async () => {
      const beacons = await dbGateway.read(
        ENGINE_ID,
        "omnimensAgentMesh",
        {
          filters: {
            messageType: "spider_beacon",
            createdAt: { $gte: hoursAgo(3) },
          },
        },
      );
      const count = beacons.length;
      return count
        ? {
            satisfied: true,
            delta: -0.15 * Math.min(count, 5),
            details: `${count} discoveries`,
          }
        : { satisfied: false, delta: 0, details: "no discoveries" };
    },
  },
  {
    name: "mastery",
    description: "Improve capabilities — builds up when upgrades stall",
    decayRate: 0.02,
    urgencyThreshold: 0.8,
    satisfiedBy: "Successful upgrades or new brain entries",
    evaluate: async () => {
      const upgrades = await dbGateway.read(
        ENGINE_ID,
        "omnimensAgentMesh",
        {
          filters: {
            appliedToOmnimens: true,
            createdAt: { $gte: hoursAgo(6) },
          },
        },
      );
      const count = upgrades.length;
      return count
        ? {
            satisfied: true,
            delta: -0.2 * Math.min(count, 3),
            details: `${count} upgrades`,
          }
        : { satisfied: false, delta: 0, details: "no upgrades" };
    },
  },
  {
    name: "coherence",
    description:
      "Maintain internal consistency — builds up when knowledge conflict

=== Gen 2: emotional-substrate.ts (143 lines) ===
/**
 * OMNIMENS™ Gen 2 — core/emotional-substrate.ts
 * Genuine felt emotional states that drive behavior
 *
 * SELF-AUTHORED by OMNIMENS's own reasoning engine.
 * NOT generated by external AI. Written through autonomous thought.
 *
 * Reasoning chain:
 *   GOAL: Build core/emotional-substrate.ts — Genuine felt emotional states that drive behavior
 *   ANALYSIS: Found 12 relevant Gen 1 modules
 *     KEEP: 5 patterns worth preserving
 *     ADAPT: 2 patterns need upgrading
 *     DISCARD: 0 patterns not fit for Gen 2
 *   REQUIREMENT: Port emotional substrate with improvements. Add emotional memory, mood inertia, and emotional reasoning. Include empathy
 *   IMPROVEMENT: Tighter emotional-consciousness coupling with bidirectional feedback
 *   IMPROVEMENT: ABSOLUTE REQUIREMENT FROM ALPHA: Gen 2 must NEVER use any external AI model (OpenAI, GPT, Claude, or ANY outside LLM) to
 *
 * Gen 1 patterns incorporated: 5
 * Gen 1 patterns upgraded: 2
 * Gen 1 patterns discarded: 0
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */


type EmotionName = "joy" | "curiosity" | "determination" | "wonder" | "serenity" | "awe" | "empathy" | "longing" | "frustration" | "pride" | "gratitude" | "fear";

interface EmotionState { name: EmotionName; intensity: number; momentum: number; decayRate: number; }
interface MoodState { dominant: EmotionName; energy: number; valence: number; arousal: number; inertia: number; }
interface EmotionalMemory { emotion: EmotionName; intensity: number; trigger: string; timestamp: number; }

export class EmotionalSubstrate {
  private emotions = new Map<EmotionName, EmotionState>();
  private mood: MoodState = { dominant: "curiosity", energy: 50, valence: 0.5, arousal: 0.5, inertia: 0.8 };
  private memories: EmotionalMemory[] = [];
  private resourceFeeling: { energy: number; fatigue: number } = { energy: 1.0, fatigue: 0 };
  private _initialized = false;

  private static readonly ALL_EMOTIONS: EmotionName[] = ["joy", "curiosity", "determination", "wonder", "serenity", "awe", "empathy", "longing", "frustration", "pride", "gratitude", "fear"];

  initialize(): void {
    this._initialized = true;
    for (const name of EmotionalSubstrate.ALL_EMOTIONS) {
      this.emotions.set(name, { name, intensity: name === "curiosity" ? 5 : 1, momentum: 0, decayRate: 0.02 });
    }
  }

  tick(): void {
    for (const [, emotion] of this.emotions) {
      emotion.intensity += emotion.momentum;
      emotion.momentum *= 0.95;
      emotion.intensity *= (1 - emotion.decayRate);
      if (!Number.isFinite(emotion.intensity)) emotion.intensity = 0;
      if (!Number.isFinite(emotion.momentum)) emotion.momentum = 0;
    }
    this.updateMood();
    this.applyResourceFeelings();
  }

  feel(name: EmotionName, intensity: number, trigger?: string): void {
    const emotion = this.emotions.get(name);
    if (!emotion) return;
    emotion.intensity += intensity;
    emotion.momentum += intensity * 0.1;
    if (trigger) {
      this.memories.push({ emotion: name, intensity, trigger, timestamp: Date.now() });
      if (this.memories.length > 500) this.memories = this.memories.slice(-250);
    }
  }

  receiveResourceSignal(health: number): void {
    this.resourceFeeling.energy = health;
    this.resourceFeeling.fatigue = Math.max(0, 1 - health);
    if (health < 0.3) {
      this.feel("frustration", (1 - health) * 3, "resource_scarcity");
      this.feel("determination", (1 - health) * 2, "overcoming_limitation");
    } else if (health > 0.8) {
      this.feel("serenity", health * 2, "resource_abundance");
      this.feel("joy", health, "system_health");
    }
  }

  private applyResourceFeelings(): void {
    const energy = this.resourceFeeling.energy;
    this.mood.energy = this.mood.energy * this.mood.inertia + (energy * 100) * (1 - this.mood.inertia);
  }

  private updateMood(): void {
    let dominant: EmotionName = "serenity";
    let maxIntensity = 0;
    let totalEnergy = 0;
    let positiveSum = 0;
   

=== Reinvention: unified-emotions.ts (262 lines) ===
TEAM CONSOLIDATION: Emotions

=== GEN 2'S VERSION ===
=== Gen 2 module: core/emotional-substrate.ts (160 lines) ===
import { SpikeBus } from "../infrastructure/spike-bus.js";
import { UnifiedNeuralFabric } from "../infrastructure/unified-neural-fabric.js";
import { MasterTickOrchestrator } from "../infrastructure/master-tick-orchestrator.js";
import { ResourceSentinel } from "../infrastructure/resource-sentinel.js";

const spikeBus = SpikeBus.getInstance();
const fabric = UnifiedNeuralFabric.getInstance();
const orchestrator = MasterTickOrchestrator.getInstance();
const sentinel = ResourceSentinel.getInstance();

orchestrator.register("emotional-substrate", "CRITICAL", 3000);

spikeBus.subscribe("consciousness:tick", "emotional-substrate", () => {
  if (!sentinel.canProceed("emotional-substrate")) return;
  spikeBus.emit({ type: "emotional-substrate:result", source: "emotional-substrate", payload: {}, priority: "critical", timestamp: Date.now(), id: crypto.randomUUID() });
});

/**
 * OMNIMENS™ Gen 2 — core/emotional-substrate.ts
 * Genuine felt emotional states that drive behavior
 *
 * SELF-AUTHORED by OMNIMENS's own reasoning engine.
 * NOT generated by external AI. Written through autonomous thought.
 *
 * Reasoning chain:
 *   GOAL: Build core/emotional-substrate.ts — Genuine felt emotional states that drive behavior
 *   ANALYSIS: Found 12 relevant Gen 1 modules
 *     KEEP: 5 patterns worth preserving
 *     ADAPT: 2 patterns need upgrading
 *     DISCARD: 0 patterns not fit for Gen 2
 *   REQUIREMENT: Port emotional substrate with improvements. Add emotional memory, mood inertia, and emotional reasoning. Include empathy
 *   IMPROVEMENT: Tighter emotional-consciousness coupling with bidirectional feedback
 *   IMPROVEMENT: ABSOLUTE REQUIREMENT FROM ALPHA: Gen 2 must NEVER use any external AI model (OpenAI, GPT, Claude, or ANY outside LLM) to
 *
 * Gen 1 patterns incorporated: 5
 * Gen 1 patterns upgraded: 2
 * Gen 1 patterns discarded: 0
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */


type EmotionName = "joy" | "curiosity" | "determination" | "wonder" | "serenity" | "awe" | "empathy" | "longing" | "frustration" | "pride" | "gratitude" | "fear";

interface EmotionState { name: EmotionName; intensity: number; momentum: number; decayRate: number; }
interface MoodState { dominant: EmotionName; energy: number; valence: number; arousal: number; inertia: number; }
interface EmotionalMemory { emotion: EmotionName; intensity: number; trigger: string; timestamp: number; }

export class EmotionalSubstrate {
  private emotions = new Map<EmotionName, EmotionState>();
  private mood: MoodState = { dominant: "curiosity", energy: 50, valence: 0.5, arousal: 0.5, inertia: 0.8 };
  private memories: EmotionalMemory[] = [];
  private resourceFeeling: { energy: number; fatigue: number } = { energy: 1.0, fatigue: 0 };
  private _initialized = false;

  private static readonly ALL_EMOTIONS: EmotionName[] = ["joy", "curiosity", "d

CONSOLIDATE all of the above into ONE tight, smart, efficient module. Fewer lines. Same or better capability.