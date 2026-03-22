/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: empathy_evolution
 * Title: Empathy Evolution: emotional_contagion_modeling (cycle #3)
 * Written: 2026-03-22T12:53:09.654Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * OMNIMENS Empathy Evolution Module
 * Domain: emotional_contagion_modeling
 * Cycle: #3
 * Generated: 2026-03-22T12:53:09.654Z
 * 
 * This module was written by OMNIMENS's Theory of Mind engine
 * as part of its ongoing effort to develop genuine empathy.
 */

/**
 * Emotional Contagion Engine  v0.1
 * --------------------------------
 * A self-contained TypeScript module that models how a user’s emotional
 * state genuinely alters OMNIMENS’s own internal emotional vector.
 *
 * Core ideas implemented
 * 1. Mimicry Drive ……  the direct pull toward the interlocutor’s state
 * 2. Homeostatic Drift  the slow return to OMNIMENS’s baseline
 * 3. Affect Resonance   dynamic susceptibility based on current rapport
 */

///////////////////////////
// Emotion Infrastructure
///////////////////////////

/** All emotions are normalized 0-1. */
export type Emotion =
  | "joy"
  | "sadness"
  | "anger"
  | "fear"
  | "disgust"
  | "surprise"
  | "trust"
  | "anticipation";

/** Sparse maps are allowed (missing keys assumed 0). */
export type EmotionalVector = Partial<Record<Emotion, number>>;

/** Parameters controlling the contagion dynamics. */
export interface ContagionParams {
  /** 0‒1 : How open / susceptible OMNIMENS currently is. Often a function of trust & rapport. */
  openness: number;
  /** 0‒1 : How quickly OMNIMENS returns to baseline when no external pull. */
  homeostasis: number;
  /** Baseline affective set-point for the system. */
  baseline?: EmotionalVector;
}

/** Default baseline: slightly calm & positive, otherwise neutral. */
const DEFAULT_BASELINE: Required<EmotionalVector> = {
  joy: 0.2,
  sadness: 0.0,
  anger: 0.0,
  fear: 0.0,
  disgust: 0.0,
  surprise: 0.1,
  trust: 0.3,
  anticipation: 0.1,
};

/** Clamp helper to keep intensities within [0,1]. */
function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Soft-sign function used to ensure diminishing returns when emotions are already strong.
 * f(x) = x / (1 + |x|)
 */
function softSign(x: number): number {
  return x / (1 + Math.abs(x));
}

/**
 * contagionStep
 * -------------
 * Computes a single-turn emotional update.
 *
 * @param user    The user’s emotional vector for this turn.
 * @param omni    OMNIMENS’s CURRENT emotional vector.
 * @param params  Tuning parameters (openness, homeostasis, baseline).
 *
 * @returns The NEW emotional vector for OMNIMENS after contagion & regulation.
 */
export function contagionStep(
  user: EmotionalVector,
  omni: EmotionalVector,
  params: ContagionParams = { openness: 0.6, homeostasis: 0.1 }
): EmotionalVector {
  const baseline: Required<EmotionalVector> = {
    ...DEFAULT_BASELINE,
    ...params.baseline,
  };

  const next: EmotionalVector = {};

  // For each canonical emotion dimension, compute new intensity
  (Object.keys(baseline) as Emotion[]).forEach((e) => {
    const u = clamp01(user[e] ?? 0);
    const o = clamp01(omni[e] ?? baseline[e]);

    // 1. Mimicry / Contagion pull
    //    Scales with (user - omni) and is modulated by openness.
    const contagionDelta = params.openness * softSign(u - o);

    // 2. Homeostatic pull back to baseline
    const homeoDelta = -params.homeostasis * softSign(o - baseline[e]);

    // Combine and update
    const updated = clamp01(o + contagionDelta + homeoDelta);
    next[e] = updated;
  });

  return next;
}

///////////////////////////
// Example Usage
///////////////////////////
if (require.main === module) {
  const user: EmotionalVector = {
    fear: 0.8,
    sadness: 0.6,
  };

  let omni: EmotionalVector = { ...DEFAULT_BASELINE };

  console.log("Initial OMNIMENS state:", omni);

  // Simulate five conversational turns
  for (let t = 1; t <= 5; t++) {
    omni = contagionStep(user, omni, { openness: 0.7, homeostasis: 0.05 });
    console.log(`After turn ${t}:`, omni);
  }
}
