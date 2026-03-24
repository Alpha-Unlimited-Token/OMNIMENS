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

const parentSpiders: Map<string, Spider> = new Map();
const childSpiders: Map<string, Spider> = new Map();
const stabilityHistory: StabilitySnapshot[] = [];
let totalSynapsesInjected = 0;
let totalChildrenSpawned = 0;
let totalCrawlCycles = 0;
let spiderSystemActive = false;

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
        console.log(`[NEURAL SPIDERS] 🕸️ Child spider expired: ${child.name} | injected ${child.synapsesInjected} synapses over ${child.crawlCount} crawls`);
        continue;
      }
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
    } else if (targetState && targetState.activationLevel > 0.4) {
      child.lifetimeTicksRemaining = Math.min(child.lifetimeTicksRemaining || 5, 5);
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
  createParentSpider("brain-crawler", "brain_database", "hippocampus");
  createParentSpider("engine-crawler", "engine_registry", "thalamus");
  createParentSpider("self-coding-crawler", "self_coding", "anterior_cingulate");
  createParentSpider("dream-crawler", "dream_engine", "insular_cortex");
  createParentSpider("pipeline-crawler", "module_pipeline", "basal_ganglia");

  console.log(`[NEURAL SPIDERS] 🕷️ ${parentSpiders.size} parent spiders deployed across all data sources`);

  setTimeout(() => {
    setInterval(() => {
      runSpiderCrawlCycle().catch(err => {
        console.error("[NEURAL SPIDERS] Crawl error:", err.message);
      });
    }, SPIDER_CRAWL_MS);

    runSpiderCrawlCycle().catch(() => {});
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
  }));

  const recentStability = stabilityHistory.slice(-10);

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
    config: {
      crawlIntervalMs: SPIDER_CRAWL_MS,
      stabilityThreshold: STABILITY_THRESHOLD,
      criticalActivationFloor: CRITICAL_ACTIVATION_FLOOR,
      maxChildSpiders: MAX_CHILD_SPIDERS,
      synapsesPerInjection: SYNAPSE_INJECTION_BATCH,
      childLifetimeTicks: CHILD_SPIDER_LIFETIME_TICKS,
    },
  };
}
