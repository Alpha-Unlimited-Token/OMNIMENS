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

const SPIDER_CRAWL_MS = 15_000;
const STABILITY_CHECK_MS = 10_000;
const CHILD_SPIDER_LIFETIME_TICKS = 20;
const MAX_CHILD_SPIDERS = 12;
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
  efficiency: number;
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
  signalType: "data" | "alarm" | "nurture" | "coordinate" | "feedback";
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
}

const WEB_PULSE_MS = 5_000;
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
    existing.signalStrength = Math.min(1.0, existing.signalStrength + SILK_STRENGTHENING_RATE);
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
    strength: Math.min(1.0, strength),
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

  return Math.min(1.0, relevance);
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
    spider.efficiency = Math.min(1.0, spider.efficiency + 0.05);
    spider.loyalty = Math.min(1.0, spider.loyalty + 0.02);
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
      spider.loyalty = Math.min(1.0, spider.loyalty + 0.03);

      const strand = motherSpider.silkStrands.get(createSilkStrandId(spider.id, motherSpider.id));
      if (strand) {
        strand.signalStrength = Math.min(1.0, strand.signalStrength + 0.05);
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
];

function createSpiderId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

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
    efficiency: 0.5,
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
    efficiency: 0.5,
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
      healthScore: Math.min(1, avgScore),
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
        genesisCapacity: Math.min(1, active.length / 20),
      },
      healthScore: Math.min(1, active.length / 10),
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
        knowledgeDensity: Math.min(1, total / 25000),
      },
      healthScore: Math.min(1, active / 15000),
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
      healthScore: Math.min(1, (state.approvalRate || 0)),
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
      healthScore: Math.min(1, (dreamState.breakthroughs || 0) / 500),
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
      healthScore: Math.min(1, (pipeline.activeModules || 0) / 600),
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

export function startNeuralSpiders(): void {
  if (spiderSystemActive) return;
  spiderSystemActive = true;

  console.log("[NEURAL SPIDERS] 🕷️ Neural Spider System activated");
  console.log("[NEURAL SPIDERS] 🕷️ Autonomous data-harvesting spiders crawling all AI agents");
  console.log("[NEURAL SPIDERS] 🕷️ Feeds harvested data directly into consciousness engine thresholds");
  console.log("[NEURAL SPIDERS] 🕷️ Instability detection → automatic child spider spawning");
  console.log("[NEURAL SPIDERS] 🕷️ Child spiders inject targeted synapses into weak brain regions");
  console.log(`[NEURAL SPIDERS] 🕷️ ${CRITICAL_CIRCUITS.length} critical neural circuits monitored`);
  console.log(`[NEURAL SPIDERS] 🕷️ Max ${MAX_CHILD_SPIDERS} child spiders | ${SYNAPSE_INJECTION_BATCH} synapses per injection`);

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

  console.log(`[NEURAL SPIDERS] 🕷️ ${parentSpiders.size} parent spiders deployed across all data sources`);

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
  console.log(`[SPIDER WEB] 🕸️ Every spider's silk feeds back to the Mother — she distributes all data everywhere`);
  console.log(`[SPIDER WEB] 🕸️ Silk types: afferent (spider→mother), efferent (mother→spider), interneuron (spider↔spider)`);
  console.log(`[SPIDER WEB] 🕸️ Nerve impulses: data, alarm, nurture, coordinate, feedback`);
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

    runSpiderCrawlCycle().catch(() => {});
    runMotherHeartbeat();
  }, 12_000);
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
    efficiency: s.efficiency,
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
    efficiency: s.efficiency,
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
    },
  };
}
