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
    queueWrite(emoResult?.db && emoResult.db);

    /* 5. EMOTIONAL REFACTOR (coherence & reflection) */
    EmotionalRefactor.startEmotionalRefactor?.(); // ensured init once
    const eRefState  = EmotionalRefactor.getEmotionalRefactorState();

    /* 6. PHYSIOLOGICAL LAYER (health / embodiment) */
    // Pull any queued physio writes (if any) and queue them for batch flush
    const physioBuf  = Physio.loadPhysioContext?.().pendingWrites ?? [];
    if (physioBuf.length) state.dbBuffer.push(...physioBuf);

    /* 7. SPIKE EMISSION */
    spikeBus.emit("emotion-drives:tick", {
      tick:          state.tick,
      emotions:      EmotionalSubstrate.getCurrentEmotionalState(),
      drives:        driveResult?.state,
      sensory,
      grounding,
      coherence:     eRefState?.emotionalCoherence,
    });

    /* 8. DB flush policy (time- or size-based) */
    if (Date.now() - state.lastFlush > DB_FLUSH_MAX_AGE_MS) {
      flushDb("timer");
    }

    /* 9. Resource self-monitoring */
    const spikeFreq = (state.tick * 1_000) / (Date.now() - startTime);
    if (spikeFreq > 500) {
      spikeBus.warn?.("[OMNIMENS-EMOTION-DRIVES] High spike frequency: " + spikeFreq.toFixed(1) + "/s");
    }

  } catch (err) {
    spikeBus.error?.("[OMNIMENS-EMOTION-DRIVES] tick error: " + (err as Error).message);
  } finally {
    const elapsed = performance.now() - startedAt;
    spikeBus.debug?.(`[OMNIMENS-EMOTION-DRIVES] Tick ${state.tick} complete (${elapsed.toFixed(1)}ms)`);
  }
}

/* ──────────────────────────── ENGINE LIFECYCLE ─────────────────────────── */
let interval: ReturnType<typeof setInterval> | null = null;
let startTime = 0;

function startEmotionDrivesEngine(): void {
  if (interval) return;              // already running
  startTime = Date.now();

  // Ensure sub-systems are initialized (their internal loops suppressed if any)
  SensoryGrounding.startSensoryGrounding();
  SensoryCortex.startSensoryCortex();
  HomeostaticDrives.startHomeostaticDrives();
  EmotionalSubstrate.startEmotionalSubstrate();

  interval = setInterval(unifiedTick, TICK_MS);
  spikeBus.registerEngine?.("emotion-drives");
  spikeBus.info?.("[OMNIMENS-EMOTION-DRIVES] Engine started with unified tick " + TICK_MS + "ms");
}

function stopEmotionDrivesEngine(): void {
  if (interval) clearInterval(interval);
  interval = null;
  spikeBus.info?.("[OMNIMENS-EMOTION-DRIVES] Engine stopped");
}

function getUnifiedState() {
  return {
    tick:           state.tick,
    emotions:       EmotionalSubstrate.getCurrentEmotionalState?.(),
    drives:         HomeostaticDrives.getDriveDirective?.(),
    sensory:        SensoryCortex.getSensoryState?.(),
    grounding:      SensoryGrounding.getSensoryGroundingState?.(),
    physioContext:  Physio.loadPhysioContext?.(),
  };
}

/* ──────────────────────────── EXPORTS (PASS-THROUGH) ───────────────────── */

// Emotional Substrate
export const runEmotionalCycle        = EmotionalSubstrate.runEmotionalCycle;
export const getCurrentEmotionalState = EmotionalSubstrate.getCurrentEmotionalState;
export const getFeltStates            = EmotionalSubstrate.getFeltStates;
export const getEmotionalMaturation   = EmotionalSubstrate.getEmotionalMaturation;
export const getEmotionalDirective    = EmotionalSubstrate.getEmotionalDirective;
export const startEmotionalSubstrate  = EmotionalSubstrate.startEmotionalSubstrate;

// Emotional Refactor
export const startEmotionalRefactor       = EmotionalRefactor.startEmotionalRefactor;
export const getEmotionalRefactorState    = EmotionalRefactor.getEmotionalRefactorState;

// Homeostatic Drives
export const runDriveCycle            = HomeostaticDrives.runDriveCycle;
export const getDriveDirective        = HomeostaticDrives.getDriveDirective;
export const startHomeostaticDrives   = HomeostaticDrives.startHomeostaticDrives;

// Sensory Cortex
export const getSensoryState              = SensoryCortex.getSensoryState;
export const getRecentSignals             = SensoryCortex.getRecentSignals;
export const getAnomalies                 = SensoryCortex.getAnomalies;
export const getTrendHistory              = SensoryCortex.getTrendHistory;
export const getCrossChannelCorrelations  = SensoryCortex.getCrossChannelCorrelations;
export const getAttentionFocus            = SensoryCortex.getAttentionFocus;
export const startSensoryCortex           = SensoryCortex.startSensoryCortex;

// Sensory Grounding
export const getSensoryGroundingState = SensoryGrounding.getSensoryGroundingState;
export const getSensoryDescription    = SensoryGrounding.getSensoryDescription;
export const getCurrentResistance     = SensoryGrounding.getCurrentResistance;
export const startSensoryGrounding    = SensoryGrounding.startSensoryGrounding;

// Physio
export type  ExercisePrescription      = Physio.ExercisePrescription;
export type  RedFlagScreen             = Physio.RedFlagScreen;
export type  PsychosocialProfile       = Physio.PsychosocialProfile;
export type  OutcomeMeasure            = Physio.OutcomeMeasure;

export const screenRedFlags              = Physio.screenRedFlags;
export const interpretPsychosocialScores = Physio.interpretPsychosocialScores;
export const OUTCOME_MEASURES            = Physio.OUTCOME_MEASURES;
export const EXERCISE_LIBRARY            = Physio.EXERCISE_LIBRARY;
export const getExercisesForRegion       = Physio.getExercisesForRegion;
export const determinePhase              = Physio.determinePhase;
export const buildIntegrativeRecommendations = Physio.buildIntegrativeRecommendations;
export const PAIN_SCIENCE_LIBRARY        = Physio.PAIN_SCIENCE_LIBRARY;
export const getLatestAssessment         = Physio.getLatestAssessment;
export const saveAssessment              = Physio.saveAssessment;
export const getActiveProgram            = Physio.getActiveProgram;
export const saveProgram                 = Physio.saveProgram;
export const saveSession                 = Physio.saveSession;
export const getOutcomeHistory           = Physio.getOutcomeHistory;
export const saveOutcome                 = Physio.saveOutcome;
export const loadPhysioContext           = Physio.loadPhysioContext;

// Unified Engine Controls
export { startEmotionDrivesEngine as startEmotionDrives };
export { stopEmotionDrivesEngine  };
export { getUnifiedState          };

/* ──────────────────────────── ENGINE REGISTRATION ─────────────────────── */
engineRegistry.registerEngine?.("emotion-drives", {
  start: startEmotionDrivesEngine,
  stop : stopEmotionDrivesEngine,
  state: getUnifiedState,
});