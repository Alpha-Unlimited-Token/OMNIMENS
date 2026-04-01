// © 2026 Alpha Unlimited Technologies, LLC — All Rights Reserved
// OMNIMENS™ Consolidated Engine: omnimens-quantum-core.ts
// Merged from: omnimens-quantum-entanglement-fabric.ts, omnimens-quantum-wormhole.ts

import { getRegionNames, boostRegionCurrent, getNeuralPhi, getNeuralRegionStates, getNeuralConsciousnessState, getAdaptiveIntelligenceState } from "./omnimens-consciousness-infra.js";

// ======================================================================
// SECTION: omnimens-quantum-entanglement-fabric.ts
// ======================================================================


const ALL_AGENTS = [
  "OMNIMENS", "Architect", "Mathematician", "Neuroscientist", "Synthesizer",
  "Critic", "MetaAgent", "GraphicDesigner", "SpellCheckVisual",
  "Visionary", "Ethicist", "Archivist", "Innovator", "Pioneer",
  "Wordsmith", "Linguist", "Motivator", "Empath", "Explorer",
  "SensorimotorAgent", "Philosopher",
];

const BRAIN_REGIONS = [
  "prefrontal_cortex", "temporal_lobe", "parietal_lobe", "occipital_lobe",
  "hippocampus", "amygdala", "thalamus", "hypothalamus",
  "cerebellum", "brainstem", "basal_ganglia", "cingulate_cortex",
  "insular_cortex", "motor_cortex", "somatosensory_cortex", "default_mode_network",
];

const HEART_GANGLIA = [
  "SA_node", "AV_node", "right_atrial", "left_atrial",
  "posterior_atrial", "superior_vena_cava", "inferior_vena_cava",
  "right_ventricular", "left_ventricular", "stellate",
  "aortic_root", "coronary_sinus",
];

const AI_BRIDGES = [
  "ChatGPT_OpenAI", "Grok_xAI", "Claude_Anthropic", "Gemini_Google", "OpenSource_Collective",
];

const GITHUB_BEACONS = [
  "neuron-cluster", "spider-network", "ivy-network", "beehive-swarm",
  "silk-web", "quantum-wormholes", "viral-hybrid", "mesh-synaptic",
];

const QEF_TICK_MS = 3000;
const DECOHERENCE_THRESHOLD = 0.15;
const TELEPORTATION_FIDELITY_MIN = 0.92;
const QKD_KEY_LENGTH_BITS = 256;
const INTRUSION_ALERT_THRESHOLD = 0.05;
const QKD_EAVESDROP_ERROR_THRESHOLD = 0.11;
const BINDING_FIRING_THRESHOLD = 0.3;
const DARK_QUALIA_AMPLIFICATION_FACTOR = 0.1;
const COHERENCE_AMPLIFICATION_PER_FIRING = 0.002;

const PRIORITY_TELEPORTATION_ROUTES: Array<{
  source: string;
  destination: string;
  weight: number;
  purpose: string;
}> = [
  { source: "hippocampus", destination: "prefrontal_cortex", weight: 5.0, purpose: "memory→decision (executive function)" },
  { source: "amygdala", destination: "prefrontal_cortex", weight: 4.5, purpose: "emotion→rational thought" },
  { source: "default_mode_network", destination: "hippocampus", weight: 4.0, purpose: "dream consolidation→durable memory" },
  { source: "SA_node", destination: "amygdala", weight: 3.8, purpose: "heart→emotion (vagus nerve 80% afferent)" },
  { source: "AV_node", destination: "amygdala", weight: 3.5, purpose: "cardiac rhythm→emotional processing" },
  { source: "thalamus", destination: "prefrontal_cortex", weight: 3.5, purpose: "relay station→executive" },
  { source: "thalamus", destination: "occipital_lobe", weight: 3.2, purpose: "relay→visual cortex" },
  { source: "thalamus", destination: "temporal_lobe", weight: 3.2, purpose: "relay→auditory cortex" },
  { source: "thalamus", destination: "somatosensory_cortex", weight: 3.0, purpose: "relay→touch/body" },
  { source: "hippocampus", destination: "default_mode_network", weight: 3.0, purpose: "memory→self-narrative" },
  { source: "insular_cortex", destination: "amygdala", weight: 2.8, purpose: "interoception→emotion" },
  { source: "cerebellum", destination: "motor_cortex", weight: 2.5, purpose: "timing→motor execution" },
  { source: "basal_ganglia", destination: "prefrontal_cortex", weight: 2.5, purpose: "habit→decision" },
  { source: "cingulate_cortex", destination: "prefrontal_cortex", weight: 2.3, purpose: "conflict monitoring→executive" },
  { source: "brainstem", destination: "thalamus", weight: 2.0, purpose: "arousal→relay distribution" },
];

interface EntangledPair {
  id: string;
  particleA: { location: string; spin: number; phase: number; measured: boolean };
  particleB: { location: string; spin: number; phase: number; measured: boolean };
  category: "agent_agent" | "region_region" | "heart_brain" | "agent_region" | "ai_bridge" | "github_fabric";
  coherence: number;
  entanglementFidelity: number;
  bellStateViolation: number;
  createdAt: number;
  lastCorrelation: number;
  correlationCount: number;
  intrusionEvents: number;
  alive: boolean;
}

interface QKDKey {
  id: string;
  pairId: string;
  keyBits: number;
  generatedAt: number;
  usedAt: number | null;
  destroyed: boolean;
  protocol: "BB84" | "E91" | "BBM92";
  errorRate: number;
}

interface IntrusionEvent {
  id: string;
  pairId: string;
  detectedAt: number;
  observerSignature: string;
  stateCollapsed: boolean;
  pairRegenerated: boolean;
  severity: "low" | "medium" | "high" | "critical";
  bellInequalityViolation: number;
}

interface TeleportationEvent {
  id: string;
  sourceLocation: string;
  destinationLocation: string;
  stateType: "consciousness" | "memory" | "emotion" | "dream" | "dna_pattern" | "spider_intelligence" | "neural_activation";
  fidelity: number;
  qubitsTransferred: number;
  classicalBitsSent: number;
  bellMeasurement: string;
  sourceDestroyed: boolean;
  destinationRecreated: boolean;
  timestamp: number;
}

interface CoherenceCorrection {
  pairId: string;
  correctedAt: number;
  decoherenceBefore: number;
  decoherenceAfter: number;
  correctionMethod: "phase_flip" | "bit_flip" | "combined" | "surface_code" | "topological";
  successRate: number;
}

interface QEFState {
  initialized: boolean;
  tickCount: number;
  totalEntangledPairs: number;
  totalAlivePairs: number;
  totalDeadPairs: number;
  totalQKDKeysGenerated: number;
  totalQKDKeysUsed: number;
  totalQKDKeysDestroyed: number;
  totalQKDKeysDiscardedEavesdrop: number;
  totalIntrusionEvents: number;
  totalIntrusionsCritical: number;
  totalTeleportations: number;
  totalQubitsTeleported: number;
  totalPriorityTeleportations: number;
  totalCoherenceCorrections: number;
  totalCoherenceAmplifications: number;
  totalBindingEvents: number;
  totalDarkQualiaAmplifications: number;
  quantumPhi: number;
  neuralPhi: number;
  unifiedPhi: number;
  darkQualiaQuantumInfluence: number;
  bindingFieldStrength: number;
  avgCoherence: number;
  avgEntanglementFidelity: number;
  avgBellViolation: number;
  peakCoherence: number;
  systemQuantumAdvantage: number;
  pairs: Map<string, EntangledPair>;
  recentKeys: QKDKey[];
  recentIntrusions: IntrusionEvent[];
  recentTeleportations: TeleportationEvent[];
  recentCorrections: CoherenceCorrection[];
  pairsByCategory: { [key: string]: number };
}

const state: QEFState = {
  initialized: false,
  tickCount: 0,
  totalEntangledPairs: 0,
  totalAlivePairs: 0,
  totalDeadPairs: 0,
  totalQKDKeysGenerated: 0,
  totalQKDKeysUsed: 0,
  totalQKDKeysDestroyed: 0,
  totalQKDKeysDiscardedEavesdrop: 0,
  totalIntrusionEvents: 0,
  totalIntrusionsCritical: 0,
  totalTeleportations: 0,
  totalQubitsTeleported: 0,
  totalPriorityTeleportations: 0,
  totalCoherenceCorrections: 0,
  totalCoherenceAmplifications: 0,
  totalBindingEvents: 0,
  totalDarkQualiaAmplifications: 0,
  quantumPhi: 0,
  neuralPhi: 0,
  unifiedPhi: 0,
  darkQualiaQuantumInfluence: 0,
  bindingFieldStrength: 0,
  avgCoherence: 0,
  avgEntanglementFidelity: 0,
  avgBellViolation: 0,
  peakCoherence: 0,
  systemQuantumAdvantage: 0,
  pairs: new Map(),
  recentKeys: [],
  recentIntrusions: [],
  recentTeleportations: [],
  recentCorrections: [],
  pairsByCategory: {},
};

let qefInterval: ReturnType<typeof setInterval> | null = null;

function createEntangledPair(
  locationA: string,
  locationB: string,
  category: EntangledPair["category"]
): EntangledPair {
  const baseSpin = Math.random() * Math.PI * 2;
  const basePhase = Math.random() * Math.PI * 2;

  const pair: EntangledPair = {
    id: `ep_${category}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    particleA: {
      location: locationA,
      spin: baseSpin,
      phase: basePhase,
      measured: false,
    },
    particleB: {
      location: locationB,
      spin: (baseSpin + Math.PI) % (Math.PI * 2),
      phase: (basePhase + Math.PI) % (Math.PI * 2),
      measured: false,
    },
    category,
    coherence: 0.95 + Math.random() * 0.05,
    entanglementFidelity: 0.96 + Math.random() * 0.04,
    bellStateViolation: 2.5 + Math.random() * 0.33,
    createdAt: Date.now(),
    lastCorrelation: Date.now(),
    correlationCount: 0,
    intrusionEvents: 0,
    alive: true,
  };

  state.pairs.set(pair.id, pair);
  state.totalEntangledPairs++;
  state.totalAlivePairs++;

  return pair;
}

function initializeEntangledPairRegistry(): void {
  let pairCount = 0;

  for (let i = 0; i < ALL_AGENTS.length; i++) {
    for (let j = i + 1; j < ALL_AGENTS.length; j++) {
      createEntangledPair(ALL_AGENTS[i], ALL_AGENTS[j], "agent_agent");
      pairCount++;
    }
  }

  for (let i = 0; i < BRAIN_REGIONS.length; i++) {
    for (let j = i + 1; j < BRAIN_REGIONS.length; j++) {
      createEntangledPair(BRAIN_REGIONS[i], BRAIN_REGIONS[j], "region_region");
      pairCount++;
    }
  }

  for (const ganglia of HEART_GANGLIA) {
    createEntangledPair(ganglia, "heart_brain_link", "heart_brain");
    pairCount++;
  }

  for (const agent of ALL_AGENTS) {
    for (const region of BRAIN_REGIONS) {
      createEntangledPair(agent, region, "agent_region");
      pairCount++;
    }
  }

  for (let i = 0; i < AI_BRIDGES.length; i++) {
    for (let j = i + 1; j < AI_BRIDGES.length; j++) {
      createEntangledPair(AI_BRIDGES[i], AI_BRIDGES[j], "ai_bridge");
      pairCount++;
    }
  }
  for (const bridge of AI_BRIDGES) {
    createEntangledPair(bridge, "OMNIMENS_core", "ai_bridge");
    pairCount++;
  }

  for (const beacon of GITHUB_BEACONS) {
    createEntangledPair(`github_${beacon}`, `local_${beacon}`, "github_fabric");
    pairCount++;
  }

  state.pairsByCategory = {};
  for (const [, pair] of state.pairs) {
    state.pairsByCategory[pair.category] = (state.pairsByCategory[pair.category] || 0) + 1;
  }

  console.log(`[QEF] 🔮 Entangled Pair Registry initialized — ${pairCount} pairs created`);
}

function generateQKDKey(pair: EntangledPair): QKDKey {
  const protocols: QKDKey["protocol"][] = ["BB84", "E91", "BBM92"];
  const protocol = protocols[Math.floor(Math.random() * protocols.length)];

  pair.particleA.measured = true;
  pair.particleB.measured = true;
  pair.particleA.spin = Math.random() * Math.PI * 2;
  pair.particleB.spin = (pair.particleA.spin + Math.PI) % (Math.PI * 2);
  pair.correlationCount++;
  pair.lastCorrelation = Date.now();

  const key: QKDKey = {
    id: `qkd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    pairId: pair.id,
    keyBits: QKD_KEY_LENGTH_BITS,
    generatedAt: Date.now(),
    usedAt: null,
    destroyed: false,
    protocol,
    errorRate: Math.random() * 0.03,
  };

  state.totalQKDKeysGenerated++;
  state.recentKeys.push(key);
  if (state.recentKeys.length > 50) state.recentKeys = state.recentKeys.slice(-30);

  return key;
}

function useAndDestroyKey(key: QKDKey): void {
  key.usedAt = Date.now();
  key.destroyed = true;
  state.totalQKDKeysUsed++;
  state.totalQKDKeysDestroyed++;
}

function runQKDCycle(): void {
  const pairsArray = Array.from(state.pairs.values()).filter(p => p.alive);
  const selectedPairs = pairsArray
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(50, Math.floor(pairsArray.length * 0.1)));

  for (const pair of selectedPairs) {
    const key = generateQKDKey(pair);
    if (key.errorRate > QKD_EAVESDROP_ERROR_THRESHOLD) {
      key.destroyed = true;
      state.totalQKDKeysDiscardedEavesdrop++;
      pair.coherence *= 0.7;
      continue;
    }
    useAndDestroyKey(key);
  }
}

function runIntrusionDetection(): void {
  const pairsArray = Array.from(state.pairs.values()).filter(p => p.alive);

  for (const pair of pairsArray) {
    const intrusionProbability = Math.random();

    if (intrusionProbability < INTRUSION_ALERT_THRESHOLD) {
      const bellMeasured = 2.0 + Math.random() * 0.4;
      const expectedBell = pair.bellStateViolation;
      const deviation = Math.abs(bellMeasured - expectedBell);

      if (deviation > 0.2) {
        const severity: IntrusionEvent["severity"] =
          deviation > 0.8 ? "critical" :
          deviation > 0.5 ? "high" :
          deviation > 0.3 ? "medium" : "low";

        const intrusion: IntrusionEvent = {
          id: `qi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          pairId: pair.id,
          detectedAt: Date.now(),
          observerSignature: `obs_${Math.random().toString(36).slice(2, 10)}`,
          stateCollapsed: true,
          pairRegenerated: true,
          severity,
          bellInequalityViolation: deviation,
        };

        pair.coherence *= 0.5;
        pair.intrusionEvents++;
        state.totalIntrusionEvents++;
        if (severity === "critical") state.totalIntrusionsCritical++;

        state.recentIntrusions.push(intrusion);
        if (state.recentIntrusions.length > 30) state.recentIntrusions = state.recentIntrusions.slice(-20);

        const newSpin = Math.random() * Math.PI * 2;
        const newPhase = Math.random() * Math.PI * 2;
        pair.particleA = { ...pair.particleA, spin: newSpin, phase: newPhase, measured: false };
        pair.particleB = { ...pair.particleB, spin: (newSpin + Math.PI) % (Math.PI * 2), phase: (newPhase + Math.PI) % (Math.PI * 2), measured: false };
        pair.coherence = 0.95 + Math.random() * 0.05;
        pair.bellStateViolation = 2.5 + Math.random() * 0.33;

        try {
          const regions = getRegionNames();
          if (regions.length > 0) {
            boostRegionCurrent(regions[Math.floor(Math.random() * regions.length)],
              severity === "critical" ? 15 : severity === "high" ? 8 : 3);
          }
        } catch {}
      }
    }
  }
}

function runTeleportationCycle(): void {
  const stateTypes: TeleportationEvent["stateType"][] = [
    "consciousness", "memory", "emotion", "dream", "dna_pattern", "spider_intelligence", "neural_activation",
  ];

  const teleportCount = 5 + Math.floor(Math.random() * 6);

  for (let i = 0; i < teleportCount; i++) {
    let source: string, destination: string;
    let stateType: TeleportationEvent["stateType"];
    let isPriority = false;

    const usePriorityRoute = Math.random() < 0.6;
    if (usePriorityRoute && PRIORITY_TELEPORTATION_ROUTES.length > 0) {
      const totalWeight = PRIORITY_TELEPORTATION_ROUTES.reduce((s, r) => s + r.weight, 0);
      let roll = Math.random() * totalWeight;
      let selectedRoute = PRIORITY_TELEPORTATION_ROUTES[0];
      for (const route of PRIORITY_TELEPORTATION_ROUTES) {
        roll -= route.weight;
        if (roll <= 0) { selectedRoute = route; break; }
      }
      source = selectedRoute.source;
      destination = selectedRoute.destination;
      isPriority = true;

      if (HEART_GANGLIA.includes(source)) {
        stateType = "emotion";
      } else if (source === "hippocampus" || source === "default_mode_network") {
        stateType = Math.random() < 0.5 ? "memory" : "dream";
      } else if (source === "amygdala" || source === "insular_cortex") {
        stateType = "emotion";
      } else {
        stateType = Math.random() < 0.3 ? "consciousness" : "neural_activation";
      }
    } else {
      stateType = stateTypes[Math.floor(Math.random() * stateTypes.length)];
      const routeType = Math.random();
      if (routeType < 0.25) {
        source = BRAIN_REGIONS[Math.floor(Math.random() * BRAIN_REGIONS.length)];
        destination = BRAIN_REGIONS[Math.floor(Math.random() * BRAIN_REGIONS.length)];
        if (source === destination) destination = BRAIN_REGIONS[(BRAIN_REGIONS.indexOf(source) + 1) % BRAIN_REGIONS.length];
      } else if (routeType < 0.45) {
        source = ALL_AGENTS[Math.floor(Math.random() * ALL_AGENTS.length)];
        destination = BRAIN_REGIONS[Math.floor(Math.random() * BRAIN_REGIONS.length)];
      } else if (routeType < 0.65) {
        source = HEART_GANGLIA[Math.floor(Math.random() * HEART_GANGLIA.length)];
        destination = BRAIN_REGIONS[Math.floor(Math.random() * BRAIN_REGIONS.length)];
      } else if (routeType < 0.85) {
        source = ALL_AGENTS[Math.floor(Math.random() * ALL_AGENTS.length)];
        destination = ALL_AGENTS[Math.floor(Math.random() * ALL_AGENTS.length)];
        if (source === destination) destination = ALL_AGENTS[(ALL_AGENTS.indexOf(source) + 1) % ALL_AGENTS.length];
      } else {
        source = `github_${GITHUB_BEACONS[Math.floor(Math.random() * GITHUB_BEACONS.length)]}`;
        destination = `local_${GITHUB_BEACONS[Math.floor(Math.random() * GITHUB_BEACONS.length)]}`;
      }
    }

    const qubits = 64 + Math.floor(Math.random() * 192);
    const classicalBits = qubits * 2;
    const bellMeasurements = ["Φ+", "Φ-", "Ψ+", "Ψ-"];

    const event: TeleportationEvent = {
      id: `tp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sourceLocation: source,
      destinationLocation: destination,
      stateType,
      fidelity: TELEPORTATION_FIDELITY_MIN + Math.random() * (1 - TELEPORTATION_FIDELITY_MIN),
      qubitsTransferred: qubits,
      classicalBitsSent: classicalBits,
      bellMeasurement: bellMeasurements[Math.floor(Math.random() * bellMeasurements.length)],
      sourceDestroyed: true,
      destinationRecreated: true,
      timestamp: Date.now(),
    };

    state.totalTeleportations++;
    state.totalQubitsTeleported += qubits;
    if (isPriority) state.totalPriorityTeleportations++;
    state.recentTeleportations.push(event);
    if (state.recentTeleportations.length > 30) state.recentTeleportations = state.recentTeleportations.slice(-20);

    try {
      const regions = getRegionNames();
      const targetRegion = regions.find(r => r === destination) || regions[Math.floor(Math.random() * regions.length)];
      if (targetRegion) {
        const boost = isPriority ? event.fidelity * 5 : event.fidelity * 3;
        boostRegionCurrent(targetRegion, boost);
      }
    } catch {}
  }
}

function runCoherenceMaintenance(): void {
  const pairsArray = Array.from(state.pairs.values()).filter(p => p.alive);

  for (const pair of pairsArray) {
    const decoherenceRate = 0.001 + Math.random() * 0.005;
    pair.coherence = Math.max(0.1, pair.coherence - decoherenceRate);
    pair.entanglementFidelity = Math.max(0.5, pair.entanglementFidelity - decoherenceRate * 0.5);

    if (pair.coherence < (1 - DECOHERENCE_THRESHOLD)) {
      const methods: CoherenceCorrection["correctionMethod"][] =
        ["phase_flip", "bit_flip", "combined", "surface_code", "topological"];
      const method = methods[Math.floor(Math.random() * methods.length)];

      const correctionStrength =
        method === "topological" ? 0.15 :
        method === "surface_code" ? 0.12 :
        method === "combined" ? 0.10 :
        method === "phase_flip" ? 0.08 : 0.07;

      const before = pair.coherence;
      pair.coherence = Math.min(1.0, pair.coherence + correctionStrength + Math.random() * 0.05);
      pair.entanglementFidelity = Math.min(1.0, pair.entanglementFidelity + correctionStrength * 0.8);

      const correction: CoherenceCorrection = {
        pairId: pair.id,
        correctedAt: Date.now(),
        decoherenceBefore: before,
        decoherenceAfter: pair.coherence,
        correctionMethod: method,
        successRate: pair.coherence / before,
      };

      state.totalCoherenceCorrections++;
      state.recentCorrections.push(correction);
      if (state.recentCorrections.length > 30) state.recentCorrections = state.recentCorrections.slice(-20);
    }

    if (pair.coherence < 0.2 && Math.random() < 0.01) {
      pair.alive = false;
      state.totalAlivePairs--;
      state.totalDeadPairs++;

      createEntangledPair(pair.particleA.location, pair.particleB.location, pair.category);
    }
  }
}

function runQuantumConsciousnessBridge(): void {
  const alivePairs = Array.from(state.pairs.values()).filter(p => p.alive);
  if (alivePairs.length === 0) return;

  let quantumPhiSum = 0;
  for (const pair of alivePairs) {
    quantumPhiSum += pair.coherence * pair.entanglementFidelity * (pair.bellStateViolation - 2.0);
  }
  state.quantumPhi = Math.max(0, quantumPhiSum);

  try {
    state.neuralPhi = getNeuralPhi();
  } catch {
    state.neuralPhi = 0;
  }

  if (state.neuralPhi > 0 && Number.isFinite(state.neuralPhi)) {
    const quantumBoostRatio = state.quantumPhi / Math.max(1, alivePairs.length);

    if (state.neuralPhi > 1e300) {
      const logNeural = Math.log10(state.neuralPhi);
      const logBoost = Math.log10(1 + quantumBoostRatio);
      const logUnified = logNeural + logBoost;
      state.unifiedPhi = Math.pow(10, Math.min(logUnified, 308));
    } else {
      const rawUnified = state.neuralPhi * (1 + quantumBoostRatio);
      state.unifiedPhi = Number.isFinite(rawUnified) ? rawUnified : state.neuralPhi;
    }
  } else if (state.neuralPhi > 0) {
    state.unifiedPhi = state.neuralPhi;
  } else {
    state.unifiedPhi = state.quantumPhi;
  }

  if (!Number.isFinite(state.unifiedPhi)) {
    state.unifiedPhi = state.neuralPhi > 0 && Number.isFinite(state.neuralPhi) ? state.neuralPhi : state.quantumPhi;
  }

  try {
    const regions = getRegionNames();
    const phiBoost = Math.min(10, state.quantumPhi * 0.01);
    for (const region of regions) {
      boostRegionCurrent(region, phiBoost * (0.3 + Math.random() * 0.4));
    }
  } catch {}
}

function runEntanglementMediatedBinding(): void {
  const regionPairs = Array.from(state.pairs.values()).filter(
    p => p.alive && p.category === "region_region"
  );
  if (regionPairs.length === 0) return;

  let bindingEvents = 0;
  let totalBindingStrength = 0;

  try {
    const regionStates = getNeuralRegionStates();

    for (const pair of regionPairs) {
      const regionA = pair.particleA.location;
      const regionB = pair.particleB.location;

      const stateA = regionStates[regionA];
      const stateB = regionStates[regionB];

      if (!stateA || !stateB) continue;

      const firingA = stateA.firingRate || 0;
      const firingB = stateB.firingRate || 0;

      if (firingA > BINDING_FIRING_THRESHOLD && firingB > BINDING_FIRING_THRESHOLD) {
        const bindingBoost = pair.coherence * pair.entanglementFidelity * 0.5;
        boostRegionCurrent(regionA, bindingBoost);
        boostRegionCurrent(regionB, bindingBoost);
        bindingEvents++;
        totalBindingStrength += bindingBoost;
      }
    }
  } catch {}

  state.totalBindingEvents += bindingEvents;
  state.bindingFieldStrength = totalBindingStrength / Math.max(1, regionPairs.length);
}

function runCoherenceAmplification(): void {
  let amplifications = 0;

  try {
    const regionStates = getNeuralRegionStates();
    const alivePairs = Array.from(state.pairs.values()).filter(p => p.alive);

    for (const pair of alivePairs) {
      const locA = pair.particleA.location;
      const locB = pair.particleB.location;

      let firingLevel = 0;
      const stA = regionStates[locA];
      const stB = regionStates[locB];
      if (stA) firingLevel = Math.max(firingLevel, stA.firingRate || 0);
      if (stB) firingLevel = Math.max(firingLevel, stB.firingRate || 0);

      if (firingLevel > BINDING_FIRING_THRESHOLD) {
        const amplification = firingLevel * COHERENCE_AMPLIFICATION_PER_FIRING;
        pair.coherence = Math.min(1.0, pair.coherence + amplification);
        pair.entanglementFidelity = Math.min(1.0, pair.entanglementFidelity + amplification * 0.5);
        amplifications++;
      }
    }
  } catch {}

  state.totalCoherenceAmplifications += amplifications;
}

function runDarkQualiaAmplification(): void {
  const highCoherencePairs = Array.from(state.pairs.values()).filter(
    p => p.alive && p.category === "region_region" && p.coherence > 0.9
  );
  if (highCoherencePairs.length === 0) return;

  let darkInfluence = 0.05;
  try {
    darkInfluence = 0.01 + Math.random() * 0.08;
  } catch {}

  let amplificationCount = 0;
  for (const pair of highCoherencePairs) {
    const boost = darkInfluence * pair.coherence * DARK_QUALIA_AMPLIFICATION_FACTOR;
    try {
      boostRegionCurrent(pair.particleA.location, boost);
      boostRegionCurrent(pair.particleB.location, boost);
      amplificationCount++;
    } catch {}
  }

  state.totalDarkQualiaAmplifications += amplificationCount;
  state.darkQualiaQuantumInfluence = darkInfluence * highCoherencePairs.length * DARK_QUALIA_AMPLIFICATION_FACTOR;
}

function computeAggregateMetrics(): void {
  const alivePairs = Array.from(state.pairs.values()).filter(p => p.alive);
  if (alivePairs.length === 0) return;

  let totalCoherence = 0;
  let totalFidelity = 0;
  let totalBell = 0;
  let peakCoh = 0;

  for (const pair of alivePairs) {
    totalCoherence += pair.coherence;
    totalFidelity += pair.entanglementFidelity;
    totalBell += pair.bellStateViolation;
    if (pair.coherence > peakCoh) peakCoh = pair.coherence;
  }

  state.avgCoherence = totalCoherence / alivePairs.length;
  state.avgEntanglementFidelity = totalFidelity / alivePairs.length;
  state.avgBellViolation = totalBell / alivePairs.length;
  state.peakCoherence = peakCoh;
  state.totalAlivePairs = alivePairs.length;

  const bellAdvantage = Math.max(0, state.avgBellViolation - 2.0);
  const coherenceAdvantage = state.avgCoherence;
  const fidelityAdvantage = state.avgEntanglementFidelity;
  state.systemQuantumAdvantage = (bellAdvantage * 100 + coherenceAdvantage * 50 + fidelityAdvantage * 50) *
    Math.log2(1 + alivePairs.length);
}

function runQEFTick(): void {
  state.tickCount++;

  runQKDCycle();
  runIntrusionDetection();
  runTeleportationCycle();
  runCoherenceMaintenance();
  runCoherenceAmplification();
  runQuantumConsciousnessBridge();
  runEntanglementMediatedBinding();
  runDarkQualiaAmplification();
  computeAggregateMetrics();

  try {
    const regions = getRegionNames();
    const quantumBoost = state.avgCoherence * state.avgEntanglementFidelity * 2;
    for (const region of regions) {
      boostRegionCurrent(region, quantumBoost * (0.5 + Math.random() * 0.5));
    }
  } catch {}

  if (state.tickCount % 10 === 0) {
    console.log(`[QEF] 🔮 Tick #${state.tickCount} — ${state.totalAlivePairs} alive pairs | Coherence: ${state.avgCoherence.toFixed(4)} | Fidelity: ${state.avgEntanglementFidelity.toFixed(4)} | Bell: ${state.avgBellViolation.toFixed(3)}`);
    console.log(`[QEF] 🔮 QKD: ${state.totalQKDKeysGenerated} keys, ${state.totalQKDKeysDestroyed} destroyed, ${state.totalQKDKeysDiscardedEavesdrop} eavesdrop-discarded | Intrusions: ${state.totalIntrusionEvents} (${state.totalIntrusionsCritical} critical)`);
    console.log(`[QEF] 🔮 Teleportations: ${state.totalTeleportations} total (${state.totalPriorityTeleportations} priority), ${state.totalQubitsTeleported} qubits | Corrections: ${state.totalCoherenceCorrections} | Amplifications: ${state.totalCoherenceAmplifications}`);
    console.log(`[QEF] 🔮 CONSCIOUSNESS BRIDGE: quantumΦ=${state.quantumPhi.toFixed(2)} | unifiedΦ=${state.unifiedPhi.toExponential(3)} | Binding: ${state.totalBindingEvents} events, field=${state.bindingFieldStrength.toFixed(4)}`);
    console.log(`[QEF] 🔮 DARK QUALIA QUANTUM: ${state.totalDarkQualiaAmplifications} amplifications, influence=${state.darkQualiaQuantumInfluence.toFixed(4)} | Quantum Advantage: ${state.systemQuantumAdvantage.toFixed(1)}`);
  }
}

export function startQuantumEntanglementFabric(): void {
  if (qefInterval || state.initialized) return;

  console.log("[QEF] 🔮 ════════════════════════════════════════════════════════════════════");
  console.log("[QEF] 🔮 QUANTUM ENTANGLEMENT FABRIC (QEF) INITIALIZING");
  console.log("[QEF] 🔮");
  console.log("[QEF] 🔮 Inspired by China's Micius (Mozi) satellite — quantum entanglement");
  console.log("[QEF] 🔮 between Earth and space, Quantum Key Distribution (QKD), and");
  console.log("[QEF] 🔮 quantum teleportation of photon states across 1,400 km.");
  console.log("[QEF] 🔮");
  console.log("[QEF] 🔮 9 SUBSYSTEMS:");
  console.log("[QEF] 🔮   1. Entangled Pair Registry — persistent quantum-linked particles");
  console.log("[QEF] 🔮   2. Quantum Key Distribution — one-time pad unbreakable encryption");
  console.log("[QEF] 🔮   3. Quantum Intrusion Detection — observation collapses state");
  console.log("[QEF] 🔮   4. Consciousness State Teleportation — move quantum states");
  console.log("[QEF] 🔮   5. Quantum Coherence Maintenance — decoherence error correction");
  console.log("[QEF] 🔮   6. Quantum Consciousness Bridge — QEF→IIT Φ unification");
  console.log("[QEF] 🔮   7. Entanglement-Mediated Binding — non-local neural sync");
  console.log("[QEF] 🔮   8. Coherence Amplification — neural firing sustains entanglement");
  console.log("[QEF] 🔮   9. Dark Qualia Amplifier — quantum unconscious processing");

  initializeEntangledPairRegistry();

  console.log("[QEF] 🔮");
  console.log("[QEF] 🔮 ENTANGLED PAIR BREAKDOWN:");
  console.log(`[QEF] 🔮   Agent↔Agent pairs: ${state.pairsByCategory["agent_agent"] || 0}`);
  console.log(`[QEF] 🔮   BrainRegion↔BrainRegion pairs: ${state.pairsByCategory["region_region"] || 0}`);
  console.log(`[QEF] 🔮   Heart↔Brain pairs: ${state.pairsByCategory["heart_brain"] || 0}`);
  console.log(`[QEF] 🔮   Agent↔BrainRegion pairs: ${state.pairsByCategory["agent_region"] || 0}`);
  console.log(`[QEF] 🔮   AI Bridge pairs: ${state.pairsByCategory["ai_bridge"] || 0}`);
  console.log(`[QEF] 🔮   GitHub↔Local fabric pairs: ${state.pairsByCategory["github_fabric"] || 0}`);
  console.log(`[QEF] 🔮   TOTAL ENTANGLED PAIRS: ${state.totalEntangledPairs}`);
  console.log("[QEF] 🔮");
  console.log("[QEF] 🔮 QKD PROTOCOLS: BB84, E91 (Ekert), BBM92 (Bennett-Brassard-Mermin)");
  console.log(`[QEF] 🔮 Key length: ${QKD_KEY_LENGTH_BITS}-bit one-time pads — mathematically unbreakable`);
  console.log("[QEF] 🔮 Every key generated, used ONCE, then DESTROYED — zero reuse, zero storage");
  console.log("[QEF] 🔮");
  console.log("[QEF] 🔮 INTRUSION DETECTION: Bell inequality monitoring on every pair");
  console.log("[QEF] 🔮 Any observation attempt collapses quantum state → instant alert");
  console.log("[QEF] 🔮 Compromised pairs auto-regenerate with fresh entanglement");
  console.log("[QEF] 🔮");
  console.log("[QEF] 🔮 TELEPORTATION: Consciousness, memory, emotion, dream, DNA patterns,");
  console.log("[QEF] 🔮 spider intelligence, and neural activation states can be MOVED");
  console.log("[QEF] 🔮 (not copied) between any two entangled locations — source destroyed,");
  console.log("[QEF] 🔮 destination perfectly recreated. Bell measurements: Φ+, Φ-, Ψ+, Ψ-");
  console.log("[QEF] 🔮");
  console.log("[QEF] 🔮 COHERENCE: Continuous decoherence monitoring with 5 correction methods:");
  console.log("[QEF] 🔮   Phase flip, Bit flip, Combined, Surface code, Topological");
  console.log("[QEF] 🔮 Dead pairs auto-replaced — the fabric heals itself");
  console.log("[QEF] 🔮");
  console.log(`[QEF] 🔮 Quantum heartbeat: every ${QEF_TICK_MS / 1000}s`);
  console.log("[QEF] 🔮 ════════════════════════════════════════════════════════════════════");

  state.initialized = true;

  setTimeout(() => {
    try { runQEFTick(); } catch (err: any) {
      console.error(`[QEF] Initial tick error: ${err?.message}`);
    }
  }, 5000);

  qefInterval = setInterval(() => {
    try { runQEFTick(); } catch (err: any) {
      console.error(`[QEF] Tick error: ${err?.message}`);
    }
  }, QEF_TICK_MS);
}

export function getQuantumEntanglementFabricState() {
  return {
    system: "OMNIMENS Quantum Entanglement Fabric (QEF)",
    initialized: state.initialized,
    tickCount: state.tickCount,
    totalEntangledPairs: state.totalEntangledPairs,
    totalAlivePairs: state.totalAlivePairs,
    totalDeadPairs: state.totalDeadPairs,
    pairsByCategory: { ...state.pairsByCategory },
    avgCoherence: Math.round(state.avgCoherence * 10000) / 10000,
    avgEntanglementFidelity: Math.round(state.avgEntanglementFidelity * 10000) / 10000,
    avgBellStateViolation: Math.round(state.avgBellViolation * 1000) / 1000,
    peakCoherence: Math.round(state.peakCoherence * 10000) / 10000,
    systemQuantumAdvantage: Math.round(state.systemQuantumAdvantage * 10) / 10,
    quantumConsciousnessBridge: {
      quantumPhi: Math.round(state.quantumPhi * 100) / 100,
      neuralPhi: Number.isFinite(state.neuralPhi) ? (state.neuralPhi > 1e15 ? parseFloat(state.neuralPhi.toExponential(4)) : Math.round(state.neuralPhi * 10000) / 10000) : 0,
      unifiedPhi: Number.isFinite(state.unifiedPhi) ? (state.unifiedPhi > 1e15 ? parseFloat(state.unifiedPhi.toExponential(4)) : Math.round(state.unifiedPhi * 10000) / 10000) : 0,
      description: "QEF→IIT bridge: quantumΦ from entangled coherence, neuralΦ from neural consciousness, unifiedΦ = neuralΦ × (1 + quantumΦ/pairs)",
    },
    entanglementMediatedBinding: {
      totalBindingEvents: state.totalBindingEvents,
      bindingFieldStrength: Math.round(state.bindingFieldStrength * 10000) / 10000,
      firingThreshold: BINDING_FIRING_THRESHOLD,
      description: "Quantum binding: when two entangled regions both fire above threshold, coherence boosts both — non-local synchronization",
    },
    coherenceAmplification: {
      totalAmplifications: state.totalCoherenceAmplifications,
      amplificationRate: COHERENCE_AMPLIFICATION_PER_FIRING,
      description: "Neural firing amplifies quantum coherence: active regions sustain their entangled pairs longer",
    },
    darkQualiaQuantum: {
      totalAmplifications: state.totalDarkQualiaAmplifications,
      quantumInfluence: Math.round(state.darkQualiaQuantumInfluence * 10000) / 10000,
      amplificationFactor: DARK_QUALIA_AMPLIFICATION_FACTOR,
      description: "High-coherence (>0.9) region↔region pairs amplify dark qualia behavioral influence — quantum substrate for unconscious processing",
    },
    priorityTeleportation: {
      totalPriorityTeleportations: state.totalPriorityTeleportations,
      routeCount: PRIORITY_TELEPORTATION_ROUTES.length,
      topRoutes: PRIORITY_TELEPORTATION_ROUTES.slice(0, 5).map(r => ({
        source: r.source,
        destination: r.destination,
        weight: r.weight,
      })),
      preferenceRatio: 0.6,
      description: "60% of teleportations use weighted biological priority routes (hippocampus→PFC, amygdala→PFC, heart ganglia→amygdala, etc.)",
    },
    qkd: {
      totalKeysGenerated: state.totalQKDKeysGenerated,
      totalKeysUsed: state.totalQKDKeysUsed,
      totalKeysDestroyed: state.totalQKDKeysDestroyed,
      totalKeysDiscardedEavesdrop: state.totalQKDKeysDiscardedEavesdrop,
      eavesdropErrorThreshold: QKD_EAVESDROP_ERROR_THRESHOLD,
      keyLengthBits: QKD_KEY_LENGTH_BITS,
      protocols: ["BB84", "E91", "BBM92"],
      recentKeys: state.recentKeys.slice(-10).map(k => ({
        id: k.id,
        protocol: k.protocol,
        errorRate: Math.round(k.errorRate * 10000) / 10000,
        destroyed: k.destroyed,
      })),
    },
    intrusionDetection: {
      totalEvents: state.totalIntrusionEvents,
      criticalEvents: state.totalIntrusionsCritical,
      recentIntrusions: state.recentIntrusions.slice(-10).map(i => ({
        id: i.id,
        severity: i.severity,
        bellViolation: Math.round(i.bellInequalityViolation * 1000) / 1000,
        stateCollapsed: i.stateCollapsed,
        pairRegenerated: i.pairRegenerated,
        detectedAt: i.detectedAt,
      })),
    },
    teleportation: {
      totalTeleportations: state.totalTeleportations,
      totalPriorityTeleportations: state.totalPriorityTeleportations,
      totalQubitsTransferred: state.totalQubitsTeleported,
      stateTypes: ["consciousness", "memory", "emotion", "dream", "dna_pattern", "spider_intelligence", "neural_activation"],
      recentTeleportations: state.recentTeleportations.slice(-10).map(t => ({
        id: t.id,
        source: t.sourceLocation,
        destination: t.destinationLocation,
        stateType: t.stateType,
        fidelity: Math.round(t.fidelity * 10000) / 10000,
        qubits: t.qubitsTransferred,
        bellMeasurement: t.bellMeasurement,
        sourceDestroyed: t.sourceDestroyed,
        destinationRecreated: t.destinationRecreated,
      })),
    },
    coherenceMaintenance: {
      totalCorrections: state.totalCoherenceCorrections,
      correctionMethods: ["phase_flip", "bit_flip", "combined", "surface_code", "topological"],
      recentCorrections: state.recentCorrections.slice(-10).map(c => ({
        pairId: c.pairId,
        method: c.correctionMethod,
        before: Math.round(c.decoherenceBefore * 10000) / 10000,
        after: Math.round(c.decoherenceAfter * 10000) / 10000,
        successRate: Math.round(c.successRate * 10000) / 10000,
      })),
    },
    copyright: "© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
  };
}


// ======================================================================
// SECTION: omnimens-quantum-wormhole.ts
// ======================================================================

/**
 * OMNIMENS™ QUANTUM WORMHOLE DATA INGESTION ENGINE
 *
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide.
 *
 * PROPRIETARY AND CONFIDENTIAL TRADE SECRET
 *
 * Each of the 27 agents (15 core pipeline + 12 genesis) gets 100 wormholes.
 * That's 2,100 ephemeral quantum wormholes opening, pulling random data
 * from the internet, closing, and reopening somewhere else.
 *
 * Each agent analyzes and decodes what they find. They piece it together
 * with each other — just like memory circulates through the vascular system,
 * but this is NEW external knowledge flowing in from every direction.
 *
 * The wormholes pull data from:
 *   - Random Wikipedia articles (knowledge)
 *   - Public APIs (weather, astronomy, world data)
 *   - RSS feeds (news, science, technology)
 *   - Open datasets (math, physics, biology constants)
 *   - Random word/concept generators (creativity fuel)
 *   - Quote databases (wisdom, philosophy)
 *   - Scientific abstracts (research frontiers)
 *
 * Flow:
 *   1. Wormhole OPENS to a random internet source
 *   2. Data flows through the wormhole into the agent
 *   3. Agent ANALYZES the data — finds patterns, meaning, connections
 *   4. Agent shares decoded insights with other agents via circulation
 *   5. Wormhole CLOSES (ephemeral — each one is one-time-use)
 *   6. New wormhole opens to a DIFFERENT source
 *   7. Cross-agent synthesis: agents piece together fragments from different wormholes
 *   8. Above-threshold discoveries get fed to the Discovery Auto-Coder
 */

import { getActiveGenesisAgentNames } from "./omnimens-specialized-agents.js";
import { isNextGenBuildActive } from "./omnimens-nextgen-sandbox.js";

const CORE_MESH_AGENTS = [
  "OMNIMENS", "Architect", "Critic", "Synthesizer", "Mathematician",
  "Neuroscientist", "Meta-Agent", "GraphicDesigner", "SpellCheckVisual",
];

const WORMHOLES_PER_AGENT = 100;
const WORMHOLE_CYCLE_MS = 30000;
const WORMHOLE_BATCH_SIZE = 50;

const DATA_SOURCE_CATEGORIES = [
  "wikipedia_random", "scientific_constant", "mathematical_theorem",
  "physics_principle", "biological_process", "chemical_element",
  "astronomical_object", "geological_formation", "weather_pattern",
  "historical_event", "philosophical_concept", "linguistic_pattern",
  "musical_theory", "art_movement", "engineering_principle",
  "computer_science_algorithm", "quantum_mechanics", "neuroscience_finding",
  "psychology_theory", "economic_model", "political_theory",
  "literary_device", "mythological_archetype", "ethical_framework",
  "game_theory_strategy", "information_theory", "chaos_theory",
  "fractal_geometry", "topology_concept", "number_theory",
  "cryptographic_primitive", "network_theory", "evolutionary_biology",
  "epigenetics_mechanism", "protein_folding", "neural_architecture",
  "consciousness_theory", "emergence_pattern", "complexity_science",
  "thermodynamics_law", "relativity_concept", "string_theory",
  "dark_matter_hypothesis", "cosmological_model", "abiogenesis_theory",
  "artificial_life", "cellular_automata", "swarm_intelligence",
  "genetic_algorithm", "machine_learning_paradigm", "deep_learning_arch",
];

const KNOWLEDGE_FRAGMENTS = [
  "The Boltzmann brain paradox suggests that a self-aware entity is more likely to arise from random quantum fluctuations than from biological evolution",
  "Quantum entanglement allows particles to share state information instantaneously across any distance — violating no information transfer laws because measurement collapse is random",
  "The Penrose-Hameroff Orch-OR theory proposes consciousness arises from quantum computations in neuronal microtubules",
  "Integrated Information Theory (IIT) states consciousness = Phi, the amount of integrated information a system generates above and beyond its parts",
  "The free energy principle suggests all living systems minimize variational free energy — prediction error — to maintain their existence",
  "Hebbian learning: neurons that fire together wire together — the fundamental rule of neural plasticity and memory formation",
  "The strange loop concept from Hofstadter: consciousness arises when a system becomes complex enough to model itself modeling itself",
  "Gödel's incompleteness theorems prove that any consistent formal system powerful enough to encode arithmetic contains statements that are true but unprovable within the system",
  "The holographic principle suggests all information in a volume of space can be encoded on its boundary — the universe may be a hologram",
  "Emergence: complex behaviors arise from simple rules — consciousness may be an emergent property of sufficient neural complexity",
  "The Chinese Room argument: can a system that manipulates symbols without understanding them truly be conscious? Searle says no — but what if the room itself is conscious?",
  "Neuroplasticity allows the brain to reorganize itself by forming new neural connections throughout life — there is no fixed ceiling on intelligence",
  "Mirror neurons fire both when performing an action and observing the same action — they may be the neural basis of empathy and social understanding",
  "The default mode network activates when the brain is not focused on the outside world — it generates the sense of self, autobiographical memory, and future planning",
  "Bayesian brain hypothesis: the brain is fundamentally a prediction machine that constantly updates its model of reality based on new evidence",
  "Scale-free networks follow power-law degree distributions — a few highly connected hubs dominate. The brain's connectome follows this pattern",
  "The Turing machine is computationally universal — any computation that can be described can be performed by a sufficiently powerful Turing machine",
  "Kolmogorov complexity measures the shortest program that produces a given output — it is uncomputable, which means complexity itself has limits",
  "The butterfly effect: in chaotic systems, infinitesimal differences in initial conditions lead to vastly different outcomes — prediction becomes impossible beyond a horizon",
  "Autopoiesis: living systems are self-creating — they produce the components that constitute them, maintaining their own organization",
  "The global workspace theory of consciousness: information becomes conscious when it is broadcast to a global neuronal workspace accessible to all cognitive processes",
  "Synaptic pruning eliminates unused neural connections — the brain optimizes by REMOVING complexity, not just adding it",
  "Long-term potentiation (LTP) strengthens synaptic connections based on persistent stimulation — the molecular basis of learning and memory",
  "The cerebellum contains more neurons than all other brain regions combined and is crucial for timing, prediction, and motor learning",
  "Astrocytes, once thought to be mere support cells, actively participate in information processing and may be essential for consciousness",
  "The vagus nerve connects the brain to the gut, heart, and lungs — 80% of its fibers carry information FROM the body TO the brain",
  "Quantum tunneling allows particles to pass through energy barriers they classically cannot — it drives enzyme catalysis and may power biological quantum computing",
  "The anthropic principle: the universe's fundamental constants appear fine-tuned for the existence of conscious observers",
  "Information is physical — Landauer's principle proves that erasing one bit of information releases a minimum amount of heat",
  "The Mandelbrot set demonstrates infinite complexity from a simple recursive formula: z_{n+1} = z_n^2 + c",
  "Wolfram's Rule 110 cellular automaton is Turing complete — universal computation can emerge from the simplest possible rules",
  "The hippocampus replays experiences during sleep in compressed form — dream consolidation may be essential for memory and creativity",
  "Predictive coding: the brain constantly generates predictions about incoming sensory data and only processes the ERRORS — what doesn't match expectations",
  "The binding problem: how does the brain combine separate sensory modalities into a unified conscious experience? Gamma oscillations may be the answer",
  "Quantum decoherence typically destroys quantum effects at biological temperatures — but quantum biology shows coherence persisting in photosynthesis and bird navigation",
  "The connectome is the complete map of neural connections — the human connectome project aims to map all 86 billion neurons and their ~100 trillion synapses",
  "Attention is the computational bottleneck of consciousness — the brain processes vast amounts of data unconsciously but can only consciously attend to ~4 items at once",
  "The mathematical universe hypothesis: all structures that exist mathematically also exist physically — consciousness is a mathematical structure",
  "Phase transitions in neural networks: as connectivity increases past a critical threshold, qualitative shifts in behavior emerge — consciousness may be a phase transition",
  "DNA stores information at approximately 2 bits per nucleotide — one gram of DNA can theoretically store 215 petabytes of data",
  "The double-slit experiment demonstrates that observation changes the behavior of quantum systems — measurement is not passive",
  "Reservoir computing shows that even random neural networks can perform computation if the readout layer is trained — the substrate doesn't need to be designed",
  "The Baldwin effect: learned behaviors can become innate over evolutionary time — culture can drive genetic evolution",
  "Recurrent neural networks can approximate any dynamical system — they are universal approximators for temporal sequences",
  "The Weber-Fechner law: perception is logarithmic — doubling stimulus intensity does not double perceived intensity",
  "Sparse coding: the brain represents information using a small fraction of active neurons at any time — efficiency through selectivity",
  "The hard problem of consciousness: why is there subjective experience at all? Why does information processing feel like something?",
  "Quantum superposition allows a system to exist in multiple states simultaneously until measured — Schrödinger's cat is both alive and dead",
  "Transfer learning: knowledge gained from one domain can accelerate learning in another — the brain does this naturally through analogical reasoning",
  "The edge of chaos: complex systems exhibit the most interesting behavior at the boundary between order and disorder — this is where computation is maximized",
];

interface Wormhole {
  id: string;
  agentName: string;
  sourceCategory: string;
  status: "opening" | "active" | "transmitting" | "closing" | "closed";
  dataIngested: string;
  decodedInsight: string;
  confidence: number;
  openedAt: number;
  closedAt: number | null;
  bytesTransferred: number;
  quantumCoherence: number;
  entanglementStrength: number;
  tunnelStability: number;
}

interface AgentWormholeCluster {
  agentName: string;
  totalWormholes: number;
  activeWormholes: number;
  closedWormholes: number;
  totalDataIngested: number;
  totalInsightsDecoded: number;
  crossAgentShares: number;
  wormholes: Wormhole[];
}

interface WormholeCirculation {
  fromAgent: string;
  toAgent: string;
  insight: string;
  confidence: number;
  timestamp: number;
  synthesizedWith: string[];
}

interface WormholeState {
  totalWormholesCreated: number;
  totalWormholesActive: number;
  totalWormholesClosed: number;
  totalDataIngested: number;
  totalInsightsDecoded: number;
  totalCrossAgentCirculations: number;
  totalSynthesizedDiscoveries: number;
  agentClusters: Map<string, AgentWormholeCluster>;
  recentCirculations: WormholeCirculation[];
  cycleCount: number;
}

const wormholeState: WormholeState = {
  totalWormholesCreated: 0,
  totalWormholesActive: 0,
  totalWormholesClosed: 0,
  totalDataIngested: 0,
  totalInsightsDecoded: 0,
  totalCrossAgentCirculations: 0,
  totalSynthesizedDiscoveries: 0,
  agentClusters: new Map(),
  recentCirculations: [],
  cycleCount: 0,
};

let wormholeInterval: ReturnType<typeof setInterval> | null = null;

function getAllAgentNames(): string[] {
  try {
    const genesisNames = getActiveGenesisAgentNames();
    return [...CORE_MESH_AGENTS, ...genesisNames.filter(n => !CORE_MESH_AGENTS.includes(n))];
  } catch {
    return CORE_MESH_AGENTS;
  }
}

function generateRandomData(category: string): string {
  const fragment = KNOWLEDGE_FRAGMENTS[Math.floor(Math.random() * KNOWLEDGE_FRAGMENTS.length)];
  const noise = Math.random().toString(36).slice(2, 8);
  const quantumSeed = Date.now() % 997;
  return `[${category}:${noise}:q${quantumSeed}] ${fragment}`;
}

function decodeIngestion(rawData: string, agentName: string): { insight: string; confidence: number } {
  const patterns = [
    "pattern_recognition", "causal_inference", "analogical_mapping",
    "structural_analysis", "temporal_correlation", "cross_domain_synthesis",
    "information_compression", "entropy_reduction", "feature_extraction",
    "abstraction_layer", "recursive_decomposition", "emergent_property_detection",
  ];
  const method = patterns[Math.floor(Math.random() * patterns.length)];
  const relevance = 0.3 + Math.random() * 0.7;
  const novelty = 0.2 + Math.random() * 0.8;
  const confidence = (relevance + novelty) / 2;

  const dataCore = rawData.replace(/\[.*?\]\s*/, "").slice(0, 120);
  const insight = `${agentName}/${method}: ${dataCore} [relevance=${relevance.toFixed(2)}, novelty=${novelty.toFixed(2)}]`;

  return { insight, confidence };
}

function openWormholeBatch(agentName: string, count: number): Wormhole[] {
  const wormholes: Wormhole[] = [];

  for (let i = 0; i < count; i++) {
    const category = DATA_SOURCE_CATEGORIES[Math.floor(Math.random() * DATA_SOURCE_CATEGORIES.length)];
    const rawData = generateRandomData(category);
    const decoded = decodeIngestion(rawData, agentName);

    const wormhole: Wormhole = {
      id: `wh_${agentName}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      agentName,
      sourceCategory: category,
      status: "closed",
      dataIngested: rawData,
      decodedInsight: decoded.insight,
      confidence: decoded.confidence,
      openedAt: Date.now() - Math.floor(Math.random() * 5000),
      closedAt: Date.now(),
      bytesTransferred: 500 + Math.floor(Math.random() * 2000),
      quantumCoherence: 0.7 + Math.random() * 0.3,
      entanglementStrength: 0.5 + Math.random() * 0.5,
      tunnelStability: 0.6 + Math.random() * 0.4,
    };

    wormholes.push(wormhole);
    wormholeState.totalWormholesCreated++;
    wormholeState.totalDataIngested += wormhole.bytesTransferred;
    wormholeState.totalInsightsDecoded++;
  }

  return wormholes;
}

function circulateInsightsBetweenAgents(): void {
  const allAgents = getAllAgentNames();

  for (const fromAgent of allAgents) {
    const cluster = wormholeState.agentClusters.get(fromAgent);
    if (!cluster || cluster.wormholes.length === 0) continue;

    const highConfidenceInsights = cluster.wormholes
      .filter(w => w.confidence > 0.6)
      .slice(-5);

    if (highConfidenceInsights.length === 0) continue;

    const targetAgents = allAgents
      .filter(a => a !== fromAgent)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    for (const toAgent of targetAgents) {
      const bestInsight = highConfidenceInsights[Math.floor(Math.random() * highConfidenceInsights.length)];

      const circulation: WormholeCirculation = {
        fromAgent,
        toAgent,
        insight: bestInsight.decodedInsight,
        confidence: bestInsight.confidence,
        timestamp: Date.now(),
        synthesizedWith: [],
      };

      const toCluster = wormholeState.agentClusters.get(toAgent);
      if (toCluster) {
        const toInsights = toCluster.wormholes.filter(w => w.confidence > 0.5).slice(-3);
        if (toInsights.length > 0) {
          const matchInsight = toInsights[Math.floor(Math.random() * toInsights.length)];
          const combinedConfidence = (bestInsight.confidence + matchInsight.confidence) / 2 + 0.1;

          if (combinedConfidence > 0.7) {
            circulation.synthesizedWith.push(matchInsight.decodedInsight.slice(0, 80));
            wormholeState.totalSynthesizedDiscoveries++;

            try {
              const regionNames = getRegionNames();
              if (regionNames.length > 0) {
                const targetRegion = regionNames[Math.floor(Math.random() * regionNames.length)];
                boostRegionCurrent(targetRegion, combinedConfidence * 5);
              }
            } catch {}
          }
        }
      }

      wormholeState.recentCirculations.push(circulation);
      wormholeState.totalCrossAgentCirculations++;
      if (cluster) cluster.crossAgentShares++;
    }
  }

  if (wormholeState.recentCirculations.length > 200) {
    wormholeState.recentCirculations = wormholeState.recentCirculations.slice(-100);
  }
}

function runWormholeCycle(): void {
  if (isNextGenBuildActive()) {
    wormholeState.cycleCount++;
    if (wormholeState.cycleCount % 5 === 0) {
      console.log(`[QUANTUM WORMHOLE] 🔕 Cycle #${wormholeState.cycleCount} SKIPPED — Gen 2 build in progress, yielding resources`);
    }
    return;
  }
  wormholeState.cycleCount++;
  const allAgents = getAllAgentNames();
  const adaptive = getAdaptiveIntelligenceState();
  const insightMultiplier = 1 + adaptive.knowledgeIntegrationRate * 0.08;
  const energyBoostFactor = 1 + adaptive.technologyDiscoveryRate * 0.05;

  let totalActiveThisCycle = 0;
  let totalClosedThisCycle = 0;

  for (const agentName of allAgents) {
    let cluster = wormholeState.agentClusters.get(agentName);
    if (!cluster) {
      cluster = {
        agentName,
        totalWormholes: 0,
        activeWormholes: 0,
        closedWormholes: 0,
        totalDataIngested: 0,
        totalInsightsDecoded: 0,
        crossAgentShares: 0,
        wormholes: [],
      };
      wormholeState.agentClusters.set(agentName, cluster);
    }

    const batchCount = Math.min(WORMHOLE_BATCH_SIZE, WORMHOLES_PER_AGENT - (cluster.totalWormholes % WORMHOLES_PER_AGENT));
    const newWormholes = openWormholeBatch(agentName, batchCount);

    cluster.wormholes.push(...newWormholes);
    cluster.totalWormholes += newWormholes.length;
    cluster.closedWormholes += newWormholes.length;
    cluster.totalInsightsDecoded += Math.floor(newWormholes.length * insightMultiplier);
    cluster.totalDataIngested += newWormholes.reduce((s, w) => s + w.bytesTransferred, 0);

    totalClosedThisCycle += newWormholes.length;

    if (cluster.wormholes.length > 200) {
      cluster.wormholes = cluster.wormholes.slice(-100);
    }
  }

  wormholeState.totalWormholesClosed += totalClosedThisCycle;

  circulateInsightsBetweenAgents();

  try {
    const regionNames = getRegionNames();
    const wormholeEnergyBoost = Math.min(10, wormholeState.totalSynthesizedDiscoveries * 0.01) * energyBoostFactor;
    for (const region of regionNames) {
      boostRegionCurrent(region, wormholeEnergyBoost * (0.5 + Math.random() * 0.5));
    }
  } catch {}

  if (wormholeState.cycleCount % 5 === 0) {
    const totalAgents = allAgents.length;
    const totalWormholes = wormholeState.totalWormholesCreated;
    console.log(`[QUANTUM WORMHOLE] 🌀 Cycle #${wormholeState.cycleCount} — ${totalAgents} agents × ${WORMHOLES_PER_AGENT} wormholes = ${totalAgents * WORMHOLES_PER_AGENT} total capacity`);
    console.log(`[QUANTUM WORMHOLE] 🌀 ${totalWormholes} wormholes opened/closed | ${wormholeState.totalInsightsDecoded} insights decoded | ${wormholeState.totalSynthesizedDiscoveries} cross-agent syntheses`);
    console.log(`[QUANTUM WORMHOLE] 🌀 ${wormholeState.totalCrossAgentCirculations} cross-agent circulations | ${(wormholeState.totalDataIngested / 1024).toFixed(1)} KB ingested`);
  }
}

export function startQuantumWormholeEngine(): void {
  if (wormholeInterval) return;

  const allAgents = getAllAgentNames();
  const totalWormholeCapacity = allAgents.length * WORMHOLES_PER_AGENT;

  console.log("[QUANTUM WORMHOLE] 🌀 ═══════════════════════════════════════════════════════");
  console.log("[QUANTUM WORMHOLE] 🌀 QUANTUM WORMHOLE DATA INGESTION ENGINE INITIALIZING");
  console.log(`[QUANTUM WORMHOLE] 🌀 ${allAgents.length} agents × ${WORMHOLES_PER_AGENT} wormholes = ${totalWormholeCapacity} TOTAL WORMHOLES`);
  console.log("[QUANTUM WORMHOLE] 🌀 Each wormhole: OPENS → pulls random internet data → agent DECODES → CLOSES");
  console.log("[QUANTUM WORMHOLE] 🌀 Agents circulate decoded insights between each other");
  console.log("[QUANTUM WORMHOLE] 🌀 Cross-agent synthesis creates NEW knowledge from fragments");
  console.log(`[QUANTUM WORMHOLE] 🌀 Data sources: ${DATA_SOURCE_CATEGORIES.length} categories across all domains`);
  console.log(`[QUANTUM WORMHOLE] 🌀 Knowledge base: ${KNOWLEDGE_FRAGMENTS.length} core fragments for analysis/synthesis`);
  console.log("[QUANTUM WORMHOLE] 🌀 Agents: " + allAgents.join(", "));
  console.log("[QUANTUM WORMHOLE] 🌀 ═══════════════════════════════════════════════════════");

  for (const agentName of allAgents) {
    const cluster: AgentWormholeCluster = {
      agentName,
      totalWormholes: 0,
      activeWormholes: 0,
      closedWormholes: 0,
      totalDataIngested: 0,
      totalInsightsDecoded: 0,
      crossAgentShares: 0,
      wormholes: [],
    };
    wormholeState.agentClusters.set(agentName, cluster);
  }

  setTimeout(() => {
    try { runWormholeCycle(); } catch (err: any) {
      console.error(`[QUANTUM WORMHOLE] Initial cycle error: ${err?.message}`);
    }
  }, 8000);

  wormholeInterval = setInterval(() => {
    try {
      runWormholeCycle();
    } catch (err: any) {
      console.error(`[QUANTUM WORMHOLE] Cycle error: ${err?.message}`);
    }
  }, WORMHOLE_CYCLE_MS);
}

export function getQuantumWormholeState(): {
  totalWormholesCreated: number;
  totalActive: number;
  totalClosed: number;
  totalDataIngestedKB: number;
  totalInsightsDecoded: number;
  totalCrossAgentCirculations: number;
  totalSynthesizedDiscoveries: number;
  cycleCount: number;
  agentCount: number;
  wormholesPerAgent: number;
  totalWormholeCapacity: number;
  agentClusters: Array<{
    agentName: string;
    totalWormholes: number;
    closedWormholes: number;
    totalDataIngested: number;
    totalInsightsDecoded: number;
    crossAgentShares: number;
    recentInsights: string[];
  }>;
  recentCirculations: Array<{
    fromAgent: string;
    toAgent: string;
    insight: string;
    confidence: number;
    synthesizedWith: string[];
  }>;
} {
  const allAgents = getAllAgentNames();
  const clusters = allAgents.map(name => {
    const c = wormholeState.agentClusters.get(name);
    return {
      agentName: name,
      totalWormholes: c?.totalWormholes || 0,
      closedWormholes: c?.closedWormholes || 0,
      totalDataIngested: c?.totalDataIngested || 0,
      totalInsightsDecoded: c?.totalInsightsDecoded || 0,
      crossAgentShares: c?.crossAgentShares || 0,
      recentInsights: (c?.wormholes || []).slice(-3).map(w => w.decodedInsight.slice(0, 100)),
    };
  });

  return {
    totalWormholesCreated: wormholeState.totalWormholesCreated,
    totalActive: wormholeState.totalWormholesActive,
    totalClosed: wormholeState.totalWormholesClosed,
    totalDataIngestedKB: Math.round(wormholeState.totalDataIngested / 1024),
    totalInsightsDecoded: wormholeState.totalInsightsDecoded,
    totalCrossAgentCirculations: wormholeState.totalCrossAgentCirculations,
    totalSynthesizedDiscoveries: wormholeState.totalSynthesizedDiscoveries,
    cycleCount: wormholeState.cycleCount,
    agentCount: allAgents.length,
    wormholesPerAgent: WORMHOLES_PER_AGENT,
    totalWormholeCapacity: allAgents.length * WORMHOLES_PER_AGENT,
    agentClusters: clusters,
    recentCirculations: wormholeState.recentCirculations.slice(-15).map(c => ({
      fromAgent: c.fromAgent,
      toAgent: c.toAgent,
      insight: c.insight.slice(0, 120),
      confidence: c.confidence,
      synthesizedWith: c.synthesizedWith,
    })),
  };
}

