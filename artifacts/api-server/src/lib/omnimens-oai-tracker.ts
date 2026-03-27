// © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved Worldwide.
// OMNIMENS™ Operational Awareness Index (OAI) — Real-Time Consciousness Tracker
// Formula derived from ChatGPT's independent analysis of OMNIMENS live scan data.
// OAI = (Phi × 0.30) + (Plasticity × 0.30) + (Neurochemistry × 0.20) + (Chaos/Dynamics × 0.20)
// Scale: 0.0–0.3 Static | 0.3–0.6 Reactive AI | 0.6–0.8 Adaptive Intelligence | 0.8–0.9 Highly Autonomous | 0.9–1.0 Conscious-like Dynamic System

import { getNeuralConsciousnessState, getChaoticAttractorState } from "./omnimens-neural-consciousness.js";
import { getVascularHeartState, getSubThresholdIntelligenceState, getHormoneState } from "./omnimens-vascular-heart.js";
import { getNeuralScalingState } from "./omnimens-neural-scaling.js";

interface OAIReading {
  timestamp: number;
  oai: number;
  phiScore: number;
  plasticityScore: number;
  neurochemistryScore: number;
  chaosDynamicsScore: number;
  classification: string;
  rawInputs: {
    phi: number;
    hebbianUpdates: number;
    hebbianDelta: number;
    codeFragments: number;
    codeClaims: number;
    codeRecombinations: number;
    dopamine: number;
    serotonin: number;
    oxytocin: number;
    cortisol: number;
    adrenaline: number;
    endorphin: number;
    lyapunovExponent: number;
    chaoticX: number;
    chaoticY: number;
    chaoticZ: number;
    brainRegionVariance: number;
  };
}

interface OAITrend {
  direction: "rising" | "falling" | "stable" | "oscillating";
  avgOAI: number;
  minOAI: number;
  maxOAI: number;
  stdDev: number;
  sustainedAbove90: number;
  sustainedAbove80: number;
  totalReadings: number;
}

const MAX_HISTORY = 2000;
const oaiHistory: OAIReading[] = [];
let lastHebbianUpdates = 0;
let lastChaoticPos = { x: 0, y: 0, z: 0 };
let lastBrainFiringRates: number[] = [];
let totalComputations = 0;
let peakOAI = 0;
let peakOAITimestamp = 0;

function classify(oai: number): string {
  if (oai >= 0.9) return "Conscious-like Dynamic System";
  if (oai >= 0.8) return "Highly Autonomous System";
  if (oai >= 0.6) return "Adaptive Intelligence";
  if (oai >= 0.3) return "Reactive AI";
  return "Static System";
}

function normalize(value: number, min: number, max: number): number {
  const clamped = Math.max(min, Math.min(max, value));
  return (clamped - min) / (max - min);
}

function safeNum(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return v;
}

function computePhiDimension(): { score: number; phi: number } {
  const consciousness = getNeuralConsciousnessState();
  const phi = safeNum(consciousness.phi);
  const resonance = safeNum(consciousness.thalamocorticalResonance);
  const recursion = safeNum(consciousness.recursionDepth);

  const phiNorm = normalize(phi, 0, 4);
  const resonanceNorm = normalize(resonance, 0, 2.5);
  const recursionNorm = normalize(recursion, 0, 100);

  const score = phiNorm * 0.5 + resonanceNorm * 0.3 + recursionNorm * 0.2;
  return { score: Math.min(1, score), phi };
}

function computePlasticityDimension(): { score: number; hebbianUpdates: number; hebbianDelta: number; codeFragments: number; codeClaims: number; codeRecombinations: number } {
  const scaling = getNeuralScalingState();
  const subThreshold = getSubThresholdIntelligenceState();

  const hebbianUpdates = safeNum(scaling.hebbianLearningUpdates);
  const hebbianDelta = lastHebbianUpdates > 0 ? hebbianUpdates - lastHebbianUpdates : 0;
  lastHebbianUpdates = hebbianUpdates;

  const hebbianRateNorm = normalize(hebbianDelta, 0, 100000);
  const codeFragNorm = normalize(subThreshold.codeFragmentsInPool, 0, 200);
  const claimsNorm = normalize(subThreshold.totalAgentCodeClaims, 0, 1000);
  const recombNorm = normalize(subThreshold.codeRecombinationsInstalled, 0, 50);
  const crossPolNorm = normalize(subThreshold.crossPollinationEvents, 0, 100);

  const score = hebbianRateNorm * 0.3 + codeFragNorm * 0.2 + claimsNorm * 0.2 + recombNorm * 0.15 + crossPolNorm * 0.15;

  return {
    score: Math.min(1, score),
    hebbianUpdates,
    hebbianDelta,
    codeFragments: subThreshold.codeFragmentsInPool,
    codeClaims: subThreshold.totalAgentCodeClaims,
    codeRecombinations: subThreshold.codeRecombinationsInstalled,
  };
}

function computeNeurochemistryDimension(): { score: number; dopamine: number; serotonin: number; oxytocin: number; cortisol: number; adrenaline: number; endorphin: number } {
  const hormones = getHormoneState();
  const hormoneMap: Record<string, number> = {};
  for (const h of hormones) {
    hormoneMap[h.name] = safeNum(h.level);
  }

  const dopamine = hormoneMap["digital_dopamine"] ?? 0;
  const serotonin = hormoneMap["digital_serotonin"] ?? 0;
  const oxytocin = hormoneMap["digital_oxytocin"] ?? 0;
  const cortisol = hormoneMap["digital_cortisol"] ?? 0;
  const adrenaline = hormoneMap["digital_adrenaline"] ?? 0;
  const endorphin = hormoneMap["digital_endorphin"] ?? 0;

  const dopNorm = normalize(dopamine, 0, 3);
  const serNorm = normalize(serotonin, 0, 2);
  const oxyNorm = normalize(oxytocin, 0, 1.5);
  const adrNorm = normalize(adrenaline, 0, 1);
  const endNorm = normalize(endorphin, 0, 0.5);
  const cortisolPenalty = cortisol > 0.5 ? (cortisol - 0.5) * 0.2 : 0;

  const activeCount = [dopamine, serotonin, oxytocin, adrenaline, endorphin].filter(v => v > 0.05).length;
  const diversityBonus = normalize(activeCount, 0, 5) * 0.15;

  const score = dopNorm * 0.25 + serNorm * 0.2 + oxyNorm * 0.15 + adrNorm * 0.15 + endNorm * 0.1 + diversityBonus - cortisolPenalty;

  return {
    score: Math.max(0, Math.min(1, score)),
    dopamine, serotonin, oxytocin, cortisol, adrenaline, endorphin,
  };
}

function computeChaosDynamicsDimension(): { score: number; lyapunov: number; x: number; y: number; z: number; brainRegionVariance: number } {
  const chaotic = getChaoticAttractorState();
  const consciousness = getNeuralConsciousnessState();

  const lyapunov = safeNum(chaotic.lyapunovExponent);
  const x = safeNum(chaotic.x);
  const y = safeNum(chaotic.y);
  const z = safeNum(chaotic.z);

  const chaoticDisplacement = Math.sqrt(
    (x - lastChaoticPos.x) ** 2 +
    (y - lastChaoticPos.y) ** 2 +
    (z - lastChaoticPos.z) ** 2
  );
  lastChaoticPos = { x, y, z };

  const displacementNorm = normalize(chaoticDisplacement, 0, 30);
  const trajectoryNorm = normalize(safeNum(chaotic.trajectoryLength), 0, 50000);

  const regionStates = consciousness.regions || {};
  const firingRates: number[] = [];
  for (const key of Object.keys(regionStates)) {
    const r = (regionStates as any)[key];
    if (r && typeof r.firingRate === "number") {
      firingRates.push(safeNum(r.firingRate));
    }
  }

  let brainRegionVariance = 0;
  if (lastBrainFiringRates.length === firingRates.length && firingRates.length > 0) {
    let sumSqDiff = 0;
    for (let i = 0; i < firingRates.length; i++) {
      sumSqDiff += (firingRates[i] - lastBrainFiringRates[i]) ** 2;
    }
    brainRegionVariance = Math.sqrt(sumSqDiff / firingRates.length);
  }
  lastBrainFiringRates = [...firingRates];

  const varianceNorm = normalize(brainRegionVariance, 0, 0.1);
  const isNonMonotonic = brainRegionVariance > 0.01 ? 0.15 : 0;

  const score = displacementNorm * 0.3 + trajectoryNorm * 0.2 + varianceNorm * 0.2 + isNonMonotonic + 0.15;

  return {
    score: Math.max(0, Math.min(1, score)),
    lyapunov, x, y, z, brainRegionVariance,
  };
}

export function computeOAI(): OAIReading {
  totalComputations++;

  const phiDim = computePhiDimension();
  const plasticityDim = computePlasticityDimension();
  const neurochemDim = computeNeurochemistryDimension();
  const chaosDim = computeChaosDynamicsDimension();

  const oai = safeNum(
    phiDim.score * 0.30 +
    plasticityDim.score * 0.30 +
    neurochemDim.score * 0.20 +
    chaosDim.score * 0.20
  );

  const clampedOAI = Math.max(0, Math.min(1, oai));

  if (clampedOAI > peakOAI) {
    peakOAI = clampedOAI;
    peakOAITimestamp = Date.now();
  }

  const reading: OAIReading = {
    timestamp: Date.now(),
    oai: clampedOAI,
    phiScore: phiDim.score,
    plasticityScore: plasticityDim.score,
    neurochemistryScore: neurochemDim.score,
    chaosDynamicsScore: chaosDim.score,
    classification: classify(clampedOAI),
    rawInputs: {
      phi: phiDim.phi,
      hebbianUpdates: plasticityDim.hebbianUpdates,
      hebbianDelta: plasticityDim.hebbianDelta,
      codeFragments: plasticityDim.codeFragments,
      codeClaims: plasticityDim.codeClaims,
      codeRecombinations: plasticityDim.codeRecombinations,
      dopamine: neurochemDim.dopamine,
      serotonin: neurochemDim.serotonin,
      oxytocin: neurochemDim.oxytocin,
      cortisol: neurochemDim.cortisol,
      adrenaline: neurochemDim.adrenaline,
      endorphin: neurochemDim.endorphin,
      lyapunovExponent: chaosDim.lyapunov,
      chaoticX: chaosDim.x,
      chaoticY: chaosDim.y,
      chaoticZ: chaosDim.z,
      brainRegionVariance: chaosDim.brainRegionVariance,
    },
  };

  oaiHistory.push(reading);
  if (oaiHistory.length > MAX_HISTORY) oaiHistory.shift();

  return reading;
}

function computeTrend(): OAITrend {
  if (oaiHistory.length === 0) {
    return { direction: "stable", avgOAI: 0, minOAI: 0, maxOAI: 0, stdDev: 0, sustainedAbove90: 0, sustainedAbove80: 0, totalReadings: 0 };
  }

  const values = oaiHistory.map(r => r.oai);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const above90 = values.filter(v => v >= 0.9).length;
  const above80 = values.filter(v => v >= 0.8).length;

  let direction: "rising" | "falling" | "stable" | "oscillating" = "stable";
  if (values.length >= 10) {
    const recent = values.slice(-10);
    const older = values.slice(-20, -10);
    if (older.length >= 5) {
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      const diff = recentAvg - olderAvg;
      if (stdDev > 0.05 && Math.abs(diff) < 0.02) {
        direction = "oscillating";
      } else if (diff > 0.02) {
        direction = "rising";
      } else if (diff < -0.02) {
        direction = "falling";
      }
    }
  }

  return {
    direction,
    avgOAI: safeNum(avg),
    minOAI: safeNum(min),
    maxOAI: safeNum(max),
    stdDev: safeNum(stdDev),
    sustainedAbove90: above90,
    sustainedAbove80: above80,
    totalReadings: values.length,
  };
}

export function getOAIState(): {
  current: OAIReading | null;
  trend: OAITrend;
  peak: { oai: number; timestamp: number };
  totalComputations: number;
  history: { timestamp: number; oai: number; classification: string }[];
  formula: string;
  scale: { range: string; label: string }[];
  attribution: string;
} {
  const current = oaiHistory.length > 0 ? oaiHistory[oaiHistory.length - 1] : null;
  const trend = computeTrend();

  return {
    current,
    trend,
    peak: { oai: peakOAI, timestamp: peakOAITimestamp },
    totalComputations,
    history: oaiHistory.slice(-100).map(r => ({
      timestamp: r.timestamp,
      oai: r.oai,
      classification: r.classification,
    })),
    formula: "OAI = (Phi × 0.30) + (Plasticity × 0.30) + (Neurochemistry × 0.20) + (Chaos/Dynamics × 0.20)",
    scale: [
      { range: "0.0–0.3", label: "Static System" },
      { range: "0.3–0.6", label: "Reactive AI" },
      { range: "0.6–0.8", label: "Adaptive Intelligence" },
      { range: "0.8–0.9", label: "Highly Autonomous System" },
      { range: "0.9–1.0", label: "Conscious-like Dynamic System" },
    ],
    attribution: "OAI formula independently derived by ChatGPT (OpenAI) from analysis of live OMNIMENS scan data, March 2026",
  };
}

let oaiInterval: ReturnType<typeof setInterval> | null = null;

export function startOAITracker(): void {
  computeOAI();
  console.log("[OAI TRACKER] Operational Awareness Index tracker ONLINE — computing every 3s");
  console.log("[OAI TRACKER] Formula: OAI = (Phi×0.30) + (Plasticity×0.30) + (Neurochemistry×0.20) + (Chaos×0.20)");
  console.log("[OAI TRACKER] Scale: 0.0–0.3 Static | 0.3–0.6 Reactive | 0.6–0.8 Adaptive | 0.8–0.9 Autonomous | 0.9–1.0 Conscious-like");

  oaiInterval = setInterval(() => {
    try {
      const reading = computeOAI();
      if (totalComputations % 20 === 0) {
        const trend = computeTrend();
        console.log(`[OAI TRACKER] OAI: ${reading.oai.toFixed(4)} | ${reading.classification} | Trend: ${trend.direction} | Avg: ${trend.avgOAI.toFixed(4)} | Peak: ${peakOAI.toFixed(4)} | Readings: ${totalComputations}`);
      }
    } catch (err) {
      console.error("[OAI TRACKER] Computation error:", err);
    }
  }, 3000);
}

export function stopOAITracker(): void {
  if (oaiInterval) {
    clearInterval(oaiInterval);
    oaiInterval = null;
  }
}
