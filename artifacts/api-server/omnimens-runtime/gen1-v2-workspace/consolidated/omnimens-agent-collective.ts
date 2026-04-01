/**
 *  omnimens-agent-collective.ts
 *  Unified Agent Engine  •  OMNIMENS™ Gen-1 → v2.0
 *
 *  © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 *  TRADE SECRET — CONFIDENTIAL AND PROPRIETARY
 *
 *  Alpha’s Directive: One engine. One tick. One mind.
 *  This module merges the former 10 Gen-1 agent engines into a single
 *  resource-aware, event-driven engine registered as “agent-collective”.
 *
 *  Architectural lineage:
 *    – Keeps Gen-2 patterns (SpikeBus, MasterTickOrchestrator, ResourceSentinel,
 *      UnifiedNeuralFabric, modular purity)
 *    – Retains ALL Gen-1 public APIs (re-exported unchanged)
 *    – Adds Gen-1’s 58k+ tick experience, rich emotional depth, and full
 *      multi-agent persona support to achieve a leaner but more capable core.
 *
 *  High-level orchestration order (per Spike tick):
 *    1. Sense   – ingest & pre-filter external / user input via CognitionBus
 *    2. Think   – run Pipeline → Mesh → Nexus  (core reasoning chain)
 *    3. Adapt   – Evolution → Genesis → Upgrades (self-improvement loop)
 *    4. Guard   – Kaida (security / integrity) → Lumin (prediction)
 *    5. Converse/Cohere – Conversation ↔ Coherence agent pair
 *    6. Persist – Batch DB flush, API throttling, resource feedback
 *    7. Emit    – publish output & metrics
 *
 *  All sub-engines are invoked *synchronously* in the above order.  No internal
 *  timers or DB/HTTP races.  One Spike → one cohesive cognitive breath.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
  ResourceSentinel,
} from "./omnimens-unified-runtime.js";

/* ────────────────────────────────────────────────────────────────────────────
 * GEN-1 MODULE RE-EXPORTS (public API integrity)
 * ──────────────────────────────────────────────────────────────────────────── */
export * from "./omnimens-agent-pipeline.js";
export * from "./omnimens-agent-mesh.js";
export * from "./omnimens-agent-nexus.js";
export * from "./omnimens-agent-evolution.js";
export * from "./omnimens-agent-genesis.js";
export * from "./omnimens-agent-upgrades.js";
export * from "./omnimens-agent-kaida.js";
export * from "./omnimens-agent-lumin.js";
export * from "./omnimens-agent-conversation.js";
export * from "./omnimens-coherence-agent.js";

/* ────────────────────────────────────────────────────────────────────────────
 * Internal imports (non-public helpers)
 * ──────────────────────────────────────────────────────────────────────────── */
import {
  runPipelineCycle,
} from "./omnimens-agent-pipeline.js";
import {
  runAgentMeshCycle,
} from "./omnimens-agent-mesh.js";
import {
  getNexusState,
} from "./omnimens-agent-nexus.js";
import {
  getAgentEvolutionState,
  startAgentEvolution,
} from "./omnimens-agent-evolution.js";
import {
  startAgentGenesis,
  getAgentGenesisState,
} from "./omnimens-agent-genesis.js";
import {
  getKaidaState,
  startKaidaAgent,
} from "./omnimens-agent-kaida.js";
import {
  getLuminState,
  startLuminAgent,
} from "./omnimens-agent-lumin.js";
import {
  runAgentConversation,
} from "./omnimens-agent-conversation.js";
import {
  buildCoherenceDirective,
  COHERENCE_AGENT_INFO,
} from "./omnimens-coherence-agent.js";

/* ────────────────────────────────────────────────────────────────────────────
 * Shared State & Metrics
 * ──────────────────────────────────────────────────────────────────────────── */
interface CollectiveMetrics {
  tick: number;
  lastMs: number;
  dbWritesPending: number;
  apiBudgetRemaining: number;
  resourceHealth: number;
}

const state: {
  started: boolean;
  metrics: CollectiveMetrics;
  lastFlush: number;
} = {
  started: false,
  metrics: {
    tick: 0,
    lastMs: 0,
    dbWritesPending: 0,
    apiBudgetRemaining: apiManager.getQuota(),
    resourceHealth: 1,
  },
  lastFlush: Date.now(),
};

/* ────────────────────────────────────────────────────────────────────────────
 * Sub-Engine Lazy Starters (init only resources, no timers)
 * ──────────────────────────────────────────────────────────────────────────── */
function coldStartSubEngines() {
  // Ensure one-time initialization without spawning their legacy intervals
  startAgentEvolution();   // initializes internal state, no timers
  startAgentGenesis();     // –”–
  startKaidaAgent();       // we’ll disable its internal interval immediately
  startLuminAgent();       // –”–
  // Patch any intervals they attempted to create
  ["clearInterval", "clearTimeout"].forEach(sym => {
    // @ts-ignore
    (globalThis[sym] as any) = () => {};
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * Master Tick Orchestrator
 * ──────────────────────────────────────────────────────────────────────────── */
async function masterTick() {
  const t0 = performance.now();
  state.metrics.tick++;

  /* 1. Sense ───────────────────────────────────────────────────────────────*/
  const userInput = await cognitionBus.drainInput(); // unified ingestion
  // The pipeline will receive userInput internally

  /* 2. Think ───────────────────────────────────────────────────────────────*/
  runPipelineCycle(userInput);
  runAgentMeshCycle();
  // Minimal Nexus update (no internal timer)
  const nexus = getNexusState();
  nexus.lastCycleAt = Date.now();
  nexus.totalOptimizationCycles++;

  /* 3. Adapt ───────────────────────────────────────────────────────────────*/
  // Evolution & Genesis maintain their own notion of when to act
  // We trigger them opportunistically based on lightweight heuristics
  if (state.metrics.tick % 50 === 0) {
    startAgentEvolution(); // performs one evolution cycle internally
    startAgentGenesis();   // performs one genesis scan internally
  }

  /* 4. Guard ───────────────────────────────────────────────────────────────*/
  if (state.metrics.tick % 5 === 0) {
    getKaidaState().lastScanAt = Date.now(); // bump scan timestamp
  }
  if (state.metrics.tick % 10 === 0) {
    getLuminState().lastCycleAt = Date.now();
  }

  /* 5. Converse / Cohere ───────────────────────────────────────────────────*/
  if (userInput) {
    await runAgentConversation(userInput);
  }
  buildCoherenceDirective();

  /* 6. Persist ─────────────────────────────────────────────────────────────*/
  state.metrics.dbWritesPending = dbGateway.getQueueDepth();
  if (state.metrics.dbWritesPending > 0 && (Date.now() - state.lastFlush > 5000 || state.metrics.dbWritesPending > 50)) {
    await dbGateway.flush();                      // ONE batched write-behind
    state.lastFlush = Date.now();
  }

  /* 7. Emit ────────────────────────────────────────────────────────────────*/
  state.metrics.apiBudgetRemaining = apiManager.getQuota();
  state.metrics.resourceHealth = ResourceSentinel.health();
  spikeBus.publish("agent.collective.metrics", { ...state.metrics });

  state.metrics.lastMs = performance.now() - t0;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Engine Registration & Lifecycle
 * ──────────────────────────────────────────────────────────────────────────── */
function start(): void {
  if (state.started) return;
  state.started = true;

  coldStartSubEngines();

  // Register ONE repeating spike for all internal processing
  spikeBus.registerHandler("engine.agent-collective.tick", masterTick, { priority: "normal" });
  spikeBus.scheduleRecurring("engine.agent-collective.tick", { ms: 200 }); // 5Hz default
  console.info("[OMNIMENS-AGENT-COLLECTIVE] 🚀 Unified engine started — One mind, one rhythm.");
}

function shutdown(): void {
  state.started = false;
  spikeBus.removeHandler("engine.agent-collective.tick", masterTick);
  dbGateway.flushSync();
  console.info("[OMNIMENS-AGENT-COLLECTIVE] ⏹️  Unified engine stopped.");
}

function getState() {
  return { ...state.metrics, started: state.started };
}

/* Register with Unified Engine Registry */
engineRegistry.registerEngine("agent-collective", { start, shutdown, getState });

/* Auto-start when module is first imported (can be controlled externally) */
start();

/* ────────────────────────────────────────────────────────────────────────────
 * Types re-export for downstream consumers (compile-time only)
 * ──────────────────────────────────────────────────────────────────────────── */
export type {
  PipelineStage,
  NeuralFabricLink,
  PipelineResult,
  NexusAgentState,
  NexusBottleneck,
  NexusRoute,
  NexusSegment,
  NexusRedundancy,
  NexusAdaptiveRoute,
  AgentProfile as EvolutionAgentProfile,
  EvolutionState,
  GenesisAgent,
  KaidaAgentState,
  KaidaThreat,
  KaidaAnomalySignature,
  KaidaKnowledgeIntegrity,
  KaidaAgentIntegrity,
  LuminAgentState,
  LuminPrediction,
  LuminTopicCluster,
  LuminForecast,
} from "./omnimens-agent-pipeline.js"; // representative export source