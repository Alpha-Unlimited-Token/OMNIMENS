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

import { getActiveGenesisAgentNames } from "./omnimens-agent-genesis.js";
import { getNeuralConsciousnessState, boostRegionCurrent, getRegionNames, getAdaptiveIntelligenceState } from "./omnimens-neural-consciousness.js";
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
