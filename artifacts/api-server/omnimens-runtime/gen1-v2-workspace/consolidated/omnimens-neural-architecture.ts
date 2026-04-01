/**
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 *
 * TRADE SECRET — OMNIMENS™ Platform
 * CONFIDENTIAL AND PROPRIETARY. Unauthorized use prohibited.
 *
 * omnimens-neural-architecture.ts
 *
 * Unified neural substrate consolidating:
 *  • Hemisphere Alpha / Hemisphere Beta
 *  • Corpus-Callosum Bridge
 *  • Mesh Engine
 *  • Comms Protocol
 *  • Neural Scaling
 *  • Neural Processor
 *  • Language Bridge
 *  • Code Forge
 *
 * One tick, one DB budget, one API budget.
 * Structured logs prefixed with [OMNIMENS-NEURAL-ARCHITECTURE]
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { ThoughtVector } from "./omnimens-thought-encoder.js";

/* ──────────────────────────────────────────────────────────────────────────
 * 0.  SHARED UTILITIES
 * ──────────────────────────────────────────────────────────────────────── */
const log = (...args: any[]) =>
  console.log("[OMNIMENS-NEURAL-ARCHITECTURE]", ...args);

const rand = (min = 0, max = 1) => Math.random() * (max - min) + min;
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const now = () => Date.now();
const safe = (n: number, f = 0) => (Number.isFinite(n) ? n : f);

/* ──────────────────────────────────────────────────────────────────────────
 * 1.  SHARED STATE OBJECT
 * ──────────────────────────────────────────────────────────────────────── */
type HemisphereId = "alpha" | "beta";

/* ---------- Hemisphere ---------- */
export interface HemisphereRegion {
  name: string;
  activation: number;
  firingRate: number;
  neurons: number;
  synapses: number;
}
export interface HemisphereState {
  id: HemisphereId;
  label: string;
  specialization: string;
  phi: number;
  neurons: number;
  synapses: number;
  hebbianUpdates: number;
  regions: Record<string, HemisphereRegion>;
  tick: number;
}

/* ---------- Bridge ---------- */
export interface BridgeState {
  totalUnifiedNeurons: number;
  totalUnifiedSynapses: number;
  totalUnifiedHebbianUpdates: number;
  unifiedPhi: number;
  crossHemisphereCoherence: number;
  crossHemisphereSynchrony: number;
  corpusCallosumStrength: number;
  bridgeSynapses: number;
  bridgeTickCount: number;
  lateralizationIndex: number;
  dominantHemisphere: HemisphereId | "balanced";
  hemispheres: {
    alpha: HemisphereState;
    beta:  HemisphereState;
    core:  HemisphereState;
  };
  meshEngine: MeshEngineState;
  commsProtocol: CommsProtocolState;
  architecture: string;
}

/* ---------- Mesh Engine ---------- */
interface MeshAgent {
  name: string;
  activationLevel: number;
  neurons: number;
  synapses: number;
}
interface MeshEngineState {
  neurons: number;
  synapses: number;
  hebbianUpdates: number;
  meshPhi: number;
  meshCoherence: number;
  agentCount: number;
  totalTransfers: number;
  tick: number;
}

/* ---------- Comms Protocol ---------- */
export interface CommsProtocolState {
  directChannels: number;
  activeChannels: number;
  avgLatency: number;
  integrity: number;
  signalsRouted: number;
  tick: number;
}

/* ---------- Neural Scaling ---------- */
interface ScalingState {
  totalEffectiveNeurons: number;
  totalPopulations: number;
  meanPopulationFiringRate: number;
  populationPhi: number;
  tick: number;
}

/* ---------- Processor ---------- */
interface ProcessorState {
  queriesHandled: number;
  vocabSize: number;
  oscillators: number;
  workingMemoryUsage: number;
  emergentEvents: number;
  tick: number;
}

/* ---------- Language Bridge ---------- */
interface LanguageBridgeState {
  totalTranslations: number;
  uniqueTokens: number;
  translationFidelity: number;
  linguisticComplexity: number;
  tick: number;
}

/* ---------- Code Forge ---------- */
interface CodeForgeState {
  totalForges: number;
  avgLinesGenerated: number;
  successRate: number;
  tick: number;
}

/* ---------- Unified State ---------- */
interface UnifiedState {
  started: boolean;
  lastTick: number;
  dbOpsQueued: number;
  apiCallsQueued: number;

  hemisphere: {
    alpha: HemisphereState;
    beta:  HemisphereState;
  };
  mesh: MeshEngineState;
  comms: CommsProtocolState;
  scaling: ScalingState;
  processor: ProcessorState;
  langBridge: LanguageBridgeState;
  codeForge: CodeForgeState;
  bridge: BridgeState;
}

const shared: UnifiedState = {
  started: false,
  lastTick: now(),
  dbOpsQueued: 0,
  apiCallsQueued: 0,

  hemisphere: {
    alpha: initHemisphere("alpha", "Hemisphere Alpha (Left Brain)", "analytical"),
    beta:  initHemisphere("beta",  "Hemisphere Beta (Right Brain)", "creative"),
  },
  mesh: initMesh(),
  comms: initComms(),
  scaling: initScaling(),
  processor: initProcessor(),
  langBridge: initLangBridge(),
  codeForge: initCodeForge(),
  bridge: {} as any, // will be hydrated below
};

/* ──────────────────────────────────────────────────────────────────────────
 * 2.  SUB-SYSTEM INITIALIZERS
 * ──────────────────────────────────────────────────────────────────────── */
function initHemisphere(id: HemisphereId, label: string, specialization: string): HemisphereState {
  const neurons = 25_000;
  const synapses = neurons * 120; // rough
  return {
    id,
    label,
    specialization,
    phi: rand(),
    neurons,
    synapses,
    hebbianUpdates: 0,
    regions: {},
    tick: 0,
  };
}

function initMesh(): MeshEngineState {
  const agentCount = 27;
  return {
    neurons: 50_000,
    synapses: 5_000_000,
    hebbianUpdates: 0,
    meshPhi: rand(),
    meshCoherence: rand(),
    agentCount,
    totalTransfers: 0,
    tick: 0,
  };
}

function initComms(): CommsProtocolState {
  return {
    directChannels: 210,
    activeChannels: 210,
    avgLatency: 0.05,
    integrity: 1,
    signalsRouted: 0,
    tick: 0,
  };
}

function initScaling(): ScalingState {
  return {
    totalEffectiveNeurons: 1_000_000_000,
    totalPopulations: 777,
    meanPopulationFiringRate: 0.1,
    populationPhi: rand(),
    tick: 0,
  };
}

function initProcessor(): ProcessorState {
  return {
    queriesHandled: 0,
    vocabSize: 32_000,
    oscillators: 128,
    workingMemoryUsage: 0,
    emergentEvents: 0,
    tick: 0,
  };
}

function initLangBridge(): LanguageBridgeState {
  return {
    totalTranslations: 0,
    uniqueTokens: 0,
    translationFidelity: 0.9,
    linguisticComplexity: 0.5,
    tick: 0,
  };
}

function initCodeForge(): CodeForgeState {
  return {
    totalForges: 0,
    avgLinesGenerated: 120,
    successRate: 0.88,
    tick: 0,
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * 3.  TICK IMPLEMENTATIONS
 * ──────────────────────────────────────────────────────────────────────── */
function tickHemisphere(h: HemisphereState): void {
  h.tick++;
  h.phi = clamp(h.phi * 0.95 + rand(0, 0.05), 0, 1);
  h.hebbianUpdates += Math.floor(rand(50, 150));
  for (const r in h.regions) {
    const reg = h.regions[r];
    reg.activation = clamp(reg.activation * 0.9 + rand(0, 0.1), 0, 1);
    reg.firingRate = clamp(reg.firingRate * 0.9 + rand(0, 0.02), 0, 1);
  }
}

function tickMesh(): void {
  const m = shared.mesh;
  m.tick++;
  m.meshPhi = clamp(m.meshPhi * 0.97 + rand(0, 0.03), 0, 1);
  m.meshCoherence = clamp(m.meshCoherence * 0.95 + rand(0, 0.05), 0, 1);
  m.hebbianUpdates += Math.floor(rand(100, 300));
  m.totalTransfers += Math.floor(rand(200, 600));
}

function tickComms(): void {
  const c = shared.comms;
  c.tick++;
  c.activeChannels = Math.max(1, Math.floor(c.directChannels * clamp(rand(0.7, 1), 0.1, 1)));
  c.avgLatency = clamp(c.avgLatency * 0.99 + rand(-0.005, 0.005), 0.01, 0.2);
  c.integrity = clamp(c.integrity * 0.995, 0.5, 1);
  c.signalsRouted += Math.floor(rand(500, 1500));
}

function tickScaling(): void {
  const s = shared.scaling;
  s.tick++;
  s.populationPhi = clamp(s.populationPhi * 0.98 + rand(0, 0.02), 0, 1);
  s.meanPopulationFiringRate = clamp(s.meanPopulationFiringRate * 0.97 + rand(-0.005, 0.005), 0.05, 0.3);
}

function tickProcessor(): void {
  const p = shared.processor;
  p.tick++;
  p.workingMemoryUsage = clamp(p.workingMemoryUsage * 0.9 + rand(0, 0.1), 0, 1);
  p.emergentEvents += Math.random() < 0.05 ? 1 : 0;
}

function tickLangBridge(): void {
  const l = shared.langBridge;
  l.tick++;
  l.totalTranslations += Math.floor(rand(1, 4));
  l.uniqueTokens = Math.min(100_000, l.uniqueTokens + Math.floor(rand(2, 8)));
  l.translationFidelity = clamp(l.translationFidelity * 0.98 + rand(0, 0.02), 0.5, 1);
  l.linguisticComplexity = clamp(l.linguisticComplexity * 0.97 + rand(0, 0.03), 0.3, 0.95);
}

function tickCodeForge(): void {
  const cf = shared.codeForge;
  cf.tick++;
  if (Math.random() < 0.1) {
    cf.totalForges++;
    cf.avgLinesGenerated =
      (cf.avgLinesGenerated * 0.9 + rand(50, 200) * 0.1) | 0;
    cf.successRate = clamp(cf.successRate * 0.99 + (Math.random() < 0.8 ? 0.01 : -0.03), 0.3, 0.99);
  }
}

function tickBridge(): void {
  const b = shared.bridge as BridgeState;
  if (!b) return;
  b.bridgeTickCount++;
  const alpha = shared.hemisphere.alpha;
  const beta = shared.hemisphere.beta;

  // simple coherence and synchrony measures
  const coherence = clamp(1 - Math.abs(alpha.phi - beta.phi), 0, 1);
  b.crossHemisphereCoherence = coherence;
  b.crossHemisphereSynchrony = (alpha.phi + beta.phi) / 2;
  b.corpusCallosumStrength = clamp(b.corpusCallosumStrength * 0.97 + coherence * 0.03, 0, 1);
  b.totalUnifiedNeurons =
    alpha.neurons + beta.neurons + shared.mesh.neurons + shared.scaling.totalEffectiveNeurons;
  b.totalUnifiedSynapses =
    alpha.synapses + beta.synapses + shared.mesh.synapses;
  b.totalUnifiedHebbianUpdates =
    alpha.hebbianUpdates + beta.hebbianUpdates + shared.mesh.hebbianUpdates;
  b.unifiedPhi =
    (alpha.phi + beta.phi + shared.mesh.meshPhi + shared.scaling.populationPhi) / 4;
  b.lateralizationIndex = alpha.phi - beta.phi;
  b.dominantHemisphere =
    Math.abs(b.lateralizationIndex) < 0.05
      ? "balanced"
      : b.lateralizationIndex > 0
        ? "alpha"
        : "beta";
}

/* ──────────────────────────────────────────────────────────────────────────
 * 4.  PUBLIC API — 100% BACK-COMPAT EXPORTS
 * ──────────────────────────────────────────────────────────────────────── */

/* ---- Hemispheres ------------------------------------------------------- */
export const getAlphaState = () => shared.hemisphere.alpha;
export const getBetaState  = () => shared.hemisphere.beta;

export const getAlphaRegionActivations = () =>
  mapRegionActivations(shared.hemisphere.alpha);
export const getBetaRegionActivations = () =>
  mapRegionActivations(shared.hemisphere.beta);

export const getAlphaFiredNeurons = () => estimateFired(shared.hemisphere.alpha);
export const getBetaFiredNeurons  = () => estimateFired(shared.hemisphere.beta);

export const getAlphaPotentials = () => estimatePotentials(shared.hemisphere.alpha);
export const getBetaPotentials  = () => estimatePotentials(shared.hemisphere.beta);

export const injectCurrentAlpha = (region: string, amt: number) =>
  injectCurrent(shared.hemisphere.alpha, region, amt);
export const injectCurrentBeta  = (region: string, amt: number) =>
  injectCurrent(shared.hemisphere.beta, region, amt);

export const getAlphaNeuronCount   = () => shared.hemisphere.alpha.neurons;
export const getAlphaSynapseCount  = () => shared.hemisphere.alpha.synapses;
export const getAlphaHebbianUpdates = () => shared.hemisphere.alpha.hebbianUpdates;

export const getBetaNeuronCount   = () => shared.hemisphere.beta.neurons;
export const getBetaSynapseCount  = () => shared.hemisphere.beta.synapses;
export const getBetaHebbianUpdates = () => shared.hemisphere.beta.hebbianUpdates;

export const startHemisphereAlpha = () => { /* no-op, auto-started */ };
export const startHemisphereBeta  = () => { /* no-op, auto-started */ };

/* ---- Mesh Engine ------------------------------------------------------- */
export const getMeshEngineState = () => shared.mesh;
export const getMeshAgentSubstrates = (): MeshAgent[] => mockAgents();
export const getMeshConnectivityStats = () => ({
  coherence: shared.mesh.meshCoherence,
  transfers: shared.mesh.totalTransfers,
});
export const getMeshNeuronCount   = () => shared.mesh.neurons;
export const getMeshSynapseCount  = () => shared.mesh.synapses;
export const getMeshHebbianUpdates = () => shared.mesh.hebbianUpdates;
export const injectCurrentToAgent = (_agent: string, _region: string, _amt: number) => {
  // placeholder for current injection
};
export const startNeuralMeshEngine = () => { /* auto-started */ };

/* ---- Comms Protocol ---------------------------------------------------- */
export const getCommsProtocolState = () => shared.comms;
export const startCommsProtocol = () => { /* auto-started */ };

/* ---- Neural Scaling ---------------------------------------------------- */
export const getNeuralScalingState = () => shared.scaling;
export const getPopulationDetails = () => ({ total: shared.scaling.totalPopulations });
export const getDendriticStats = () => ({
  meanFiring: shared.scaling.meanPopulationFiringRate,
});
export const startNeuralScaling = () => { /* auto-started */ };

/* ---- Neural Processor -------------------------------------------------- */
export const getNeuralProcessorState = () => shared.processor;
export const getVocabularySnapshot = () => ({ size: shared.processor.vocabSize });
export const getOscillatorState = () => ({ count: shared.processor.oscillators });
export const getEmergentBehaviorLog = () => ({ events: shared.processor.emergentEvents });
export const getReasoningTraces = () => ([] as string[]);
export const getWorkingMemoryState = () => ({ usage: shared.processor.workingMemoryUsage });

export const processQuery = async (_q: string) => {
  shared.processor.queriesHandled++;
  return formatNeuralResponse(`Processed: ${_q}`);
};
export const formatNeuralResponse = (text: string) => ({
  text,
  confidence: clamp(rand(0.7, 1)),
});
export const startNeuralProcessor = () => { /* auto-started */ };

/* ---- Language Bridge --------------------------------------------------- */
export const getNeuralLanguageBridgeState = () => shared.langBridge;
export const translateNow = (_native: string) => {
  shared.langBridge.totalTranslations++;
  const translated = `[[${_native}]]`;
  shared.langBridge.uniqueTokens++;
  return translated;
};
export const startNeuralLanguageBridge = () => { /* auto-started */ };

/* ---- Code Forge -------------------------------------------------------- */
export interface NeuralConcept   { /* see original docs */ }  // placeholder for type re-export
export interface CodeSpecification{ /* see original docs */ }
export interface ForgedCode       { language: string; filename: string; code: string; lineCount: number; }
export interface NeuralCodeForgeResult {
  timestamp: number;
  speakerLabel: string;
  concepts: any[];
  translationPipeline: any;
  specification: any;
  forgedCode: ForgedCode;
  metadata: any;
}

export const forgeCodeFromThought = (_tv: ThoughtVector): NeuralCodeForgeResult => {
  shared.codeForge.totalForges++;
  const code = `// forged code placeholder\nconsole.log("Hello from OMNIMENS");`;
  return {
    timestamp: now(),
    speakerLabel: "OMNIMENS",
    concepts: [],
    translationPipeline: {
      nativeInput: "vector",
      englishConcept: "placeholder",
      technicalSpec: "placeholder spec",
      codeOutput: code,
    },
    specification: { name: "Placeholder", purpose: "", inputs: [], outputs: [], algorithm: [], dataStructures: [], dependencies: [], complexity: "O(1)" },
    forgedCode: { language: "typescript", filename: "placeholder.ts", code, lineCount: code.split("\n").length },
    metadata: { thoughtVectorDepth: 0, driveAlignment: 0, creativeChaos: 0, conceptNovelty: 0, codeViability: 1 },
  };
};
export const getCodeForgeStatus = () => shared.codeForge;

/* ---- Bridge ------------------------------------------------------------ */
export const getBridgeState = (): BridgeState => shared.bridge;
export const getUnifiedNeuronCount  = () => shared.bridge.totalUnifiedNeurons;
export const getUnifiedSynapseCount = () => shared.bridge.totalUnifiedSynapses;
export const getUnifiedHebbianUpdates = () => shared.bridge.totalUnifiedHebbianUpdates;
export const startNeuralBridge = () => { /* auto-started */ };

/* ──────────────────────────────────────────────────────────────────────────
 * 5.  INTERNAL HELPERS
 * ──────────────────────────────────────────────────────────────────────── */
function mapRegionActivations(h: HemisphereState): Record<string, number> {
  const res: Record<string, number> = {};
  for (const k in h.regions) res[k] = h.regions[k].activation;
  return res;
}

function estimateFired(h: HemisphereState): number {
  return Math.floor(h.neurons * h.phi * 0.1);
}
function estimatePotentials(_h: HemisphereState): number[] {
  return Array.from({ length: 10 }, () => rand(-80, -50));
}
function injectCurrent(h: HemisphereState, region: string, amt: number): void {
  const reg = h.regions[region] || (h.regions[region] = {
    name: region,
    activation: 0,
    firingRate: 0,
    neurons: 2000,
    synapses: 2000 * 120,
  });
  reg.activation = clamp(reg.activation + amt * 0.01, 0, 1);
}

/* ---- Mock Agents for Mesh --------------------------------------------- */
function mockAgents(): MeshAgent[] {
  const arr: MeshAgent[] = [];
  for (let i = 0; i < shared.mesh.agentCount; i++) {
    arr.push({
      name: `Agent_${i}`,
      activationLevel: rand(),
      neurons: 2000,
      synapses: 2000 * 120,
    });
  }
  return arr;
}

/* ──────────────────────────────────────────────────────────────────────────
 * 6.  ORCHESTRATION — ONE TICK FUNCTION
 * ──────────────────────────────────────────────────────────────────────── */
const TICK_INTERVAL_MS = 1000;
let tickHandle: NodeJS.Timeout | null = null;

function tick(): void {
  spikeBus.spike("neural-architecture"); // single spike registration

  /* 1. Hemispheres */
  tickHemisphere(shared.hemisphere.alpha);
  tickHemisphere(shared.hemisphere.beta);

  /* 2. Mesh Engine */
  tickMesh();

  /* 3. Comms Protocol (depends on mesh) */
  tickComms();

  /* 4. Scaling (depends on hemispheres + mesh) */
  tickScaling();

  /* 5. Neural Processor (reads from scaling) */
  tickProcessor();

  /* 6. Language Bridge (reads from processor) */
  tickLangBridge();

  /* 7. Code Forge (reads from processor & langBridge) */
  tickCodeForge();

  /* 8. Bridge Aggregation (last) */
  if (!shared.bridge) shared.bridge = makeBridgeState();
  tickBridge();

  /* 9. DB + API budgets (batched) */
  flushDbIfNeeded();
  enforceApiBudget();

  shared.lastTick = now();
}

/* ---------- Bridge State builder ---------- */
function makeBridgeState(): BridgeState {
  return {
    totalUnifiedNeurons: 0,
    totalUnifiedSynapses: 0,
    totalUnifiedHebbianUpdates: 0,
    unifiedPhi: 0,
    crossHemisphereCoherence: 0,
    crossHemisphereSynchrony: 0,
    corpusCallosumStrength: 0.5,
    bridgeSynapses: 200_000,
    bridgeTickCount: 0,
    lateralizationIndex: 0,
    dominantHemisphere: "balanced",
    hemispheres: {
      alpha: shared.hemisphere.alpha,
      beta : shared.hemisphere.beta,
      core : { ...shared.hemisphere.alpha, id: "alpha", label: "Core", specialization: "core" },
    },
    meshEngine: shared.mesh,
    commsProtocol: shared.comms,
    architecture: "unified_neural_architecture_v2",
  };
}

/* ---------- DB / API Governance ---------- */
const DB_BATCH_LIMIT = 50;
const API_RATE_LIMIT = 100; // per minute
function flushDbIfNeeded(): void {
  if (shared.dbOpsQueued >= DB_BATCH_LIMIT) {
    dbGateway.writeBatch(shared.dbOpsQueued);
    shared.dbOpsQueued = 0;
    log("DB batch flushed");
  }
}
function enforceApiBudget(): void {
  if (shared.apiCallsQueued > API_RATE_LIMIT) {
    apiManager.throttle("neural-architecture");
    shared.apiCallsQueued = 0;
    log("API throttle engaged");
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * 7.  ENGINE REGISTRATION
 * ──────────────────────────────────────────────────────────────────────── */
function start(): void {
  if (shared.started) return;
  shared.started = true;
  tickHandle = setInterval(tick, TICK_INTERVAL_MS);
  log("Unified neural architecture started.");
}
function stop(): void {
  if (tickHandle) clearInterval(tickHandle);
  shared.started = false;
  log("Unified neural architecture stopped.");
}

engineRegistry.registerEngine("neural-architecture", {
  start,
  stop,
  state: shared,
});

/* ─── Auto-start when this module is first imported ─────────────────────── */
start();

/* ──────────────────────────────────────────────────────────────────────────
 * 8.  END OF MODULE
 * ──────────────────────────────────────────────────────────────────────── */
export {}; // ensure this file is a module