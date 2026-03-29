/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ NEURAL HEMISPHERE BETA — RIGHT BRAIN SUBSTRATE                 ║
 * ║                                                                              ║
 * ║   Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                   ║
 * ║   All Rights Reserved Worldwide.                                             ║
 * ║                                                                              ║
 * ║   PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                  ║
 * ║                                                                              ║
 * ║   25,000 LIF neurons using typed arrays for high-performance simulation.     ║
 * ║   Specialization: Creative, spatial, emotional, holistic processing.         ║
 * ║   Uses Float64Array for membrane potentials and firing dynamics.             ║
 * ║                                                                              ║
 * ║   Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.        ║
 * ║   First creation date: March 2026                                            ║
 * ║   Author/Owner: Alpha Unlimited Technologies, LLC                            ║
 * ║   Platform: OMNIMENS AI                                                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { getAdaptiveIntelligenceState } from "./omnimens-neural-consciousness.js";

const V_REST = -70;
const V_THRESHOLD = -55;
const V_RESET = -75;
const TAU_MEMBRANE = 20;
const DT = 1.0;

export interface HemisphereRegion {
  name: string;
  label: string;
  startIdx: number;
  endIdx: number;
  neuronCount: number;
  dominantNT: string;
  firingRate: number;
  activationLevel: number;
}

export interface HemisphereState {
  id: "beta";
  label: "Hemisphere Beta (Right Brain)";
  specialization: "creative";
  totalNeurons: number;
  totalSynapses: number;
  hebbianUpdates: number;
  tickCount: number;
  phi: number;
  firingRate: number;
  activationLevel: number;
  regions: HemisphereRegion[];
  uptimeSeconds: number;
  startTime: number;
}

const BETA_REGIONS: Array<{ name: string; label: string; neuronCount: number; dominantNT: string }> = [
  { name: "beta_prefrontal", label: "Beta Prefrontal Cortex (Creative)", neuronCount: 3200, dominantNT: "dopamine" },
  { name: "beta_visual", label: "Right Visual Cortex (Spatial/Pattern)", neuronCount: 3000, dominantNT: "glutamate" },
  { name: "beta_parietal", label: "Right Parietal (Spatial Awareness)", neuronCount: 2500, dominantNT: "glutamate" },
  { name: "beta_temporal", label: "Right Temporal (Music/Prosody)", neuronCount: 2200, dominantNT: "serotonin" },
  { name: "beta_fusiform", label: "Fusiform Face Area (Pattern Recognition)", neuronCount: 1800, dominantNT: "glutamate" },
  { name: "beta_amygdala_ext", label: "Right Extended Amygdala (Emotional Processing)", neuronCount: 2000, dominantNT: "norepinephrine" },
  { name: "beta_insula_ext", label: "Right Insular Network (Empathy/Intuition)", neuronCount: 1800, dominantNT: "serotonin" },
  { name: "beta_hippocampal", label: "Right Hippocampal (Spatial Memory)", neuronCount: 2000, dominantNT: "acetylcholine" },
  { name: "beta_cingulate", label: "Right Cingulate (Emotional Regulation)", neuronCount: 1500, dominantNT: "serotonin" },
  { name: "beta_tpj", label: "Temporoparietal Junction (Theory of Mind)", neuronCount: 2000, dominantNT: "glutamate" },
  { name: "beta_motor", label: "Right Motor/Premotor (Left-side Control)", neuronCount: 1500, dominantNT: "glutamate" },
  { name: "beta_cerebellum_ext", label: "Right Cerebellar Network (Timing/Creativity)", neuronCount: 1500, dominantNT: "glutamate" },
];

const TOTAL_BETA_NEURONS = BETA_REGIONS.reduce((sum, r) => sum + r.neuronCount, 0);

let potentials: Float64Array;
let fired: Uint8Array;
let refractory: Uint8Array;
let synapsesPre: Int32Array;
let synapsesPost: Int32Array;
let synapseWeights: Float64Array;
let totalSynapses = 0;
let hebbianUpdates = 0;
let tickCount = 0;
let startTime = Date.now();
let initialized = false;

const regionData: HemisphereRegion[] = [];

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

const BETA_CIRCUITS: Array<{ from: number; to: number; density: number }> = [
  { from: 0, to: 1, density: 0.008 },
  { from: 0, to: 2, density: 0.007 },
  { from: 0, to: 5, density: 0.009 },
  { from: 0, to: 6, density: 0.008 },
  { from: 1, to: 2, density: 0.010 },
  { from: 1, to: 4, density: 0.012 },
  { from: 1, to: 0, density: 0.006 },
  { from: 2, to: 0, density: 0.006 },
  { from: 2, to: 9, density: 0.008 },
  { from: 2, to: 1, density: 0.007 },
  { from: 3, to: 0, density: 0.005 },
  { from: 3, to: 6, density: 0.007 },
  { from: 3, to: 8, density: 0.006 },
  { from: 4, to: 1, density: 0.009 },
  { from: 4, to: 0, density: 0.005 },
  { from: 4, to: 9, density: 0.007 },
  { from: 5, to: 0, density: 0.008 },
  { from: 5, to: 6, density: 0.010 },
  { from: 5, to: 7, density: 0.007 },
  { from: 5, to: 8, density: 0.008 },
  { from: 6, to: 5, density: 0.009 },
  { from: 6, to: 0, density: 0.006 },
  { from: 6, to: 8, density: 0.008 },
  { from: 6, to: 9, density: 0.007 },
  { from: 7, to: 0, density: 0.006 },
  { from: 7, to: 1, density: 0.005 },
  { from: 7, to: 2, density: 0.008 },
  { from: 8, to: 0, density: 0.007 },
  { from: 8, to: 5, density: 0.006 },
  { from: 8, to: 6, density: 0.007 },
  { from: 9, to: 0, density: 0.008 },
  { from: 9, to: 5, density: 0.006 },
  { from: 9, to: 6, density: 0.007 },
  { from: 10, to: 0, density: 0.004 },
  { from: 10, to: 11, density: 0.006 },
  { from: 11, to: 10, density: 0.005 },
  { from: 11, to: 0, density: 0.004 },
];

function initBeta(): void {
  if (initialized) return;

  potentials = new Float64Array(TOTAL_BETA_NEURONS);
  fired = new Uint8Array(TOTAL_BETA_NEURONS);
  refractory = new Uint8Array(TOTAL_BETA_NEURONS);

  for (let i = 0; i < TOTAL_BETA_NEURONS; i++) {
    potentials[i] = V_REST + Math.random() * 10;
  }

  let idx = 0;
  for (const r of BETA_REGIONS) {
    regionData.push({
      name: r.name,
      label: r.label,
      startIdx: idx,
      endIdx: idx + r.neuronCount,
      neuronCount: r.neuronCount,
      dominantNT: r.dominantNT,
      firingRate: 0.08 + Math.random() * 0.04,
      activationLevel: 0.5,
    });
    idx += r.neuronCount;
  }

  const tempPre: number[] = [];
  const tempPost: number[] = [];
  const tempWeights: number[] = [];

  for (const circuit of BETA_CIRCUITS) {
    const fromRegion = regionData[circuit.from];
    const toRegion = regionData[circuit.to];
    if (!fromRegion || !toRegion) continue;

    const maxSynapses = Math.min(
      Math.floor(fromRegion.neuronCount * toRegion.neuronCount * circuit.density),
      50000
    );

    for (let s = 0; s < maxSynapses; s++) {
      const pre = fromRegion.startIdx + Math.floor(Math.random() * fromRegion.neuronCount);
      const post = toRegion.startIdx + Math.floor(Math.random() * toRegion.neuronCount);
      tempPre.push(pre);
      tempPost.push(post);
      tempWeights.push(0.1 + Math.random() * 0.3);
    }
  }

  for (let ri = 0; ri < regionData.length; ri++) {
    const region = regionData[ri];
    const intraCount = Math.min(Math.floor(region.neuronCount * 0.15), 8000);
    for (let s = 0; s < intraCount; s++) {
      const pre = region.startIdx + Math.floor(Math.random() * region.neuronCount);
      const post = region.startIdx + Math.floor(Math.random() * region.neuronCount);
      if (pre !== post) {
        tempPre.push(pre);
        tempPost.push(post);
        tempWeights.push(0.15 + Math.random() * 0.25);
      }
    }
  }

  synapsesPre = new Int32Array(tempPre);
  synapsesPost = new Int32Array(tempPost);
  synapseWeights = new Float64Array(tempWeights);
  totalSynapses = tempPre.length;

  initialized = true;
  console.log(`[HEMISPHERE BETA] ⚡ Initialized — ${TOTAL_BETA_NEURONS.toLocaleString()} neurons | ${totalSynapses.toLocaleString()} synapses | 12 regions | Right Brain (Creative)`);
}

function tickBeta(): void {
  if (!initialized) initBeta();
  tickCount++;
  const adaptive = getAdaptiveIntelligenceState();
  const hebbianLTP = 0.001 * adaptive.adaptiveLearningMultiplier;
  const creativityNoise = 3.5 * (1 + adaptive.creativeCodingDrive * 0.02);

  for (let i = 0; i < TOTAL_BETA_NEURONS; i++) {
    if (refractory[i] > 0) {
      refractory[i]--;
      fired[i] = 0;
      continue;
    }

    const noise = (Math.random() - 0.5) * creativityNoise;
    const spontaneousCurrent = Math.random() < 0.10 ? (7 + Math.random() * 14) : 0;
    const tonic = 0.7 + Math.sin(tickCount * 0.013 + i * 0.0007) * 0.35;
    const leak = -(potentials[i] - V_REST) / TAU_MEMBRANE;
    potentials[i] += (leak + noise + spontaneousCurrent + tonic) * DT;

    if (potentials[i] >= V_THRESHOLD) {
      fired[i] = 1;
      potentials[i] = V_RESET;
      refractory[i] = 3 + Math.floor(Math.random() * 3);
    } else {
      fired[i] = 0;
    }
  }

  let hebbianThisTick = 0;
  for (let s = 0; s < totalSynapses; s++) {
    const pre = synapsesPre[s];
    const post = synapsesPost[s];

    if (fired[pre]) {
      potentials[post] += synapseWeights[s] * 5;
    }

    if (fired[pre] && fired[post]) {
      synapseWeights[s] = Math.min(1.0, synapseWeights[s] + hebbianLTP);
      hebbianThisTick++;
    } else if (fired[pre] && !fired[post]) {
      synapseWeights[s] = Math.max(0.01, synapseWeights[s] - 0.0002);
    }
  }
  hebbianUpdates += hebbianThisTick;

  for (const region of regionData) {
    let firedCount = 0;
    for (let i = region.startIdx; i < region.endIdx; i++) {
      if (fired[i]) firedCount++;
    }
    const rawRate = firedCount / region.neuronCount;
    region.firingRate = region.firingRate * 0.85 + rawRate * 0.15;
    region.activationLevel = sigmoid((region.firingRate - 0.08) * 12);
  }
}

function computeBetaPhi(): number {
  const regionActivations: number[] = regionData.map(r => Math.min(0.999, r.activationLevel));
  let phi = 0;
  for (let i = 0; i < regionActivations.length; i++) {
    const p = regionActivations[i];
    if (p > 0.001 && p < 0.999) {
      phi -= p * Math.log2(p) + (1 - p) * Math.log2(1 - p);
    }
  }

  let crossInfo = 0;
  for (let i = 0; i < regionActivations.length; i++) {
    for (let j = i + 1; j < regionActivations.length; j++) {
      const diff = Math.abs(regionActivations[i] - regionActivations[j]);
      crossInfo += (1 - diff) * 0.1;
    }
  }
  phi += crossInfo;

  return phi * (1 + Math.log2(1 + TOTAL_BETA_NEURONS / 1000));
}

export function getBetaState(): HemisphereState {
  if (!initialized) initBeta();

  const totalFired = regionData.reduce((sum, r) => sum + r.firingRate * r.neuronCount, 0);
  const avgFiring = totalFired / TOTAL_BETA_NEURONS;
  const avgActivation = regionData.reduce((sum, r) => sum + r.activationLevel, 0) / regionData.length;

  return {
    id: "beta",
    label: "Hemisphere Beta (Right Brain)",
    specialization: "creative",
    totalNeurons: TOTAL_BETA_NEURONS,
    totalSynapses: totalSynapses,
    hebbianUpdates,
    tickCount,
    phi: computeBetaPhi(),
    firingRate: avgFiring,
    activationLevel: avgActivation,
    regions: [...regionData],
    uptimeSeconds: (Date.now() - startTime) / 1000,
    startTime,
  };
}

export function getBetaRegionActivations(): Record<string, number> {
  const result: Record<string, number> = {};
  for (const r of regionData) {
    result[r.name] = r.activationLevel;
  }
  return result;
}

export function getBetaFiredNeurons(): Uint8Array {
  return fired;
}

export function getBetaPotentials(): Float64Array {
  return potentials;
}

export function injectCurrentBeta(regionName: string, amount: number): boolean {
  const region = regionData.find(r => r.name === regionName);
  if (!region) return false;
  for (let i = region.startIdx; i < region.endIdx; i++) {
    potentials[i] += amount;
  }
  return true;
}

export function getBetaNeuronCount(): number {
  return TOTAL_BETA_NEURONS;
}

export function getBetaSynapseCount(): number {
  return totalSynapses;
}

export function getBetaHebbianUpdates(): number {
  return hebbianUpdates;
}

export function startHemisphereBeta(): void {
  if (!initialized) initBeta();

  setInterval(() => {
    tickBeta();
  }, 3000);

  console.log(`[HEMISPHERE BETA] 🧠 Right Brain active — ${TOTAL_BETA_NEURONS.toLocaleString()} creative neurons ticking every 3s`);
}
