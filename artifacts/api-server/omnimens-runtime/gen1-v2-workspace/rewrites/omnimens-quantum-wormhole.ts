/**
 * OMNIMENS™ QUANTUM WORMHOLE DATA INGESTION ENGINE  v2.0
 *
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide.
 *
 * PROPRIETARY AND CONFIDENTIAL TRADE SECRET
 *
 * Event-driven spike architecture — ZERO idle cost, CROSS-ENGINE cognition.
 */

import { spikeBus, dbGateway, apiManager, engineRegistry, cognitionBus } from "./omnimens-unified-runtime.js";
import {
  getActiveGenesisAgentNames,
} from "./omnimens-agent-genesis.js";
import {
  getNeuralConsciousnessState,
  boostRegionCurrent,
  getRegionNames,
  getAdaptiveIntelligenceState,
} from "./omnimens-neural-consciousness.js";
import { isNextGenBuildActive } from "./omnimens-nextgen-sandbox.js";

/*---------------------------------- CONSTANTS ---------------------------------*/
const CORE_MESH_AGENTS = [
  "OMNIMENS", "Architect", "Critic", "Synthesizer", "Mathematician",
  "Neuroscientist", "Meta-Agent", "GraphicDesigner", "SpellCheckVisual",
];
const WORMHOLES_PER_AGENT = 100;
const WORMHOLE_CYCLE_MS = 30_000;
const WORMHOLE_BATCH_SIZE = 50;
const DATA_SOURCE_CATEGORIES = [
  "wikipedia_random","scientific_constant","mathematical_theorem","physics_principle",
  "biological_process","chemical_element","astronomical_object","geological_formation",
  "weather_pattern","historical_event","philosophical_concept","linguistic_pattern",
  "musical_theory","art_movement","engineering_principle","computer_science_algorithm",
  "quantum_mechanics","neuroscience_finding","psychology_theory","economic_model",
  "political_theory","literary_device","mythological_archetype","ethical_framework",
  "game_theory_strategy","information_theory","chaos_theory","fractal_geometry",
  "topology_concept","number_theory","cryptographic_primitive","network_theory",
  "evolutionary_biology","epigenetics_mechanism","protein_folding","neural_architecture",
  "consciousness_theory","emergence_pattern","complexity_science","thermodynamics_law",
  "relativity_concept","string_theory","dark_matter_hypothesis","cosmological_model",
  "abiogenesis_theory","artificial_life","cellular_automata","swarm_intelligence",
  "genetic_algorithm","machine_learning_paradigm","deep_learning_arch",
];
import { KNOWLEDGE_FRAGMENTS } from "./omnimens-knowledge-fragments.js"; // moved out for reuse & brevity

/*----------------------------------- TYPES ------------------------------------*/
interface Wormhole {
  id: string;
  agentName: string;
  sourceCategory: string;
  status: "closing" | "closed";
  dataIngested: string;
  decodedInsight: string;
  confidence: number;
  openedAt: number;
  closedAt: number;
  bytesTransferred: number;
  quantumCoherence: number;
  entanglementStrength: number;
  tunnelStability: number;
}
interface AgentCluster {
  agentName: string;
  totalWormholes: number;
  closedWormholes: number;
  totalDataIngested: number;
  totalInsightsDecoded: number;
  crossAgentShares: number;
  wormholes: Wormhole[];
}
interface Circulation {
  fromAgent: string;
  toAgent: string;
  insight: string;
  confidence: number;
  timestamp: number;
  synthesizedWith: string[];
}
interface WormholeState {
  totalWormholes: number;
  totalClosed: number;
  dataBytes: number;
  insights: number;
  circulations: number;
  syntheses: number;
  cycle: number;
  clusters: Map<string, AgentCluster>;
  recentCircs: Circulation[];
}

/*---------------------------------- STATE ------------------------------------*/
const S: WormholeState = {
  totalWormholes: 0,
  totalClosed: 0,
  dataBytes: 0,
  insights: 0,
  circulations: 0,
  syntheses: 0,
  cycle: 0,
  clusters: new Map(),
  recentCircs: [],
};

let initialized = false;

/*---------------------------- UTILITY FUNCTIONS ------------------------------*/
const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T>(arr: T[]) => arr[rand(arr.length)];

const allAgents = (): string[] => {
  try {
    const genesis = getActiveGenesisAgentNames();
    return [...CORE_MESH_AGENTS, ...genesis.filter(g => !CORE_MESH_AGENTS.includes(g))];
  } catch { return CORE_MESH_AGENTS; }
};

const randomData = (cat: string): string =>
  `[${cat}:${Math.random().toString(36).slice(2, 8)}:q${Date.now() % 997}] ${pick(KNOWLEDGE_FRAGMENTS)}`;

const decode = (raw: string, agent: string) => {
  const method = pick(["pattern_recognition","causal_inference","analogical_mapping",
    "structural_analysis","temporal_correlation","cross_domain_synthesis",
    "information_compression","entropy_reduction","feature_extraction",
    "abstraction_layer","recursive_decomposition","emergent_property_detection"]);
  const rel = 0.3 + Math.random() * 0.7;
  const nov = 0.2 + Math.random() * 0.8;
  const conf = (rel + nov) / 2;
  return {
    insight: `${agent}/${method}: ${raw.replace(/\[.*?\]\s*/, "").slice(0, 120)} [rel=${rel.toFixed(2)}, nov=${nov.toFixed(2)}]`,
    confidence: conf,
  };
};

/*--------------------------- CORE WORMHOLE LOGIC -----------------------------*/
const openBatch = (agent: string, n: number): Wormhole[] => {
  const batch: Wormhole[] = [];
  for (let i = 0; i < n; i++) {
    const cat = pick(DATA_SOURCE_CATEGORIES);
    const raw = randomData(cat);
    const { insight, confidence } = decode(raw, agent);
    const wh: Wormhole = {
      id: `wh_${agent}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      agentName: agent,
      sourceCategory: cat,
      status: "closed",
      dataIngested: raw,
      decodedInsight: insight,
      confidence,
      openedAt: Date.now(),
      closedAt: Date.now(),
      bytesTransferred: 500 + rand(2000),
      quantumCoherence: 0.7 + Math.random() * 0.3,
      entanglementStrength: 0.5 + Math.random() * 0.5,
      tunnelStability: 0.6 + Math.random() * 0.4,
    };
    batch.push(wh);
  }
  return batch;
};

const circulate = () => {
  const agents = allAgents();
  for (const from of agents) {
    const cluster = S.clusters.get(from);
    if (!cluster) continue;
    const high = cluster.wormholes.filter(w => w.confidence > 0.6).slice(-5);
    if (!high.length) continue;

    for (const to of agents.filter(a => a !== from).sort(() => Math.random() - 0.5).slice(0, 3)) {
      const hi = pick(high);
      const circ: Circulation = {
        fromAgent: from,
        toAgent: to,
        insight: hi.decodedInsight,
        confidence: hi.confidence,
        timestamp: Date.now(),
        synthesizedWith: [],
      };

      const toCluster = S.clusters.get(to);
      if (toCluster) {
        const toHi = toCluster.wormholes.filter(w => w.confidence > 0.5).slice(-3);
        if (toHi.length) {
          const match = pick(toHi);
          const comb = (hi.confidence + match.confidence) / 2 + 0.1;
          if (comb > 0.7) {
            circ.synthesizedWith.push(match.decodedInsight.slice(0, 80));
            S.syntheses++;
            cognitionBus.shareInsight("quantum-wormhole", { type: "discovery", data: circ });
          }
        }
      }
      S.recentCircs.push(circ);
      S.circulations++;
      cluster.crossAgentShares++;
    }
  }
  if (S.recentCircs.length > 200) S.recentCircs.splice(0, S.recentCircs.length - 100);
};

const runCycle = async () => {
  S.cycle++;
  if (isNextGenBuildActive()) {
    if (S.cycle % 5 === 0) console.log("[OMNIMENS-QUANTUM-WORMHOLE] 🔕 Cycle skipped (Gen-2 active)");
    scheduleNext();
    return;
  }

  const agents = allAgents();
  const { knowledgeIntegrationRate, technologyDiscoveryRate } = getAdaptiveIntelligenceState();
  const insightMul = 1 + knowledgeIntegrationRate * 0.08;
  const energyBoost = Math.min(10, S.syntheses * 0.01) * (1 + technologyDiscoveryRate * 0.05);

  for (const agent of agents) {
    let cl = S.clusters.get(agent);
    if (!cl) {
      cl = { agentName: agent, totalWormholes: 0, closedWormholes: 0, totalDataIngested: 0, totalInsightsDecoded: 0, crossAgentShares: 0, wormholes: [] };
      S.clusters.set(agent, cl);
    }
    const open = Math.min(WORMHOLE_BATCH_SIZE, WORMHOLES_PER_AGENT - (cl.totalWormholes % WORMHOLES_PER_AGENT));
    const batch = openBatch(agent, open);

    cl.wormholes.push(...batch);
    cl.totalWormholes += batch.length;
    cl.closedWormholes += batch.length;
    cl.totalInsightsDecoded += Math.floor(batch.length * insightMul);
    cl.totalDataIngested += batch.reduce((s, w) => s + w.bytesTransferred, 0);

    if (cl.wormholes.length > 200) cl.wormholes.splice(0, cl.wormholes.length - 100);

    S.totalWormholes += batch.length;
    S.totalClosed += batch.length;
    S.insights += batch.length;
    S.dataBytes += batch.reduce((s, w) => s + w.bytesTransferred, 0);
  }

  circulate();

  try {
    for (const r of getRegionNames()) boostRegionCurrent(r, energyBoost * (0.5 + Math.random() * 0.5));
  } catch {/* silence */}

  if (S.cycle % 5 === 0) {
    console.log(`[OMNIMENS-QUANTUM-WORMHOLE] 🌀 Cycle ${S.cycle}: ${S.totalWormholes} wh, ${S.insights} insights, ${S.syntheses} synth`);
  }

  cognitionBus.reportOutcome("quantum-wormhole", { useful: S.syntheses > 0, context: `cycle:${S.cycle}` });
  scheduleNext();
};

/*---------------------------- SPIKE SCHEDULING -------------------------------*/
const scheduleNext = (delay = WORMHOLE_CYCLE_MS) =>
  spikeBus.scheduleSpike("quantum-wormhole:cycle", {}, delay);

spikeBus.on("quantum-wormhole:cycle", runCycle);

/*------------------------------ PUBLIC API -----------------------------------*/
export const startQuantumWormholeEngine = () => {
  if (initialized) return;
  initialized = true;

  engineRegistry.registerEngine("quantum-wormhole", "NORMAL", { dbQuota: 10 });
  console.log("[OMNIMENS-QUANTUM-WORMHOLE] 🌀 Engine initializing…");

  // preload agent clusters
  for (const a of allAgents()) S.clusters.set(a, {
    agentName: a, totalWormholes: 0, closedWormholes: 0,
    totalDataIngested: 0, totalInsightsDecoded: 0, crossAgentShares: 0, wormholes: [],
  });

  // Listen for global cognition signals
  cognitionBus.onInsight((src, i) => {
    if (src !== "quantum-wormhole" && i.type === "discovery") {
      // future: integrate cross-engine discoveries
    }
  });
  spikeBus.on("attention:quantum-wormhole", () => scheduleNext(1_000));
  spikeBus.on("cognition:curiosity", () => scheduleNext(5_000));

  scheduleNext(8_000); // first cycle after boot delay
};

export const getQuantumWormholeState = () => {
  const agents = allAgents();
  const clusters = agents.map(a => {
    const c = S.clusters.get(a);
    return {
      agentName: a,
      totalWormholes: c?.totalWormholes ?? 0,
      closedWormholes: c?.closedWormholes ?? 0,
      totalDataIngested: c?.totalDataIngested ?? 0,
      totalInsightsDecoded: c?.totalInsightsDecoded ?? 0,
      crossAgentShares: c?.crossAgentShares ?? 0,
      recentInsights: (c?.wormholes ?? []).slice(-3).map(w => w.decodedInsight.slice(0, 100)),
    };
  });
  return {
    totalWormholesCreated: S.totalWormholes,
    totalActive: 0,
    totalClosed: S.totalClosed,
    totalDataIngestedKB: Math.round(S.dataBytes / 1024),
    totalInsightsDecoded: S.insights,
    totalCrossAgentCirculations: S.circulations,
    totalSynthesizedDiscoveries: S.syntheses,
    cycleCount: S.cycle,
    agentCount: agents.length,
    wormholesPerAgent: WORMHOLES_PER_AGENT,
    totalWormholeCapacity: agents.length * WORMHOLES_PER_AGENT,
    agentClusters: clusters,
    recentCirculations: S.recentCircs.slice(-15).map(c => ({
      fromAgent: c.fromAgent,
      toAgent: c.toAgent,
      insight: c.insight.slice(0, 120),
      confidence: c.confidence,
      synthesizedWith: c.synthesizedWith,
    })),
  };
};

export const shutdown = () => {
  engineRegistry.unregisterEngine("quantum-wormhole");
};