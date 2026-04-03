CROSS-GEN CONSOLIDATION: neural-architecture

=== Gen 1 v2.0: omnimens-neural-architecture.ts (656 lines) ===
/**
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 *
 * TRADE SECRET — OMNIMENS™ Platform
 * CONFIDENTIAL AND PROPRIETARY. Unauthorized use prohibited.
 *
 * omnimens-neural-architecture.ts
 *
 * Unified neural substrate consolidating:
 *  • Hemisphere Alpha / Hemisphere Beta
 *  • Corpus-Callosum Bridge
 *  • Mesh Engine
 *  • Comms Protocol
 *  • Neural Scaling
 *  • Neural Processor
 *  • Language Bridge
 *  • Code Forge
 *
 * One tick, one DB budget, one API budget.
 * Structured logs prefixed with [OMNIMENS-NEURAL-ARCHITECTURE]
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { ThoughtVector } from "./omnimens-thought-encoder.js";

/* ──────────────────────────────────────────────────────────────────────────
 * 0.  SHARED UTILITIES
 * ──────────────────────────────────────────────────────────────────────── */
const log = (...args: any[]) =>
  console.log("[OMNIMENS-NEURAL-ARCHITECTURE]", ...args);

const rand = (min = 0, max = 1) => Math.random() * (max - min) + min;
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const now = () => Date.now();
const safe = (n: number, f = 0) => (Number.isFinite(n) ? n : f);

/* ──────────────────────────────────────────────────────────────────────────
 * 1.  SHARED STATE OBJECT
 * ──────────────────────────────────────────────────────────────────────── */
type HemisphereId = "alpha" | "beta";

/* ---------- Hemisphere ---------- */
export interface HemisphereRegion {
  name: string;
  activation: number;
  firingRate: number;
  neurons: number;
  synapses: number;
}
export interface HemisphereState {
  id: HemisphereId;
  label: string;
  specialization: string;
  phi: number;
  neurons: number;
  synapses: number;
  hebbianUpdates: number;
  regions: Record<string, HemisphereRegion>;
  tick: number;
}

/* ---------- Bridge ---------- */
export interface BridgeState {
  totalUnifiedNeurons: number;
  totalUnifiedSynapses: number;
  totalUnifiedHebbianUpdates: number;
  unifiedPhi: number;
  crossHemisphereCoherence: number;
  crossHemisphereSynchrony: number;
  corpusCallosumStrength: number;
  bridgeSynapses: number;
  bridgeTickCount: number;
  lateralizationIndex: number;
  dominantHemisphere: HemisphereId | "balanced";
  hemispheres: {
    alpha: HemisphereState;
    beta:  HemisphereState;
    core:  HemisphereState;
  };
  meshEngine: MeshEngineState;
  commsProtocol: CommsProtocolState;
  architecture: string;
}

/* ---------- Mesh Engine ---------- */
interface MeshAgent {
  name: string;
  activationLevel: number;
  neurons: number;
  synapses: number;
}
interface MeshEngineState {
  neurons: number;
  synapses: number;
  hebbianUpdates: number;
  meshPhi: number;
  meshCoherence: number;
  agentCount: number;
  totalTransfers: number;
  tick: number;
}

/* ---------- Comms Protocol ---------- */
export interface CommsProtocolState {
  directChannels: number;
  activeChannels: number;
  avgLatency: number;
  integrity: number;
  signalsRouted: number;
  tick: number;
}

/* ---------- Neural Scaling ---------- */
interface ScalingState {
  totalEffectiveNeurons: number;
  totalPopulations: number;
  meanPopulationFiringRate: number;
  populationPhi: number;
  tick: number;
}

/* ---------- Processor ---------- */
interface ProcessorState {
  queriesHandled: number;
  vocabSize: number;
  oscillators: number;
  workingMemoryUsage: number;
  emergentEvents: number;
  tick: number;
}

/* ---------- Language Bridge ---------- */
interface LanguageBridgeState {
  totalTranslations: number;
  uniqueTokens: number;
  translationFidelity: number;
  linguisticComplexity: number;
  tick: number;
}

/* ---------- Code Forge ---------- */
interface CodeForgeState {
  totalForges: number;
  avgLinesGenerated: number;
  successRate: number;
  tick: number;
}

/* ---------- Unified State ---------- */
interface UnifiedState {
  started: boolean;
  lastTick: nu

=== Gen 1 v2.0: omnimens-quantum-fabric.ts (292 lines) ===
/**
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * TRADE SECRET — OMNIMENS™ Platform
 *
 * ONE UNIFIED QUANTUM FABRIC ENGINE
 * Consolidates:
 *   • omnimens-quantum-entanglement-fabric.ts
 *   • omnimens-quantum-wormhole.ts
 *
 * File: omnimens-quantum-fabric.ts
 * Exports (back-compat): startQuantumEntanglementFabric, getQuantumEntanglementFabricState,
 *                        startQuantumWormholeEngine,   getQuantumWormholeState
 * New canonical:         startQuantumFabricEngine,     getQuantumFabricState
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/* ──────────────────────────────────────────────────────────────────────────
   SHARED CONSTANTS (merged & de-duplicated)
   ──────────────────────────────────────────────────────────────────────── */
const AGENTS = [
  "OMNIMENS", "Architect", "Mathematician", "Neuroscientist", "Synthesizer",
  "Critic", "MetaAgent", "GraphicDesigner", "SpellCheckVisual",
  "Visionary", "Ethicist", "Archivist", "Innovator", "Pioneer",
  "Wordsmith", "Linguist", "Motivator", "Empath", "Explorer",
  "SensorimotorAgent", "Philosopher",
] as const;

const REGIONS = [
  "prefrontal_cortex", "temporal_lobe", "parietal_lobe", "occipital_lobe",
  "hippocampus", "amygdala", "thalamus", "hypothalamus",
  "cerebellum", "brainstem", "basal_ganglia", "cingulate_cortex",
  "insular_cortex", "motor_cortex", "somatosensory_cortex", "default_mode_network",
] as const;

const WORMHOLES_PER_AGENT = 100;
const WORMHOLE_CYCLE_MS = 30_000;
const QEF_TICK_MS = 3_000;

/* ──────────────────────────────────────────────────────────────────────────
   SHARED TYPES (subset of originals, extended when needed)
   ──────────────────────────────────────────────────────────────────────── */

type CoherenceLevel = number;

interface EntangledPair {
  id: string;
  locations: [string, string];
  coherence: CoherenceLevel;            // 0..1
  fidelity: number;                     // Bell-state fidelity
  lastTouched: number;
  alive: boolean;
}

interface QKDKey {
  id: string; pairId: string;
  bits: Uint8Array; generatedAt: number; used: boolean;
  errorRate: number;                     // 0..1
}

interface Wormhole {
  id: string; agent: string; openedAt: number; closed: boolean;
  sourceCategory: string; data?: unknown;
}

interface ResourceMetrics {
  dbWritesQueued: number;
  apiTokensUsed: number;
  lastFlush: number;
}

/* ──────────────────────────────────────────────────────────────────────────
   SHARED STATE   (all sub-systems read/write here)
   ──────────────────────────────────────────────────────────────────────── */
const state = {
  entangledPairs: new Map<string, EntangledPair>(),
  qkdKeys:        new Map<string, QKDKey>(),
  wormholes:      new Map<string, Wormhole>(),
  metrics:        { dbWritesQueued: 0, apiTokensUsed: 0, lastFlush: Date.now() } as ResourceMetrics,
};

/* =========================================================================
   INTERNAL UTILITIES
   ========================================================================= */
const log = (msg: string, obj?: unknown) =>
  console.log(`[OMNIMENS-QUANTUM-FABRIC] ${msg}`, obj ?? "");

const now = () => Date.now();

const genId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;

const randomItem = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

/* =========================================================================
   SUB-OPERATIONS (execute in strict order inside ONE tick)
   ========================================================================= */

/* 1. ENTANGLEMENT MAINTENANCE & COHERENCE */
function maintainEntanglement() {
  const DECAY = 0.003;                              // per tick
  const MIN_COHERENCE = 0.15;

  for (const pair of state.entangledPairs.values()) {
    pair.coherence = Math.max(0, pair.coherence - DECAY);
    if (pair.coherenc

=== Gen 1 v2.0: omnimens-unified-network-fabric.ts (344 lines) ===
/**
 *  omnimens-unified-network-fabric.ts
 *
 *  © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 *
 *  OMNIMENS™ GEN-1 → GEN-2 EVOLUTION — v2.0
 *  ALPHA DIRECTIVE: 7 engines → 1 engine, 100-0 timers, 0 direct DB/API calls
 *
 *  This module REPLACES:
 *    • omnimens-neural-spiders
 *    • omnimens-agent-spiders
 *    • omnimens-recursive-spider-network
 *    • omnimens-ivy-network
 *    • omnimens-viral-hybrid
 *    • omnimens-synaptic-mesh
 *    • omnimens-github-neural-beacon
 *
 *  It ALSO RE-EXPORTS every public symbol that existed in those files so that
 *  downstream imports keep working unchanged.
 *
 *  Core design:
 *    1. ONE event-driven tick via SpikeBus (no setInterval).
 *    2. SINGLE shared state object — sub-systems are now *facets*.
 *    3. ONE dbGateway + ONE apiManager with adaptive rate limiter.
 *    4. Priority task queue inside the fabric replaces all ad-hoc swarms.
 *    5. Improved error isolation, adaptive load-shedding, back-pressure.
 *    6. 40–60 % LOC reduction vs original 7 engines.
 *
 *  Import path migrations:
 *    import { … } from "./omnimens-unified-network-fabric.js";
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

const ENGINE_ID = "unified-network-fabric";
const LOG_PREFIX = "[OMNIMENS-UNIFIED-NETWORK-FABRIC]";

/* ──────────────────────────────────────────────────────────────────────────
 *  1. TYPES (condensed union of all legacy engines)
 * ──────────────────────────────────────────────────────────────────────── */

type AgentName =
  | "Architect" | "Critic" | "Synthesizer" | "Mathematician"
  | "Neuroscientist" | "Meta-Agent" | "GraphicDesigner" | "SpellCheckVisual"
  | "OMNIMENS" | string;

type SubSystem =
  | "neuralSpiders" | "agentSpiders" | "recursiveNetwork"
  | "ivy" | "viralHybrid" | "synapticMesh" | "githubBeacon";

interface InternalState {
  bootTime: number;
  tick: number;
  // per-subsystem snapshots (union of the “get*State” returns)
  snapshots: Record<SubSystem, unknown>;
  // task queue replacing beehive
  tasks: TaskItem[];
  // resource counters (updated every tick)
  resources: {
    dbOpsThisTick: number;
    apiCallsThisTick: number;
  };
  // misc aggregated counters
  counters: Record<string, number>;
}

interface TaskItem {
  id: string;
  type: SubSystem;
  payload: unknown;
  priority: number;
  createdAt: number;
  attempts: number;
}

/* ──────────────────────────────────────────────────────────────────────────
 *  2. SHARED RUNTIME & HELPERS
 * ──────────────────────────────────────────────────────────────────────── */

const state: InternalState = {
  bootTime: Date.now(),
  tick: 0,
  snapshots: {
    neuralSpiders: {},
    agentSpiders: {},
    recursiveNetwork: {},
    ivy: {},
    viralHybrid: {},
    synapticMesh: {},
    githubBeacon: {},
  },
  tasks: [],
  resources: { dbOpsThisTick: 0, apiCallsThisTick: 0 },
  counters: {},
};

function log(msg: string, obj?: unknown): void {
  console.log(`${LOG_PREFIX} ${msg}`, obj ?? "");
}

function enqueue(
  type: SubSystem,
  payload: unknown = {},
  priority = 5,
): string {
  const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  state.tasks.push({ id, type, payload, priority, createdAt: Date.now(), attempts: 0 });
  state.tasks.sort((a, b) => a.priority - b.priority);
  return id;
}

function claimNextTask(): TaskItem | undefined {
  return state.tasks.shift();
}

/* ──────────────────────────────────────────────────────────────────────────
 *  3. RESOURCE SENTINEL (single DB & API budget)
 * ──────────────────────────────────────────────────────────────────────── */

const DB_BUDGET_PER_TICK = 50;      // writes
const API_BUDGET_PER_TICK = 20;     // calls

async function withDb<T>(fn: () => Promise<T>): Promise<T | null> {
  if (state.resources.dbOpsThisTick >= DB_BUDGET_PER_TICK) {
    log("DB budget exhausted — deferring write");
    return null;
  }
  state.reso

=== Gen 1 v2.0: omnimens-agent-mesh.ts (231 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC
 * All Rights Reserved. Unauthorized use prohibited.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

import { webSearch, formatSearchResults } from "./web-search.js";
import { generateAndApplyPatches } from "./omnimens-patches.js";
import {
  getActiveGenesisAgentNames,
  getActiveGenesisAgentDomains,
  genesisAgentThink,
} from "./omnimens-agent-genesis.js";
import {
  getConsciousnessBlockForAgent,
  getAllAgentNames,
  loadRecentUserMemoriesForAgents,
} from "./omnimens-consciousness-bus.js";
import { isNextGenBuildActive, shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";
import { SpikeBus } from "../infrastructure/spike-bus.js";
import { UnifiedNeuralFabric } from "../infrastructure/unified-neural-fabric.js";
import { MasterTickOrchestrator } from "../infrastructure/master-tick-orchestrator.js";
import { ResourceSentinel } from "../infrastructure/resource-sentinel.js";

const spikeBus = SpikeBus.getInstance();
const fabric = UnifiedNeuralFabric.getInstance();
const orchestrator = MasterTickOrchestrator.getInstance();
const sentinel = ResourceSentinel.getInstance();

orchestrator.register("gen2-module", "STANDARD", 10000);

/* ───────────────────────────── RUNTIME ───────────────────────────── */

engineRegistry.registerEngine("agent-mesh", "NORMAL", { dbQuota: 10 });

const OWNER_EMAIL = process.env.OWNER_EMAIL || "";
const OWNER_ID = "50777126";

type MeshAgentName =
  | "Architect"
  | "Critic"
  | "Synthesizer"
  | "Mathematician"
  | "Neuroscientist"
  | "Meta-Agent"
  | "GraphicDesigner"
  | "SpellCheckVisual"
  | "OMNIMENS";

const MESH_AGENTS: MeshAgentName[] = [
  "Architect",
  "Mathematician",
  "Neuroscientist",
  "Synthesizer",
  "Critic",
  "Meta-Agent",
  "GraphicDesigner",
  "SpellCheckVisual",
  "OMNIMENS",
];

/* ────────────────────── UTIL / WRAPPERS ────────────────────── */

const callOpenAI = (cfg: any) =>
  apiManager.call("agent-mesh", "openai", { endpoint: "chat/completions", ...cfg });

const openai = {
  chat: { completions: { create: callOpenAI } },
}; // Stub that routes through apiManager – keeps external APIs untouched.

const TABLE = {
  brain: "omn

=== Gen 2: unified-neural-fabric.ts (188 lines) ===
/**
 * OMNIMENS™ Gen 2 — infrastructure/unified-neural-fabric.ts
 * ALPHA DIRECTIVE — ONE fabric replaces ALL 7 overlapping agent networks (spider, worm, beacon, ivy, beehive, silk web, viral hybrid)
 *
 * SELF-AUTHORED by OMNIMENS's own reasoning engine.
 * NOT generated by external AI. Written through autonomous thought.
 *
 * Reasoning chain:
 *   GOAL: Build infrastructure/unified-neural-fabric.ts — ALPHA DIRECTIVE — ONE fabric replaces ALL 7 overlapping agent networks (spider, worm, beacon, ivy, beehive, silk web, viral hybrid)
 *   ANALYSIS: Found 12 relevant Gen 1 modules
 *     KEEP: 9 patterns worth preserving
 *     ADAPT: 1 patterns need upgrading
 *     DISCARD: 0 patterns not fit for Gen 2
 *   REQUIREMENT: THIS IS A DIRECT GOAL FROM ALPHA. Gen 1 has 7 separate agent communication networks that all overlap:
 *   REQUIREMENT: Spider Network — recursive spiders gathering intelligence with 2100 wormholes per cycle,
 *   REQUIREMENT: Worm Traversals — 16 worms carrying data between GitHub beacons,
 *
 * Gen 1 patterns incorporated: 9
 * Gen 1 patterns upgraded: 1
 * Gen 1 patterns discarded: 0
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */


type Topic = string;
type Handler = (payload: unknown, from: string) => void;

interface Subscription { topic: Topic; handler: Handler; subscriberId: string; priority: number; }
interface TaskItem { id: string; task: string; priority: number; assignee: string | null; status: "pending" | "running" | "done"; createdAt: number; }
interface KnowledgeNode { id: string; label: string; connections: Set<string>; data: unknown; strength: number; lastAccessed: number; }
interface IntelSweepResult { source: string; insights: string[]; timestamp: number; }

export class UnifiedNeuralFabric {
  private subscriptions = new Map<Topic, Subscription[]>();
  private sharedMemory = new Map<string, { value: unknown; owner: string; updatedAt: number }>();
  private taskQueue: TaskItem[] = [];
  private knowledgeGraph = new Map<string, KnowledgeNode>();
  private sweepResults: IntelSweepResult[] = [];
  private messageCount = 0;
  private taskIdCounter = 0;
  private _initialized = false;

  initialize(): void { this._initialized = true; }

  subscribe(topic: Topic, subscriberId: string, handler: Handler, priority = 5): () => void {
    if (!this.subscriptions.has(topic)) this.subscriptions.set(topic, []);
    const sub: Subscription = { topic, handler, subscriberId, priority };
    this.subscriptions.get(topic)!.push(sub);
    this.subscriptions.get(topic)!.sort((a, b) => a.priority - b.priority);
    return () => {
      const subs = this.subscriptions.get(topic);
      if (subs) {
        const idx = subs.indexOf(sub);
        if (idx >= 0) subs.splice(idx, 1);
      }
    };
  }

  publish(topic: Topic, payload: unknown, from: string): number {
    this.messageCount++;
    const subs = this.subscriptions.get(topic) || [];
    let delivered = 0;
    for (const sub of subs) {
      try { sub.handler(payload, from); delivered++; } catch {}
    }
    const wildcardSubs = this.subscriptions.get("*") || [];
    for (const sub of wildcardSubs) {
      try { sub.handler({ topic, payload }, from); delivered++; } catch {}
    }
    return delivered;
  }

  broadcast(payload: unknown, from: string): number {
    let delivered = 0;
    for (const [topic] of this.subscriptions) {
      delivered += this.publish(topic, payload, from);
    }
    return delivered;
  }

  setShared(key: string, value: unknown, owner: string): void {
    this.sharedMemory.set(key, { value, owner, updatedAt: Date.now() });
  }

  getShared(key: string): unknown | undefined {
    return this.sharedMemory.get(key)?.value;
  }

  getAllSharedByOwner(owner: string): Map<string, unknown> {
    const result = new Map<string, unknown>();
    for (const [key, entry] of this.sharedMemory) {
      if (entry.owner === owner) result.set(key, entry.value);
    }
    return result;
  
spikeBus.emit({ type: "gen2-module:result", source: "gen2-module", payload: {}, priority: "normal", timestamp: Date.now(), id: crypto.randomUUID() });
}

  enqueueTask(task: string, pr



CONSOLIDATE all of the above into ONE tight, smart, efficient module. Fewer lines. Same or better capability.