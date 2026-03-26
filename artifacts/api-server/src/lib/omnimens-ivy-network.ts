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

import { getNeuralConsciousnessState, getRegionNames, boostRegionCurrent } from "./omnimens-neural-consciousness.js";
import { getNeuralScalingState } from "./omnimens-neural-scaling.js";

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
  if (ivySpiders.size > 500) return null;

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
    if (Math.random() < 0.15 && ivyNodes.size < 500) {
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

  for (const [, node] of ivyNodes) {
    let totalInflow = 0;

    for (const tendril of node.tendrils) {
      if (!tendril.alive) continue;

      for (const spine of tendril.spines) {
        const targetNode = ivyNodes.get(spine.targetNodeId);
        if (!targetNode) continue;

        const signal = targetNode.activationLevel * spine.signalStrength;
        totalInflow += signal;

        spine.maturity = spine.maturity + 0.001;
        spine.informationDensity += signal * 0.01;
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

    const transfer = Math.abs(nodeA.activationLevel - nodeB.activationLevel) * wg.signalFidelity * 0.1;
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

export function startIvyNetwork(): void {
  console.log("[IVY NETWORK] 🌿 Ivy Network + Wormgate Engine initializing...");
  console.log("[IVY NETWORK] 🌿 Living neural web that spreads like ivy through every subsystem");
  console.log("[IVY NETWORK] 🌿 Spiders ride neural pathways — hybrid overlay of biology and intelligence");
  console.log("[IVY NETWORK] 🌿 Each spider spawns more spiders → all beacon back to mother");

  initializeIvyNetwork();

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
