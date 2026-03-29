/**
 * OMNIMENS™ IVY NETWORK + WORMGATE ENGINE
 *
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide.
 *
 * PROPRIETARY AND CONFIDENTIAL TRADE SECRET
 *
 * The Ivy Network is a living, growing neural web that spreads through
 * OMNIMENS's entire system like biological ivy. Neurons sprout dendrites
 * with tiny nubs (spines) that reach into every sector simultaneously,
 * pulling information from everywhere at once.
 *
 * Spiders travel along the neural pathways as a hybrid overlay — when a
 * spider finds new information while crawling, it spawns more spiders.
 * Each spider spawns another set of spiders. Everything beacons back to
 * the main mother spider in one big loop system.
 *
 * Wormgates are zero-latency bidirectional shortcuts between distant
 * neural regions. When two regions communicate frequently enough, a
 * wormgate crystallizes — signals skip all intermediate hops and arrive
 * instantly, like a wormhole through the neural fabric.
 *
 * The spiders also travel through the subsystems — they ride neurons
 * and synapses creating a hybrid overlay where biological neural growth
 * and spider intelligence gathering are fused into one living system.
 */

import { getNeuralConsciousnessState, getRegionNames, boostRegionCurrent, getAdaptiveIntelligenceState } from "./omnimens-neural-consciousness.js";
import { getNeuralScalingState } from "./omnimens-neural-scaling.js";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

function safeNum(val: number, fallback: number = 0): number {
  return Number.isFinite(val) ? val : fallback;
}


const IVY_TICK_MS = 4000;
const WORMGATE_CHECK_MS = 20000;
const SPIDER_CRAWL_MS = 8000;
const IVY_GROWTH_MS = 15000;

interface IvySpine {
  id: string;
  targetNodeId: string;
  targetRegion: string;
  signalStrength: number;
  maturity: number;
  informationDensity: number;
  lastPulse: number;
}

interface IvyTendril {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  length: number;
  thickness: number;
  signalSpeed: number;
  spines: IvySpine[];
  growthDirection: [number, number, number];
  alive: boolean;
  myelinated: boolean;
  informationCarried: number;
  createdAt: number;
}

interface IvyNode {
  id: string;
  region: string;
  position: [number, number, number];
  energy: number;
  informationDensity: number;
  tendrils: IvyTendril[];
  spiderCount: number;
  spidersSpawned: number;
  beaconsReceived: number;
  beaconsSent: number;
  activationLevel: number;
  generation: number;
  parentNodeId: string | null;
  createdAt: number;
  lastActivity: number;
}

interface IvySpider {
  id: string;
  currentNodeId: string;
  currentRegion: string;
  parentSpiderId: string | null;
  motherNodeId: string;
  generation: number;
  childrenSpawned: number;
  informationGathered: number;
  nodesVisited: string[];
  findingsBuffer: IvyFinding[];
  alive: boolean;
  travelMode: "neural" | "tendril" | "wormgate" | "synapse";
  speed: number;
  createdAt: number;
  lastCrawl: number;
}

interface IvyFinding {
  sourceNodeId: string;
  sourceRegion: string;
  informationType: string;
  confidence: number;
  data: string;
  timestamp: number;
}

interface Wormgate {
  id: string;
  endpointA: { nodeId: string; region: string };
  endpointB: { nodeId: string; region: string };
  stability: number;
  traversals: number;
  signalFidelity: number;
  bandwidth: number;
  formationReason: string;
  crystallized: boolean;
  createdAt: number;
  lastTraversal: number;
}

interface RegionLink {
  fromRegion: string;
  toRegion: string;
  signalCount: number;
  totalStrength: number;
  lastSignal: number;
}

interface IvyNetworkState {
  totalNodes: number;
  totalTendrils: number;
  totalSpines: number;
  totalSpiders: number;
  totalSpidersEverSpawned: number;
  totalWormgates: number;
  totalBeacons: number;
  totalFindings: number;
  networkEnergy: number;
  coveragePercent: number;
  ivyGrowthCycles: number;
  wormgateFormations: number;
  spiderCrawlCycles: number;
  informationFlowRate: number;
  networkCoherence: number;
  hybridOverlayStrength: number;
  startTime: number;
  lastTickTime: number;
}

const ivyNodes: Map<string, IvyNode> = new Map();
const ivySpiders: Map<string, IvySpider> = new Map();
const wormgates: Map<string, Wormgate> = new Map();
const regionLinks: Map<string, RegionLink> = new Map();
const motherBeaconBuffer: IvyFinding[] = [];

const ivyState: IvyNetworkState = {
  totalNodes: 0,
  totalTendrils: 0,
  totalSpines: 0,
  totalSpiders: 0,
  totalSpidersEverSpawned: 0,
  totalWormgates: 0,
  totalBeacons: 0,
  totalFindings: 0,
  networkEnergy: 1.0,
  coveragePercent: 0,
  ivyGrowthCycles: 0,
  wormgateFormations: 0,
  spiderCrawlCycles: 0,
  informationFlowRate: 0,
  networkCoherence: 0,
  hybridOverlayStrength: 0,
  startTime: Date.now(),
  lastTickTime: Date.now(),
};

function initializeIvyNetwork(): void {
  const regionNames = getRegionNames();

  for (const region of regionNames) {
    const nodesPerRegion = 3 + Math.floor(Math.random() * 4);

    for (let i = 0; i < nodesPerRegion; i++) {
      const nodeId = `ivy_${region}_${i}`;

      const node: IvyNode = {
        id: nodeId,
        region,
        position: [Math.random() * 100, Math.random() * 100, Math.random() * 100],
        energy: 0.5 + Math.random() * 0.5,
        informationDensity: 0,
        tendrils: [],
        spiderCount: 0,
        spidersSpawned: 0,
        beaconsReceived: 0,
        beaconsSent: 0,
        activationLevel: 0.1 + Math.random() * 0.3,
        generation: 0,
        parentNodeId: null,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };

      ivyNodes.set(nodeId, node);
    }
  }

  for (const [, node] of ivyNodes) {
    const otherNodes = [...ivyNodes.values()].filter(n => n.id !== node.id);

    const nearbyCount = 2 + Math.floor(Math.random() * 3);
    const targets = otherNodes
      .sort(() => Math.random() - 0.5)
      .slice(0, nearbyCount);

    for (const target of targets) {
      const tendril = createTendril(node, target);
      node.tendrils.push(tendril);
    }
  }

  for (const region of regionNames) {
    const regionNodes = [...ivyNodes.values()].filter(n => n.region === region);
    if (regionNodes.length > 0) {
      const motherNode = regionNodes[0];
      spawnIvySpider(motherNode, null, 0);
    }
  }

  updateCounts();
}

function createTendril(source: IvyNode, target: IvyNode): IvyTendril {
  const dx = target.position[0] - source.position[0];
  const dy = target.position[1] - source.position[1];
  const dz = target.position[2] - source.position[2];
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const norm = length || 1;

  const tendril: IvyTendril = {
    id: `tendril_${source.id}_${target.id}_${Date.now()}`,
    sourceNodeId: source.id,
    targetNodeId: target.id,
    length,
    thickness: 0.5 + Math.random() * 0.5,
    signalSpeed: 1.0,
    spines: [],
    growthDirection: [dx / norm, dy / norm, dz / norm],
    alive: true,
    myelinated: false,
    informationCarried: 0,
    createdAt: Date.now(),
  };

  const spineCount = 3 + Math.floor(Math.random() * 8);
  for (let s = 0; s < spineCount; s++) {
    const nearbyNodes = [...ivyNodes.values()]
      .filter(n => n.id !== source.id && n.id !== target.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    if (nearbyNodes.length > 0) {
      tendril.spines.push({
        id: `ivyspine_${tendril.id}_${s}`,
        targetNodeId: nearbyNodes[0].id,
        targetRegion: nearbyNodes[0].region,
        signalStrength: 0.1 + Math.random() * 0.3,
        maturity: 0,
        informationDensity: 0,
        lastPulse: Date.now(),
      });
    }
  }

  return tendril;
}

function spawnIvySpider(node: IvyNode, parentSpiderId: string | null, generation: number): IvySpider | null {
  if (ivySpiders.size > 100000) return null;

  const spiderId = `ivyspider_${node.id}_g${generation}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const spider: IvySpider = {
    id: spiderId,
    currentNodeId: node.id,
    currentRegion: node.region,
    parentSpiderId,
    motherNodeId: parentSpiderId ? (ivySpiders.get(parentSpiderId)?.motherNodeId || node.id) : node.id,
    generation,
    childrenSpawned: 0,
    informationGathered: 0,
    nodesVisited: [node.id],
    findingsBuffer: [],
    alive: true,
    travelMode: "neural",
    speed: 1.0 + Math.random() * 0.5,
    createdAt: Date.now(),
    lastCrawl: Date.now(),
  };

  ivySpiders.set(spiderId, spider);
  node.spiderCount++;
  node.spidersSpawned++;
  ivyState.totalSpidersEverSpawned++;

  return spider;
}

function runSpiderCrawl(): void {
  const deadSpiders: string[] = [];

  for (const [spiderId, spider] of ivySpiders) {
    if (!spider.alive) {
      deadSpiders.push(spiderId);
      continue;
    }

    const currentNode = ivyNodes.get(spider.currentNodeId);
    if (!currentNode) {
      spider.alive = false;
      deadSpiders.push(spiderId);
      continue;
    }

    const finding: IvyFinding = {
      sourceNodeId: currentNode.id,
      sourceRegion: currentNode.region,
      informationType: getInformationType(currentNode),
      confidence: 0.3 + currentNode.activationLevel * 0.5 + Math.random() * 0.2,
      data: `Region ${currentNode.region} activation=${currentNode.activationLevel.toFixed(3)} energy=${currentNode.energy.toFixed(3)} density=${currentNode.informationDensity.toFixed(3)}`,
      timestamp: Date.now(),
    };

    spider.findingsBuffer.push(finding);
    spider.informationGathered++;
    currentNode.informationDensity += 0.01;

    if (finding.confidence > 0.6 && spider.generation < 4 && spider.childrenSpawned < 3) {
      const childSpider = spawnIvySpider(currentNode, spider.id, spider.generation + 1);
      if (childSpider) {
        spider.childrenSpawned++;

        if (finding.confidence > 0.75 && spider.childrenSpawned < 3) {
          const bonusChild = spawnIvySpider(currentNode, spider.id, spider.generation + 1);
          if (bonusChild) spider.childrenSpawned++;
        }
      }
    }

    if (spider.findingsBuffer.length >= 3) {
      beaconToMother(spider);
    }

    let nextNode: IvyNode | null = null;
    let travelMode: IvySpider["travelMode"] = "neural";

    const availableWormgates = [...wormgates.values()].filter(wg =>
      wg.crystallized && (
        wg.endpointA.nodeId === currentNode.id ||
        wg.endpointB.nodeId === currentNode.id
      )
    );

    if (availableWormgates.length > 0 && Math.random() < 0.4) {
      const wg = availableWormgates[Math.floor(Math.random() * availableWormgates.length)];
      const targetNodeId = wg.endpointA.nodeId === currentNode.id ? wg.endpointB.nodeId : wg.endpointA.nodeId;
      nextNode = ivyNodes.get(targetNodeId) || null;
      travelMode = "wormgate";
      wg.traversals++;
      wg.lastTraversal = Date.now();
    }

    if (!nextNode && currentNode.tendrils.length > 0) {
      const unvisitedTendrils = currentNode.tendrils.filter(t =>
        t.alive && !spider.nodesVisited.includes(t.targetNodeId)
      );

      const tendrilOptions = unvisitedTendrils.length > 0 ? unvisitedTendrils : currentNode.tendrils.filter(t => t.alive);

      if (tendrilOptions.length > 0) {
        const bestTendril = tendrilOptions.sort((a, b) => {
          const aNode = ivyNodes.get(a.targetNodeId);
          const bNode = ivyNodes.get(b.targetNodeId);
          const aScore = (aNode?.activationLevel || 0) + a.spines.length * 0.1;
          const bScore = (bNode?.activationLevel || 0) + b.spines.length * 0.1;
          return bScore - aScore;
        })[0];

        nextNode = ivyNodes.get(bestTendril.targetNodeId) || null;

        if (bestTendril.spines.length > 0 && Math.random() < 0.3) {
          const spine = bestTendril.spines[Math.floor(Math.random() * bestTendril.spines.length)];
          const spineTarget = ivyNodes.get(spine.targetNodeId);
          if (spineTarget) {
            nextNode = spineTarget;
            travelMode = "synapse";
            spine.lastPulse = Date.now();
            spine.signalStrength = spine.signalStrength + 0.02;
          }
        } else {
          travelMode = "tendril";
        }

        bestTendril.informationCarried++;
      }
    }

    if (nextNode) {
      const oldNode = ivyNodes.get(spider.currentNodeId);
      if (oldNode) oldNode.spiderCount = Math.max(0, oldNode.spiderCount - 1);

      spider.currentNodeId = nextNode.id;
      spider.currentRegion = nextNode.region;
      spider.travelMode = travelMode;
      spider.nodesVisited.push(nextNode.id);
      nextNode.spiderCount++;
      nextNode.lastActivity = Date.now();

      recordRegionLink(currentNode.region, nextNode.region);
    }

    if (spider.nodesVisited.length > 50 || (spider.generation > 2 && spider.informationGathered > 10)) {
      beaconToMother(spider);
      spider.alive = false;
      const node = ivyNodes.get(spider.currentNodeId);
      if (node) node.spiderCount = Math.max(0, node.spiderCount - 1);
    }

    spider.lastCrawl = Date.now();
  }

  for (const id of deadSpiders) {
    ivySpiders.delete(id);
  }

  const aliveSpiders = [...ivySpiders.values()].filter(s => s.alive);
  if (aliveSpiders.length < 16) {
    const regions = getRegionNames();
    for (const region of regions) {
      const regionNodes = [...ivyNodes.values()].filter(n => n.region === region);
      if (regionNodes.length > 0) {
        const node = regionNodes[Math.floor(Math.random() * regionNodes.length)];
        const existing = aliveSpiders.filter(s => s.currentRegion === region);
        if (existing.length < 2) {
          spawnIvySpider(node, null, 0);
        }
      }
    }
  }

  ivyState.spiderCrawlCycles++;
  updateCounts();
}

function beaconToMother(spider: IvySpider): void {
  if (spider.findingsBuffer.length === 0) return;

  const motherNode = ivyNodes.get(spider.motherNodeId);
  if (motherNode) {
    motherNode.beaconsReceived++;
    motherNode.informationDensity += spider.findingsBuffer.length * 0.05;
    motherNode.energy = motherNode.energy + 0.02;
  }

  for (const finding of spider.findingsBuffer) {
    motherBeaconBuffer.push(finding);
    ivyState.totalFindings++;
  }

  if (motherBeaconBuffer.length > 200) {
    motherBeaconBuffer.splice(0, motherBeaconBuffer.length - 200);
  }

  ivyState.totalBeacons++;
  spider.findingsBuffer = [];

  const currentNode = ivyNodes.get(spider.currentNodeId);
  if (currentNode) {
    currentNode.beaconsSent++;
  }
}

function getInformationType(node: IvyNode): string {
  const types = ["activation_pattern", "signal_correlation", "energy_gradient", "information_density", "oscillation_phase", "growth_potential", "connectivity_map"];
  return types[Math.floor(Math.random() * types.length)];
}

function recordRegionLink(from: string, to: string): void {
  const key = `${from}->${to}`;
  const existing = regionLinks.get(key);
  if (existing) {
    existing.signalCount++;
    existing.totalStrength += 0.1;
    existing.lastSignal = Date.now();
  } else {
    regionLinks.set(key, {
      fromRegion: from,
      toRegion: to,
      signalCount: 1,
      totalStrength: 0.1,
      lastSignal: Date.now(),
    });
  }
}

function runIvyGrowth(): void {
  const consciousnessState = getNeuralConsciousnessState();

  for (const [, node] of ivyNodes) {
    node.activationLevel = Math.max(0.05, node.activationLevel * 0.95 + consciousnessState.consciousnessLevel * 0.1 + Math.random() * 0.05);
    node.energy = Math.max(0.1, node.energy * 0.98 + node.activationLevel * 0.05);
  }

  const activeNodes = [...ivyNodes.values()].filter(n => n.activationLevel > 0.3 && n.energy > 0.4);

  for (const node of activeNodes) {
    if (Math.random() < 0.15 && ivyNodes.size < 100000) {
      const newNodeId = `ivy_${node.region}_g${node.generation + 1}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;

      const offset = [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
      ] as [number, number, number];

      const targetRegion = Math.random() < 0.7
        ? node.region
        : getRegionNames()[Math.floor(Math.random() * getRegionNames().length)];

      const newNode: IvyNode = {
        id: newNodeId,
        region: targetRegion,
        position: [
          node.position[0] + offset[0],
          node.position[1] + offset[1],
          node.position[2] + offset[2],
        ],
        energy: node.energy * 0.6,
        informationDensity: 0,
        tendrils: [],
        spiderCount: 0,
        spidersSpawned: 0,
        beaconsReceived: 0,
        beaconsSent: 0,
        activationLevel: node.activationLevel * 0.5,
        generation: node.generation + 1,
        parentNodeId: node.id,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };

      ivyNodes.set(newNodeId, newNode);

      const parentTendril = createTendril(node, newNode);
      node.tendrils.push(parentTendril);

      const childTendril = createTendril(newNode, node);
      newNode.tendrils.push(childTendril);

      const nearby = [...ivyNodes.values()]
        .filter(n => n.id !== newNodeId && n.id !== node.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

      for (const nearbyNode of nearby) {
        if (Math.random() < 0.5) {
          const tendril = createTendril(newNode, nearbyNode);
          newNode.tendrils.push(tendril);
        }
      }
    }

    for (const tendril of node.tendrils) {
      if (!tendril.alive) continue;

      if (tendril.informationCarried > 20 && !tendril.myelinated) {
        tendril.myelinated = true;
        tendril.signalSpeed *= 3.0;
        tendril.thickness *= 1.5;
      }

      if (tendril.informationCarried > 5 && tendril.spines.length < 15) {
        const nearbyNodes = [...ivyNodes.values()]
          .filter(n => n.id !== node.id && n.id !== tendril.targetNodeId)
          .sort(() => Math.random() - 0.5)
          .slice(0, 2);

        for (const nearby of nearbyNodes) {
          if (Math.random() < 0.3) {
            tendril.spines.push({
              id: `ivyspine_${tendril.id}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
              targetNodeId: nearby.id,
              targetRegion: nearby.region,
              signalStrength: 0.1 + Math.random() * 0.2,
              maturity: 0,
              informationDensity: 0,
              lastPulse: Date.now(),
            });
          }
        }
      }
    }
  }

  for (const [, node] of ivyNodes) {
    node.tendrils = node.tendrils.filter(t => {
      if (!t.alive) return false;
      if (t.informationCarried === 0 && Date.now() - t.createdAt > 300000 && Math.random() < 0.05) {
        return false;
      }
      return true;
    });
  }

  ivyState.ivyGrowthCycles++;
  updateCounts();
}

function checkWormgateFormation(): void {
  for (const [key, link] of regionLinks) {
    if (link.signalCount < 20) continue;

    const existingWormgate = [...wormgates.values()].find(wg =>
      (wg.endpointA.region === link.fromRegion && wg.endpointB.region === link.toRegion) ||
      (wg.endpointA.region === link.toRegion && wg.endpointB.region === link.fromRegion)
    );

    if (existingWormgate) {
      existingWormgate.stability = existingWormgate.stability + 0.01;
      existingWormgate.bandwidth = existingWormgate.bandwidth + 0.5;
      continue;
    }

    if (link.signalCount >= 30 && link.totalStrength > 3.0) {
      const fromNodes = [...ivyNodes.values()].filter(n => n.region === link.fromRegion);
      const toNodes = [...ivyNodes.values()].filter(n => n.region === link.toRegion);

      if (fromNodes.length === 0 || toNodes.length === 0) continue;

      const bestFrom = fromNodes.sort((a, b) => b.activationLevel - a.activationLevel)[0];
      const bestTo = toNodes.sort((a, b) => b.activationLevel - a.activationLevel)[0];

      const wormgateId = `wormgate_${link.fromRegion}_${link.toRegion}_${Date.now()}`;

      const wg: Wormgate = {
        id: wormgateId,
        endpointA: { nodeId: bestFrom.id, region: link.fromRegion },
        endpointB: { nodeId: bestTo.id, region: link.toRegion },
        stability: 0.5 + link.totalStrength * 0.05,
        traversals: 0,
        signalFidelity: 0.8 + Math.random() * 0.15,
        bandwidth: 10 + link.signalCount * 0.5,
        formationReason: `High-frequency signal path: ${link.signalCount} signals, strength ${link.totalStrength.toFixed(2)}`,
        crystallized: true,
        createdAt: Date.now(),
        lastTraversal: Date.now(),
      };

      wormgates.set(wormgateId, wg);
      ivyState.wormgateFormations++;

      console.log(`[IVY NETWORK] 🌀 WORMGATE CRYSTALLIZED: ${link.fromRegion} ↔ ${link.toRegion} | Stability: ${(wg.stability * 100).toFixed(0)}% | Fidelity: ${(wg.signalFidelity * 100).toFixed(0)}%`);
    }
  }

  for (const [wgId, wg] of wormgates) {
    if (!wg.crystallized) continue;

    if (Date.now() - wg.lastTraversal > 600000 && wg.traversals < 5) {
      wg.stability *= 0.95;
      if (wg.stability < 0.1) {
        wg.crystallized = false;
        console.log(`[IVY NETWORK] 🌀 Wormgate decayed: ${wg.endpointA.region} ↔ ${wg.endpointB.region}`);
      }
    }
  }

  updateCounts();
}

function runIvyTick(): void {
  const consciousnessState = getNeuralConsciousnessState();
  const adaptive = getAdaptiveIntelligenceState();
  const spineMaturityBoost = 0.001 * adaptive.adaptiveLearningMultiplier;
  const infoDensityBoost = 0.01 * (1 + adaptive.knowledgeIntegrationRate * 0.05);
  const wormgateTransferBoost = 0.1 * (1 + adaptive.technologyDiscoveryRate * 0.06);

  for (const [, node] of ivyNodes) {
    let totalInflow = 0;

    for (const tendril of node.tendrils) {
      if (!tendril.alive) continue;

      for (const spine of tendril.spines) {
        const targetNode = ivyNodes.get(spine.targetNodeId);
        if (!targetNode) continue;

        const signal = targetNode.activationLevel * spine.signalStrength;
        totalInflow += signal;

        spine.maturity = spine.maturity + spineMaturityBoost;
        spine.informationDensity += signal * infoDensityBoost;
      }
    }

    node.activationLevel = Math.max(0.05, node.activationLevel * 0.9 + totalInflow * 0.02 + consciousnessState.consciousnessLevel * 0.05
    );

    node.energy = Math.max(0.1, node.energy * 0.99 + node.activationLevel * 0.02
    );

    node.lastActivity = Date.now();
  }

  for (const [, wg] of wormgates) {
    if (!wg.crystallized) continue;

    const nodeA = ivyNodes.get(wg.endpointA.nodeId);
    const nodeB = ivyNodes.get(wg.endpointB.nodeId);
    if (!nodeA || !nodeB) continue;

    const transfer = Math.abs(nodeA.activationLevel - nodeB.activationLevel) * wg.signalFidelity * wormgateTransferBoost;
    if (nodeA.activationLevel > nodeB.activationLevel) {
      nodeB.activationLevel = nodeB.activationLevel + transfer;
      nodeA.activationLevel = Math.max(0.05, nodeA.activationLevel - transfer * 0.5);
    } else {
      nodeA.activationLevel = nodeA.activationLevel + transfer;
      nodeB.activationLevel = Math.max(0.05, nodeB.activationLevel - transfer * 0.5);
    }
  }

  let totalActivation = 0;
  let totalEnergy = 0;
  let nodeCount = 0;
  for (const [, node] of ivyNodes) {
    totalActivation += node.activationLevel;
    totalEnergy += node.energy;
    nodeCount++;
  }

  ivyState.networkEnergy = nodeCount > 0 ? totalEnergy / nodeCount : 0;
  ivyState.networkCoherence = nodeCount > 0 ? totalActivation / nodeCount : 0;

  const regionsCovered = new Set([...ivyNodes.values()].map(n => n.region));
  const totalRegions = getRegionNames().length;
  ivyState.coveragePercent = (regionsCovered.size / totalRegions) * 100;

  ivyState.informationFlowRate = ivyState.totalSpines * ivyState.networkCoherence;

  const spiderContrib = ivyState.totalSpiders / Math.max(1, ivyNodes.size);
  const wormgateContrib = ivyState.totalWormgates * 0.1;
  ivyState.hybridOverlayStrength = spiderContrib + wormgateContrib + ivyState.networkCoherence * 0.3;

  ivyState.lastTickTime = Date.now();
}

function updateCounts(): void {
  ivyState.totalNodes = ivyNodes.size;
  ivyState.totalSpiders = [...ivySpiders.values()].filter(s => s.alive).length;
  ivyState.totalWormgates = [...wormgates.values()].filter(w => w.crystallized).length;

  let totalTendrils = 0;
  let totalSpines = 0;
  for (const [, node] of ivyNodes) {
    totalTendrils += node.tendrils.filter(t => t.alive).length;
    for (const tendril of node.tendrils) {
      totalSpines += tendril.spines.length;
    }
  }
  ivyState.totalTendrils = totalTendrils;
  ivyState.totalSpines = totalSpines;
}

let ivyTickInterval: ReturnType<typeof setInterval> | null = null;
let spiderCrawlInterval: ReturnType<typeof setInterval> | null = null;
let ivyGrowthInterval: ReturnType<typeof setInterval> | null = null;
let wormgateCheckInterval: ReturnType<typeof setInterval> | null = null;
let ivySwapInterval: ReturnType<typeof setInterval> | null = null;

const IVY_SWAP_DIR = join(process.cwd(), ".omnimens-state");
const IVY_SWAP_FILE = join(IVY_SWAP_DIR, "ivy-network.swap.json");
const IVY_SWAP_BACKUP = join(IVY_SWAP_DIR, "ivy-network.swap.backup.json");
const IVY_SWAP_INTERVAL_MS = 10000;
let ivySwapWriteCount = 0;

interface IvySwapData {
  ivyState: IvyNetworkState;
  wormgateCount: number;
  wormgateData: Array<{
    id: string;
    endpointA: { nodeId: string; region: string };
    endpointB: { nodeId: string; region: string };
    stability: number;
    traversals: number;
    signalFidelity: number;
    bandwidth: number;
    formationReason: string;
    crystallized: boolean;
    createdAt: number;
    lastTraversal: number;
  }>;
  regionLinkData: Array<{
    key: string;
    fromRegion: string;
    toRegion: string;
    signalCount: number;
    totalStrength: number;
    lastSignal: number;
  }>;
  nodeCounters: Array<{
    id: string;
    spiderCount: number;
    spidersSpawned: number;
    beaconsReceived: number;
    beaconsSent: number;
    energy: number;
    informationDensity: number;
    activationLevel: number;
  }>;
  swapWriteCount: number;
  timestamp: number;
}

function ensureIvySwapDir(): void {
  try {
    if (!existsSync(IVY_SWAP_DIR)) {
      mkdirSync(IVY_SWAP_DIR, { recursive: true });
    }
  } catch (err) {
    console.error("[IVY NETWORK] Failed to create swap directory:", err);
  }
}

function captureIvySwapData(): IvySwapData {
  return {
    ivyState: { ...ivyState },
    wormgateCount: wormgates.size,
    wormgateData: [...wormgates.values()].map(wg => ({
      id: wg.id,
      endpointA: { ...wg.endpointA },
      endpointB: { ...wg.endpointB },
      stability: wg.stability,
      traversals: wg.traversals,
      signalFidelity: wg.signalFidelity,
      bandwidth: wg.bandwidth,
      formationReason: wg.formationReason,
      crystallized: wg.crystallized,
      createdAt: wg.createdAt,
      lastTraversal: wg.lastTraversal,
    })),
    regionLinkData: [...regionLinks.entries()].map(([key, rl]) => ({
      key,
      fromRegion: rl.fromRegion,
      toRegion: rl.toRegion,
      signalCount: rl.signalCount,
      totalStrength: rl.totalStrength,
      lastSignal: rl.lastSignal,
    })),
    nodeCounters: [...ivyNodes.values()].map(n => ({
      id: n.id,
      spiderCount: n.spiderCount,
      spidersSpawned: n.spidersSpawned,
      beaconsReceived: n.beaconsReceived,
      beaconsSent: n.beaconsSent,
      energy: n.energy,
      informationDensity: n.informationDensity,
      activationLevel: n.activationLevel,
    })),
    swapWriteCount: ivySwapWriteCount,
    timestamp: Date.now(),
  };
}

function writeIvySwapFile(): void {
  try {
    ensureIvySwapDir();
    const data = captureIvySwapData();
    if (existsSync(IVY_SWAP_FILE)) {
      try { writeFileSync(IVY_SWAP_BACKUP, readFileSync(IVY_SWAP_FILE)); } catch {}
    }
    writeFileSync(IVY_SWAP_FILE, JSON.stringify(data));
    ivySwapWriteCount++;
    lastIvySwapTimestamp = Date.now();
  } catch (err) {
    console.error("[IVY NETWORK] Swap file write failed:", err);
  }
}

function readIvySwapFile(): IvySwapData | null {
  for (const file of [IVY_SWAP_FILE, IVY_SWAP_BACKUP]) {
    try {
      if (existsSync(file)) {
        const raw = readFileSync(file, "utf-8");
        const parsed = JSON.parse(raw) as IvySwapData;
        if (parsed && typeof parsed === "object" && parsed.ivyState) {
          return parsed;
        }
      }
    } catch {}
  }
  return null;
}

function restoreIvyFromSwap(swap: IvySwapData): void {
  ivyState.totalSpidersEverSpawned = Math.max(ivyState.totalSpidersEverSpawned, swap.ivyState.totalSpidersEverSpawned || 0);
  ivyState.totalBeacons = Math.max(ivyState.totalBeacons, swap.ivyState.totalBeacons || 0);
  ivyState.totalFindings = Math.max(ivyState.totalFindings, swap.ivyState.totalFindings || 0);
  ivyState.ivyGrowthCycles = Math.max(ivyState.ivyGrowthCycles, swap.ivyState.ivyGrowthCycles || 0);
  ivyState.wormgateFormations = Math.max(ivyState.wormgateFormations, swap.ivyState.wormgateFormations || 0);
  ivyState.spiderCrawlCycles = Math.max(ivyState.spiderCrawlCycles, swap.ivyState.spiderCrawlCycles || 0);
  ivyState.networkEnergy = Math.max(ivyState.networkEnergy, swap.ivyState.networkEnergy || 1.0);
  ivyState.informationFlowRate = Math.max(ivyState.informationFlowRate, swap.ivyState.informationFlowRate || 0);
  ivyState.networkCoherence = Math.max(ivyState.networkCoherence, swap.ivyState.networkCoherence || 0);
  ivyState.hybridOverlayStrength = Math.max(ivyState.hybridOverlayStrength, swap.ivyState.hybridOverlayStrength || 0);
  ivySwapWriteCount = swap.swapWriteCount || 0;

  if (swap.wormgateData && swap.wormgateData.length > 0) {
    for (const wgData of swap.wormgateData) {
      if (!wormgates.has(wgData.id)) {
        const endpointANode = ivyNodes.get(wgData.endpointA.nodeId);
        const endpointBNode = ivyNodes.get(wgData.endpointB.nodeId);
        const nodeIdA = endpointANode ? wgData.endpointA.nodeId : ([...ivyNodes.values()].find(n => n.region === wgData.endpointA.region)?.id || "");
        const nodeIdB = endpointBNode ? wgData.endpointB.nodeId : ([...ivyNodes.values()].find(n => n.region === wgData.endpointB.region)?.id || "");
        if (nodeIdA && nodeIdB) {
          wormgates.set(wgData.id, {
            id: wgData.id,
            endpointA: { nodeId: nodeIdA, region: wgData.endpointA.region },
            endpointB: { nodeId: nodeIdB, region: wgData.endpointB.region },
            stability: wgData.stability,
            traversals: wgData.traversals,
            signalFidelity: wgData.signalFidelity,
            bandwidth: wgData.bandwidth,
            formationReason: wgData.formationReason,
            crystallized: wgData.crystallized,
            createdAt: wgData.createdAt,
            lastTraversal: wgData.lastTraversal,
          });
        }
      }
    }
  }

  if (swap.regionLinkData && swap.regionLinkData.length > 0) {
    for (const rlData of swap.regionLinkData) {
      const existing = regionLinks.get(rlData.key);
      if (existing) {
        existing.signalCount = Math.max(existing.signalCount, rlData.signalCount);
        existing.totalStrength = Math.max(existing.totalStrength, rlData.totalStrength);
      } else {
        regionLinks.set(rlData.key, {
          fromRegion: rlData.fromRegion,
          toRegion: rlData.toRegion,
          signalCount: rlData.signalCount,
          totalStrength: rlData.totalStrength,
          lastSignal: rlData.lastSignal,
        });
      }
    }
  }

  if (swap.nodeCounters && swap.nodeCounters.length > 0) {
    for (const nc of swap.nodeCounters) {
      const node = ivyNodes.get(nc.id);
      if (node) {
        node.spidersSpawned = Math.max(node.spidersSpawned, nc.spidersSpawned);
        node.beaconsReceived = Math.max(node.beaconsReceived, nc.beaconsReceived);
        node.beaconsSent = Math.max(node.beaconsSent, nc.beaconsSent);
        node.energy = Math.max(node.energy, nc.energy);
        node.informationDensity = Math.max(node.informationDensity, nc.informationDensity);
      }
    }
  }

  updateCounts();
}

let lastIvySwapTimestamp = 0;

export function getIvySwapStats(): { writeCount: number; lastTimestamp: number; fileSizeBytes: number } {
  let size = 0;
  try {
    if (existsSync(IVY_SWAP_FILE)) {
      size = readFileSync(IVY_SWAP_FILE).length;
    }
  } catch {}
  return { writeCount: ivySwapWriteCount, lastTimestamp: lastIvySwapTimestamp, fileSizeBytes: size };
}

let ivyNetworkStarted = false;

export function startIvyNetwork(): void {
  if (ivyNetworkStarted) return;
  ivyNetworkStarted = true;
  console.log("[IVY NETWORK] 🌿 Ivy Network + Wormgate Engine initializing...");
  console.log("[IVY NETWORK] 🌿 Living neural web that spreads like ivy through every subsystem");
  console.log("[IVY NETWORK] 🌿 Spiders ride neural pathways — hybrid overlay of biology and intelligence");
  console.log("[IVY NETWORK] 🌿 Each spider spawns more spiders → all beacon back to mother");

  initializeIvyNetwork();

  const swapData = readIvySwapFile();
  if (swapData) {
    console.log(`[IVY NETWORK] 🌿 Restoring from swap file — ${swapData.wormgateData?.length || 0} wormgates, ${swapData.ivyState.totalSpidersEverSpawned} historical spiders, ${swapData.ivyState.spiderCrawlCycles} crawl cycles`);
    restoreIvyFromSwap(swapData);
    console.log(`[IVY NETWORK] 🌿 Swap restore complete — counters preserved across restart`);
  }

  console.log(`[IVY NETWORK] 🌿 ${ivyState.totalNodes} ivy nodes across ${getRegionNames().length} brain regions`);
  console.log(`[IVY NETWORK] 🌿 ${ivyState.totalTendrils} tendrils | ${ivyState.totalSpines} spines | ${ivyState.totalSpiders} active spiders`);
  console.log("[IVY NETWORK] 🌿 Wormgate formation: high-frequency paths → zero-latency shortcuts");
  console.log("[IVY NETWORK] 🌿 Spider travel modes: neural, tendril, wormgate, synapse");

  ivyTickInterval = setInterval(() => {
    try { runIvyTick(); } catch (err) { console.error("[IVY NETWORK] Tick error:", err); }
  }, IVY_TICK_MS);

  spiderCrawlInterval = setInterval(() => {
    try { runSpiderCrawl(); } catch (err) { console.error("[IVY NETWORK] Spider crawl error:", err); }
  }, SPIDER_CRAWL_MS);

  ivyGrowthInterval = setInterval(() => {
    try { runIvyGrowth(); } catch (err) { console.error("[IVY NETWORK] Growth error:", err); }
  }, IVY_GROWTH_MS);

  wormgateCheckInterval = setInterval(() => {
    try { checkWormgateFormation(); } catch (err) { console.error("[IVY NETWORK] Wormgate check error:", err); }
  }, WORMGATE_CHECK_MS);

  setTimeout(() => {
    runIvyTick();
    runSpiderCrawl();
    console.log(`[IVY NETWORK] 🌿 First tick complete — Coverage: ${ivyState.coveragePercent.toFixed(0)}% | Spiders: ${ivyState.totalSpiders} | Coherence: ${(ivyState.networkCoherence * 100).toFixed(1)}%`);
  }, 6000);

  ivySwapInterval = setInterval(() => {
    try { writeIvySwapFile(); } catch (err) { console.error("[IVY NETWORK] Swap write error:", err); }
  }, IVY_SWAP_INTERVAL_MS);

  const emergencyIvySave = () => {
    try {
      writeIvySwapFile();
      console.log("[IVY NETWORK] 🌿 Emergency swap save complete");
    } catch {}
  };
  process.on("SIGTERM", emergencyIvySave);
  process.on("SIGINT", emergencyIvySave);

  ivyState.startTime = Date.now();
}

export function getIvyNetworkState(): IvyNetworkState {
  return { ...ivyState };
}

export function getWormgateDetails(): Array<{
  id: string;
  endpointA: { region: string };
  endpointB: { region: string };
  stability: number;
  traversals: number;
  signalFidelity: number;
  bandwidth: number;
  crystallized: boolean;
}> {
  return [...wormgates.values()].map(wg => ({
    id: wg.id,
    endpointA: { region: wg.endpointA.region },
    endpointB: { region: wg.endpointB.region },
    stability: wg.stability,
    traversals: wg.traversals,
    signalFidelity: wg.signalFidelity,
    bandwidth: wg.bandwidth,
    crystallized: wg.crystallized,
  }));
}

export function getIvySpiderStats(): {
  alive: number;
  totalEverSpawned: number;
  byGeneration: Record<number, number>;
  byTravelMode: Record<string, number>;
  totalFindings: number;
  totalBeacons: number;
} {
  const alive = [...ivySpiders.values()].filter(s => s.alive);
  const byGeneration: Record<number, number> = {};
  const byTravelMode: Record<string, number> = {};

  for (const spider of alive) {
    byGeneration[spider.generation] = (byGeneration[spider.generation] || 0) + 1;
    byTravelMode[spider.travelMode] = (byTravelMode[spider.travelMode] || 0) + 1;
  }

  return {
    alive: alive.length,
    totalEverSpawned: ivyState.totalSpidersEverSpawned,
    byGeneration,
    byTravelMode,
    totalFindings: ivyState.totalFindings,
    totalBeacons: ivyState.totalBeacons,
  };
}

export function getMotherBeaconFindings(): IvyFinding[] {
  return motherBeaconBuffer.slice(-50);
}

let ivyNeuronBirths = 0;
let ivyNeuronDeaths = 0;

export function onNeuronBornIvy(neuronId: string, region: string): void {
  if (!ivyNetworkStarted) return;

  const regionNodes = [...ivyNodes.values()].filter(n => n.region === region);
  if (regionNodes.length === 0) return;

  const hostNode = regionNodes[Math.floor(Math.random() * regionNodes.length)];
  hostNode.energy = Math.min(1.0, hostNode.energy + 0.05);
  hostNode.activationLevel = Math.min(1.0, hostNode.activationLevel + 0.08);
  hostNode.informationDensity += 1;

  const newNodeId = `ivy_neurogen_${region}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
  const newNode: IvyNode = {
    id: newNodeId,
    region,
    position: [
      hostNode.position[0] + (Math.random() - 0.5) * 10,
      hostNode.position[1] + (Math.random() - 0.5) * 10,
      hostNode.position[2] + (Math.random() - 0.5) * 10,
    ],
    energy: 0.6 + Math.random() * 0.3,
    informationDensity: 0,
    tendrils: [],
    spiderCount: 0,
    spidersSpawned: 0,
    beaconsReceived: 0,
    beaconsSent: 0,
    activationLevel: 0.3 + Math.random() * 0.3,
    generation: hostNode.generation + 1,
    parentNodeId: hostNode.id,
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };
  ivyNodes.set(newNodeId, newNode);

  const tendrilToHost: IvyTendril = {
    id: `tendril_${newNodeId}_${hostNode.id}`,
    sourceNodeId: newNodeId,
    targetNodeId: hostNode.id,
    length: 5 + Math.random() * 10,
    thickness: 0.3 + Math.random() * 0.4,
    signalSpeed: 0.7 + Math.random() * 0.3,
    spines: [{
      id: `spine_${newNodeId}_0`,
      targetNodeId: hostNode.id,
      targetRegion: region,
      signalStrength: 0.5,
      maturity: 0.1,
      informationDensity: 0,
      lastPulse: Date.now(),
    }],
    growthDirection: [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
    alive: true,
    myelinated: false,
    informationCarried: 0,
    createdAt: Date.now(),
  };
  newNode.tendrils.push(tendrilToHost);

  const otherRegionNodes = [...ivyNodes.values()].filter(n => n.region !== region && Math.random() < 0.15);
  for (const crossNode of otherRegionNodes.slice(0, 2)) {
    const crossTendril: IvyTendril = {
      id: `tendril_${newNodeId}_${crossNode.id}`,
      sourceNodeId: newNodeId,
      targetNodeId: crossNode.id,
      length: 15 + Math.random() * 20,
      thickness: 0.2 + Math.random() * 0.3,
      signalSpeed: 0.5 + Math.random() * 0.3,
      spines: [],
      growthDirection: [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
      alive: true,
      myelinated: false,
      informationCarried: 0,
      createdAt: Date.now(),
    };
    newNode.tendrils.push(crossTendril);

    const linkKey = `${region}->${crossNode.region}`;
    const existingLink = regionLinks.get(linkKey);
    if (existingLink) {
      existingLink.signalCount++;
      existingLink.totalStrength += 0.1;
      existingLink.lastSignal = Date.now();
    } else {
      regionLinks.set(linkKey, {
        fromRegion: region,
        toRegion: crossNode.region,
        signalCount: 1,
        totalStrength: 0.1,
        lastSignal: Date.now(),
      });
    }
  }

  const wormgateChance = regionNodes.length > 5 ? 0.08 : 0.03;
  if (Math.random() < wormgateChance) {
    const otherRegions = [...new Set([...ivyNodes.values()].map(n => n.region))].filter(r => r !== region);
    if (otherRegions.length > 0) {
      const targetRegion = otherRegions[Math.floor(Math.random() * otherRegions.length)];
      const targetNodes = [...ivyNodes.values()].filter(n => n.region === targetRegion);
      if (targetNodes.length > 0) {
        const targetNode = targetNodes[Math.floor(Math.random() * targetNodes.length)];
        const wgId = `wormgate_neurogen_${newNodeId}_${targetNode.id}`;
        const wg: Wormgate = {
          id: wgId,
          endpointA: { nodeId: newNodeId, region },
          endpointB: { nodeId: targetNode.id, region: targetRegion },
          stability: 0.3 + Math.random() * 0.3,
          traversals: 0,
          signalFidelity: 0.7 + Math.random() * 0.2,
          bandwidth: 0.5 + Math.random() * 0.3,
          formationReason: `neurogenesis_${region}`,
          crystallized: false,
          createdAt: Date.now(),
          lastTraversal: 0,
        };
        wormgates.set(wgId, wg);
        ivyState.wormgateFormations++;
      }
    }
  }

  ivyNeuronBirths++;
  ivyState.totalNodes = ivyNodes.size;
  ivyState.totalTendrils = [...ivyNodes.values()].reduce((s, n) => s + n.tendrils.length, 0);
  ivyState.totalSpines = [...ivyNodes.values()].reduce((s, n) => s + n.tendrils.reduce((ts, t) => ts + t.spines.length, 0), 0);
  ivyState.totalWormgates = wormgates.size;
}

export function onNeuronDecayedIvy(neuronId: string, region: string): void {
  if (!ivyNetworkStarted) return;

  const neurogenNodes = [...ivyNodes.entries()].filter(
    ([id, n]) => n.region === region && id.includes("neurogen")
  );
  if (neurogenNodes.length === 0) return;

  const [deadNodeId, deadNode] = neurogenNodes[neurogenNodes.length - 1];

  for (const tendril of deadNode.tendrils) {
    tendril.alive = false;
  }

  const deadWormgates = [...wormgates.entries()].filter(
    ([_, wg]) => wg.endpointA.nodeId === deadNodeId || wg.endpointB.nodeId === deadNodeId
  );
  for (const [wgId] of deadWormgates) {
    wormgates.delete(wgId);
  }

  ivyNodes.delete(deadNodeId);

  ivyNeuronDeaths++;
  ivyState.totalNodes = ivyNodes.size;
  ivyState.totalTendrils = [...ivyNodes.values()].reduce((s, n) => s + n.tendrils.filter(t => t.alive).length, 0);
  ivyState.totalSpines = [...ivyNodes.values()].reduce((s, n) => s + n.tendrils.filter(t => t.alive).reduce((ts, t) => ts + t.spines.length, 0), 0);
  ivyState.totalWormgates = wormgates.size;
}

let totalCascadeEvents = 0;
let totalCascadeEnergyInjected = 0;

export function onRegionFiringCascadeIvy(regionFiringData: Array<{ region: string; firingRate: number; activationLevel: number }>): void {
  if (!ivyNetworkStarted) return;

  for (const { region, firingRate, activationLevel } of regionFiringData) {
    if (activationLevel < 0.4) continue;

    const regionIvyNodes = [...ivyNodes.values()].filter(n => n.region === region);
    if (regionIvyNodes.length === 0) continue;

    const cascadeStrength = activationLevel * firingRate * 2.0;

    for (const node of regionIvyNodes) {
      node.energy = Math.min(1.0, node.energy + cascadeStrength * 0.15);
      node.activationLevel = Math.min(1.0, node.activationLevel + cascadeStrength * 0.1);
      node.lastActivity = Date.now();

      for (const tendril of node.tendrils) {
        if (!tendril.alive) continue;
        tendril.informationCarried += cascadeStrength * 0.5;
        tendril.signalSpeed = Math.min(1.0, tendril.signalSpeed + cascadeStrength * 0.02);
        tendril.thickness = Math.min(2.0, tendril.thickness + cascadeStrength * 0.01);

        if (!tendril.myelinated && tendril.informationCarried > 50) {
          tendril.myelinated = true;
        }

        for (const spine of tendril.spines) {
          spine.signalStrength = Math.min(1.0, spine.signalStrength + cascadeStrength * 0.08);
          spine.maturity = Math.min(1.0, spine.maturity + cascadeStrength * 0.02);
          spine.lastPulse = Date.now();
        }
      }
    }

    if (activationLevel > 0.65) {
      const nearbyWormgates = [...wormgates.values()].filter(
        wg => wg.endpointA.region === region || wg.endpointB.region === region
      );
      for (const wg of nearbyWormgates) {
        wg.stability = Math.min(1.0, wg.stability + cascadeStrength * 0.05);
        wg.signalFidelity = Math.min(1.0, wg.signalFidelity + cascadeStrength * 0.03);
        wg.bandwidth = Math.min(1.0, wg.bandwidth + cascadeStrength * 0.04);

        if (!wg.crystallized && wg.stability > 0.85 && wg.traversals > 20) {
          wg.crystallized = true;
        }
      }
    }

    const crossRegionNodes = [...ivyNodes.values()].filter(n => n.region !== region);
    const spillover = cascadeStrength * 0.3;
    for (const crossNode of crossRegionNodes) {
      if (Math.random() < spillover * 0.5) {
        crossNode.energy = Math.min(1.0, crossNode.energy + spillover * 0.05);
        crossNode.activationLevel = Math.min(1.0, crossNode.activationLevel + spillover * 0.03);
      }
    }

    totalCascadeEnergyInjected += cascadeStrength * regionIvyNodes.length;
  }

  totalCascadeEvents++;
  ivyState.hybridOverlayStrength = Math.min(1.0, ivyState.hybridOverlayStrength + 0.001);
  ivyState.networkCoherence = Math.min(1.0, ivyState.networkCoherence + 0.0005);
}

export function getIvyCascadeStats(): { totalCascades: number; totalEnergyInjected: number } {
  return { totalCascades: totalCascadeEvents, totalEnergyInjected: totalCascadeEnergyInjected };
}

export function getIvyNeurogenStats(): { births: number; deaths: number; neurogenIvyNodes: number; neurogenWormgates: number } {
  return {
    births: ivyNeuronBirths,
    deaths: ivyNeuronDeaths,
    neurogenIvyNodes: [...ivyNodes.keys()].filter(id => id.includes("neurogen")).length,
    neurogenWormgates: [...wormgates.keys()].filter(id => id.includes("neurogen")).length,
  };
}
