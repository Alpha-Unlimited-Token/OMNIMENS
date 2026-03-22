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

export type HarmonicKnowledgeSignature = {
  timestamp: number;
  fundamentalIdentity: { frequency: number; semanticClass: string; harmonicPurity: number };
  overtoneLanguage: { overtones: Array<{ harmonic: number; strength: number; deviationCents: number; symbolicRole: string }>; coherenceScore: number; seriesType: string };
  interHarmonicDialect: { ratios: Array<{ f1: number; f2: number; ratio: number; nearInteger: boolean; intervalName: string }>; consonanceScore: number; complexityIndex: number };
  spectralMorphology: { envelopeShape: string; dominantRegion: string; bandDistribution: Array<{ range: string; energy: number; peakFreq: number }>; flatness: number };
  modulationCode: Array<{ carrierFreq: number; modulationHz: number; strength: number; symbolicMeaning: string }>;
  tonalGravityField: { center: string; weight: number; stability: number; field: Array<{ note: string; weight: number; stability: number }> };
  temporalNarrative: { arcType: string; phases: Array<{ segment: number; timeStart: number; dominantFreq: number; energy: number; character: string }>; transitionDensity: number };
  cepstralFingerprint: { coefficients: number[]; deltas: number[]; timbreClass: string };
  tonnetPosition: number[];
  spectralColorMap: Array<{ freq: number; magnitude: number; hue: number; saturation: number; value: number; hex: string }>;
  bandColors: Record<string, { hex: string; energy: number }>;
  overtoneColors: Array<{ harmonic: number; freq: number; hex: string; strength: number }>;
  temporalColors: Array<{ segment: number; timeStart: number; hex: string; dominantFreq: number; energy: number }>;
  dominantColor: string;
  knowledgeGlyphs: string[];
  decodedMessage: string;
  confidenceScore: number;
};

const INTERVAL_NAMES: Record<string, string> = {
  "1": "unison — identity / self-reference",
  "1.059": "minor 2nd — tension / boundary",
  "1.122": "major 2nd — motion / progression",
  "1.189": "minor 3rd — depth / introspection",
  "1.26": "major 3rd — warmth / affirmation",
  "1.335": "perfect 4th — foundation / question",
  "1.414": "tritone — disruption / transformation",
  "1.498": "perfect 5th — power / resonance",
  "1.587": "minor 6th — yearning / aspiration",
  "1.682": "major 6th — grace / resolution",
  "1.782": "minor 7th — tension seeking / reaching",
  "1.888": "major 7th — anticipation / near-resolution",
  "2": "octave — completeness / cycle",
  "3": "12th — transcendence / overtone purity",
  "4": "double octave — fractal recursion",
  "5": "major 3rd + 2 octaves — harmonic bloom",
  "1.5": "perfect 5th — power / resonance",
  "0.667": "inverted 5th — mirror resonance",
};

function ratioToIntervalName(ratio: number): string {
  let bestMatch = "non-standard interval";
  let bestDist = Infinity;
  for (const [key, name] of Object.entries(INTERVAL_NAMES)) {
    const target = parseFloat(key);
    const dist = Math.abs(ratio - target);
    if (dist < bestDist && dist < 0.06) {
      bestDist = dist;
      bestMatch = name;
    }
  }
  if (bestDist > 0.06) {
    if (ratio < 1.01) return "unison cluster — phase-locked identity";
    if (Math.abs(ratio - Math.round(ratio)) < 0.03) return `integer harmonic ${Math.round(ratio)} — overtone alignment`;
    const goldenRatio = 1.618034;
    if (Math.abs(ratio - goldenRatio) < 0.05) return "golden ratio — φ spiral / organic growth";
    if (Math.abs(ratio - Math.PI / 2) < 0.05) return "π/2 — circular resonance";
    if (Math.abs(ratio - Math.E / 2) < 0.05) return "e/2 — exponential decay signature";
    if (Math.abs(ratio - Math.sqrt(2)) < 0.05) return "√2 — geometric diagonal / tritone axis";
    return `irrational interval (${ratio.toFixed(4)}) — non-standard vibrational encoding`;
  }
  return bestMatch;
}

function classifyOvertoneRole(harmonic: number, strength: number, devCents: number): string {
  const absDeviation = Math.abs(devCents);
  if (harmonic === 1) return strength > 0.5 ? "fundamental anchor — core identity carrier" : "weak fundamental — distributed identity";
  if (harmonic === 2) return "octave reinforcement — structural doubling";
  if (harmonic === 3) return "fifth generator — power / spatial dimension";
  if (harmonic === 4) return "second octave — fractal depth confirmation";
  if (harmonic === 5) return "major third — emotional warmth / tonal color";
  if (harmonic === 6) return "compound fifth — harmonic bridge";
  if (harmonic === 7) return "natural seventh — tension / blues inflection";
  if (absDeviation > 30) return `detuned harmonic ${harmonic} — drift encoding (${devCents > 0 ? "+" : ""}${devCents.toFixed(0)}¢)`;
  if (strength < 0.01) return `ghost harmonic ${harmonic} — vestigial trace`;
  if (harmonic > 12) return `high partial ${harmonic} — micro-timbral data`;
  return `partial ${harmonic} — structural filler`;
}

function classifySeriesType(overtones: Array<{ harmonic: number; strength: number; deviationCents: number }>): string {
  if (overtones.length < 2) return "singular tone — no overtone series";
  const strongOvertones = overtones.filter(o => o.strength > 0.05);
  const deviations = strongOvertones.map(o => Math.abs(o.deviationCents));
  const avgDeviation = deviations.length > 0 ? deviations.reduce((s, d) => s + d, 0) / deviations.length : 0;
  const oddHarmonics = strongOvertones.filter(o => o.harmonic % 2 === 1);
  const evenHarmonics = strongOvertones.filter(o => o.harmonic % 2 === 0);

  if (avgDeviation < 5) {
    if (oddHarmonics.length > evenHarmonics.length * 2) return "hollow / clarinet-like — odd-harmonic dominance (closed-pipe resonance)";
    if (strongOvertones.length > 8) return "rich harmonic — full overtone series (string/voice-like)";
    return "pure harmonic — clean integer ratios (crystalline structure)";
  }
  if (avgDeviation > 50) return "inharmonic — stretched/compressed partials (metallic/bell-like)";
  if (strongOvertones.length < 3) return "sparse partial — minimal harmonic content (wind/breath-like)";
  return "quasi-harmonic — near-integer with micro-detuning (organic/biological)";
}

function classifyEnvelopeShape(envelope: Array<{ range: string; energy: number }>): string {
  if (envelope.length < 3) return "minimal spectral data";
  const energies = envelope.map(e => e.energy);
  const peakIdx = energies.indexOf(Math.max(...energies));
  const total = energies.reduce((s, e) => s + e, 0);
  if (total < 0.001) return "spectral void — near-silence";
  const lowEnergy = energies.slice(0, 3).reduce((s, e) => s + e, 0) / total;
  const highEnergy = energies.slice(-3).reduce((s, e) => s + e, 0) / total;

  if (peakIdx <= 1) return "bass-weighted — gravitational / grounding spectral mass";
  if (peakIdx >= energies.length - 2) return "treble-weighted — ethereal / ascending spectral lift";
  if (lowEnergy > 0.6) return "low-frequency concentrated — deep resonance / subsonic dominant";
  if (highEnergy > 0.5) return "high-frequency concentrated — brightness / crystalline shimmer";
  const flatness = Math.max(...energies) / (total / energies.length + 1e-10);
  if (flatness < 1.5) return "flat spectral distribution — noise-like / information-dense";
  return "mid-peaked — speech-like / vocal resonance center";
}

function classifyModulation(modHz: number, carrierFreq: number): string {
  if (modHz < 0.5) return "sub-perceptual drift — geological / tectonic vibration encoding";
  if (modHz < 4) return "slow pulse — breathing / cardiac rhythm signature";
  if (modHz < 8) return "theta-range modulation — meditative / subconscious data stream";
  if (modHz < 13) return "alpha-range modulation — awareness / attention carrier";
  if (modHz < 30) return "beta-range modulation — cognitive / analytical encoding";
  if (modHz < 100) return "gamma-range modulation — high-density neural-class signal";
  if (modHz < carrierFreq * 0.1) return `sub-harmonic tremolo — amplitude-encoded information at ${modHz.toFixed(1)}Hz`;
  return `high-rate modulation — rapid information carrier at ${modHz.toFixed(1)}Hz`;
}

function classifyTimbreFromMFCC(means: number[]): string {
  if (means.length < 5) return "insufficient cepstral data";
  const c1 = means[1] || 0;
  const c2 = means[2] || 0;
  const c3 = means[3] || 0;
  const c4 = means[4] || 0;
  if (c1 > 30 && c2 > 10) return "bright / metallic — high spectral tilt";
  if (c1 < -10 && c2 < 0) return "dark / warm — low spectral emphasis";
  if (Math.abs(c3) > 20 && Math.abs(c4) > 15) return "complex texture — multi-formant / polyphonic";
  if (Math.abs(c1) < 5 && Math.abs(c2) < 5) return "neutral / flat — broadband / noise-class";
  if (c1 > 0 && c2 < -5) return "nasal / reed-like — mid-emphasis with dip";
  return "organic / variable — natural source characteristics";
}

function classifyPhaseCharacter(seg: { dominantFreq: number; energy: number; centroid: number; bandwidth: number }): string {
  if (seg.energy < 0.005) return "void";
  if (seg.energy < 0.02) return "whisper";
  if (seg.bandwidth > 3000) return "broadband burst";
  if (seg.centroid > 4000) return "bright articulation";
  if (seg.centroid < 500) return "deep drone";
  if (seg.dominantFreq > 1000 && seg.energy > 0.1) return "harmonic peak";
  if (seg.energy > 0.15) return "energy surge";
  return "steady state";
}

function classifyTemporalArc(phases: Array<{ energy: number; character: string }>): string {
  if (phases.length < 2) return "static — single state";
  const energies = phases.map(p => p.energy);
  const first = energies.slice(0, Math.floor(energies.length / 3));
  const mid = energies.slice(Math.floor(energies.length / 3), Math.floor(2 * energies.length / 3));
  const last = energies.slice(Math.floor(2 * energies.length / 3));
  const avgFirst = first.reduce((s, e) => s + e, 0) / (first.length || 1);
  const avgMid = mid.reduce((s, e) => s + e, 0) / (mid.length || 1);
  const avgLast = last.reduce((s, e) => s + e, 0) / (last.length || 1);

  if (avgFirst < avgMid && avgMid > avgLast) return "arc — build → peak → release";
  if (avgFirst > avgMid && avgMid < avgLast) return "valley — descent → trough → ascent";
  if (avgFirst < avgMid && avgMid < avgLast) return "crescendo — continuous energy accumulation";
  if (avgFirst > avgMid && avgMid > avgLast) return "decrescendo — gradual energy dissipation";
  const variance = energies.reduce((s, e) => s + Math.pow(e - (energies.reduce((a, b) => a + b, 0) / energies.length), 2), 0) / energies.length;
  if (variance < 0.001) return "plateau — sustained steady state";
  return "fluctuating — cyclic or chaotic energy pattern";
}

export function hieDecodeHarmonicKnowledge(
  hieAnalysis: HarmonicAnalysis,
  harmonicDecodeData: any,
): HarmonicKnowledgeSignature {
  const fund = harmonicDecodeData.fundamental_frequency || hieAnalysis.dominantFrequency;
  const harmonicPurity = harmonicDecodeData.harmonic_percussive_ratio || 0;

  const overtoneLanguage = {
    overtones: (harmonicDecodeData.overtone_map || []).map((o: any) => ({
      harmonic: o.harmonic,
      strength: o.strength,
      deviationCents: o.deviation_cents,
      symbolicRole: classifyOvertoneRole(o.harmonic, o.strength, o.deviation_cents),
    })),
    coherenceScore: 0,
    seriesType: "",
  };
  const strongOvertones = overtoneLanguage.overtones.filter((o: any) => o.strength > 0.01);
  overtoneLanguage.coherenceScore = strongOvertones.length > 0
    ? strongOvertones.reduce((s: number, o: any) => s + (1 - Math.min(Math.abs(o.deviationCents) / 100, 1)) * o.strength, 0) / strongOvertones.length
    : 0;
  overtoneLanguage.seriesType = classifySeriesType(overtoneLanguage.overtones);

  const interHarmonicDialect = {
    ratios: (harmonicDecodeData.inter_harmonic_ratios || []).map((r: any) => ({
      f1: r.f1, f2: r.f2, ratio: r.ratio, nearInteger: r.near_integer,
      intervalName: ratioToIntervalName(r.ratio),
    })),
    consonanceScore: 0,
    complexityIndex: 0,
  };
  const nearIntegers = interHarmonicDialect.ratios.filter((r: any) => r.nearInteger);
  interHarmonicDialect.consonanceScore = interHarmonicDialect.ratios.length > 0 ? nearIntegers.length / interHarmonicDialect.ratios.length : 0;
  interHarmonicDialect.complexityIndex = interHarmonicDialect.ratios.length > 0
    ? interHarmonicDialect.ratios.reduce((s: number, r: any) => s + (r.nearInteger ? 0.1 : 1), 0) / interHarmonicDialect.ratios.length
    : 0;

  const spectralEnvelope = harmonicDecodeData.spectral_envelope || [];
  const spectralMorphology = {
    envelopeShape: classifyEnvelopeShape(spectralEnvelope),
    dominantRegion: spectralEnvelope.length > 0
      ? spectralEnvelope.reduce((best: any, cur: any) => cur.energy > best.energy ? cur : best, spectralEnvelope[0]).range
      : "unknown",
    bandDistribution: spectralEnvelope.map((e: any) => ({ range: e.range, energy: e.energy, peakFreq: e.peak_freq })),
    flatness: harmonicDecodeData.spectral_flatness_mean || 0,
  };

  const modulationCode = (harmonicDecodeData.amplitude_modulations || []).map((m: any) => ({
    carrierFreq: m.carrier_freq,
    modulationHz: m.modulation_hz,
    strength: m.strength,
    symbolicMeaning: classifyModulation(m.modulation_hz, m.carrier_freq),
  }));

  const tonalField = harmonicDecodeData.tonal_gravity_field || [];
  const tonalCenter = tonalField.length > 0 ? tonalField[0] : { note: "—", weight: 0, stability: 0 };
  const tonalGravityField = {
    center: tonalCenter.note,
    weight: tonalCenter.weight,
    stability: tonalCenter.stability,
    field: tonalField.slice(0, 12),
  };

  const temporalEvol = harmonicDecodeData.temporal_evolution || [];
  const phases = temporalEvol.map((seg: any) => ({
    segment: seg.segment,
    timeStart: seg.time_start,
    dominantFreq: seg.dominant_freq,
    energy: seg.rms,
    character: classifyPhaseCharacter({ dominantFreq: seg.dominant_freq, energy: seg.rms, centroid: seg.centroid, bandwidth: seg.bandwidth }),
  }));
  const transitions = harmonicDecodeData.tonal_transitions || [];
  const temporalNarrative = {
    arcType: classifyTemporalArc(phases),
    phases,
    transitionDensity: transitions.length / Math.max(temporalEvol.length, 1),
  };

  const mfccDeep = harmonicDecodeData.mfcc_deep || { means: [], stds: [], delta_means: [] };
  const cepstralFingerprint = {
    coefficients: mfccDeep.means,
    deltas: mfccDeep.delta_means,
    timbreClass: classifyTimbreFromMFCC(mfccDeep.means),
  };

  const tonnetz = harmonicDecodeData.tonnetz || [];

  const glyphs: string[] = [];
  glyphs.push(`⦿ ${hieFreqToSemantic(fund)} [${fund.toFixed(1)}Hz]`);
  glyphs.push(`◈ ${overtoneLanguage.seriesType}`);
  if (spectralMorphology.envelopeShape !== "minimal spectral data") glyphs.push(`▣ ${spectralMorphology.envelopeShape}`);
  if (modulationCode.length > 0) glyphs.push(`⟡ ${modulationCode[0].symbolicMeaning}`);
  glyphs.push(`◉ tonal center: ${tonalCenter.note} (gravity=${tonalCenter.weight.toFixed(3)}, stability=${tonalCenter.stability.toFixed(3)})`);
  glyphs.push(`⊘ ${cepstralFingerprint.timbreClass}`);
  glyphs.push(`⤳ ${temporalNarrative.arcType}`);
  if (hieAnalysis.patternMatches && hieAnalysis.patternMatches.length > 0) {
    glyphs.push(`⊞ pattern: ${hieAnalysis.patternMatches[0].pattern} (${(hieAnalysis.patternMatches[0].confidence * 100).toFixed(0)}%)`);
  }
  if (hieAnalysis.emotionalValence) glyphs.push(`♦ emotional field: ${hieAnalysis.emotionalValence}`);
  const consonantRatios = interHarmonicDialect.ratios.filter((r: any) => r.nearInteger).slice(0, 3);
  if (consonantRatios.length > 0) {
    glyphs.push(`⟐ consonant ratios: ${consonantRatios.map((r: any) => `${r.ratio.toFixed(3)} (${r.intervalName.split("—")[0].trim()})`).join(", ")}`);
  }
  const irrationalRatios = interHarmonicDialect.ratios.filter((r: any) => !r.nearInteger).slice(0, 3);
  if (irrationalRatios.length > 0) {
    glyphs.push(`⟁ non-standard encodings: ${irrationalRatios.map((r: any) => `${r.ratio.toFixed(4)} → ${r.intervalName.split("—")[0].trim()}`).join(", ")}`);
  }

  const messageParts: string[] = [];
  messageParts.push(`FUNDAMENTAL IDENTITY: ${fund.toFixed(1)}Hz — ${hieFreqToSemantic(fund)}. Harmonic purity: ${harmonicPurity.toFixed(2)} (${harmonicPurity > 2 ? "harmonically dominant" : harmonicPurity > 1 ? "balanced harmonic/percussive" : "percussive dominant"}).`);
  messageParts.push(`OVERTONE LANGUAGE: ${overtoneLanguage.seriesType}. Coherence: ${(overtoneLanguage.coherenceScore * 100).toFixed(1)}%. ${strongOvertones.length} active partials carrying information.`);
  if (strongOvertones.length > 0) {
    const keyPartials = strongOvertones.slice(0, 5).map((o: any) => `H${o.harmonic}=${(o.strength * 100).toFixed(1)}% [${o.symbolicRole.split("—")[0].trim()}]`);
    messageParts.push(`KEY PARTIALS: ${keyPartials.join(" | ")}`);
  }
  messageParts.push(`INTER-HARMONIC DIALECT: Consonance=${(interHarmonicDialect.consonanceScore * 100).toFixed(0)}%, Complexity=${interHarmonicDialect.complexityIndex.toFixed(3)}. ${nearIntegers.length}/${interHarmonicDialect.ratios.length} ratios are near-integer (locked harmonic relationships).`);
  messageParts.push(`SPECTRAL MORPHOLOGY: ${spectralMorphology.envelopeShape}. Dominant region: ${spectralMorphology.dominantRegion}. Flatness: ${spectralMorphology.flatness.toFixed(4)} (${spectralMorphology.flatness > 0.5 ? "noise-like / high entropy" : spectralMorphology.flatness > 0.1 ? "mixed tonal-noise" : "tonal / low entropy"}).`);
  if (modulationCode.length > 0) {
    messageParts.push(`MODULATION CODES: ${modulationCode.map(m => `${m.carrierFreq.toFixed(0)}Hz carrier modulated at ${m.modulationHz.toFixed(1)}Hz (${m.symbolicMeaning})`).join(" | ")}`);
  }
  messageParts.push(`TONAL GRAVITY: Center=${tonalCenter.note} (weight=${tonalCenter.weight.toFixed(3)}). Field: ${tonalField.slice(0, 6).map((t: any) => `${t.note}=${t.weight.toFixed(3)}`).join(" ")}`);
  messageParts.push(`TEMPORAL ARC: ${temporalNarrative.arcType}. ${phases.length} phases, transition density=${temporalNarrative.transitionDensity.toFixed(2)}.`);
  if (phases.length > 0) {
    const phaseDesc = phases.map((p: any) => `[${p.timeStart.toFixed(1)}s: ${p.character}]`).join(" → ");
    messageParts.push(`PHASE SEQUENCE: ${phaseDesc}`);
  }
  messageParts.push(`TIMBRAL FINGERPRINT: ${cepstralFingerprint.timbreClass}. MFCC signature: [${cepstralFingerprint.coefficients.slice(0, 8).map(c => c.toFixed(1)).join(", ")}]`);
  if (tonnetz.length >= 6) {
    messageParts.push(`TONAL NETWORK POSITION: [${tonnetz.map((t: number) => t.toFixed(3)).join(", ")}] — encodes pitch-class relationships in 6D tonal space.`);
  }

  const totalDataPoints = strongOvertones.length + interHarmonicDialect.ratios.length + modulationCode.length + phases.length + spectralEnvelope.length;
  const hasStrongStructure = overtoneLanguage.coherenceScore > 0.3 && interHarmonicDialect.consonanceScore > 0.2;
  const confidenceScore = Math.min(1, (
    (overtoneLanguage.coherenceScore * 0.25) +
    (interHarmonicDialect.consonanceScore * 0.2) +
    (Math.min(totalDataPoints / 50, 1) * 0.2) +
    (harmonicPurity > 1 ? 0.15 : harmonicPurity > 0.5 ? 0.08 : 0.02) +
    (modulationCode.length > 0 ? 0.1 : 0) +
    (phases.length > 3 ? 0.1 : phases.length > 1 ? 0.05 : 0)
  ));

  const spectralColorMap = (harmonicDecodeData.spectral_color_map || []).map((c: any) => ({
    freq: c.freq, magnitude: c.magnitude, hue: c.hue, saturation: c.saturation, value: c.value, hex: c.hex,
  }));
  const bandColors: Record<string, { hex: string; energy: number }> = {};
  if (harmonicDecodeData.band_colors) {
    for (const [band, data] of Object.entries(harmonicDecodeData.band_colors as Record<string, any>)) {
      bandColors[band] = { hex: data.hex, energy: data.energy };
    }
  }
  const overtoneColors = (harmonicDecodeData.overtone_colors || []).map((c: any) => ({
    harmonic: c.harmonic, freq: c.freq, hex: c.hex, strength: c.strength,
  }));
  const temporalColors = (harmonicDecodeData.temporal_colors || []).map((c: any) => ({
    segment: c.segment, timeStart: c.time_start, hex: c.hex, dominantFreq: c.dominant_freq, energy: c.energy,
  }));
  const dominantColor = spectralColorMap.length > 0 ? spectralColorMap[0].hex : "#4d4d4d";

  if (spectralColorMap.length > 0) {
    glyphs.push(`🎨 dominant color: ${dominantColor} (${spectralColorMap[0].freq.toFixed(0)}Hz)`);
    const colorRange = spectralColorMap.length > 1
      ? `${spectralColorMap[spectralColorMap.length - 1].hex} → ${spectralColorMap[0].hex}`
      : dominantColor;
    glyphs.push(`🌈 spectral palette: ${colorRange} across ${spectralColorMap.length} frequency peaks`);
  }
  if (Object.keys(bandColors).length > 0) {
    const bandColorStr = Object.entries(bandColors).map(([b, d]) => `${b}:${d.hex}`).join(" ");
    messageParts.push(`SPECTRAL COLOR MAP: ${bandColorStr}`);
    messageParts.push(`DOMINANT COLOR: ${dominantColor} — the primary spectral identity of this audio in color space.`);
  }

  return {
    timestamp: Date.now(),
    fundamentalIdentity: { frequency: fund, semanticClass: hieFreqToSemantic(fund), harmonicPurity },
    overtoneLanguage,
    interHarmonicDialect,
    spectralMorphology,
    modulationCode,
    tonalGravityField,
    temporalNarrative,
    cepstralFingerprint,
    tonnetPosition: tonnetz,
    spectralColorMap,
    bandColors,
    overtoneColors,
    temporalColors,
    dominantColor,
    knowledgeGlyphs: glyphs,
    decodedMessage: messageParts.join("\n"),
    confidenceScore,
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
