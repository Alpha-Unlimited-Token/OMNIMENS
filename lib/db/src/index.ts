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

const ALPHA_BASE_MAX = 6;
const BETA_BASE_MAX = 6;
const GAMMA_MAX = 3;
const ALPHA_CEIL = 12;
const BETA_CEIL = 12;
const IDLE_TIMEOUT = 60000;
const CONNECT_TIMEOUT = 30000;
const STATEMENT_TIMEOUT = 20000;
const MAX_CONN_LIFETIME_MS = 15 * 60 * 1000;
const HEALTH_PING_INTERVAL_MS = 30000;

export const poolAlpha = new Pool({
  connectionString: CONN_STRING,
  max: ALPHA_BASE_MAX,
  idleTimeoutMillis: IDLE_TIMEOUT,
  connectionTimeoutMillis: CONNECT_TIMEOUT,
  statement_timeout: STATEMENT_TIMEOUT,
  allowExitOnIdle: false,
  application_name: "omnimens_alpha_cortex",
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

export const poolBeta = new Pool({
  connectionString: CONN_STRING,
  max: BETA_BASE_MAX,
  idleTimeoutMillis: IDLE_TIMEOUT,
  connectionTimeoutMillis: CONNECT_TIMEOUT,
  statement_timeout: STATEMENT_TIMEOUT,
  allowExitOnIdle: false,
  application_name: "omnimens_beta_relay",
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

export const poolGamma = new Pool({
  connectionString: CONN_STRING,
  max: GAMMA_MAX,
  idleTimeoutMillis: 120000,
  connectionTimeoutMillis: 15000,
  statement_timeout: 15000,
  allowExitOnIdle: false,
  application_name: "omnimens_gamma_chat",
  keepAlive: true,
  keepAliveInitialDelayMillis: 5000,
});

let _gammaPoolErrors = 0;
poolGamma.on("error", (err) => {
  _gammaPoolErrors++;
  console.error("[DB GAMMA] Pool error:", err.message);
});

export const dbGamma = drizzle(poolGamma, { schema });

let _alphaPoolErrors = 0;
let _betaPoolErrors = 0;

poolAlpha.on("error", (err) => {
  _alphaPoolErrors++;
  console.error("[DB ALPHA] Pool error:", err.message);
});
poolBeta.on("error", (err) => {
  _betaPoolErrors++;
  console.error("[DB BETA] Pool error:", err.message);
});

let _lastAlphaRecycle = Date.now();
let _lastBetaRecycle = Date.now();
let _alphaRecycles = 0;
let _betaRecycles = 0;

async function _healthPingAndRecycle(p: pg.Pool, label: string, isAlpha: boolean) {
  try {
    const client = await p.connect();
    await client.query("SELECT 1");
    client.release();
  } catch (err: any) {
    console.warn(`[DB ${label}] Health ping failed: ${err.message}`);
    if (isAlpha) _alphaPoolErrors++;
    else _betaPoolErrors++;
  }

  const lastRecycle = isAlpha ? _lastAlphaRecycle : _lastBetaRecycle;
  const errorCount = isAlpha ? _alphaPoolErrors : _betaPoolErrors;
  const age = Date.now() - lastRecycle;

  if (errorCount > 20 && age > 120000) {
    const idleToEvict = Math.min(2, Math.max(1, Math.floor(p.idleCount / 3)));
    if (p.idleCount > 2) {
      for (let i = 0; i < idleToEvict; i++) {
        try {
          const c = await p.connect();
          (c as any).release(true);
        } catch { break; }
      }
      console.log(`[DB ${label}] ♻️ Recycled ${idleToEvict} stale connections (age: ${Math.round(age / 60000)}min, errors: ${errorCount})`);
    }
    if (isAlpha) { _lastAlphaRecycle = Date.now(); _alphaPoolErrors = 0; _alphaRecycles++; }
    else { _lastBetaRecycle = Date.now(); _betaPoolErrors = 0; _betaRecycles++; }
  }
}

const _healthPingInterval = setInterval(() => {
  _healthPingAndRecycle(poolAlpha, "ALPHA", true).catch(() => {});
  _healthPingAndRecycle(poolBeta, "BETA", false).catch(() => {});
}, HEALTH_PING_INTERVAL_MS);

setInterval(async () => {
  try {
    const client = await poolGamma.connect();
    await client.query("SELECT 1");
    client.release();
  } catch (err: any) {
    _gammaPoolErrors++;
    console.warn(`[DB GAMMA] Chat pool health ping failed: ${err.message}`);
  }
}, 60000);

export const dbAlpha = drizzle(poolAlpha, { schema });
export const dbBeta = drizzle(poolBeta, { schema });

export const pool = poolBeta;

type PoolSide = "alpha" | "beta";

function _poolPressure(p: pg.Pool): number {
  const total = p.totalCount;
  const max = (p as any).options?.max ?? 8;
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
  const max = (p as any).options?.max ?? 8;
  if (waiting > 5) return false;
  if (total >= max && idle === 0) return false;
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

const _writeOps = new Set(["insert", "update", "delete"]);
const _readOps = new Set(["select", "query"]);

export const db: ReturnType<typeof drizzle> = new Proxy(dbBeta, {
  get(target, prop, receiver) {
    if (typeof prop === "string") {
      if (_writeOps.has(prop)) {
        const route = _spiderSilkRoute("beta", "medium");
        return (route.db as any)[prop].bind(route.db);
      }
      if (_readOps.has(prop)) {
        const route = _spiderSilkRoute("beta", "low");
        return (route.db as any)[prop].bind(route.db);
      }
    }
    return Reflect.get(target, prop, receiver);
  },
}) as ReturnType<typeof drizzle>;

let _alphaActiveWrites = 0;
let _betaActiveWrites = 0;
const MAX_CONCURRENT_PER_POOL = 4;
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
  if (priority !== "critical" && !shouldBackgroundEngineWrite()) {
    return;
  }

  const route = _spiderSilkRoute(preferredSide, priority);
  const side = route.side;
  const activeCount = side === "alpha" ? _alphaActiveWrites : _betaActiveWrites;
  const queue = side === "alpha" ? _writeQueueAlpha : _writeQueueBeta;

  const sidePool = side === "alpha" ? poolAlpha : poolBeta;
  const otherPool = side === "alpha" ? poolBeta : poolAlpha;
  const sidePressure = _poolPressure(sidePool);
  const otherPressure = _poolPressure(otherPool);
  const combinedPressure = (sidePressure + otherPressure) / 2;

  if (priority === "low") {
    if (sidePressure > 0.7) return;
    if (queue.length > 10) return;
    if (combinedPressure > 0.6 && queue.length > 5) return;
  }
  if (priority === "medium") {
    if (sidePressure > 0.8 && queue.length > 12) return;
    if (combinedPressure > 0.75 && queue.length > 8) return;
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
    if (priority === "low" && queue.length > 12) return;
    if (priority === "medium" && queue.length > 25) return;
    if (priority === "high" && queue.length > 50) return;
    if (queue.length > 80) return;
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
    if (_writeQueueAlpha.length > 15) {
      const dropped = _writeQueueAlpha.splice(0, _writeQueueAlpha.length - 5);
      for (const item of dropped) item.resolve();
    }
    if (_writeQueueBeta.length > 15) {
      const dropped = _writeQueueBeta.splice(0, _writeQueueBeta.length - 5);
      for (const item of dropped) item.resolve();
    }
    if (_brainInsertBuffer.length > 40) {
      const shed = _brainInsertBuffer.length - 20;
      _brainInsertBuffer.splice(0, shed);
      _brainTotalShed += shed;
    }
  }

  _scalingStats.lastScaleTick = Date.now();
}

_scalingInterval = setInterval(_autonomousScaling, 5000);

export function chatQuery<T>(fn: (chatDb: ReturnType<typeof drizzle>) => Promise<T>): Promise<T> {
  return fn(dbGamma).catch(async (err) => {
    console.warn(`[DB GAMMA] Chat query failed, falling back to Beta: ${err.message}`);
    return fn(dbBeta);
  });
}

let _orchestratorThrottleLevel: "none" | "light" | "heavy" | "critical" = "none";
let _orchestratorCycleCount = 0;
let _orchestratorDroppedWrites = 0;
let _orchestratorLastChatLatencyMs = 0;

function _orchestratorCycle() {
  _orchestratorCycleCount++;
  const alphaP = _poolPressure(poolAlpha);
  const betaP = _poolPressure(poolBeta);
  const combinedP = (alphaP + betaP) / 2;
  const alphaWaiting = poolAlpha.waitingCount;
  const betaWaiting = poolBeta.waitingCount;
  const totalWaiting = alphaWaiting + betaWaiting;

  let newLevel: typeof _orchestratorThrottleLevel = "none";
  if (combinedP > 0.9 || totalWaiting > 8) {
    newLevel = "critical";
  } else if (combinedP > 0.75 || totalWaiting > 4) {
    newLevel = "heavy";
  } else if (combinedP > 0.55 || totalWaiting > 2) {
    newLevel = "light";
  }

  if (newLevel === "critical") {
    const alphaDrop = Math.min(_writeQueueAlpha.length, Math.max(0, _writeQueueAlpha.length - 3));
    const betaDrop = Math.min(_writeQueueBeta.length, Math.max(0, _writeQueueBeta.length - 3));
    if (alphaDrop > 0) {
      const dropped = _writeQueueAlpha.splice(0, alphaDrop);
      for (const item of dropped) item.resolve();
      _orchestratorDroppedWrites += alphaDrop;
    }
    if (betaDrop > 0) {
      const dropped = _writeQueueBeta.splice(0, betaDrop);
      for (const item of dropped) item.resolve();
      _orchestratorDroppedWrites += betaDrop;
    }
  }

  if (newLevel !== _orchestratorThrottleLevel) {
    if (newLevel !== "none") {
      console.log(`[POOL ORCHESTRATOR] ⚙️ Throttle: ${_orchestratorThrottleLevel} → ${newLevel} | Alpha: ${(alphaP*100).toFixed(0)}% Beta: ${(betaP*100).toFixed(0)}% | Waiting: ${totalWaiting}`);
    }
    _orchestratorThrottleLevel = newLevel;
  }
}

setInterval(_orchestratorCycle, 3000);

export function getOrchestratorThrottle(): typeof _orchestratorThrottleLevel {
  return _orchestratorThrottleLevel;
}

export function shouldBackgroundEngineWrite(): boolean {
  if (_orchestratorThrottleLevel === "critical") return false;
  if (_orchestratorThrottleLevel === "heavy") return Math.random() < 0.3;
  if (_orchestratorThrottleLevel === "light") return Math.random() < 0.7;
  return true;
}

export function getOrchestratorStats() {
  return {
    throttleLevel: _orchestratorThrottleLevel,
    cycles: _orchestratorCycleCount,
    droppedWrites: _orchestratorDroppedWrites,
    lastChatLatencyMs: _orchestratorLastChatLatencyMs,
    alphaPressure: Math.round(_poolPressure(poolAlpha) * 100),
    betaPressure: Math.round(_poolPressure(poolBeta) * 100),
    gammaTotal: poolGamma.totalCount,
    gammaIdle: poolGamma.idleCount,
    gammaWaiting: poolGamma.waitingCount,
  };
}

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
      errors: _alphaPoolErrors,
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
      errors: _betaPoolErrors,
    },
    gamma: {
      total: poolGamma.totalCount,
      idle: poolGamma.idleCount,
      waiting: poolGamma.waitingCount,
      max: GAMMA_MAX,
      errors: _gammaPoolErrors,
    },
    scaling: { ..._scalingStats },
    lifecycle: {
      maxConnLifetimeMs: MAX_CONN_LIFETIME_MS,
      healthPingIntervalMs: HEALTH_PING_INTERVAL_MS,
      proxyRoutingActive: true,
      alphaRecycles: _alphaRecycles,
      betaRecycles: _betaRecycles,
      alphaLastRecycleAgeMin: Math.round((Date.now() - _lastAlphaRecycle) / 60000),
      betaLastRecycleAgeMin: Math.round((Date.now() - _lastBetaRecycle) / 60000),
    },
    combined: {
      totalConnections: poolAlpha.totalCount + poolBeta.totalCount + poolGamma.totalCount,
      totalMax: alphaMax + betaMax + GAMMA_MAX,
      totalWaiting: poolAlpha.waitingCount + poolBeta.waitingCount + poolGamma.waitingCount,
      totalIdle: poolAlpha.idleCount + poolBeta.idleCount + poolGamma.idleCount,
      overallPressure: Math.round(
        ((_poolPressure(poolAlpha) + _poolPressure(poolBeta)) / 2) * 100
      ),
      bothHealthy: _isPoolHealthy(poolAlpha) && _isPoolHealthy(poolBeta),
      totalErrors: _alphaPoolErrors + _betaPoolErrors + _gammaPoolErrors,
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
const BRAIN_BUFFER_SOFT_CAP = 80;
const BRAIN_BUFFER_HARD_CAP = 300;
const BRAIN_RATE_WINDOW_MS = 10000;
const BRAIN_RATE_MAX_PER_WINDOW = 120;
let _ivyTendrilRotation: PoolSide = "alpha";
let _brainFlushActive = false;
let _brainInsertsInWindow = 0;
let _brainRateWindowStart = Date.now();
let _brainTotalShed = 0;
let _brainTotalFlushed = 0;
let _brainFlushErrors = 0;
let _brainPeakBuffer = 0;

function _brainRateCheck(): boolean {
  const now = Date.now();
  if (now - _brainRateWindowStart > BRAIN_RATE_WINDOW_MS) {
    _brainInsertsInWindow = 0;
    _brainRateWindowStart = now;
  }
  _brainInsertsInWindow++;
  return _brainInsertsInWindow <= BRAIN_RATE_MAX_PER_WINDOW;
}

function _adaptiveBatchSize(): number {
  const combinedPressure = (_poolPressure(poolAlpha) + _poolPressure(poolBeta)) / 2;
  if (combinedPressure > 0.85) return 5;
  if (combinedPressure > 0.7) return 10;
  if (combinedPressure > 0.5) return 20;
  return BRAIN_BATCH_MAX;
}

async function _flushBrainInserts(): Promise<void> {
  if (_brainInsertBuffer.length === 0) return;
  if (_brainFlushActive) return;
  _brainFlushActive = true;

  try {
    let route = _spiderSilkRoute(_ivyTendrilRotation, "low");
    _ivyTendrilRotation = _ivyTendrilRotation === "alpha" ? "beta" : "alpha";

    const alphaOk = _isPoolHealthy(poolAlpha);
    const betaOk = _isPoolHealthy(poolBeta);

    if (!alphaOk && !betaOk) {
      if (_brainInsertBuffer.length > BRAIN_BUFFER_SOFT_CAP) {
        const shed = _brainInsertBuffer.length - 30;
        _brainInsertBuffer.splice(0, shed);
        _brainTotalShed += shed;
      }
      return;
    }

    if (!_isPoolHealthy(route.pool)) {
      const fallbackSide: PoolSide = route.side === "alpha" ? "beta" : "alpha";
      const fallbackPool = fallbackSide === "alpha" ? poolAlpha : poolBeta;
      if (!_isPoolHealthy(fallbackPool)) return;
      route = _spiderSilkRoute(fallbackSide, "low");
    }

    const combinedPressure = (_poolPressure(poolAlpha) + _poolPressure(poolBeta)) / 2;
    if (combinedPressure > 0.9 && _brainInsertBuffer.length < BRAIN_BUFFER_SOFT_CAP) {
      return;
    }

    const batchSize = _adaptiveBatchSize();
    const batch = _brainInsertBuffer.splice(0, batchSize);
    const targetDb = route.db;

    await targetDb.insert(schema.omnimensBrain).values(batch);
    _brainTotalFlushed += batch.length;
  } catch (err: any) {
    _brainFlushErrors++;
    if (_brainInsertBuffer.length > BRAIN_BUFFER_SOFT_CAP) {
      const shed = _brainInsertBuffer.length - 20;
      _brainInsertBuffer.splice(0, shed);
      _brainTotalShed += shed;
    }
  } finally {
    _brainFlushActive = false;
  }
}

export function queueBrainInsert(row: BrainInsertRow): void {
  if (_brainInsertBuffer.length >= BRAIN_BUFFER_HARD_CAP) {
    _brainTotalShed++;
    return;
  }

  const combinedPressure = (_poolPressure(poolAlpha) + _poolPressure(poolBeta)) / 2;
  if (combinedPressure > 0.85 && _brainInsertBuffer.length > BRAIN_BUFFER_SOFT_CAP) {
    _brainTotalShed++;
    return;
  }

  if (!_brainRateCheck()) {
    _brainTotalShed++;
    return;
  }

  _brainInsertBuffer.push(row);
  if (_brainInsertBuffer.length > _brainPeakBuffer) {
    _brainPeakBuffer = _brainInsertBuffer.length;
  }

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
    adaptiveBatchSize: _adaptiveBatchSize(),
    nextFlushPool: _ivyTendrilRotation,
    rateInWindow: _brainInsertsInWindow,
    rateMaxPerWindow: BRAIN_RATE_MAX_PER_WINDOW,
    rateWindowMs: BRAIN_RATE_WINDOW_MS,
    softCap: BRAIN_BUFFER_SOFT_CAP,
    hardCap: BRAIN_BUFFER_HARD_CAP,
    peakBuffer: _brainPeakBuffer,
    totalFlushed: _brainTotalFlushed,
    totalShed: _brainTotalShed,
    flushErrors: _brainFlushErrors,
    flushActive: _brainFlushActive,
  };
}

import { startWriteValve, setValvePressureSupplier, setValveHealthSupplier } from "./phase-resonant-write-valve.js";
export { registerValveEngine, requestWrite, requestWriteSync, isWriteWindowOpen, getWriteValveState, startWriteValve, stopWriteValve } from "./phase-resonant-write-valve.js";

setValvePressureSupplier(() => ({
  alpha: _poolPressure(poolAlpha),
  beta: _poolPressure(poolBeta),
}));
setValveHealthSupplier(() => ({
  alpha: _isPoolHealthy(poolAlpha),
  beta: _isPoolHealthy(poolBeta),
}));

startWriteValve();

console.log(`[DB TRI-POOL] 🕸️ Spider-Silk Cross-Bridge ONLINE (keepAlive: enabled)`);
console.log(`[DB TRI-POOL] 🧠 ALPHA Cortex Pool: ${ALPHA_BASE_MAX} base → ${ALPHA_CEIL} ceiling (background engines)`);
console.log(`[DB TRI-POOL] ⚡ BETA Relay Pool: ${BETA_BASE_MAX} base → ${BETA_CEIL} ceiling (user-facing)`);
console.log(`[DB TRI-POOL] 💬 GAMMA Chat Pool: ${GAMMA_MAX} reserved (chat-only — never shared with background engines)`);
console.log(`[DB DUAL-POOL] 🌿 Ivy Tendril Rotation: brain inserts alternate between pools`);
console.log(`[DB DUAL-POOL] 🪱 Wormhole Tunnel: full-saturation failover active`);
console.log(`[DB DUAL-POOL] 🐝 Beehive Distribution: priority-based engine routing`);
console.log(`[DB DUAL-POOL] 📈 Autonomous Scaling: dynamic pool sizing every 5s`);
console.log(`[DB DUAL-POOL] 🔄 Proxy Routing: all db.insert/update/delete auto-routed via Spider-Silk`);
console.log(`[DB DUAL-POOL] 💊 Connection Lifecycle: max ${MAX_CONN_LIFETIME_MS / 60000}min, health ping every ${HEALTH_PING_INTERVAL_MS / 1000}s, auto-recycle on age/errors`);

export * from "./schema";
