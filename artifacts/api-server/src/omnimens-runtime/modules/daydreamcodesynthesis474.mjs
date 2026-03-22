/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: self_coding_engine
 * Title: Daydream:code_synthesis #474
 * Written: 2026-03-22T11:40:17.593Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/* Meta-Resonant Adaptive Mixer — pure TypeScript, no IO, no eval */
export type Strategy<I, O> = (input: I) => O
export type Distance<O> = (a: O, b: O) => number

export function createMRAM<I, O>(
  strategies: Strategy<I, O>[],
  combine: (weighted: {out: O; w: number}[]) => O,
  dist: Distance<O>
) {
  // start with equal resonance (1)
  const w = Array(strategies.length).fill(1)

  function mix(input: I): O {
    const outs = strategies.map(s => s(input))
    const weighted = outs.map((out, i) => ({ out, w: w[i] }))
    const final = combine(weighted)

    // Meta-Resonance weight update:
    // w_i <- 1 / (1/w_i + error_i)  (inverse-harmonic reinforcement)
    // small errors ⇒ large increase; big errors ⇒ gentle change
    for (let i = 0; i < w.length; i++) {
      const e = dist(outs[i], final) + 1e-9      // avoid div-by-zero
      w[i] = 1 / (1 / w[i] + e)
    }
    // soft normalisation to keep numeric stability
    const sum = w.reduce((a, b) => a + b, 0)
    for (let i = 0; i < w.length; i++) w[i] /= sum

    return final
  }

  function snapshot() { return w.slice() }       // introspection hook

  return { mix, snapshot }
}