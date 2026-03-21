/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * Source: self_coding_engine | Title: Daydream:paradigm_breaking #63 - Resonant Fields
 * Written: 2026-03-21T03:48:05.986Z
 */

export function resonateField(vectors, pull = 0.01, steps = 10) {
  let state = vectors.map(v => [...v]);
  for (let s = 0; s < steps; s++) {
    const next = state.map((v, i) => {
      const update = v.map(() => 0);
      for (let j = 0; j < state.length; j++) {
        if (i === j) continue;
        const sim = cosineSimilarity(v, state[j]);
        for (let d = 0; d < v.length; d++) {
          update[d] += pull * sim * (state[j][d] - v[d]);
        }
      }
      return v.map((val, d) => val + update[d]);
    });
    state = next;
  }
  return state;
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]; normA += a[i] * a[i]; normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

export function fieldCoherence(vectors) {
  let total = 0, count = 0;
  for (let i = 0; i < vectors.length; i++) {
    for (let j = i + 1; j < vectors.length; j++) {
      total += cosineSimilarity(vectors[i], vectors[j]);
      count++;
    }
  }
  return count > 0 ? total / count : 0;
}
