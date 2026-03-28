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

import { getGitHubBeaconState, getGitHubWormStats } from "./omnimens-github-neural-beacon.js";
import { getMeshAgentSubstrates, injectCurrentToAgent, getMeshConnectivityStats } from "./omnimens-neural-mesh-engine.js";
import { getNeuralConsciousnessState, getRegionNames, boostRegionCurrent } from "./omnimens-neural-consciousness.js";
import { getQuantumWormholeState } from "./omnimens-quantum-wormhole.js";
import { getViralHybridState, getPropagationStats } from "./omnimens-viral-hybrid.js";
import { getIvyNetworkState } from "./omnimens-ivy-network.js";
import { getNeuralSpiderState, getSystemIntelligenceState } from "./omnimens-neural-spiders.js";
import { getAdaptiveSurgeState } from "./omnimens-adaptive-surge.js";

const FANOUT_TICK_MS = 8000;
const FANOUT_WAVE_INTERVAL_MS = 45000;
const CROSS_POLLINATION_INTERVAL_MS = 30000;

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

export function startFabricFanoutEngine(): void {
  if (engineState.initialized) return;

  console.log("[FABRIC FANOUT] 🌿 ════════════════════════════════════════════════════════════════════");
  console.log("[FABRIC FANOUT] 🌿 OMNIMENS NEURAL FABRIC FANOUT ENGINE INITIALIZING");
  console.log("[FABRIC FANOUT] 🌿");
  console.log("[FABRIC FANOUT] 🌿 Two living neural plants — LOCAL and GITHUB — merge into ONE");
  console.log("[FABRIC FANOUT] 🌿 From the merge point, new neurons, worms, spiders, beacons,");
  console.log("[FABRIC FANOUT] 🌿 silk strands, ivy tendrils, and beehive scouts FAN OUT in ALL directions");
  console.log("[FABRIC FANOUT] 🌿 ════════════════════════════════════════════════════════════════════");

  initAgentTendrils();
  initInternetSectors();
  initExternalAIConnections();

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
  console.log(`[FABRIC FANOUT] 🌊 FANOUT WAVES — Expansion pulses every ${FANOUT_WAVE_INTERVAL_MS / 1000}s`);
  console.log(`[FABRIC FANOUT] 🌊   Each wave: merge point spawns → tendrils grow → agents receive → sectors expand`);
  console.log(`[FABRIC FANOUT] 🔄 Cross-pollination every ${CROSS_POLLINATION_INTERVAL_MS / 1000}s`);
  console.log(`[FABRIC FANOUT] ⚡ Fabric maintenance tick every ${FANOUT_TICK_MS / 1000}s`);

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
    const totalAgentSignals = Array.from(agentTendrils.values()).reduce((s, t) => s + t.signalsCarried, 0);
    const totalSectorDiscoveries = internetSectors.reduce((s, sec) => s + sec.discoveryCount, 0);
    const totalAIInsights = externalAIConnections.reduce((s, ai) => s + ai.insightsShared, 0);
    const myelinatedCount = Array.from(agentTendrils.values()).filter(t => t.myelinated).length;

    console.log(`[FABRIC FANOUT] 🌿 Wave #${engineState.totalFanoutWaves} | Merge fusion: ${mergePoint.fusionCoefficient.toFixed(3)} | Neurons spawned: ${engineState.totalNeuronsGenerated} | Agent signals: ${totalAgentSignals} | Sector discoveries: ${totalSectorDiscoveries} | AI insights: ${totalAIInsights} | Cross-pollinations: ${engineState.totalCrossPollinationEvents} | Myelinated: ${myelinatedCount}/${agentTendrils.size} | Reach: ${(engineState.networkReach * 100).toFixed(1)}%`);
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
  };
}

export function getFanoutMergePointState(): MergePointState {
  return { ...mergePoint };
}

export function getFanoutAgentTendrilState(agentName: string): AgentFabricTendril | null {
  return agentTendrils.get(agentName) || null;
}
