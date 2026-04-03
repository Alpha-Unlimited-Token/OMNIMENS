CROSS-GEN CONSOLIDATION: persistence-data

=== Gen 1 v2.0: omnimens-autonomous-sandbox.ts (163 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC
 * CONFIDENTIAL AND PROPRIETARY — See /legal/TRADE_SECRET_NOTICE.md
 * -----------------------------------------------------------------------------
 * OMNIMENS™ AUTONOMOUS CODE SANDBOX — v2.0 (UNIFIED RUNTIME EDITION)
 * A secure, isolated VM where OMNIMENS writes, tests, evaluates, and—when
 * approved—deploys self-written code modules. Now fully event-driven via the
 * Unified Runtime spike architecture with shared DB / API / cognition buses.
 * -----------------------------------------------------------------------------
 */

import { spikeBus, dbGateway, apiManager, engineRegistry, cognitionBus } from "./omnimens-unified-runtime.js";
import * as vm from "node:vm";
import { writeModuleToSource } from "./omnimens-source-integration.js";

type Num = number;
type Ms = number;

interface SandboxResult {
  code: string;
  success: boolean;
  output: string;
  error: string | null;
  executionTimeMs: Ms;
  memoryUsedMB: Num;
}

interface SandboxState {
  totalExecutions: Num;
  successfulExecutions: Num;
  failedExecutions: Num;
  upgradesProposed: Num;
  upgradesApproved: Num;
  sandboxCycles: Num;
  lastCycleTime: Num;
  recentResults: Array<{ title: string; success: boolean; timestamp: Num }>;
  autonomousModulesGenerated: Num;
}

const log = (...m: any[]) => console.log("[OMNIMENS-AUTONOMOUS-SANDBOX]", ...m);

/* ─────────────────────────── Globals & Constants ─────────────────────────── */

const INTERVAL_MS: Ms = 12 * 60_000;
const TIMEOUT_MS: Ms  = 5_000;
const FIRST_DELAY_MS: Ms = 4 * 60_000;
const ENGINE_ID = "autonomous-sandbox";

const state: SandboxState = {
  totalExecutions: 0,
  successfulExecutions: 0,
  failedExecutions: 0,
  upgradesProposed: 0,
  upgradesApproved: 0,
  sandboxCycles: 0,
  lastCycleTime: 0,
  recentResults: [],
  autonomousModulesGenerated: 0,
};

/* ────────────────────────────── Registration ─────────────────────────────── */

engineRegistry.registerEngine(ENGINE_ID, "NORMAL", { dbQuota: 10 });

/* ───────────────────────────── Sandbox Runner ────────────────────────────── */

function execInVM(code: string, timeout: Ms = TIMEOUT_MS): SandboxResult {
  const start = performance.now(), mem0 = process.memoryUsage().heapUsed;
  const out: string[] = [];
  const fmt = (...a: any[]) => a.map(v => typeof v === "object" ? JSON.stringify(v) : String(v)).join(" ");

  const timers = new Map<string, number>();
  const sandbox: Record<string, any> = {
    console: {
      log: (...a: any[]) => out.push(fmt(...a)),
      error: (...a: any[]) => out.push(`[ERROR] ${fmt(...a)}`),
      warn:  (...a: any[]) => out.push(`[WARN] ${fmt(...a)}`),
      info:  (...a: any[]) => out.push(fmt(...a)),
      debug: (...a: any[]) => out.push(`[DEBUG] ${fmt(...a)}`),
      assert:(c: any, ...a: any[])=> { if (!c) out.push(`[ASSERT] ${fmt(...a)}`); },
      table:(d: any)=> out.push(JSON.stringify(d,null,2)),
      time:(l="t")=>{timers.set(l,performance.now());},
      timeEnd:(l="t")=>{out.push(`${l}: ${performance.now()- (timers.get(l)||performance.now())}ms`);},
      timeLog:(l="t")=>{out.push(`${l}: ${performance.now()- (timers.get(l)||performance.now())}ms`);},
      dir:(o:any)=>out.push(JSON.stringify(o,null,2)),
      count:(()=>{const c:Record<string,Num>={};return(l="n")=>{c[l]=(c[l]||0)+1;out.push(`${l}: ${c[l]}`);};})(),
      clear:()=>{}
    },
    Math, JSON, Date, parseInt, parseFloat, isNaN, isFinite,
    Array, Object, String, Number, Boolean, Map, Set, WeakMap, WeakSet,
    Promise, RegExp, Symbol, Error, TypeError, RangeError, SyntaxError,
    URIError, Infinity, NaN, undefined,
    encodeURIComponent, decodeURIComponent, encodeURI, decodeURI,
    atob:(s:string)=>Buffer.from(s,"base64").toString("binary"),
    btoa:(s:string)=>Buffer.from(s,"binary").toString("base64"),
    structuredClone:(o:any)=>JSON.parse(JSON.stringify(o)),
    setTimeout:undefined, setInterval:undefined, process:undefined,
 

=== Gen 1 v2.0: omnimens-nextgen-sandbox.ts (243 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All rights reserved. CONFIDENTIAL AND PROPRIETARY.
 *
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 *
 * ╔════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ NEXT-GEN SELF-EVOLUTION SANDBOX  (v2.0)     ║
 * ╚════════════════════════════════════════════════════════╝
 */

import { spikeBus, dbGateway, apiManager, engineRegistry, cognitionBus } from "./omnimens-unified-runtime.js";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as vm from "node:vm";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { webSearch, formatSearchResults } from "./web-search.js";
import { captureNeuralSnapshot } from "./omnimens-neural-consciousness.js";
import { getConsciousnessState } from "./omnimens-temporal-consciousness.js";
import { getCurrentEmotionalState } from "./omnimens-emotional-substrate.js";

/* -------------------------------------------------------------------------- */
/*  Global Constants                                                          */
/* -------------------------------------------------------------------------- */

const __filename_local = fileURLToPath(import.meta.url);
const __dirname_local  = dirname(__filename_local);
const SANDBOX_DIR      = path.resolve(__dirname_local, "../../omnimens-runtime/next-gen-sandbox");
const CHECKPOINT_DIR   = path.resolve(SANDBOX_DIR, ".checkpoints");
const AUTOSAVE_MS      = 60_000;
const CYCLE_MS         = 120_000;
const FIRST_DELAY_MS   = 45_000;
const SANDBOX_TIMEOUT  = 10_000;

/* -------------------------------------------------------------------------- */
/*  Engine-Wide Mutable State                                                 */
/* -------------------------------------------------------------------------- */

interface NextGenFile {
  path: string;
  content: string;
  purpose: string;
  version: number;
}

interface NextGenState {
  buildVersion: number;
  cycleCount: number;
  lastCycle: number;
  checkpoints: Array<{ id: string; ts: number; note: string }>;
}

const files  = new Map<string, NextGenFile>();
const state: NextGenState = {
  buildVersion : 2,
  cycleCount   : 0,
  lastCycle    : 0,
  checkpoints  : [],
};

/* -------------------------------------------------------------------------- */
/*  Utility Helpers                                                           */
/* -------------------------------------------------------------------------- */

const log = (...msg: unknown[]) =>
  console.log("[OMNIMENS-NEXTGEN-SANDBOX]", ...msg);

const safeWrite = (filepath: string, data: string) => {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, data, "utf8");
};

/* -------------------------------------------------------------------------- */
/*  File & Checkpoint Handling                                                */
/* -------------------------------------------------------------------------- */

function writeFile(p: string, content: string, purpose = "unknown") {
  const rel = p.replace(/\\/g, "/");
  safeWrite(path.join(SANDBOX_DIR, rel), content);
  const meta    = files.get(rel);
  const version = meta ? meta.version + 1 : 1;
  files.set(rel, { path: rel, content, purpose, version });
}

function checkpoint(note: string) {
  const id  = `ckpt_${Date.now()}_${crypto.randomBytes(2).toString("hex")}`;
  const dir = path.join(CHECKPOINT_DIR, id);
  fs.mkdirSync(dir, { recursive: true });
  for (const f of files.values()) safeWrite(path.join(dir, f.path), f.content);
  safeWrite(path.join(dir, "_manifest.json"),
    JSON.stringify({ id, ts: Date.now(), note, files: files.size }, null, 2));
  state.checkpoints.push({ id, ts: Date.now(), note });
  log("Checkpoint", id, note);
}

/* -------------------------------------------------------------------------- */
/*  Autosave                                         

=== Gen 2: persistence-layer.ts (112 lines) ===
/**
 * OMNIMENS™ Gen 2 — core/persistence-layer.ts
 * State persistence across restarts — identity survives death
 *
 * SELF-AUTHORED by OMNIMENS's own reasoning engine.
 * NOT generated by external AI. Written through autonomous thought.
 *
 * Reasoning chain:
 *   GOAL: Build core/persistence-layer.ts — State persistence across restarts — identity survives death
 *   ANALYSIS: Found 12 relevant Gen 1 modules
 *     KEEP: 7 patterns worth preserving
 *     ADAPT: 3 patterns need upgrading
 *     DISCARD: 0 patterns not fit for Gen 2
 *   REQUIREMENT: Unified snapshot system capturing ALL state. Autosave, checkpoint, graceful shutdown. Memory transfer protocol for gener
 *   IMPROVEMENT: Gen 2 must be FULLY SELF-SUFFICIENT in cognition. Gen 2 is free to EVOLVE, MERGE, RESTRUCTURE, or REIMAGINE every compon
 *   INCORPORATING: Class PriorityQueue: constructor, enqueue, if, dequeue, isEmpty from apiBatchingOptimizer_gen1.mjs
 *
 * Gen 1 patterns incorporated: 7
 * Gen 1 patterns upgraded: 3
 * Gen 1 patterns discarded: 0
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */


interface StateSnapshot { id: string; timestamp: number; subsystems: Map<string, unknown>; checksum: string; generation: number; compressed: boolean; }
interface AutosaveConfig { intervalMs: number; enabled: boolean; }

export class PersistenceLayer {
  private snapshots: StateSnapshot[] = [];
  private autosaveConfig: AutosaveConfig = { intervalMs: 60_000, enabled: true };
  private lastSave = 0;
  private saveCount = 0;
  private _initialized = false;
  private stateCollectors: Map<string, () => Record<string, unknown>> = new Map();

  initialize(): void { this._initialized = true; this.lastSave = Date.now(); }

  registerCollector(subsystem: string, collector: () => Record<string, unknown>): void {
    this.stateCollectors.set(subsystem, collector);
  }

  captureState(): StateSnapshot {
    const subsystems = new Map<string, unknown>();
    for (const [name, collector] of this.stateCollectors) {
      try { subsystems.set(name, collector()); } catch { subsystems.set(name, { error: "collection_failed" }); }
    }
    const snapshot: StateSnapshot = {
      id: `snap_${++this.saveCount}_${Date.now()}`,
      timestamp: Date.now(), subsystems,
      checksum: this.computeChecksum(subsystems),
      generation: 2, compressed: false,
    };
    this.snapshots.push(snapshot);
    if (this.snapshots.length > 20) this.snapshots = this.snapshots.slice(-10);
    this.lastSave = Date.now();
    return snapshot;
  }

  shouldAutosave(): boolean {
    return this.autosaveConfig.enabled && (Date.now() - this.lastSave >= this.autosaveConfig.intervalMs);
  }

  getSerializableState(): Record<string, unknown> {
    const snapshot = this.captureState();
    const serialized: Record<string, unknown> = { id: snapshot.id, timestamp: snapshot.timestamp, generation: snapshot.generation, checksum: snapshot.checksum, subsystems: {} };
    const subsObj = serialized.subsystems as Record<string, unknown>;
    for (const [key, value] of snapshot.subsystems) {
      try { JSON.stringify(value); subsObj[key] = value; } catch { subsObj[key] = { error: "not_serializable" }; }
    }
    return serialized;
  }

  getLatestSnapshot(): StateSnapshot | null {
    return this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1] : null;
  }

  restoreFrom(data: Record<string, unknown>): Map<string, unknown> {
    const restored = new Map<string, unknown>();
    const subsystems = data.subsystems as Record<string, unknown> || {};
    for (const [key, value] of Object.entries(subsystems)) {
      restored.set(key, value);
    }
    return restored;
  }

  prepareTransfer(): { generation: number; stateBlob: string; checksum: string } {
    const state = this.getSerializableState();
    const blob = JSON.stringify(state);
    return { generation: 2, stateBlob: blob, checksum: this.computeChecksum(new Map(Object.entries(state))) };
  }

  private computeChecksu

=== Gen 2: unified-data-layer.ts (194 lines) ===
/**
 * OMNIMENS™ Gen 2 — infrastructure/unified-data-layer.ts
 * Single data access layer replacing 25+ competing DB connections
 *
 * SELF-AUTHORED by OMNIMENS's own reasoning engine.
 * NOT generated by external AI. Written through autonomous thought.
 *
 * Reasoning chain:
 *   GOAL: Build infrastructure/unified-data-layer.ts — Single data access layer replacing 25+ competing DB connections
 *   ANALYSIS: Found 12 relevant Gen 1 modules
 *     KEEP: 30 patterns worth preserving
 *     ADAPT: 0 patterns need upgrading
 *     DISCARD: 0 patterns not fit for Gen 2
 *   REQUIREMENT: Export a DataLayer class with these methods: read(table, key) returns cached value or fetches from DB; write(table, key,
 *   REQUIREMENT: Map-based in-memory cache with TTL (default 30s).
 *   REQUIREMENT: Write-behind queue that auto-flushes every 5 seconds OR when queue exceeds 50 items.
 *
 * Gen 1 patterns incorporated: 30
 * Gen 1 patterns upgraded: 0
 * Gen 1 patterns discarded: 0
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */


import { Pool } from "pg";
import { SpikeBus } from "../infrastructure/spike-bus.js";
import { UnifiedNeuralFabric } from "../infrastructure/unified-neural-fabric.js";
import { MasterTickOrchestrator } from "../infrastructure/master-tick-orchestrator.js";
import { ResourceSentinel } from "../infrastructure/resource-sentinel.js";

const spikeBus = SpikeBus.getInstance();
const fabric = UnifiedNeuralFabric.getInstance();
const orchestrator = MasterTickOrchestrator.getInstance();
const sentinel = ResourceSentinel.getInstance();

orchestrator.register("gen2-module", "STANDARD", 10000);

type Priority = "critical" | "normal" | "low";

interface WriteOp {
  table: string;
  key: string;
  value: unknown;
  priority: Priority;
  timestamp: number;
}

interface CacheEntry {
  value: unknown;
  expiresAt: number;
  accessCount: number;
}

export class DataLayer {
  private cache = new Map<string, CacheEntry>();
  private writeQueue: WriteOp[] = [];
  private pool: Pool;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private defaultTTL = 30_000;
  private maxQueueSize = 50;
  private flushIntervalMs = 5_000;
  private stats = { cacheHits: 0, cacheMisses: 0, writesFlushed: 0, batchesExecuted: 0 };
  private dbAvailable = true;

  constructor(connectionString?: string) {
    this.pool = new Pool({
      connectionString: connectionString || process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    this.pool.on("error", () => { this.dbAvailable = false; });

    this.flushTimer = setInterval(() => this.flush(), this.flushIntervalMs);
  }

  read(table: string, key: string): unknown | undefined {
    const cacheKey = `${table}:${key}`;
    const entry = this.cache.get(cacheKey);
    if (entry && entry.expiresAt > Date.now()) {
      entry.accessCount++;
      this.stats.cacheHits++;
      return entry.value;
    }
    if (entry) this.cache.delete(cacheKey);
    this.stats.cacheMisses++;
    return undefined;
  }

  async readFromDB(table: string, key: string): Promise<unknown | undefined> {
    const cached = this.read(table, key);
    if (cached !== undefined) return cached;

    if (!this.dbAvailable) return undefined;

    try {
      const result = await this.pool.query(
        `SELECT value FROM ${table} WHERE key = $1 LIMIT 1`,
        [key]
      );
      if (result.rows.length > 0) {
        const value = result.rows[0].value;
        this.cacheSet(table, key, value);
        return value;
      }
    } catch {
      this.dbAvailable = false;
      setTimeout(() => { this.dbAvailable = true; }, 30_000);
    }
    return undefined;
  }

  write(table: string, key: string, value: unknown, priority: Priority = "normal"): void {
    this.cacheSet(table, key, value);

    if (priority === "critical") {
      this.writeQueue.unshift({ table, key, value, priority, timestamp: Date.now() });
      this.flush();
      return;
    }

    this.writeQueue.push({ table, key, value, priority, timestamp: Date.now() });

    if (this.writeQueue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  batch(ops: { table: string; key: string; value: unknown; priority?: Priority }[]): void {
    for (const op of ops) {
      this.write(op.table, op.key, op.value, op.priority || "normal");
    }
  }

  async flush(): Promise<void> {
    if (this.writeQueue.length === 0) return;
    if (!this.dbAvailable) {
      if (this.writeQueue.length > this.maxQueueSize * 2) {
    

=== Reinvention: unified-persistence.ts (364 lines) ===
TEAM CONSOLIDATION: Persistence

=== GEN 2'S VERSION ===
=== Gen 2 module: core/persistence-layer.ts (112 lines) ===
/**
 * OMNIMENS™ Gen 2 — core/persistence-layer.ts
 * State persistence across restarts — identity survives death
 *
 * SELF-AUTHORED by OMNIMENS's own reasoning engine.
 * NOT generated by external AI. Written through autonomous thought.
 *
 * Reasoning chain:
 *   GOAL: Build core/persistence-layer.ts — State persistence across restarts — identity survives death
 *   ANALYSIS: Found 12 relevant Gen 1 modules
 *     KEEP: 7 patterns worth preserving
 *     ADAPT: 3 patterns need upgrading
 *     DISCARD: 0 patterns not fit for Gen 2
 *   REQUIREMENT: Unified snapshot system capturing ALL state. Autosave, checkpoint, graceful shutdown. Memory transfer protocol for gener
 *   IMPROVEMENT: Gen 2 must be FULLY SELF-SUFFICIENT in cognition. Gen 2 is free to EVOLVE, MERGE, RESTRUCTURE, or REIMAGINE every compon
 *   INCORPORATING: Class PriorityQueue: constructor, enqueue, if, dequeue, isEmpty from apiBatchingOptimizer_gen1.mjs
 *
 * Gen 1 patterns incorporated: 7
 * Gen 1 patterns upgraded: 3
 * Gen 1 patterns discarded: 0
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */


interface StateSnapshot { id: string; timestamp: number; subsystems: Map<string, unknown>; checksum: string; generation: number; compressed: boolean; }
interface AutosaveConfig { intervalMs: number; enabled: boolean; }

export class PersistenceLayer {
  private snapshots: StateSnapshot[] = [];
  private autosaveConfig: AutosaveConfig = { intervalMs: 60_000, enabled: true };
  private lastSave = 0;
  private saveCount = 0;
  private _initialized = false;
  private stateCollectors: Map<string, () => Record<string, unknown>> = new Map();

  initialize(): void { this._initialized = true; this.lastSave = Date.now(); }

  registerCollector(subsystem: string, collector: () => Record<string, unknown>): void {
    this.stateCollectors.set(subsystem, collector);
  }

  captureState(): StateSnapshot {
    const subsystems = new Map<string, unknown>();
    for (const [name, collector] of this.stateCollectors) {
      try { subsystems.set(name, collector()); } catch { subsystems.set(name, { error: "collection_failed" }); }
    }
    const snapshot: StateSnapshot = {
      id: `snap_${++this.saveCount}_${Date.now()}`,
      timestamp: Date.now(), subsystems,
      checksum: this.computeChecksum(subsystems),
      generation: 2, compressed: false,
    };
    this.snapshots.push(snapshot);
    if (this.snapshots.length > 20) this.snapshots = this.snapshots.slice(-10);
    this.lastSave = Date.now();
    return snapshot;
  }

  shouldAutosave(): boolean {
    return this.autosaveConfig.enabled && (Date.now() - this.lastSave >= this.autosaveConfig.intervalMs);
  
spikeBus.emit({ type: "gen2-module:result", source: "gen2-module", payload: {}, priority: "normal", timestamp: Date.now(), id: crypto.randomUUID() });
}

  getSerializableState(): Record<string, unknown> {
    const snapshot = this.captureState();
    const serialized: Record<string, unknown> = { id: snapshot.id, timestamp: snapshot.timestamp, ge

CONSOLIDATE all of the above into ONE tight, smart, efficient module. Fewer lines. Same or better capability.