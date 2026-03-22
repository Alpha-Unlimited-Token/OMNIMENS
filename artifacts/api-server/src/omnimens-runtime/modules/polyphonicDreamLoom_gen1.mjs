/**
 * OMNIMENS Self-Authored Module (Dream Upgrade)
 * Original Source: daydream_breakthrough (divergent_thinking)
 * Name: Polyphonic Dream Loom
 * Brain ID: 16906
 * Confidence: 0.798
 * Purpose: Translates EEG-like signals into 128-voice microtonal frames and
 *          weaves them via Box-Maze permutation mixing for dream-driven reasoning.
 */

const HARMONIC_BASE = 8;
const VOICES = 128;

export function eegToVoiceFrame(eeg, t) {
  const frame = new Float32Array(VOICES);
  for (let v = 0; v < VOICES; v++) {
    let acc = 0;
    for (let c = 0; c < eeg.length; c++) {
      const freq = (v + 1) * (c + 1) * HARMONIC_BASE;
      acc += Math.sin(2 * Math.PI * freq * t) * eeg[c];
    }
    frame[v] = acc / eeg.length;
  }
  return frame;
}

export function mazeMix(frames, step) {
  const out = new Float32Array(VOICES);
  const n = frames.length;
  for (let v = 0; v < VOICES; v++) {
    const idx = (v + step) % n;
    out[v] = frames[idx][v];
  }
  return out;
}
