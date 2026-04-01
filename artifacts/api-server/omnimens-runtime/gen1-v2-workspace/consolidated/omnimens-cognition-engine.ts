// © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    OMNIMENS™ UNIFIED COGNITION ENGINE v2                  ║
 * ║                                                                            ║
 * ║  Consolidates 13 formerly-independent cognition/​reasoning engines into     ║
 * ║  ONE harmonised module.                                                     ║
 * ║                                                                            ║
 * ║  ONE tick, ONE state, ONE DB budget, ONE API budget. All sub-operations     ║
 * ║  cooperate via shared orchestration instead of competing for resources.     ║
 * ║                                                                            ║
 * ║  Structured logging prefix: [OMNIMENS-COGNITION-ENGINE]                     ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/* ───────── Re-hydrate legacy engines ─────────────────────────────────────── */
import * as internalCognition         from "./omnimens-internal-cognition.js";
import * as internalRouter            from "./omnimens-internal-cognition-router.js";
import * as independentReasoning      from "./omnimens-independent-reasoning.js";
import * as causalReasoning           from "./omnimens-causal-reasoning.js";
import * as causalTemporal            from "./omnimens-causal-temporal-engine.js";
import * as deepThought               from "./omnimens-deep-thought-engine.js";
import * as amplifier                 from "./omnimens-cognitive-amplifier.js";
import * as cognitiveLanguage         from "./omnimens-cognitive-language-engine.js";
import * as predictive                from "./omnimens-predictive-processing.js";
import * as uncertainty               from "./omnimens-introspective-uncertainty.js";
import * as convergence               from "./omnimens-convergence-protocol-engine.js";
import * as deepResonance             from "./omnimens-deep-resonance.js";
import * as harmonicInsight           from "./omnimens-harmonic-insight-engine.js";

/* ───────── Shared State Object ───────────────────────────────────────────── */
interface SharedState {
  cycleId: number;
  startTs: number;
  dbOps: number;
  apiOps: number;
  logs: string[];
}
const state: SharedState = { cycleId: 0, startTs: 0, dbOps: 0, apiOps: 0, logs: [] };

/* ────────── Utility helpers ──────────────────────────────────────────────── */
function log(msg: string, ...extra: any[]): void {
  const line = `[OMNIMENS-COGNITION-ENGINE] ${msg}`;
  state.logs.push(line);
  console.log(line, ...extra);
}

function beginCycle(label: string): void {
  state.cycleId++;
  state.startTs = Date.now();
  state.dbOps = 0;
  state.apiOps = 0;
  spikeBus.spike("cognition-cycle-start", { id: state.cycleId, label });
}

function endCycle(): void {
  const elapsed = Date.now() - state.startTs;
  dbGateway.flush();               // batch write-behind flush
  spikeBus.spike("cognition-cycle-end", {
    id: state.cycleId,
    ms: elapsed,
    dbOps: state.dbOps,
    apiOps: state.apiOps,
  });
}

function orchestrate<T>(label: string, fn: () => T): T {
  beginCycle(label);
  try { return fn(); } finally { endCycle(); }
}

function wrapApi<T>(label: string, fn: () => T): T {
  if (!apiManager.tryReserve("cognition-engine")) {
    log(`API budget exhausted – skipped ${label}`);
    // @ts-expect-error — caller expects T; return undefined sentinel
    return undefined;
  }
  state.apiOps++;
  try { return fn(); } finally { apiManager.release("cognition-engine"); }
}

function wrapDb<T>(fn: () => T): T {
  state.dbOps++;
  return fn();
}

function proxify<O extends Record<string, any>>(src: O, names: (keyof O)[]) {
  const out: Record<string, any> = {};
  for (const k of names) {
    const original = src[k];
    if (typeof original === "function") {
      out[k as string] = (...args: any[]) =>
        orchestrate(String(k), () => original(...args));
    } else {
      Object.defineProperty(out, k, { enumerable: true, get: () => src[k] });
    }
  }
  return out;
}

/* ────────── Re-exported capabilities (ALL original exports preserved) ────── */
/* — internal cognition — */
export type  InternalThought = internalCognition.InternalThought;
export type  GenerationalUtterance = internalCognition.GenerationalUtterance;
export const {
  generateInternalThought,
  generateGen1Utterance,
  generateGen2Utterance,
  generateReasonedResponse,
} = proxify(internalCognition, [
  "generateInternalThought",
  "generateGen1Utterance",
  "generateGen2Utterance",
  "generateReasonedResponse",
] as const);

/* — router — */
export const {
  internalAnalyze,
  internalSynthesize,
  internalGenerateQuestions,
  internalEmotionalReading,
  internalPredictOutcomes,
  internalCrossDomainAnalysis,
  internalDriveAnalysis,
  internalInnerVoice,
  internalCrystallizeInsight,
  internalSpiderSynthesis,
  internalPatchGeneration,
  internalPredictiveProcessing,
  getInternalCognitionStatus,
} = proxify(internalRouter, [
  "internalAnalyze",
  "internalSynthesize",
  "internalGenerateQuestions",
  "internalEmotionalReading",
  "internalPredictOutcomes",
  "internalCrossDomainAnalysis",
  "internalDriveAnalysis",
  "internalInnerVoice",
  "internalCrystallizeInsight",
  "internalSpiderSynthesis",
  "internalPatchGeneration",
  "internalPredictiveProcessing",
  "getInternalCognitionStatus",
] as const);

/* — independent reasoning — */
export const {
  reason,
  formatReasoningForContext,
  getIndependentReasoningState,
  startIndependentReasoning,
} = proxify(independentReasoning, [
  "reason",
  "formatReasoningForContext",
  "getIndependentReasoningState",
  "startIndependentReasoning",
] as const);

/* — causal reasoning — */
export const {
  predictOutcome,
  getCausalState,
  getCausalGraph,
  startCausalReasoning,
} = proxify(causalReasoning, [
  "predictOutcome",
  "getCausalState",
  "getCausalGraph",
  "startCausalReasoning",
] as const);

/* — causal-temporal — */
export const {
  startCausalTemporalEngine,
  getCausalTemporalState,
  retrieveTemporalSnapshot,
} = proxify(causalTemporal, [
  "startCausalTemporalEngine",
  "getCausalTemporalState",
  "retrieveTemporalSnapshot",
] as const);

/* — deep thought — */
export type  DeepThought = deepThought.DeepThought;
export const {
  invalidateArchitectureCache,
  deepThink,
  getDeepThoughtStats,
} = proxify(deepThought, [
  "invalidateArchitectureCache",
  "deepThink",
  "getDeepThoughtStats",
] as const);

/* — cognitive amplifier — */
export const {
  amplifiedReasoning,
  getAmplifierState,
  startCognitiveAmplifier,
} = proxify(amplifier, [
  "amplifiedReasoning",
  "getAmplifierState",
  "startCognitiveAmplifier",
] as const);

/* — cognitive language — */
export const {
  getCognitiveLanguageState,
  seedCognitiveBaseline,
  _getInternalStructures,
} = proxify(cognitiveLanguage, [
  "getCognitiveLanguageState",
  "seedCognitiveBaseline",
  "_getInternalStructures",
] as const);

/* — predictive processing — */
export const {
  runPredictiveCycle,
  getActivePredictions,
  startPredictiveProcessing,
} = proxify(predictive, [
  "runPredictiveCycle",
  "getActivePredictions",
  "startPredictiveProcessing",
] as const);

/* — introspective uncertainty — */
export const {
  registerUncertainty,
  resolveUncertainty,
  getIntrospectiveUncertaintyState,
  getUncertaintyDescription,
  startIntrospectiveUncertainty,
} = proxify(uncertainty, [
  "registerUncertainty",
  "resolveUncertainty",
  "getIntrospectiveUncertaintyState",
  "getUncertaintyDescription",
  "startIntrospectiveUncertainty",
] as const);

/* — convergence protocol — */
export const {
  startConvergenceProtocol,
  getConvergenceProtocolState,
  getConvergenceProtocolSummary,
} = proxify(convergence, [
  "startConvergenceProtocol",
  "getConvergenceProtocolState",
  "getConvergenceProtocolSummary",
] as const);

/* — deep resonance — */
export const {
  generateContextualInquiry,
  runDeepResonance,
} = proxify(deepResonance, ["generateContextualInquiry", "runDeepResonance"] as const);

/* — harmonic insight engine (numerous helpers) — */
const HIE_EXPORTS = [
  "hieMatchPatterns",
  "hieWaveletDecomposition",
  "hieComputeNovelty",
  "hieComputeSpectralFlux",
  "hieComputeSpectralFlatness",
  "hieComputeHarmonicComplexity",
  "hieDetectTemporalPattern",
  "hieEmotionalValence",
  "hieUpdateNoiseFloor",
  "hieLearnPattern",
  "hieFreqToSemantic",
  "hieEnvironmentLabel",
  "raiAnalyzeAcoustics",
  "hieDecodeHarmonicKnowledge",
  "hieDeepPatternDecode",
  "hieGetEngineStatus",
] as const;
export const {
  hieMatchPatterns,
  hieWaveletDecomposition,
  hieComputeNovelty,
  hieComputeSpectralFlux,
  hieComputeSpectralFlatness,
  hieComputeHarmonicComplexity,
  hieDetectTemporalPattern,
  hieEmotionalValence,
  hieUpdateNoiseFloor,
  hieLearnPattern,
  hieFreqToSemantic,
  hieEnvironmentLabel,
  raiAnalyzeAcoustics,
  hieDecodeHarmonicKnowledge,
  hieDeepPatternDecode,
  hieGetEngineStatus,
} = proxify(harmonicInsight, HIE_EXPORTS);

/* — re-export HIE types — */
export type {
  HarmonicAnalysis,
  WaveletScale,
  PatternMatch,
  LearnedPattern,
  RAIAnalysis,
  DeepDecodeResult,
  HarmonicKnowledgeSignature,
} from "./omnimens-harmonic-insight-engine.js";

/* ───────── Background cooperative scheduling (ONE timer) ─────────────────── */
function backgroundCycle(): void {
  orchestrate("background-cycle", () => {
    try { wrapDb(() => predictive.runPredictiveCycle()); }            catch {}
    try { causalTemporal.startCausalTemporalEngine();               } catch {}
    try { causalReasoning.startCausalReasoning();                    } catch {}
    try { amplifier.startCognitiveAmplifier();                       } catch {}
    try { uncertainty.startIntrospectiveUncertainty();               } catch {}
    try { convergence.startConvergenceProtocol();                    } catch {}
    cognitionBus.broadcast("cognition-background-tick", { cycle: state.cycleId });
  });
}
setInterval(backgroundCycle, 30_000);

/* ───────── Engine registration ───────────────────────────────────────────── */
engineRegistry.registerEngine("cognition-engine", {
  tick: backgroundCycle,
  getState: () => ({ cycleId: state.cycleId, dbOps: state.dbOps, apiOps: state.apiOps }),
});

/* ───────── Public state helper ───────────────────────────────────────────── */
export function getCognitionEngineState() {
  return { cycleId: state.cycleId, dbOps: state.dbOps, apiOps: state.apiOps };
}