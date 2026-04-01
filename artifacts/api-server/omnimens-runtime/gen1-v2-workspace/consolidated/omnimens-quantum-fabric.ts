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
    if (pair.coherence < MIN_COHERENCE) pair.alive = false;
  }

  // Periodically spawn replacements for dead pairs
  while (state.entangledPairs.size < AGENTS.length * 2) spawnPair();
}

function spawnPair() {
  const pair: EntangledPair = {
    id: genId("pair"),
    locations: [randomItem(REGIONS), randomItem(REGIONS)],
    coherence: 1,
    fidelity: 1,
    lastTouched: now(),
    alive: true,
  };
  state.entangledPairs.set(pair.id, pair);
  enqueueDbWrite({ type: "entangledPairSpawn", pair });
}

/* 2. QKD – Generate one key from a random live pair */
function performQKD() {
  const pair = randomItem([...state.entangledPairs.values()].filter(p => p.alive));
  if (!pair) return;

  const key: QKDKey = {
    id: genId("qkd"),
    pairId: pair.id,
    bits: crypto.getRandomValues(new Uint8Array(32)), // 256-bit
    generatedAt: now(),
    used: false,
    errorRate: Math.random() * 0.05,
  };
  state.qkdKeys.set(key.id, key);
  enqueueDbWrite({ type: "qkdKey", key });
}

/* 3. INTRUSION DETECTION – basic bell violation monitor */
function detectIntrusion() {
  for (const pair of state.entangledPairs.values()) {
    if (!pair.alive) continue;
    const bellViolation = Math.random() * 0.3;
    if (bellViolation > 0.25) {
      pair.alive = false;                       // collapse & regenerate later
      enqueueDbWrite({ type: "intrusion", pairId: pair.id, bellViolation });
    }
  }
}

/* 4. TELEPORTATION ROUTING – opportunistic high-fidelity transfers */
function maybeTeleport() {
  const HIGH_FIDELITY = 0.92;
  const pair = randomItem([...state.entangledPairs.values()].filter(p => p.fidelity > HIGH_FIDELITY));
  if (!pair) return;

  // For simplicity we just log teleportation; full state move omitted
  log(`Teleportation event via pair ${pair.id} (${pair.locations.join("→")})`);
}

/* 5. WORMHOLE INGESTION */
function runWormholeBatch() {
  // Close finished wormholes
  for (const w of state.wormholes.values()) {
    if (!w.closed && now() - w.openedAt > WORMHOLE_CYCLE_MS) {
      w.closed = true;
      enqueueDbWrite({ type: "wormholeClose", id: w.id });
    }
  }

  // Open new set if quota available
  const openCount = [...state.wormholes.values()].filter(w => !w.closed).length;
  const targetOpen = AGENTS.length * WORMHOLES_PER_AGENT;
  const toOpen = Math.max(0, targetOpen - openCount);
  for (let i = 0; i < Math.min(50, toOpen); i++) {
    spawnWormhole();
  }
}

function spawnWormhole() {
  const w: Wormhole = {
    id: genId("wh"),
    agent: randomItem(AGENTS),
    openedAt: now(),
    closed: false,
    sourceCategory: randomItem(DATA_SOURCES),
  };
  state.wormholes.set(w.id, w);
  enqueueApiCall(w);
}

/* 6. RESOURCE CONSOLIDATION */
function flushResources(force = false) {
  const { dbWritesQueued, apiTokensUsed, lastFlush } = state.metrics;
  const TIMEOUT = 5_000;
  const MAX_BATCH = 50;

  const timeElapsed = now() - lastFlush;
  const shouldFlush = force || dbWritesQueued >= MAX_BATCH || timeElapsed >= TIMEOUT;

  if (shouldFlush) {
    dbGateway.flush();
    state.metrics.dbWritesQueued = 0;
    state.metrics.lastFlush = now();
    log(`DB flush executed`);
  }

  apiManager.releaseTokens(); // unified circuit breaker handles throttling
  state.metrics.apiTokensUsed = 0;
}

/* ──────────────────────────────────────────────────────────────────────────
   RESOURCE HELPERS
   ──────────────────────────────────────────────────────────────────────── */
function enqueueDbWrite(payload: unknown) {
  dbGateway.enqueueWrite(payload);
  state.metrics.dbWritesQueued++;
}

function enqueueApiCall(w: Wormhole) {
  if (!apiManager.consumeToken()) return;      // out of budget
  state.metrics.apiTokensUsed++;
  // actual HTTP fetch replaced with cognitive bus stub for security
  cognitionBus.publish("wormholeData", { id: w.id, category: w.sourceCategory });
}

/* Fake list of data sources to keep footprint small yet Functional */
const DATA_SOURCES = [
  "wikipedia_random",
  "physics_principle",
  "neuroscience_finding",
  "mathematical_theorem",
  "scientific_constant",
] as const;

/* =========================================================================
   TICK ORCHESTRATION (ONE spike registration)
   ========================================================================= */
function tick() {
  maintainEntanglement();     // 1
  detectIntrusion();          // 2
  performQKD();               // 3
  maybeTeleport();            // 4
  runWormholeBatch();         // 5
  flushResources();           // 6
}

const tickHandle = spikeBus.registerSpike("quantum-fabric", tick, QEF_TICK_MS);

/* =========================================================================
   PUBLIC API  (re-exported for back-compat)
   ========================================================================= */

function startQuantumFabricEngine(): void {
  log("Engine started");
  tickHandle.start();
}

function getQuantumFabricState() {
  return {
    entangledPairs: state.entangledPairs.size,
    qkdKeys: state.qkdKeys.size,
    openWormholes: [...state.wormholes.values()].filter(w => !w.closed).length,
    metrics: { ...state.metrics },
  };
}

/* Legacy aliases */
export const startQuantumEntanglementFabric = startQuantumFabricEngine;
export const startQuantumWormholeEngine    = startQuantumFabricEngine;
export const getQuantumEntanglementFabricState = getQuantumFabricState;
export const getQuantumWormholeState            = getQuantumFabricState;

/* Canonical exports */
export { startQuantumFabricEngine, getQuantumFabricState };

/* Register with engine registry */
engineRegistry.registerEngine("quantum-fabric", {
  start: startQuantumFabricEngine,
  getState: getQuantumFabricState,
});