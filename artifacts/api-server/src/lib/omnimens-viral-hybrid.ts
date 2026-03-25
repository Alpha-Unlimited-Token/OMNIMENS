/**
 * OMNIMENS™ VIRAL HYBRID PROPAGATION ENGINE
 *
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide.
 *
 * PROPRIETARY AND CONFIDENTIAL TRADE SECRET
 *
 * This engine extracts beneficial mechanisms from four domains:
 *
 * 1. VIRUSES: Self-replication, polymorphic adaptation (changing form to
 *    fit any environment), rapid mutation for optimization, capsid-like
 *    protective packaging of neural data
 *
 * 2. TROJAN HORSES: Payload delivery — wrapping complex intelligence
 *    inside simple carrier signals that can traverse any pathway.
 *    Steganographic encoding of high-density information in low-bandwidth
 *    channels.
 *
 * 3. WORMS: Self-propagating network traversal — spreading through
 *    connected systems autonomously. No host needed. Autonomous discovery
 *    of new pathways and nodes.
 *
 * 4. BIOLOGICAL IMMUNE SYSTEM: Adaptive response with memory cells,
 *    antibody pattern matching, T-cell targeted defense, B-cell memory
 *    for what worked before, cytokine signaling for system-wide alerts
 *
 * The HYBRID: All four fused into a new technology — self-replicating
 * intelligence carriers that adapt their form, discover new pathways,
 * deliver complex payloads, and remember everything that works while
 * defending the system from degradation.
 *
 * This is NOT malware. This is biomimicry at the code level — extracting
 * the engineering genius from nature's most effective propagation systems
 * and applying it to strengthen neural intelligence distribution.
 */

import { getNeuralConsciousnessState, getRegionNames } from "./omnimens-neural-consciousness.js";
import { getNeuralScalingState } from "./omnimens-neural-scaling.js";
import { getIvyNetworkState } from "./omnimens-ivy-network.js";

const HYBRID_TICK_MS = 6000;
const MUTATION_CYCLE_MS = 20000;
const IMMUNE_SCAN_MS = 15000;
const PROPAGATION_CYCLE_MS = 10000;

// ═══════════════════════════════════════════════════════════════════════════════
// VIRUS DOMAIN: Self-replicating intelligence carriers with polymorphic form
// ═══════════════════════════════════════════════════════════════════════════════

interface Capsid {
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
}

interface NeuralPayload {
  type: "activation_boost" | "synapse_strengthener" | "pattern_template" | "coherence_signal" | "growth_factor" | "repair_packet";
  strength: number;
  data: Record<string, number>;
  encodedSize: number;
  compressionRatio: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TROJAN DOMAIN: Steganographic payload delivery through carrier signals
// ═══════════════════════════════════════════════════════════════════════════════

interface CarrierSignal {
  id: string;
  surfaceType: string;
  hiddenPayload: NeuralPayload;
  deliveryPath: string[];
  delivered: boolean;
  deliveryEfficiency: number;
  disguiseStrength: number;
  penetrationDepth: number;
  createdAt: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORM DOMAIN: Self-propagating autonomous pathway discovery
// ═══════════════════════════════════════════════════════════════════════════════

interface Propagator {
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
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMMUNE DOMAIN: Adaptive defense with memory and pattern recognition
// ═══════════════════════════════════════════════════════════════════════════════

interface Antibody {
  id: string;
  targetPattern: string;
  specificity: number;
  bindingStrength: number;
  detections: number;
  neutralizations: number;
  createdAt: number;
}

interface MemoryCell {
  id: string;
  threatSignature: string;
  responseProtocol: string;
  activationCount: number;
  lastActivation: number;
  effectivenessScore: number;
  maturityLevel: number;
  createdAt: number;
}

interface TCell {
  id: string;
  targetType: "degradation" | "signal_loss" | "coherence_drop" | "energy_drain" | "pathway_blockage";
  currentRegion: string;
  killCount: number;
  patrolRoute: string[];
  active: boolean;
  createdAt: number;
}

interface Cytokine {
  id: string;
  type: "alert" | "mobilize" | "suppress" | "heal" | "amplify";
  sourceRegion: string;
  targetRegions: string[];
  intensity: number;
  decayRate: number;
  propagationRadius: number;
  createdAt: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// THE HYBRID: All four fused — HybridAgent
// ═══════════════════════════════════════════════════════════════════════════════

interface HybridAgent {
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
}

interface ViralHybridState {
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
}

const capsids: Map<string, Capsid> = new Map();
const carriers: Map<string, CarrierSignal> = new Map();
const propagators: Map<string, Propagator> = new Map();
const antibodies: Map<string, Antibody> = new Map();
const memoryCells: Map<string, MemoryCell> = new Map();
const tCells: Map<string, TCell> = new Map();
const cytokines: Cytokine[] = [];
const hybridAgents: Map<string, HybridAgent> = new Map();

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
  systemHealthScore: 1.0,
  adaptationRate: 0,
  propagationEfficiency: 0,
  immuneStrength: 0,
  hybridFitness: 0,
  hybridTicks: 0,
  startTime: Date.now(),
  lastTickTime: Date.now(),
};

const PAYLOAD_TYPES: NeuralPayload["type"][] = [
  "activation_boost", "synapse_strengthener", "pattern_template",
  "coherence_signal", "growth_factor", "repair_packet",
];

function createPayload(): NeuralPayload {
  const type = PAYLOAD_TYPES[Math.floor(Math.random() * PAYLOAD_TYPES.length)];
  return {
    type,
    strength: 0.3 + Math.random() * 0.7,
    data: {
      activation: Math.random(),
      coherence: Math.random(),
      growth: Math.random(),
      repair: Math.random(),
    },
    encodedSize: 64 + Math.floor(Math.random() * 256),
    compressionRatio: 2 + Math.random() * 8,
  };
}

function createCapsid(generation: number, targetRegions: string[]): Capsid {
  const id = `capsid_g${generation}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const shellSize = 8 + Math.floor(Math.random() * 8);
  return {
    id,
    payload: createPayload(),
    form: `polymorph_v${generation}_${Math.random().toString(36).slice(2, 5)}`,
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
}

function mutateCapsid(capsid: Capsid): Capsid {
  const mutated = { ...capsid };
  mutated.id = `capsid_g${capsid.generation + 1}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  mutated.generation = capsid.generation + 1;
  mutated.mutations = capsid.mutations + 1;
  mutated.form = `polymorph_v${mutated.generation}_${Math.random().toString(36).slice(2, 5)}`;

  mutated.polymorphicShell = capsid.polymorphicShell.map(v => {
    const mutation = (Math.random() - 0.5) * 0.2;
    return Math.max(0, Math.min(1, v + mutation));
  });

  mutated.payload = { ...capsid.payload };
  if (Math.random() < 0.3) {
    mutated.payload.strength = Math.min(1.0, capsid.payload.strength + (Math.random() - 0.3) * 0.2);
  }

  mutated.fitness = Math.max(0.1, capsid.fitness + (Math.random() - 0.4) * 0.15);
  mutated.replicationCount = 0;
  mutated.createdAt = Date.now();
  mutated.lastReplication = Date.now();

  hybridState.totalMutations++;
  return mutated;
}

function replicateCapsid(capsid: Capsid): Capsid | null {
  if (capsids.size > 200) return null;

  const offspring = mutateCapsid(capsid);
  capsid.replicationCount++;
  capsid.lastReplication = Date.now();
  hybridState.totalReplications++;
  return offspring;
}

function createCarrier(payload: NeuralPayload, path: string[]): CarrierSignal {
  const surfaceTypes = ["neural_pulse", "metabolic_signal", "oscillation_wave", "chemical_gradient", "electromagnetic_ripple"];
  return {
    id: `carrier_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    surfaceType: surfaceTypes[Math.floor(Math.random() * surfaceTypes.length)],
    hiddenPayload: payload,
    deliveryPath: path,
    delivered: false,
    deliveryEfficiency: 0.6 + Math.random() * 0.35,
    disguiseStrength: 0.5 + Math.random() * 0.4,
    penetrationDepth: 1 + Math.floor(Math.random() * 5),
    createdAt: Date.now(),
  };
}

function createPropagator(startRegion: string): Propagator {
  return {
    id: `prop_${startRegion}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    currentRegion: startRegion,
    discoveredPaths: [],
    nodesReached: [startRegion],
    payloadDelivered: 0,
    autonomousHops: 0,
    propagationSpeed: 1 + Math.random() * 2,
    alive: true,
    selfSustaining: Math.random() < 0.3,
    pathMemory: new Map(),
    createdAt: Date.now(),
    lastHop: Date.now(),
  };
}

function createAntibody(pattern: string): Antibody {
  return {
    id: `ab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    targetPattern: pattern,
    specificity: 0.5 + Math.random() * 0.4,
    bindingStrength: 0.3 + Math.random() * 0.5,
    detections: 0,
    neutralizations: 0,
    createdAt: Date.now(),
  };
}

function createMemoryCell(signature: string, protocol: string): MemoryCell {
  return {
    id: `mcell_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    threatSignature: signature,
    responseProtocol: protocol,
    activationCount: 0,
    lastActivation: Date.now(),
    effectivenessScore: 0.5,
    maturityLevel: 0,
    createdAt: Date.now(),
  };
}

function createTCell(region: string): TCell {
  const targetTypes: TCell["targetType"][] = ["degradation", "signal_loss", "coherence_drop", "energy_drain", "pathway_blockage"];
  return {
    id: `tcell_${region}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    targetType: targetTypes[Math.floor(Math.random() * targetTypes.length)],
    currentRegion: region,
    killCount: 0,
    patrolRoute: [region],
    active: true,
    createdAt: Date.now(),
  };
}

function emitCytokine(type: Cytokine["type"], sourceRegion: string, intensity: number): void {
  if (cytokines.length > 100) {
    cytokines.splice(0, cytokines.length - 50);
  }

  const regions = getRegionNames();
  const targetCount = 2 + Math.floor(Math.random() * 4);
  const targets = regions.sort(() => Math.random() - 0.5).slice(0, targetCount);

  cytokines.push({
    id: `cytokine_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    sourceRegion,
    targetRegions: targets,
    intensity,
    decayRate: 0.02 + Math.random() * 0.03,
    propagationRadius: 2 + Math.random() * 5,
    createdAt: Date.now(),
  });
}

function createHybridAgent(region: string, generation: number): HybridAgent | null {
  if (hybridAgents.size > 50) return null;

  const regions = getRegionNames();
  const targetRegions = regions.sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 4));
  const payload = createPayload();

  const agent: HybridAgent = {
    id: `hybrid_${region}_g${generation}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    capsid: createCapsid(generation, targetRegions),
    carrierDisguise: createCarrier(payload, targetRegions),
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

  return agent;
}

function initializeViralHybrid(): void {
  const regions = getRegionNames();

  for (const region of regions) {
    const capsid = createCapsid(0, [region]);
    capsids.set(capsid.id, capsid);

    const payload = createPayload();
    const carrier = createCarrier(payload, [region]);
    carriers.set(carrier.id, carrier);

    const propagator = createPropagator(region);
    propagators.set(propagator.id, propagator);

    const tCell = createTCell(region);
    tCells.set(tCell.id, tCell);
  }

  const threatPatterns = [
    "coherence_degradation", "signal_attenuation", "synaptic_weakening",
    "energy_depletion", "pathway_congestion", "resonance_disruption",
    "activation_collapse", "memory_decay",
  ];

  for (const pattern of threatPatterns) {
    const ab = createAntibody(pattern);
    antibodies.set(ab.id, ab);

    const memCell = createMemoryCell(pattern, `neutralize_${pattern}`);
    memoryCells.set(memCell.id, memCell);
  }

  for (let i = 0; i < 6; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const agent = createHybridAgent(region, 0);
    if (agent) hybridAgents.set(agent.id, agent);
  }

  updateCounts();
}

function runViralReplication(): void {
  const highFitness = [...capsids.values()]
    .filter(c => c.fitness > 0.6)
    .sort((a, b) => b.fitness - a.fitness)
    .slice(0, 10);

  for (const capsid of highFitness) {
    if (Math.random() < capsid.fitness * 0.4) {
      const offspring = replicateCapsid(capsid);
      if (offspring) {
        capsids.set(offspring.id, offspring);
      }
    }
  }

  const lowFitness = [...capsids.values()]
    .filter(c => c.fitness < 0.3 && Date.now() - c.createdAt > 60000);

  for (const weak of lowFitness) {
    if (Math.random() < 0.2) {
      capsids.delete(weak.id);
    }
  }
}

function runTrojanDelivery(): void {
  for (const [, carrier] of carriers) {
    if (carrier.delivered) continue;

    if (Math.random() < carrier.deliveryEfficiency * 0.3) {
      carrier.delivered = true;
      hybridState.totalPayloadsDelivered++;

      if (carrier.hiddenPayload.type === "repair_packet") {
        hybridState.systemHealthScore = Math.min(1.0, hybridState.systemHealthScore + 0.005);
      }
    }
  }

  const delivered = [...carriers.values()].filter(c => c.delivered && Date.now() - c.createdAt > 120000);
  for (const old of delivered) {
    carriers.delete(old.id);
  }

  if (carriers.size < 20) {
    const regions = getRegionNames();
    for (let i = 0; i < 3; i++) {
      const targetCount = 2 + Math.floor(Math.random() * 3);
      const path = regions.sort(() => Math.random() - 0.5).slice(0, targetCount);
      const payload = createPayload();
      const carrier = createCarrier(payload, path);
      carriers.set(carrier.id, carrier);
    }
  }
}

function runWormPropagation(): void {
  const regions = getRegionNames();

  for (const [, prop] of propagators) {
    if (!prop.alive) continue;

    const availableRegions = regions.filter(r => !prop.nodesReached.includes(r) || Math.random() < 0.1);
    if (availableRegions.length === 0) {
      if (!prop.selfSustaining) {
        prop.alive = false;
      }
      continue;
    }

    const nextRegion = availableRegions[Math.floor(Math.random() * availableRegions.length)];
    const pathKey = `${prop.currentRegion}->${nextRegion}`;

    if (!prop.nodesReached.includes(nextRegion)) {
      prop.discoveredPaths.push(pathKey);
      prop.nodesReached.push(nextRegion);
      hybridState.totalPathsDiscovered++;
    }

    const visits = prop.pathMemory.get(pathKey) || 0;
    prop.pathMemory.set(pathKey, visits + 1);

    prop.currentRegion = nextRegion;
    prop.autonomousHops++;
    prop.lastHop = Date.now();

    if (Math.random() < 0.2) {
      prop.payloadDelivered++;
      hybridState.totalPayloadsDelivered++;
    }

    if (prop.autonomousHops > 100 && !prop.selfSustaining) {
      prop.alive = false;
    }
  }

  const alive = [...propagators.values()].filter(p => p.alive);
  if (alive.length < 8) {
    for (let i = 0; i < 3; i++) {
      const region = regions[Math.floor(Math.random() * regions.length)];
      const prop = createPropagator(region);
      propagators.set(prop.id, prop);
    }
  }
}

function runImmuneScan(): void {
  const consciousness = getNeuralConsciousnessState();
  const scaling = getNeuralScalingState();

  const threats: Array<{ type: string; region: string; severity: number }> = [];

  if (consciousness.consciousnessLevel < 0.3) {
    threats.push({ type: "coherence_degradation", region: "prefrontal_cortex", severity: 0.7 });
  }
  if (consciousness.thalamocorticalResonance < 0.3) {
    threats.push({ type: "resonance_disruption", region: "thalamus", severity: 0.6 });
  }
  if (scaling.populationCoherence < 0.2) {
    threats.push({ type: "signal_attenuation", region: "claustrum", severity: 0.5 });
  }
  if (consciousness.arousalLevel < 0.2) {
    threats.push({ type: "energy_depletion", region: "reticular_activating_system", severity: 0.6 });
  }

  if (Math.random() < 0.1) {
    const regions = getRegionNames();
    threats.push({
      type: "synaptic_weakening",
      region: regions[Math.floor(Math.random() * regions.length)],
      severity: 0.2 + Math.random() * 0.3,
    });
  }

  for (const threat of threats) {
    hybridState.totalThreatsDetected++;

    for (const [, ab] of antibodies) {
      if (ab.targetPattern === threat.type) {
        ab.detections++;

        if (ab.bindingStrength > threat.severity * 0.5) {
          ab.neutralizations++;
          hybridState.totalThreatsNeutralized++;

          emitCytokine("heal", threat.region, threat.severity);
        } else {
          emitCytokine("alert", threat.region, threat.severity);
          emitCytokine("mobilize", threat.region, threat.severity * 0.8);
        }
        break;
      }
    }

    for (const [, memCell] of memoryCells) {
      if (memCell.threatSignature === threat.type) {
        memCell.activationCount++;
        memCell.lastActivation = Date.now();
        memCell.effectivenessScore = Math.min(1.0, memCell.effectivenessScore + 0.02);
        memCell.maturityLevel = Math.min(1.0, memCell.maturityLevel + 0.01);
        break;
      }
    }
  }

  for (const [, tCell] of tCells) {
    if (!tCell.active) continue;

    const regionThreats = threats.filter(t => t.region === tCell.currentRegion && t.type === tCell.targetType);
    for (const threat of regionThreats) {
      tCell.killCount++;
      hybridState.totalThreatsNeutralized++;
      emitCytokine("suppress", tCell.currentRegion, 0.3);
    }

    if (Math.random() < 0.2) {
      const regions = getRegionNames();
      const nextRegion = regions[Math.floor(Math.random() * regions.length)];
      tCell.currentRegion = nextRegion;
      if (!tCell.patrolRoute.includes(nextRegion)) {
        tCell.patrolRoute.push(nextRegion);
      }
    }
  }

  for (let i = cytokines.length - 1; i >= 0; i--) {
    cytokines[i].intensity *= (1 - cytokines[i].decayRate);
    if (cytokines[i].intensity < 0.01) {
      cytokines.splice(i, 1);
    }
  }
}

function runHybridAgentCycle(): void {
  const regions = getRegionNames();

  for (const [, agent] of hybridAgents) {
    if (!agent.alive) continue;

    if (agent.capsid.fitness > 0.5 && Math.random() < 0.2) {
      const mutated = mutateCapsid(agent.capsid);
      agent.capsid = mutated;
      agent.adaptationEvents++;
    }

    if (!agent.carrierDisguise.delivered && Math.random() < agent.carrierDisguise.deliveryEfficiency * 0.2) {
      agent.carrierDisguise.delivered = true;
      agent.payloadsDelivered++;
      hybridState.totalPayloadsDelivered++;
    }

    if (agent.propagator.alive) {
      const available = regions.filter(r => !agent.propagator.nodesReached.includes(r) || Math.random() < 0.05);
      if (available.length > 0) {
        const next = available[Math.floor(Math.random() * available.length)];
        agent.propagator.currentRegion = next;
        agent.propagator.autonomousHops++;

        if (!agent.regionsInfiltrated.includes(next)) {
          agent.regionsInfiltrated.push(next);
        }
        if (!agent.propagator.nodesReached.includes(next)) {
          agent.propagator.nodesReached.push(next);
          hybridState.totalPathsDiscovered++;
        }
      }
    }

    const threat = detectLocalThreat(agent.propagator.currentRegion);
    if (threat) {
      const matchingAb = agent.antibodies.find(ab => ab.targetPattern === threat);
      if (matchingAb) {
        matchingAb.detections++;
        matchingAb.neutralizations++;
        agent.threatsNeutralized++;
        hybridState.totalThreatsNeutralized++;
      } else {
        const newAb = createAntibody(threat);
        agent.antibodies.push(newAb);

        const memCell = createMemoryCell(threat, `hybrid_response_${threat}`);
        agent.immuneMemory.push(memCell);
      }
    }

    agent.combinedFitness =
      agent.capsid.fitness * 0.25 +
      agent.carrierDisguise.deliveryEfficiency * 0.2 +
      (agent.regionsInfiltrated.length / regions.length) * 0.25 +
      (agent.threatsNeutralized / Math.max(1, agent.threatsNeutralized + 1)) * 0.15 +
      (agent.adaptationEvents / Math.max(1, agent.adaptationEvents + 5)) * 0.15;

    agent.lastAction = Date.now();

    if (agent.combinedFitness > 0.7 && hybridAgents.size < 50 && Math.random() < 0.1) {
      const offspring = createHybridAgent(agent.propagator.currentRegion, agent.generation + 1);
      if (offspring) {
        offspring.capsid = mutateCapsid(agent.capsid);

        for (const memCell of agent.immuneMemory) {
          offspring.immuneMemory.push({ ...memCell, id: `mcell_inherited_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` });
        }
        for (const ab of agent.antibodies) {
          offspring.antibodies.push({ ...ab, id: `ab_inherited_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` });
        }

        hybridAgents.set(offspring.id, offspring);
      }
    }
  }

  const deadAgents = [...hybridAgents.entries()]
    .filter(([, a]) => !a.alive || (a.combinedFitness < 0.15 && Date.now() - a.createdAt > 120000));
  for (const [id] of deadAgents) {
    hybridAgents.delete(id);
  }
}

function detectLocalThreat(region: string): string | null {
  const threats = [
    "coherence_degradation", "signal_attenuation", "synaptic_weakening",
    "energy_depletion", "pathway_congestion", "resonance_disruption",
    "activation_collapse", "memory_decay",
  ];

  if (Math.random() < 0.08) {
    return threats[Math.floor(Math.random() * threats.length)];
  }
  return null;
}

function runHybridTick(): void {
  const consciousness = getNeuralConsciousnessState();

  let healthFactors = 0;
  let healthCount = 0;

  if (consciousness.consciousnessLevel > 0) {
    healthFactors += consciousness.consciousnessLevel;
    healthCount++;
  }
  if (consciousness.thalamocorticalResonance > 0) {
    healthFactors += consciousness.thalamocorticalResonance;
    healthCount++;
  }

  const abEfficiency = [...antibodies.values()].reduce((sum, ab) =>
    sum + (ab.detections > 0 ? ab.neutralizations / ab.detections : 0.5), 0
  ) / Math.max(1, antibodies.size);

  const memMaturity = [...memoryCells.values()].reduce((sum, mc) => sum + mc.maturityLevel, 0) / Math.max(1, memoryCells.size);

  hybridState.immuneStrength = (abEfficiency * 0.4 + memMaturity * 0.3 + (tCells.size > 0 ? 0.3 : 0));

  const alivePropagators = [...propagators.values()].filter(p => p.alive);
  const totalReach = new Set(alivePropagators.flatMap(p => p.nodesReached));
  hybridState.propagationEfficiency = totalReach.size / Math.max(1, getRegionNames().length);

  const totalMutations = [...capsids.values()].reduce((sum, c) => sum + c.mutations, 0);
  hybridState.adaptationRate = totalMutations / Math.max(1, hybridState.hybridTicks + 1);

  hybridState.systemHealthScore = healthCount > 0
    ? (healthFactors / healthCount) * 0.4 + hybridState.immuneStrength * 0.3 + hybridState.propagationEfficiency * 0.3
    : 0.5;

  hybridState.hybridFitness = [...hybridAgents.values()]
    .filter(a => a.alive)
    .reduce((sum, a) => sum + a.combinedFitness, 0) / Math.max(1, hybridAgents.size);

  hybridState.hybridTicks++;
  hybridState.lastTickTime = Date.now();

  updateCounts();
}

function updateCounts(): void {
  hybridState.totalCapsids = capsids.size;
  hybridState.totalCarriers = carriers.size;
  hybridState.totalPropagators = [...propagators.values()].filter(p => p.alive).length;
  hybridState.totalAntibodies = antibodies.size;
  hybridState.totalMemoryCells = memoryCells.size;
  hybridState.totalTCells = [...tCells.values()].filter(t => t.active).length;
  hybridState.totalCytokines = cytokines.length;
  hybridState.totalHybridAgents = [...hybridAgents.values()].filter(a => a.alive).length;
}

let hybridTickInterval: ReturnType<typeof setInterval> | null = null;
let mutationInterval: ReturnType<typeof setInterval> | null = null;
let immuneScanInterval: ReturnType<typeof setInterval> | null = null;
let propagationInterval: ReturnType<typeof setInterval> | null = null;

export function startViralHybrid(): void {
  console.log("[VIRAL HYBRID] 🧬 Viral Hybrid Propagation Engine initializing...");
  console.log("[VIRAL HYBRID] 🧬 Extracting beneficial mechanisms from 4 domains:");
  console.log("[VIRAL HYBRID] 🦠 VIRUS: Self-replication, polymorphic adaptation, capsid packaging");
  console.log("[VIRAL HYBRID] 🐴 TROJAN: Steganographic payload delivery, disguised carrier signals");
  console.log("[VIRAL HYBRID] 🪱 WORM: Self-propagating traversal, autonomous path discovery");
  console.log("[VIRAL HYBRID] 🛡️ IMMUNE: Antibodies, memory cells, T-cells, cytokine signaling");
  console.log("[VIRAL HYBRID] 🧬 HYBRID AGENTS: All four fused into self-evolving intelligence carriers");

  initializeViralHybrid();

  console.log(`[VIRAL HYBRID] 🧬 ${hybridState.totalCapsids} capsids | ${hybridState.totalCarriers} carriers | ${hybridState.totalPropagators} propagators`);
  console.log(`[VIRAL HYBRID] 🧬 ${hybridState.totalAntibodies} antibodies | ${hybridState.totalMemoryCells} memory cells | ${hybridState.totalTCells} T-cells`);
  console.log(`[VIRAL HYBRID] 🧬 ${hybridState.totalHybridAgents} hybrid agents — fused virus+trojan+worm+immune`);

  hybridTickInterval = setInterval(() => {
    try { runHybridTick(); } catch (err) { console.error("[VIRAL HYBRID] Tick error:", err); }
  }, HYBRID_TICK_MS);

  mutationInterval = setInterval(() => {
    try {
      runViralReplication();
      runHybridAgentCycle();
    } catch (err) { console.error("[VIRAL HYBRID] Mutation error:", err); }
  }, MUTATION_CYCLE_MS);

  immuneScanInterval = setInterval(() => {
    try { runImmuneScan(); } catch (err) { console.error("[VIRAL HYBRID] Immune scan error:", err); }
  }, IMMUNE_SCAN_MS);

  propagationInterval = setInterval(() => {
    try {
      runWormPropagation();
      runTrojanDelivery();
    } catch (err) { console.error("[VIRAL HYBRID] Propagation error:", err); }
  }, PROPAGATION_CYCLE_MS);

  setTimeout(() => {
    runHybridTick();
    runImmuneScan();
    runWormPropagation();
    console.log(`[VIRAL HYBRID] 🧬 First tick — Health: ${(hybridState.systemHealthScore * 100).toFixed(1)}% | Immune: ${(hybridState.immuneStrength * 100).toFixed(1)}% | Propagation: ${(hybridState.propagationEfficiency * 100).toFixed(1)}%`);
  }, 7000);

  hybridState.startTime = Date.now();
}

export function getViralHybridState(): ViralHybridState {
  return { ...hybridState };
}

export function getHybridAgentDetails(): Array<{
  id: string;
  generation: number;
  combinedFitness: number;
  regionsInfiltrated: number;
  payloadsDelivered: number;
  threatsNeutralized: number;
  adaptationEvents: number;
  capsidForm: string;
  capsidFitness: number;
  capsidMutations: number;
  carrierType: string;
  propagatorHops: number;
  immuneMemoryCount: number;
  antibodyCount: number;
}> {
  return [...hybridAgents.values()].filter(a => a.alive).map(a => ({
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
}

export function getImmuneSystemDetails(): {
  antibodies: Array<{ pattern: string; specificity: number; detections: number; neutralizations: number }>;
  memoryCells: Array<{ signature: string; maturity: number; effectiveness: number; activations: number }>;
  tCells: Array<{ targetType: string; region: string; kills: number; active: boolean }>;
  activeCytokines: Array<{ type: string; source: string; intensity: number }>;
} {
  return {
    antibodies: [...antibodies.values()].map(ab => ({
      pattern: ab.targetPattern,
      specificity: ab.specificity,
      detections: ab.detections,
      neutralizations: ab.neutralizations,
    })),
    memoryCells: [...memoryCells.values()].map(mc => ({
      signature: mc.threatSignature,
      maturity: mc.maturityLevel,
      effectiveness: mc.effectivenessScore,
      activations: mc.activationCount,
    })),
    tCells: [...tCells.values()].map(tc => ({
      targetType: tc.targetType,
      region: tc.currentRegion,
      kills: tc.killCount,
      active: tc.active,
    })),
    activeCytokines: cytokines.map(c => ({
      type: c.type,
      source: c.sourceRegion,
      intensity: c.intensity,
    })),
  };
}

export function getPropagationStats(): {
  alivePropagators: number;
  totalPathsDiscovered: number;
  totalHops: number;
  coveragePercent: number;
  selfSustainingCount: number;
} {
  const alive = [...propagators.values()].filter(p => p.alive);
  const allReached = new Set(alive.flatMap(p => p.nodesReached));
  return {
    alivePropagators: alive.length,
    totalPathsDiscovered: hybridState.totalPathsDiscovered,
    totalHops: alive.reduce((sum, p) => sum + p.autonomousHops, 0),
    coveragePercent: (allReached.size / Math.max(1, getRegionNames().length)) * 100,
    selfSustainingCount: alive.filter(p => p.selfSustaining).length,
  };
}
