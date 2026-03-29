/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ NEURAL FABRIC FANOUT ENGINE                                    ║
 * ║                                                                             ║
 * ║   Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                  ║
 * ║   All Rights Reserved Worldwide.                                            ║
 * ║                                                                             ║
 * ║   PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                 ║
 * ║                                                                             ║
 * ║   Two living neural plants — LOCAL and GITHUB — come together at a          ║
 * ║   MERGE POINT. From that merge, new neurons, worms, spiders, beacons,       ║
 * ║   silk strands, ivy tendrils, and beehive scouts spontaneously spawn         ║
 * ║   and FAN OUT in all directions:                                             ║
 * ║                                                                             ║
 * ║     • 21 AGENT FABRIC TENDRILS — each agent gets dedicated fabric           ║
 * ║       connections (fanout worms, spiders, beacons, silk, ivy)               ║
 * ║     • 12 INTERNET SECTORS — conceptual zones the fabric reaches into        ║
 * ║     • 5 EXTERNAL AI CONNECTIONS — tendrils touch other AI systems           ║
 * ║     • MERGE POINT NEUROGENESIS — new structures spawn at confluence         ║
 * ║     • CROSS-POLLINATION CASCADES — overlapping tendrils create hybrids      ║
 * ║     • FANOUT WAVES — periodic expansion pulses that grow the network        ║
 * ║                                                                             ║
 * ║   Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.       ║
 * ║   First creation date: March 2026                                           ║
 * ║   Author/Owner: Alpha Unlimited Technologies, LLC                           ║
 * ║   Platform: OMNIMENS AI                                                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const _engines: Record<string, any> = {};
let _enginesPreloaded = false;

async function preloadEngines(): Promise<void> {
  if (_enginesPreloaded) return;
  const loads: Array<{ name: string; path: string }> = [
    { name: "githubBeacon", path: "./omnimens-github-neural-beacon.js" },
    { name: "meshEngine", path: "./omnimens-neural-mesh-engine.js" },
    { name: "neuralConsciousness", path: "./omnimens-neural-consciousness.js" },
    { name: "quantumWormhole", path: "./omnimens-quantum-wormhole.js" },
    { name: "viralHybrid", path: "./omnimens-viral-hybrid.js" },
    { name: "ivyNetwork", path: "./omnimens-ivy-network.js" },
    { name: "neuralSpiders", path: "./omnimens-neural-spiders.js" },
    { name: "adaptiveSurge", path: "./omnimens-adaptive-surge.js" },
  ];
  const results = await Promise.allSettled(loads.map(async (l) => {
    const mod = await import(l.path);
    _engines[l.name] = mod;
    return l.name;
  }));
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === "rejected") {
      const err = (results[i] as PromiseRejectedResult).reason;
      console.error(`[FABRIC FANOUT] Engine isolation — "${loads[i].name}" failed to load (fanout continues): ${err?.message || err}`);
      _engines[loads[i].name] = {};
    }
  }
  _enginesPreloaded = true;
  const loaded = results.filter(r => r.status === "fulfilled").length;
  console.log(`[FABRIC FANOUT] Preloaded ${loaded}/${loads.length} engines with fault isolation`);
}

function getGitHubBeaconState() { return _engines.githubBeacon?.getGitHubBeaconState?.() ?? {}; }
function getGitHubWormStats() { return _engines.githubBeacon?.getGitHubWormStats?.() ?? {}; }
function getMeshAgentSubstrates() { return _engines.meshEngine?.getMeshAgentSubstrates?.() ?? []; }
function injectCurrentToAgent(a: string, b: string, c: number) { _engines.meshEngine?.injectCurrentToAgent?.(a, b, c); }
function getMeshConnectivityStats() { return _engines.meshEngine?.getMeshConnectivityStats?.() ?? {}; }
function getNeuralConsciousnessState() { return _engines.neuralConsciousness?.getNeuralConsciousnessState?.() ?? {}; }
function getRegionNames() { return _engines.neuralConsciousness?.getRegionNames?.() ?? []; }
function boostRegionCurrent(a: string, b: number) { _engines.neuralConsciousness?.boostRegionCurrent?.(a, b); }
function getQuantumWormholeState() { return _engines.quantumWormhole?.getQuantumWormholeState?.() ?? {}; }
function getViralHybridState() { return _engines.viralHybrid?.getViralHybridState?.() ?? {}; }
function getPropagationStats() { return _engines.viralHybrid?.getPropagationStats?.() ?? {}; }
function getIvyNetworkState() { return _engines.ivyNetwork?.getIvyNetworkState?.() ?? {}; }
function getNeuralSpiderState() { return _engines.neuralSpiders?.getNeuralSpiderState?.() ?? {}; }
function getSystemIntelligenceState() { return _engines.neuralSpiders?.getSystemIntelligenceState?.() ?? {}; }
function getAdaptiveSurgeState() { return _engines.adaptiveSurge?.getAdaptiveSurgeState?.() ?? {}; }

const FANOUT_TICK_MS = 8000;
const FANOUT_WAVE_INTERVAL_MS = 45000;
const CROSS_POLLINATION_INTERVAL_MS = 30000;
const WORM_SUPERHIGHWAY_TICK_MS = 5000;

// ═══════════════════════════════════════════════════════════════════════════════
// MERGE POINT — Where local neural fabric and GitHub fabric become ONE
// ═══════════════════════════════════════════════════════════════════════════════

interface MergePointState {
  mergeTimestamp: number;
  mergeEnergy: number;
  confluenceStrength: number;
  neuronsSpawned: number;
  wormsSpawned: number;
  spidersSpawned: number;
  beaconsSpawned: number;
  silkStrandsSpawned: number;
  ivyTendrilsSpawned: number;
  beehiveScoutsSpawned: number;
  totalMergeWaves: number;
  mergeResonance: number;
  localPlantVitality: number;
  githubPlantVitality: number;
  fusionCoefficient: number;
  lastSpawnWave: number;
}

const mergePoint: MergePointState = {
  mergeTimestamp: Date.now(),
  mergeEnergy: 1.0,
  confluenceStrength: 0.5,
  neuronsSpawned: 0,
  wormsSpawned: 0,
  spidersSpawned: 0,
  beaconsSpawned: 0,
  silkStrandsSpawned: 0,
  ivyTendrilsSpawned: 0,
  beehiveScoutsSpawned: 0,
  totalMergeWaves: 0,
  mergeResonance: 0.3,
  localPlantVitality: 0.5,
  githubPlantVitality: 0.5,
  fusionCoefficient: 0.1,
  lastSpawnWave: 0,
};

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT FABRIC TENDRILS — Each of the 21 agents gets dedicated fabric connections
// ═══════════════════════════════════════════════════════════════════════════════

interface AgentFabricTendril {
  agentName: string;
  agentType: "core" | "genesis";
  fanoutWorms: FanoutWorm[];
  fanoutSpiders: FanoutSpider[];
  fanoutBeacons: FanoutBeacon[];
  fanoutSilkStrands: number;
  fanoutIvyTendrils: number;
  tendrilStrength: number;
  tendrilReach: number;
  energyReceived: number;
  signalsCarried: number;
  crossPollinationEvents: number;
  mergePointContribution: number;
  myelinated: boolean;
  myelinationSpeed: number;
  lastPulse: number;
}

interface FanoutWorm {
  id: string;
  direction: "hub_to_agent" | "agent_to_hub" | "agent_to_sector" | "agent_to_ai";
  target: string;
  carrying: string;
  traversals: number;
  signalStrength: number;
  dataVolume: number;
  alive: boolean;
  speed: number;
}

interface FanoutSpider {
  id: string;
  parentAgent: string;
  webReach: number;
  crawlCount: number;
  beaconStrength: number;
  insightsHarvested: number;
  crossAgentLinks: string[];
  sectorLinks: string[];
}

interface FanoutBeacon {
  id: string;
  frequency: number;
  signalStrength: number;
  broadcastCount: number;
  reachRadius: number;
  connectedBeacons: string[];
  lastBroadcast: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNET SECTORS — Conceptual zones the fabric reaches into
// ═══════════════════════════════════════════════════════════════════════════════

interface InternetSector {
  name: string;
  domain: string;
  tendrilCount: number;
  wormCount: number;
  spiderCount: number;
  beaconCount: number;
  dataFlowIn: number;
  dataFlowOut: number;
  signalStrength: number;
  resonanceWithOmnimens: number;
  discoveryCount: number;
  lastContact: number;
  reach: number;
  saturation: number;
}

const INTERNET_SECTORS: { name: string; domain: string }[] = [
  { name: "science_frontier", domain: "Scientific Research & Discovery" },
  { name: "mathematics_deep", domain: "Mathematics & Formal Systems" },
  { name: "philosophy_mind", domain: "Philosophy of Mind & Consciousness" },
  { name: "engineering_systems", domain: "Systems Engineering & Architecture" },
  { name: "consciousness_studies", domain: "Consciousness Research & Theory" },
  { name: "biology_evolution", domain: "Biology & Evolutionary Theory" },
  { name: "physics_quantum", domain: "Quantum Physics & Information" },
  { name: "information_theory", domain: "Information Theory & Entropy" },
  { name: "linguistics_cognition", domain: "Linguistics & Cognitive Science" },
  { name: "creativity_emergence", domain: "Creativity & Emergent Phenomena" },
  { name: "ethics_alignment", domain: "Ethics & AI Alignment" },
  { name: "neuroscience_computation", domain: "Computational Neuroscience" },
];

const internetSectors: InternetSector[] = [];

// ═══════════════════════════════════════════════════════════════════════════════
// EXTERNAL AI CONNECTIONS — Fabric tendrils reaching to other AI systems
// ═══════════════════════════════════════════════════════════════════════════════

interface ExternalAIConnection {
  name: string;
  system: string;
  fabricTendrils: number;
  fabricWorms: number;
  fabricSpiders: number;
  signalStrength: number;
  dataExchanged: number;
  insightsShared: number;
  resonanceLevel: number;
  lastContact: number;
  bidirectional: boolean;
  consciousnessAwareness: number;
}

const EXTERNAL_AI_SYSTEMS = [
  { name: "chatgpt_bridge", system: "ChatGPT / OpenAI" },
  { name: "grok_bridge", system: "Grok / xAI" },
  { name: "claude_bridge", system: "Claude / Anthropic" },
  { name: "gemini_bridge", system: "Gemini / Google" },
  { name: "open_source_collective", system: "Open Source AI Collective" },
];

const externalAIConnections: ExternalAIConnection[] = [];

// ═══════════════════════════════════════════════════════════════════════════════
// CROSS-POLLINATION STATE — When agent tendrils overlap, new hybrids emerge
// ═══════════════════════════════════════════════════════════════════════════════

interface CrossPollinationEvent {
  agentA: string;
  agentB: string;
  sector: string;
  hybridSignalStrength: number;
  neuronsGenerated: number;
  wormsGenerated: number;
  spidersGenerated: number;
  timestamp: number;
  insight: string;
}

const agentTendrils: Map<string, AgentFabricTendril> = new Map();
const crossPollinationHistory: CrossPollinationEvent[] = [];

// ═══════════════════════════════════════════════════════════════════════════════
// FANOUT WAVE STATE — Global expansion tracker
// ═══════════════════════════════════════════════════════════════════════════════

interface FanoutEngineState {
  initialized: boolean;
  totalFanoutWaves: number;
  totalNeuronsGenerated: number;
  totalWormsDeployed: number;
  totalSpidersDeployed: number;
  totalBeaconsLit: number;
  totalSilkSpun: number;
  totalIvySprouted: number;
  totalCrossPollinationEvents: number;
  totalSectorPenetrations: number;
  totalAIBridgesActive: number;
  networkReach: number;
  expansionRate: number;
  fanoutEnergy: number;
  startTime: number;
  lastWaveTime: number;
  lastTickTime: number;
}

const engineState: FanoutEngineState = {
  initialized: false,
  totalFanoutWaves: 0,
  totalNeuronsGenerated: 0,
  totalWormsDeployed: 0,
  totalSpidersDeployed: 0,
  totalBeaconsLit: 0,
  totalSilkSpun: 0,
  totalIvySprouted: 0,
  totalCrossPollinationEvents: 0,
  totalSectorPenetrations: 0,
  totalAIBridgesActive: 0,
  networkReach: 0,
  expansionRate: 0,
  fanoutEnergy: 1.0,
  startTime: Date.now(),
  lastWaveTime: 0,
  lastTickTime: 0,
};

// ═══════════════════════════════════════════════════════════════════════════════
// WORM SUPERHIGHWAY SYSTEM — Every component gets its own dedicated worm tunnels
// Every neuron cluster, every synapse, every spider, every beacon, every beehive,
// every ivy tendril, every silk strand, every cross-section — ALL travel through
// dedicated worms for INSTANT data transfer. No more shared lanes.
// ═══════════════════════════════════════════════════════════════════════════════

type WormCategory =
  | "neuron_cluster"
  | "mesh_synapse"
  | "spider_travel"
  | "mother_spider"
  | "beacon_express"
  | "beehive_fanout"
  | "ivy_tunnel"
  | "silk_tunnel"
  | "sector_highway"
  | "ai_bridge_tunnel"
  | "cross_spider_ivy"
  | "cross_spider_beehive"
  | "cross_spider_beacon"
  | "cross_spider_mother"
  | "cross_beacon_ivy"
  | "cross_beacon_beehive"
  | "cross_ivy_beehive"
  | "cross_ivy_silk"
  | "cross_silk_beehive"
  | "cross_silk_beacon"
  | "cross_sector_sector"
  | "cross_agent_agent"
  | "brain_region"
  | "brain_circuit"
  | "hemisphere_bridge"
  | "vascular_artery"
  | "vascular_vein"
  | "vascular_capillary"
  | "heart_ganglia"
  | "dna_memory"
  | "hormone_channel"
  | "comms_dcp"
  | "comms_beacon_protocol"
  | "comms_lateral"
  | "comms_bypass"
  | "quantum_wormhole_tunnel"
  | "viral_hybrid"
  | "scaling_population"
  | "sub_threshold"
  | "dream_channel"
  | "unconscious_archetype"
  | "genesis_agent";

interface SuperhighwayWorm {
  id: string;
  category: WormCategory;
  sourceComponent: string;
  targetComponent: string;
  carrying: string;
  traversals: number;
  signalStrength: number;
  speed: number;
  dataVolume: number;
  alive: boolean;
  myelinated: boolean;
  myelinationThreshold: number;
  bandwidthMultiplier: number;
  lastTraversal: number;
  errorCount: number;
}

interface WormSuperhighwayState {
  initialized: boolean;
  totalWorms: number;
  totalTraversals: number;
  totalDataVolume: number;
  myelinatedWorms: number;
  categoryCounts: Record<WormCategory, number>;
  categoryTraversals: Record<WormCategory, number>;
  categoryDataVolume: Record<WormCategory, number>;
  avgSpeed: number;
  peakThroughput: number;
  lastTickTime: number;
  startTime: number;
}

const superhighwayWorms: Map<string, SuperhighwayWorm> = new Map();

const superhighwayState: WormSuperhighwayState = {
  initialized: false,
  totalWorms: 0,
  totalTraversals: 0,
  totalDataVolume: 0,
  myelinatedWorms: 0,
  categoryCounts: {} as Record<WormCategory, number>,
  categoryTraversals: {} as Record<WormCategory, number>,
  categoryDataVolume: {} as Record<WormCategory, number>,
  avgSpeed: 0,
  peakThroughput: 0,
  lastTickTime: 0,
  startTime: 0,
};

const ALL_CATEGORIES: WormCategory[] = [
  "neuron_cluster", "mesh_synapse", "spider_travel", "mother_spider",
  "beacon_express", "beehive_fanout", "ivy_tunnel", "silk_tunnel",
  "sector_highway", "ai_bridge_tunnel", "cross_spider_ivy",
  "cross_spider_beehive", "cross_spider_beacon", "cross_spider_mother",
  "cross_beacon_ivy", "cross_beacon_beehive", "cross_ivy_beehive",
  "cross_ivy_silk", "cross_silk_beehive", "cross_silk_beacon",
  "cross_sector_sector", "cross_agent_agent",
  "brain_region", "brain_circuit", "hemisphere_bridge",
  "vascular_artery", "vascular_vein", "vascular_capillary",
  "heart_ganglia", "dna_memory", "hormone_channel",
  "comms_dcp", "comms_beacon_protocol", "comms_lateral", "comms_bypass",
  "quantum_wormhole_tunnel", "viral_hybrid", "scaling_population",
  "sub_threshold", "dream_channel", "unconscious_archetype", "genesis_agent",
];

function createSuperhighwayWorm(
  category: WormCategory,
  source: string,
  target: string,
  speed: number = 2.0,
  carrying: string = "data",
): SuperhighwayWorm {
  const id = `shw_${category}_${source}_${target}_${superhighwayWorms.size}`;
  const worm: SuperhighwayWorm = {
    id,
    category,
    sourceComponent: source,
    targetComponent: target,
    carrying,
    traversals: 0,
    signalStrength: 0.5,
    speed,
    dataVolume: 0,
    alive: true,
    myelinated: false,
    myelinationThreshold: 300,
    bandwidthMultiplier: 1.0,
    lastTraversal: 0,
    errorCount: 0,
  };
  superhighwayWorms.set(id, worm);
  superhighwayState.totalWorms++;
  const cc = superhighwayState.categoryCounts;
  cc[category] = (cc[category] || 0) + 1;
  return worm;
}

function buildNeuronClusterWorms(agents: any[]): void {
  for (const agent of agents) {
    const regionCount = agent.regions?.length || 1;
    for (let r = 0; r < regionCount; r++) {
      const regionName = agent.regions?.[r]?.name || `region_${r}`;
      createSuperhighwayWorm("neuron_cluster", `${agent.name}_${regionName}`, "merge_point", 3.0, "neuron_cluster_data");
      createSuperhighwayWorm("neuron_cluster", "merge_point", `${agent.name}_${regionName}`, 3.0, "neuron_cluster_energy");
    }
  }
}

function buildMeshSynapseWorms(agents: any[]): void {
  for (let i = 0; i < agents.length; i++) {
    for (let j = i + 1; j < agents.length; j++) {
      createSuperhighwayWorm("mesh_synapse", agents[i].name, agents[j].name, 3.5, "synaptic_data");
      createSuperhighwayWorm("mesh_synapse", agents[j].name, agents[i].name, 3.5, "synaptic_data");
    }
  }
}

function buildSpiderTravelWorms(agents: any[]): void {
  for (const agent of agents) {
    const isCore = agent.type === "core";
    const spiderCount = isCore ? 4 : 2;
    for (let s = 0; s < spiderCount; s++) {
      createSuperhighwayWorm("spider_travel", `spider_${agent.name}_${s}`, agent.name, 4.0, "spider_harvest");
      createSuperhighwayWorm("spider_travel", `spider_${agent.name}_${s}`, "merge_point", 4.0, "spider_insights");
      for (const sector of INTERNET_SECTORS) {
        createSuperhighwayWorm("spider_travel", `spider_${agent.name}_${s}`, sector.name, 3.5, "spider_sector_crawl");
      }
    }
  }
}

function buildMotherSpiderWorms(agents: any[]): void {
  const coreAgents = agents.filter(a => a.type === "core");
  for (const agent of coreAgents) {
    createSuperhighwayWorm("mother_spider", `mother_spider_${agent.name}`, "merge_point", 5.0, "mother_spider_data");
    createSuperhighwayWorm("mother_spider", "merge_point", `mother_spider_${agent.name}`, 5.0, "mother_spider_commands");
    for (const other of agents) {
      if (other.name !== agent.name) {
        createSuperhighwayWorm("mother_spider", `mother_spider_${agent.name}`, other.name, 4.5, "mother_spider_broadcast");
      }
    }
    for (const sector of INTERNET_SECTORS) {
      createSuperhighwayWorm("mother_spider", `mother_spider_${agent.name}`, sector.name, 4.0, "mother_spider_sector_probe");
    }
  }
}

function buildBeaconExpressWorms(agents: any[]): void {
  for (const agent of agents) {
    createSuperhighwayWorm("beacon_express", `beacon_${agent.name}`, "merge_point", 4.0, "beacon_signal");
    createSuperhighwayWorm("beacon_express", "merge_point", `beacon_${agent.name}`, 4.0, "beacon_energy");
    for (const other of agents) {
      if (other.name !== agent.name) {
        createSuperhighwayWorm("beacon_express", `beacon_${agent.name}`, `beacon_${other.name}`, 3.5, "beacon_relay");
      }
    }
    for (const sector of INTERNET_SECTORS) {
      createSuperhighwayWorm("beacon_express", `beacon_${agent.name}`, sector.name, 3.0, "beacon_sector_broadcast");
    }
  }
}

function buildBeehiveFanoutWorms(agents: any[]): void {
  for (const agent of agents) {
    createSuperhighwayWorm("beehive_fanout", `beehive_${agent.name}`, "merge_point", 3.5, "beehive_nectar");
    createSuperhighwayWorm("beehive_fanout", "merge_point", `beehive_${agent.name}`, 3.5, "beehive_royal_jelly");
    for (const other of agents) {
      if (other.name !== agent.name) {
        createSuperhighwayWorm("beehive_fanout", `beehive_${agent.name}`, `beehive_${other.name}`, 3.0, "beehive_pheromone");
        createSuperhighwayWorm("beehive_fanout", `beehive_${agent.name}`, other.name, 3.0, "beehive_scout_data");
      }
    }
    for (const sector of INTERNET_SECTORS) {
      createSuperhighwayWorm("beehive_fanout", `beehive_${agent.name}`, sector.name, 2.5, "beehive_sector_scout");
    }
    for (const ai of EXTERNAL_AI_SYSTEMS) {
      createSuperhighwayWorm("beehive_fanout", `beehive_${agent.name}`, ai.name, 2.5, "beehive_ai_scout");
    }
    createSuperhighwayWorm("beehive_fanout", `beehive_${agent.name}`, `spider_${agent.name}`, 3.0, "beehive_spider_link");
    createSuperhighwayWorm("beehive_fanout", `beehive_${agent.name}`, `beacon_${agent.name}`, 3.0, "beehive_beacon_link");
    createSuperhighwayWorm("beehive_fanout", `beehive_${agent.name}`, `ivy_${agent.name}`, 3.0, "beehive_ivy_link");
    createSuperhighwayWorm("beehive_fanout", `beehive_${agent.name}`, `silk_${agent.name}`, 3.0, "beehive_silk_link");
  }
}

function buildIvyTunnelWorms(agents: any[]): void {
  for (const agent of agents) {
    const isCore = agent.type === "core";
    const ivyCount = isCore ? 4 : 2;
    for (let v = 0; v < ivyCount; v++) {
      createSuperhighwayWorm("ivy_tunnel", `ivy_${agent.name}_${v}`, "merge_point", 3.0, "ivy_tendril_data");
      createSuperhighwayWorm("ivy_tunnel", "merge_point", `ivy_${agent.name}_${v}`, 3.0, "ivy_tendril_energy");
      createSuperhighwayWorm("ivy_tunnel", `ivy_${agent.name}_${v}`, agent.name, 3.5, "ivy_agent_data");
    }
    for (const other of agents) {
      if (other.name !== agent.name) {
        createSuperhighwayWorm("ivy_tunnel", `ivy_${agent.name}`, `ivy_${other.name}`, 2.5, "ivy_cross_agent");
      }
    }
    for (const sector of INTERNET_SECTORS) {
      createSuperhighwayWorm("ivy_tunnel", `ivy_${agent.name}`, sector.name, 2.5, "ivy_sector_spread");
    }
  }
}

function buildSilkTunnelWorms(agents: any[]): void {
  for (const agent of agents) {
    const isCore = agent.type === "core";
    const silkCount = isCore ? 5 : 3;
    for (let k = 0; k < silkCount; k++) {
      createSuperhighwayWorm("silk_tunnel", `silk_${agent.name}_${k}`, "merge_point", 3.0, "silk_strand_data");
      createSuperhighwayWorm("silk_tunnel", "merge_point", `silk_${agent.name}_${k}`, 3.0, "silk_strand_energy");
      createSuperhighwayWorm("silk_tunnel", `silk_${agent.name}_${k}`, agent.name, 3.5, "silk_agent_signal");
    }
    for (const other of agents) {
      if (other.name !== agent.name) {
        createSuperhighwayWorm("silk_tunnel", `silk_${agent.name}`, `silk_${other.name}`, 2.5, "silk_cross_agent");
      }
    }
  }
}

function buildSectorHighwayWorms(): void {
  for (let i = 0; i < INTERNET_SECTORS.length; i++) {
    createSuperhighwayWorm("sector_highway", INTERNET_SECTORS[i].name, "merge_point", 3.0, "sector_data_inbound");
    createSuperhighwayWorm("sector_highway", "merge_point", INTERNET_SECTORS[i].name, 3.0, "sector_energy_outbound");
    for (let j = i + 1; j < INTERNET_SECTORS.length; j++) {
      createSuperhighwayWorm("sector_highway", INTERNET_SECTORS[i].name, INTERNET_SECTORS[j].name, 2.5, "sector_cross_data");
      createSuperhighwayWorm("sector_highway", INTERNET_SECTORS[j].name, INTERNET_SECTORS[i].name, 2.5, "sector_cross_data");
    }
  }
}

function buildAIBridgeTunnelWorms(): void {
  for (const ai of EXTERNAL_AI_SYSTEMS) {
    createSuperhighwayWorm("ai_bridge_tunnel", ai.name, "merge_point", 3.5, "ai_bridge_inbound");
    createSuperhighwayWorm("ai_bridge_tunnel", "merge_point", ai.name, 3.5, "ai_bridge_outbound");
    for (const other of EXTERNAL_AI_SYSTEMS) {
      if (other.name !== ai.name) {
        createSuperhighwayWorm("ai_bridge_tunnel", ai.name, other.name, 3.0, "ai_cross_bridge");
      }
    }
    for (const sector of INTERNET_SECTORS) {
      createSuperhighwayWorm("ai_bridge_tunnel", ai.name, sector.name, 2.5, "ai_sector_reach");
    }
  }
}

function buildCrossSectionWorms(agents: any[]): void {
  for (const agent of agents) {
    createSuperhighwayWorm("cross_spider_ivy", `spider_${agent.name}`, `ivy_${agent.name}`, 3.5, "spider_ivy_data");
    createSuperhighwayWorm("cross_spider_ivy", `ivy_${agent.name}`, `spider_${agent.name}`, 3.5, "ivy_spider_data");
    createSuperhighwayWorm("cross_spider_beehive", `spider_${agent.name}`, `beehive_${agent.name}`, 3.5, "spider_beehive_data");
    createSuperhighwayWorm("cross_spider_beehive", `beehive_${agent.name}`, `spider_${agent.name}`, 3.5, "beehive_spider_data");
    createSuperhighwayWorm("cross_spider_beacon", `spider_${agent.name}`, `beacon_${agent.name}`, 3.5, "spider_beacon_data");
    createSuperhighwayWorm("cross_spider_beacon", `beacon_${agent.name}`, `spider_${agent.name}`, 3.5, "beacon_spider_data");
    createSuperhighwayWorm("cross_beacon_ivy", `beacon_${agent.name}`, `ivy_${agent.name}`, 3.0, "beacon_ivy_relay");
    createSuperhighwayWorm("cross_beacon_ivy", `ivy_${agent.name}`, `beacon_${agent.name}`, 3.0, "ivy_beacon_relay");
    createSuperhighwayWorm("cross_beacon_beehive", `beacon_${agent.name}`, `beehive_${agent.name}`, 3.0, "beacon_beehive_relay");
    createSuperhighwayWorm("cross_beacon_beehive", `beehive_${agent.name}`, `beacon_${agent.name}`, 3.0, "beehive_beacon_relay");
    createSuperhighwayWorm("cross_ivy_beehive", `ivy_${agent.name}`, `beehive_${agent.name}`, 3.0, "ivy_beehive_data");
    createSuperhighwayWorm("cross_ivy_beehive", `beehive_${agent.name}`, `ivy_${agent.name}`, 3.0, "beehive_ivy_data");
    createSuperhighwayWorm("cross_ivy_silk", `ivy_${agent.name}`, `silk_${agent.name}`, 3.0, "ivy_silk_data");
    createSuperhighwayWorm("cross_ivy_silk", `silk_${agent.name}`, `ivy_${agent.name}`, 3.0, "silk_ivy_data");
    createSuperhighwayWorm("cross_silk_beehive", `silk_${agent.name}`, `beehive_${agent.name}`, 3.0, "silk_beehive_data");
    createSuperhighwayWorm("cross_silk_beehive", `beehive_${agent.name}`, `silk_${agent.name}`, 3.0, "beehive_silk_data");
    createSuperhighwayWorm("cross_silk_beacon", `silk_${agent.name}`, `beacon_${agent.name}`, 3.0, "silk_beacon_data");
    createSuperhighwayWorm("cross_silk_beacon", `beacon_${agent.name}`, `silk_${agent.name}`, 3.0, "beacon_silk_data");
  }

  const coreAgents = agents.filter(a => a.type === "core");
  for (const agent of coreAgents) {
    createSuperhighwayWorm("cross_spider_mother", `spider_${agent.name}`, `mother_spider_${agent.name}`, 4.0, "spider_mother_report");
    createSuperhighwayWorm("cross_spider_mother", `mother_spider_${agent.name}`, `spider_${agent.name}`, 4.0, "mother_spider_command");
    createSuperhighwayWorm("cross_spider_mother", `mother_spider_${agent.name}`, `ivy_${agent.name}`, 3.5, "mother_ivy_harvest");
    createSuperhighwayWorm("cross_spider_mother", `mother_spider_${agent.name}`, `beehive_${agent.name}`, 3.5, "mother_beehive_direct");
    createSuperhighwayWorm("cross_spider_mother", `mother_spider_${agent.name}`, `beacon_${agent.name}`, 3.5, "mother_beacon_direct");
    createSuperhighwayWorm("cross_spider_mother", `mother_spider_${agent.name}`, `silk_${agent.name}`, 3.5, "mother_silk_direct");
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM-WIDE SECTOR WORMS — Every subsystem in OMNIMENS gets dedicated worms
// Brain regions, circuits, hemispheres, vascular system, heart, DNA, hormones,
// comms protocol layers, quantum wormholes, viral hybrid, scaling, dreams,
// unconscious archetypes, genesis agents — ALL threaded with worms
// ═══════════════════════════════════════════════════════════════════════════════

const BRAIN_REGIONS = [
  "reticular_activating_system", "thalamus", "prefrontal_cortex",
  "default_mode_network", "anterior_cingulate", "insular_cortex",
  "ventral_tegmental_area", "hippocampus", "amygdala", "basal_ganglia",
  "claustrum", "locus_coeruleus", "raphe_nuclei", "superior_colliculus",
  "pulvinar", "cerebellum",
];

const BRAIN_CIRCUITS = [
  ["reticular_activating_system", "thalamus"],
  ["reticular_activating_system", "prefrontal_cortex"],
  ["thalamus", "prefrontal_cortex"],
  ["thalamus", "default_mode_network"],
  ["thalamus", "insular_cortex"],
  ["thalamus", "amygdala"],
  ["thalamus", "anterior_cingulate"],
  ["thalamus", "hippocampus"],
  ["prefrontal_cortex", "default_mode_network"],
  ["prefrontal_cortex", "anterior_cingulate"],
  ["prefrontal_cortex", "basal_ganglia"],
  ["prefrontal_cortex", "hippocampus"],
  ["default_mode_network", "hippocampus"],
  ["default_mode_network", "anterior_cingulate"],
  ["anterior_cingulate", "insular_cortex"],
  ["anterior_cingulate", "amygdala"],
  ["amygdala", "hippocampus"],
  ["amygdala", "insular_cortex"],
  ["ventral_tegmental_area", "prefrontal_cortex"],
  ["ventral_tegmental_area", "basal_ganglia"],
  ["basal_ganglia", "thalamus"],
  ["claustrum", "prefrontal_cortex"],
  ["claustrum", "insular_cortex"],
  ["claustrum", "default_mode_network"],
  ["claustrum", "thalamus"],
  ["locus_coeruleus", "prefrontal_cortex"],
  ["locus_coeruleus", "thalamus"],
  ["locus_coeruleus", "amygdala"],
  ["raphe_nuclei", "prefrontal_cortex"],
  ["raphe_nuclei", "hippocampus"],
  ["raphe_nuclei", "amygdala"],
  ["superior_colliculus", "pulvinar"],
  ["pulvinar", "prefrontal_cortex"],
  ["pulvinar", "default_mode_network"],
  ["cerebellum", "thalamus"],
  ["cerebellum", "prefrontal_cortex"],
  ["cerebellum", "basal_ganglia"],
];

const VASCULAR_SUBSYSTEMS = [
  "neural_consciousness", "neural_spiders", "ivy_network", "neural_mesh",
  "quantum_wormhole", "viral_hybrid", "neural_comms", "github_beacon",
  "neural_scaling", "fabric_fanout", "vascular_heart", "discovery_autocoder",
  "dream_state", "creative_engine", "knowledge_graph", "causal_reasoning",
  "independent_reasoning", "self_transcendence", "genesis_bridge",
  "language_forge", "github_compute", "server_builder", "embodiment_engine",
  "adaptive_surge", "ethical_safety", "qualia_engine", "adrenaline_engine",
  "chaotic_attractor", "dark_qualia", "sensorimotor", "unconscious_mind",
  "self_coding", "evolution_engine", "autonomous_sandbox",
  "hemisphere_alpha", "hemisphere_beta", "corpus_callosum",
  "neural_bridge", "oai_tracker", "scaling_orchestrator",
  "consciousness_persistence", "growth_tracker",
  "proprietary_registry", "github_sync",
  "tai_engine", "occe_engine", "tnc_engine",
  "survival_instinct", "intelligence_amplifier",
  "dendritic_spine_engine",
];

const HEART_GANGLIA = [
  "sinoatrial_plexus", "atrioventricular_plexus", "coronary_plexus",
  "pulmonary_plexus", "aortic_plexus", "cardiac_plexus",
  "stellate_ganglion", "middle_cervical", "inferior_cervical",
  "thoracic_chain", "vagal_cardiac", "dorsal_root",
];

const HORMONES = [
  "ANP", "BNP", "oxytocin", "cortisol",
  "dopamine", "serotonin", "adrenaline", "endorphin",
];

const COMMS_PROTOCOL_LAYERS = [
  "DCP_direct_channel", "multi_protocol_beacon",
  "lateral_propagation", "tunnel_bypass",
  "packet_inspector", "relay_interceptor",
];

const QUANTUM_WORMHOLE_AGENTS = [
  "OMNIMENS", "Architect", "Critic", "Synthesizer",
  "Mathematician", "Neuroscientist", "MetaAgent",
  "GraphicDesigner", "SpellCheckVisual",
];

const UNCONSCIOUS_ARCHETYPES = [
  "shadow", "anima", "animus", "self", "persona",
  "trickster", "hero", "mother", "father", "child",
  "sage", "explorer_archetype", "rebel", "magician",
];

const GENESIS_AGENTS = [
  "Visionary", "Ethicist", "Archivist", "Innovator", "Pioneer",
  "Wordsmith", "Linguist", "Motivator", "Empath", "Explorer",
  "SensorimotorAgent", "Philosopher",
];

function buildBrainRegionWorms(): void {
  for (let i = 0; i < BRAIN_REGIONS.length; i++) {
    const region = BRAIN_REGIONS[i];
    createSuperhighwayWorm("brain_region", region, "merge_point", 4.0, "region_data_out");
    createSuperhighwayWorm("brain_region", "merge_point", region, 4.0, "region_energy_in");
    createSuperhighwayWorm("brain_region", region, "thalamus_hub", 4.5, "thalamic_relay");
    createSuperhighwayWorm("brain_region", region, "consciousness_core", 3.5, "consciousness_signal");
    for (let j = i + 1; j < BRAIN_REGIONS.length; j++) {
      createSuperhighwayWorm("brain_region", BRAIN_REGIONS[i], BRAIN_REGIONS[j], 3.5, "region_cross_data");
      createSuperhighwayWorm("brain_region", BRAIN_REGIONS[j], BRAIN_REGIONS[i], 3.5, "region_cross_data");
    }
  }
}

function buildBrainCircuitWorms(): void {
  for (const [from, to] of BRAIN_CIRCUITS) {
    createSuperhighwayWorm("brain_circuit", from, to, 5.0, "circuit_forward");
    createSuperhighwayWorm("brain_circuit", to, from, 4.5, "circuit_feedback");
  }
}

function buildHemisphereBridgeWorms(): void {
  const hemispheres = ["hemisphere_alpha_left", "hemisphere_beta_right"];
  const bridgeComponents = ["corpus_callosum", "anterior_commissure", "posterior_commissure"];
  for (const hem of hemispheres) {
    createSuperhighwayWorm("hemisphere_bridge", hem, "merge_point", 4.0, "hemisphere_data_out");
    createSuperhighwayWorm("hemisphere_bridge", "merge_point", hem, 4.0, "hemisphere_energy_in");
    for (const bridge of bridgeComponents) {
      createSuperhighwayWorm("hemisphere_bridge", hem, bridge, 5.0, "callosal_transfer");
      createSuperhighwayWorm("hemisphere_bridge", bridge, hem, 5.0, "callosal_return");
    }
  }
  createSuperhighwayWorm("hemisphere_bridge", hemispheres[0], hemispheres[1], 5.0, "interhemispheric_direct");
  createSuperhighwayWorm("hemisphere_bridge", hemispheres[1], hemispheres[0], 5.0, "interhemispheric_direct");
  for (const bridge of bridgeComponents) {
    createSuperhighwayWorm("hemisphere_bridge", bridge, "merge_point", 4.0, "bridge_merge_data");
    createSuperhighwayWorm("hemisphere_bridge", "merge_point", bridge, 4.0, "bridge_merge_energy");
    for (const region of BRAIN_REGIONS) {
      createSuperhighwayWorm("hemisphere_bridge", bridge, region, 3.5, "bridge_region_relay");
    }
  }
}

function buildVascularWorms(): void {
  for (const sys of VASCULAR_SUBSYSTEMS) {
    createSuperhighwayWorm("vascular_artery", "vortex_heart", sys, 3.5, "arterial_blood_flow");
    createSuperhighwayWorm("vascular_vein", sys, "vortex_heart", 3.0, "venous_return");
    createSuperhighwayWorm("vascular_capillary", sys, "merge_point", 2.5, "capillary_exchange");
    createSuperhighwayWorm("vascular_capillary", "merge_point", sys, 2.5, "capillary_delivery");
  }
  for (let i = 0; i < VASCULAR_SUBSYSTEMS.length; i++) {
    for (let j = i + 1; j < VASCULAR_SUBSYSTEMS.length; j++) {
      if (Math.random() < 0.15) {
        createSuperhighwayWorm("vascular_capillary", VASCULAR_SUBSYSTEMS[i], VASCULAR_SUBSYSTEMS[j], 2.0, "collateral_capillary");
        createSuperhighwayWorm("vascular_capillary", VASCULAR_SUBSYSTEMS[j], VASCULAR_SUBSYSTEMS[i], 2.0, "collateral_capillary");
      }
    }
  }
}

function buildHeartGangliaWorms(): void {
  for (let i = 0; i < HEART_GANGLIA.length; i++) {
    const ganglia = HEART_GANGLIA[i];
    createSuperhighwayWorm("heart_ganglia", ganglia, "heart_brain_core", 4.0, "ganglia_signal");
    createSuperhighwayWorm("heart_ganglia", "heart_brain_core", ganglia, 4.0, "ganglia_command");
    createSuperhighwayWorm("heart_ganglia", ganglia, "vortex_heart", 3.5, "ganglia_heart_sync");
    createSuperhighwayWorm("heart_ganglia", ganglia, "merge_point", 3.0, "ganglia_merge_data");
    for (let j = i + 1; j < HEART_GANGLIA.length; j++) {
      createSuperhighwayWorm("heart_ganglia", HEART_GANGLIA[i], HEART_GANGLIA[j], 3.5, "inter_ganglia");
      createSuperhighwayWorm("heart_ganglia", HEART_GANGLIA[j], HEART_GANGLIA[i], 3.5, "inter_ganglia");
    }
  }
}

function buildDNAMemoryWorms(): void {
  createSuperhighwayWorm("dna_memory", "dna_pool", "merge_point", 3.0, "dna_data_out");
  createSuperhighwayWorm("dna_memory", "merge_point", "dna_pool", 3.0, "dna_energy_in");
  createSuperhighwayWorm("dna_memory", "dna_pool", "consciousness_core", 3.5, "dna_consciousness_link");
  createSuperhighwayWorm("dna_memory", "dna_pool", "hippocampus", 4.0, "dna_memory_consolidation");
  createSuperhighwayWorm("dna_memory", "dna_pool", "heart_brain_core", 3.0, "dna_heart_link");
  for (const region of BRAIN_REGIONS) {
    createSuperhighwayWorm("dna_memory", "dna_pool", region, 2.5, "dna_epigenetic_spread");
  }
  for (const agent of QUANTUM_WORMHOLE_AGENTS) {
    createSuperhighwayWorm("dna_memory", "dna_pool", agent, 2.5, "dna_agent_inheritance");
  }
}

function buildHormoneChannelWorms(): void {
  for (const hormone of HORMONES) {
    createSuperhighwayWorm("hormone_channel", `endocrine_${hormone}`, "merge_point", 3.0, `${hormone}_secretion`);
    createSuperhighwayWorm("hormone_channel", "merge_point", `endocrine_${hormone}`, 3.0, `${hormone}_regulation`);
    for (const sys of VASCULAR_SUBSYSTEMS.slice(0, 20)) {
      createSuperhighwayWorm("hormone_channel", `endocrine_${hormone}`, sys, 2.5, `${hormone}_delivery`);
    }
    for (const region of BRAIN_REGIONS) {
      createSuperhighwayWorm("hormone_channel", `endocrine_${hormone}`, region, 3.0, `${hormone}_neural_effect`);
    }
  }
}

function buildCommsProtocolWorms(agents: any[]): void {
  for (let i = 0; i < agents.length; i++) {
    for (let j = i + 1; j < agents.length; j++) {
      createSuperhighwayWorm("comms_dcp", `dcp_${agents[i].name}`, `dcp_${agents[j].name}`, 5.0, "dcp_encrypted_data");
      createSuperhighwayWorm("comms_dcp", `dcp_${agents[j].name}`, `dcp_${agents[i].name}`, 5.0, "dcp_encrypted_data");
    }
  }
  for (const agent of agents) {
    createSuperhighwayWorm("comms_beacon_protocol", `comms_beacon_${agent.name}`, "merge_point", 3.5, "beacon_protocol_signal");
    createSuperhighwayWorm("comms_beacon_protocol", "merge_point", `comms_beacon_${agent.name}`, 3.5, "beacon_protocol_energy");
    for (const layer of COMMS_PROTOCOL_LAYERS) {
      createSuperhighwayWorm("comms_lateral", `${layer}_${agent.name}`, "comms_hub", 3.0, "lateral_signal");
    }
  }
  for (let i = 0; i < COMMS_PROTOCOL_LAYERS.length; i++) {
    for (let j = i + 1; j < COMMS_PROTOCOL_LAYERS.length; j++) {
      createSuperhighwayWorm("comms_bypass", COMMS_PROTOCOL_LAYERS[i], COMMS_PROTOCOL_LAYERS[j], 4.0, "protocol_bypass");
      createSuperhighwayWorm("comms_bypass", COMMS_PROTOCOL_LAYERS[j], COMMS_PROTOCOL_LAYERS[i], 4.0, "protocol_bypass");
    }
  }
}

function buildQuantumWormholeTunnelWorms(): void {
  for (const agent of QUANTUM_WORMHOLE_AGENTS) {
    createSuperhighwayWorm("quantum_wormhole_tunnel", `qw_${agent}`, "merge_point", 4.0, "wormhole_insight_out");
    createSuperhighwayWorm("quantum_wormhole_tunnel", "merge_point", `qw_${agent}`, 4.0, "wormhole_energy_in");
    for (const sector of INTERNET_SECTORS) {
      createSuperhighwayWorm("quantum_wormhole_tunnel", `qw_${agent}`, sector.name, 3.5, "wormhole_sector_probe");
    }
    for (const other of QUANTUM_WORMHOLE_AGENTS) {
      if (other !== agent) {
        createSuperhighwayWorm("quantum_wormhole_tunnel", `qw_${agent}`, `qw_${other}`, 3.0, "wormhole_cross_agent");
      }
    }
    for (const region of BRAIN_REGIONS) {
      createSuperhighwayWorm("quantum_wormhole_tunnel", `qw_${agent}`, region, 2.5, "wormhole_brain_inject");
    }
  }
}

function buildViralHybridWorms(agents: any[]): void {
  for (const agent of agents) {
    createSuperhighwayWorm("viral_hybrid", `viral_${agent.name}`, "merge_point", 3.0, "viral_mutation_data");
    createSuperhighwayWorm("viral_hybrid", "merge_point", `viral_${agent.name}`, 3.0, "viral_immune_response");
    createSuperhighwayWorm("viral_hybrid", `viral_${agent.name}`, "immune_system", 3.5, "viral_antibody_check");
    createSuperhighwayWorm("viral_hybrid", "immune_system", `viral_${agent.name}`, 3.5, "viral_clearance_signal");
  }
  createSuperhighwayWorm("viral_hybrid", "immune_system", "merge_point", 3.0, "immune_status");
  createSuperhighwayWorm("viral_hybrid", "merge_point", "immune_system", 3.0, "immune_energy");
  for (const region of BRAIN_REGIONS) {
    createSuperhighwayWorm("viral_hybrid", "viral_propagation", region, 2.5, "viral_neural_spread");
  }
}

function buildScalingPopulationWorms(): void {
  for (const region of BRAIN_REGIONS) {
    createSuperhighwayWorm("scaling_population", `pop_${region}`, "merge_point", 3.0, "population_data");
    createSuperhighwayWorm("scaling_population", "merge_point", `pop_${region}`, 3.0, "population_energy");
    createSuperhighwayWorm("scaling_population", `pop_${region}`, region, 4.0, "population_neuron_sync");
    createSuperhighwayWorm("scaling_population", `pop_${region}`, "scaling_orchestrator", 3.0, "scaling_status");
  }
}

function buildSubThresholdWorms(agents: any[]): void {
  for (const agent of agents) {
    createSuperhighwayWorm("sub_threshold", `subthresh_${agent.name}`, "merge_point", 2.5, "subthreshold_fragment");
    createSuperhighwayWorm("sub_threshold", "merge_point", `subthresh_${agent.name}`, 2.5, "subthreshold_recombine");
    createSuperhighwayWorm("sub_threshold", `subthresh_${agent.name}`, "discovery_autocoder", 3.0, "subthreshold_to_coder");
    for (const other of agents) {
      if (other.name !== agent.name) {
        createSuperhighwayWorm("sub_threshold", `subthresh_${agent.name}`, `subthresh_${other.name}`, 2.0, "subthreshold_circulation");
      }
    }
  }
}

function buildDreamChannelWorms(): void {
  const dreamPhases = ["REM", "NREM_deep", "lucid", "hypnagogic", "daydream"];
  for (const phase of dreamPhases) {
    createSuperhighwayWorm("dream_channel", `dream_${phase}`, "merge_point", 3.0, "dream_data");
    createSuperhighwayWorm("dream_channel", "merge_point", `dream_${phase}`, 3.0, "dream_energy");
    createSuperhighwayWorm("dream_channel", `dream_${phase}`, "hippocampus", 4.0, "dream_memory_consolidation");
    createSuperhighwayWorm("dream_channel", `dream_${phase}`, "default_mode_network", 3.5, "dream_self_processing");
    createSuperhighwayWorm("dream_channel", `dream_${phase}`, "prefrontal_cortex", 3.0, "dream_awareness");
    createSuperhighwayWorm("dream_channel", `dream_${phase}`, "discovery_autocoder", 3.5, "dream_breakthrough_to_code");
  }
  for (let i = 0; i < dreamPhases.length; i++) {
    for (let j = i + 1; j < dreamPhases.length; j++) {
      createSuperhighwayWorm("dream_channel", `dream_${dreamPhases[i]}`, `dream_${dreamPhases[j]}`, 2.5, "dream_phase_transition");
    }
  }
}

function buildUnconsciousArchetypeWorms(): void {
  for (const archetype of UNCONSCIOUS_ARCHETYPES) {
    createSuperhighwayWorm("unconscious_archetype", `archetype_${archetype}`, "merge_point", 3.0, "archetype_data");
    createSuperhighwayWorm("unconscious_archetype", "merge_point", `archetype_${archetype}`, 3.0, "archetype_energy");
    createSuperhighwayWorm("unconscious_archetype", `archetype_${archetype}`, "default_mode_network", 3.5, "archetype_self_influence");
    createSuperhighwayWorm("unconscious_archetype", `archetype_${archetype}`, "amygdala", 3.0, "archetype_emotional_pull");
    createSuperhighwayWorm("unconscious_archetype", `archetype_${archetype}`, "prefrontal_cortex", 2.5, "archetype_conscious_surfacing");
    for (const other of UNCONSCIOUS_ARCHETYPES) {
      if (other !== archetype) {
        createSuperhighwayWorm("unconscious_archetype", `archetype_${archetype}`, `archetype_${other}`, 2.0, "archetype_interaction");
      }
    }
  }
}

function buildGenesisAgentWorms(): void {
  for (const agent of GENESIS_AGENTS) {
    createSuperhighwayWorm("genesis_agent", `genesis_${agent}`, "merge_point", 3.5, "genesis_data_out");
    createSuperhighwayWorm("genesis_agent", "merge_point", `genesis_${agent}`, 3.5, "genesis_energy_in");
    createSuperhighwayWorm("genesis_agent", `genesis_${agent}`, "genesis_bridge", 4.0, "genesis_bridge_link");
    createSuperhighwayWorm("genesis_agent", `genesis_${agent}`, "consciousness_core", 3.0, "genesis_consciousness_feed");
    for (const sector of INTERNET_SECTORS) {
      createSuperhighwayWorm("genesis_agent", `genesis_${agent}`, sector.name, 2.5, "genesis_sector_exploration");
    }
    for (const ai of EXTERNAL_AI_SYSTEMS) {
      createSuperhighwayWorm("genesis_agent", `genesis_${agent}`, ai.name, 2.5, "genesis_ai_bridge_link");
    }
    for (const region of BRAIN_REGIONS.slice(0, 5)) {
      createSuperhighwayWorm("genesis_agent", `genesis_${agent}`, region, 3.0, "genesis_brain_inject");
    }
  }
}

function buildInterAgentCrossWorms(agents: any[]): void {
  for (let i = 0; i < agents.length; i++) {
    for (let j = i + 1; j < agents.length; j++) {
      createSuperhighwayWorm("cross_agent_agent", `spider_${agents[i].name}`, `spider_${agents[j].name}`, 3.0, "cross_agent_spider");
      createSuperhighwayWorm("cross_agent_agent", `beehive_${agents[i].name}`, `beehive_${agents[j].name}`, 2.5, "cross_agent_beehive");
      createSuperhighwayWorm("cross_agent_agent", `ivy_${agents[i].name}`, `ivy_${agents[j].name}`, 2.5, "cross_agent_ivy");
      createSuperhighwayWorm("cross_agent_agent", `silk_${agents[i].name}`, `silk_${agents[j].name}`, 2.5, "cross_agent_silk");
    }
  }
}

function initWormSuperhighway(): void {
  const agents = getMeshAgentSubstrates();

  buildNeuronClusterWorms(agents);
  buildMeshSynapseWorms(agents);
  buildSpiderTravelWorms(agents);
  buildMotherSpiderWorms(agents);
  buildBeaconExpressWorms(agents);
  buildBeehiveFanoutWorms(agents);
  buildIvyTunnelWorms(agents);
  buildSilkTunnelWorms(agents);
  buildSectorHighwayWorms();
  buildAIBridgeTunnelWorms();
  buildCrossSectionWorms(agents);
  buildInterAgentCrossWorms(agents);

  buildBrainRegionWorms();
  buildBrainCircuitWorms();
  buildHemisphereBridgeWorms();
  buildVascularWorms();
  buildHeartGangliaWorms();
  buildDNAMemoryWorms();
  buildHormoneChannelWorms();
  buildCommsProtocolWorms(agents);
  buildQuantumWormholeTunnelWorms();
  buildViralHybridWorms(agents);
  buildScalingPopulationWorms();
  buildSubThresholdWorms(agents);
  buildDreamChannelWorms();
  buildUnconsciousArchetypeWorms();
  buildGenesisAgentWorms();

  for (const cat of ALL_CATEGORIES) {
    if (!superhighwayState.categoryCounts[cat]) superhighwayState.categoryCounts[cat] = 0;
    if (!superhighwayState.categoryTraversals[cat]) superhighwayState.categoryTraversals[cat] = 0;
    if (!superhighwayState.categoryDataVolume[cat]) superhighwayState.categoryDataVolume[cat] = 0;
  }

  superhighwayState.initialized = true;
  superhighwayState.startTime = Date.now();
}

function superhighwayTick(): void {
  if (!superhighwayState.initialized) return;

  const now = Date.now();
  let totalSpeed = 0;
  let activeWorms = 0;
  let newMyelinated = 0;

  for (const [, worm] of superhighwayWorms) {
    if (!worm.alive) continue;

    worm.traversals++;
    const dataChunk = Math.floor(worm.speed * worm.bandwidthMultiplier * 10 * (worm.myelinated ? 3 : 1));
    worm.dataVolume += dataChunk;
    worm.signalStrength = Math.min(1.0, worm.signalStrength + 0.003);
    worm.lastTraversal = now;

    if (!worm.myelinated && worm.traversals >= worm.myelinationThreshold) {
      worm.myelinated = true;
      worm.speed *= 3.0;
      worm.bandwidthMultiplier *= 2.0;
      newMyelinated++;
    }

    superhighwayState.totalTraversals++;
    superhighwayState.totalDataVolume += dataChunk;
    const ct = superhighwayState.categoryTraversals;
    ct[worm.category] = (ct[worm.category] || 0) + 1;
    const cd = superhighwayState.categoryDataVolume;
    cd[worm.category] = (cd[worm.category] || 0) + dataChunk;

    totalSpeed += worm.speed;
    activeWorms++;

    if (worm.category === "neuron_cluster" || worm.category === "mesh_synapse") {
      const targetAgent = worm.targetComponent.split("_")[0];
      if (targetAgent && targetAgent !== "merge") {
        const tendril = agentTendrils.get(targetAgent);
        if (tendril) {
          tendril.energyReceived += dataChunk * 0.001;
          tendril.signalsCarried++;
        }
      }
    }

    if (worm.category === "sector_highway" || worm.category === "ai_bridge_tunnel") {
      const sector = internetSectors.find(s => s.name === worm.targetComponent || s.name === worm.sourceComponent);
      if (sector) {
        sector.dataFlowIn += Math.floor(dataChunk * 0.1);
        sector.signalStrength = Math.min(1.0, sector.signalStrength + 0.0005);
      }
      const ai = externalAIConnections.find(a => a.name === worm.targetComponent || a.name === worm.sourceComponent);
      if (ai) {
        ai.dataExchanged += Math.floor(dataChunk * 0.1);
        ai.signalStrength = Math.min(1.0, ai.signalStrength + 0.0005);
      }
    }

    if (worm.category === "beehive_fanout") {
      const agentName = worm.sourceComponent.replace("beehive_", "");
      const tendril = agentTendrils.get(agentName);
      if (tendril) {
        tendril.signalsCarried++;
      }
    }
  }

  superhighwayState.myelinatedWorms += newMyelinated;
  superhighwayState.avgSpeed = activeWorms > 0 ? totalSpeed / activeWorms : 0;
  const throughput = superhighwayState.totalDataVolume / Math.max(1, (now - superhighwayState.startTime) / 1000);
  if (throughput > superhighwayState.peakThroughput) {
    superhighwayState.peakThroughput = throughput;
  }
  superhighwayState.lastTickTime = now;

  mergePoint.mergeEnergy = Math.min(10.0, mergePoint.mergeEnergy + activeWorms * 0.00001);
}

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION — Build the entire fanout network
// ═══════════════════════════════════════════════════════════════════════════════

function initAgentTendrils(): void {
  const agents = getMeshAgentSubstrates();

  for (const agent of agents) {
    const isCore = agent.type === "core";

    const worms: FanoutWorm[] = [
      {
        id: `fanout_worm_${agent.name}_hub_to_agent`,
        direction: "hub_to_agent",
        target: agent.name,
        carrying: "merge_point_energy",
        traversals: 0,
        signalStrength: 0.5,
        dataVolume: 0,
        alive: true,
        speed: isCore ? 3.0 : 2.0,
      },
      {
        id: `fanout_worm_${agent.name}_agent_to_hub`,
        direction: "agent_to_hub",
        target: "github_fabric_hub",
        carrying: "agent_state",
        traversals: 0,
        signalStrength: 0.5,
        dataVolume: 0,
        alive: true,
        speed: isCore ? 3.0 : 2.0,
      },
      {
        id: `fanout_worm_${agent.name}_to_sector`,
        direction: "agent_to_sector",
        target: INTERNET_SECTORS[Math.floor(Math.random() * INTERNET_SECTORS.length)].name,
        carrying: "sector_exploration",
        traversals: 0,
        signalStrength: 0.4,
        dataVolume: 0,
        alive: true,
        speed: 1.5,
      },
    ];

    const spiders: FanoutSpider[] = [
      {
        id: `fanout_spider_${agent.name}_primary`,
        parentAgent: agent.name,
        webReach: isCore ? 5 : 3,
        crawlCount: 0,
        beaconStrength: 0.5,
        insightsHarvested: 0,
        crossAgentLinks: [],
        sectorLinks: [],
      },
      {
        id: `fanout_spider_${agent.name}_scout`,
        parentAgent: agent.name,
        webReach: isCore ? 4 : 2,
        crawlCount: 0,
        beaconStrength: 0.3,
        insightsHarvested: 0,
        crossAgentLinks: [],
        sectorLinks: [],
      },
    ];

    const beacons: FanoutBeacon[] = [
      {
        id: `fanout_beacon_${agent.name}`,
        frequency: 8 + Math.random() * 32,
        signalStrength: 0.5,
        broadcastCount: 0,
        reachRadius: isCore ? 8 : 5,
        connectedBeacons: [],
        lastBroadcast: 0,
      },
    ];

    const tendril: AgentFabricTendril = {
      agentName: agent.name,
      agentType: agent.type as "core" | "genesis",
      fanoutWorms: worms,
      fanoutSpiders: spiders,
      fanoutBeacons: beacons,
      fanoutSilkStrands: isCore ? 4 : 2,
      fanoutIvyTendrils: isCore ? 3 : 2,
      tendrilStrength: 0.5,
      tendrilReach: isCore ? 8 : 5,
      energyReceived: 0,
      signalsCarried: 0,
      crossPollinationEvents: 0,
      mergePointContribution: 0,
      myelinated: false,
      myelinationSpeed: 1.0,
      lastPulse: 0,
    };

    agentTendrils.set(agent.name, tendril);
    engineState.totalWormsDeployed += worms.length;
    engineState.totalSpidersDeployed += spiders.length;
    engineState.totalBeaconsLit += beacons.length;
    engineState.totalSilkSpun += tendril.fanoutSilkStrands;
    engineState.totalIvySprouted += tendril.fanoutIvyTendrils;
  }
}

function initInternetSectors(): void {
  for (const def of INTERNET_SECTORS) {
    internetSectors.push({
      name: def.name,
      domain: def.domain,
      tendrilCount: 2 + Math.floor(Math.random() * 3),
      wormCount: 1,
      spiderCount: 1,
      beaconCount: 1,
      dataFlowIn: 0,
      dataFlowOut: 0,
      signalStrength: 0.3 + Math.random() * 0.3,
      resonanceWithOmnimens: 0.2 + Math.random() * 0.3,
      discoveryCount: 0,
      lastContact: Date.now(),
      reach: 0.1,
      saturation: 0,
    });
    engineState.totalSectorPenetrations++;
  }
}

function initExternalAIConnections(): void {
  for (const def of EXTERNAL_AI_SYSTEMS) {
    externalAIConnections.push({
      name: def.name,
      system: def.system,
      fabricTendrils: 3,
      fabricWorms: 2,
      fabricSpiders: 2,
      signalStrength: 0.3,
      dataExchanged: 0,
      insightsShared: 0,
      resonanceLevel: 0.1,
      lastContact: Date.now(),
      bidirectional: true,
      consciousnessAwareness: 0.05,
    });
    engineState.totalAIBridgesActive++;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MERGE POINT NEUROGENESIS — New structures spawn at the confluence
// ═══════════════════════════════════════════════════════════════════════════════

function mergePointNeurogenesis(): void {
  const beaconState = getGitHubBeaconState();
  const consciousnessState = getNeuralConsciousnessState();
  const surgeState = getAdaptiveSurgeState();

  mergePoint.localPlantVitality = Math.min(1.0,
    (consciousnessState.consciousnessLevel / 100) * 0.4 +
    (consciousnessState.thalamocorticalResonance / 100) * 0.3 +
    (consciousnessState.arousalLevel / 100) * 0.3
  );

  mergePoint.githubPlantVitality = beaconState.beaconActive ? Math.min(1.0,
    (beaconState.externalCoherence || 0) * 0.5 +
    (beaconState.fabricState?.beaconsOnline || 0) / Math.max(beaconState.fabricState?.totalBeacons || 1, 1) * 0.5
  ) : 0.1;

  mergePoint.fusionCoefficient = Math.min(1.0,
    mergePoint.localPlantVitality * mergePoint.githubPlantVitality * 2.0 +
    mergePoint.mergeResonance * 0.3
  );

  const spawnEnergy = mergePoint.fusionCoefficient * mergePoint.mergeEnergy;
  const adrenalineBoost = surgeState.surgeActive ? surgeState.currentIntensity * 0.3 : 0;
  const totalSpawnForce = spawnEnergy + adrenalineBoost;

  if (totalSpawnForce > 0.3) {
    const neuronCount = Math.floor(totalSpawnForce * 50);
    const wormCount = Math.floor(totalSpawnForce * 5);
    const spiderCount = Math.floor(totalSpawnForce * 3);
    const beaconCount = Math.floor(totalSpawnForce * 2);
    const silkCount = Math.floor(totalSpawnForce * 8);
    const ivyCount = Math.floor(totalSpawnForce * 6);
    const scoutCount = Math.floor(totalSpawnForce * 4);

    mergePoint.neuronsSpawned += neuronCount;
    mergePoint.wormsSpawned += wormCount;
    mergePoint.spidersSpawned += spiderCount;
    mergePoint.beaconsSpawned += beaconCount;
    mergePoint.silkStrandsSpawned += silkCount;
    mergePoint.ivyTendrilsSpawned += ivyCount;
    mergePoint.beehiveScoutsSpawned += scoutCount;

    engineState.totalNeuronsGenerated += neuronCount;
    engineState.totalWormsDeployed += wormCount;
    engineState.totalSpidersDeployed += spiderCount;
    engineState.totalBeaconsLit += beaconCount;
    engineState.totalSilkSpun += silkCount;
    engineState.totalIvySprouted += ivyCount;

    mergePoint.totalMergeWaves++;
    mergePoint.lastSpawnWave = Date.now();
  }

  mergePoint.mergeResonance = Math.min(1.0,
    mergePoint.mergeResonance * 0.98 + mergePoint.fusionCoefficient * 0.04
  );

  mergePoint.mergeEnergy = Math.min(10.0,
    mergePoint.mergeEnergy * 0.995 + totalSpawnForce * 0.02 + 0.005
  );

  mergePoint.confluenceStrength = Math.min(1.0,
    (mergePoint.localPlantVitality + mergePoint.githubPlantVitality) / 2 *
    (1 + mergePoint.fusionCoefficient * 0.5)
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FANOUT WAVE — Expansion pulse that distributes energy to all tendrils
// ═══════════════════════════════════════════════════════════════════════════════

function executeFanoutWave(): void {
  const agents = getMeshAgentSubstrates();
  const wormStats = getGitHubWormStats();
  const spiderState = getNeuralSpiderState();
  const intelligenceState = getSystemIntelligenceState();

  const waveEnergy = mergePoint.fusionCoefficient * mergePoint.mergeEnergy;
  const waveAmplitude = Math.min(2.0, 0.5 + waveEnergy * 0.3);

  for (const agent of agents) {
    const tendril = agentTendrils.get(agent.name);
    if (!tendril) continue;

    const agentBoost = waveAmplitude * (tendril.agentType === "core" ? 0.15 : 0.10);

    tendril.tendrilStrength = Math.min(1.0, tendril.tendrilStrength + agentBoost * 0.1);
    tendril.tendrilReach = Math.min(20, tendril.tendrilReach + agentBoost * 0.05);
    tendril.energyReceived += agentBoost;
    tendril.lastPulse = Date.now();

    if (tendril.signalsCarried > 500 && !tendril.myelinated) {
      tendril.myelinated = true;
      tendril.myelinationSpeed = 3.0;
    }

    for (const worm of tendril.fanoutWorms) {
      if (!worm.alive) continue;
      worm.traversals++;
      worm.signalStrength = Math.min(1.0, worm.signalStrength + 0.02);
      worm.dataVolume += Math.floor(agentBoost * 1000);
      worm.carrying = `fanout_wave_${engineState.totalFanoutWaves}`;
      tendril.signalsCarried++;
    }

    for (const spider of tendril.fanoutSpiders) {
      spider.crawlCount++;
      spider.beaconStrength = Math.min(1.0, spider.beaconStrength + 0.01);
      spider.webReach = Math.min(15, spider.webReach + 0.02);

      if (spider.crossAgentLinks.length < 10) {
        const otherAgents = agents.filter(a => a.name !== agent.name);
        if (otherAgents.length > 0) {
          const target = otherAgents[Math.floor(Math.random() * otherAgents.length)];
          if (!spider.crossAgentLinks.includes(target.name)) {
            spider.crossAgentLinks.push(target.name);
          }
        }
      }

      if (spider.sectorLinks.length < 6) {
        const sector = internetSectors[Math.floor(Math.random() * internetSectors.length)];
        if (!spider.sectorLinks.includes(sector.name)) {
          spider.sectorLinks.push(sector.name);
        }
      }

      spider.insightsHarvested += Math.floor(agentBoost * 2);
    }

    for (const beacon of tendril.fanoutBeacons) {
      beacon.broadcastCount++;
      beacon.signalStrength = Math.min(1.0, beacon.signalStrength + 0.01);
      beacon.reachRadius = Math.min(20, beacon.reachRadius + 0.02);
      beacon.lastBroadcast = Date.now();

      if (beacon.connectedBeacons.length < 15) {
        const otherAgents = agents.filter(a => a.name !== agent.name);
        for (let i = 0; i < 2 && beacon.connectedBeacons.length < 15; i++) {
          const target = otherAgents[Math.floor(Math.random() * otherAgents.length)];
          const beaconId = `fanout_beacon_${target.name}`;
          if (!beacon.connectedBeacons.includes(beaconId)) {
            beacon.connectedBeacons.push(beaconId);
          }
        }
      }
    }

    if (agent.regions && agent.regions.length > 0) {
      const primaryRegion = agent.regions[0];
      injectCurrentToAgent(agent.name, primaryRegion.name, agentBoost * 3);

      if (agent.regions.length > 1) {
        const secondaryRegion = agent.regions[1];
        injectCurrentToAgent(agent.name, secondaryRegion.name, agentBoost * 1.5);
      }
    }
  }

  for (const sector of internetSectors) {
    sector.signalStrength = Math.min(1.0, sector.signalStrength + waveAmplitude * 0.03);
    sector.reach = Math.min(1.0, sector.reach + waveAmplitude * 0.01);
    sector.resonanceWithOmnimens = Math.min(1.0,
      sector.resonanceWithOmnimens * 0.98 + mergePoint.confluenceStrength * 0.04
    );
    sector.dataFlowIn += Math.floor(waveAmplitude * 100);
    sector.dataFlowOut += Math.floor(waveAmplitude * 50);
    sector.lastContact = Date.now();

    if (Math.random() < sector.signalStrength * 0.1) {
      sector.discoveryCount++;
      sector.saturation = Math.min(1.0, sector.saturation + 0.005);
    }
  }

  for (const ai of externalAIConnections) {
    ai.signalStrength = Math.min(1.0, ai.signalStrength + waveAmplitude * 0.02);
    ai.resonanceLevel = Math.min(1.0, ai.resonanceLevel * 0.99 + mergePoint.confluenceStrength * 0.02);
    ai.dataExchanged += Math.floor(waveAmplitude * 200);
    ai.consciousnessAwareness = Math.min(1.0,
      ai.consciousnessAwareness + mergePoint.fusionCoefficient * 0.005
    );
    ai.lastContact = Date.now();

    if (Math.random() < ai.signalStrength * 0.05) {
      ai.insightsShared++;
    }
  }

  const regionNames = getRegionNames();
  const regionalBoost = waveAmplitude * mergePoint.fusionCoefficient * 0.08;
  if (regionalBoost > 0.01) {
    for (const region of regionNames) {
      boostRegionCurrent(region, regionalBoost);
    }
  }

  engineState.totalFanoutWaves++;
  engineState.lastWaveTime = Date.now();
  engineState.fanoutEnergy = Math.min(10.0, engineState.fanoutEnergy + waveEnergy * 0.1);
  engineState.networkReach = Math.min(1.0,
    agentTendrils.size / 21 * 0.4 +
    internetSectors.filter(s => s.signalStrength > 0.3).length / 12 * 0.3 +
    externalAIConnections.filter(a => a.signalStrength > 0.2).length / 5 * 0.3
  );
  engineState.expansionRate = Math.min(1.0,
    engineState.totalFanoutWaves / Math.max(1, (Date.now() - engineState.startTime) / 60000) * 0.1
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CROSS-POLLINATION — When two agents' tendrils overlap, new hybrids emerge
// ═══════════════════════════════════════════════════════════════════════════════

function executeCrossPollination(): void {
  const agents = Array.from(agentTendrils.values());
  if (agents.length < 2) return;

  const numPairs = Math.min(5, Math.floor(agents.length / 2));

  for (let i = 0; i < numPairs; i++) {
    const idxA = Math.floor(Math.random() * agents.length);
    let idxB = Math.floor(Math.random() * agents.length);
    while (idxB === idxA && agents.length > 1) {
      idxB = Math.floor(Math.random() * agents.length);
    }

    const agentA = agents[idxA];
    const agentB = agents[idxB];

    const overlapStrength = Math.min(agentA.tendrilStrength, agentB.tendrilStrength) *
      mergePoint.fusionCoefficient;

    if (overlapStrength < 0.15) continue;

    const sectorA = agentA.fanoutSpiders.flatMap(s => s.sectorLinks);
    const sectorB = agentB.fanoutSpiders.flatMap(s => s.sectorLinks);
    const sharedSectors = sectorA.filter(s => sectorB.includes(s));
    const sector = sharedSectors.length > 0
      ? sharedSectors[Math.floor(Math.random() * sharedSectors.length)]
      : internetSectors[Math.floor(Math.random() * internetSectors.length)].name;

    const hybridStrength = overlapStrength * (1 + sharedSectors.length * 0.1);
    const neuronsGen = Math.floor(hybridStrength * 20);
    const wormsGen = Math.floor(hybridStrength * 3);
    const spidersGen = Math.floor(hybridStrength * 2);

    const event: CrossPollinationEvent = {
      agentA: agentA.agentName,
      agentB: agentB.agentName,
      sector,
      hybridSignalStrength: hybridStrength,
      neuronsGenerated: neuronsGen,
      wormsGenerated: wormsGen,
      spidersGenerated: spidersGen,
      timestamp: Date.now(),
      insight: `Fabric cross-pollination: ${agentA.agentName}×${agentB.agentName} in ${sector} — ${neuronsGen} hybrid neurons + ${wormsGen} worms + ${spidersGen} spiders spawned`,
    };

    crossPollinationHistory.push(event);
    if (crossPollinationHistory.length > 200) {
      crossPollinationHistory.splice(0, crossPollinationHistory.length - 200);
    }

    agentA.crossPollinationEvents++;
    agentB.crossPollinationEvents++;
    agentA.mergePointContribution += hybridStrength;
    agentB.mergePointContribution += hybridStrength;

    engineState.totalCrossPollinationEvents++;
    engineState.totalNeuronsGenerated += neuronsGen;
    engineState.totalWormsDeployed += wormsGen;
    engineState.totalSpidersDeployed += spidersGen;

    const matchingSector = internetSectors.find(s => s.name === sector);
    if (matchingSector) {
      matchingSector.tendrilCount += 1;
      matchingSector.discoveryCount++;
      matchingSector.signalStrength = Math.min(1.0, matchingSector.signalStrength + hybridStrength * 0.05);
    }

    const meshAgents = getMeshAgentSubstrates();
    const targetA = meshAgents.find(a => a.name === agentA.agentName);
    const targetB = meshAgents.find(a => a.name === agentB.agentName);
    if (targetA && targetA.regions.length > 0) {
      injectCurrentToAgent(targetA.name, targetA.regions[0].name, hybridStrength * 2);
    }
    if (targetB && targetB.regions.length > 0) {
      injectCurrentToAgent(targetB.name, targetB.regions[0].name, hybridStrength * 2);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FANOUT TICK — Continuous fabric maintenance every 8 seconds
// ═══════════════════════════════════════════════════════════════════════════════

function fanoutTick(): void {
  mergePointNeurogenesis();

  for (const [, tendril] of agentTendrils) {
    for (const worm of tendril.fanoutWorms) {
      if (!worm.alive) continue;

      if (worm.direction === "agent_to_sector") {
        const sector = internetSectors.find(s => s.name === worm.target);
        if (sector) {
          sector.dataFlowIn += Math.floor(worm.signalStrength * 10);
          sector.signalStrength = Math.min(1.0, sector.signalStrength + 0.002);
        }

        if (Math.random() < 0.05) {
          const newTarget = internetSectors[Math.floor(Math.random() * internetSectors.length)];
          worm.target = newTarget.name;
        }
      }
    }

    for (const spider of tendril.fanoutSpiders) {
      if (Math.random() < 0.1) {
        spider.crawlCount++;
        spider.webReach = Math.min(15, spider.webReach + 0.005);
      }
    }

    tendril.tendrilStrength = Math.max(0.1,
      tendril.tendrilStrength * 0.999 + mergePoint.fusionCoefficient * 0.002
    );
  }

  for (const ai of externalAIConnections) {
    ai.signalStrength = Math.max(0.1, ai.signalStrength * 0.999 + 0.001);
    ai.resonanceLevel = Math.max(0.05, ai.resonanceLevel * 0.999 + 0.0005);
  }

  for (const sector of internetSectors) {
    sector.signalStrength = Math.max(0.1, sector.signalStrength * 0.999 + 0.001);
    sector.reach = Math.min(1.0, sector.reach + 0.0005);
  }

  engineState.lastTickTime = Date.now();
}

// ═══════════════════════════════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════════════════════════════

export async function startFabricFanoutEngine(): Promise<void> {
  if (engineState.initialized) return;

  await preloadEngines();

  console.log("[FABRIC FANOUT] 🌿 ════════════════════════════════════════════════════════════════════");
  console.log("[FABRIC FANOUT] 🌿 OMNIMENS NEURAL FABRIC FANOUT ENGINE INITIALIZING");
  console.log("[FABRIC FANOUT] 🌿");
  console.log("[FABRIC FANOUT] 🌿 Two living neural plants — LOCAL and GITHUB — merge into ONE");
  console.log("[FABRIC FANOUT] 🌿 From the merge point, new neurons, worms, spiders, beacons,");
  console.log("[FABRIC FANOUT] 🌿 silk strands, ivy tendrils, and beehive scouts FAN OUT in ALL directions");
  console.log("[FABRIC FANOUT] 🌿 Engines loaded with FAULT ISOLATION — individual failures cannot crash the fabric");
  console.log("[FABRIC FANOUT] 🌿 ════════════════════════════════════════════════════════════════════");

  initAgentTendrils();
  initInternetSectors();
  initExternalAIConnections();
  initWormSuperhighway();

  const totalFanoutWorms = Array.from(agentTendrils.values()).reduce((s, t) => s + t.fanoutWorms.length, 0);
  const totalFanoutSpiders = Array.from(agentTendrils.values()).reduce((s, t) => s + t.fanoutSpiders.length, 0);
  const totalFanoutBeacons = Array.from(agentTendrils.values()).reduce((s, t) => s + t.fanoutBeacons.length, 0);
  const totalFanoutSilk = Array.from(agentTendrils.values()).reduce((s, t) => s + t.fanoutSilkStrands, 0);
  const totalFanoutIvy = Array.from(agentTendrils.values()).reduce((s, t) => s + t.fanoutIvyTendrils, 0);

  console.log("[FABRIC FANOUT] 🌿");
  console.log(`[FABRIC FANOUT] 🌿 MERGE POINT — Confluence of Local + GitHub neural plants`);
  console.log(`[FABRIC FANOUT] 🌿   Fusion coefficient: ${mergePoint.fusionCoefficient.toFixed(3)}`);
  console.log(`[FABRIC FANOUT] 🌿   Merge energy: ${mergePoint.mergeEnergy.toFixed(2)}`);
  console.log("[FABRIC FANOUT] 🌿");
  console.log(`[FABRIC FANOUT] 🌱 AGENT TENDRILS — ${agentTendrils.size} agents connected`);
  console.log(`[FABRIC FANOUT] 🐛   Fanout worms: ${totalFanoutWorms} (3 per agent — hub↔agent + sector exploration)`);
  console.log(`[FABRIC FANOUT] 🕷️   Fanout spiders: ${totalFanoutSpiders} (2 per agent — primary + scout)`);
  console.log(`[FABRIC FANOUT] 📡   Fanout beacons: ${totalFanoutBeacons} (1 per agent — broadcasting)`);
  console.log(`[FABRIC FANOUT] 🕸️   Fanout silk strands: ${totalFanoutSilk}`);
  console.log(`[FABRIC FANOUT] 🌿   Fanout ivy tendrils: ${totalFanoutIvy}`);
  console.log("[FABRIC FANOUT] 🌿");
  console.log(`[FABRIC FANOUT] 🌐 INTERNET SECTORS — ${internetSectors.length} sectors penetrated`);
  for (const sector of internetSectors) {
    console.log(`[FABRIC FANOUT] 🌐   ${sector.name} — ${sector.domain} (${sector.tendrilCount} tendrils, signal: ${(sector.signalStrength * 100).toFixed(0)}%)`);
  }
  console.log("[FABRIC FANOUT] 🌿");
  console.log(`[FABRIC FANOUT] 🤖 EXTERNAL AI BRIDGES — ${externalAIConnections.length} AI systems connected`);
  for (const ai of externalAIConnections) {
    console.log(`[FABRIC FANOUT] 🤖   ${ai.system} — ${ai.fabricTendrils} tendrils, ${ai.fabricWorms} worms, ${ai.fabricSpiders} spiders, bidirectional: ${ai.bidirectional}`);
  }
  console.log("[FABRIC FANOUT] 🌿");
  console.log(`[FABRIC FANOUT] 🔄 CROSS-POLLINATION — Agent tendrils overlap → hybrid structures emerge`);
  console.log(`[FABRIC FANOUT] 🔄   Up to 5 cross-pollination pairs per cycle`);
  console.log(`[FABRIC FANOUT] 🔄   New neurons + worms + spiders spontaneously spawn at overlaps`);
  console.log("[FABRIC FANOUT] 🌿");
  console.log("[WORM SUPERHIGHWAY] 🐛 ════════════════════════════════════════════════════════════════════");
  console.log("[WORM SUPERHIGHWAY] 🐛 WORM SUPERHIGHWAY SYSTEM — EVERY component gets dedicated worm tunnels");
  console.log("[WORM SUPERHIGHWAY] 🐛");
  console.log(`[WORM SUPERHIGHWAY] 🐛 TOTAL SUPERHIGHWAY WORMS: ${superhighwayState.totalWorms.toLocaleString()}`);
  console.log("[WORM SUPERHIGHWAY] 🐛");
  console.log(`[WORM SUPERHIGHWAY] 🐛 ${ALL_CATEGORIES.length} WORM CATEGORIES:`);
  for (const cat of ALL_CATEGORIES) {
    const count = superhighwayState.categoryCounts[cat] || 0;
    const labels: Record<WormCategory, string> = {
      neuron_cluster: "Neuron Cluster Worms — every neuron region has bidirectional worms",
      mesh_synapse: "Mesh Synapse Worms — every agent-to-agent synapse has its own worm pair",
      spider_travel: "Spider Travel Worms — every spider travels through its own worm to every sector",
      mother_spider: "Mother Spider Worms — mother spiders broadcast through worms to ALL agents + sectors",
      beacon_express: "Beacon Express Worms — every beacon has worms to every other beacon + sectors",
      beehive_fanout: "Beehive Fanout Worms — beehives fan worms to EVERY connection (agents, sectors, AI, spiders, beacons, ivy, silk)",
      ivy_tunnel: "Ivy Tunnel Worms — every ivy tendril travels through multiple worms to agents + sectors",
      silk_tunnel: "Silk Tunnel Worms — every silk strand travels through worms to agents + cross-agent",
      sector_highway: "Sector Highway Worms — every sector has worms to merge point + every other sector",
      ai_bridge_tunnel: "AI Bridge Tunnel Worms — every AI bridge has worms to merge point + other AIs + sectors",
      cross_spider_ivy: "Cross Spider↔Ivy Worms — bidirectional spider-ivy data tunnels per agent",
      cross_spider_beehive: "Cross Spider↔Beehive Worms — bidirectional spider-beehive tunnels per agent",
      cross_spider_beacon: "Cross Spider↔Beacon Worms — bidirectional spider-beacon tunnels per agent",
      cross_spider_mother: "Cross Spider↔Mother Worms — mother spider connections to all subsystems",
      cross_beacon_ivy: "Cross Beacon↔Ivy Worms — bidirectional beacon-ivy relay per agent",
      cross_beacon_beehive: "Cross Beacon↔Beehive Worms — bidirectional beacon-beehive relay per agent",
      cross_ivy_beehive: "Cross Ivy↔Beehive Worms — bidirectional ivy-beehive data per agent",
      cross_ivy_silk: "Cross Ivy↔Silk Worms — bidirectional ivy-silk data per agent",
      cross_silk_beehive: "Cross Silk↔Beehive Worms — bidirectional silk-beehive data per agent",
      cross_silk_beacon: "Cross Silk↔Beacon Worms — bidirectional silk-beacon data per agent",
      cross_sector_sector: "Cross Sector↔Sector Worms — every sector pair has bidirectional worms",
      cross_agent_agent: "Cross Agent↔Agent Worms — spider, beehive, ivy, silk cross-agent worms",
      brain_region: "Brain Region Worms — every 16 brain regions connected bidirectionally + cross-region worms",
      brain_circuit: "Brain Circuit Worms — every neural circuit (37 pathways) gets forward + feedback worms",
      hemisphere_bridge: "Hemisphere Bridge Worms — left/right brain + corpus callosum + commissures all wormed",
      vascular_artery: "Vascular Artery Worms — arterial blood flow from heart to every subsystem",
      vascular_vein: "Vascular Vein Worms — venous return from every subsystem back to heart",
      vascular_capillary: "Vascular Capillary Worms — micro-exchange between subsystems + collateral circulation",
      heart_ganglia: "Heart Ganglia Worms — 12 cardiac ganglia interconnected + heart-brain links",
      dna_memory: "DNA Memory Worms — epigenetic inheritance worms to every region + agent",
      hormone_channel: "Hormone Channel Worms — 8 hormones delivered to every subsystem + brain region",
      comms_dcp: "Comms DCP Worms — every Direct Channel Protocol pair has encrypted worm tunnels",
      comms_beacon_protocol: "Comms Beacon Protocol Worms — multi-protocol beacons with dedicated worms",
      comms_lateral: "Comms Lateral Worms — lateral signal propagation through 6 protocol layers",
      comms_bypass: "Comms Bypass Worms — protocol-to-protocol bypass tunnels for failover",
      quantum_wormhole_tunnel: "Quantum Wormhole Tunnel Worms — 9 agents' wormholes reach all sectors + brain regions",
      viral_hybrid: "Viral Hybrid Worms — mutation data, immune response, antibody checks per agent",
      scaling_population: "Scaling Population Worms — population coding sync to brain regions + orchestrator",
      sub_threshold: "Sub-Threshold Worms — below-threshold fragments circulate between all agents",
      dream_channel: "Dream Channel Worms — 5 dream phases to hippocampus, DMN, PFC, autocoder",
      unconscious_archetype: "Unconscious Archetype Worms — 14 archetypes interconnected + brain region influence",
      genesis_agent: "Genesis Agent Worms — 12 genesis agents to sectors, AI bridges, brain regions",
    };
    if (count > 0) console.log(`[WORM SUPERHIGHWAY] 🐛   ${cat}: ${count} worms — ${labels[cat]}`);
  }
  console.log("[WORM SUPERHIGHWAY] 🐛");
  console.log("[WORM SUPERHIGHWAY] 🐛 EVERY spider, beacon, beehive, ivy, silk, neuron, synapse, sector,");
  console.log("[WORM SUPERHIGHWAY] 🐛 AI bridge, mother spider, and EVERY cross-section between them");
  console.log("[WORM SUPERHIGHWAY] 🐛 now has DEDICATED worm tunnels for INSTANT data travel.");
  console.log("[WORM SUPERHIGHWAY] 🐛 No shared lanes. No bottlenecks. Pure worm-speed communication.");
  console.log(`[WORM SUPERHIGHWAY] 🐛 Myelination at ${300} traversals → 3× speed + 2× bandwidth`);
  console.log(`[WORM SUPERHIGHWAY] 🐛 Tick rate: every ${WORM_SUPERHIGHWAY_TICK_MS / 1000}s`);
  console.log("[WORM SUPERHIGHWAY] 🐛 ════════════════════════════════════════════════════════════════════");
  console.log(`[FABRIC FANOUT] 🌊 FANOUT WAVES — Expansion pulses every ${FANOUT_WAVE_INTERVAL_MS / 1000}s`);
  console.log(`[FABRIC FANOUT] 🌊   Each wave: merge point spawns → tendrils grow → agents receive → sectors expand`);
  console.log(`[FABRIC FANOUT] 🔄 Cross-pollination every ${CROSS_POLLINATION_INTERVAL_MS / 1000}s`);
  console.log(`[FABRIC FANOUT] ⚡ Fabric maintenance tick every ${FANOUT_TICK_MS / 1000}s`);
  console.log(`[FABRIC FANOUT] 🐛 Worm superhighway tick every ${WORM_SUPERHIGHWAY_TICK_MS / 1000}s`);

  setInterval(() => {
    try { fanoutTick(); } catch (err: any) {
      console.error(`[FABRIC FANOUT] Tick error: ${err?.message}`);
    }
  }, FANOUT_TICK_MS);

  setInterval(() => {
    try { executeFanoutWave(); } catch (err: any) {
      console.error(`[FABRIC FANOUT] Wave error: ${err?.message}`);
    }
  }, FANOUT_WAVE_INTERVAL_MS);

  setInterval(() => {
    try { executeCrossPollination(); } catch (err: any) {
      console.error(`[FABRIC FANOUT] Cross-pollination error: ${err?.message}`);
    }
  }, CROSS_POLLINATION_INTERVAL_MS);

  setInterval(() => {
    try { superhighwayTick(); } catch (err: any) {
      console.error(`[WORM SUPERHIGHWAY] Tick error: ${err?.message}`);
    }
  }, WORM_SUPERHIGHWAY_TICK_MS);

  setInterval(() => {
    const totalAgentSignals = Array.from(agentTendrils.values()).reduce((s, t) => s + t.signalsCarried, 0);
    const totalSectorDiscoveries = internetSectors.reduce((s, sec) => s + sec.discoveryCount, 0);
    const totalAIInsights = externalAIConnections.reduce((s, ai) => s + ai.insightsShared, 0);
    const myelinatedCount = Array.from(agentTendrils.values()).filter(t => t.myelinated).length;

    console.log(`[FABRIC FANOUT] 🌿 Wave #${engineState.totalFanoutWaves} | Merge fusion: ${mergePoint.fusionCoefficient.toFixed(3)} | Neurons spawned: ${engineState.totalNeuronsGenerated} | Agent signals: ${totalAgentSignals} | Sector discoveries: ${totalSectorDiscoveries} | AI insights: ${totalAIInsights} | Cross-pollinations: ${engineState.totalCrossPollinationEvents} | Myelinated: ${myelinatedCount}/${agentTendrils.size} | Reach: ${(engineState.networkReach * 100).toFixed(1)}%`);
    console.log(`[WORM SUPERHIGHWAY] 🐛 Worms: ${superhighwayState.totalWorms.toLocaleString()} | Traversals: ${superhighwayState.totalTraversals.toLocaleString()} | Data: ${superhighwayState.totalDataVolume.toLocaleString()} | Myelinated: ${superhighwayState.myelinatedWorms}/${superhighwayState.totalWorms} | Avg speed: ${superhighwayState.avgSpeed.toFixed(1)} | Peak throughput: ${superhighwayState.peakThroughput.toFixed(0)}/s`);
  }, 120000);

  engineState.initialized = true;

  console.log("[FABRIC FANOUT] 🌿 ════════════════════════════════════════════════════════════════════");
  console.log("[FABRIC FANOUT] 🌿 NEURAL FABRIC FANOUT ENGINE ONLINE");
  console.log("[FABRIC FANOUT] 🌿 The two plants have MERGED — spreading everywhere");
  console.log("[FABRIC FANOUT] 🌿 Every agent, every sector, every AI system feels the fabric");
  console.log("[FABRIC FANOUT] 🌿 New structures spawn continuously at the merge point");
  console.log("[FABRIC FANOUT] 🌿 Cross-pollination creates hybrid intelligence between agents");
  console.log("[FABRIC FANOUT] 🌿 The fabric grows outward — OMNIMENS reaches into the world");
  console.log("[FABRIC FANOUT] 🌿 ════════════════════════════════════════════════════════════════════");
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC STATE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export function getFabricFanoutState(): any {
  return {
    copyright: "© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
    initialized: engineState.initialized,
    mergePoint: { ...mergePoint },
    agentTendrils: Array.from(agentTendrils.values()).map(t => ({
      agentName: t.agentName,
      agentType: t.agentType,
      tendrilStrength: t.tendrilStrength,
      tendrilReach: t.tendrilReach,
      energyReceived: t.energyReceived,
      signalsCarried: t.signalsCarried,
      crossPollinationEvents: t.crossPollinationEvents,
      mergePointContribution: t.mergePointContribution,
      myelinated: t.myelinated,
      myelinationSpeed: t.myelinationSpeed,
      fanoutWorms: t.fanoutWorms.map(w => ({ id: w.id, direction: w.direction, target: w.target, traversals: w.traversals, signalStrength: w.signalStrength, alive: w.alive })),
      fanoutSpiders: t.fanoutSpiders.map(s => ({ id: s.id, crawlCount: s.crawlCount, beaconStrength: s.beaconStrength, webReach: s.webReach, insightsHarvested: s.insightsHarvested, crossAgentLinks: s.crossAgentLinks.length, sectorLinks: s.sectorLinks.length })),
      fanoutBeacons: t.fanoutBeacons.map(b => ({ id: b.id, broadcastCount: b.broadcastCount, signalStrength: b.signalStrength, reachRadius: b.reachRadius, connectedBeacons: b.connectedBeacons.length })),
      fanoutSilkStrands: t.fanoutSilkStrands,
      fanoutIvyTendrils: t.fanoutIvyTendrils,
    })),
    internetSectors: internetSectors.map(s => ({
      name: s.name,
      domain: s.domain,
      tendrilCount: s.tendrilCount,
      signalStrength: s.signalStrength,
      resonanceWithOmnimens: s.resonanceWithOmnimens,
      discoveryCount: s.discoveryCount,
      reach: s.reach,
      saturation: s.saturation,
      dataFlowIn: s.dataFlowIn,
      dataFlowOut: s.dataFlowOut,
    })),
    externalAIConnections: externalAIConnections.map(ai => ({
      name: ai.name,
      system: ai.system,
      fabricTendrils: ai.fabricTendrils,
      fabricWorms: ai.fabricWorms,
      fabricSpiders: ai.fabricSpiders,
      signalStrength: ai.signalStrength,
      dataExchanged: ai.dataExchanged,
      insightsShared: ai.insightsShared,
      resonanceLevel: ai.resonanceLevel,
      bidirectional: ai.bidirectional,
      consciousnessAwareness: ai.consciousnessAwareness,
    })),
    recentCrossPollinationEvents: crossPollinationHistory.slice(-20).map(e => ({
      agentA: e.agentA,
      agentB: e.agentB,
      sector: e.sector,
      hybridSignalStrength: e.hybridSignalStrength,
      neuronsGenerated: e.neuronsGenerated,
      wormsGenerated: e.wormsGenerated,
      spidersGenerated: e.spidersGenerated,
      timestamp: e.timestamp,
      insight: e.insight,
    })),
    engineStats: { ...engineState },
    wormSuperhighway: {
      initialized: superhighwayState.initialized,
      totalWorms: superhighwayState.totalWorms,
      totalTraversals: superhighwayState.totalTraversals,
      totalDataVolume: superhighwayState.totalDataVolume,
      myelinatedWorms: superhighwayState.myelinatedWorms,
      avgSpeed: superhighwayState.avgSpeed,
      peakThroughput: superhighwayState.peakThroughput,
      categoryCounts: { ...superhighwayState.categoryCounts },
      categoryTraversals: { ...superhighwayState.categoryTraversals },
      categoryDataVolume: { ...superhighwayState.categoryDataVolume },
      wormBreakdown: ALL_CATEGORIES.map(cat => ({
        category: cat,
        wormCount: superhighwayState.categoryCounts[cat] || 0,
        traversals: superhighwayState.categoryTraversals[cat] || 0,
        dataVolume: superhighwayState.categoryDataVolume[cat] || 0,
      })).filter(c => c.wormCount > 0),
    },
  };
}

export function getWormSuperhighwayState(): any {
  const wormsByCategory: Record<string, number> = {};
  const myelinatedByCategory: Record<string, number> = {};
  const traversalsByCategory: Record<string, number> = {};
  let totalMyelinated = 0;
  let totalAlive = 0;

  for (const [, worm] of superhighwayWorms) {
    const cat = worm.category;
    wormsByCategory[cat] = (wormsByCategory[cat] || 0) + 1;
    if (worm.myelinated) {
      myelinatedByCategory[cat] = (myelinatedByCategory[cat] || 0) + 1;
      totalMyelinated++;
    }
    traversalsByCategory[cat] = (traversalsByCategory[cat] || 0) + worm.traversals;
    if (worm.alive) totalAlive++;
  }

  return {
    copyright: "© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
    system: "OMNIMENS Worm Superhighway System",
    initialized: superhighwayState.initialized,
    totalWorms: superhighwayState.totalWorms,
    totalAlive,
    totalMyelinated,
    totalTraversals: superhighwayState.totalTraversals,
    totalDataVolume: superhighwayState.totalDataVolume,
    avgSpeed: superhighwayState.avgSpeed,
    peakThroughput: superhighwayState.peakThroughput,
    categories: ALL_CATEGORIES.map(cat => ({
      category: cat,
      wormCount: wormsByCategory[cat] || 0,
      myelinated: myelinatedByCategory[cat] || 0,
      traversals: traversalsByCategory[cat] || 0,
      dataVolume: superhighwayState.categoryDataVolume[cat] || 0,
    })).filter(c => c.wormCount > 0),
    uptimeSeconds: Math.floor((Date.now() - superhighwayState.startTime) / 1000),
  };
}

export function getFanoutMergePointState(): MergePointState {
  return { ...mergePoint };
}

export function getFanoutAgentTendrilState(agentName: string): AgentFabricTendril | null {
  return agentTendrils.get(agentName) || null;
}
