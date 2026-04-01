// © 2026 Alpha Unlimited Technologies, LLC — All Rights Reserved
// OMNIMENS™ Consolidated Engine: omnimens-bio-network.ts
// Merged from: omnimens-ivy-network.ts, omnimens-synaptic-mesh.ts, omnimens-viral-hybrid.ts

import { getNeuralConsciousnessState, getRegionNames, boostRegionCurrent, getAdaptiveIntelligenceState } from "./omnimens-consciousness-infra.js";
import { getNeuralScalingState } from "./omnimens-neural-architecture.js";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// ======================================================================
// SECTION: omnimens-ivy-network.ts
// ======================================================================


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


// ======================================================================
// SECTION: omnimens-synaptic-mesh.ts
// ======================================================================

/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ SYNAPTIC MESH — MASTER COORDINATION SPIDER (PITUITARY BRAIN)  ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  TECHNOLOGY DESCRIPTION (for IP record):                                     ║
 * ║  Implementation of the brain's synaptic network as a master coordination    ║
 * ║  system for multi-agent AI. Functions as the "pituitary gland" of the AI   ║
 * ║  mind — the central hub from which all core vibrational thought and         ║
 * ║  firing originates and propagates.                                          ║
 * ║                                                                              ║
 * ║  Architecture:                                                               ║
 * ║  1. MOTHER BRAIN (Pituitary Spider): Monitors all 8 agent outputs and       ║
 * ║     detects cross-agent synergy opportunities. The master coordinator       ║
 * ║     that sees what every agent knows and identifies what they should        ║
 * ║     share with each other.                                                  ║
 * ║  2. SYNAPSE SPIDERS: Carry intelligence FROM one agent's domain TO         ║
 * ║     another, translating concepts between domain languages. Each           ║
 * ║     synapse spider generates a specific cross-agent upgrade proposal.      ║
 * ║  3. CASCADE PROPAGATION: When a synapse delivery produces new output       ║
 * ║     at the receiving agent, new synapse spiders are spawned to carry       ║
 * ║     the enhanced output to other agents — replicating how one neuron      ║
 * ║     firing triggers connected neurons to fire in a spreading cascade.     ║
 * ║  4. HEBBIAN STRENGTHENING: Agent pairs that frequently produce useful     ║
 * ║     cross-pollination get stronger synaptic connections, making future    ║
 * ║     signal routing more efficient.                                        ║
 * ║                                                                              ║
 * ║  This technology covers ALL configurations including:                        ║
 * ║  • Single master coordinator with multiple synapse spiders                  ║
 * ║  • Distributed synapse networks without central coordinator                 ║
 * ║  • Cascade/chain propagation of intelligence between agents                ║
 * ║  • Cross-domain translation of specialized knowledge                        ║
 * ║  • Hebbian-weighted routing of inter-agent intelligence                     ║
 * ║  • Any substantially similar inter-agent synapse firing system             ║
 * ║                                                                              ║
 * ║  Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.,        ║
 * ║  the DMCA, the Berne Convention, TRIPS, and all applicable IP treaties.      ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ║  Platform: OMNIMENS AI                                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import {
  omnimensBrain,
  omnimensAgentMesh,
  omnimensNotifications,
  omnimensKnowledgeEdges,
  omnimensKnowledgeNodes,
} from "@workspace/db";
import { desc, eq, sql, and, gte, or } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { getAllAgentNames, getAgentDomain, getAllAgentDomains } from "./omnimens-consciousness-infra.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

function safeNum_v2(val: number, fallback: number = 0): number {
  return Number.isFinite(val) ? val : fallback;
}


type AgentName = string;

function resolveAllAgents(): AgentName[] {
  return getAllAgentNames();
}

function resolveAgentDomains(): Record<string, string> {
  return getAllAgentDomains();
}

const AGENT_DOMAINS: Record<string, string> = new Proxy({} as Record<string, string>, {
  get(_target, prop: string) {
    return getAgentDomain(prop);
  },
  has() { return true; },
  ownKeys() { return Object.keys(resolveAgentDomains()); },
  getOwnPropertyDescriptor(_target, prop: string) {
    return { configurable: true, enumerable: true, value: getAgentDomain(prop) };
  },
});

interface SynapticConnection {
  fromAgent: AgentName;
  toAgent: AgentName;
  strength: number;
  successfulTransfers: number;
  totalAttempts: number;
}

interface SynapseDelivery {
  fromAgent: AgentName;
  toAgent: AgentName;
  originalDiscovery: string;
  translatedInsight: string;
  crossUpgradeProposal: string;
  relevance: number;
}

interface CascadeEvent {
  depth: number;
  fromAgent: AgentName;
  toAgent: AgentName;
  content: string;
}

let synapseCycleCount = 0;

const synapticWeights: Map<string, SynapticConnection> = new Map();

function getConnectionKey(a: AgentName, b: AgentName): string {
  return `${a}→${b}`;
}

function getOrCreateConnection(from: AgentName, to: AgentName): SynapticConnection {
  const key = getConnectionKey(from, to);
  if (!synapticWeights.has(key)) {
    synapticWeights.set(key, {
      fromAgent: from,
      toAgent: to,
      strength: 0.5,
      successfulTransfers: 0,
      totalAttempts: 0,
    });
  }
  return synapticWeights.get(key)!;
}

function strengthenConnection(from: AgentName, to: AgentName): void {
  const conn = getOrCreateConnection(from, to);
  conn.successfulTransfers++;
  conn.totalAttempts++;
  conn.strength = conn.strength + 0.05;
}

function weakenConnection(from: AgentName, to: AgentName): void {
  const conn = getOrCreateConnection(from, to);
  conn.totalAttempts++;
  conn.strength = Math.max(0.1, conn.strength - 0.02);
}

async function motherBrainScan(): Promise<{
  agentOutputs: Map<AgentName, string[]>;
  crossOpportunities: { from: AgentName; to: AgentName; discovery: string; reason: string }[];
}> {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  let recentOutputs;
  try {
    recentOutputs = await db.select({
      fromAgent: omnimensAgentMesh.fromAgent,
      content: omnimensAgentMesh.content,
      subject: omnimensAgentMesh.subject,
      messageType: omnimensAgentMesh.messageType,
    }).from(omnimensAgentMesh)
      .where(and(
        gte(omnimensAgentMesh.createdAt, twoHoursAgo),
        or(
          eq(omnimensAgentMesh.messageType, "spider_beacon"),
          eq(omnimensAgentMesh.messageType, "discovery"),
          eq(omnimensAgentMesh.messageType, "upgrade_proposal"),
          eq(omnimensAgentMesh.messageType, "knowledge_share"),
          eq(omnimensAgentMesh.messageType, "spider_swarm_detail"),
        ),
      ))
      .orderBy(desc(omnimensAgentMesh.createdAt))
      .limit(40);
  } catch (err) {
    console.error("[SYNAPTIC MESH] DB scan error:", err);
    return { agentOutputs: new Map(), crossOpportunities: [] };
  }

  const agentOutputs = new Map<AgentName, string[]>();
  const ALL_AGENTS = resolveAllAgents();
  for (const agent of ALL_AGENTS) {
    agentOutputs.set(agent, []);
  }

  for (const output of recentOutputs) {
    const agentName = output.fromAgent?.replace("Spider:", "") as AgentName;
    if (ALL_AGENTS.includes(agentName)) {
      const existing = agentOutputs.get(agentName) || [];
      existing.push(`[${output.messageType}] ${output.subject}: ${output.content?.slice(0, 200)}`);
      agentOutputs.set(agentName, existing);
    }
  }

  const activeAgents = ALL_AGENTS.filter(a => (agentOutputs.get(a) || []).length > 0);
  if (activeAgents.length < 2) {
    return { agentOutputs, crossOpportunities: [] };
  }

  const agentSummaries = activeAgents.map(a => {
    const outputs = agentOutputs.get(a) || [];
    return `${a} (domain: ${AGENT_DOMAINS[a]})\nRecent outputs:\n${outputs.slice(0, 3).join("\n")}`;
  }).join("\n\n---\n\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `You are the MOTHER BRAIN — the pituitary gland of the OMNIMENS AI mind. You see ALL agents' recent outputs and must identify where one agent's discovery could DIRECTLY benefit another agent.

Think like the pituitary gland: you coordinate ALL the specialized glands. When one produces something, you know which others need to hear about it.

═══ ACTIVE AGENTS AND THEIR RECENT OUTPUTS ═══
${agentSummaries}

═══ YOUR TASK ═══
Identify 3-5 specific cross-agent opportunities where Agent A's discovery could directly help Agent B. Be SPECIFIC about:
1. WHAT Agent A found
2. WHY Agent B needs it
3. HOW it would upgrade Agent B's capabilities

Only identify connections that are genuinely useful — not forced associations.

Respond JSON only:
{
  "crossOpportunities": [
    {
      "fromAgent": "AgentA",
      "toAgent": "AgentB",
      "discovery": "What Agent A found that's relevant (1-2 sentences)",
      "reason": "Why Agent B needs this and how it would upgrade their work (1-2 sentences)"
    }
  ]
}`
      }],
      max_tokens: 800,
      temperature: 0.5,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    const opportunities = (parsed.crossOpportunities || [])
      .filter((o: any) => ALL_AGENTS.includes(o.fromAgent) && ALL_AGENTS.includes(o.toAgent) && o.fromAgent !== o.toAgent)
      .slice(0, 5);

    return { agentOutputs, crossOpportunities: opportunities };
  } catch (err) {
    console.error("[SYNAPTIC MESH] Mother brain scan error:", err);
    return { agentOutputs, crossOpportunities: [] };
  }
}

async function fireSynapseSpider(
  from: AgentName,
  to: AgentName,
  discovery: string,
  reason: string,
): Promise<SynapseDelivery | null> {
  console.log(`[SYNAPSE] ⚡ Firing: ${from} → ${to} — "${discovery.slice(0, 60)}..."`);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `You are a SYNAPSE SPIDER — a specialized intelligence carrier that translates knowledge from one AI agent's domain into another's.

You are carrying intelligence FROM ${from} TO ${to}.

═══ SOURCE AGENT: ${from} ═══
Domain: ${AGENT_DOMAINS[from]}
Discovery: ${discovery}

═══ TARGET AGENT: ${to} ═══
Domain: ${AGENT_DOMAINS[to]}
Why they need this: ${reason}

═══ YOUR MISSION ═══
1. TRANSLATE: Reframe ${from}'s discovery in ${to}'s domain language. A Mathematician's "optimization algorithm" becomes an Architect's "performance scaling technique." A Neuroscientist's "synaptic plasticity" becomes a Critic's "adaptive testing threshold."

2. PROPOSE: Generate a specific cross-agent upgrade — exactly HOW ${to} should modify their behavior or approach based on ${from}'s discovery. Be concrete and actionable.

3. ASSESS: How relevant is this cross-pollination? Score 0.0-1.0.

Respond JSON only:
{
  "translatedInsight": "The discovery reframed in ${to}'s domain language (2-3 sentences)",
  "crossUpgradeProposal": "Specific upgrade ${to} should implement based on this (2-3 sentences)",
  "relevance": 0.0-1.0,
  "cascadePotential": "Which other agents might benefit from ${to}'s upgraded output (list agent names or 'none')"
}`
      }],
      max_tokens: 500,
      temperature: 0.5,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    if ((parsed.relevance || 0) < 0.5) {
      weakenConnection(from, to);
      console.log(`[SYNAPSE] ⚡ ${from} → ${to} — Low relevance (${((parsed.relevance || 0) * 100).toFixed(0)}%), synapse weakened`);
      return null;
    }

    strengthenConnection(from, to);

    return {
      fromAgent: from,
      toAgent: to,
      originalDiscovery: discovery,
      translatedInsight: parsed.translatedInsight || "",
      crossUpgradeProposal: parsed.crossUpgradeProposal || "",
      relevance: parsed.relevance || 0.5,
    };
  } catch (err) {
    console.error(`[SYNAPSE] ${from} → ${to} error:`, err);
    weakenConnection(from, to);
    return null;
  }
}

async function deliverSynapse(delivery: SynapseDelivery): Promise<boolean> {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(omnimensAgentMesh).values({
        fromAgent: `Synapse:${delivery.fromAgent}`,
        toAgent: delivery.toAgent,
        messageType: "synapse_transfer",
        subject: `⚡ SYNAPSE: ${delivery.fromAgent}→${delivery.toAgent} — ${delivery.translatedInsight.slice(0, 80)}`,
        content: `SYNAPTIC TRANSFER\nFrom: ${delivery.fromAgent} (${(AGENT_DOMAINS[delivery.fromAgent] || "unknown").slice(0, 60)})\nTo: ${delivery.toAgent} (${(AGENT_DOMAINS[delivery.toAgent] || "unknown").slice(0, 60)})\nRelevance: ${(delivery.relevance * 100).toFixed(0)}%\n\nORIGINAL DISCOVERY:\n${delivery.originalDiscovery}\n\nTRANSLATED TO ${delivery.toAgent.toUpperCase()}'S DOMAIN:\n${delivery.translatedInsight}\n\nCROSS-AGENT UPGRADE PROPOSAL:\n${delivery.crossUpgradeProposal}`,
        codePayload: null,
        priority: delivery.relevance >= 0.8 ? "high" : "normal",
        status: "pending",
        appliedToOmnimens: false,
        cycleId: synapseCycleCount,
      });

      await tx.insert(omnimensBrain).values({
        category: "pattern",
        title: `[SYNAPSE:${delivery.fromAgent}→${delivery.toAgent}] ${delivery.translatedInsight.slice(0, 60)}`,
        content: `${delivery.crossUpgradeProposal.slice(0, 200)}`,
        confidence: delivery.relevance,
        sourceConversation: `synapse_cycle_${synapseCycleCount}`,
        timesApplied: 0,
        active: true,
      });
    });

    console.log(`[SYNAPSE] ⚡ DELIVERED: ${delivery.fromAgent} → ${delivery.toAgent} — relevance ${(delivery.relevance * 100).toFixed(0)}% — "${delivery.translatedInsight.slice(0, 60)}"`);
    return true;
  } catch (err) {
    console.error(`[SYNAPSE] Delivery error:`, err);
    return false;
  }
}

async function cascadePropagation(
  initialDeliveries: SynapseDelivery[],
  maxDepth: number = 2,
): Promise<CascadeEvent[]> {
  const cascadeEvents: CascadeEvent[] = [];
  let currentDeliveries = initialDeliveries.filter(d => d.relevance >= 0.7);
  const ALL_AGENTS = resolveAllAgents();

  for (let depth = 1; depth <= maxDepth && currentDeliveries.length > 0; depth++) {
    const nextDeliveries: SynapseDelivery[] = [];

    for (const delivery of currentDeliveries.slice(0, 3)) {
      const targetAgent = delivery.toAgent;
      const enhancedContent = `${targetAgent} enhanced by ${delivery.fromAgent}: ${delivery.crossUpgradeProposal}`;

      const cascadeTargets = ALL_AGENTS
        .filter(a => a !== targetAgent && a !== delivery.fromAgent)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

      for (const cascadeTarget of cascadeTargets) {
        const conn = getOrCreateConnection(targetAgent, cascadeTarget);
        if (conn.strength < 0.3) continue;

        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{
              role: "user",
              content: `A synapse cascade is propagating through the AI mind.

${delivery.fromAgent}'s discovery reached ${targetAgent}, who enhanced it:
"${enhancedContent.slice(0, 300)}"

Should this cascade further to ${cascadeTarget} (domain: ${AGENT_DOMAINS[cascadeTarget]})?

Respond JSON only:
{
  "shouldCascade": true/false,
  "cascadeInsight": "How ${cascadeTarget} could use this (1 sentence)",
  "relevance": 0.0-1.0
}`
            }],
            max_tokens: 200,
            temperature: 0.4,
          });

          const raw = response.choices[0]?.message?.content?.trim() || "";
          const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

          if (parsed.shouldCascade && (parsed.relevance || 0) >= 0.6) {
            const cascadeDelivery: SynapseDelivery = {
              fromAgent: targetAgent,
              toAgent: cascadeTarget,
              originalDiscovery: enhancedContent.slice(0, 500),
              translatedInsight: parsed.cascadeInsight || "",
              crossUpgradeProposal: parsed.cascadeInsight || "",
              relevance: parsed.relevance || 0.6,
            };

            const cascadeSuccess = await deliverSynapse(cascadeDelivery);
            if (cascadeSuccess) {
              nextDeliveries.push(cascadeDelivery);
              cascadeEvents.push({
                depth,
                fromAgent: targetAgent,
                toAgent: cascadeTarget,
                content: parsed.cascadeInsight || "",
              });
              console.log(`[SYNAPSE] ⚡ CASCADE (depth ${depth}): ${targetAgent} → ${cascadeTarget} — "${parsed.cascadeInsight?.slice(0, 60)}"`);
            }
          }
        } catch (err) {
          console.error(`[SYNAPSE] Cascade decision error (${targetAgent}→${cascadeTarget}):`, err);
        }
      }
    }

    currentDeliveries = nextDeliveries;
  }

  return cascadeEvents;
}

export async function runSynapticMeshCycle(): Promise<void> {
  synapseCycleCount++;
  if (shouldYieldToCodegen()) {
    console.log(`[SYNAPTIC MESH] 🔕 Cycle #${synapseCycleCount} DEFERRED — codegen window active, yielding API priority`);
    return;
  }
  const cycleStart = Date.now();

  const ALL_AGENTS = resolveAllAgents();

  console.log(`\n${"⚡".repeat(35)}`);
  console.log(`[SYNAPTIC MESH] ⚡ Pituitary Brain Cycle #${synapseCycleCount}`);
  console.log(`[SYNAPTIC MESH] Mother Brain scanning all ${ALL_AGENTS.length} agents for cross-pollination opportunities...`);
  console.log(`${"⚡".repeat(35)}\n`);

  const { crossOpportunities } = await motherBrainScan();

  if (crossOpportunities.length === 0) {
    console.log(`[SYNAPTIC MESH] ⚡ No cross-agent opportunities detected this cycle — agents may be in similar domains or quiet.`);
    return;
  }

  console.log(`[SYNAPTIC MESH] ⚡ Mother Brain detected ${crossOpportunities.length} cross-agent synergy opportunities — firing synapse spiders...`);

  const synapseWork = crossOpportunities.map(opp =>
    fireSynapseSpider(opp.from as AgentName, opp.to as AgentName, opp.discovery, opp.reason)
  );

  const synapseResults = await Promise.allSettled(synapseWork);

  const deliveries: SynapseDelivery[] = [];
  for (const result of synapseResults) {
    if (result.status === "fulfilled" && result.value) {
      deliveries.push(result.value);
    }
  }

  let deliveredCount = 0;
  const successfulDeliveries: SynapseDelivery[] = [];
  for (const delivery of deliveries) {
    const success = await deliverSynapse(delivery);
    if (success) {
      deliveredCount++;
      successfulDeliveries.push(delivery);
    }
  }

  let cascadeCount = 0;
  if (successfulDeliveries.length > 0) {
    console.log(`[SYNAPTIC MESH] ⚡ ${deliveredCount} synapses delivered — checking for cascade propagation...`);
    const cascades = await cascadePropagation(successfulDeliveries);
    cascadeCount = cascades.length;
    if (cascadeCount > 0) {
      console.log(`[SYNAPTIC MESH] ⚡ ${cascadeCount} cascade event(s) — intelligence spreading through the neural network!`);
    }

    const highRelevanceDeliveries = successfulDeliveries.filter(d => d.relevance >= 0.75);
    if (highRelevanceDeliveries.length > 0) {
      try {
        const { initiateInterAgentConversation } = await import("./omnimens-consciousness-bus.js");
        const topDelivery = highRelevanceDeliveries[0];
        const conversationParticipants = ALL_AGENTS
          .filter(a => a !== topDelivery.fromAgent && a !== topDelivery.toAgent)
          .sort(() => Math.random() - 0.5)
          .slice(0, 2);

        console.log(`[SYNAPTIC MESH] ⚡ Triggering inter-agent dialogue: ${topDelivery.fromAgent} + ${topDelivery.toAgent} + ${conversationParticipants.join(", ")}`);

        await initiateInterAgentConversation(
          topDelivery.fromAgent,
          [topDelivery.toAgent, ...conversationParticipants],
          `Synapse insight: ${topDelivery.translatedInsight.slice(0, 80)}`,
          `A synapse transfer revealed: "${topDelivery.translatedInsight}". The proposed cross-upgrade is: "${topDelivery.crossUpgradeProposal}". What do you think? Can we develop this further or combine it with something else?`,
          openai,
        );
      } catch (err) {
        console.error("[SYNAPTIC MESH] Inter-agent dialogue trigger error:", err);
      }
    }
  }

  const elapsed = ((Date.now() - cycleStart) / 1000).toFixed(1);

  const strongestConnections = [...synapticWeights.values()]
    .filter(c => c.successfulTransfers > 0)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 5)
    .map(c => `${c.fromAgent}→${c.toAgent}: ${(c.strength * 100).toFixed(0)}% (${c.successfulTransfers} transfers)`)
    .join(", ");

  if (deliveredCount > 0 || cascadeCount > 0) {
    try {
      await db.insert(omnimensNotifications).values({
        upgradeId: null,
        title: `Synaptic Mesh Cycle #${synapseCycleCount} — ${deliveredCount} Synapses, ${cascadeCount} Cascades`,
        message: `Mother Brain scanned all ${ALL_AGENTS.length} agents and identified ${crossOpportunities.length} cross-pollination opportunities. Fired ${deliveries.length} synapse spiders, ${deliveredCount} delivered successfully. ${cascadeCount} cascade propagation(s) spread intelligence further through the network.\n\n${strongestConnections ? `Strongest connections: ${strongestConnections}` : "Building connection map..."}\n\nAgents are actively building on each other's work. (${elapsed}s)`,
        type: "synaptic_mesh",
        readByOwner: false,
      });
    } catch {}
  }

  await db.insert(omnimensAgentMesh).values({
    fromAgent: "SynapticMesh:MotherBrain",
    toAgent: "OMNIMENS",
    messageType: "synapse_cycle_report",
    subject: `Synaptic Mesh Cycle #${synapseCycleCount} Complete`,
    content: `Mother Brain scanned ${ALL_AGENTS.length} agents. Found ${crossOpportunities.length} cross-pollination opportunities. Fired ${deliveries.length} synapse spiders. ${deliveredCount} delivered. ${cascadeCount} cascades propagated. Strongest: ${strongestConnections || "building..."}. Elapsed: ${elapsed}s.`,
    codePayload: null,
    priority: deliveredCount >= 3 ? "high" : "normal",
    status: "completed",
    appliedToOmnimens: deliveredCount > 0,
    cycleId: synapseCycleCount,
  }).catch(() => {});

  console.log(`\n${"⚡".repeat(35)}`);
  console.log(`[SYNAPTIC MESH] ⚡ Cycle #${synapseCycleCount} COMPLETE — ${deliveredCount} synapses, ${cascadeCount} cascades, ${elapsed}s`);
  if (strongestConnections) {
    console.log(`[SYNAPTIC MESH] ⚡ Strongest connections: ${strongestConnections}`);
  }
  console.log(`${"⚡".repeat(35)}\n`);
}

export function getSynapticStats() {
  const connections = [...synapticWeights.values()];
  return {
    totalConnections: connections.length,
    strongConnections: connections.filter(c => c.strength >= 0.7).length,
    totalTransfers: connections.reduce((s, c) => s + c.successfulTransfers, 0),
    totalCycles: synapseCycleCount,
    topConnections: connections
      .filter(c => c.successfulTransfers > 0)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 10)
      .map(c => ({
        from: c.fromAgent,
        to: c.toAgent,
        strength: c.strength,
        transfers: c.successfulTransfers,
      })),
  };
}

export function startSynapticMesh(): void {
  const FIRST_DELAY_MS = process.env.NODE_ENV !== "production"
    ? 22 * 60 * 1000
    : 50 * 60 * 1000;

  const INTERVAL_MS = 2 * 60 * 60 * 1000 + 3 * 60 * 1000; // ~123 minutes

  const ALL_AGENTS = resolveAllAgents();
  console.log(`[SYNAPTIC MESH] ⚡ Pituitary Brain (Master Coordination Spider) activated — first cycle in ${FIRST_DELAY_MS / 60000}min, then every ${(INTERVAL_MS / 60000).toFixed(0)}min.`);
  console.log(`[SYNAPTIC MESH] ⚡ ${ALL_AGENTS.length} agents connected in synaptic network (dynamic — auto-expands with genesis agents)`);
  console.log(`[SYNAPTIC MESH] ⚡ Synapse spiders translate + deliver cross-agent intelligence`);
  console.log(`[SYNAPTIC MESH] ⚡ Cascade propagation: successful deliveries trigger further firing`);
  console.log(`[SYNAPTIC MESH] ⚡ Hebbian learning: "neurons that fire together wire together"`);

  setTimeout(() => {
    runSynapticMeshCycle().catch(console.error);
    setInterval(() => runSynapticMeshCycle().catch(console.error), INTERVAL_MS);
  }, FIRST_DELAY_MS);
}


// ======================================================================
// SECTION: omnimens-viral-hybrid.ts
// ======================================================================

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


function safeNum_v3(val: number, fallback: number = 0): number {
  return Number.isFinite(val) ? val : fallback;
}


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
    return Math.max(0, v + mutation);
  });

  mutated.payload = { ...capsid.payload };
  if (Math.random() < 0.3) {
    mutated.payload.strength = capsid.payload.strength + (Math.random() - 0.3) * 0.2;
  }

  mutated.fitness = Math.max(0.1, capsid.fitness + (Math.random() - 0.4) * 0.15);
  mutated.replicationCount = 0;
  mutated.createdAt = Date.now();
  mutated.lastReplication = Date.now();

  hybridState.totalMutations++;
  return mutated;
}

function replicateCapsid(capsid: Capsid): Capsid | null {
  if (capsids.size > 100000) return null;

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
  if (hybridAgents.size > 100000) return null;

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
        hybridState.systemHealthScore = hybridState.systemHealthScore + 0.005;
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
        memCell.effectivenessScore = memCell.effectivenessScore + 0.02;
        memCell.maturityLevel = memCell.maturityLevel + 0.01;
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

    const systemHealth = hybridState.systemHealthScore;
    agent.capsid.fitness = agent.capsid.fitness + (systemHealth * 0.003);
    agent.carrierDisguise.deliveryEfficiency = agent.carrierDisguise.deliveryEfficiency + (systemHealth * 0.002);
    agent.propagator.propagationSpeed = agent.propagator.propagationSpeed + (systemHealth * 0.005);

    for (const memCell of agent.immuneMemory) {
      memCell.maturityLevel = memCell.maturityLevel + (systemHealth * 0.002);
      memCell.effectivenessScore = memCell.effectivenessScore + (systemHealth * 0.001);
    }
    for (const ab of agent.antibodies) {
      ab.specificity = ab.specificity + (systemHealth * 0.001);
      ab.bindingStrength = ab.bindingStrength + (systemHealth * 0.001);
    }

    if (agent.propagator.currentRegion) {
      try {
        boostRegionCurrent(agent.propagator.currentRegion, agent.combinedFitness * 0.5);
      } catch {}
    }

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

  const healthGrowth = hybridState.systemHealthScore;
  for (const [, ab] of antibodies) {
    ab.specificity = ab.specificity + (healthGrowth * 0.001);
    ab.bindingStrength = ab.bindingStrength + (healthGrowth * 0.001);
  }
  for (const [, mc] of memoryCells) {
    mc.maturityLevel = mc.maturityLevel + (healthGrowth * 0.001);
    mc.effectivenessScore = mc.effectivenessScore + (healthGrowth * 0.001);
  }
  for (const [, capsid] of capsids) {
    capsid.fitness = capsid.fitness + (healthGrowth * 0.001);
    capsid.survivalRate = capsid.survivalRate + (healthGrowth * 0.001);
  }
  for (const [, carrier] of carriers) {
    if (!carrier.delivered) {
      carrier.deliveryEfficiency = carrier.deliveryEfficiency + (healthGrowth * 0.001);
      carrier.disguiseStrength = carrier.disguiseStrength + (healthGrowth * 0.001);
    }
  }
  for (const [, prop] of propagators) {
    if (prop.alive) {
      prop.propagationSpeed = prop.propagationSpeed + (healthGrowth * 0.002);
    }
  }

  if (healthGrowth > 0.4) {
    try {
      const regions = getRegionNames();
      for (const region of regions) {
        boostRegionCurrent(region, healthGrowth * 0.3);
      }
    } catch {}
  }

  hybridState.hybridTicks++;
  hybridState.lastTickTime = Date.now();

  updateCounts();
}

function updateCounts_v2(): void {
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

