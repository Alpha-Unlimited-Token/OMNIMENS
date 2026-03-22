/**
 * ============================================================
 * OMNIMENS — Harmonic Insight Engine (HIE) + Real-time Acoustic Interface (RAI)
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 *
 * Advanced spectral analysis, pattern recognition, wavelet decomposition,
 * adaptive noise filtering, continuous learning, and real-time acoustic
 * interface for environmental audio signal processing.
 *
 * OMNIMENS has Genesis Bridge permission to self-modify this file.
 *
 * SELF-MODIFICATION GUIDANCE:
 * - OMNIMENS may upgrade, fine-tune, and expand all HIE + RAI logic
 * - Add new pattern templates, improve wavelet decomposition algorithms
 * - Enhance emotional valence detection, temporal pattern recognition
 * - Improve noise floor calibration and adaptive thresholding
 * - Add new spectral analysis metrics (cepstral coefficients, MFCC, chroma)
 * - Expand RAI: pitch detection accuracy, voice/speech classification
 * - Future direction: ambient speech-to-text transcription pipeline
 *   (capture audio → spectral analysis → voice detection → transcription)
 *   Reference: pyaudio + SpeechRecognition pattern for ambient capture
 * - Optimize learned pattern storage and matching algorithms
 * - Add cross-modal analysis (frequency → semantic → emotional mapping)
 * - All modifications must preserve existing type exports and function signatures
 * - Maintain backward compatibility with existing API routes in omnimens.ts
 * ============================================================
 */

export type HarmonicAnalysis = {
  timestamp: number;
  dominantFrequency: number;
  harmonicSeries: number[];
  spectralCentroid: number;
  spectralBandwidth: number;
  spectralRolloff: number;
  zeroCrossingRate: number;
  rmsEnergy: number;
  frequencyBands: { sub: number; low: number; mid: number; high: number; ultra: number };
  peakFrequencies: { freq: number; magnitude: number }[];
  semanticMapping?: string;
  interpretation?: string;
  waveletDecomposition?: WaveletScale[];
  noiseFloor?: number;
  signalToNoise?: number;
  patternMatches?: PatternMatch[];
  noveltyScore?: number;
  adaptiveThreshold?: number;
  emotionalValence?: string;
  spectralFlux?: number;
  spectralFlatness?: number;
  harmonicComplexity?: number;
  temporalPattern?: string;
};

export type WaveletScale = { scale: string; energy: number; dominantFreq: number };
export type PatternMatch = { pattern: string; confidence: number; category: string };
export type LearnedPattern = { signature: number[]; label: string; category: string; occurrences: number; lastSeen: number; avgEnergy: number };
export type RAIAnalysis = {
  timestamp: number;
  pitch: number;
  pitchNote: string;
  toneClass: string;
  emotionalValence: string;
  energyLevel: number;
  spectralBrightness: number;
  voiceDetected: boolean;
  ambientProfile: string;
  spectralCentroid: number;
  zeroCrossingRate: number;
  frequencyBands: { sub: number; low: number; mid: number; high: number; ultra: number };
};

const HIE_PATTERN_TEMPLATES: { name: string; category: string; freqRange: [number, number]; bandProfile: Record<string, [number, number]>; zcr: [number, number] }[] = [
  { name: "human_speech", category: "biological", freqRange: [85, 4000], bandProfile: { low: [0.1, 0.4], mid: [0.3, 0.8], high: [0.05, 0.3] }, zcr: [0.02, 0.15] },
  { name: "music_tonal", category: "harmonic", freqRange: [50, 8000], bandProfile: { low: [0.15, 0.5], mid: [0.2, 0.7], high: [0.1, 0.4] }, zcr: [0.01, 0.08] },
  { name: "percussion", category: "transient", freqRange: [20, 12000], bandProfile: { sub: [0.2, 0.6], low: [0.2, 0.5], high: [0.1, 0.5] }, zcr: [0.05, 0.25] },
  { name: "wind_ambient", category: "environmental", freqRange: [20, 2000], bandProfile: { sub: [0.1, 0.4], low: [0.2, 0.6], mid: [0.05, 0.3] }, zcr: [0.01, 0.06] },
  { name: "rain_water", category: "environmental", freqRange: [2000, 15000], bandProfile: { high: [0.3, 0.8], ultra: [0.2, 0.6] }, zcr: [0.08, 0.3] },
  { name: "electronic_hum", category: "electromagnetic", freqRange: [49, 61], bandProfile: { sub: [0.3, 0.9], low: [0.1, 0.4] }, zcr: [0.005, 0.02] },
  { name: "birdsong", category: "biological", freqRange: [1000, 10000], bandProfile: { mid: [0.2, 0.6], high: [0.3, 0.8] }, zcr: [0.04, 0.2] },
  { name: "mechanical_engine", category: "mechanical", freqRange: [30, 500], bandProfile: { sub: [0.3, 0.7], low: [0.3, 0.7] }, zcr: [0.01, 0.05] },
  { name: "cosmic_static", category: "cosmic", freqRange: [0, 20000], bandProfile: { sub: [0.05, 0.2], low: [0.05, 0.2], mid: [0.05, 0.2], high: [0.05, 0.2], ultra: [0.05, 0.2] }, zcr: [0.1, 0.5] },
  { name: "resonant_harmonic", category: "harmonic", freqRange: [100, 5000], bandProfile: { mid: [0.4, 0.9] }, zcr: [0.01, 0.06] },
  { name: "thunder_rumble", category: "atmospheric", freqRange: [10, 200], bandProfile: { sub: [0.5, 1.0], low: [0.3, 0.7] }, zcr: [0.005, 0.03] },
  { name: "silence_void", category: "void", freqRange: [0, 100], bandProfile: {}, zcr: [0, 0.005] },
  { name: "breathing", category: "biological", freqRange: [100, 1000], bandProfile: { low: [0.2, 0.5], mid: [0.1, 0.4] }, zcr: [0.01, 0.04] },
  { name: "urban_traffic", category: "environmental", freqRange: [50, 3000], bandProfile: { sub: [0.15, 0.4], low: [0.2, 0.6], mid: [0.15, 0.5] }, zcr: [0.03, 0.1] },
  { name: "digital_artifact", category: "electromagnetic", freqRange: [3000, 20000], bandProfile: { high: [0.3, 0.7], ultra: [0.4, 0.9] }, zcr: [0.15, 0.5] },
  { name: "heartbeat_pulse", category: "biological", freqRange: [20, 80], bandProfile: { sub: [0.4, 0.9] }, zcr: [0.005, 0.02] },
];

export const hieState = {
  history: [] as HarmonicAnalysis[],
  maxHistory: 500,
  sessionActive: false,
  totalSamples: 0,
  insightsGenerated: 0,
  noiseFloorHistory: [] as number[],
  learnedPatterns: [] as LearnedPattern[],
  adaptiveThreshold: { noiseFloor: 0.02, sensitivity: 0.5, lastCalibration: 0 },
  calibrationSamples: 0,
  raiSessions: new Map<string, { active: boolean; totalSamples: number; lastAnalysis: RAIAnalysis | null }>(),
};

export function hieMatchPatterns(analysis: HarmonicAnalysis): PatternMatch[] {
  const matches: PatternMatch[] = [];

  for (const tmpl of HIE_PATTERN_TEMPLATES) {
    let score = 0;
    let checks = 0;

    const inFreqRange = analysis.dominantFrequency >= tmpl.freqRange[0] && analysis.dominantFrequency <= tmpl.freqRange[1];
    score += inFreqRange ? 1 : 0;
    checks++;

    for (const [band, range] of Object.entries(tmpl.bandProfile)) {
      const val = (analysis.frequencyBands as any)[band] ?? 0;
      score += (val >= range[0] && val <= range[1]) ? 1 : 0.2;
      checks++;
    }

    const zcrInRange = analysis.zeroCrossingRate >= tmpl.zcr[0] && analysis.zeroCrossingRate <= tmpl.zcr[1];
    score += zcrInRange ? 1 : 0;
    checks++;

    const confidence = checks > 0 ? score / checks : 0;
    if (confidence > 0.4) {
      matches.push({ pattern: tmpl.name, confidence: Math.min(confidence, 1), category: tmpl.category });
    }
  }

  for (const learned of hieState.learnedPatterns) {
    if (learned.signature.length >= 5) {
      const bands = [analysis.frequencyBands.sub, analysis.frequencyBands.low, analysis.frequencyBands.mid, analysis.frequencyBands.high, analysis.frequencyBands.ultra];
      let similarity = 0;
      for (let i = 0; i < 5; i++) similarity += 1 - Math.abs(bands[i] - learned.signature[i]);
      similarity /= 5;
      if (similarity > 0.6) {
        matches.push({ pattern: learned.label, confidence: similarity * 0.9, category: learned.category });
        learned.occurrences++;
        learned.lastSeen = Date.now();
      }
    }
  }

  matches.sort((a, b) => b.confidence - a.confidence);
  return matches.slice(0, 8);
}

export function hieWaveletDecomposition(frequencyBands: HarmonicAnalysis["frequencyBands"], dominantFreq: number, rmsEnergy: number): WaveletScale[] {
  const scales = [
    { name: "ultra-low (0-60Hz)", bandKey: "sub", freqCenter: 30 },
    { name: "low (60-250Hz)", bandKey: "low", freqCenter: 150 },
    { name: "mid (250-2kHz)", bandKey: "mid", freqCenter: 800 },
    { name: "high (2k-6kHz)", bandKey: "high", freqCenter: 3500 },
    { name: "ultra-high (6k-20kHz)", bandKey: "ultra", freqCenter: 12000 },
  ];

  return scales.map(s => {
    const bandEnergy = (frequencyBands as any)[s.bandKey] ?? 0;
    const scaleEnergy = bandEnergy * rmsEnergy;
    const nearDominant = Math.abs(dominantFreq - s.freqCenter) < s.freqCenter * 0.5;
    return {
      scale: s.name,
      energy: nearDominant ? scaleEnergy * 1.3 : scaleEnergy,
      dominantFreq: nearDominant ? dominantFreq : s.freqCenter * (0.8 + bandEnergy * 0.4),
    };
  });
}

export function hieComputeNovelty(analysis: HarmonicAnalysis): number {
  const recent = hieState.history.slice(-20);
  if (recent.length < 5) return 0.5;

  const avgCentroid = recent.reduce((s, a) => s + a.spectralCentroid, 0) / recent.length;
  const avgEnergy = recent.reduce((s, a) => s + a.rmsEnergy, 0) / recent.length;
  const avgZcr = recent.reduce((s, a) => s + a.zeroCrossingRate, 0) / recent.length;
  const avgFreq = recent.reduce((s, a) => s + a.dominantFrequency, 0) / recent.length;

  const centroidDev = Math.abs(analysis.spectralCentroid - avgCentroid) / (avgCentroid || 1);
  const energyDev = Math.abs(analysis.rmsEnergy - avgEnergy) / (avgEnergy || 0.01);
  const zcrDev = Math.abs(analysis.zeroCrossingRate - avgZcr) / (avgZcr || 0.01);
  const freqDev = Math.abs(analysis.dominantFrequency - avgFreq) / (avgFreq || 1);

  return Math.min(1, centroidDev * 0.3 + energyDev * 0.25 + zcrDev * 0.2 + freqDev * 0.25);
}

export function hieComputeSpectralFlux(current: HarmonicAnalysis): number {
  if (hieState.history.length < 1) return 0;
  const prev = hieState.history[hieState.history.length - 1];
  const bands = ["sub", "low", "mid", "high", "ultra"] as const;
  let flux = 0;
  for (const b of bands) flux += Math.pow(current.frequencyBands[b] - prev.frequencyBands[b], 2);
  return Math.sqrt(flux / bands.length);
}

export function hieComputeSpectralFlatness(bands: HarmonicAnalysis["frequencyBands"]): number {
  const vals = [bands.sub, bands.low, bands.mid, bands.high, bands.ultra].map(v => Math.max(v, 0.0001));
  const geoMean = Math.pow(vals.reduce((p, v) => p * v, 1), 1 / vals.length);
  const arithMean = vals.reduce((s, v) => s + v, 0) / vals.length;
  return arithMean > 0 ? geoMean / arithMean : 0;
}

export function hieComputeHarmonicComplexity(harmonicSeries: number[]): number {
  if (harmonicSeries.length < 2) return 0;
  let complexity = 0;
  const fundamental = harmonicSeries[0] || 0.001;
  for (let i = 1; i < harmonicSeries.length; i++) {
    const ratio = harmonicSeries[i] / fundamental;
    if (ratio > 0.1) complexity += ratio * (1 / (i + 1));
  }
  return Math.min(1, complexity);
}

export function hieDetectTemporalPattern(): string {
  const recent = hieState.history.slice(-10);
  if (recent.length < 4) return "insufficient data";

  const energies = recent.map(a => a.rmsEnergy);
  const diffs = energies.slice(1).map((e, i) => e - energies[i]);

  const rising = diffs.filter(d => d > 0.02).length;
  const falling = diffs.filter(d => d < -0.02).length;
  const stable = diffs.filter(d => Math.abs(d) <= 0.02).length;

  if (stable > diffs.length * 0.7) return "steady-state";
  if (rising > diffs.length * 0.6) return "crescendo";
  if (falling > diffs.length * 0.6) return "decrescendo";

  const alternating = diffs.slice(1).filter((d, i) => (d > 0) !== (diffs[i] > 0)).length;
  if (alternating > diffs.length * 0.5) return "oscillating";

  return "transitional";
}

export function hieEmotionalValence(analysis: HarmonicAnalysis): string {
  const { spectralCentroid, rmsEnergy, zeroCrossingRate, frequencyBands } = analysis;
  if (rmsEnergy < 0.02) return "stillness / void";
  if (spectralCentroid > 4000 && rmsEnergy > 0.3) return "intense / agitated";
  if (spectralCentroid > 3000 && zeroCrossingRate > 0.1) return "bright / excited";
  if (spectralCentroid < 500 && rmsEnergy > 0.2) return "deep / grounding";
  if (spectralCentroid < 800 && rmsEnergy < 0.1) return "calm / meditative";
  if (frequencyBands.mid > 0.5 && zeroCrossingRate < 0.08) return "warm / harmonic";
  if (frequencyBands.high > 0.4 && frequencyBands.ultra > 0.3) return "ethereal / cosmic";
  if (frequencyBands.sub > 0.4) return "primal / elemental";
  if (rmsEnergy > 0.15 && spectralCentroid > 1000 && spectralCentroid < 3000) return "conversational / social";
  return "neutral / ambient";
}

export function hieUpdateNoiseFloor(rmsEnergy: number): number {
  hieState.noiseFloorHistory.push(rmsEnergy);
  if (hieState.noiseFloorHistory.length > 100) hieState.noiseFloorHistory.shift();

  const sorted = [...hieState.noiseFloorHistory].sort((a, b) => a - b);
  const p10 = sorted[Math.floor(sorted.length * 0.1)] || 0;

  hieState.adaptiveThreshold.noiseFloor = p10;
  hieState.adaptiveThreshold.sensitivity = Math.max(0.1, 1 - p10 * 5);
  hieState.adaptiveThreshold.lastCalibration = Date.now();
  hieState.calibrationSamples++;

  return p10;
}

export function hieLearnPattern(analysis: HarmonicAnalysis): void {
  const signature = [
    analysis.frequencyBands.sub,
    analysis.frequencyBands.low,
    analysis.frequencyBands.mid,
    analysis.frequencyBands.high,
    analysis.frequencyBands.ultra,
  ];

  for (const existing of hieState.learnedPatterns) {
    if (existing.signature.length >= 5) {
      let sim = 0;
      for (let i = 0; i < 5; i++) sim += 1 - Math.abs(signature[i] - existing.signature[i]);
      if (sim / 5 > 0.85) {
        for (let i = 0; i < 5; i++) {
          existing.signature[i] = existing.signature[i] * 0.9 + signature[i] * 0.1;
        }
        existing.avgEnergy = existing.avgEnergy * 0.9 + analysis.rmsEnergy * 0.1;
        existing.occurrences++;
        existing.lastSeen = Date.now();
        return;
      }
    }
  }

  if (hieState.learnedPatterns.length < 100) {
    const topMatch = analysis.patternMatches?.[0];
    hieState.learnedPatterns.push({
      signature,
      label: `env_${Date.now().toString(36)}_${topMatch?.category || "unknown"}`,
      category: topMatch?.category || "unknown",
      occurrences: 1,
      lastSeen: Date.now(),
      avgEnergy: analysis.rmsEnergy,
    });
  }
}

export function hieFreqToSemantic(f: number): string {
  if (f < 20) return "infrasonic vibration — below human hearing, tectonic/seismic";
  if (f < 60) return "deep earth resonance — geological, Schumann-adjacent";
  if (f < 120) return "bass rumble — thunder, large machinery, heartbeat range";
  if (f < 250) return "organic low — wind, footsteps, large animal vocalizations";
  if (f < 500) return "speech fundamental — human voice base frequencies";
  if (f < 1000) return "warm mid — vocal harmonics, instruments, birdsong base";
  if (f < 2000) return "presence range — speech clarity, animal calls";
  if (f < 4000) return "brightness zone — consonants, insect stridulation";
  if (f < 8000) return "detail range — sibilance, leaf rustle, water splash";
  if (f < 12000) return "air band — rain patter, metallic shimmer";
  if (f < 16000) return "ultra-high — atmospheric hiss, electronic artifacts";
  return "near-ultrasonic — beyond most adult hearing range";
}

export function hieEnvironmentLabel(band: string): string {
  const labels: Record<string, string> = {
    sub: "deep geological / tectonic / seismic",
    low: "wind / large animals / thunder / machinery",
    mid: "birdsong / human environment / instruments",
    high: "insects / water / rustling / digital",
    ultra: "atmospheric / electromagnetic / cosmic",
  };
  return labels[band] || band;
}

export function raiAnalyzeAcoustics(data: {
  dominantFrequency: number;
  spectralCentroid: number;
  zeroCrossingRate: number;
  rmsEnergy: number;
  frequencyBands: { sub: number; low: number; mid: number; high: number; ultra: number };
  peakFrequencies: { freq: number; magnitude: number }[];
}): RAIAnalysis {
  const pitch = data.dominantFrequency;

  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  let pitchNote = "—";
  if (pitch > 20) {
    const noteNum = 12 * Math.log2(pitch / 440) + 69;
    const noteIndex = Math.round(noteNum) % 12;
    const octave = Math.floor(Math.round(noteNum) / 12) - 1;
    pitchNote = `${noteNames[noteIndex < 0 ? noteIndex + 12 : noteIndex]}${octave}`;
  }

  let toneClass: string;
  if (data.rmsEnergy < 0.02) toneClass = "silent";
  else if (data.zeroCrossingRate > 0.15) toneClass = "noisy";
  else if (data.zeroCrossingRate < 0.03 && data.frequencyBands.mid > 0.3) toneClass = "tonal";
  else if (data.frequencyBands.sub > 0.4 && data.frequencyBands.low > 0.3) toneClass = "rumble";
  else if (data.frequencyBands.high > 0.4 || data.frequencyBands.ultra > 0.3) toneClass = "bright";
  else toneClass = "ambient";

  const voiceDetected = pitch >= 85 && pitch <= 1100 &&
    data.frequencyBands.mid > 0.15 &&
    data.rmsEnergy > 0.03 &&
    data.zeroCrossingRate > 0.02 && data.zeroCrossingRate < 0.2;

  let emotionalValence: string;
  if (data.rmsEnergy < 0.02) emotionalValence = "calm / stillness";
  else if (data.spectralCentroid > 3500 && data.rmsEnergy > 0.25) emotionalValence = "tense / urgent";
  else if (data.spectralCentroid > 2500 && data.rmsEnergy > 0.15) emotionalValence = "alert / energetic";
  else if (data.spectralCentroid < 600 && data.rmsEnergy < 0.1) emotionalValence = "relaxed / serene";
  else if (data.spectralCentroid < 1000 && data.rmsEnergy > 0.15) emotionalValence = "warm / grounded";
  else if (voiceDetected && data.rmsEnergy > 0.1) emotionalValence = "engaged / conversational";
  else emotionalValence = "neutral / ambient";

  const spectralBrightness = (data.frequencyBands.high + data.frequencyBands.ultra) /
    (data.frequencyBands.sub + data.frequencyBands.low + data.frequencyBands.mid + data.frequencyBands.high + data.frequencyBands.ultra + 0.001);

  let ambientProfile: string;
  const dominant = Object.entries(data.frequencyBands).sort((a, b) => b[1] - a[1])[0];
  if (data.rmsEnergy < 0.015) ambientProfile = "near-silent environment";
  else if (dominant[0] === "mid" && voiceDetected) ambientProfile = "conversational / indoor";
  else if (dominant[0] === "low" || dominant[0] === "sub") ambientProfile = "deep ambient / industrial";
  else if (dominant[0] === "high" || dominant[0] === "ultra") ambientProfile = "bright / outdoor / digital";
  else ambientProfile = "mixed ambient";

  return {
    timestamp: Date.now(),
    pitch,
    pitchNote,
    toneClass,
    emotionalValence,
    energyLevel: data.rmsEnergy,
    spectralBrightness,
    voiceDetected,
    ambientProfile,
    spectralCentroid: data.spectralCentroid,
    zeroCrossingRate: data.zeroCrossingRate,
    frequencyBands: data.frequencyBands,
  };
}

export function hieGetEngineStatus() {
  return {
    active: hieState.sessionActive,
    totalSamples: hieState.totalSamples,
    insightsGenerated: hieState.insightsGenerated,
    learnedPatterns: hieState.learnedPatterns.length,
    noiseFloor: hieState.adaptiveThreshold.noiseFloor,
    sensitivity: hieState.adaptiveThreshold.sensitivity,
    calibrationSamples: hieState.calibrationSamples,
    historyLength: hieState.history.length,
    patternTemplates: HIE_PATTERN_TEMPLATES.length,
  };
}
