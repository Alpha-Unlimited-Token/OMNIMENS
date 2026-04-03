CROSS-GEN CONSOLIDATION: agents-collective

=== Gen 1 v2.0: omnimens-agent-collective.ts (247 lines) ===
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
 * ────────────────────────────

=== Gen 1 v2.0: omnimens-module-pipeline.ts (579 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * CONFIDENTIAL AND PROPRIETARY.
 */

import {
  readdirSync,
  readFileSync,
  existsSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import vm from "vm";

/* ─── UNIFIED RUNTIME ──────────────────────────────────────────────────────── */
import {
import { SpikeBus } from "../infrastructure/spike-bus.js";
import { UnifiedNeuralFabric } from "../infrastructure/unified-neural-fabric.js";
import { MasterTickOrchestrator } from "../infrastructure/master-tick-orchestrator.js";
import { ResourceSentinel } from "../infrastructure/resource-sentinel.js";

const spikeBus = SpikeBus.getInstance();
const fabric = UnifiedNeuralFabric.getInstance();
const orchestrator = MasterTickOrchestrator.getInstance();
const sentinel = ResourceSentinel.getInstance();

orchestrator.register("gen2-module", "STANDARD", 10000);
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

engineRegistry.registerEngine("module-pipeline", "NORMAL", { dbQuota: 10 });

const LOG = (...m: any[]) =>
  console.log("[OMNIMENS-MODULE-PIPELINE]", ...m);

/* ─── PATHS ────────────────────────────────────────────────────────────────── */
const __dirname = dirname(fileURLToPath(import.meta.url));
const RUNTIME_DIR = join(__dirname, "../omnimens-runtime");
const MODULES_DIR = join(RUNTIME_DIR, "modules");
const REGISTRY_PATH = join(RUNTIME_DIR, "pipeline-registry.json");

/* ─── TYPES ───────────────────────────────────────────────────────────────── */
type Stage =
  | "context_compression"
  | "memory_retrieval"
  | "reasoning_enhancement"
  | "confidence_scoring"
  | "knowledge_synthesis"
  | "adversarial_testing"
  | "causal_analysis"
  | "vector_operations"
  | "orchestration"
  | "utility";

interface ModMeta {
  filename: string;
  stage: Stage;
  exports: string[];
  loadedAt: number;
  callCount: number;
  lastCalledAt: number | null;
  totalDurationMs: number;
  errors: number;
  active: boolean;
}

interface Registry {
  modules: Record<string, ModMeta>;
  lastScan: number;
  totalModules: number;
  totalCalls: number;
}

/* ─── KEYWORDS → STAGE ────────────────────────────────────────────────────── */
const KW: Record<Stage, RegExp[]> = {
  context_compression: [
    "context",
    "compress",
    "summariz",
    "preserv",
    "sliding",
    "window",
    "conversation",
    "truncat",
    "compact",
  ],
  memory_retrieval: [
    "memory",
    "recall",
    "retriev",
    "embedding",
    "vector",
    "cache",
    "store",
    "search",
    "nearest",
    "knn",
    "hnsw",
    "persist",
    "encrypted.*store",
    "persistent.*memory",
    "bulk.*get",
    "bulk.*set",
  ],
  reasoning_enhancement: [
    "reason",
    "thinking",
    "thought",
    "metacognit",
    "dual.*process",
    "inference",
    "hypothesis",
    "counterfactual",
    "formal.*verif",
    "tree.*thought",
    "graph.*rag",
  ],
  confidence_scoring: [
    "confidence",
    "calibrat",
    "bayesian",
    "uncertainty",
    "entropy",
    "scoring",
    "consistency",
    "weighted.*vote",
  ],
  knowledge_synthesis: [
    "knowledge.*graph",
    "synthe",
    "insight",
    "integrat",
    "graph.*entity",
    "semantic",
  ],
  adversarial_testing: [
    "adversarial",
    "fault.*inject",
    "stress.*test",
    "edge.*case",
    "self.*test",
    "self.*reward",
    "debate",
  ],
  causal_analysis: [
    "causal",
    "counterfactual",
    "intervene",
    "multiverse",
    "cause.*effect",
    "propagat",
  ],
  vector_operations: [
    "matrix",
    "wasm",
    "gpu",
    "accelerat",
    "linear.*algebra",
    "dot.*product",
    "efficient.*math",
    "parallel.*comput",
    "chunked.*compute",
    "iterative.*compute",
    "time.*budget",
    "map.*reduce",
    "genetic.*search",
    "convergence",
  ],
  orchestration: [
    "orchestrat",
    "allocat",
    "coordinat",
    "pub.*sub",
    "event.*driven",
    "hierarchical.*task",
    "dynamic.*role",
    "swarm",
    "agent.*orchestrat",
  ],
  utility: [
    "tool.*forge",
    "tool.*creat",
    "evolve",
    "alpha.*evolve",
    "evolution.*marker",
    "sleep.*phase",
    "daydream",
    "sandbox",
  ],

spikeBus.emit({ type: "gen2-module:result", source: "gen2-module", payload: {}, priority: "normal", timestamp: Date.now(), id: crypto.randomUUID() });
};

for (const k in KW) KW[k as Stage] = KW[k as Stage].map((w) => new RegExp(w, "gi"));

/* ─── RUNTIME STATE ───────────────────────────────────────────────────────── */
const live = new Map<string, { module: any; meta: ModM





CONSOLIDATE all of the above into ONE tight, smart, efficient module. Fewer lines. Same or better capability.