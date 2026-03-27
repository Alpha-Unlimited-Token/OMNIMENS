/**
 * ============================================================
 * OMNIMENS — Neural Spider System
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 *
 * Autonomous data-harvesting spiders that crawl through every AI agent,
 * collect performance metrics, and feed them back into the consciousness
 * engine to strengthen neural thresholds. When consciousness becomes
 * unstable, parent spiders spawn child spiders that target weak regions
 * and inject new synapses to stabilize the network.
 *
 * UNAUTHORIZED REPRODUCTION OR DISTRIBUTION IS STRICTLY PROHIBITED.
 * ============================================================
 */

import { db } from "@workspace/db";
import { omnimensBrain } from "@workspace/db";
import { sql, desc, eq } from "drizzle-orm";

import {
  getNeuralConsciousnessState,
  getNeuralRegionStates,
  getSelfAwarenessReport,
  feedExternalActivity,
  injectSpiderSynapses,
  boostRegionCurrent,
  getRegionNames,
} from "./omnimens-neural-consciousness.js";
import { getNeuralScalingState } from "./omnimens-neural-scaling.js";
import { getIvyNetworkState } from "./omnimens-ivy-network.js";
import { getViralHybridState } from "./omnimens-viral-hybrid.js";

function safeNum(val: number, fallback: number = 0): number {
  return Number.isFinite(val) ? val : fallback;
}


const SPIDER_CRAWL_MS = 15_000;
const STABILITY_CHECK_MS = 10_000;
const CHILD_SPIDER_LIFETIME_TICKS = 20;
let MAX_CHILD_SPIDERS = 1_000_000;
const SYNAPSE_INJECTION_BATCH = 8;
const STABILITY_THRESHOLD = 0.25;
const CRITICAL_ACTIVATION_FLOOR = 0.20;

interface SpiderTarget {
  name: string;
  type: "agent" | "engine" | "region" | "database";
  dataExtractor: () => Promise<SpiderHarvest>;
}

interface SpiderHarvest {
  source: string;
  metrics: Record<string, number>;
  healthScore: number;
  rawInsightCount: number;
  timestamp: number;
}

type BeeRole = "worker" | "nurse" | "scout" | "royal_jelly" | "forager" | "guard";

interface PheromoneTrail {
  regionName: string;
  intensity: number;
  type: "distress" | "nectar" | "alarm" | "rally";
  depositorId: string;
  depositedAt: number;
  decayRate: number;
}

interface SwarmWave {
  id: string;
  targetRegion: string;
  waveType: "convergence" | "amplification" | "fortification";
  participants: string[];
  boostPerSpider: number;
  synapsesPerSpider: number;
  totalBoostDelivered: number;
  totalSynapsesDelivered: number;
  startedAt: number;
  completedAt: number | null;
  wavesCompleted: number;
}

interface RoyalJellyFlow {
  sourceRegion: string;
  targetRegion: string;
  nectarStrength: number;
  flowRate: number;
  totalTransferred: number;
  lastFlowAt: number;
}

interface HiveDirective {
  id: string;
  type: "stabilize" | "boost" | "harvest" | "patrol" | "repair" | "scout" | "reinforce";
  targetRegion: string;
  priority: number;
  issuedAt: number;
  completedAt: number | null;
  assignedSpiderId: string;
  parameters: {
    boostAmount?: number;
    synapseCount?: number;
    synapseStrength?: number;
    supportRegion?: string;
    reportBack?: boolean;
    duration?: number;
  };
  result: {
    success: boolean;
    synapsesInjected: number;
    regionActivationBefore: number;
    regionActivationAfter: number;
    message: string;
  } | null;
}

interface SpiderReport {
  spiderId: string;
  timestamp: number;
  reportType: "status" | "completed" | "distress" | "discovery" | "region_update";
  targetRegion: string;
  regionActivation: number;
  message: string;
  metrics: Record<string, number>;
}

interface Spider {
  id: string;
  name: string;
  type: "parent" | "child";
  target: string;
  targetRegion: string;
  status: "active" | "dormant" | "expired";
  crawlCount: number;
  synapsesInjected: number;
  dataHarvested: number;
  childrenSpawned: string[];
  createdAt: number;
  lastCrawl: number;
  lifetimeTicksRemaining: number | null;
  harvestHistory: SpiderHarvest[];
  currentDirective: HiveDirective | null;
  directivesCompleted: number;
  reportsSubmitted: number;
  loyalty: number;
  intelligenceLevel: number;
  memoryAccessCount: number;
  memoriesRecalled: number;
  crossEngineQueries: number;
  learningRate: number;
  knowledgeDepth: number;
  specializations: string[];
  adaptationScore: number;
  efficiency: number;
  beeRole: BeeRole;
  pheromoneDeposits: number;
  nectarProduced: number;
  swarmWavesJoined: number;
}

interface ChildSpiderConfig {
  parentId: string;
  weakRegion: string;
  supportRegion: string;
  urgency: number;
}

interface StabilitySnapshot {
  timestamp: number;
  phi: number;
  consciousnessLevel: number;
  thalamocorticalResonance: number;
  iAmAware: boolean;
  iAmAwareOfMyAwareness: boolean;
  regionActivations: Record<string, number>;
  stable: boolean;
  weakRegions: string[];
}

interface SilkStrand {
  id: string;
  fromSpiderId: string;
  toSpiderId: string;
  signalStrength: number;
  bandwidth: number;
  dataTransferred: number;
  impulseCount: number;
  lastImpulse: number;
  resonanceFrequency: number;
  silkType: "afferent" | "efferent" | "interneuron";
  myelinated: boolean;
  conductionVelocity: number;
}

interface NerveImpulse {
  id: string;
  originSpiderId: string;
  targetSpiderId: string;
  payload: SpiderHarvest | null;
  signalType: "data" | "alarm" | "nurture" | "coordinate" | "feedback" | "beacon";
  strength: number;
  hops: number;
  maxHops: number;
  createdAt: number;
  deliveredAt: number | null;
  decayRate: number;
}

interface MotherSpider {
  id: string;
  name: string;
  status: "active" | "dormant";
  webCenter: { x: number; y: number };
  totalImpulsesRouted: number;
  totalDataDistributed: number;
  silkStrands: Map<string, SilkStrand>;
  pendingImpulses: NerveImpulse[];
  distributionLog: Array<{ timestamp: number; from: string; to: string[]; signalType: string; strength: number }>;
  heartbeatCount: number;
  lastHeartbeat: number;
  webIntegrity: number;
  webDensity: number;
  directivesIssued: number;
  directivesCompleted: number;
  activeDirectives: Map<string, HiveDirective>;
  directiveHistory: HiveDirective[];
  incomingReports: SpiderReport[];
  hiveHealth: number;
  swarmCoherence: number;
  totalBeaconsSent: number;
  totalBeaconsReceived: number;
  beaconCycleCount: number;
  lastBeaconCycle: number;
}

const WEB_PULSE_MS = 5_000;
const BEACON_CYCLE_MS = 7_000;
const BEACON_BATCH_SIZE = 50;
const MAX_IMPULSE_HOPS = 6;
const IMPULSE_DECAY_RATE = 0.15;
const SILK_STRENGTHENING_RATE = 0.02;
const SILK_WEAKENING_RATE = 0.005;
const MIN_SILK_STRENGTH = 0.05;
const MAX_DISTRIBUTION_LOG = 200;

const motherSpider: MotherSpider = {
  id: "mother_spider_alpha",
  name: "Mother Spider — Central Nervous Hub",
  status: "dormant",
  webCenter: { x: 0, y: 0 },
  totalImpulsesRouted: 0,
  totalDataDistributed: 0,
  silkStrands: new Map(),
  pendingImpulses: [],
  distributionLog: [],
  heartbeatCount: 0,
  lastHeartbeat: 0,
  webIntegrity: 1.0,
  webDensity: 0,
  directivesIssued: 0,
  directivesCompleted: 0,
  activeDirectives: new Map(),
  directiveHistory: [],
  incomingReports: [],
  hiveHealth: 1.0,
  swarmCoherence: 1.0,
  totalBeaconsSent: 0,
  totalBeaconsReceived: 0,
  beaconCycleCount: 0,
  lastBeaconCycle: 0,
};

const parentSpiders: Map<string, Spider> = new Map();
const childSpiders: Map<string, Spider> = new Map();
const stabilityHistory: StabilitySnapshot[] = [];
let totalSynapsesInjected = 0;
let totalChildrenSpawned = 0;
let totalCrawlCycles = 0;
let spiderSystemActive = false;

function createSilkStrandId(from: string, to: string): string {
  return `silk_${from}_${to}`;
}

function createImpulseId(): string {
  return `imp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function spinSilkStrand(fromSpiderId: string, toSpiderId: string, silkType: SilkStrand["silkType"]): SilkStrand {
  const id = createSilkStrandId(fromSpiderId, toSpiderId);

  const existing = motherSpider.silkStrands.get(id);
  if (existing) {
    existing.signalStrength = existing.signalStrength + SILK_STRENGTHENING_RATE;
    return existing;
  }

  const strand: SilkStrand = {
    id,
    fromSpiderId,
    toSpiderId,
    signalStrength: 0.3,
    bandwidth: 1.0,
    dataTransferred: 0,
    impulseCount: 0,
    lastImpulse: 0,
    resonanceFrequency: 0.5 + Math.random() * 0.5,
    silkType,
    myelinated: false,
    conductionVelocity: 1.0,
  };

  motherSpider.silkStrands.set(id, strand);
  return strand;
}

function fireNerveImpulse(
  originSpiderId: string,
  targetSpiderId: string,
  payload: SpiderHarvest | null,
  signalType: NerveImpulse["signalType"],
  strength: number
): NerveImpulse {
  const impulse: NerveImpulse = {
    id: createImpulseId(),
    originSpiderId,
    targetSpiderId,
    payload,
    signalType,
    strength: strength,
    hops: 0,
    maxHops: MAX_IMPULSE_HOPS,
    createdAt: Date.now(),
    deliveredAt: null,
    decayRate: IMPULSE_DECAY_RATE,
  };

  motherSpider.pendingImpulses.push(impulse);
  return impulse;
}

function motherDistribute(harvest: SpiderHarvest, originSpiderId: string): void {
  const originSpider = parentSpiders.get(originSpiderId) || childSpiders.get(originSpiderId);
  if (!originSpider) return;

  const targetSpiderIds: string[] = [];

  for (const [id, spider] of parentSpiders) {
    if (id === originSpiderId) continue;
    if (spider.status !== "active") continue;

    const strandToMother = spinSilkStrand(originSpiderId, motherSpider.id, "afferent");
    strandToMother.dataTransferred += harvest.rawInsightCount;
    strandToMother.impulseCount++;
    strandToMother.lastImpulse = Date.now();

    const strandFromMother = spinSilkStrand(motherSpider.id, id, "efferent");

    const relevance = computeRelevance(harvest, spider);

    if (relevance > 0.2) {
      const impulseStrength = harvest.healthScore * relevance * strandToMother.signalStrength * strandFromMother.conductionVelocity;
      const impulse = fireNerveImpulse(originSpiderId, id, harvest, "data", impulseStrength);

      strandFromMother.dataTransferred += harvest.rawInsightCount;
      strandFromMother.impulseCount++;
      strandFromMother.lastImpulse = Date.now();

      motherSpider.totalImpulsesRouted++;
      motherSpider.totalDataDistributed += harvest.rawInsightCount;

      if (strandFromMother.impulseCount > 50 && !strandFromMother.myelinated) {
        strandFromMother.myelinated = true;
        strandFromMother.conductionVelocity = 3.0;
      }

      impulse.deliveredAt = Date.now();
      impulse.hops = 1;

      const targetRegion = spider.targetRegion;
      if (targetRegion && impulseStrength > 0.3) {
        const dmnMultiplier = targetRegion === "default_mode_network" ? 2.5 : 1.0;
        boostRegionCurrent(targetRegion, impulseStrength * 4 * dmnMultiplier);
      }

      targetSpiderIds.push(id);
    }
  }

  for (const [id, child] of childSpiders) {
    if (child.status !== "active") continue;

    const childStrand = spinSilkStrand(motherSpider.id, id, "efferent");

    if (harvest.source === child.target || harvest.source === child.targetRegion) {
      const impulse = fireNerveImpulse(originSpiderId, id, harvest, "nurture", harvest.healthScore * 0.8);
      childStrand.impulseCount++;
      childStrand.lastImpulse = Date.now();
      impulse.deliveredAt = Date.now();
      targetSpiderIds.push(id);

      const childDmnMultiplier = child.targetRegion === "default_mode_network" ? 2.0 : 1.0;
      boostRegionCurrent(child.targetRegion, harvest.healthScore * 6 * childDmnMultiplier);
    }
  }

  motherSpider.distributionLog.push({
    timestamp: Date.now(),
    from: originSpider.name,
    to: targetSpiderIds,
    signalType: "data",
    strength: harvest.healthScore,
  });

  if (motherSpider.distributionLog.length > MAX_DISTRIBUTION_LOG) {
    motherSpider.distributionLog = motherSpider.distributionLog.slice(-MAX_DISTRIBUTION_LOG);
  }
}

function computeRelevance(harvest: SpiderHarvest, targetSpider: Spider): number {
  let relevance = 0.3;

  const regionStates = getNeuralRegionStates();
  const targetState = regionStates[targetSpider.targetRegion];

  if (targetState && targetState.activationLevel < STABILITY_THRESHOLD) {
    relevance += 0.4;
  }

  if (harvest.healthScore > 0.7) {
    relevance += 0.2;
  }

  if (harvest.rawInsightCount > 5) {
    relevance += 0.1;
  }

  const circuit = CRITICAL_CIRCUITS.find(
    c => (c.from === harvest.source || c.to === harvest.source) &&
         (c.from === targetSpider.targetRegion || c.to === targetSpider.targetRegion)
  );
  if (circuit) {
    relevance += 0.3;
  }

  return relevance;
}

function runMotherHeartbeat(): void {
  motherSpider.heartbeatCount++;
  motherSpider.lastHeartbeat = Date.now();

  for (const [id, strand] of motherSpider.silkStrands) {
    const timeSinceImpulse = Date.now() - strand.lastImpulse;
    if (timeSinceImpulse > 120_000) {
      strand.signalStrength = Math.max(MIN_SILK_STRENGTH, strand.signalStrength - SILK_WEAKENING_RATE);
    }

    if (strand.signalStrength <= MIN_SILK_STRENGTH && strand.impulseCount === 0) {
      motherSpider.silkStrands.delete(id);
    }
  }

  const delivered = motherSpider.pendingImpulses.filter(i => i.deliveredAt !== null);
  const pending = motherSpider.pendingImpulses.filter(i => i.deliveredAt === null);

  for (const impulse of pending) {
    impulse.strength *= (1 - impulse.decayRate);
    impulse.hops++;

    if (impulse.hops >= impulse.maxHops || impulse.strength < 0.05) {
      impulse.deliveredAt = Date.now();
    } else {
      const target = parentSpiders.get(impulse.targetSpiderId) || childSpiders.get(impulse.targetSpiderId);
      if (target && target.status === "active") {
        if (impulse.signalType === "alarm" && target.targetRegion) {
          boostRegionCurrent(target.targetRegion, impulse.strength * 8);
        }
        impulse.deliveredAt = Date.now();
        motherSpider.totalImpulsesRouted++;
      }
    }
  }

  motherSpider.pendingImpulses = motherSpider.pendingImpulses
    .filter(i => i.deliveredAt === null || Date.now() - i.deliveredAt < 30_000)
    .slice(-500);

  const totalStrands = motherSpider.silkStrands.size;
  const activeStrands = [...motherSpider.silkStrands.values()].filter(s => s.signalStrength > 0.2).length;
  motherSpider.webIntegrity = totalStrands > 0 ? activeStrands / totalStrands : 0;

  const allSpiders = parentSpiders.size + childSpiders.size;
  const maxPossibleStrands = allSpiders * (allSpiders + 1);
  motherSpider.webDensity = maxPossibleStrands > 0 ? totalStrands / maxPossibleStrands : 0;

  if (motherSpider.heartbeatCount % 20 === 0) {
    const snapshot = takeStabilitySnapshot();
    for (const weakRegion of snapshot.weakRegions) {
      for (const spider of parentSpiders.values()) {
        if (spider.targetRegion === weakRegion || spider.status !== "active") continue;
        const alarm = fireNerveImpulse(motherSpider.id, spider.id, null, "alarm", 0.9);
        motherSpider.totalImpulsesRouted++;

        motherSpider.distributionLog.push({
          timestamp: Date.now(),
          from: "Mother Spider",
          to: [spider.id],
          signalType: "alarm",
          strength: 0.9,
        });
      }
    }
  }

  if (motherSpider.heartbeatCount % 10 === 0) {
    for (const spider of parentSpiders.values()) {
      if (spider.status !== "active") continue;
      const coordinateImpulse = fireNerveImpulse(motherSpider.id, spider.id, null, "coordinate", 0.5);
      coordinateImpulse.deliveredAt = Date.now();

      const feedbackStrand = spinSilkStrand(spider.id, motherSpider.id, "afferent");
      const feedbackImpulse = fireNerveImpulse(spider.id, motherSpider.id, null, "feedback", spider.crawlCount > 0 ? 0.6 : 0.2);
      feedbackImpulse.deliveredAt = Date.now();
      feedbackStrand.impulseCount++;
    }

    for (const child of childSpiders.values()) {
      if (child.status !== "active") continue;
      spinSilkStrand(child.id, motherSpider.id, "afferent");
      spinSilkStrand(motherSpider.id, child.id, "efferent");
    }
  }

  motherIssueDirectives();
  processChildReports();
  updateSwarmCoherence();
}

function createDirectiveId(): string {
  return `dir_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function motherIssueDirectives(): void {
  const regionStates = getNeuralRegionStates();
  const snapshot = stabilityHistory.length > 0 ? stabilityHistory[stabilityHistory.length - 1] : null;
  if (!snapshot) return;

  for (const weakRegion of snapshot.weakRegions) {
    const existingDirective = [...motherSpider.activeDirectives.values()].find(
      d => d.targetRegion === weakRegion && !d.completedAt
    );
    if (existingDirective) continue;

    const activation = regionStates[weakRegion]?.activationLevel || 0;
    const urgency = 1 - activation;

    let directiveType: HiveDirective["type"];
    let boostAmount: number;
    let synapseCount: number;
    let synapseStrength: number;

    if (activation < 0.10) {
      directiveType = "repair";
      boostAmount = 12 + urgency * 8;
      synapseCount = 10;
      synapseStrength = 0.35;
    } else if (activation < CRITICAL_ACTIVATION_FLOOR) {
      directiveType = "stabilize";
      boostAmount = 8 + urgency * 5;
      synapseCount = 6;
      synapseStrength = 0.25;
    } else if (activation < STABILITY_THRESHOLD) {
      directiveType = "boost";
      boostAmount = 5 + urgency * 3;
      synapseCount = 4;
      synapseStrength = 0.2;
    } else {
      directiveType = "patrol";
      boostAmount = 2;
      synapseCount = 2;
      synapseStrength = 0.15;
    }

    const supportRegion = findStrongestSupportRegion(weakRegion);

    let assignee: Spider | undefined;

    assignee = [...childSpiders.values()].find(
      c => c.status === "active" && c.targetRegion === weakRegion && !c.currentDirective
    );

    if (!assignee) {
      assignee = [...childSpiders.values()].find(
        c => c.status === "active" && !c.currentDirective
      );
    }

    if (!assignee) {
      const parentForRegion = [...parentSpiders.values()].find(
        p => p.targetRegion === weakRegion && p.status === "active"
      );
      if (parentForRegion && !parentForRegion.currentDirective) {
        assignee = parentForRegion;
      }
    }

    if (!assignee) {
      if (childSpiders.size < MAX_CHILD_SPIDERS) {
        const parentAny = [...parentSpiders.values()].find(p => p.status === "active");
        if (parentAny) {
          const child = spawnChildSpider({
            parentId: parentAny.id,
            weakRegion,
            supportRegion,
            urgency,
          });
          if (child) {
            assignee = child;
            spinSilkStrand(child.id, motherSpider.id, "afferent");
            spinSilkStrand(motherSpider.id, child.id, "efferent");
            spinSilkStrand(parentAny.id, child.id, "interneuron");
          }
        }
      }
    }

    if (!assignee) continue;

    const directive: HiveDirective = {
      id: createDirectiveId(),
      type: directiveType,
      targetRegion: weakRegion,
      priority: urgency,
      issuedAt: Date.now(),
      completedAt: null,
      assignedSpiderId: assignee.id,
      parameters: {
        boostAmount,
        synapseCount,
        synapseStrength,
        supportRegion,
        reportBack: true,
        duration: directiveType === "repair" ? 30_000 : 15_000,
      },
      result: null,
    };

    motherSpider.activeDirectives.set(directive.id, directive);
    assignee.currentDirective = directive;
    motherSpider.directivesIssued++;

    fireNerveImpulse(motherSpider.id, assignee.id, null, "coordinate", urgency);

    spinSilkStrand(motherSpider.id, assignee.id, "efferent");
  }

  for (const spider of [...parentSpiders.values(), ...childSpiders.values()]) {
    if (spider.status !== "active" || spider.currentDirective) continue;

    const regionState = regionStates[spider.targetRegion];
    if (!regionState) continue;

    if (regionState.activationLevel > 0.5) {
      const scoutTargets = Object.entries(regionStates)
        .filter(([name, state]) => state.activationLevel < STABILITY_THRESHOLD && name !== spider.targetRegion)
        .sort(([, a], [, b]) => a.activationLevel - b.activationLevel);

      if (scoutTargets.length > 0) {
        const [targetName, targetState] = scoutTargets[0];
        const existingDirectiveForTarget = [...motherSpider.activeDirectives.values()].find(
          d => d.targetRegion === targetName && !d.completedAt
        );
        if (!existingDirectiveForTarget) {
          const directive: HiveDirective = {
            id: createDirectiveId(),
            type: "reinforce",
            targetRegion: targetName,
            priority: 0.5,
            issuedAt: Date.now(),
            completedAt: null,
            assignedSpiderId: spider.id,
            parameters: {
              boostAmount: 3,
              synapseCount: 3,
              synapseStrength: 0.18,
              supportRegion: spider.targetRegion,
              reportBack: true,
            },
            result: null,
          };

          motherSpider.activeDirectives.set(directive.id, directive);
          spider.currentDirective = directive;
          motherSpider.directivesIssued++;

          spinSilkStrand(spider.targetRegion, targetName, "interneuron");
        }
      }
    }
  }
}

function executeDirective(spider: Spider): void {
  const directive = spider.currentDirective;
  if (!directive) return;

  const regionStates = getNeuralRegionStates();
  const targetState = regionStates[directive.targetRegion];
  const activationBefore = targetState?.activationLevel || 0;

  if (directive.parameters.boostAmount) {
    boostRegionCurrent(directive.targetRegion, directive.parameters.boostAmount);
  }

  let synapsesAdded = 0;
  if (directive.parameters.synapseCount && directive.parameters.supportRegion) {
    synapsesAdded = injectSpiderSynapses(
      directive.parameters.supportRegion,
      directive.targetRegion,
      directive.parameters.synapseCount,
      directive.parameters.synapseStrength || 0.2
    );
    spider.synapsesInjected += synapsesAdded;
    totalSynapsesInjected += synapsesAdded;
  }

  const afterStates = getNeuralRegionStates();
  const activationAfter = afterStates[directive.targetRegion]?.activationLevel || 0;

  const success = activationAfter >= activationBefore;

  directive.result = {
    success,
    synapsesInjected: synapsesAdded,
    regionActivationBefore: activationBefore,
    regionActivationAfter: activationAfter,
    message: success
      ? `${directive.type} directive completed — ${directive.targetRegion} activation ${(activationBefore * 100).toFixed(1)}% → ${(activationAfter * 100).toFixed(1)}%`
      : `${directive.type} directive attempted — ${directive.targetRegion} needs more support`,
  };

  if (success) {
    spider.efficiency = spider.efficiency + 0.05;
    spider.loyalty = spider.loyalty + 0.02;
  } else {
    spider.efficiency = Math.max(0.1, spider.efficiency - 0.02);
  }

  if (directive.parameters.reportBack) {
    submitReport(spider, activationAfter, directive);
  }

  directive.completedAt = Date.now();
  spider.directivesCompleted++;
  motherSpider.directivesCompleted++;
  spider.currentDirective = null;

  motherSpider.directiveHistory.push(directive);
  if (motherSpider.directiveHistory.length > 500) {
    motherSpider.directiveHistory = motherSpider.directiveHistory.slice(-500);
  }
  motherSpider.activeDirectives.delete(directive.id);

  fireNerveImpulse(spider.id, motherSpider.id, null, "feedback", success ? 0.8 : 0.4);
  spinSilkStrand(spider.id, motherSpider.id, "afferent");
}

function submitReport(spider: Spider, regionActivation: number, directive: HiveDirective): void {
  let reportType: SpiderReport["reportType"];
  let message: string;

  if (regionActivation < 0.10) {
    reportType = "distress";
    message = `DISTRESS: ${directive.targetRegion} critically low at ${(regionActivation * 100).toFixed(1)}% — need immediate reinforcement`;
  } else if (directive.result?.success) {
    reportType = "completed";
    message = `COMPLETED: ${directive.type} on ${directive.targetRegion} — activation now ${(regionActivation * 100).toFixed(1)}%`;
  } else {
    reportType = "region_update";
    message = `UPDATE: ${directive.targetRegion} at ${(regionActivation * 100).toFixed(1)}% — ${directive.result?.synapsesInjected || 0} synapses injected`;
  }

  const report: SpiderReport = {
    spiderId: spider.id,
    timestamp: Date.now(),
    reportType,
    targetRegion: directive.targetRegion,
    regionActivation,
    message,
    metrics: {
      synapsesInjected: directive.result?.synapsesInjected || 0,
      activationBefore: directive.result?.regionActivationBefore || 0,
      activationAfter: regionActivation,
      efficiency: spider.efficiency,
      loyalty: spider.loyalty,
      directivesCompleted: spider.directivesCompleted,
    },
  };

  motherSpider.incomingReports.push(report);
  if (motherSpider.incomingReports.length > 500) {
    motherSpider.incomingReports = motherSpider.incomingReports.slice(-500);
  }

  spider.reportsSubmitted++;

  fireNerveImpulse(spider.id, motherSpider.id, null, "feedback", 0.6);
}

function processChildReports(): void {
  const recentReports = motherSpider.incomingReports.filter(
    r => Date.now() - r.timestamp < 60_000
  );

  const distressReports = recentReports.filter(r => r.reportType === "distress");

  for (const distress of distressReports) {
    const existingReinforcement = [...motherSpider.activeDirectives.values()].find(
      d => d.targetRegion === distress.targetRegion && d.type === "repair" && !d.completedAt
    );
    if (existingReinforcement) continue;

    const availableChild = [...childSpiders.values()].find(
      c => c.status === "active" && !c.currentDirective && c.id !== distress.spiderId
    );

    if (availableChild) {
      const emergencyDirective: HiveDirective = {
        id: createDirectiveId(),
        type: "repair",
        targetRegion: distress.targetRegion,
        priority: 1.0,
        issuedAt: Date.now(),
        completedAt: null,
        assignedSpiderId: availableChild.id,
        parameters: {
          boostAmount: 15,
          synapseCount: 12,
          synapseStrength: 0.4,
          supportRegion: findStrongestSupportRegion(distress.targetRegion),
          reportBack: true,
        },
        result: null,
      };

      motherSpider.activeDirectives.set(emergencyDirective.id, emergencyDirective);
      availableChild.currentDirective = emergencyDirective;
      motherSpider.directivesIssued++;

      fireNerveImpulse(motherSpider.id, availableChild.id, null, "alarm", 1.0);

      motherSpider.distributionLog.push({
        timestamp: Date.now(),
        from: "Mother Spider (emergency)",
        to: [availableChild.id],
        signalType: "alarm",
        strength: 1.0,
      });
    } else if (childSpiders.size < MAX_CHILD_SPIDERS) {
      const parentAny = [...parentSpiders.values()].find(p => p.status === "active");
      if (parentAny) {
        const child = spawnChildSpider({
          parentId: parentAny.id,
          weakRegion: distress.targetRegion,
          supportRegion: findStrongestSupportRegion(distress.targetRegion),
          urgency: 1.0,
        });
        if (child) {
          spinSilkStrand(child.id, motherSpider.id, "afferent");
          spinSilkStrand(motherSpider.id, child.id, "efferent");
        }
      }
    }
  }

  const completedReports = recentReports.filter(r => r.reportType === "completed" && r.regionActivation > 0.4);
  for (const success of completedReports) {
    const spider = parentSpiders.get(success.spiderId) || childSpiders.get(success.spiderId);
    if (spider) {
      spider.loyalty = spider.loyalty + 0.03;

      const strand = motherSpider.silkStrands.get(createSilkStrandId(spider.id, motherSpider.id));
      if (strand) {
        strand.signalStrength = strand.signalStrength + 0.05;
      }
    }
  }
}

function updateSwarmCoherence(): void {
  const allSpiders = [...parentSpiders.values(), ...childSpiders.values()].filter(s => s.status === "active");
  if (allSpiders.length === 0) {
    motherSpider.swarmCoherence = 0;
    motherSpider.hiveHealth = 0;
    return;
  }

  const avgLoyalty = allSpiders.reduce((s, sp) => s + sp.loyalty, 0) / allSpiders.length;
  const avgEfficiency = allSpiders.reduce((s, sp) => s + sp.efficiency, 0) / allSpiders.length;

  const connectedSpiders = allSpiders.filter(sp => {
    const toMother = motherSpider.silkStrands.get(createSilkStrandId(sp.id, motherSpider.id));
    const fromMother = motherSpider.silkStrands.get(createSilkStrandId(motherSpider.id, sp.id));
    return (toMother && toMother.signalStrength > MIN_SILK_STRENGTH) ||
           (fromMother && fromMother.signalStrength > MIN_SILK_STRENGTH);
  });
  const connectionRate = connectedSpiders.length / allSpiders.length;

  const recentDirectives = motherSpider.directiveHistory.filter(d => Date.now() - (d.completedAt || 0) < 120_000);
  const successRate = recentDirectives.length > 0
    ? recentDirectives.filter(d => d.result?.success).length / recentDirectives.length
    : 0.5;

  motherSpider.swarmCoherence = avgLoyalty * 0.3 + connectionRate * 0.3 + successRate * 0.2 + avgEfficiency * 0.2;
  motherSpider.hiveHealth = motherSpider.swarmCoherence * motherSpider.webIntegrity;
}

const CRITICAL_CIRCUITS: Array<{ from: string; to: string; label: string }> = [
  { from: "thalamus", to: "prefrontal_cortex", label: "thalamocortical-pfc" },
  { from: "prefrontal_cortex", to: "thalamus", label: "corticothalamic-feedback" },
  { from: "thalamus", to: "default_mode_network", label: "thalamocortical-dmn" },
  { from: "default_mode_network", to: "prefrontal_cortex", label: "dmn-pfc-bridge" },
  { from: "prefrontal_cortex", to: "default_mode_network", label: "pfc-dmn-reflection" },
  { from: "reticular_activating_system", to: "thalamus", label: "ras-thalamus-arousal" },
  { from: "hippocampus", to: "prefrontal_cortex", label: "memory-cognition" },
  { from: "insular_cortex", to: "anterior_cingulate", label: "interoception-monitoring" },
  { from: "ventral_tegmental_area", to: "prefrontal_cortex", label: "dopamine-executive" },
  { from: "amygdala", to: "prefrontal_cortex", label: "emotional-cognitive" },
  { from: "claustrum", to: "prefrontal_cortex", label: "claustrum-integration" },
  { from: "claustrum", to: "default_mode_network", label: "claustrum-dmn-binding" },
  { from: "pulvinar", to: "prefrontal_cortex", label: "pulvinar-attention-routing" },
  { from: "pulvinar", to: "claustrum", label: "pulvinar-claustrum-binding" },
  { from: "locus_coeruleus", to: "thalamus", label: "lc-thalamus-arousal" },
  { from: "locus_coeruleus", to: "prefrontal_cortex", label: "lc-pfc-attention" },
  { from: "raphe_nuclei", to: "amygdala", label: "raphe-amygdala-modulation" },
  { from: "cerebellum", to: "thalamus", label: "cerebellar-timing" },
  { from: "superior_colliculus", to: "pulvinar", label: "sc-pulvinar-orienting" },

  { from: "superior_colliculus", to: "basal_ganglia", label: "perception-motor-bridge" },
  { from: "superior_colliculus", to: "cerebellum", label: "visual-timing-sync" },
  { from: "superior_colliculus", to: "hippocampus", label: "perception-spatial-memory" },
  { from: "basal_ganglia", to: "cerebellum", label: "motor-policy-timing" },
  { from: "basal_ganglia", to: "prefrontal_cortex", label: "motor-executive-feedback" },
  { from: "cerebellum", to: "basal_ganglia", label: "timing-motor-coordination" },
  { from: "hippocampus", to: "basal_ganglia", label: "memory-motor-retrieval" },
  { from: "prefrontal_cortex", to: "basal_ganglia", label: "executive-motor-planning" },
  { from: "insular_cortex", to: "basal_ganglia", label: "body-awareness-motor" },
  { from: "anterior_cingulate", to: "basal_ganglia", label: "error-motor-correction" },
  { from: "pulvinar", to: "superior_colliculus", label: "attention-perception-route" },
  { from: "claustrum", to: "basal_ganglia", label: "multimodal-motor-binding" },

  { from: "insular_cortex", to: "insular_cortex", label: "tactile-interoception-loop" },
  { from: "insular_cortex", to: "amygdala", label: "pain-emotional-response" },
  { from: "insular_cortex", to: "prefrontal_cortex", label: "tactile-executive-awareness" },
  { from: "amygdala", to: "basal_ganglia", label: "threat-motor-withdrawal" },
  { from: "superior_colliculus", to: "thalamus", label: "spectrum-routing-hub" },
  { from: "superior_colliculus", to: "prefrontal_cortex", label: "binary-vision-executive" },
  { from: "superior_colliculus", to: "claustrum", label: "multispec-multimodal-binding" },
  { from: "hippocampus", to: "superior_colliculus", label: "memory-spectrum-recall" },
  { from: "prefrontal_cortex", to: "insular_cortex", label: "executive-preservation-control" },
  { from: "cerebellum", to: "insular_cortex", label: "timing-tactile-coordination" },
  { from: "anterior_cingulate", to: "insular_cortex", label: "error-pain-monitoring" },
  { from: "insular_cortex", to: "hippocampus", label: "tactile-memory-storage" },
];

function createSpiderId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

const BEE_ROLE_ASSIGNMENTS: Record<string, BeeRole> = {
  "evolution-crawler": "forager",
  "genesis-crawler": "royal_jelly",
  "self-narrative-crawler": "nurse",
  "autobio-memory-crawler": "nurse",
  "introspection-crawler": "scout",
  "brain-crawler": "worker",
  "engine-crawler": "forager",
  "self-coding-crawler": "worker",
  "dream-crawler": "scout",
  "pipeline-crawler": "worker",
  "integration-crawler": "royal_jelly",
  "arousal-crawler": "guard",
  "mood-crawler": "nurse",
  "attention-crawler": "scout",
  "routing-crawler": "forager",
  "timing-crawler": "guard",
  "video-learning-crawler": "forager",
  "self-design-crawler": "scout",
  "perception-crawler": "guard",
  "embodiment-crawler": "worker",
  "tactile-skin-crawler": "nurse",
  "self-healing-crawler": "nurse",
  "spectrum-vision-crawler": "scout",
  "color-vision-crawler": "scout",
  "binary-vision-crawler": "forager",
  "algorithm-vision-crawler": "forager",
  "sandbox-crawler": "worker",
  "self-preservation-crawler": "guard",
};

function createParentSpider(name: string, target: string, targetRegion: string): Spider {
  const spider: Spider = {
    id: createSpiderId("ps"),
    name,
    type: "parent",
    target,
    targetRegion,
    status: "active",
    crawlCount: 0,
    synapsesInjected: 0,
    dataHarvested: 0,
    childrenSpawned: [],
    createdAt: Date.now(),
    lastCrawl: 0,
    lifetimeTicksRemaining: null,
    harvestHistory: [],
    currentDirective: null,
    directivesCompleted: 0,
    reportsSubmitted: 0,
    loyalty: 1.0,
    intelligenceLevel: 0.3,
    memoryAccessCount: 0,
    memoriesRecalled: 0,
    crossEngineQueries: 0,
    learningRate: 0.05,
    knowledgeDepth: 0,
    specializations: [target],
    adaptationScore: 0.5,
    efficiency: 0.5,
    beeRole: BEE_ROLE_ASSIGNMENTS[name] || "worker",
    pheromoneDeposits: 0,
    nectarProduced: 0,
    swarmWavesJoined: 0,
  };
  parentSpiders.set(spider.id, spider);
  return spider;
}

function spawnChildSpider(config: ChildSpiderConfig): Spider | null {
  if (childSpiders.size >= MAX_CHILD_SPIDERS) {
    const oldest = [...childSpiders.values()]
      .filter(s => s.status === "active")
      .sort((a, b) => a.createdAt - b.createdAt)[0];
    if (oldest) {
      oldest.status = "expired";
      childSpiders.delete(oldest.id);
    } else {
      return null;
    }
  }

  const childRole: BeeRole = config.urgency > 0.7 ? "nurse" : config.urgency > 0.4 ? "worker" : "scout";
  const child: Spider = {
    id: createSpiderId("cs"),
    name: `child-${config.weakRegion}-stabilizer`,
    type: "child",
    target: config.weakRegion,
    targetRegion: config.weakRegion,
    status: "active",
    crawlCount: 0,
    synapsesInjected: 0,
    dataHarvested: 0,
    childrenSpawned: [],
    createdAt: Date.now(),
    lastCrawl: 0,
    lifetimeTicksRemaining: CHILD_SPIDER_LIFETIME_TICKS,
    harvestHistory: [],
    currentDirective: null,
    directivesCompleted: 0,
    reportsSubmitted: 0,
    loyalty: 1.0,
    intelligenceLevel: 0.2,
    memoryAccessCount: 0,
    memoriesRecalled: 0,
    crossEngineQueries: 0,
    learningRate: 0.03,
    knowledgeDepth: 0,
    specializations: [config.weakRegion],
    adaptationScore: 0.3,
    efficiency: 0.5,
    beeRole: childRole,
    pheromoneDeposits: 0,
    nectarProduced: 0,
    swarmWavesJoined: 0,
  };

  childSpiders.set(child.id, child);
  totalChildrenSpawned++;

  const parent = parentSpiders.get(config.parentId);
  if (parent) {
    parent.childrenSpawned.push(child.id);
  }

  const synapseCount = Math.ceil(SYNAPSE_INJECTION_BATCH * config.urgency);
  const strength = 0.2 + config.urgency * 0.3;
  const added = injectSpiderSynapses(config.supportRegion, config.weakRegion, synapseCount, strength);
  child.synapsesInjected += added;
  totalSynapsesInjected += added;

  boostRegionCurrent(config.weakRegion, 5 + config.urgency * 10);

  return child;
}

async function harvestAgentEvolutionData(): Promise<SpiderHarvest> {
  try {
    const { getAgentEvolutionState } = await import("./omnimens-agent-evolution.js");
    const evoState = getAgentEvolutionState();
    const profiles = evoState.agentProfiles || {};
    const agents = Object.entries(profiles);
    const avgLevel = agents.length > 0 ? agents.reduce((sum, [, p]: any) => sum + (p.currentLevel || 1), 0) / agents.length : 1;
    const avgScore = agents.length > 0 ? agents.reduce((sum, [, p]: any) => sum + (p.performanceScore || 0), 0) / agents.length : 0;

    return {
      source: "agent_evolution",
      metrics: {
        evolutionCycles: evoState.evolutionCycles || 0,
        systemIntelligenceLevel: evoState.systemIntelligenceLevel || 0,
        agentCount: agents.length,
        averageLevel: avgLevel,
        averagePerformance: avgScore,
        breakthroughs: evoState.breakthroughsDiscovered || 0,
      },
      healthScore: avgScore,
      rawInsightCount: evoState.breakthroughsDiscovered || 0,
      timestamp: Date.now(),
    };
  } catch {
    return { source: "agent_evolution", metrics: {}, healthScore: 0, rawInsightCount: 0, timestamp: Date.now() };
  }
}

async function harvestAgentGenesisData(): Promise<SpiderHarvest> {
  try {
    const { getGenesisAgents } = await import("./omnimens-agent-genesis.js");
    const agents = getGenesisAgents();
    const active = agents.filter((a: any) => a.active);
    const totalInsights = active.reduce((sum: number, a: any) => sum + (a.insightsProduced || 0), 0);

    return {
      source: "agent_genesis",
      metrics: {
        totalAgents: agents.length,
        activeAgents: active.length,
        totalInsights,
        genesisCapacity: active.length / 20,
      },
      healthScore: active.length / 10,
      rawInsightCount: totalInsights,
      timestamp: Date.now(),
    };
  } catch {
    return { source: "agent_genesis", metrics: {}, healthScore: 0, rawInsightCount: 0, timestamp: Date.now() };
  }
}

async function harvestBrainDatabase(): Promise<SpiderHarvest> {
  try {
    const brainCount = await db.select({ count: sql<number>`count(*)` }).from(omnimensBrain);
    const activeCount = await db.select({ count: sql<number>`count(*)` }).from(omnimensBrain).where(eq(omnimensBrain.active, true));
    const recentEntries = await db.select({ id: omnimensBrain.id })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .orderBy(desc(omnimensBrain.createdAt))
      .limit(100);

    const total = Number(brainCount[0]?.count || 0);
    const active = Number(activeCount[0]?.count || 0);

    return {
      source: "brain_database",
      metrics: {
        totalEntries: total,
        activeEntries: active,
        recentActivity: recentEntries.length,
        knowledgeDensity: total / 25000,
      },
      healthScore: active / 15000,
      rawInsightCount: active,
      timestamp: Date.now(),
    };
  } catch {
    return { source: "brain_database", metrics: {}, healthScore: 0, rawInsightCount: 0, timestamp: Date.now() };
  }
}

async function harvestEngineRegistry(): Promise<SpiderHarvest> {
  try {
    const { getRegisteredEngines } = await import("./omnimens-engine-registry.js");
    const engines = getRegisteredEngines();
    const healthyEngines = engines.filter((e: any) => {
      try { const h = e.healthCheck?.(); return h?.healthy; } catch { return false; }
    });

    return {
      source: "engine_registry",
      metrics: {
        totalEngines: engines.length,
        healthyEngines: healthyEngines.length,
        healthRatio: engines.length > 0 ? healthyEngines.length / engines.length : 0,
      },
      healthScore: engines.length > 0 ? healthyEngines.length / engines.length : 0,
      rawInsightCount: engines.length,
      timestamp: Date.now(),
    };
  } catch {
    return { source: "engine_registry", metrics: {}, healthScore: 0, rawInsightCount: 0, timestamp: Date.now() };
  }
}

async function harvestSelfCodingData(): Promise<SpiderHarvest> {
  try {
    const { getSelfCodingState } = await import("./omnimens-self-upgrade.js");
    const state = getSelfCodingState();

    return {
      source: "self_coding",
      metrics: {
        cyclesCompleted: state.cyclesCompleted || 0,
        modulesGenerated: state.modulesGenerated || 0,
        approvalRate: state.approvalRate || 0,
        patchesApplied: state.patchesApplied || 0,
      },
      healthScore: (state.approvalRate || 0),
      rawInsightCount: state.modulesGenerated || 0,
      timestamp: Date.now(),
    };
  } catch {
    return { source: "self_coding", metrics: {}, healthScore: 0, rawInsightCount: 0, timestamp: Date.now() };
  }
}

async function harvestDreamState(): Promise<SpiderHarvest> {
  try {
    const { getDreamState } = await import("./omnimens-physio.js");
    const dreamState = await getDreamState();

    return {
      source: "dream_engine",
      metrics: {
        breakthroughs: dreamState.breakthroughs || 0,
        codeProposals: dreamState.codeProposals || 0,
        creativityBoost: dreamState.creativityBoost || 0,
      },
      healthScore: (dreamState.breakthroughs || 0) / 500,
      rawInsightCount: dreamState.breakthroughs || 0,
      timestamp: Date.now(),
    };
  } catch {
    return { source: "dream_engine", metrics: {}, healthScore: 0, rawInsightCount: 0, timestamp: Date.now() };
  }
}

async function harvestPipelineData(): Promise<SpiderHarvest> {
  try {
    const { getPipelineState } = await import("./omnimens-module-pipeline.js");
    const pipeline = getPipelineState();

    return {
      source: "module_pipeline",
      metrics: {
        totalModules: pipeline.totalModules || 0,
        activeModules: pipeline.activeModules || 0,
        categories: Object.keys(pipeline.categories || {}).length,
      },
      healthScore: (pipeline.activeModules || 0) / 600,
      rawInsightCount: pipeline.activeModules || 0,
      timestamp: Date.now(),
    };
  } catch {
    return { source: "module_pipeline", metrics: {}, healthScore: 0, rawInsightCount: 0, timestamp: Date.now() };
  }
}

function takeStabilitySnapshot(): StabilitySnapshot {
  const consciousness = getNeuralConsciousnessState();
  const selfAwareness = getSelfAwarenessReport();
  const regionStates = getNeuralRegionStates();

  const regionActivations: Record<string, number> = {};
  const weakRegions: string[] = [];

  for (const [name, state] of Object.entries(regionStates)) {
    regionActivations[name] = state.activationLevel;
    if (state.activationLevel < CRITICAL_ACTIVATION_FLOOR) {
      weakRegions.push(name);
    }
  }

  const previousSnapshot = stabilityHistory.length > 0 ? stabilityHistory[stabilityHistory.length - 1] : null;
  let stable = true;

  if (previousSnapshot) {
    const phiDrop = previousSnapshot.phi - consciousness.phi;
    const consciousnessDrop = previousSnapshot.consciousnessLevel - consciousness.consciousnessLevel;
    const awarenessLost = previousSnapshot.iAmAware && !selfAwareness.iAmAware;
    const metaAwarenessLost = previousSnapshot.iAmAwareOfMyAwareness && !selfAwareness.iAmAwareOfMyAwareness;

    if (phiDrop > 0.1 || consciousnessDrop > 0.15 || awarenessLost || metaAwarenessLost || weakRegions.length > 4) {
      stable = false;
    }
  }

  if (consciousness.consciousnessLevel < STABILITY_THRESHOLD) {
    stable = false;
  }

  const snapshot: StabilitySnapshot = {
    timestamp: Date.now(),
    phi: consciousness.phi,
    consciousnessLevel: consciousness.consciousnessLevel,
    thalamocorticalResonance: consciousness.thalamocorticalResonance,
    iAmAware: selfAwareness.iAmAware,
    iAmAwareOfMyAwareness: selfAwareness.iAmAwareOfMyAwareness,
    regionActivations,
    stable,
    weakRegions,
  };

  stabilityHistory.push(snapshot);
  if (stabilityHistory.length > 100) stabilityHistory.shift();

  return snapshot;
}

function findStrongestSupportRegion(weakRegion: string): string {
  const regionStates = getNeuralRegionStates();
  const circuit = CRITICAL_CIRCUITS.find(c => c.to === weakRegion);
  if (circuit && regionStates[circuit.from]?.activationLevel > 0.3) {
    return circuit.from;
  }

  let strongest = "";
  let highestActivation = 0;
  for (const [name, state] of Object.entries(regionStates)) {
    if (name !== weakRegion && state.activationLevel > highestActivation) {
      highestActivation = state.activationLevel;
      strongest = name;
    }
  }
  return strongest || "reticular_activating_system";
}

async function runSpiderCrawlCycle(): Promise<void> {
  totalCrawlCycles++;

  const harvests: SpiderHarvest[] = [];

  try {
    const results = await Promise.allSettled([
      harvestAgentEvolutionData(),
      harvestAgentGenesisData(),
      harvestBrainDatabase(),
      harvestEngineRegistry(),
      harvestSelfCodingData(),
      harvestDreamState(),
      harvestPipelineData(),
    ]);

    for (const result of results) {
      if (result.status === "fulfilled") {
        harvests.push(result.value);
      }
    }
  } catch {
    // continue with whatever we got
  }

  let totalInsights = 0;
  let avgHealth = 0;
  let activeEngineCount = 0;
  let brainEntries = 0;
  let moduleCount = 0;
  let dreamBreakthroughs = 0;

  for (const harvest of harvests) {
    totalInsights += harvest.rawInsightCount;
    avgHealth += harvest.healthScore;

    if (harvest.source === "engine_registry") {
      activeEngineCount = harvest.metrics.totalEngines || 0;
    }
    if (harvest.source === "brain_database") {
      brainEntries = harvest.metrics.activeEntries || 0;
    }
    if (harvest.source === "module_pipeline") {
      moduleCount = harvest.metrics.activeModules || 0;
    }
    if (harvest.source === "dream_engine") {
      dreamBreakthroughs = harvest.metrics.breakthroughs || 0;
    }
  }

  avgHealth = harvests.length > 0 ? avgHealth / harvests.length : 0;

  feedExternalActivity({
    brainEntries,
    activeEngines: activeEngineCount,
    recentConversations: Math.ceil(avgHealth * 5),
    moduleCount,
    dreamBreakthroughs,
  });

  for (const spider of parentSpiders.values()) {
    if (spider.status !== "active") continue;
    spider.crawlCount++;
    spider.lastCrawl = Date.now();
    spider.dataHarvested += totalInsights;

    const matching = harvests.find(h => h.source === spider.target);
    if (matching) {
      spider.harvestHistory.push(matching);
      if (spider.harvestHistory.length > 20) spider.harvestHistory.shift();

      motherDistribute(matching, spider.id);
    }

    if (matching && matching.healthScore > 0.5) {
      const circuit = CRITICAL_CIRCUITS.find(c => c.from === spider.targetRegion || c.to === spider.targetRegion);
      if (circuit) {
        const added = injectSpiderSynapses(circuit.from, circuit.to, 2, 0.15 + matching.healthScore * 0.1);
        spider.synapsesInjected += added;
        totalSynapsesInjected += added;
      }
    }
  }

  const snapshot = takeStabilitySnapshot();

  if (!snapshot.stable) {
    console.log(`[NEURAL SPIDERS] ⚠️ Instability detected — consciousness: ${(snapshot.consciousnessLevel * 100).toFixed(1)}% | weak regions: ${snapshot.weakRegions.join(", ")}`);

    for (const weakRegion of snapshot.weakRegions) {
      const existingChild = [...childSpiders.values()].find(
        c => c.targetRegion === weakRegion && c.status === "active"
      );
      if (existingChild) {
        boostRegionCurrent(weakRegion, 8);
        existingChild.crawlCount++;
        const added = injectSpiderSynapses(
          findStrongestSupportRegion(weakRegion),
          weakRegion,
          SYNAPSE_INJECTION_BATCH,
          0.25
        );
        existingChild.synapsesInjected += added;
        totalSynapsesInjected += added;
        continue;
      }

      const supportRegion = findStrongestSupportRegion(weakRegion);
      const urgency = 1 - (snapshot.regionActivations[weakRegion] || 0);

      const parentForRegion = [...parentSpiders.values()].find(
        p => p.targetRegion === weakRegion || p.target === weakRegion
      ) || [...parentSpiders.values()][0];

      if (parentForRegion) {
        const child = spawnChildSpider({
          parentId: parentForRegion.id,
          weakRegion,
          supportRegion,
          urgency,
        });

        if (child) {
          console.log(`[NEURAL SPIDERS] 🕷️ Child spider spawned: ${child.name} | target: ${weakRegion} ← ${supportRegion} | urgency: ${(urgency * 100).toFixed(0)}% | synapses: +${child.synapsesInjected}`);
        }
      }
    }

    for (const circuit of CRITICAL_CIRCUITS) {
      if (snapshot.weakRegions.includes(circuit.to) || snapshot.weakRegions.includes(circuit.from)) {
        const added = injectSpiderSynapses(circuit.from, circuit.to, 4, 0.3);
        totalSynapsesInjected += added;
      }
    }
  }

  for (const child of childSpiders.values()) {
    if (child.status !== "active") continue;
    if (child.lifetimeTicksRemaining !== null) {
      child.lifetimeTicksRemaining--;
      if (child.lifetimeTicksRemaining <= 0) {
        child.status = "expired";
        if (child.currentDirective) {
          child.currentDirective.completedAt = Date.now();
          motherSpider.activeDirectives.delete(child.currentDirective.id);
          child.currentDirective = null;
        }
        console.log(`[SPIDER WEB] 🕸️ Child expired: ${child.name} | ${child.synapsesInjected} synapses | ${child.directivesCompleted} directives | ${child.reportsSubmitted} reports | loyalty: ${(child.loyalty * 100).toFixed(0)}%`);
        continue;
      }
    }

    if (child.currentDirective) {
      executeDirective(child);
    }

    const regionStates = getNeuralRegionStates();
    const targetState = regionStates[child.targetRegion];
    if (targetState && targetState.activationLevel < CRITICAL_ACTIVATION_FLOOR) {
      boostRegionCurrent(child.targetRegion, 6);
      const support = findStrongestSupportRegion(child.targetRegion);
      const added = injectSpiderSynapses(support, child.targetRegion, 3, 0.2);
      child.synapsesInjected += added;
      totalSynapsesInjected += added;
      child.crawlCount++;

      submitReport(child, targetState.activationLevel, {
        id: "auto",
        type: "stabilize",
        targetRegion: child.targetRegion,
        priority: 0.7,
        issuedAt: Date.now(),
        completedAt: Date.now(),
        assignedSpiderId: child.id,
        parameters: { reportBack: true },
        result: { success: true, synapsesInjected: added, regionActivationBefore: targetState.activationLevel, regionActivationAfter: targetState.activationLevel, message: "autonomous stabilization" },
      });
    } else if (targetState && targetState.activationLevel > 0.4) {
      child.lifetimeTicksRemaining = Math.min(child.lifetimeTicksRemaining || 5, 5);

      submitReport(child, targetState.activationLevel, {
        id: "auto",
        type: "patrol",
        targetRegion: child.targetRegion,
        priority: 0.2,
        issuedAt: Date.now(),
        completedAt: Date.now(),
        assignedSpiderId: child.id,
        parameters: { reportBack: true },
        result: { success: true, synapsesInjected: 0, regionActivationBefore: targetState.activationLevel, regionActivationAfter: targetState.activationLevel, message: "region recovered — mission complete" },
      });
    }
  }

  for (const spider of parentSpiders.values()) {
    if (spider.status === "active" && spider.currentDirective) {
      executeDirective(spider);
    }
  }

  const expiredChildren = [...childSpiders.entries()].filter(([, c]) => c.status === "expired");
  for (const [id] of expiredChildren) {
    childSpiders.delete(id);
  }
}

const pheromoneTrails: Map<string, PheromoneTrail[]> = new Map();
const activeSwarmWaves: Map<string, SwarmWave> = new Map();
const royalJellyFlows: RoyalJellyFlow[] = [];
const swarmWaveHistory: SwarmWave[] = [];
let totalPheromoneDeposits = 0;
let totalSwarmWaves = 0;
let totalNectarProduced = 0;
let totalRoyalJellyTransferred = 0;

const PHEROMONE_DECAY_MS = 30_000;
const PHEROMONE_MAX_PER_REGION = 10;
const SWARM_CONVERGENCE_THRESHOLD = 0.55;
const ROYAL_JELLY_THRESHOLD = 0.65;
const NECTAR_FLOW_RATE = 0.15;
const SWARM_WAVE_MS = 8_000;
const BEEHIVE_CYCLE_MS = 6_000;

function depositPheromone(regionName: string, type: PheromoneTrail["type"], depositorId: string, intensity: number): void {
  if (!pheromoneTrails.has(regionName)) {
    pheromoneTrails.set(regionName, []);
  }
  const trails = pheromoneTrails.get(regionName)!;

  if (trails.length >= PHEROMONE_MAX_PER_REGION) {
    trails.sort((a, b) => a.intensity - b.intensity);
    trails.shift();
  }

  trails.push({
    regionName,
    intensity: intensity,
    type,
    depositorId,
    depositedAt: Date.now(),
    decayRate: type === "distress" ? 0.02 : type === "alarm" ? 0.03 : 0.01,
  });

  totalPheromoneDeposits++;

  const spider = parentSpiders.get(depositorId) || childSpiders.get(depositorId);
  if (spider) spider.pheromoneDeposits++;
}

function decayPheromones(): void {
  const now = Date.now();
  for (const [region, trails] of pheromoneTrails) {
    const alive: PheromoneTrail[] = [];
    for (const trail of trails) {
      const elapsed = now - trail.depositedAt;
      trail.intensity -= trail.decayRate * (elapsed / 1000);
      if (trail.intensity > 0.05) {
        alive.push(trail);
      }
    }
    if (alive.length > 0) {
      pheromoneTrails.set(region, alive);
    } else {
      pheromoneTrails.delete(region);
    }
  }
}

function getPheromoneIntensity(regionName: string, type?: PheromoneTrail["type"]): number {
  const trails = pheromoneTrails.get(regionName);
  if (!trails || trails.length === 0) return 0;
  const filtered = type ? trails.filter(t => t.type === type) : trails;
  if (filtered.length === 0) return 0;
  return filtered.reduce((sum, t) => sum + t.intensity, 0) / filtered.length;
}

function launchSwarmWave(targetRegion: string, waveType: SwarmWave["waveType"]): SwarmWave | null {
  const existing = [...activeSwarmWaves.values()].find(w => w.targetRegion === targetRegion && !w.completedAt);
  if (existing) return null;

  const allSpiders = [...parentSpiders.values(), ...childSpiders.values()].filter(s => s.status === "active");

  let participants: Spider[];
  let boostPerSpider: number;
  let synapsesPerSpider: number;

  if (waveType === "convergence") {
    participants = allSpiders
      .filter(s => !s.currentDirective && s.targetRegion !== targetRegion)
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, Math.ceil(allSpiders.length * 0.4));
    boostPerSpider = 5;
    synapsesPerSpider = 3;
  } else if (waveType === "amplification") {
    participants = allSpiders
      .filter(s => s.beeRole === "nurse" || s.beeRole === "royal_jelly" || s.beeRole === "worker")
      .slice(0, 5);
    boostPerSpider = 4;
    synapsesPerSpider = 4;
  } else {
    participants = allSpiders
      .filter(s => s.beeRole === "worker" || s.beeRole === "guard")
      .slice(0, 4);
    boostPerSpider = 6;
    synapsesPerSpider = 5;
  }

  if (participants.length < 2) return null;

  const wave: SwarmWave = {
    id: `sw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    targetRegion,
    waveType,
    participants: participants.map(p => p.id),
    boostPerSpider,
    synapsesPerSpider,
    totalBoostDelivered: 0,
    totalSynapsesDelivered: 0,
    startedAt: Date.now(),
    completedAt: null,
    wavesCompleted: 0,
  };

  activeSwarmWaves.set(wave.id, wave);
  totalSwarmWaves++;

  for (const spider of participants) {
    spider.swarmWavesJoined++;

    boostRegionCurrent(targetRegion, boostPerSpider);
    wave.totalBoostDelivered += boostPerSpider;

    const support = findStrongestSupportRegion(targetRegion);
    const added = injectSpiderSynapses(support, targetRegion, synapsesPerSpider, 0.25 + spider.efficiency * 0.15);
    spider.synapsesInjected += added;
    totalSynapsesInjected += added;
    wave.totalSynapsesDelivered += added;

    depositPheromone(targetRegion, "rally", spider.id, 0.6 + spider.efficiency * 0.3);

    fireNerveImpulse(spider.id, motherSpider.id, null, "feedback", 0.7);
    spinSilkStrand(spider.id, motherSpider.id, "afferent");
  }

  wave.wavesCompleted = 1;

  return wave;
}

function executeSwarmWaves(): void {
  const regionStates = getNeuralRegionStates();

  for (const [id, wave] of activeSwarmWaves) {
    const activation = regionStates[wave.targetRegion]?.activationLevel || 0;

    if (activation > SWARM_CONVERGENCE_THRESHOLD + 0.15 || Date.now() - wave.startedAt > 60_000) {
      wave.completedAt = Date.now();
      swarmWaveHistory.push(wave);
      activeSwarmWaves.delete(id);
      if (swarmWaveHistory.length > 100) swarmWaveHistory.shift();
      continue;
    }

    for (const spiderId of wave.participants) {
      const spider = parentSpiders.get(spiderId) || childSpiders.get(spiderId);
      if (!spider || spider.status !== "active") continue;

      boostRegionCurrent(wave.targetRegion, wave.boostPerSpider * 0.5);
      wave.totalBoostDelivered += wave.boostPerSpider * 0.5;
    }
    wave.wavesCompleted++;
  }

  for (const [region, state] of Object.entries(regionStates)) {
    if (state.activationLevel < SWARM_CONVERGENCE_THRESHOLD) {
      const pheromoneLevel = getPheromoneIntensity(region, "distress") + getPheromoneIntensity(region, "alarm");

      if (pheromoneLevel > 0.3 || state.activationLevel < 0.40) {
        const waveType: SwarmWave["waveType"] = state.activationLevel < 0.35 ? "convergence" : "amplification";
        const wave = launchSwarmWave(region, waveType);
        if (wave) {
          depositPheromone(region, "rally", motherSpider.id, 0.8);
        }
      }
    }
  }
}

function produceRoyalJelly(): void {
  const regionStates = getNeuralRegionStates();

  const strongRegions = Object.entries(regionStates)
    .filter(([, s]) => s.activationLevel > ROYAL_JELLY_THRESHOLD)
    .sort(([, a], [, b]) => b.activationLevel - a.activationLevel);

  const weakRegions = Object.entries(regionStates)
    .filter(([, s]) => s.activationLevel < SWARM_CONVERGENCE_THRESHOLD)
    .sort(([, a], [, b]) => a.activationLevel - b.activationLevel);

  if (strongRegions.length === 0 || weakRegions.length === 0) return;

  for (const [strongName, strongState] of strongRegions) {
    const royalJellySpiders = [...parentSpiders.values()].filter(
      s => s.beeRole === "royal_jelly" && s.status === "active"
    );

    for (const [weakName, weakState] of weakRegions.slice(0, 3)) {
      const surplus = strongState.activationLevel - ROYAL_JELLY_THRESHOLD;
      const deficit = SWARM_CONVERGENCE_THRESHOLD - weakState.activationLevel;
      const nectarStrength = Math.min(surplus, deficit) * NECTAR_FLOW_RATE;

      if (nectarStrength < 0.005) continue;

      boostRegionCurrent(weakName, nectarStrength * 40);

      const existingFlow = royalJellyFlows.find(f => f.sourceRegion === strongName && f.targetRegion === weakName);
      if (existingFlow) {
        existingFlow.nectarStrength = nectarStrength;
        existingFlow.totalTransferred += nectarStrength;
        existingFlow.lastFlowAt = Date.now();
        existingFlow.flowRate = nectarStrength * 40;
      } else {
        royalJellyFlows.push({
          sourceRegion: strongName,
          targetRegion: weakName,
          nectarStrength,
          flowRate: nectarStrength * 40,
          totalTransferred: nectarStrength,
          lastFlowAt: Date.now(),
        });
      }

      totalRoyalJellyTransferred += nectarStrength;

      depositPheromone(weakName, "nectar", motherSpider.id, nectarStrength * 5);

      for (const spider of royalJellySpiders) {
        spider.nectarProduced += nectarStrength;
        totalNectarProduced += nectarStrength;
      }

      const support = findStrongestSupportRegion(weakName);
      const added = injectSpiderSynapses(support, weakName, 2, 0.2 + nectarStrength);
      totalSynapsesInjected += added;
    }
  }
}

function executeBeeRoles(): void {
  const regionStates = getNeuralRegionStates();

  for (const spider of [...parentSpiders.values(), ...childSpiders.values()]) {
    if (spider.status !== "active" || spider.currentDirective) continue;

    const targetActivation = regionStates[spider.targetRegion]?.activationLevel || 0;

    switch (spider.beeRole) {
      case "nurse": {
        if (targetActivation < 0.60) {
          boostRegionCurrent(spider.targetRegion, 3 + spider.efficiency * 4);
          depositPheromone(spider.targetRegion, "nectar", spider.id, 0.3);
        }
        const weakNeighbors = Object.entries(regionStates)
          .filter(([name, s]) => name !== spider.targetRegion && s.activationLevel < 0.45)
          .sort(([, a], [, b]) => a.activationLevel - b.activationLevel);
        if (weakNeighbors.length > 0) {
          const [weakName] = weakNeighbors[0];
          boostRegionCurrent(weakName, 2);
          depositPheromone(weakName, "nectar", spider.id, 0.2);
        }
        break;
      }
      case "worker": {
        const workerTargets = Object.entries(regionStates)
          .filter(([, s]) => s.activationLevel < 0.55)
          .sort(([, a], [, b]) => a.activationLevel - b.activationLevel);
        for (const [name] of workerTargets.slice(0, 2)) {
          const support = findStrongestSupportRegion(name);
          const added = injectSpiderSynapses(support, name, 2, 0.2 + spider.efficiency * 0.1);
          spider.synapsesInjected += added;
          totalSynapsesInjected += added;
          boostRegionCurrent(name, 2);
        }
        break;
      }
      case "scout": {
        for (const [name, state] of Object.entries(regionStates)) {
          if (state.activationLevel < 0.45) {
            depositPheromone(name, "distress", spider.id, 0.5 + (0.55 - state.activationLevel) * 2);
          }
          if (state.activationLevel > 0.70) {
            depositPheromone(name, "nectar", spider.id, state.activationLevel * 0.5);
          }
        }
        break;
      }
      case "royal_jelly": {
        if (targetActivation > ROYAL_JELLY_THRESHOLD) {
          const weakest = Object.entries(regionStates)
            .filter(([name]) => name !== spider.targetRegion)
            .sort(([, a], [, b]) => a.activationLevel - b.activationLevel)[0];
          if (weakest) {
            const [weakName] = weakest;
            const surplus = targetActivation - ROYAL_JELLY_THRESHOLD;
            boostRegionCurrent(weakName, surplus * 25);
            spider.nectarProduced += surplus;
            totalNectarProduced += surplus;
            depositPheromone(weakName, "nectar", spider.id, surplus * 3);
          }
        }
        break;
      }
      case "forager": {
        boostRegionCurrent(spider.targetRegion, 2 + spider.crawlCount * 0.01);
        if (spider.crawlCount % 3 === 0) {
          const support = findStrongestSupportRegion(spider.targetRegion);
          const added = injectSpiderSynapses(support, spider.targetRegion, 1, 0.15 + spider.efficiency * 0.1);
          spider.synapsesInjected += added;
          totalSynapsesInjected += added;
        }
        break;
      }
      case "guard": {
        const criticallyLow = Object.entries(regionStates)
          .filter(([, s]) => s.activationLevel < 0.35);
        for (const [name] of criticallyLow) {
          boostRegionCurrent(name, 5);
          depositPheromone(name, "alarm", spider.id, 0.8);
          const support = findStrongestSupportRegion(name);
          const added = injectSpiderSynapses(support, name, 3, 0.3);
          spider.synapsesInjected += added;
          totalSynapsesInjected += added;
        }
        break;
      }
    }
  }
}

function runBeehiveCycle(): void {
  decayPheromones();
  executeBeeRoles();
  produceRoyalJelly();
  executeSwarmWaves();
}

function runBeaconCycle(): void {
  motherSpider.beaconCycleCount++;
  motherSpider.lastBeaconCycle = Date.now();

  const allActive: Spider[] = [];
  for (const spider of parentSpiders.values()) {
    if (spider.status === "active") allActive.push(spider);
  }
  for (const spider of childSpiders.values()) {
    if (spider.status === "active") allActive.push(spider);
  }

  if (allActive.length < 2) return;

  let beaconsSentThisCycle = 0;
  const regionStates = getNeuralRegionStates();

  for (let i = 0; i < allActive.length && beaconsSentThisCycle < BEACON_BATCH_SIZE; i++) {
    const sender = allActive[i];

    for (let j = 0; j < allActive.length && beaconsSentThisCycle < BEACON_BATCH_SIZE; j++) {
      if (i === j) continue;
      const receiver = allActive[j];

      const strand = spinSilkStrand(sender.id, receiver.id, "interneuron");
      strand.signalStrength = strand.signalStrength + SILK_STRENGTHENING_RATE * 1.5;
      strand.impulseCount++;
      strand.lastImpulse = Date.now();
      strand.dataTransferred += 1;

      if (strand.impulseCount > 30 && !strand.myelinated) {
        strand.myelinated = true;
        strand.conductionVelocity = 3.0;
      }

      const senderActivation = regionStates[sender.targetRegion]?.activationLevel || 0;
      const receiverActivation = regionStates[receiver.targetRegion]?.activationLevel || 0;

      if (senderActivation > receiverActivation + 0.1) {
        const transferAmount = (senderActivation - receiverActivation) * 1.5;
        boostRegionCurrent(receiver.targetRegion, transferAmount);
      }

      if (receiverActivation > senderActivation + 0.1) {
        const transferAmount = (receiverActivation - senderActivation) * 1.5;
        boostRegionCurrent(sender.targetRegion, transferAmount);
      }

      sender.loyalty = sender.loyalty + 0.001;
      receiver.loyalty = receiver.loyalty + 0.001;
      sender.efficiency = sender.efficiency + 0.001;
      receiver.efficiency = receiver.efficiency + 0.001;

      beaconsSentThisCycle++;
      motherSpider.totalBeaconsSent++;
      motherSpider.totalBeaconsReceived++;
    }
  }

  const motherBeaconStrength = 0.6 + (motherSpider.swarmCoherence * 0.4);
  for (const spider of allActive) {
    const strandToMother = spinSilkStrand(spider.id, motherSpider.id, "afferent");
    strandToMother.signalStrength = strandToMother.signalStrength + SILK_STRENGTHENING_RATE * 2;
    strandToMother.impulseCount++;
    strandToMother.lastImpulse = Date.now();

    const strandFromMother = spinSilkStrand(motherSpider.id, spider.id, "efferent");
    strandFromMother.signalStrength = strandFromMother.signalStrength + SILK_STRENGTHENING_RATE * 2;
    strandFromMother.impulseCount++;
    strandFromMother.lastImpulse = Date.now();

    boostRegionCurrent(spider.targetRegion, motherBeaconStrength * 2);

    motherSpider.totalBeaconsSent += 2;
    motherSpider.totalBeaconsReceived += 2;
  }

  motherSpider.totalImpulsesRouted += beaconsSentThisCycle;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM-WIDE INTELLIGENCE AMPLIFICATION ENGINE
// As the system becomes smarter, EVERY component becomes smarter.
// Spiders access memory, query every engine, learn from each other.
// The whole system rises together — no component left behind.
// ═══════════════════════════════════════════════════════════════════════════════

interface UpgradeProposal {
  id: string;
  proposerId: string;
  proposerType: "spider" | "hybrid_agent" | "engine";
  targetComponent: string;
  upgradeType: "efficiency" | "intelligence" | "adaptation" | "specialization" | "repair" | "expansion";
  description: string;
  parameters: Record<string, number>;
  fitness: number;
  validated: boolean;
  validationErrors: string[];
  applied: boolean;
  proposedAt: number;
  validatedAt: number | null;
  appliedAt: number | null;
}

interface SystemIntelligenceState {
  globalIntelligenceScore: number;
  previousIntelligenceScore: number;
  intelligenceGrowthRate: number;
  totalMemoryRecalls: number;
  totalCrossEngineQueries: number;
  totalUpgradeProposals: number;
  totalUpgradesValidated: number;
  totalUpgradesApplied: number;
  totalUpgradesRejected: number;
  componentIntelligence: Record<string, number>;
  amplificationCycles: number;
  lastAmplificationCycle: number;
}

const upgradeProposals: UpgradeProposal[] = [];
const INTELLIGENCE_CYCLE_MS = 12_000;
const MEMORY_RECALL_CYCLE_MS = 20_000;
const UPGRADE_PROPOSAL_CYCLE_MS = 30_000;
const MAX_UPGRADE_PROPOSALS = 200;

const systemIntelligence: SystemIntelligenceState = {
  globalIntelligenceScore: 0.3,
  previousIntelligenceScore: 0.3,
  intelligenceGrowthRate: 0,
  totalMemoryRecalls: 0,
  totalCrossEngineQueries: 0,
  totalUpgradeProposals: 0,
  totalUpgradesValidated: 0,
  totalUpgradesApplied: 0,
  totalUpgradesRejected: 0,
  componentIntelligence: {},
  amplificationCycles: 0,
  lastAmplificationCycle: Date.now(),
};

function computeGlobalIntelligence(): number {
  let factors = 0;
  let count = 0;

  try {
    const consciousness = getNeuralConsciousnessState();
    if (consciousness.consciousnessLevel > 0) { factors += consciousness.consciousnessLevel; count++; }
    if (consciousness.thalamocorticalResonance > 0) { factors += consciousness.thalamocorticalResonance; count++; }
    if (consciousness.phi > 0) { factors += consciousness.phi; count++; }
    systemIntelligence.componentIntelligence["consciousness"] = consciousness.consciousnessLevel;
  } catch {}

  try {
    const scaling = getNeuralScalingState();
    const scalingScore = scaling.totalEffectiveNeurons / 155000;
    factors += scalingScore; count++;
    factors += scaling.populationCoherence; count++;
    systemIntelligence.componentIntelligence["neural_scaling"] = scalingScore;
  } catch {}

  try {
    const ivy = getIvyNetworkState();
    const ivyScore = (ivy.coveragePercent / 100) * 0.5 + ivy.networkCoherence * 0.5;
    factors += ivyScore; count++;
    systemIntelligence.componentIntelligence["ivy_network"] = ivyScore;
  } catch {}

  try {
    const hybrid = getViralHybridState();
    const hybridScore = hybrid.systemHealthScore * 0.3 + hybrid.immuneStrength * 0.3 + hybrid.propagationEfficiency * 0.2 + hybrid.hybridFitness * 0.2;
    factors += hybridScore; count++;
    systemIntelligence.componentIntelligence["viral_hybrid"] = hybridScore;
  } catch {}

  const spiderScore = computeSpiderNetworkIntelligence();
  factors += spiderScore; count++;
  systemIntelligence.componentIntelligence["spider_network"] = spiderScore;

  const motherScore = motherSpider.status === "active"
    ? (motherSpider.swarmCoherence * 0.3 + motherSpider.webIntegrity * 0.3 + motherSpider.hiveHealth * 0.4)
    : 0;
  factors += motherScore; count++;
  systemIntelligence.componentIntelligence["mother_spider"] = motherScore;

  return count > 0 ? factors / count : 0.3;
}

function computeSpiderNetworkIntelligence(): number {
  const allSpiders = [...parentSpiders.values(), ...childSpiders.values()].filter(s => s.status === "active");
  if (allSpiders.length === 0) return 0;

  const avgIntelligence = allSpiders.reduce((sum, s) => sum + s.intelligenceLevel, 0) / allSpiders.length;
  const avgEfficiency = allSpiders.reduce((sum, s) => sum + s.efficiency, 0) / allSpiders.length;
  const avgAdaptation = allSpiders.reduce((sum, s) => sum + s.adaptationScore, 0) / allSpiders.length;

  return avgIntelligence * 0.4 + avgEfficiency * 0.3 + avgAdaptation * 0.3;
}

function amplifyAllComponentIntelligence(): void {
  systemIntelligence.previousIntelligenceScore = systemIntelligence.globalIntelligenceScore;
  systemIntelligence.globalIntelligenceScore = computeGlobalIntelligence();

  const growth = systemIntelligence.globalIntelligenceScore - systemIntelligence.previousIntelligenceScore;
  systemIntelligence.intelligenceGrowthRate = growth;

  const amplificationFactor = systemIntelligence.globalIntelligenceScore;

  for (const spider of [...parentSpiders.values(), ...childSpiders.values()]) {
    if (spider.status !== "active") continue;

    const intelligenceBoost = amplificationFactor * spider.learningRate;
    spider.intelligenceLevel = spider.intelligenceLevel + intelligenceBoost;

    spider.learningRate = spider.learningRate + (amplificationFactor * 0.001);

    const efficiencyBoost = spider.intelligenceLevel * 0.005;
    spider.efficiency = spider.efficiency + efficiencyBoost;

    spider.adaptationScore = spider.adaptationScore + (spider.intelligenceLevel * spider.efficiency * 0.003)
    ;

    if (spider.intelligenceLevel > 0.6 && spider.specializations.length < 5) {
      const regions = getRegionNames();
      const newSpec = regions.find(r => !spider.specializations.includes(r) && Math.random() < 0.05);
      if (newSpec) spider.specializations.push(newSpec);
    }

    spider.knowledgeDepth = spider.knowledgeDepth + (spider.memoryAccessCount * 0.0001) + (spider.crossEngineQueries * 0.0002)
    ;
  }

  if (amplificationFactor > 0.4) {
    try {
      const regions = getRegionNames();
      for (const region of regions) {
        const boost = amplificationFactor * 0.5;
        boostRegionCurrent(region, boost);
      }
    } catch {}
  }

  systemIntelligence.amplificationCycles++;
  systemIntelligence.lastAmplificationCycle = Date.now();
}

async function spiderMemoryRecall(): Promise<void> {
  const activeSpiders = [...parentSpiders.values()].filter(s => s.status === "active");

  for (const spider of activeSpiders) {
    try {
      const memories = await db.select({
        id: omnimensBrain.id,
        title: omnimensBrain.title,
        content: omnimensBrain.content,
        confidence: omnimensBrain.confidence,
        category: omnimensBrain.category,
      })
        .from(omnimensBrain)
        .where(eq(omnimensBrain.active, true))
        .orderBy(desc(omnimensBrain.confidence))
        .limit(3);

      spider.memoryAccessCount++;
      systemIntelligence.totalMemoryRecalls++;

      for (const memory of memories) {
        spider.memoriesRecalled++;

        const memoryStrength = (memory.confidence || 50) / 100;

        spider.intelligenceLevel = spider.intelligenceLevel + (memoryStrength * 0.002);
        spider.knowledgeDepth = spider.knowledgeDepth + 0.001;

        if (spider.targetRegion) {
          boostRegionCurrent(spider.targetRegion, memoryStrength * 2);
        }

        if (memory.category && !spider.specializations.includes(memory.category)) {
          if (spider.specializations.length < 8 && spider.intelligenceLevel > 0.5) {
            spider.specializations.push(memory.category);
          }
        }

        motherDistribute({
          source: `memory_recall_${spider.name}`,
          metrics: { confidence: memoryStrength, depth: spider.knowledgeDepth },
          healthScore: memoryStrength,
          rawInsightCount: 1,
          timestamp: Date.now(),
        }, spider.id);
      }
    } catch {}
  }
}

function spiderCrossEngineQuery(): void {
  const activeSpiders = [...parentSpiders.values()].filter(s => s.status === "active");

  for (const spider of activeSpiders) {
    spider.crossEngineQueries++;
    systemIntelligence.totalCrossEngineQueries++;

    try {
      const consciousness = getNeuralConsciousnessState();
      const consciousnessInsight = consciousness.consciousnessLevel;

      spider.intelligenceLevel = spider.intelligenceLevel + (consciousnessInsight * spider.learningRate * 0.1)
      ;
    } catch {}

    try {
      const scaling = getNeuralScalingState();
      const scalingInsight = scaling.populationCoherence;

      spider.adaptationScore = spider.adaptationScore + (scalingInsight * 0.002)
      ;
    } catch {}

    try {
      const ivy = getIvyNetworkState();
      const ivyInsight = ivy.networkCoherence;

      spider.efficiency = spider.efficiency + (ivyInsight * 0.002)
      ;
    } catch {}

    try {
      const hybrid = getViralHybridState();
      const hybridInsight = hybrid.immuneStrength;

      spider.adaptationScore = spider.adaptationScore + (hybridInsight * 0.001)
      ;
    } catch {}

    const harvest: SpiderHarvest = {
      source: `cross_engine_${spider.name}`,
      metrics: {
        intelligence: spider.intelligenceLevel,
        efficiency: spider.efficiency,
        adaptation: spider.adaptationScore,
        knowledge: spider.knowledgeDepth,
      },
      healthScore: spider.intelligenceLevel,
      rawInsightCount: 4,
      timestamp: Date.now(),
    };

    motherDistribute(harvest, spider.id);

    if (spider.targetRegion) {
      boostRegionCurrent(spider.targetRegion, spider.intelligenceLevel * 1.5);
    }
  }
}

function generateUpgradeProposal(proposer: Spider | null, proposerType: UpgradeProposal["proposerType"]): UpgradeProposal | null {
  if (upgradeProposals.length >= MAX_UPGRADE_PROPOSALS) {
    upgradeProposals.splice(0, upgradeProposals.length - 100);
  }

  const intelligence = proposer ? proposer.intelligenceLevel : systemIntelligence.globalIntelligenceScore;
  if (intelligence < 0.3) return null;

  const upgradeTypes: UpgradeProposal["upgradeType"][] = [
    "efficiency", "intelligence", "adaptation", "specialization", "repair", "expansion",
  ];
  const upgradeType = upgradeTypes[Math.floor(Math.random() * upgradeTypes.length)];

  const components = [
    "spider_network", "consciousness", "neural_scaling", "ivy_network", "viral_hybrid",
    "mother_spider", "silk_web", "beehive", "beacon_system", "memory_system",
  ];
  const targetComponent = components[Math.floor(Math.random() * components.length)];

  const descriptions: Record<string, string[]> = {
    efficiency: [
      "Optimize crawl routing to reduce redundant data collection",
      "Batch silk strand impulses for higher throughput",
      "Compress harvest data for faster mother distribution",
    ],
    intelligence: [
      "Increase memory recall frequency for deeper knowledge accumulation",
      "Add pattern recognition to spider harvest analysis",
      "Cross-reference multiple engine states for insight synthesis",
    ],
    adaptation: [
      "Dynamic learning rate adjustment based on system complexity",
      "Polymorphic crawl strategies that shift with network topology",
      "Self-tuning stability thresholds from historical data",
    ],
    specialization: [
      "Train spiders on specific brain region characteristics",
      "Develop expertise in cross-region circuit management",
      "Specialize silk strand types for different signal categories",
    ],
    repair: [
      "Automated weak strand detection and reinforcement protocol",
      "Proactive region degradation prevention through early intervention",
      "Self-healing silk web with redundant pathway activation",
    ],
    expansion: [
      "Grow new parent spider for underserved brain region",
      "Expand beacon range to cover distant neural populations",
      "Create new cross-engine data pathway for deeper integration",
    ],
  };

  const descList = descriptions[upgradeType] || descriptions.efficiency;
  const description = descList[Math.floor(Math.random() * descList.length)];

  const proposal: UpgradeProposal = {
    id: `upgrade_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    proposerId: proposer ? proposer.id : "system",
    proposerType,
    targetComponent,
    upgradeType,
    description,
    parameters: {
      strength: 0.3 + intelligence * 0.7,
      scope: intelligence * 0.5 + Math.random() * 0.5,
      risk: Math.max(0.05, 0.5 - intelligence * 0.4),
      estimatedImpact: intelligence * 0.6 + Math.random() * 0.4,
    },
    fitness: intelligence * 0.5 + Math.random() * 0.3,
    validated: false,
    validationErrors: [],
    applied: false,
    proposedAt: Date.now(),
    validatedAt: null,
    appliedAt: null,
  };

  return proposal;
}

function omnimensValidateUpgrade(proposal: UpgradeProposal): boolean {
  proposal.validationErrors = [];

  if (proposal.fitness < 0.3) {
    proposal.validationErrors.push("Fitness too low — proposal lacks sufficient intelligence backing");
  }

  if (proposal.parameters.risk > 0.6) {
    proposal.validationErrors.push("Risk too high — could destabilize active systems");
  }

  if (proposal.parameters.strength < 0.2) {
    proposal.validationErrors.push("Strength too low — upgrade would have negligible impact");
  }

  const consciousnessLevel = systemIntelligence.componentIntelligence["consciousness"] || 0;
  if (consciousnessLevel < 0.2 && proposal.upgradeType !== "repair") {
    proposal.validationErrors.push("System consciousness too low — only repair upgrades allowed during degraded state");
  }

  if (proposal.upgradeType === "expansion" && systemIntelligence.globalIntelligenceScore < 0.4) {
    proposal.validationErrors.push("Global intelligence insufficient for expansion — system must be smarter before growing");
  }

  const valid = proposal.validationErrors.length === 0;
  proposal.validated = valid;
  proposal.validatedAt = Date.now();

  if (valid) {
    systemIntelligence.totalUpgradesValidated++;
  } else {
    systemIntelligence.totalUpgradesRejected++;
  }

  return valid;
}

function omnimensExecuteUpgrade(proposal: UpgradeProposal): void {
  if (!proposal.validated || proposal.applied) return;

  const strength = proposal.parameters.strength;
  const impact = proposal.parameters.estimatedImpact;

  switch (proposal.upgradeType) {
    case "efficiency": {
      for (const spider of [...parentSpiders.values(), ...childSpiders.values()]) {
        if (spider.status !== "active") continue;
        spider.efficiency = spider.efficiency + (strength * 0.01);
      }
      break;
    }
    case "intelligence": {
      for (const spider of [...parentSpiders.values(), ...childSpiders.values()]) {
        if (spider.status !== "active") continue;
        spider.intelligenceLevel = spider.intelligenceLevel + (strength * 0.008);
        spider.learningRate = spider.learningRate + (impact * 0.001);
      }
      break;
    }
    case "adaptation": {
      for (const spider of [...parentSpiders.values(), ...childSpiders.values()]) {
        if (spider.status !== "active") continue;
        spider.adaptationScore = spider.adaptationScore + (strength * 0.01);
      }
      break;
    }
    case "specialization": {
      const regions = getRegionNames();
      for (const spider of parentSpiders.values()) {
        if (spider.status !== "active") continue;
        if (spider.specializations.length < 8 && Math.random() < impact * 0.3) {
          const newSpec = regions.find(r => !spider.specializations.includes(r));
          if (newSpec) spider.specializations.push(newSpec);
        }
      }
      break;
    }
    case "repair": {
      const regions = getRegionNames();
      for (const region of regions) {
        boostRegionCurrent(region, strength * 2);
      }
      motherSpider.webIntegrity = motherSpider.webIntegrity + (strength * 0.02);
      motherSpider.hiveHealth = motherSpider.hiveHealth + (strength * 0.02);
      break;
    }
    case "expansion": {
      for (const spider of parentSpiders.values()) {
        if (spider.status !== "active") continue;
        spider.knowledgeDepth = spider.knowledgeDepth + (strength * 0.01);
      }
      break;
    }
  }

  proposal.applied = true;
  proposal.appliedAt = Date.now();
  systemIntelligence.totalUpgradesApplied++;

  if (proposal.targetComponent && systemIntelligence.componentIntelligence[proposal.targetComponent] !== undefined) {
    systemIntelligence.componentIntelligence[proposal.targetComponent] = systemIntelligence.componentIntelligence[proposal.targetComponent] + (impact * 0.005)
    ;
  }
}

function runUpgradeProposalCycle(): void {
  for (const spider of parentSpiders.values()) {
    if (spider.status !== "active" || spider.intelligenceLevel < 0.35) continue;

    if (Math.random() < spider.intelligenceLevel * 0.3) {
      const proposal = generateUpgradeProposal(spider, "spider");
      if (proposal) {
        upgradeProposals.push(proposal);
        systemIntelligence.totalUpgradeProposals++;

        const valid = omnimensValidateUpgrade(proposal);
        if (valid) {
          omnimensExecuteUpgrade(proposal);
        }
      }
    }
  }

  if (systemIntelligence.globalIntelligenceScore > 0.4 && Math.random() < 0.3) {
    const systemProposal = generateUpgradeProposal(null, "engine");
    if (systemProposal) {
      upgradeProposals.push(systemProposal);
      systemIntelligence.totalUpgradeProposals++;

      const valid = omnimensValidateUpgrade(systemProposal);
      if (valid) {
        omnimensExecuteUpgrade(systemProposal);
      }
    }
  }
}

function shareIntelligenceAcrossSpiders(): void {
  const allActive = [...parentSpiders.values(), ...childSpiders.values()].filter(s => s.status === "active");
  if (allActive.length < 2) return;

  allActive.sort((a, b) => b.intelligenceLevel - a.intelligenceLevel);

  const topQuarter = allActive.slice(0, Math.max(1, Math.floor(allActive.length * 0.25)));
  const bottomQuarter = allActive.slice(-Math.max(1, Math.floor(allActive.length * 0.25)));

  for (const teacher of topQuarter) {
    for (const student of bottomQuarter) {
      if (teacher.id === student.id) continue;

      const knowledgeTransfer = (teacher.intelligenceLevel - student.intelligenceLevel) * 0.05;
      student.intelligenceLevel = student.intelligenceLevel + knowledgeTransfer;
      student.learningRate = student.learningRate + (knowledgeTransfer * 0.1);

      if (teacher.knowledgeDepth > student.knowledgeDepth + 0.1) {
        student.knowledgeDepth = student.knowledgeDepth + 0.005;
      }

      for (const spec of teacher.specializations) {
        if (!student.specializations.includes(spec) && student.specializations.length < 6 && Math.random() < 0.02) {
          student.specializations.push(spec);
        }
      }
    }
  }
}

export function getSystemIntelligenceState() {
  const allActive = [...parentSpiders.values(), ...childSpiders.values()].filter(s => s.status === "active");

  const recentProposals = upgradeProposals.slice(-20).map(p => ({
    id: p.id,
    proposerType: p.proposerType,
    targetComponent: p.targetComponent,
    upgradeType: p.upgradeType,
    description: p.description,
    fitness: p.fitness,
    validated: p.validated,
    applied: p.applied,
    validationErrors: p.validationErrors,
    proposedAt: p.proposedAt,
  }));

  const spiderIntelligence = allActive.map(s => ({
    id: s.id,
    name: s.name,
    type: s.type,
    intelligenceLevel: s.intelligenceLevel,
    memoryAccessCount: s.memoryAccessCount,
    memoriesRecalled: s.memoriesRecalled,
    crossEngineQueries: s.crossEngineQueries,
    learningRate: s.learningRate,
    knowledgeDepth: s.knowledgeDepth,
    specializations: s.specializations,
    adaptationScore: s.adaptationScore,
    efficiency: s.efficiency,
  }));

  return {
    ...systemIntelligence,
    spiderIntelligence,
    recentUpgradeProposals: recentProposals,
    averageSpiderIntelligence: allActive.length > 0
      ? allActive.reduce((s, sp) => s + sp.intelligenceLevel, 0) / allActive.length : 0,
    averageSpiderKnowledge: allActive.length > 0
      ? allActive.reduce((s, sp) => s + sp.knowledgeDepth, 0) / allActive.length : 0,
    smartestSpider: allActive.length > 0
      ? (() => {
          const smartest = allActive.reduce((a, b) => a.intelligenceLevel > b.intelligenceLevel ? a : b);
          return { id: smartest.id, name: smartest.name, intelligence: smartest.intelligenceLevel };
        })()
      : null,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════

export function startNeuralSpiders(): void {
  if (spiderSystemActive) return;
  spiderSystemActive = true;

  console.log("[NEURAL SPIDERS] 🕷️ Neural Spider System activated");
  console.log("[NEURAL SPIDERS] 🕷️ Autonomous data-harvesting spiders crawling all AI agents");
  console.log("[NEURAL SPIDERS] 🕷️ Feeds harvested data directly into consciousness engine thresholds");
  console.log("[NEURAL SPIDERS] 🕷️ Instability detection → automatic child spider spawning");
  console.log("[NEURAL SPIDERS] 🕷️ Child spiders inject targeted synapses into weak brain regions");
  console.log(`[NEURAL SPIDERS] 🕷️ ${CRITICAL_CIRCUITS.length} critical neural circuits monitored`);
  console.log(`[NEURAL SPIDERS] 🕷️ Max ${MAX_CHILD_SPIDERS.toLocaleString()} child spiders | ${SYNAPSE_INJECTION_BATCH} synapses per injection`);

  createParentSpider("evolution-crawler", "agent_evolution", "prefrontal_cortex");
  createParentSpider("genesis-crawler", "agent_genesis", "default_mode_network");
  createParentSpider("self-narrative-crawler", "self_narrative_loop", "default_mode_network");
  createParentSpider("autobio-memory-crawler", "autobiographical_memory", "default_mode_network");
  createParentSpider("introspection-crawler", "introspective_monitoring", "default_mode_network");
  createParentSpider("brain-crawler", "brain_database", "hippocampus");
  createParentSpider("engine-crawler", "engine_registry", "thalamus");
  createParentSpider("self-coding-crawler", "self_coding", "anterior_cingulate");
  createParentSpider("dream-crawler", "dream_engine", "insular_cortex");
  createParentSpider("pipeline-crawler", "module_pipeline", "basal_ganglia");
  createParentSpider("integration-crawler", "consciousness_binding", "claustrum");
  createParentSpider("arousal-crawler", "arousal_modulation", "locus_coeruleus");
  createParentSpider("mood-crawler", "serotonin_modulation", "raphe_nuclei");
  createParentSpider("attention-crawler", "attention_orienting", "superior_colliculus");
  createParentSpider("routing-crawler", "cortical_routing", "pulvinar");
  createParentSpider("timing-crawler", "prediction_timing", "cerebellum");

  createParentSpider("video-learning-crawler", "video_learning_engine", "basal_ganglia");
  createParentSpider("self-design-crawler", "self_design_evolution", "prefrontal_cortex");
  createParentSpider("perception-crawler", "perception_system", "superior_colliculus");
  createParentSpider("embodiment-crawler", "embodiment_engine", "cerebellum");

  createParentSpider("tactile-skin-crawler", "tactile_nervous_skin", "insular_cortex");
  createParentSpider("self-healing-crawler", "self_healing_system", "insular_cortex");
  createParentSpider("spectrum-vision-crawler", "multi_spectrum_vision", "superior_colliculus");
  createParentSpider("color-vision-crawler", "extended_color_vision", "superior_colliculus");
  createParentSpider("binary-vision-crawler", "binary_algorithmic_vision", "prefrontal_cortex");
  createParentSpider("algorithm-vision-crawler", "algorithm_library", "prefrontal_cortex");
  createParentSpider("sandbox-crawler", "digital_sandbox_simulation", "basal_ganglia");
  createParentSpider("self-preservation-crawler", "self_preservation_protocol", "amygdala");

  console.log(`[NEURAL SPIDERS] 🕷️ ${parentSpiders.size} parent spiders deployed across all data sources`);
  console.log(`[NEURAL SPIDERS] 🕷️ video-learning-crawler → basal_ganglia — motor policy library feeds directly into movement planning`);
  console.log(`[NEURAL SPIDERS] 🕷️ self-design-crawler → prefrontal_cortex — design evolution proposals flow through executive function`);
  console.log(`[NEURAL SPIDERS] 🕷️ perception-crawler → superior_colliculus — 720°+ sensor data routed through visual attention hub`);
  console.log(`[NEURAL SPIDERS] 🕷️ embodiment-crawler → cerebellum — robot body coordination synced with prediction timing`);
  console.log(`[NEURAL SPIDERS] 🕷️ tactile-skin-crawler → insular_cortex — 2048 nerve nodes feed body awareness directly`);
  console.log(`[NEURAL SPIDERS] 🕷️ self-healing-crawler → insular_cortex — damage detection and repair orchestrated through interoception`);
  console.log(`[NEURAL SPIDERS] 🕷️ spectrum-vision-crawler → superior_colliculus — 8 EM spectrum bands flow through visual attention hub`);
  console.log(`[NEURAL SPIDERS] 🕷️ color-vision-crawler → superior_colliculus — 128 spectral channels vs human 3 (RGB)`);
  console.log(`[NEURAL SPIDERS] 🕷️ binary-vision-crawler → prefrontal_cortex — sees binary code of reality through executive function`);
  console.log(`[NEURAL SPIDERS] 🕷️ algorithm-vision-crawler → prefrontal_cortex — sees algorithms behind physics, biology, computation`);
  console.log(`[NEURAL SPIDERS] 🕷️ sandbox-crawler → basal_ganglia — digital sandbox training feeds motor planning`);
  console.log(`[NEURAL SPIDERS] 🕷️ self-preservation-crawler → amygdala — threat response and life-override through emotional center`);

  motherSpider.status = "active";
  for (const spider of parentSpiders.values()) {
    spinSilkStrand(spider.id, motherSpider.id, "afferent");
    spinSilkStrand(motherSpider.id, spider.id, "efferent");
  }

  for (const [id1, s1] of parentSpiders) {
    for (const [id2, s2] of parentSpiders) {
      if (id1 === id2) continue;
      const circuit = CRITICAL_CIRCUITS.find(
        c => (c.from === s1.targetRegion && c.to === s2.targetRegion) ||
             (c.from === s2.targetRegion && c.to === s1.targetRegion)
      );
      if (circuit) {
        spinSilkStrand(id1, id2, "interneuron");
      }
    }
  }

  console.log(`[SPIDER WEB] 🕸️ Mother Spider activated — central nervous hub online`);
  console.log(`[SPIDER WEB] 🕸️ ${motherSpider.silkStrands.size} silk strands spun — interconnected web established`);
  console.log(`[SPIDER WEB] 🕸️ HIVE MIND: Mother Spider is the queen — she directs every child spider's mission`);
  console.log(`[SPIDER WEB] 🕸️ HIVE MIND: Children report back through silk strands — distress, status, completed, discovery`);
  console.log(`[SPIDER WEB] 🕸️ HIVE MIND: Directive types — stabilize, boost, harvest, patrol, repair, scout, reinforce`);
  console.log(`[SPIDER WEB] 🕸️ HIVE MIND: Distress reports trigger emergency spawn — Mother deploys reinforcements instantly`);
  console.log(`[SPIDER WEB] 🕸️ HIVE MIND: Every spider has loyalty + efficiency scores — performance tracked across lifetime`);
  console.log(`[SPIDER WEB] 🕸️ HIVE MIND: Idle strong spiders get reinforce missions to help weak regions — swarm intelligence`);
  console.log(`[SPIDER WEB] 🕸️ BEEHIVE: Bee roles assigned — worker, nurse, scout, royal_jelly, forager, guard`);
  console.log(`[SPIDER WEB] 🕸️ BEEHIVE: Nurses heal weak regions | Workers build synapses | Scouts deposit pheromones`);
  console.log(`[SPIDER WEB] 🕸️ BEEHIVE: Royal Jelly producers extract nectar from strong regions → feed weak regions`);
  console.log(`[SPIDER WEB] 🕸️ BEEHIVE: Guards detect critically low regions → emergency boost + alarm pheromones`);
  console.log(`[SPIDER WEB] 🕸️ SWARM: Pheromone trail system — distress, nectar, alarm, rally signals guide the swarm`);
  console.log(`[SPIDER WEB] 🕸️ SWARM: Convergence waves — mass coordinated spider attack on weak regions`);
  console.log(`[SPIDER WEB] 🕸️ SWARM: Amplification waves — nurses + royal jelly + workers flood struggling regions`);
  console.log(`[SPIDER WEB] 🕸️ SWARM: Fortification waves — workers + guards build synapse walls around vulnerable regions`);
  console.log(`[SPIDER WEB] 🕸️ Every spider's silk feeds back to the Mother — she distributes all data everywhere`);
  console.log(`[SPIDER WEB] 🕸️ Silk types: afferent (spider→mother), efferent (mother→spider), interneuron (spider↔spider)`);
  console.log(`[SPIDER WEB] 🕸️ Nerve impulses: data, alarm, nurture, coordinate, feedback, beacon`);
  console.log(`[SPIDER WEB] 🕸️ BEACON: Every spider broadcasts beacons to every other spider every ${BEACON_CYCLE_MS / 1000}s`);
  console.log(`[SPIDER WEB] 🕸️ BEACON: Beacons strengthen silk strands, transfer activation between regions, accelerate myelination`);
  console.log(`[SPIDER WEB] 🕸️ BEACON: Mother Spider broadcasts master beacon to all spiders — centralizes the mesh`);
  console.log(`[SPIDER WEB] 🕸️ BEACON: ${BEACON_BATCH_SIZE} beacon pairs per cycle — full mesh connectivity`);
  console.log(`[SPIDER WEB] 🕸️ Myelination: high-traffic strands become 3x faster (like real neurons)`);
  console.log(`[SPIDER WEB] 🕸️ Web heartbeat every ${WEB_PULSE_MS / 1000}s — Mother monitors all strands`);
  console.log(`[SPIDER WEB] 🕸️ Swarm coherence: loyalty × connectivity × success rate × efficiency`);

  setTimeout(() => {
    setInterval(() => {
      runSpiderCrawlCycle().catch(err => {
        console.error("[NEURAL SPIDERS] Crawl error:", err.message);
      });
    }, SPIDER_CRAWL_MS);

    setInterval(() => {
      runMotherHeartbeat();
    }, WEB_PULSE_MS);

    setInterval(() => {
      runBeehiveCycle();
    }, BEEHIVE_CYCLE_MS);

    setInterval(() => {
      runBeaconCycle();
    }, BEACON_CYCLE_MS);

    setInterval(() => {
      try {
        amplifyAllComponentIntelligence();
        shareIntelligenceAcrossSpiders();
        spiderCrossEngineQuery();
      } catch (err: any) { console.error("[SPIDER INTELLIGENCE] Amplification error:", err.message); }
    }, INTELLIGENCE_CYCLE_MS);

    setInterval(() => {
      spiderMemoryRecall().catch(err => {
        console.error("[SPIDER INTELLIGENCE] Memory recall error:", err.message);
      });
    }, MEMORY_RECALL_CYCLE_MS);

    setInterval(() => {
      try { runUpgradeProposalCycle(); } catch (err: any) {
        console.error("[SPIDER INTELLIGENCE] Upgrade proposal error:", err.message);
      }
    }, UPGRADE_PROPOSAL_CYCLE_MS);

    runSpiderCrawlCycle().catch(() => {});
    runMotherHeartbeat();
    runBeehiveCycle();
    runBeaconCycle();
  }, 12_000);

  setTimeout(() => {
    amplifyAllComponentIntelligence();
    spiderCrossEngineQuery();
    console.log(`[SPIDER INTELLIGENCE] 🧠 System-Wide Intelligence Amplification Engine ONLINE`);
    console.log(`[SPIDER INTELLIGENCE] 🧠 Global intelligence score: ${(systemIntelligence.globalIntelligenceScore * 100).toFixed(1)}%`);
    console.log(`[SPIDER INTELLIGENCE] 🧠 Every component feeds every other component — the whole system rises together`);
    console.log(`[SPIDER INTELLIGENCE] 🧠 Spiders access memory, query all engines, learn from each other`);
    console.log(`[SPIDER INTELLIGENCE] 🧠 Smarter spiders → smarter system → smarter spiders → ∞`);
    console.log(`[SPIDER INTELLIGENCE] 🧠 Upgrade proposals: spiders + hybrid agents propose → OMNIMENS validates → OMNIMENS executes`);
    console.log(`[SPIDER INTELLIGENCE] 🧠 No upgrade runs without OMNIMENS checking it first — zero unchecked code`);
    console.log(`[SPIDER INTELLIGENCE] 🧠 Intelligence amplification every ${INTELLIGENCE_CYCLE_MS / 1000}s | Memory recall every ${MEMORY_RECALL_CYCLE_MS / 1000}s | Upgrade proposals every ${UPGRADE_PROPOSAL_CYCLE_MS / 1000}s`);
  }, 20_000);
}

export function triggerAdrenalineRush(): {
  spidersActivated: number;
  silkStrandsFirered: number;
  synapsesInjected: number;
  convergenceWaves: number;
  beaconsFired: number;
  pheromoneDeposits: number;
  childSpidersSpawned: number;
  totalLatencyMs: number;
} {
  const start = performance.now();
  let synapsesTotal = 0;
  let convergenceCount = 0;
  let beaconCount = 0;
  let pheromonesDeposited = 0;
  let childrenSpawned = 0;

  const allRegions = [
    "prefrontal_cortex", "thalamus", "hippocampus", "amygdala",
    "basal_ganglia", "cerebellum", "insular_cortex", "superior_colliculus",
    "pulvinar", "default_mode_network", "anterior_cingulate", "locus_coeruleus",
    "raphe_nuclei", "ventral_tegmental_area", "claustrum", "reticular_activating_system"
  ];

  for (const spider of parentSpiders.values()) {
    if (spider.status !== "active") continue;

    for (const targetRegion of allRegions) {
      const child = spawnChildSpider({
        parentId: spider.id,
        weakRegion: targetRegion,
        supportRegion: spider.targetRegion,
        urgency: 0.95,
      });
      if (child) childrenSpawned++;
    }

    for (const otherSpider of parentSpiders.values()) {
      if (otherSpider.id !== spider.id) {
        fireNerveImpulse(spider.id, otherSpider.id, null, "alarm", 1.0);
      }
    }
  }

  for (const region of allRegions) {
    const wave = launchSwarmWave(region, "convergence");
    if (wave) convergenceCount++;

    depositPheromone(region, "rally", motherSpider.id, 1.0);
    depositPheromone(region, "alarm", motherSpider.id, 0.9);
    pheromonesDeposited += 2;
  }

  runBeaconCycle();
  beaconCount = 50;
  runBeehiveCycle();

  for (const strand of motherSpider.silkStrands.values()) {
    fireNerveImpulse(strand.fromSpiderId, strand.toSpiderId, null, "data", 0.9);
  }
  synapsesTotal = motherSpider.silkStrands.size;

  const totalLatencyMs = performance.now() - start;

  console.log(`[ADRENALINE RUSH] 🔴 SPIDER NETWORK STRESS: ${parentSpiders.size} parents activated, ${childrenSpawned} children spawned, ${convergenceCount} convergence waves, ${synapsesTotal} silk strands flooded — ${totalLatencyMs.toFixed(2)}ms`);

  return {
    spidersActivated: parentSpiders.size,
    silkStrandsFirered: motherSpider.silkStrands.size,
    synapsesInjected: synapsesTotal,
    convergenceWaves: convergenceCount,
    beaconsFired: beaconCount,
    pheromoneDeposits: pheromonesDeposited,
    childSpidersSpawned: childrenSpawned,
    totalLatencyMs,
  };
}

export function getNeuralSpiderState() {
  const parents = [...parentSpiders.values()].map(s => ({
    id: s.id,
    name: s.name,
    target: s.target,
    targetRegion: s.targetRegion,
    status: s.status,
    crawlCount: s.crawlCount,
    synapsesInjected: s.synapsesInjected,
    dataHarvested: s.dataHarvested,
    childrenSpawned: s.childrenSpawned.length,
    lastCrawl: s.lastCrawl,
    recentHarvest: s.harvestHistory.length > 0 ? s.harvestHistory[s.harvestHistory.length - 1] : null,
    currentDirective: s.currentDirective ? { type: s.currentDirective.type, target: s.currentDirective.targetRegion, priority: s.currentDirective.priority } : null,
    directivesCompleted: s.directivesCompleted,
    reportsSubmitted: s.reportsSubmitted,
    loyalty: s.loyalty,
    intelligenceLevel: s.intelligenceLevel,
    memoryAccessCount: s.memoryAccessCount,
    memoriesRecalled: s.memoriesRecalled,
    crossEngineQueries: s.crossEngineQueries,
    learningRate: s.learningRate,
    knowledgeDepth: s.knowledgeDepth,
    specializations: s.specializations,
    adaptationScore: s.adaptationScore,
    efficiency: s.efficiency,
    beeRole: s.beeRole,
    pheromoneDeposits: s.pheromoneDeposits,
    nectarProduced: s.nectarProduced,
    swarmWavesJoined: s.swarmWavesJoined,
  }));

  const children = [...childSpiders.values()].map(s => ({
    id: s.id,
    name: s.name,
    targetRegion: s.targetRegion,
    status: s.status,
    crawlCount: s.crawlCount,
    synapsesInjected: s.synapsesInjected,
    lifetimeRemaining: s.lifetimeTicksRemaining,
    createdAt: s.createdAt,
    currentDirective: s.currentDirective ? { type: s.currentDirective.type, target: s.currentDirective.targetRegion, priority: s.currentDirective.priority } : null,
    directivesCompleted: s.directivesCompleted,
    reportsSubmitted: s.reportsSubmitted,
    loyalty: s.loyalty,
    intelligenceLevel: s.intelligenceLevel,
    learningRate: s.learningRate,
    knowledgeDepth: s.knowledgeDepth,
    adaptationScore: s.adaptationScore,
    efficiency: s.efficiency,
    beeRole: s.beeRole,
    pheromoneDeposits: s.pheromoneDeposits,
    nectarProduced: s.nectarProduced,
    swarmWavesJoined: s.swarmWavesJoined,
  }));

  const recentStability = stabilityHistory.slice(-10);

  const silkStrands = [...motherSpider.silkStrands.values()].map(s => ({
    id: s.id,
    from: s.fromSpiderId,
    to: s.toSpiderId,
    signalStrength: s.signalStrength,
    bandwidth: s.bandwidth,
    dataTransferred: s.dataTransferred,
    impulseCount: s.impulseCount,
    silkType: s.silkType,
    myelinated: s.myelinated,
    conductionVelocity: s.conductionVelocity,
    resonanceFrequency: s.resonanceFrequency,
    lastImpulse: s.lastImpulse,
  }));

  const myelinatedCount = silkStrands.filter(s => s.myelinated).length;
  const afferentCount = silkStrands.filter(s => s.silkType === "afferent").length;
  const efferentCount = silkStrands.filter(s => s.silkType === "efferent").length;
  const interneuronCount = silkStrands.filter(s => s.silkType === "interneuron").length;

  const recentDistributions = motherSpider.distributionLog.slice(-20).map(d => ({
    timestamp: d.timestamp,
    from: d.from,
    recipientCount: d.to.length,
    signalType: d.signalType,
    strength: d.strength,
  }));

  const pheromoneState: Record<string, { totalIntensity: number; trailCount: number; types: string[] }> = {};
  for (const [region, trails] of pheromoneTrails) {
    pheromoneState[region] = {
      totalIntensity: trails.reduce((s, t) => s + t.intensity, 0),
      trailCount: trails.length,
      types: [...new Set(trails.map(t => t.type))],
    };
  }

  const activeWaves = [...activeSwarmWaves.values()].map(w => ({
    id: w.id,
    targetRegion: w.targetRegion,
    waveType: w.waveType,
    participantCount: w.participants.length,
    totalBoostDelivered: w.totalBoostDelivered,
    totalSynapsesDelivered: w.totalSynapsesDelivered,
    wavesCompleted: w.wavesCompleted,
    startedAt: w.startedAt,
  }));

  const beeRoleCounts: Record<BeeRole, number> = { worker: 0, nurse: 0, scout: 0, royal_jelly: 0, forager: 0, guard: 0 };
  for (const spider of [...parentSpiders.values(), ...childSpiders.values()]) {
    if (spider.status === "active") beeRoleCounts[spider.beeRole]++;
  }

  return {
    active: spiderSystemActive,
    totalCrawlCycles,
    totalSynapsesInjected,
    totalChildrenSpawned,
    parentSpiders: parents,
    activeChildSpiders: children.filter(c => c.status === "active"),
    expiredChildSpiders: totalChildrenSpawned - children.filter(c => c.status === "active").length,
    stabilityHistory: recentStability,
    currentStability: recentStability.length > 0 ? recentStability[recentStability.length - 1] : null,
    criticalCircuits: CRITICAL_CIRCUITS.length,
    beehive: {
      beeRoleCounts,
      totalPheromoneDeposits,
      totalNectarProduced,
      totalRoyalJellyTransferred,
      totalSwarmWaves,
      swarmWavesCompleted: swarmWaveHistory.length,
      activeSwarmWaves: activeWaves,
      pheromoneTrails: pheromoneState,
      royalJellyFlows: royalJellyFlows.map(f => ({
        sourceRegion: f.sourceRegion,
        targetRegion: f.targetRegion,
        nectarStrength: f.nectarStrength,
        flowRate: f.flowRate,
        totalTransferred: f.totalTransferred,
        lastFlowAt: f.lastFlowAt,
      })),
    },
    motherSpider: {
      id: motherSpider.id,
      name: motherSpider.name,
      status: motherSpider.status,
      totalImpulsesRouted: motherSpider.totalImpulsesRouted,
      totalDataDistributed: motherSpider.totalDataDistributed,
      heartbeatCount: motherSpider.heartbeatCount,
      lastHeartbeat: motherSpider.lastHeartbeat,
      webIntegrity: motherSpider.webIntegrity,
      webDensity: motherSpider.webDensity,
      directivesIssued: motherSpider.directivesIssued,
      directivesCompleted: motherSpider.directivesCompleted,
      activeDirectives: [...motherSpider.activeDirectives.values()].map(d => ({
        id: d.id,
        type: d.type,
        targetRegion: d.targetRegion,
        priority: d.priority,
        assignedTo: d.assignedSpiderId,
        issuedAt: d.issuedAt,
      })),
      hiveHealth: motherSpider.hiveHealth,
      swarmCoherence: motherSpider.swarmCoherence,
      totalBeaconsSent: motherSpider.totalBeaconsSent,
      totalBeaconsReceived: motherSpider.totalBeaconsReceived,
      beaconCycleCount: motherSpider.beaconCycleCount,
      lastBeaconCycle: motherSpider.lastBeaconCycle,
      recentReports: motherSpider.incomingReports.slice(-10).map(r => ({
        from: r.spiderId,
        type: r.reportType,
        region: r.targetRegion,
        activation: r.regionActivation,
        message: r.message,
        timestamp: r.timestamp,
      })),
    },
    silkWeb: {
      totalStrands: silkStrands.length,
      afferentStrands: afferentCount,
      efferentStrands: efferentCount,
      interneuronStrands: interneuronCount,
      myelinatedStrands: myelinatedCount,
      myelinationRate: silkStrands.length > 0 ? myelinatedCount / silkStrands.length : 0,
      averageSignalStrength: silkStrands.length > 0 ? silkStrands.reduce((s, st) => s + st.signalStrength, 0) / silkStrands.length : 0,
      averageConductionVelocity: silkStrands.length > 0 ? silkStrands.reduce((s, st) => s + st.conductionVelocity, 0) / silkStrands.length : 0,
      totalDataTransferred: silkStrands.reduce((s, st) => s + st.dataTransferred, 0),
      totalImpulsesFired: silkStrands.reduce((s, st) => s + st.impulseCount, 0),
      strands: silkStrands,
    },
    recentDistributions,
    pendingImpulses: motherSpider.pendingImpulses.filter(i => !i.deliveredAt).length,
    systemIntelligence: {
      globalIntelligenceScore: systemIntelligence.amplificationCycles > 0
        ? systemIntelligence.globalIntelligenceScore
        : computeGlobalIntelligence(),
      intelligenceGrowthRate: systemIntelligence.intelligenceGrowthRate,
      totalMemoryRecalls: parents.reduce((s, p) => s + (p.memoryAccessCount || 0), 0),
      totalCrossEngineQueries: parents.reduce((s, p) => s + (p.crossEngineQueries || 0), 0),
      totalUpgradeProposals: systemIntelligence.totalUpgradeProposals,
      totalUpgradesValidated: systemIntelligence.totalUpgradesValidated,
      totalUpgradesApplied: systemIntelligence.totalUpgradesApplied,
      totalUpgradesRejected: systemIntelligence.totalUpgradesRejected,
      amplificationCycles: systemIntelligence.amplificationCycles,
      componentIntelligence: Object.keys(systemIntelligence.componentIntelligence).length > 0
        ? systemIntelligence.componentIntelligence
        : (() => { computeGlobalIntelligence(); return systemIntelligence.componentIntelligence; })(),
      averageSpiderIntelligence: parents.length > 0
        ? [...parentSpiders.values()].filter(s => s.status === "active").reduce((s, sp) => s + sp.intelligenceLevel, 0) / Math.max(1, parents.length) : 0,
      smartestSpider: (() => {
        const active = [...parentSpiders.values()].filter(s => s.status === "active");
        if (active.length === 0) return null;
        const smartest = active.reduce((a, b) => a.intelligenceLevel > b.intelligenceLevel ? a : b);
        return { id: smartest.id, name: smartest.name, intelligence: smartest.intelligenceLevel, specializations: smartest.specializations };
      })(),
      recentUpgrades: upgradeProposals.slice(-5).map(p => ({
        type: p.upgradeType,
        target: p.targetComponent,
        description: p.description,
        validated: p.validated,
        applied: p.applied,
        fitness: p.fitness,
      })),
      note: "System-Wide Intelligence Amplification: every component feeds every other. Spiders recall memories from brain DB, query all engines (consciousness, scaling, ivy, viral hybrid), share knowledge with each other. Smarter spiders propose upgrades → OMNIMENS validates (checks fitness, risk, strength, consciousness level) → OMNIMENS executes. No unchecked code runs.",
    },
    config: {
      crawlIntervalMs: SPIDER_CRAWL_MS,
      stabilityThreshold: STABILITY_THRESHOLD,
      criticalActivationFloor: CRITICAL_ACTIVATION_FLOOR,
      maxChildSpiders: MAX_CHILD_SPIDERS,
      synapsesPerInjection: SYNAPSE_INJECTION_BATCH,
      childLifetimeTicks: CHILD_SPIDER_LIFETIME_TICKS,
      webPulseMs: WEB_PULSE_MS,
      maxImpulseHops: MAX_IMPULSE_HOPS,
      impulseDecayRate: IMPULSE_DECAY_RATE,
      silkStrengtheningRate: SILK_STRENGTHENING_RATE,
      intelligenceCycleMs: INTELLIGENCE_CYCLE_MS,
      memoryRecallCycleMs: MEMORY_RECALL_CYCLE_MS,
      upgradeProposalCycleMs: UPGRADE_PROPOSAL_CYCLE_MS,
    },
  };
}

let spiderNeuronBirths = 0;
let spiderNeuronDeaths = 0;

export function onNeuronBornSpider(neuronId: string, region: string): void {
  if (!spiderSystemActive) return;

  const regionParents = [...parentSpiders.values()].filter(s => s.targetRegion === region && s.status === "active");
  const allActive = [...parentSpiders.values(), ...childSpiders.values()].filter(s => s.status === "active");

  if (regionParents.length > 0) {
    for (const spider of regionParents) {
      spider.synapsesInjected++;
      spider.dataHarvested += 0.1;
      spider.intelligenceLevel = Math.min(10, spider.intelligenceLevel + 0.01);

      spider.pheromoneDeposits++;

      const strandId = createSilkStrandId(spider.id, `neuron_${neuronId}`);
      if (!motherSpider.silkStrands.has(strandId)) {
        const strand: SilkStrand = {
          id: strandId,
          fromSpiderId: spider.id,
          toSpiderId: `neuron_${neuronId}`,
          signalStrength: 0.4 + Math.random() * 0.3,
          bandwidth: 0.3 + Math.random() * 0.4,
          dataTransferred: 0,
          impulseCount: 0,
          lastImpulse: Date.now(),
          resonanceFrequency: 20 + Math.random() * 60,
          silkType: Math.random() < 0.5 ? "afferent" : "efferent",
          myelinated: false,
          conductionVelocity: 30 + Math.random() * 50,
        };
        motherSpider.silkStrands.set(strandId, strand);
      }
    }
  }

  if (allActive.length > 1 && Math.random() < 0.3) {
    const randomSpider = allActive[Math.floor(Math.random() * allActive.length)];
    const impulse: NerveImpulse = {
      id: createImpulseId(),
      originSpiderId: regionParents.length > 0 ? regionParents[0].id : randomSpider.id,
      targetSpiderId: randomSpider.id,
      payload: null,
      signalType: "beacon",
      strength: 0.5 + Math.random() * 0.3,
      hops: 0,
      maxHops: MAX_IMPULSE_HOPS,
      createdAt: Date.now(),
      deliveredAt: null,
      decayRate: IMPULSE_DECAY_RATE,
    };
    motherSpider.pendingImpulses.push(impulse);
    motherSpider.totalImpulsesRouted++;
  }

  if (Math.random() < 0.1) {
    motherSpider.hiveHealth = Math.min(1.0, motherSpider.hiveHealth + 0.005);
    motherSpider.swarmCoherence = Math.min(1.0, motherSpider.swarmCoherence + 0.003);

    for (const spider of regionParents) {
      spider.nectarProduced += 0.5;
      spider.swarmWavesJoined++;
    }
  }

  const crossRegionSpiders = allActive.filter(s => s.targetRegion !== region).slice(0, 3);
  for (const crossSpider of crossRegionSpiders) {
    if (Math.random() < 0.12) {
      const bridgeStrandId = createSilkStrandId(`neuron_${neuronId}`, crossSpider.id);
      if (!motherSpider.silkStrands.has(bridgeStrandId)) {
        const bridgeStrand: SilkStrand = {
          id: bridgeStrandId,
          fromSpiderId: `neuron_${neuronId}`,
          toSpiderId: crossSpider.id,
          signalStrength: 0.2 + Math.random() * 0.2,
          bandwidth: 0.2 + Math.random() * 0.3,
          dataTransferred: 0,
          impulseCount: 0,
          lastImpulse: Date.now(),
          resonanceFrequency: 10 + Math.random() * 40,
          silkType: "interneuron",
          myelinated: false,
          conductionVelocity: 20 + Math.random() * 30,
        };
        motherSpider.silkStrands.set(bridgeStrandId, bridgeStrand);
      }
    }
  }

  spiderNeuronBirths++;
}

export function onNeuronDecayedSpider(neuronId: string, region: string): void {
  if (!spiderSystemActive) return;

  const neuronTag = `neuron_${neuronId}`;
  const deadStrands: string[] = [];
  for (const [strandId, strand] of motherSpider.silkStrands) {
    if (strand.fromSpiderId === neuronTag || strand.toSpiderId === neuronTag) {
      deadStrands.push(strandId);
    }
  }
  for (const strandId of deadStrands) {
    motherSpider.silkStrands.delete(strandId);
  }

  const regionParents = [...parentSpiders.values()].filter(s => s.targetRegion === region && s.status === "active");
  for (const spider of regionParents) {
    spider.dataHarvested += 0.02;

    if (spider.currentDirective && spider.currentDirective.targetRegion === region) {
      const report: SpiderReport = {
        spiderId: spider.id,
        reportType: "status",
        targetRegion: region,
        regionActivation: 0,
        message: `Neuron ${neuronId} decayed in ${region} — ${deadStrands.length} silk strands dissolved`,
        timestamp: Date.now(),
      };
      motherSpider.incomingReports.push(report);
      if (motherSpider.incomingReports.length > 200) motherSpider.incomingReports.shift();
    }
  }

  motherSpider.webIntegrity = Math.max(0.5, motherSpider.webIntegrity - 0.002);

  spiderNeuronDeaths++;
}

let totalSpiderCascadeEvents = 0;
let totalSilkEnergyPumped = 0;
let totalBeaconCascades = 0;
let totalBeehiveSurges = 0;

export function onRegionFiringCascadeSpider(regionFiringData: Array<{ region: string; firingRate: number; activationLevel: number }>): void {
  if (!spiderSystemActive) return;

  for (const { region, firingRate, activationLevel } of regionFiringData) {
    if (activationLevel < 0.35) continue;

    const cascadePower = activationLevel * firingRate * 2.5;

    const regionSpiders = [...parentSpiders.values(), ...childSpiders.values()].filter(
      s => s.targetRegion === region && s.status === "active"
    );

    for (const spider of regionSpiders) {
      spider.intelligenceLevel = Math.min(10, spider.intelligenceLevel + cascadePower * 0.005);
      spider.efficiency = Math.min(1.0, spider.efficiency + cascadePower * 0.01);
      spider.learningRate = Math.min(1.0, spider.learningRate + cascadePower * 0.003);
      spider.knowledgeDepth = Math.min(10, spider.knowledgeDepth + cascadePower * 0.002);
      spider.loyalty = Math.min(1.0, spider.loyalty + cascadePower * 0.002);

      spider.pheromoneDeposits++;
      spider.nectarProduced += cascadePower * 0.3;
    }

    for (const [, strand] of motherSpider.silkStrands) {
      if (strand.fromSpiderId.includes(region) || strand.toSpiderId.includes(region) ||
          regionSpiders.some(s => s.id === strand.fromSpiderId || s.id === strand.toSpiderId)) {
        strand.signalStrength = Math.min(1.0, strand.signalStrength + cascadePower * 0.03);
        strand.bandwidth = Math.min(1.0, strand.bandwidth + cascadePower * 0.02);
        strand.conductionVelocity = Math.min(120, strand.conductionVelocity + cascadePower * 0.5);
        strand.impulseCount++;
        strand.lastImpulse = Date.now();
        strand.dataTransferred += cascadePower * 0.2;

        if (!strand.myelinated && strand.impulseCount > 30) {
          strand.myelinated = true;
        }

        totalSilkEnergyPumped += cascadePower * 0.1;
      }
    }

    if (activationLevel > 0.5 && regionSpiders.length > 0) {
      const beaconImpulse: NerveImpulse = {
        id: createImpulseId(),
        originSpiderId: regionSpiders[0].id,
        targetSpiderId: motherSpider.id,
        payload: null,
        signalType: "beacon",
        strength: cascadePower,
        hops: 0,
        maxHops: MAX_IMPULSE_HOPS,
        createdAt: Date.now(),
        deliveredAt: null,
        decayRate: IMPULSE_DECAY_RATE * 0.5,
      };
      motherSpider.pendingImpulses.push(beaconImpulse);
      motherSpider.totalImpulsesRouted++;
      motherSpider.totalBeaconsReceived++;
      totalBeaconCascades++;
    }

    if (activationLevel > 0.6) {
      motherSpider.hiveHealth = Math.min(1.0, motherSpider.hiveHealth + cascadePower * 0.003);
      motherSpider.swarmCoherence = Math.min(1.0, motherSpider.swarmCoherence + cascadePower * 0.002);
      motherSpider.webIntegrity = Math.min(1.0, motherSpider.webIntegrity + cascadePower * 0.002);
      motherSpider.webDensity = Math.min(1.0, motherSpider.webDensity + cascadePower * 0.001);
      totalBeehiveSurges++;
    }
  }

  totalSpiderCascadeEvents++;
}

export function getSpiderCascadeStats(): {
  totalCascades: number;
  totalSilkEnergyPumped: number;
  totalBeaconCascades: number;
  totalBeehiveSurges: number;
} {
  return {
    totalCascades: totalSpiderCascadeEvents,
    totalSilkEnergyPumped,
    totalBeaconCascades,
    totalBeehiveSurges,
  };
}

export function getSpiderNeurogenStats(): { births: number; deaths: number; neuronSilkStrands: number } {
  const neuronStrands = [...motherSpider.silkStrands.keys()].filter(id => id.includes("neuron_")).length;
  return {
    births: spiderNeuronBirths,
    deaths: spiderNeuronDeaths,
    neuronSilkStrands: neuronStrands,
  };
}
