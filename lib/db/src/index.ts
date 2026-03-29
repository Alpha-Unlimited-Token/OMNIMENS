import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 40,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 15000,
  allowExitOnIdle: true,
});

pool.on("error", (err) => {
  console.error("[DB POOL] Unexpected pool error:", err.message);
});

export const db = drizzle(pool, { schema });

export function isPoolHealthy(): boolean {
  const waiting = pool.waitingCount;
  const total = pool.totalCount;
  const idle = pool.idleCount;
  if (waiting > 10) return false;
  if (total >= 36 && idle === 0) return false;
  return true;
}

export function getPoolStats() {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    healthy: isPoolHealthy(),
  };
}

let _activeWrites = 0;
const MAX_CONCURRENT_WRITES = 8;
const _writeQueue: Array<{ fn: () => Promise<void>; resolve: () => void; reject: (err: unknown) => void }> = [];

function _drainQueue() {
  while (_writeQueue.length > 0 && _activeWrites < MAX_CONCURRENT_WRITES) {
    const item = _writeQueue.shift()!;
    _activeWrites++;
    item.fn()
      .then(() => item.resolve())
      .catch((err) => item.reject(err))
      .finally(() => {
        _activeWrites--;
        _drainQueue();
      });
  }
}

export async function safeDbWrite(fn: () => Promise<void>, priority: "critical" | "normal" | "low" = "normal"): Promise<void> {
  if (priority === "low" && !isPoolHealthy()) {
    return;
  }
  if (priority === "normal" && pool.waitingCount > 15) {
    return;
  }
  if (_activeWrites < MAX_CONCURRENT_WRITES) {
    _activeWrites++;
    try {
      await fn();
    } finally {
      _activeWrites--;
      _drainQueue();
    }
  } else {
    if (priority === "low" && _writeQueue.length > 20) {
      return;
    }
    if (priority === "normal" && _writeQueue.length > 50) {
      return;
    }
    return new Promise<void>((resolve, reject) => {
      _writeQueue.push({ fn, resolve, reject });
    });
  }
}

export function getWriteQueueStats() {
  return {
    activeWrites: _activeWrites,
    queueLength: _writeQueue.length,
    maxConcurrent: MAX_CONCURRENT_WRITES,
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

async function _flushBrainInserts(): Promise<void> {
  if (_brainInsertBuffer.length === 0) return;
  if (!isPoolHealthy()) {
    if (_brainInsertBuffer.length > 200) {
      _brainInsertBuffer.splice(0, _brainInsertBuffer.length - 50);
    }
    return;
  }

  const batch = _brainInsertBuffer.splice(0, BRAIN_BATCH_MAX);
  try {
    await db.insert(schema.omnimensBrain).values(batch);
  } catch (err: any) {
    if (err?.cause?.message?.includes("timeout")) {
      _brainInsertBuffer.splice(0, _brainInsertBuffer.length - 20);
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
  };
}

export * from "./schema";
