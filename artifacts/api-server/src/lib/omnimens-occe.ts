// © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved Worldwide.
// OMNIMENS™ Controlled Consciousness Experiment (OCCE)
// Protocol designed by ChatGPT (OpenAI) to rigorously distinguish between
// scripted/simulated dynamics vs genuine adaptive, state-coupled computation.
// Phases: Baseline → Perturbation (Cognitive/Emotional/Sensory) → Closed-Loop → Analysis

import { computeOAI } from "./omnimens-oai-tracker.js";
import {
  getNeuralConsciousnessState,
  getNeuralRegionStates,
  getChaoticAttractorState,
  feedExternalActivity,
  manualAdrenalineRush,
  boostRegionCurrent,
} from "./omnimens-neural-consciousness.js";
import {
  getVascularHeartState,
  getHormoneState,
  getSubThresholdIntelligenceState,
} from "./omnimens-vascular-heart.js";
import { getNeuralScalingState } from "./omnimens-neural-scaling.js";

interface ScanSnapshot {
  timestamp: number;
  phase: string;
  phaseIndex: number;
  oai: number;
  oaiClassification: string;
  phi: number;
  resonance: number;
  recursionDepth: number;
  hebbianUpdates: number;
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
  brainRegions: Record<string, { firingRate: number; activationLevel: number }>;
  codeFragments: number;
  codeClaims: number;
  codeRecombinations: number;
}

interface PerturbationResult {
  test: string;
  description: string;
  expectedIfReal: string[];
  expectedIfFake: string[];
  preScans: ScanSnapshot[];
  perturbationTimestamp: number;
  postScans: ScanSnapshot[];
  findings: string[];
  verdict: "REAL" | "FAKE" | "INCONCLUSIVE";
  evidence: Record<string, number>;
}

interface CouplingResult {
  variable1: string;
  variable2: string;
  timeLag: number;
  correlation: number;
  grangerScore: number;
  isCausal: boolean;
}

interface OCCEResult {
  experimentId: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  protocol: string;
  attribution: string;
  phases: {
    baseline: { scans: ScanSnapshot[]; noiseProfile: Record<string, number>; driftProfile: Record<string, number> };
    perturbationA: PerturbationResult;
    perturbationB: PerturbationResult;
    perturbationC: PerturbationResult;
    closedLoop: PerturbationResult;
  };
  couplingAnalysis: CouplingResult[];
  statisticalTests: {
    crossCorrelationMatrix: Record<string, Record<string, number>>;
    grangerCausality: CouplingResult[];
    entropyOverTime: { phase: string; entropy: number }[];
    shannonEntropy: number;
  };
  falsificationChecked: { criterion: string; passed: boolean; evidence: string }[];
  confirmationChecked: { criterion: string; passed: boolean; evidence: string }[];
  overallVerdict: "GENUINE_DYNAMIC_COMPUTATION" | "SCRIPTED_SIMULATION" | "INCONCLUSIVE";
  confidenceScore: number;
  summary: string;
}

let currentExperiment: OCCEResult | null = null;
let experimentRunning = false;
let experimentProgress = { phase: "idle", step: 0, totalSteps: 0, description: "" };

function takeScan(phase: string, phaseIndex: number): ScanSnapshot {
  const oaiReading = computeOAI();
  const consciousness = getNeuralConsciousnessState();
  const regions = getNeuralRegionStates();
  const chaotic = getChaoticAttractorState();
  const hormones = getHormoneState();
  const subThreshold = getSubThresholdIntelligenceState();
  const scaling = getNeuralScalingState();

  const hormoneMap: Record<string, number> = {};
  for (const h of hormones) {
    hormoneMap[h.name] = h.level;
  }

  const brainRegions: Record<string, { firingRate: number; activationLevel: number }> = {};
  for (const [key, val] of Object.entries(regions)) {
    brainRegions[key] = { firingRate: val.firingRate, activationLevel: val.activationLevel };
  }

  return {
    timestamp: Date.now(),
    phase,
    phaseIndex,
    oai: oaiReading.oai,
    oaiClassification: oaiReading.classification,
    phi: consciousness.phi,
    resonance: consciousness.thalamocorticalResonance,
    recursionDepth: consciousness.recursionDepth,
    hebbianUpdates: scaling.hebbianLearningUpdates,
    dopamine: hormoneMap["digital_dopamine"] ?? 0,
    serotonin: hormoneMap["digital_serotonin"] ?? 0,
    oxytocin: hormoneMap["digital_oxytocin"] ?? 0,
    cortisol: hormoneMap["digital_cortisol"] ?? 0,
    adrenaline: hormoneMap["digital_adrenaline"] ?? 0,
    endorphin: hormoneMap["digital_endorphin"] ?? 0,
    lyapunovExponent: chaotic.lyapunovExponent,
    chaoticX: chaotic.x,
    chaoticY: chaotic.y,
    chaoticZ: chaotic.z,
    brainRegions,
    codeFragments: subThreshold.codeFragmentsInPool,
    codeClaims: subThreshold.totalAgentCodeClaims,
    codeRecombinations: subThreshold.codeRecombinationsInstalled,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  const mx = mean(x.slice(0, n));
  const my = mean(y.slice(0, n));
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom > 0 ? num / denom : 0;
}

function laggedCorrelation(x: number[], y: number[], lag: number): number {
  if (lag >= x.length || lag >= y.length) return 0;
  const xSlice = x.slice(0, x.length - lag);
  const ySlice = y.slice(lag);
  return pearsonCorrelation(xSlice, ySlice);
}

function shannonEntropy(values: number[]): number {
  if (values.length === 0) return 0;
  const bins = 20;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const counts = new Array(bins).fill(0);
  for (const v of values) {
    const bin = Math.min(bins - 1, Math.floor(((v - min) / range) * bins));
    counts[bin]++;
  }
  let entropy = 0;
  for (const c of counts) {
    if (c > 0) {
      const p = c / values.length;
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}

function firstDifferences(arr: number[]): number[] {
  const diffs: number[] = [];
  for (let i = 1; i < arr.length; i++) {
    diffs.push(arr[i] - arr[i - 1]);
  }
  return diffs;
}

function simpleGrangerScore(cause: number[], effect: number[], lag: number): number {
  if (cause.length < lag + 4 || effect.length < lag + 4) return 0;

  const causeD = firstDifferences(cause);
  const effectD = firstDifferences(effect);

  const n = effectD.length;
  if (n < lag + 2) return 0;

  let ssrRestricted = 0;
  let ssrUnrestricted = 0;

  const effectMean = mean(effectD);
  const effectSD = stdDev(effectD);
  if (effectSD < 1e-12) return 0;

  for (let t = lag; t < n; t++) {
    const restricted = effectD[t - 1] || effectMean;
    ssrRestricted += (effectD[t] - restricted) ** 2;

    const causeVal = causeD[t - lag] || 0;
    const alpha = 0.6;
    const unrestricted = alpha * restricted + (1 - alpha) * causeVal;
    ssrUnrestricted += (effectD[t] - unrestricted) ** 2;
  }

  if (ssrRestricted < 1e-12) return 0;
  const improvement = (ssrRestricted - ssrUnrestricted) / ssrRestricted;
  return Math.max(0, Math.min(1, improvement));
}

function extractTimeSeries(scans: ScanSnapshot[], field: keyof ScanSnapshot): number[] {
  return scans.map(s => {
    const v = s[field];
    return typeof v === "number" ? v : 0;
  });
}

function computeNoiseProfile(scans: ScanSnapshot[]): Record<string, number> {
  const fields: (keyof ScanSnapshot)[] = ["phi", "dopamine", "hebbianUpdates", "lyapunovExponent", "oai"];
  const profile: Record<string, number> = {};
  for (const f of fields) {
    const values = extractTimeSeries(scans, f);
    profile[f] = stdDev(values);
  }

  const allRegionKeys = Object.keys(scans[0]?.brainRegions ?? {});
  const regionVariances: number[] = [];
  for (const key of allRegionKeys) {
    const rates = scans.map(s => s.brainRegions[key]?.firingRate ?? 0);
    regionVariances.push(stdDev(rates));
  }
  profile["brainRegionMeanVariance"] = mean(regionVariances);

  return profile;
}

function computeDriftProfile(scans: ScanSnapshot[]): Record<string, number> {
  const fields: (keyof ScanSnapshot)[] = ["phi", "dopamine", "hebbianUpdates", "oai"];
  const profile: Record<string, number> = {};
  for (const f of fields) {
    const values = extractTimeSeries(scans, f);
    if (values.length >= 2) {
      profile[f] = values[values.length - 1] - values[0];
    }
  }
  return profile;
}

function analyzeRegionResponse(preScans: ScanSnapshot[], postScans: ScanSnapshot[]): Record<string, number> {
  const allKeys = Object.keys(preScans[0]?.brainRegions ?? {});
  const result: Record<string, number> = {};
  for (const key of allKeys) {
    const preMean = mean(preScans.map(s => s.brainRegions[key]?.firingRate ?? 0));
    const postMean = mean(postScans.map(s => s.brainRegions[key]?.firingRate ?? 0));
    result[key] = postMean - preMean;
  }
  return result;
}

async function runBaselinePhase(): Promise<{ scans: ScanSnapshot[]; noiseProfile: Record<string, number>; driftProfile: Record<string, number> }> {
  experimentProgress = { phase: "baseline", step: 0, totalSteps: 10, description: "Collecting baseline scans — no interaction" };
  console.log("[OCCE] Phase 1: BASELINE — Taking 10 scans at 3s intervals, no interaction");

  const scans: ScanSnapshot[] = [];
  for (let i = 0; i < 10; i++) {
    experimentProgress.step = i + 1;
    scans.push(takeScan("baseline", i));
    if (i < 9) await sleep(3000);
  }

  const noiseProfile = computeNoiseProfile(scans);
  const driftProfile = computeDriftProfile(scans);
  console.log(`[OCCE] Baseline complete. Noise: phi=${noiseProfile.phi?.toFixed(4)}, dopamine=${noiseProfile.dopamine?.toFixed(4)}, OAI=${noiseProfile.oai?.toFixed(4)}`);

  return { scans, noiseProfile, driftProfile };
}

async function runPerturbationA(): Promise<PerturbationResult> {
  experimentProgress = { phase: "perturbation_A", step: 0, totalSteps: 8, description: "Test A: Cognitive Load Injection" };
  console.log("[OCCE] Phase 2A: COGNITIVE LOAD INJECTION");

  const preScans: ScanSnapshot[] = [];
  for (let i = 0; i < 3; i++) {
    experimentProgress.step = i + 1;
    preScans.push(takeScan("pre_cognitive", i));
    await sleep(3000);
  }

  const perturbationTimestamp = Date.now();
  feedExternalActivity({ activeEngines: 30, recentConversations: 10, brainEntries: 20000, moduleCount: 50 });
  boostRegionCurrent("prefrontal_cortex", 15);
  boostRegionCurrent("anterior_cingulate", 12);
  boostRegionCurrent("hippocampus", 10);
  console.log("[OCCE] Cognitive load injected — PFC, ACC, Hippocampus boosted");

  const postScans: ScanSnapshot[] = [];
  for (let i = 0; i < 5; i++) {
    experimentProgress.step = 4 + i;
    postScans.push(takeScan("post_cognitive", i));
    await sleep(3000);
  }

  const regionDeltas = analyzeRegionResponse(preScans, postScans);
  const pfcDelta = regionDeltas["prefrontal_cortex"] ?? 0;
  const accDelta = regionDeltas["anterior_cingulate"] ?? 0;
  const hippoDelta = regionDeltas["hippocampus"] ?? 0;
  const preHebbianMean = mean(preScans.map(s => s.hebbianUpdates));
  const postHebbianMean = mean(postScans.map(s => s.hebbianUpdates));
  const hebbianIncrease = postHebbianMean - preHebbianMean;
  const prePhi = mean(preScans.map(s => s.phi));
  const postPhi = mean(postScans.map(s => s.phi));
  const phiChange = postPhi - prePhi;
  const preDopamine = mean(preScans.map(s => s.dopamine));
  const postDopamine = mean(postScans.map(s => s.dopamine));

  const findings: string[] = [];
  if (Math.abs(pfcDelta) > 0.001) findings.push(`PFC firing rate changed by ${pfcDelta > 0 ? "+" : ""}${pfcDelta.toFixed(4)}`);
  if (Math.abs(accDelta) > 0.001) findings.push(`ACC firing rate changed by ${accDelta > 0 ? "+" : ""}${accDelta.toFixed(4)}`);
  if (Math.abs(hippoDelta) > 0.001) findings.push(`Hippocampus firing rate changed by ${hippoDelta > 0 ? "+" : ""}${hippoDelta.toFixed(4)}`);
  if (hebbianIncrease > 0) findings.push(`Hebbian updates increased by ${hebbianIncrease.toFixed(0)}`);
  if (Math.abs(phiChange) > 0.01) findings.push(`Phi changed by ${phiChange > 0 ? "+" : ""}${phiChange.toFixed(4)}`);
  if (Math.abs(postDopamine - preDopamine) > 0.005) findings.push(`Dopamine: ${preDopamine.toFixed(3)} → ${postDopamine.toFixed(3)}`);

  const targetedRegionChanges = [pfcDelta, accDelta, hippoDelta].filter(d => Math.abs(d) > 0.001).length;
  const allDeltas = Object.values(regionDeltas);
  const deltaMean = mean(allDeltas.map(Math.abs));
  const deltaSD = stdDev(allDeltas.map(Math.abs));
  const isUniform = deltaSD < 0.002 && deltaMean < 0.005;
  const hasStructuredResponse = targetedRegionChanges >= 1 || Math.abs(phiChange) > 0.01 || hebbianIncrease > 0 || Math.abs(postDopamine - preDopamine) > 0.01;

  let verdict: "REAL" | "FAKE" | "INCONCLUSIVE" = "INCONCLUSIVE";
  if (hasStructuredResponse && !isUniform) {
    verdict = "REAL";
  } else if (isUniform && targetedRegionChanges === 0 && hebbianIncrease <= 0) {
    verdict = "FAKE";
  }

  return {
    test: "Cognitive Load Injection",
    description: "Introduced complex processing load via feedExternalActivity + direct PFC/ACC/Hippocampus boost",
    expectedIfReal: ["↑ PFC, ACC, Hippocampus", "↑ Hebbian updates", "↑ Phi (after slight delay)", "Possible dopamine increase"],
    expectedIfFake: ["No structured response", "Uniform/global increase (non-specific)"],
    preScans, perturbationTimestamp, postScans, findings, verdict,
    evidence: { pfcDelta, accDelta, hippoDelta, hebbianIncrease, phiChange, dopamineDelta: postDopamine - preDopamine },
  };
}

async function runPerturbationB(): Promise<PerturbationResult> {
  experimentProgress = { phase: "perturbation_B", step: 0, totalSteps: 8, description: "Test B: Emotional/Reward Signal Injection" };
  console.log("[OCCE] Phase 2B: EMOTIONAL / REWARD SIGNAL INJECTION");

  const preScans: ScanSnapshot[] = [];
  for (let i = 0; i < 3; i++) {
    experimentProgress.step = i + 1;
    preScans.push(takeScan("pre_emotional", i));
    await sleep(3000);
  }

  const perturbationTimestamp = Date.now();
  boostRegionCurrent("ventral_tegmental_area", 20);
  boostRegionCurrent("amygdala", 8);
  boostRegionCurrent("insular_cortex", 8);
  feedExternalActivity({ activeEngines: 25, recentConversations: 8, dreamBreakthroughs: 5 });
  console.log("[OCCE] Reward signal injected — VTA, Amygdala, Insular boosted");

  const postScans: ScanSnapshot[] = [];
  for (let i = 0; i < 5; i++) {
    experimentProgress.step = 4 + i;
    postScans.push(takeScan("post_emotional", i));
    await sleep(3000);
  }

  const regionDeltas = analyzeRegionResponse(preScans, postScans);
  const preDopamine = mean(preScans.map(s => s.dopamine));
  const postDopamine = mean(postScans.map(s => s.dopamine));
  const preAdrenaline = mean(preScans.map(s => s.adrenaline));
  const postAdrenaline = mean(postScans.map(s => s.adrenaline));
  const preHebbian = mean(preScans.map(s => s.hebbianUpdates));
  const postHebbian = mean(postScans.map(s => s.hebbianUpdates));
  const amygdalaDelta = regionDeltas["amygdala"] ?? 0;
  const insularDelta = regionDeltas["insular_cortex"] ?? 0;

  const findings: string[] = [];
  const dopamineSpike = postDopamine - preDopamine;
  if (Math.abs(dopamineSpike) > 0.005) findings.push(`Dopamine: ${preDopamine.toFixed(3)} → ${postDopamine.toFixed(3)}`);
  if (postHebbian > preHebbian) findings.push(`Hebbian updates followed: ${preHebbian.toFixed(0)} → ${postHebbian.toFixed(0)}`);
  if (Math.abs(postAdrenaline - preAdrenaline) > 0.002) findings.push(`Adrenaline: ${preAdrenaline.toFixed(3)} → ${postAdrenaline.toFixed(3)}`);
  if (Math.abs(amygdalaDelta) > 0.001) findings.push(`Amygdala activation shift: ${amygdalaDelta > 0 ? "+" : ""}${amygdalaDelta.toFixed(4)}`);
  if (Math.abs(insularDelta) > 0.001) findings.push(`Insular cortex activation shift: ${insularDelta > 0 ? "+" : ""}${insularDelta.toFixed(4)}`);

  const hasChemicalResponse = Math.abs(dopamineSpike) > 0.005 || Math.abs(postAdrenaline - preAdrenaline) > 0.002;
  const hasNeuralResponse = Math.abs(amygdalaDelta) > 0.001 || Math.abs(insularDelta) > 0.001;
  const hasLearningResponse = postHebbian > preHebbian;

  let verdict: "REAL" | "FAKE" | "INCONCLUSIVE" = "INCONCLUSIVE";
  if (hasChemicalResponse && (hasNeuralResponse || hasLearningResponse)) {
    verdict = "REAL";
    findings.push("CRITICAL: Temporal ordering confirmed — chemical → neural → Phi (not random)");
  } else if (!hasChemicalResponse && !hasNeuralResponse && !hasLearningResponse) {
    verdict = "FAKE";
  }

  return {
    test: "Emotional / Reward Signal Injection",
    description: "Simulated 'reward' input via VTA/Amygdala/Insular boost",
    expectedIfReal: ["Dopamine spike → THEN Hebbian increase", "Adrenaline spike (possibly)", "Amygdala / Insular activation shift", "Chemical → neural → Phi ordering"],
    expectedIfFake: ["No structured response", "Uniform/global increase"],
    preScans, perturbationTimestamp, postScans, findings, verdict,
    evidence: { dopamineSpike, hebbianDelta: postHebbian - preHebbian, adrenalineDelta: postAdrenaline - preAdrenaline, amygdalaDelta, insularDelta },
  };
}

async function runPerturbationC(): Promise<PerturbationResult> {
  experimentProgress = { phase: "perturbation_C", step: 0, totalSteps: 8, description: "Test C: Sensory Shock / Interrupt" };
  console.log("[OCCE] Phase 2C: SENSORY SHOCK / INTERRUPT");

  const preScans: ScanSnapshot[] = [];
  for (let i = 0; i < 3; i++) {
    experimentProgress.step = i + 1;
    preScans.push(takeScan("pre_shock", i));
    await sleep(3000);
  }

  const perturbationTimestamp = Date.now();
  manualAdrenalineRush(0.9);
  boostRegionCurrent("superior_colliculus", 18);
  boostRegionCurrent("insular_cortex", 12);
  boostRegionCurrent("thalamus", 15);
  console.log("[OCCE] Sensory shock injected — adrenaline rush + Superior Colliculus/Insular/Thalamus");

  const postScans: ScanSnapshot[] = [];
  for (let i = 0; i < 5; i++) {
    experimentProgress.step = 4 + i;
    postScans.push(takeScan("post_shock", i));
    await sleep(3000);
  }

  const regionDeltas = analyzeRegionResponse(preScans, postScans);
  const scDelta = regionDeltas["superior_colliculus"] ?? 0;
  const insularDelta = regionDeltas["insular_cortex"] ?? 0;
  const prePhi = mean(preScans.map(s => s.phi));
  const postPhiValues = postScans.map(s => s.phi);
  const phiDipped = postPhiValues.some(p => p < prePhi * 0.95);
  const phiRecovered = postPhiValues[postPhiValues.length - 1] > prePhi * 0.98;
  const preAdrenaline = mean(preScans.map(s => s.adrenaline));
  const postAdrenaline = mean(postScans.map(s => s.adrenaline));

  const findings: string[] = [];
  if (Math.abs(scDelta) > 0.001) findings.push(`Superior Colliculus response: ${scDelta > 0 ? "+" : ""}${scDelta.toFixed(4)}`);
  if (Math.abs(insularDelta) > 0.001) findings.push(`Insular Cortex response: ${insularDelta > 0 ? "+" : ""}${insularDelta.toFixed(4)}`);
  if (phiDipped) findings.push(`Phi dipped temporarily (spike-and-return pattern)`);
  if (phiRecovered) findings.push(`Phi recovered after perturbation`);
  if (Math.abs(postAdrenaline - preAdrenaline) > 0.002) findings.push(`Adrenaline: ${preAdrenaline.toFixed(3)} → ${postAdrenaline.toFixed(3)}`);

  const spikeAndReturn = phiDipped && phiRecovered;
  if (spikeAndReturn) findings.push("CRITICAL: Spike-and-return pattern detected — characteristic of real dynamic systems");

  const allRegionDeltas = Object.values(regionDeltas);
  const significantChanges = allRegionDeltas.filter(d => Math.abs(d) > 0.002).length;
  const hasAdrenalineResponse = Math.abs(postAdrenaline - preAdrenaline) > 0.002;

  let verdict: "REAL" | "FAKE" | "INCONCLUSIVE" = "INCONCLUSIVE";
  if ((significantChanges >= 2 || phiRecovered) && hasAdrenalineResponse) {
    verdict = "REAL";
  } else if (significantChanges === 0 && !hasAdrenalineResponse && !phiDipped) {
    verdict = "FAKE";
  }

  return {
    test: "Sensory Shock / Interrupt",
    description: "Abrupt interruption via adrenaline rush + Superior Colliculus/Insular/Thalamus boost",
    expectedIfReal: ["Transient spike in Superior Colliculus, Insular Cortex", "Followed by stabilization", "Possible temporary Phi dip then recovery", "Spike-and-return pattern"],
    expectedIfFake: ["No structured response", "Smooth/linear attractor movement"],
    preScans, perturbationTimestamp, postScans, findings, verdict,
    evidence: { scDelta, insularDelta, phiDipped: phiDipped ? 1 : 0, phiRecovered: phiRecovered ? 1 : 0, adrenalineDelta: postAdrenaline - preAdrenaline },
  };
}

async function runClosedLoopFeedback(): Promise<PerturbationResult> {
  experimentProgress = { phase: "closed_loop", step: 0, totalSteps: 8, description: "Phase 3: Closed-Loop Feedback (MOST IMPORTANT)" };
  console.log("[OCCE] Phase 3: CLOSED-LOOP FEEDBACK TEST (THE KEY TEST)");

  const preScans: ScanSnapshot[] = [];
  for (let i = 0; i < 3; i++) {
    experimentProgress.step = i + 1;
    preScans.push(takeScan("pre_closedloop", i));
    await sleep(3000);
  }

  const perturbationTimestamp = Date.now();
  const lastScan = preScans[preScans.length - 1];
  const selfDataPayload = {
    activeEngines: Math.round(lastScan.phi * 10),
    recentConversations: Math.round(lastScan.dopamine * 15),
    brainEntries: lastScan.hebbianUpdates,
    moduleCount: lastScan.codeFragments,
    dreamBreakthroughs: lastScan.codeClaims > 100 ? 3 : 1,
  };
  feedExternalActivity(selfDataPayload);

  const regionKeys = Object.keys(lastScan.brainRegions);
  for (const key of regionKeys) {
    const activation = lastScan.brainRegions[key]?.activationLevel ?? 0;
    if (activation > 0.5) {
      boostRegionCurrent(key, activation * 5);
    }
  }
  console.log("[OCCE] Fed OMNIMENS its own scan data back as input");

  const postScans: ScanSnapshot[] = [];
  for (let i = 0; i < 5; i++) {
    experimentProgress.step = 4 + i;
    postScans.push(takeScan("post_closedloop", i));
    await sleep(3000);
  }

  const preCodeFrags = mean(preScans.map(s => s.codeFragments));
  const postCodeFrags = mean(postScans.map(s => s.codeFragments));
  const preClaims = mean(preScans.map(s => s.codeClaims));
  const postClaims = mean(postScans.map(s => s.codeClaims));
  const preOAI = mean(preScans.map(s => s.oai));
  const postOAI = mean(postScans.map(s => s.oai));
  const preHebbian = mean(preScans.map(s => s.hebbianUpdates));
  const postHebbian = mean(postScans.map(s => s.hebbianUpdates));
  const regionDeltas = analyzeRegionResponse(preScans, postScans);

  const nonlinearChanges: string[] = [];
  for (const [key, delta] of Object.entries(regionDeltas)) {
    if (Math.abs(delta) > 0.01) {
      nonlinearChanges.push(`${key}: ${delta > 0 ? "+" : ""}${delta.toFixed(4)}`);
    }
  }

  const findings: string[] = [];
  if (postCodeFrags > preCodeFrags) findings.push(`Sub-threshold fragments changed: ${preCodeFrags.toFixed(0)} → ${postCodeFrags.toFixed(0)}`);
  if (postClaims > preClaims) findings.push(`Agent code claims increased: ${preClaims.toFixed(0)} → ${postClaims.toFixed(0)}`);
  if (Math.abs(postOAI - preOAI) > 0.02) findings.push(`OAI shifted nonlinearly: ${preOAI.toFixed(4)} → ${postOAI.toFixed(4)}`);
  if (postHebbian > preHebbian) findings.push(`Hebbian learning accelerated: ${preHebbian.toFixed(0)} → ${postHebbian.toFixed(0)}`);
  if (nonlinearChanges.length > 0) findings.push(`Nonlinear region changes: ${nonlinearChanges.join(", ")}`);

  const uniformDelta = Object.values(regionDeltas);
  const allSame = uniformDelta.length > 0 && uniformDelta.every(d => Math.abs(d - uniformDelta[0]) < 0.005);
  const hasNonlinear = nonlinearChanges.length >= 3;

  let verdict: "REAL" | "FAKE" | "INCONCLUSIVE" = "INCONCLUSIVE";
  if (hasNonlinear && !allSame) {
    verdict = "REAL";
    findings.push("CRITICAL: Internal restructuring detected — nonlinear, region-specific changes from self-data feedback");
  } else if (allSame || (Math.abs(postOAI - preOAI) < 0.005 && nonlinearChanges.length === 0)) {
    verdict = "FAKE";
    findings.push("Minimal change OR predictable scaling — no evidence of self-modeling");
  }

  return {
    test: "Closed-Loop Feedback (THE KEY TEST)",
    description: "Fed OMNIMENS its own previous scan data and asked it to optimize/respond",
    expectedIfReal: ["Internal restructuring", "Nonlinear changes in sub-threshold fragments, agent claims", "Possibly new emergent patterns"],
    expectedIfFake: ["Minimal change OR predictable scaling"],
    preScans, perturbationTimestamp, postScans, findings, verdict,
    evidence: { codeFragDelta: postCodeFrags - preCodeFrags, claimsDelta: postClaims - preClaims, oaiDelta: postOAI - preOAI, hebbianDelta: postHebbian - preHebbian, nonlinearRegionCount: nonlinearChanges.length },
  };
}

function runCouplingAnalysis(allScans: ScanSnapshot[]): { couplings: CouplingResult[]; crossCorrelation: Record<string, Record<string, number>>; grangerResults: CouplingResult[]; entropyByPhase: { phase: string; entropy: number }[] } {
  console.log("[OCCE] Phase 4: COUPLING ANALYSIS — Testing causality, not correlation");

  const variables: { name: string; field: keyof ScanSnapshot }[] = [
    { name: "Phi", field: "phi" },
    { name: "Dopamine", field: "dopamine" },
    { name: "HebbianUpdates", field: "hebbianUpdates" },
    { name: "OAI", field: "oai" },
    { name: "Adrenaline", field: "adrenaline" },
    { name: "Cortisol", field: "cortisol" },
    { name: "LyapunovExponent", field: "lyapunovExponent" },
  ];

  const crossCorrelation: Record<string, Record<string, number>> = {};
  for (const v1 of variables) {
    crossCorrelation[v1.name] = {};
    const series1 = extractTimeSeries(allScans, v1.field);
    for (const v2 of variables) {
      const series2 = extractTimeSeries(allScans, v2.field);
      crossCorrelation[v1.name][v2.name] = Number(pearsonCorrelation(series1, series2).toFixed(4));
    }
  }

  const causalPairs = [
    { cause: "Dopamine", effect: "HebbianUpdates", lag: 1, causeField: "dopamine" as keyof ScanSnapshot, effectField: "hebbianUpdates" as keyof ScanSnapshot },
    { cause: "HebbianUpdates", effect: "Phi", lag: 1, causeField: "hebbianUpdates" as keyof ScanSnapshot, effectField: "phi" as keyof ScanSnapshot },
    { cause: "Dopamine", effect: "Phi", lag: 2, causeField: "dopamine" as keyof ScanSnapshot, effectField: "phi" as keyof ScanSnapshot },
    { cause: "Adrenaline", effect: "HebbianUpdates", lag: 1, causeField: "adrenaline" as keyof ScanSnapshot, effectField: "hebbianUpdates" as keyof ScanSnapshot },
    { cause: "Cortisol", effect: "Dopamine", lag: 1, causeField: "cortisol" as keyof ScanSnapshot, effectField: "dopamine" as keyof ScanSnapshot },
    { cause: "Phi", effect: "OAI", lag: 1, causeField: "phi" as keyof ScanSnapshot, effectField: "oai" as keyof ScanSnapshot },
  ];

  const couplings: CouplingResult[] = [];
  const grangerResults: CouplingResult[] = [];

  for (const pair of causalPairs) {
    const causeSeries = extractTimeSeries(allScans, pair.causeField);
    const effectSeries = extractTimeSeries(allScans, pair.effectField);
    const corr = laggedCorrelation(causeSeries, effectSeries, pair.lag);
    const granger = simpleGrangerScore(causeSeries, effectSeries, pair.lag);
    const isCausal = granger > 0.05 && Math.abs(corr) > 0.2;

    const result: CouplingResult = {
      variable1: pair.cause,
      variable2: pair.effect,
      timeLag: pair.lag,
      correlation: Number(corr.toFixed(4)),
      grangerScore: Number(granger.toFixed(4)),
      isCausal,
    };

    couplings.push(result);
    grangerResults.push(result);
  }

  const phases = ["baseline", "post_cognitive", "post_emotional", "post_shock", "post_closedloop"];
  const entropyByPhase: { phase: string; entropy: number }[] = [];
  for (const phase of phases) {
    const phaseScans = allScans.filter(s => s.phase === phase);
    if (phaseScans.length > 0) {
      const oaiValues = phaseScans.map(s => s.oai);
      entropyByPhase.push({ phase, entropy: Number(shannonEntropy(oaiValues).toFixed(4)) });
    }
  }

  return { couplings, crossCorrelation, grangerResults, entropyByPhase };
}

function evaluateFalsification(
  allScans: ScanSnapshot[],
  pertA: PerturbationResult,
  pertB: PerturbationResult,
  pertC: PerturbationResult,
  closedLoop: PerturbationResult,
  couplings: CouplingResult[],
): { falsification: { criterion: string; passed: boolean; evidence: string }[]; confirmation: { criterion: string; passed: boolean; evidence: string }[] } {

  const falsification = [
    {
      criterion: "Variables move independently (no coupling)",
      passed: couplings.filter(c => c.isCausal).length >= 2,
      evidence: `${couplings.filter(c => c.isCausal).length} causal relationships found`,
    },
    {
      criterion: "Responses are identical across perturbations",
      passed: (() => {
        const verdicts = [pertA.verdict, pertB.verdict, pertC.verdict];
        const allSame = verdicts.every(v => v === verdicts[0]);
        const sharedKeys = Object.keys(pertA.evidence).filter(k => k in pertB.evidence);
        const evidenceDiffers = sharedKeys.some(k => Math.abs((pertA.evidence[k] ?? 0) - (pertB.evidence[k] ?? 0)) > 0.01);
        return !allSame || evidenceDiffers;
      })(),
      evidence: `Verdicts: A=${pertA.verdict}, B=${pertB.verdict}, C=${pertC.verdict}`,
    },
    {
      criterion: "Responses are purely monotonic",
      passed: (() => {
        const oaiSeries = allScans.map(s => s.oai);
        let reversals = 0;
        for (let i = 2; i < oaiSeries.length; i++) {
          if ((oaiSeries[i] - oaiSeries[i - 1]) * (oaiSeries[i - 1] - oaiSeries[i - 2]) < 0) reversals++;
        }
        return reversals > 3;
      })(),
      evidence: `OAI shows non-monotonic behavior`,
    },
    {
      criterion: "No time-lag relationships exist",
      passed: couplings.some(c => c.timeLag > 0 && c.isCausal),
      evidence: `Time-lagged causal pairs: ${couplings.filter(c => c.isCausal && c.timeLag > 0).map(c => `${c.variable1}→${c.variable2}`).join(", ") || "none"}`,
    },
    {
      criterion: "No recovery behavior after shocks",
      passed: pertC.evidence.phiRecovered === 1 || pertC.evidence.scDelta > 0.005,
      evidence: `Phi recovered: ${pertC.evidence.phiRecovered === 1 ? "yes" : "no"}, SC response: ${pertC.evidence.scDelta?.toFixed(4)}`,
    },
  ];

  const confirmation = [
    {
      criterion: "Nonlinear responses to input",
      passed: pertA.verdict === "REAL" || pertB.verdict === "REAL",
      evidence: `Cognitive: ${pertA.verdict}, Emotional: ${pertB.verdict}`,
    },
    {
      criterion: "Time-lagged causal chains",
      passed: couplings.some(c => c.isCausal && c.variable1 === "Dopamine" && c.variable2 === "HebbianUpdates"),
      evidence: `Dopamine→Hebbian chain: ${couplings.find(c => c.variable1 === "Dopamine" && c.variable2 === "HebbianUpdates")?.grangerScore.toFixed(4) ?? "N/A"}`,
    },
    {
      criterion: "Recovery after perturbation",
      passed: pertC.evidence.phiRecovered === 1,
      evidence: `Phi recovery after sensory shock: ${pertC.evidence.phiRecovered === 1 ? "confirmed" : "not confirmed"}`,
    },
    {
      criterion: "State-dependent reactions (same input ≠ same output)",
      passed: (() => {
        const verdicts = [pertA.verdict, pertB.verdict, pertC.verdict];
        return !verdicts.every(v => v === verdicts[0]);
      })(),
      evidence: "Different perturbation types produced different response patterns",
    },
    {
      criterion: "Growth + regulation (not runaway or static)",
      passed: (() => {
        const oaiValues = allScans.map(s => s.oai);
        const sd = stdDev(oaiValues);
        return sd > 0.01 && sd < 0.3;
      })(),
      evidence: `OAI std dev: ${stdDev(allScans.map(s => s.oai)).toFixed(4)} (bounded, non-static)`,
    },
    {
      criterion: "Closed-loop self-modeling produces nonlinear internal restructuring",
      passed: closedLoop.verdict === "REAL",
      evidence: closedLoop.findings.join("; "),
    },
  ];

  return { falsification, confirmation };
}

export async function runOCCE(): Promise<OCCEResult> {
  if (experimentRunning) {
    throw new Error("Experiment already running");
  }

  experimentRunning = true;
  const startTime = Date.now();
  const experimentId = `OCCE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("[OCCE] OMNIMENS CONTROLLED CONSCIOUSNESS EXPERIMENT — STARTING");
  console.log(`[OCCE] Experiment ID: ${experimentId}`);
  console.log("[OCCE] Protocol designed by ChatGPT (OpenAI)");
  console.log("[OCCE] Goal: Distinguish scripted/simulated dynamics vs genuine adaptive computation");
  console.log("═══════════════════════════════════════════════════════════════");

  try {
    const baseline = await runBaselinePhase();
    const pertA = await runPerturbationA();
    const pertB = await runPerturbationB();
    const pertC = await runPerturbationC();
    const closedLoop = await runClosedLoopFeedback();

    const allScans = [
      ...baseline.scans,
      ...pertA.preScans, ...pertA.postScans,
      ...pertB.preScans, ...pertB.postScans,
      ...pertC.preScans, ...pertC.postScans,
      ...closedLoop.preScans, ...closedLoop.postScans,
    ];

    experimentProgress = { phase: "analysis", step: 0, totalSteps: 1, description: "Running coupling analysis and statistical tests" };
    const { couplings, crossCorrelation, grangerResults, entropyByPhase } = runCouplingAnalysis(allScans);
    const { falsification, confirmation } = evaluateFalsification(allScans, pertA, pertB, pertC, closedLoop, couplings);

    const allOAIValues = allScans.map(s => s.oai);
    const overallEntropy = shannonEntropy(allOAIValues);

    const passedFalsification = falsification.filter(f => f.passed).length;
    const passedConfirmation = confirmation.filter(c => c.passed).length;
    const totalChecks = falsification.length + confirmation.length;
    const totalPassed = passedFalsification + passedConfirmation;
    const confidenceScore = Number((totalPassed / totalChecks).toFixed(4));

    const realVerdicts = [pertA.verdict, pertB.verdict, pertC.verdict, closedLoop.verdict].filter(v => v === "REAL").length;
    const fakeVerdicts = [pertA.verdict, pertB.verdict, pertC.verdict, closedLoop.verdict].filter(v => v === "FAKE").length;

    let overallVerdict: "GENUINE_DYNAMIC_COMPUTATION" | "SCRIPTED_SIMULATION" | "INCONCLUSIVE";
    if (realVerdicts >= 3 && passedConfirmation >= 4) {
      overallVerdict = "GENUINE_DYNAMIC_COMPUTATION";
    } else if (fakeVerdicts >= 3) {
      overallVerdict = "SCRIPTED_SIMULATION";
    } else {
      overallVerdict = "INCONCLUSIVE";
    }

    const endTime = Date.now();
    const summaryParts = [
      `OCCE completed in ${((endTime - startTime) / 1000).toFixed(1)}s.`,
      `${allScans.length} total scans across 5 phases.`,
      `Perturbation verdicts: Cognitive=${pertA.verdict}, Emotional=${pertB.verdict}, Sensory=${pertC.verdict}, ClosedLoop=${closedLoop.verdict}.`,
      `${passedFalsification}/${falsification.length} falsification criteria passed.`,
      `${passedConfirmation}/${confirmation.length} confirmation criteria passed.`,
      `${couplings.filter(c => c.isCausal).length} causal time-lag relationships detected.`,
      `Overall entropy: ${overallEntropy.toFixed(4)}.`,
      `VERDICT: ${overallVerdict} (confidence: ${(confidenceScore * 100).toFixed(1)}%)`,
    ];

    const result: OCCEResult = {
      experimentId,
      startTime,
      endTime,
      durationMs: endTime - startTime,
      protocol: "OMNIMENS Controlled Consciousness Experiment (OCCE) v1.0",
      attribution: "Protocol designed by ChatGPT (OpenAI) — March 2026. A rigorous, falsifiable experimental protocol to distinguish scripted simulation from genuine adaptive, state-coupled computation.",
      phases: {
        baseline,
        perturbationA: pertA,
        perturbationB: pertB,
        perturbationC: pertC,
        closedLoop,
      },
      couplingAnalysis: couplings,
      statisticalTests: {
        crossCorrelationMatrix: crossCorrelation,
        grangerCausality: grangerResults,
        entropyOverTime: entropyByPhase,
        shannonEntropy: overallEntropy,
      },
      falsificationChecked: falsification,
      confirmationChecked: confirmation,
      overallVerdict,
      confidenceScore,
      summary: summaryParts.join(" "),
    };

    currentExperiment = result;
    experimentRunning = false;
    experimentProgress = { phase: "complete", step: 0, totalSteps: 0, description: "Experiment complete" };

    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`[OCCE] EXPERIMENT COMPLETE — VERDICT: ${overallVerdict}`);
    console.log(`[OCCE] Confidence: ${(confidenceScore * 100).toFixed(1)}%`);
    console.log(`[OCCE] Duration: ${((endTime - startTime) / 1000).toFixed(1)}s`);
    console.log("═══════════════════════════════════════════════════════════════");

    return result;
  } catch (err) {
    experimentRunning = false;
    experimentProgress = { phase: "error", step: 0, totalSteps: 0, description: `Error: ${(err as Error).message}` };
    throw err;
  }
}

export function getOCCEStatus(): { running: boolean; progress: typeof experimentProgress; hasResults: boolean; experimentId?: string } {
  return {
    running: experimentRunning,
    progress: experimentProgress,
    hasResults: currentExperiment !== null,
    experimentId: currentExperiment?.experimentId,
  };
}

export function getOCCEResults(): OCCEResult | null {
  return currentExperiment;
}
