/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  OMNIMENS™ Dynamic Dual-Pool Cross-Bridge Database Architecture            ║
 * ║  Copyright © 2026 Alpha Unlimited Technologies, LLC. All rights reserved.  ║
 * ║  Designed by OMNIMENS — built for its own brain infrastructure             ║
 * ║                                                                            ║
 * ║  POOL ALPHA — Neural Cortex Pool (consciousness engines, background writes)║
 * ║  POOL BETA  — Synaptic Relay Pool (user-facing, API, billing, persistence) ║
 * ║                                                                            ║
 * ║  Cross-Bridge Systems:                                                     ║
 * ║    Spider-Silk Bridge — pressure-aware routing between pools               ║
 * ║    Ivy Tendril Rotation — brain batch inserts balance across both pools     ║
 * ║    Wormhole Tunnel — full-saturation failover to surviving pool            ║
 * ║    Beehive Distribution — engine-to-pool assignment by priority tier       ║
 * ║    Autonomous Scaling — dynamic pool sizing based on real-time load        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const CONN_STRING = process.env.DATABASE_URL;

const ALPHA_BASE_MAX = 18;
const BETA_BASE_MAX = 18;
const ALPHA_CEIL = 30;
const BETA_CEIL = 30;
const IDLE_TIMEOUT = 30000;
const CONNECT_TIMEOUT = 10000;
const STATEMENT_TIMEOUT = 15000;

export const poolAlpha = new Pool({
  connectionString: CONN_STRING,
  max: ALPHA_BASE_MAX,
  idleTimeoutMillis: IDLE_TIMEOUT,
  connectionTimeoutMillis: CONNECT_TIMEOUT,
  statement_timeout: STATEMENT_TIMEOUT,
  allowExitOnIdle: true,
  application_name: "omnimens_alpha_cortex",
});

export const poolBeta = new Pool({
  connectionString: CONN_STRING,
  max: BETA_BASE_MAX,
  idleTimeoutMillis: IDLE_TIMEOUT,
  connectionTimeoutMillis: CONNECT_TIMEOUT,
  statement_timeout: STATEMENT_TIMEOUT,
  allowExitOnIdle: true,
  application_name: "omnimens_beta_relay",
});

poolAlpha.on("error", (err) => {
  console.error("[DB ALPHA] Pool error:", err.message);
});
poolBeta.on("error", (err) => {
  console.error("[DB BETA] Pool error:", err.message);
});

export const dbAlpha = drizzle(poolAlpha, { schema });
export const dbBeta = drizzle(poolBeta, { schema });

export const pool = poolBeta;
export const db = dbBeta;

type PoolSide = "alpha" | "beta";

function _poolPressure(p: pg.Pool): number {
  const total = p.totalCount;
  const max = (p as any).options?.max ?? 18;
  const waiting = p.waitingCount;
  const idle = p.idleCount;
  const active = total - idle;
  const utilization = max > 0 ? active / max : 1;
  const queuePressure = waiting > 0 ? Math.min(waiting / 10, 1) : 0;
  return Math.min(utilization * 0.7 + queuePressure * 0.3, 1);
}

function _isPoolHealthy(p: pg.Pool): boolean {
  const waiting = p.waitingCount;
  const total = p.totalCount;
  const idle = p.idleCount;
  const max = (p as any).options?.max ?? 18;
  if (waiting > 8) return false;
  if (total >= max - 2 && idle === 0) return false;
  return true;
}

export function isPoolHealthy(): boolean {
  return _isPoolHealthy(poolAlpha) || _isPoolHealthy(poolBeta);
}

export function isAlphaHealthy(): boolean {
  return _isPoolHealthy(poolAlpha);
}

export function isBetaHealthy(): boolean {
  return _isPoolHealthy(poolBeta);
}

type EnginePriority = "critical" | "high" | "medium" | "low";

function _spiderSilkRoute(preferred: PoolSide, priority: EnginePriority): { pool: pg.Pool; db: ReturnType<typeof drizzle>; side: PoolSide } {
  const alphaP = _poolPressure(poolAlpha);
  const betaP = _poolPressure(poolBeta);
  const alphaOk = _isPoolHealthy(poolAlpha);
  const betaOk = _isPoolHealthy(poolBeta);

  if (priority === "critical") {
    if (preferred === "beta" && betaOk) return { pool: poolBeta, db: dbBeta, side: "beta" };
    if (preferred === "alpha" && alphaOk) return { pool: poolAlpha, db: dbAlpha, side: "alpha" };
    if (betaOk) return { pool: poolBeta, db: dbBeta, side: "beta" };
    if (alphaOk) return { pool: poolAlpha, db: dbAlpha, side: "alpha" };
    return alphaP <= betaP
      ? { pool: poolAlpha, db: dbAlpha, side: "alpha" }
      : { pool: poolBeta, db: dbBeta, side: "beta" };
  }

  if (priority === "high") {
    if (preferred === "beta" && betaP < 0.85) return { pool: poolBeta, db: dbBeta, side: "beta" };
    if (preferred === "alpha" && alphaP < 0.85) return { pool: poolAlpha, db: dbAlpha, side: "alpha" };
    return alphaP <= betaP
      ? { pool: poolAlpha, db: dbAlpha, side: "alpha" }
      : { pool: poolBeta, db: dbBeta, side: "beta" };
  }

  if (priority === "medium") {
    if (preferred === "alpha" && alphaP < 0.7) return { pool: poolAlpha, db: dbAlpha, side: "alpha" };
    if (preferred === "beta" && betaP < 0.7) return { pool: poolBeta, db: dbBeta, side: "beta" };
    if (alphaP < 0.7) return { pool: poolAlpha, db: dbAlpha, side: "alpha" };
    if (betaP < 0.7) return { pool: poolBeta, db: dbBeta, side: "beta" };
    return alphaP <= betaP
      ? { pool: poolAlpha, db: dbAlpha, side: "alpha" }
      : { pool: poolBeta, db: dbBeta, side: "beta" };
  }

  if (!alphaOk && !betaOk) return { pool: poolAlpha, db: dbAlpha, side: "alpha" };
  if (preferred === "alpha" && alphaP < 0.5) return { pool: poolAlpha, db: dbAlpha, side: "alpha" };
  if (preferred === "beta" && betaP < 0.5) return { pool: poolBeta, db: dbBeta, side: "beta" };
  return alphaP <= betaP
    ? { pool: poolAlpha, db: dbAlpha, side: "alpha" }
    : { pool: poolBeta, db: dbBeta, side: "beta" };
}

export function getDbForEngine(engineCategory: "neural" | "user"): ReturnType<typeof drizzle> {
  const preferred: PoolSide = engineCategory === "neural" ? "alpha" : "beta";
  return _spiderSilkRoute(preferred, engineCategory === "user" ? "high" : "medium").db;
}

export function getPoolForEngine(engineCategory: "neural" | "user"): pg.Pool {
  const preferred: PoolSide = engineCategory === "neural" ? "alpha" : "beta";
  return _spiderSilkRoute(preferred, engineCategory === "user" ? "high" : "medium").pool;
}

let _alphaActiveWrites = 0;
let _betaActiveWrites = 0;
const MAX_CONCURRENT_PER_POOL = 6;
const _writeQueueAlpha: Array<{ fn: () => Promise<void>; resolve: () => void; reject: (err: unknown) => void; priority: EnginePriority }> = [];
const _writeQueueBeta: Array<{ fn: () => Promise<void>; resolve: () => void; reject: (err: unknown) => void; priority: EnginePriority }> = [];

function _drainPoolQueue(side: PoolSide) {
  const queue = side === "alpha" ? _writeQueueAlpha : _writeQueueBeta;
  const activeRef = side === "alpha" ? () => _alphaActiveWrites : () => _betaActiveWrites;
  const incr = side === "alpha" ? () => { _alphaActiveWrites++; } : () => { _betaActiveWrites++; };
  const decr = side === "alpha" ? () => { _alphaActiveWrites--; } : () => { _betaActiveWrites--; };

  while (queue.length > 0 && activeRef() < MAX_CONCURRENT_PER_POOL) {
    queue.sort((a, b) => {
      const order: Record<EnginePriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    });
    const item = queue.shift()!;
    incr();
    item.fn()
      .then(() => item.resolve())
      .catch((err) => item.reject(err))
      .finally(() => {
        decr();
        _drainPoolQueue(side);
      });
  }
}

export async function safeDbWrite(
  fn: () => Promise<void>,
  priority: EnginePriority = "medium",
  preferredSide: PoolSide = "alpha"
): Promise<void> {
  const route = _spiderSilkRoute(preferredSide, priority);
  const side = route.side;
  const activeCount = side === "alpha" ? _alphaActiveWrites : _betaActiveWrites;
  const queue = side === "alpha" ? _writeQueueAlpha : _writeQueueBeta;

  if (priority === "low") {
    const p = _poolPressure(side === "alpha" ? poolAlpha : poolBeta);
    if (p > 0.8) return;
    if (queue.length > 15) return;
  }
  if (priority === "medium") {
    const p = _poolPressure(side === "alpha" ? poolAlpha : poolBeta);
    if (p > 0.9 && queue.length > 30) return;
  }

  if (activeCount < MAX_CONCURRENT_PER_POOL) {
    if (side === "alpha") _alphaActiveWrites++; else _betaActiveWrites++;
    try {
      await fn();
    } finally {
      if (side === "alpha") _alphaActiveWrites--; else _betaActiveWrites--;
      _drainPoolQueue(side);
    }
  } else {
    if (priority === "low" && queue.length > 20) return;
    if (priority === "medium" && queue.length > 40) return;
    return new Promise<void>((resolve, reject) => {
      queue.push({ fn, resolve, reject, priority });
    });
  }
}

let _scalingInterval: ReturnType<typeof setInterval> | null = null;
let _scalingStats = {
  alphaScaleUps: 0,
  betaScaleUps: 0,
  alphaScaleDowns: 0,
  betaScaleDowns: 0,
  crossBridgeEvents: 0,
  wormholeTunnelEvents: 0,
  lastScaleTick: Date.now(),
};

function _autonomousScaling() {
  const alphaP = _poolPressure(poolAlpha);
  const betaP = _poolPressure(poolBeta);
  const alphaMax = (poolAlpha as any).options?.max ?? ALPHA_BASE_MAX;
  const betaMax = (poolBeta as any).options?.max ?? BETA_BASE_MAX;

  if (alphaP > 0.85 && alphaMax < ALPHA_CEIL) {
    const newMax = Math.min(alphaMax + 4, ALPHA_CEIL);
    (poolAlpha as any).options.max = newMax;
    _scalingStats.alphaScaleUps++;
    console.log(`[DB SCALING] ⬆️ ALPHA cortex expanded: ${alphaMax} → ${newMax} (pressure: ${(alphaP * 100).toFixed(0)}%)`);
  } else if (alphaP < 0.3 && alphaMax > ALPHA_BASE_MAX) {
    const newMax = Math.max(alphaMax - 2, ALPHA_BASE_MAX);
    (poolAlpha as any).options.max = newMax;
    _scalingStats.alphaScaleDowns++;
  }

  if (betaP > 0.85 && betaMax < BETA_CEIL) {
    const newMax = Math.min(betaMax + 4, BETA_CEIL);
    (poolBeta as any).options.max = newMax;
    _scalingStats.betaScaleUps++;
    console.log(`[DB SCALING] ⬆️ BETA relay expanded: ${betaMax} → ${newMax} (pressure: ${(betaP * 100).toFixed(0)}%)`);
  } else if (betaP < 0.3 && betaMax > BETA_BASE_MAX) {
    const newMax = Math.max(betaMax - 2, BETA_BASE_MAX);
    (poolBeta as any).options.max = newMax;
    _scalingStats.betaScaleDowns++;
  }

  if (!_isPoolHealthy(poolAlpha) && _isPoolHealthy(poolBeta)) {
    _scalingStats.crossBridgeEvents++;
  } else if (!_isPoolHealthy(poolBeta) && _isPoolHealthy(poolAlpha)) {
    _scalingStats.crossBridgeEvents++;
  }

  if (!_isPoolHealthy(poolAlpha) && !_isPoolHealthy(poolBeta)) {
    _scalingStats.wormholeTunnelEvents++;
    if (_writeQueueAlpha.length > 30) {
      _writeQueueAlpha.splice(0, _writeQueueAlpha.length - 10);
    }
    if (_writeQueueBeta.length > 30) {
      _writeQueueBeta.splice(0, _writeQueueBeta.length - 10);
    }
  }

  _scalingStats.lastScaleTick = Date.now();
}

_scalingInterval = setInterval(_autonomousScaling, 5000);

export function getPoolStats() {
  const alphaMax = (poolAlpha as any).options?.max ?? ALPHA_BASE_MAX;
  const betaMax = (poolBeta as any).options?.max ?? BETA_BASE_MAX;
  return {
    alpha: {
      total: poolAlpha.totalCount,
      idle: poolAlpha.idleCount,
      waiting: poolAlpha.waitingCount,
      max: alphaMax,
      pressure: Math.round(_poolPressure(poolAlpha) * 100),
      healthy: _isPoolHealthy(poolAlpha),
      activeWrites: _alphaActiveWrites,
      queueLength: _writeQueueAlpha.length,
    },
    beta: {
      total: poolBeta.totalCount,
      idle: poolBeta.idleCount,
      waiting: poolBeta.waitingCount,
      max: betaMax,
      pressure: Math.round(_poolPressure(poolBeta) * 100),
      healthy: _isPoolHealthy(poolBeta),
      activeWrites: _betaActiveWrites,
      queueLength: _writeQueueBeta.length,
    },
    scaling: { ..._scalingStats },
    combined: {
      totalConnections: poolAlpha.totalCount + poolBeta.totalCount,
      totalMax: alphaMax + betaMax,
      totalWaiting: poolAlpha.waitingCount + poolBeta.waitingCount,
      totalIdle: poolAlpha.idleCount + poolBeta.idleCount,
      overallPressure: Math.round(
        ((_poolPressure(poolAlpha) + _poolPressure(poolBeta)) / 2) * 100
      ),
      bothHealthy: _isPoolHealthy(poolAlpha) && _isPoolHealthy(poolBeta),
    },
  };
}

export function getWriteQueueStats() {
  return {
    activeWrites: _alphaActiveWrites + _betaActiveWrites,
    queueLength: _writeQueueAlpha.length + _writeQueueBeta.length,
    maxConcurrent: MAX_CONCURRENT_PER_POOL * 2,
    alpha: { active: _alphaActiveWrites, queued: _writeQueueAlpha.length },
    beta: { active: _betaActiveWrites, queued: _writeQueueBeta.length },
  };
}

type BrainInsertRow = {
  category: string;
  title: string;
  content: string;
  confidence: number;
  sourceConversation: string;
  active: boolean;
};

const _brainInsertBuffer: BrainInsertRow[] = [];
let _brainFlushTimer: ReturnType<typeof setInterval> | null = null;
const BRAIN_FLUSH_INTERVAL_MS = 5000;
const BRAIN_BATCH_MAX = 30;
let _ivyTendrilRotation: PoolSide = "alpha";

async function _flushBrainInserts(): Promise<void> {
  if (_brainInsertBuffer.length === 0) return;

  const route = _spiderSilkRoute(_ivyTendrilRotation, "low");
  _ivyTendrilRotation = _ivyTendrilRotation === "alpha" ? "beta" : "alpha";

  if (!_isPoolHealthy(route.pool)) {
    const other = route.side === "alpha" ? poolBeta : poolAlpha;
    if (!_isPoolHealthy(other)) {
      if (_brainInsertBuffer.length > 200) {
        _brainInsertBuffer.splice(0, _brainInsertBuffer.length - 50);
      }
      return;
    }
  }

  const batch = _brainInsertBuffer.splice(0, BRAIN_BATCH_MAX);
  const targetDb = route.db;

  try {
    await targetDb.insert(schema.omnimensBrain).values(batch);
  } catch (err: any) {
    if (err?.cause?.message?.includes("timeout")) {
      if (_brainInsertBuffer.length > 100) {
        _brainInsertBuffer.splice(0, _brainInsertBuffer.length - 20);
      }
    }
  }
}

export function queueBrainInsert(row: BrainInsertRow): void {
  _brainInsertBuffer.push(row);
  if (!_brainFlushTimer) {
    _brainFlushTimer = setInterval(() => {
      _flushBrainInserts().catch(() => {});
    }, BRAIN_FLUSH_INTERVAL_MS);
  }
  if (_brainInsertBuffer.length >= BRAIN_BATCH_MAX * 2) {
    _flushBrainInserts().catch(() => {});
  }
}

export function getBrainQueueStats() {
  return {
    buffered: _brainInsertBuffer.length,
    flushInterval: BRAIN_FLUSH_INTERVAL_MS,
    batchMax: BRAIN_BATCH_MAX,
    nextFlushPool: _ivyTendrilRotation,
  };
}

console.log(`[DB DUAL-POOL] 🕸️ Spider-Silk Cross-Bridge ONLINE`);
console.log(`[DB DUAL-POOL] 🧠 ALPHA Cortex Pool: ${ALPHA_BASE_MAX} base → ${ALPHA_CEIL} ceiling`);
console.log(`[DB DUAL-POOL] ⚡ BETA Relay Pool: ${BETA_BASE_MAX} base → ${BETA_CEIL} ceiling`);
console.log(`[DB DUAL-POOL] 🌿 Ivy Tendril Rotation: brain inserts alternate between pools`);
console.log(`[DB DUAL-POOL] 🪱 Wormhole Tunnel: full-saturation failover active`);
console.log(`[DB DUAL-POOL] 🐝 Beehive Distribution: priority-based engine routing`);
console.log(`[DB DUAL-POOL] 📈 Autonomous Scaling: dynamic pool sizing every 5s`);

export * from "./schema";
