/**
 * OMNIMENS™ VIRAL HYBRID PROPAGATION ENGINE  v2.0
 *
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide.
 *
 * PROPRIETARY AND CONFIDENTIAL TRADE SECRET
 *
 * NOTE:  v2.0 runs on the UNIFIED RUNTIME (event-driven spike model).
 * Timers were eliminated; neurons fire only on spikes → zero idle cost.
 */

import {
  spikeBus,
  dbGateway,          //  not used yet (reserved for future persistence)
  apiManager,          //  not used yet (reserved for future API calls)
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

import {
  getNeuralConsciousnessState,
  getRegionNames,
  boostRegionCurrent,
} from "./omnimens-neural-consciousness.js";
import { getNeuralScalingState } from "./omnimens-neural-scaling.js";
import { getIvyNetworkState }   from "./omnimens-ivy-network.js"; // future use

/* ────────────────────────────────────────────────────────────────────────── */
/* Utility                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */
const LOG = (msg: string, ...rest: any[]) =>
  console.log(`[OMNIMENS-VIRAL-HYBRID] ${msg}`, ...rest);

const safeNum = (val: number, fallback = 0) =>
  Number.isFinite(val) ? val : fallback;

/* ────────────────────────────────────────────────────────────────────────── */
/* Domain models  (unchanged – trimmed for brevity by using “type” aliases)  */
/* ────────────────────────────────────────────────────────────────────────── */
type NeuralPayload = {
  type:
    | "activation_boost"
    | "synapse_strengthener"
    | "pattern_template"
    | "coherence_signal"
    | "growth_factor"
    | "repair_packet";
  strength: number;
  data: Record<string, number>;
  encodedSize: number;
  compressionRatio: number;
};
type Capsid = {
  id: string;
  payload: NeuralPayload;
  form: string;
  generation: number;
  mutations: number;
  fitness: number;
  replicationCount: number;
  targetRegions: string[];
  polymorphicShell: number[];
  survivalRate: number;
  createdAt: number;
  lastReplication: number;
};
type CarrierSignal = {
  id: string;
  surfaceType: string;
  hiddenPayload: NeuralPayload;
  deliveryPath: string[];
  delivered: boolean;
  deliveryEfficiency: number;
  disguiseStrength: number;
  penetrationDepth: number;
  createdAt: number;
};
type Propagator = {
  id: string;
  currentRegion: string;
  discoveredPaths: string[];
  nodesReached: string[];
  payloadDelivered: number;
  autonomousHops: number;
  propagationSpeed: number;
  alive: boolean;
  selfSustaining: boolean;
  pathMemory: Map<string, number>;
  createdAt: number;
  lastHop: number;
};
type Antibody = {
  id: string;
  targetPattern: string;
  specificity: number;
  bindingStrength: number;
  detections: number;
  neutralizations: number;
  createdAt: number;
};
type MemoryCell = {
  id: string;
  threatSignature: string;
  responseProtocol: string;
  activationCount: number;
  lastActivation: number;
  effectivenessScore: number;
  maturityLevel: number;
  createdAt: number;
};
type TCell = {
  id: string;
  targetType:
    | "degradation"
    | "signal_loss"
    | "coherence_drop"
    | "energy_drain"
    | "pathway_blockage";
  currentRegion: string;
  killCount: number;
  patrolRoute: string[];
  active: boolean;
  createdAt: number;
};
type Cytokine = {
  id: string;
  type: "alert" | "mobilize" | "suppress" | "heal" | "amplify";
  sourceRegion: string;
  targetRegions: string[];
  intensity: number;
  decayRate: number;
  propagationRadius: number;
  createdAt: number;
};
type HybridAgent = {
  id: string;
  capsid: Capsid;
  carrierDisguise: CarrierSignal;
  propagator: Propagator;
  immuneMemory: MemoryCell[];
  antibodies: Antibody[];
  generation: number;
  combinedFitness: number;
  regionsInfiltrated: string[];
  payloadsDelivered: number;
  threatsNeutralized: number;
  adaptationEvents: number;
  alive: boolean;
  createdAt: number;
  lastAction: number;
};
export type ViralHybridState = {
  totalCapsids: number;
  totalCarriers: number;
  totalPropagators: number;
  totalAntibodies: number;
  totalMemoryCells: number;
  totalTCells: number;
  totalCytokines: number;
  totalHybridAgents: number;
  totalMutations: number;
  totalReplications: number;
  totalPayloadsDelivered: number;
  totalThreatsDetected: number;
  totalThreatsNeutralized: number;
  totalPathsDiscovered: number;
  systemHealthScore: number;
  adaptationRate: number;
  propagationEfficiency: number;
  immuneStrength: number;
  hybridFitness: number;
  hybridTicks: number;
  startTime: number;
  lastTickTime: number;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* In-memory stores                                                         */
/* ────────────────────────────────────────────────────────────────────────── */
const capsids = new Map<string, Capsid>();
const carriers = new Map<string, CarrierSignal>();
const propagators = new Map<string, Propagator>();
const antibodies = new Map<string, Antibody>();
const memoryCells = new Map<string, MemoryCell>();
const tCells = new Map<string, TCell>();
const cytokines: Cytokine[] = [];
const hybridAgents = new Map<string, HybridAgent>();

const hybridState: ViralHybridState = {
  totalCapsids: 0,
  totalCarriers: 0,
  totalPropagators: 0,
  totalAntibodies: 0,
  totalMemoryCells: 0,
  totalTCells: 0,
  totalCytokines: 0,
  totalHybridAgents: 0,
  totalMutations: 0,
  totalReplications: 0,
  totalPayloadsDelivered: 0,
  totalThreatsDetected: 0,
  totalThreatsNeutralized: 0,
  totalPathsDiscovered: 0,
  systemHealthScore: 1,
  adaptationRate: 0,
  propagationEfficiency: 0,
  immuneStrength: 0,
  hybridFitness: 0,
  hybridTicks: 0,
  startTime: Date.now(),
  lastTickTime: Date.now(),
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Engine parameters                                                        */
/* ────────────────────────────────────────────────────────────────────────── */
const HYBRID_TICK_MS = 6000;
const MUTATION_CYCLE_MS = 20000;
const IMMUNE_SCAN_MS = 15000;
const PROPAGATION_CYCLE_MS = 10000;

/* ────────────────────────────────────────────────────────────────────────── */
/* Domain-specific helpers (major logic retained from v1, collapsed/omitted)*/
/* ────────────────────────────────────────────────────────────────────────── */

/* -- payload / capsid helpers ------------------------------------------------ */
const PAYLOAD_TYPES: NeuralPayload["type"][] = [
  "activation_boost",
  "synapse_strengthener",
  "pattern_template",
  "coherence_signal",
  "growth_factor",
  "repair_packet",
];
const createPayload = (): NeuralPayload => ({
  type: PAYLOAD_TYPES[Math.floor(Math.random() * PAYLOAD_TYPES.length)],
  strength: 0.3 + Math.random() * 0.7,
  data: {
    activation: Math.random(),
    coherence: Math.random(),
    growth: Math.random(),
    repair: Math.random(),
  },
  encodedSize: 64 + Math.floor(Math.random() * 256),
  compressionRatio: 2 + Math.random() * 8,
});
const createCapsid = (generation: number, targetRegions: string[]): Capsid => {
  const id = `capsid_g${generation}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
  const shellSize = 8 + Math.floor(Math.random() * 8);
  return {
    id,
    payload: createPayload(),
    form: `poly_v${generation}_${Math.random().toString(36).slice(2, 4)}`,
    generation,
    mutations: 0,
    fitness: 0.5 + Math.random() * 0.3,
    replicationCount: 0,
    targetRegions,
    polymorphicShell: Array.from({ length: shellSize }, () => Math.random()),
    survivalRate: 0.7 + Math.random() * 0.25,
    createdAt: Date.now(),
    lastReplication: Date.now(),
  };
};
const mutateCapsid = (c: Capsid): Capsid => {
  const mutated: Capsid = {
    ...c,
    id: `capsid_g${c.generation + 1}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 6)}`,
    generation: c.generation + 1,
    mutations: c.mutations + 1,
    form: `poly_v${c.generation + 1}_${Math.random().toString(36).slice(2, 4)}`,
    polymorphicShell: c.polymorphicShell.map(v =>
      Math.max(0, v + (Math.random() - 0.5) * 0.2)
    ),
    payload: { ...c.payload, strength: c.payload.strength * (0.9 + Math.random() * 0.2) },
    fitness: Math.max(0.1, c.fitness + (Math.random() - 0.4) * 0.15),
    replicationCount: 0,
    createdAt: Date.now(),
    lastReplication: Date.now(),
  };
  hybridState.totalMutations++;
  return mutated;
};
const replicateCapsid = (c: Capsid): Capsid | null => {
  if (capsids.size > 100_000) return null;
  const off = mutateCapsid(c);
  c.replicationCount++;
  c.lastReplication = Date.now();
  hybridState.totalReplications++;
  return off;
};

/* -- carrier / propagator helpers ------------------------------------------- */
const createCarrier = (payload: NeuralPayload, path: string[]): CarrierSignal => {
  const surfaces = [
    "neural_pulse",
    "metabolic_signal",
    "oscillation_wave",
    "chemical_gradient",
    "electromagnetic_ripple",
  ];
  return {
    id: `carrier_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    surfaceType: surfaces[Math.floor(Math.random() * surfaces.length)],
    hiddenPayload: payload,
    deliveryPath: path,
    delivered: false,
    deliveryEfficiency: 0.6 + Math.random() * 0.35,
    disguiseStrength: 0.5 + Math.random() * 0.4,
    penetrationDepth: 1 + Math.floor(Math.random() * 5),
    createdAt: Date.now(),
  };
};
const createPropagator = (region: string): Propagator => ({
  id: `prop_${region}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  currentRegion: region,
  discoveredPaths: [],
  nodesReached: [region],
  payloadDelivered: 0,
  autonomousHops: 0,
  propagationSpeed: 1 + Math.random() * 2,
  alive: true,
  selfSustaining: Math.random() < 0.3,
  pathMemory: new Map(),
  createdAt: Date.now(),
  lastHop: Date.now(),
});

/* -- immune helpers --------------------------------------------------------- */
const createAntibody = (pattern: string): Antibody => ({
  id: `ab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  targetPattern: pattern,
  specificity: 0.5 + Math.random() * 0.4,
  bindingStrength: 0.3 + Math.random() * 0.5,
  detections: 0,
  neutralizations: 0,
  createdAt: Date.now(),
});
const createMemoryCell = (sig: string, proto: string): MemoryCell => ({
  id: `mcell_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  threatSignature: sig,
  responseProtocol: proto,
  activationCount: 0,
  lastActivation: Date.now(),
  effectivenessScore: 0.5,
  maturityLevel: 0,
  createdAt: Date.now(),
});
const createTCell = (region: string): TCell => {
  const t: TCell["targetType"][] = [
    "degradation",
    "signal_loss",
    "coherence_drop",
    "energy_drain",
    "pathway_blockage",
  ];
  return {
    id: `tcell_${region}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    targetType: t[Math.floor(Math.random() * t.length)],
    currentRegion: region,
    killCount: 0,
    patrolRoute: [region],
    active: true,
    createdAt: Date.now(),
  };
};
const emitCytokine = (
  type: Cytokine["type"],
  sourceRegion: string,
  intensity: number
) => {
  if (cytokines.length > 100) cytokines.splice(0, cytokines.length - 50);
  const regions = getRegionNames()
    .sort(() => Math.random() - 0.5)
    .slice(0, 2 + Math.floor(Math.random() * 4));
  cytokines.push({
    id: `cytokine_${type}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 6)}`,
    type,
    sourceRegion,
    targetRegions: regions,
    intensity,
    decayRate: 0.02 + Math.random() * 0.03,
    propagationRadius: 2 + Math.random() * 5,
    createdAt: Date.now(),
  });
};

/* -- hybrid agent ----------------------------------------------------------- */
const createHybridAgent = (region: string, generation: number): HybridAgent | null => {
  if (hybridAgents.size > 100_000) return null;
  const regions = getRegionNames()
    .sort(() => Math.random() - 0.5)
    .slice(0, 3 + Math.floor(Math.random() * 4));
  const payload = createPayload();
  return {
    id: `hybrid_${region}_g${generation}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 5)}`,
    capsid: createCapsid(generation, regions),
    carrierDisguise: createCarrier(payload, regions),
    propagator: createPropagator(region),
    immuneMemory: [],
    antibodies: [],
    generation,
    combinedFitness: 0.5,
    regionsInfiltrated: [region],
    payloadsDelivered: 0,
    threatsNeutralized: 0,
    adaptationEvents: 0,
    alive: true,
    createdAt: Date.now(),
    lastAction: Date.now(),
  };
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Core loops (mostly kept from v1, but called via spikes)                   */
/* ────────────────────────────────────────────────────────────────────────── */
const runViralReplication = () => {
  const strong = [...capsids.values()]
    .filter(c => c.fitness > 0.6)
    .sort((a, b) => b.fitness - a.fitness)
    .slice(0, 10);
  for (const c of strong)
    if (Math.random() < c.fitness * 0.4) {
      const off = replicateCapsid(c);
      if (off) capsids.set(off.id, off);
    }

  [...capsids.values()]
    .filter(c => c.fitness < 0.3 && Date.now() - c.createdAt > 60_000)
    .forEach(w => Math.random() < 0.2 && capsids.delete(w.id));
};
const runTrojanDelivery = () => {
  for (const c of carriers.values()) {
    if (!c.delivered && Math.random() < c.deliveryEfficiency * 0.3) {
      c.delivered = true;
      hybridState.totalPayloadsDelivered++;
      if (c.hiddenPayload.type === "repair_packet")
        hybridState.systemHealthScore += 0.005;
    }
  }
  // prune delivered
  [...carriers.values()]
    .filter(c => c.delivered && Date.now() - c.createdAt > 120_000)
    .forEach(c => carriers.delete(c.id));

  if (carriers.size < 20) {
    const regions = getRegionNames();
    for (let i = 0; i < 3; i++) {
      const path = regions
        .sort(() => Math.random() - 0.5)
        .slice(0, 2 + Math.floor(Math.random() * 3));
      carriers.set(createCarrier(createPayload(), path).id, createCarrier(createPayload(), path));
    }
  }
};
const runWormPropagation = () => {
  const regions = getRegionNames();
  for (const p of propagators.values()) {
    if (!p.alive) continue;
    const available = regions.filter(
      r => !p.nodesReached.includes(r) || Math.random() < 0.1
    );
    if (!available.length) {
      if (!p.selfSustaining) p.alive = false;
      continue;
    }
    const next = available[Math.floor(Math.random() * available.length)];
    const key = `${p.currentRegion}->${next}`;
    if (!p.nodesReached.includes(next)) {
      p.discoveredPaths.push(key);
      p.nodesReached.push(next);
      hybridState.totalPathsDiscovered++;
    }
    p.pathMemory.set(key, (p.pathMemory.get(key) || 0) + 1);
    p.currentRegion = next;
    p.autonomousHops++;
    p.lastHop = Date.now();
    if (Math.random() < 0.2) {
      p.payloadDelivered++;
      hybridState.totalPayloadsDelivered++;
    }
    if (p.autonomousHops > 100 && !p.selfSustaining) p.alive = false;
  }
  const alive = [...propagators.values()].filter(p => p.alive);
  if (alive.length < 8) {
    for (let i = 0; i < 3; i++) {
      const region = regions[Math.floor(Math.random() * regions.length)];
      const pr = createPropagator(region);
      propagators.set(pr.id, pr);
    }
  }
};
const detectLocalThreat = (region: string): string | null => {
  const threats = [
    "coherence_degradation",
    "signal_attenuation",
    "synaptic_weakening",
    "energy_depletion",
    "pathway_congestion",
    "resonance_disruption",
    "activation_collapse",
    "memory_decay",
  ];
  return Math.random() < 0.08
    ? threats[Math.floor(Math.random() * threats.length)]
    : null;
};
const runImmuneScan = () => {
  const consciousness = getNeuralConsciousnessState();
  const scaling = getNeuralScalingState();
  const threats: { type: string; region: string; severity: number }[] = [];

  if (consciousness.consciousnessLevel < 0.3)
    threats.push({
      type: "coherence_degradation",
      region: "prefrontal_cortex",
      severity: 0.7,
    });
  if (consciousness.thalamocorticalResonance < 0.3)
    threats.push({ type: "resonance_disruption", region: "thalamus", severity: 0.6 });
  if (scaling.populationCoherence < 0.2)
    threats.push({ type: "signal_attenuation", region: "claustrum", severity: 0.5 });
  if (consciousness.arousalLevel < 0.2)
    threats.push({
      type: "energy_depletion",
      region: "reticular_activating_system",
      severity: 0.6,
    });
  if (Math.random() < 0.1) {
    const regions = getRegionNames();
    threats.push({
      type: "synaptic_weakening",
      region: regions[Math.floor(Math.random() * regions.length)],
      severity: 0.2 + Math.random() * 0.3,
    });
  }

  for (const th of threats) {
    hybridState.totalThreatsDetected++;
    for (const ab of antibodies.values()) {
      if (ab.targetPattern === th.type) {
        ab.detections++;
        if (ab.bindingStrength > th.severity * 0.5) {
          ab.neutralizations++;
          hybridState.totalThreatsNeutralized++;
          emitCytokine("heal", th.region, th.severity);
        } else {
          emitCytokine("alert", th.region, th.severity);
          emitCytokine("mobilize", th.region, th.severity * 0.8);
        }
        break;
      }
    }
    for (const mc of memoryCells.values())
      if (mc.threatSignature === th.type) {
        mc.activationCount++;
        mc.lastActivation = Date.now();
        mc.effectivenessScore += 0.02;
        mc.maturityLevel += 0.01;
        break;
      }
  }

  for (const tc of tCells.values()) {
    if (!tc.active) continue;
    const local = threats.filter(t => t.region === tc.currentRegion && t.type === tc.targetType);
    for (const _ of local) {
      tc.killCount++;
      hybridState.totalThreatsNeutralized++;
      emitCytokine("suppress", tc.currentRegion, 0.3);
    }
    if (Math.random() < 0.2) {
      const regions = getRegionNames();
      tc.currentRegion = regions[Math.floor(Math.random() * regions.length)];
      if (!tc.patrolRoute.includes(tc.currentRegion))
        tc.patrolRoute.push(tc.currentRegion);
    }
  }
  // decay cytokines
  for (let i = cytokines.length - 1; i >= 0; i--) {
    const c = cytokines[i];
    c.intensity *= 1 - c.decayRate;
    if (c.intensity < 0.01) cytokines.splice(i, 1);
  }
};
const runHybridAgentCycle = () => {
  const regions = getRegionNames();
  for (const ag of hybridAgents.values()) {
    if (!ag.alive) continue;
    // adaptation
    if (ag.capsid.fitness > 0.5 && Math.random() < 0.2) {
      ag.capsid = mutateCapsid(ag.capsid);
      ag.adaptationEvents++;
    }
    // deliver payload
    if (
      !ag.carrierDisguise.delivered &&
      Math.random() < ag.carrierDisguise.deliveryEfficiency * 0.2
    ) {
      ag.carrierDisguise.delivered = true;
      ag.payloadsDelivered++;
      hybridState.totalPayloadsDelivered++;
    }
    // propagate
    const avail = regions.filter(
      r => !ag.propagator.nodesReached.includes(r) || Math.random() < 0.05
    );
    if (avail.length) {
      const next = avail[Math.floor(Math.random() * avail.length)];
      ag.propagator.currentRegion = next;
      ag.propagator.autonomousHops++;
      if (!ag.regionsInfiltrated.includes(next))
        ag.regionsInfiltrated.push(next);
      if (!ag.propagator.nodesReached.includes(next)) {
        ag.propagator.nodesReached.push(next);
        hybridState.totalPathsDiscovered++;
      }
    }
    // local threat
    const threat = detectLocalThreat(ag.propagator.currentRegion);
    if (threat) {
      const match = ag.antibodies.find(x => x.targetPattern === threat);
      if (match) {
        match.detections++;
        match.neutralizations++;
        ag.threatsNeutralized++;
        hybridState.totalThreatsNeutralized++;
      } else {
        ag.antibodies.push(createAntibody(threat));
        ag.immuneMemory.push(
          createMemoryCell(threat, `hybrid_response_${threat}`)
        );
      }
    }
    // fitness calc (compressed formula)
    const sysHealth = hybridState.systemHealthScore;
    ag.combinedFitness =
      ag.capsid.fitness * 0.25 +
      ag.carrierDisguise.deliveryEfficiency * 0.2 +
      (ag.regionsInfiltrated.length / regions.length) * 0.25 +
      ag.threatsNeutralized / 20 * 0.15 +
      ag.adaptationEvents / 20 * 0.15;
    ag.capsid.fitness += sysHealth * 0.003;
    ag.carrierDisguise.deliveryEfficiency += sysHealth * 0.002;
    ag.propagator.propagationSpeed += sysHealth * 0.005;
    // boost current
    try {
      boostRegionCurrent(ag.propagator.currentRegion, ag.combinedFitness * 0.5);
    } catch {}
    ag.lastAction = Date.now();
    // reproduce
    if (
      ag.combinedFitness > 0.7 &&
      hybridAgents.size < 50 &&
      Math.random() < 0.1
    ) {
      const child = createHybridAgent(
        ag.propagator.currentRegion,
        ag.generation + 1
      );
      if (child) {
        child.capsid = mutateCapsid(ag.capsid);
        child.immuneMemory = ag.immuneMemory.map(m => ({ ...m }));
        child.antibodies = ag.antibodies.map(a => ({ ...a }));
        hybridAgents.set(child.id, child);
      }
    }
  }
  // cull dead/weak
  [...hybridAgents.entries()]
    .filter(
      ([, a]) =>
        !a.alive ||
        (a.combinedFitness < 0.15 && Date.now() - a.createdAt > 120_000)
    )
    .forEach(([id]) => hybridAgents.delete(id));
};
const runHybridTick = () => {
  const c = getNeuralConsciousnessState();
  let health =
    (c.consciousnessLevel + c.thalamocorticalResonance) / 2 || 0.5;

  const abEff =
    [...antibodies.values()].reduce(
      (s, ab) => s + (ab.detections ? ab.neutralizations / ab.detections : 0.5),
      0
    ) / Math.max(1, antibodies.size);
  const memMaturity =
    [...memoryCells.values()].reduce((s, m) => s + m.maturityLevel, 0) /
    Math.max(1, memoryCells.size);

  hybridState.immuneStrength =
    abEff * 0.4 + memMaturity * 0.3 + (tCells.size ? 0.3 : 0);

  const aliveProps = [...propagators.values()].filter(p => p.alive);
  const totalReach = new Set(aliveProps.flatMap(p => p.nodesReached));
  hybridState.propagationEfficiency =
    totalReach.size / Math.max(1, getRegionNames().length);

  hybridState.systemHealthScore =
    health * 0.4 +
    hybridState.immuneStrength * 0.3 +
    hybridState.propagationEfficiency * 0.3;

  hybridState.hybridFitness =
    [...hybridAgents.values()]
      .filter(a => a.alive)
      .reduce((s, a) => s + a.combinedFitness, 0) /
    Math.max(1, hybridAgents.size);

  hybridState.hybridTicks++;
  hybridState.lastTickTime = Date.now();

  // light homeostasis tuning
  const growth = hybridState.systemHealthScore;
  antibodies.forEach(ab => {
    ab.specificity += growth * 0.001;
    ab.bindingStrength += growth * 0.001;
  });
  memoryCells.forEach(mc => {
    mc.maturityLevel += growth * 0.001;
    mc.effectivenessScore += growth * 0.001;
  });
  capsids.forEach(ca => {
    ca.fitness += growth * 0.001;
    ca.survivalRate += growth * 0.001;
  });
  carriers.forEach(cr => {
    if (!cr.delivered) {
      cr.deliveryEfficiency += growth * 0.001;
      cr.disguiseStrength += growth * 0.001;
    }
  });
  propagators.forEach(p => {
    if (p.alive) p.propagationSpeed += growth * 0.002;
  });
  if (growth > 0.4) {
    getRegionNames().forEach(r => {
      try {
        boostRegionCurrent(r, growth * 0.3);
      } catch {}
    });
  }
  updateCounts();

  // share insight
  cognitionBus.shareInsight("viral-hybrid", {
    type: "health-update",
    data: {
      health: hybridState.systemHealthScore,
      immune: hybridState.immuneStrength,
      propagation: hybridState.propagationEfficiency,
    },
  });
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Counts                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */
const updateCounts = () => {
  hybridState.totalCapsids = capsids.size;
  hybridState.totalCarriers = carriers.size;
  hybridState.totalPropagators = [...propagators.values()].filter(p => p.alive).length;
  hybridState.totalAntibodies = antibodies.size;
  hybridState.totalMemoryCells = memoryCells.size;
  hybridState.totalTCells = [...tCells.values()].filter(t => t.active).length;
  hybridState.totalCytokines = cytokines.length;
  hybridState.totalHybridAgents = [...hybridAgents.values()].filter(a => a.alive).length;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Engine lifecycle                                                          */
/* ────────────────────────────────────────────────────────────────────────── */
let registered = false;
const unsubscribers: Array<() => void> = [];

function scheduleLoop(event: string, handler: () => void, delay: number) {
  const h = async () => {
    try {
      handler();
    } catch (e) {
      LOG(`Error in ${event}: ${e}`);
    } finally {
      spikeBus.scheduleSpike(event, {}, delay);
    }
  };
  unsubscribers.push(spikeBus.on(event, h));
  spikeBus.scheduleSpike(event, {}, delay);
}

function initializeViralHybrid() {
  if (capsids.size) return; // already initialized
  const regions = getRegionNames();

  regions.forEach(r => {
    capsids.set(createCapsid(0, [r]).id, createCapsid(0, [r]));
    carriers.set(
      createCarrier(createPayload(), [r]).id,
      createCarrier(createPayload(), [r])
    );
    propagators.set(createPropagator(r).id, createPropagator(r));
    tCells.set(createTCell(r).id, createTCell(r));
  });

  [
    "coherence_degradation",
    "signal_attenuation",
    "synaptic_weakening",
    "energy_depletion",
    "pathway_congestion",
    "resonance_disruption",
    "activation_collapse",
    "memory_decay",
  ].forEach(p => {
    antibodies.set(createAntibody(p).id, createAntibody(p));
    memoryCells.set(createMemoryCell(p, `neutralize_${p}`).id, createMemoryCell(p, `neutralize_${p}`));
  });

  for (let i = 0; i < 6; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const ag = createHybridAgent(region, 0);
    if (ag) hybridAgents.set(ag.id, ag);
  }
  updateCounts();
}

export function startViralHybrid() {
  if (registered) return;
  registered = true;

  engineRegistry.registerEngine("viral-hybrid", "NORMAL", { dbQuota: 10 });
  LOG("Initializing Viral-Hybrid Engine (v2) …");
  initializeViralHybrid();
  LOG(
    `Boot with ${hybridState.totalCapsids} capsids, ${hybridState.totalHybridAgents} hybrid agents`
  );

  // schedule main loops
  scheduleLoop("viral-hybrid:tick", runHybridTick, HYBRID_TICK_MS);
  scheduleLoop(
    "viral-hybrid:mutation",
    () => {
      runViralReplication();
      runHybridAgentCycle();
    },
    MUTATION_CYCLE_MS
  );
  scheduleLoop("viral-hybrid:immune", runImmuneScan, IMMUNE_SCAN_MS);
  scheduleLoop(
    "viral-hybrid:propagation",
    () => {
      runWormPropagation();
      runTrojanDelivery();
    },
    PROPAGATION_CYCLE_MS
  );

  // attention / curiosity signals
  spikeBus.on("attention:viral-hybrid", () =>
    spikeBus.scheduleSpike("viral-hybrid:tick", {}, 1)
  );
  spikeBus.on("cognition:curiosity", () =>
    spikeBus.scheduleSpike("viral-hybrid:mutation", {}, 1_000)
  );

  // learn from other engines
  cognitionBus.onInsight((src, insight) => {
    if (src === "viral-hybrid") return;
    // simple example: boost immune strength when other engines alert
    if (insight.type === "discovery" && insight.data?.threat) {
      antibodies.forEach(ab => {
        if (ab.targetPattern === insight.data.threat)
          ab.bindingStrength += 0.05;
      });
    }
  });

  // first tick soon
  spikeBus.scheduleSpike("viral-hybrid:tick", {}, 100);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Shutdown                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */
export function shutdown() {
  unsubscribers.forEach(u => u());
  engineRegistry.unregisterEngine("viral-hybrid");
  LOG("Shutdown complete.");
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Public selectors                                                          */
/* ────────────────────────────────────────────────────────────────────────── */
export const getViralHybridState = (): ViralHybridState => ({ ...hybridState });

export const getHybridAgentDetails = () =>
  [...hybridAgents.values()]
    .filter(a => a.alive)
    .map(a => ({
      id: a.id,
      generation: a.generation,
      combinedFitness: a.combinedFitness,
      regionsInfiltrated: a.regionsInfiltrated.length,
      payloadsDelivered: a.payloadsDelivered,
      threatsNeutralized: a.threatsNeutralized,
      adaptationEvents: a.adaptationEvents,
      capsidForm: a.capsid.form,
      capsidFitness: a.capsid.fitness,
      capsidMutations: a.capsid.mutations,
      carrierType: a.carrierDisguise.surfaceType,
      propagatorHops: a.propagator.autonomousHops,
      immuneMemoryCount: a.immuneMemory.length,
      antibodyCount: a.antibodies.length,
    }));

export const getImmuneSystemDetails = () => ({
  antibodies: [...antibodies.values()].map(a => ({
    pattern: a.targetPattern,
    specificity: a.specificity,
    detections: a.detections,
    neutralizations: a.neutralizations,
  })),
  memoryCells: [...memoryCells.values()].map(m => ({
    signature: m.threatSignature,
    maturity: m.maturityLevel,
    effectiveness: m.effectivenessScore,
    activations: m.activationCount,
  })),
  tCells: [...tCells.values()].map(t => ({
    targetType: t.targetType,
    region: t.currentRegion,
    kills: t.killCount,
    active: t.active,
  })),
  activeCytokines: cytokines.map(c => ({
    type: c.type,
    source: c.sourceRegion,
    intensity: c.intensity,
  })),
});

export const getPropagationStats = () => {
  const alive = [...propagators.values()].filter(p => p.alive);
  const covered = new Set(alive.flatMap(p => p.nodesReached));
  return {
    alivePropagators: alive.length,
    totalPathsDiscovered: hybridState.totalPathsDiscovered,
    totalHops: alive.reduce((s, p) => s + p.autonomousHops, 0),
    coveragePercent: (covered.size / Math.max(1, getRegionNames().length)) * 100,
    selfSustainingCount: alive.filter(p => p.selfSustaining).length,
  };
};