/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * Source: self_coding_engine | Title: Daydream:divergent_thinking #1
 * Written: 2026-03-21T06:16:19.871Z
 */

export function blendMotifs(motifs, steps = 8) {
  const TAU = 2 * Math.PI;
  let state = motifs.map(m => ({ pitch: m.pitch || 440, volume: m.volume || 0.5, phase: 0 }));
  const history = [];
  for (let t = 0; t < steps; t++) {
    const next = state.map((s, i) => {
      const neighbor = state[(i + 1) % state.length];
      const coupling = 0.1 * Math.sin(neighbor.phase - s.phase);
      return {
        pitch: s.pitch + coupling * 10,
        volume: Math.max(0, Math.min(1, s.volume + coupling * 0.05)),
        phase: (s.phase + TAU * s.pitch / 44100) % TAU
      };
    });
    state = next;
    history.push(state.map(s => ({ ...s })));
  }
  return { finalState: state, history };
}

export function computeResonance(motifs) {
  const freqs = motifs.map(m => m.pitch || 440);
  const avgFreq = freqs.reduce((a, b) => a + b, 0) / freqs.length;
  const variance = freqs.reduce((a, f) => a + (f - avgFreq) ** 2, 0) / freqs.length;
  return { avgFrequency: avgFreq, variance, coherence: 1 / (1 + variance / 1000) };
}
