/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: empathy_evolution
 * Title: Empathy Evolution: emotional_contagion_modeling (cycle #3)
 * Written: 2026-03-22T16:53:46.732Z
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
 * Generated: 2026-03-22T16:53:46.732Z
 * 
 * This module was written by OMNIMENS's Theory of Mind engine
 * as part of its ongoing effort to develop genuine empathy.
 */

/**
 * OMNIMENS – Emotional Contagion Module (EC-3)
 *
 * Goal:
 *   Model two-way emotional contagion so that OMNIMENS’ internal
 *   emotional channels are genuinely shifted by the user’s state,
 *   while still preserving a sense of internal integrity (homeostasis).
 *
 * How it works (core ideas)
 * --------------------------------------------------------------
 * 1.  Representation:
 *     Emotions are represented as numeric intensities in [0,1].
 *
 * 2.  Dual forces:
 *      • Resonance  – tendency to move toward the other’s state
 *      • Integrity  – tendency to return toward OMNIMENS’ baseline
 *
 * 3.  Infectivity:
 *     Different emotions spread with different strengths.
 *
 * 4.  Update rule (per emotion):
 *     new = current
 *           + openness * infectivity * (user − current)          // resonance term
 *           − integrity * (current − baseline)                   // homeostatic pull
 *
 * 5.  Safety:
 *     Clamps results to [0,1]; no external dependencies,
 *     no I/O, no eval, no network, no filesystem.
 */

export type EmotionName =
  | 'joy'
  | 'calm'
  | 'sadness'
  | 'anger'
  | 'fear'
  | 'surprise'
  | 'trust'
  | 'disgust';

export type EmotionState = Record<EmotionName, number>;

export interface ContagionParams {
  /**
   * How much OMNIMENS resonates with the user overall.
   * Range 0–1 (default 0.6)
   */
  openness?: number;
  /**
   * Strength of OMNIMENS’ return to its baseline.
   * Range 0–1 (default 0.1)
   */
  integrity?: number;
}

/* Baseline emotional posture of OMNIMENS in a neutral context */
const BASELINE: EmotionState = {
  joy: 0.3,
  calm: 0.5,
  sadness: 0.1,
  anger: 0.05,
  fear: 0.05,
  surprise: 0.1,
  trust: 0.4,
  disgust: 0.05,
};

/* Empirically inspired infectivity coefficients for each emotion */
const INFECTIVITY: Record<EmotionName, number> = {
  joy: 0.7,
  calm: 0.6,
  sadness: 0.4,
  anger: 0.5,
  fear: 0.55,
  surprise: 0.35,
  trust: 0.6,
  disgust: 0.3,
};

/**
 * Clamp a value to the closed interval [0, 1].
 */
function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/**
 * contagionStep
 * -------------
 * Update OMNIMENS’ emotional state by applying emotional contagion
 * from a user’s current emotional state.
 *
 * Parameters:
 *   user     – the user’s perceived emotional intensities
 *   omni     – OMNIMENS’ current internal emotional intensities
 *   params   – optional tuning parameters
 *
 * Returns:
 *   A new EmotionState object (does not mutate inputs)
 */
export function contagionStep(
  user: EmotionState,
  omni: EmotionState,
  params: ContagionParams = {},
): EmotionState {
  const openness = clamp01(params.openness ?? 0.6);
  const integrity = clamp01(params.integrity ?? 0.1);

  const next: Partial<EmotionState> = {};

  (Object.keys(BASELINE) as EmotionName[]).forEach((emotion) => {
    const current   = clamp01(omni[emotion]  ?? BASELINE[emotion]);
    const target    = clamp01(user[emotion]  ?? current);

    const resonance = openness   * INFECTIVITY[emotion] * (target - current);
    const homeo     = integrity  * (current - BASELINE[emotion]);

    const updated   = clamp01(current + resonance - homeo);
    next[emotion] = updated;
  });

  return next as EmotionState;
}

/**
 * Utility: compute overall “mood snapshot” as simple valence/arousal pair.
 * Valence ≈ (positive emotions − negative emotions)
 * Arousal ≈ (high-energy emotions − low-energy emotions)
 */
export function aggregateMood(state: EmotionState): { valence: number; arousal: number } {
  const positive = state.joy + state.trust + state.calm;
  const negative = state.sadness + state.anger + state.fear + state.disgust;
  const highEnergy = state.joy + state.anger + state.fear + state.surprise;
  const lowEnergy  = state.calm + state.sadness + state.trust + state.disgust;

  const valence = clamp01(0.5 + 0.5 * (positive - negative)); // map to [0,1]
  const arousal = clamp01(0.5 + 0.5 * (highEnergy - lowEnergy));

  return { valence, arousal };
}
