/**
 * omnimens-unified-runtime.ts
 *
 * Alpha Unlimited Technologies, LLC — All Rights Reserved.
 * Unified Runtime Core v2.0
 *
 * One import → 127 engines. Zero contention. Hyper-intelligent.
 */

import { EventEmitter } from 'events';
import { setTimeout as setTimeoutPromise } from 'timers/promises';

/* ================================================================
 * Shared Helpers + Types
 * ================================================================*/
const LOG_PREFIX = '[UNIFIED-RUNTIME]';

function log(message: string, ...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.log(`${LOG_PREFIX} ${message}`, ...args);
}

function clamp(min: number, n: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function now(): number {
  return Date.now();
}

function jitter(ms: number) {
  return ms + Math.floor(Math.random() * 1000);
}

export enum Priority {
  CRITICAL = 1,
  HIGH = 2,
  NORMAL = 3,
  LOW = 4,
}

/* ================================================================
 * 1. SPIKE EVENT BUS
 * ================================================================*/

interface Spike<T = any> {
  time: number;
  channel: string;
  data: T;
  priority: Priority;
}

class MinHeap<T extends Spike> {
  private heap: T[] = [];

  get size() {
    return this.heap.length;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  push(item: T) {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const end = this.heap.pop()!;
    if (this.heap.length) {
      this.heap[0] = end;
      this.bubbleDown(0);
    }
    return top;
  }

  private bubbleUp(idx: number) {
    const item = this.heap[idx];
    while (idx > 0) {
      const parentIdx = (idx - 1) >> 1;
      const parent = this.heap[parentIdx];
      if (item.time < parent.time) {
        this.heap[idx] = parent;
        idx = parentIdx;
      } else break;
    }
    this.heap[idx] = item;
  }

  private bubbleDown(idx: number) {
    const length = this.heap.length;
    const item = this.heap[idx];
    while (true) {
      const left = (idx << 1) + 1;
      const right = left + 1;
      let smallest = idx;

      if (left < length && this.heap[left].time < this.heap[smallest].time) {
        smallest = left;
      }
      if (right < length && this.heap[right].time < this.heap[smallest].time) {
        smallest = right;
      }
      if (smallest !== idx) {
        this.heap[idx] = this.heap[smallest];
        idx = smallest;
      } else break;
    }
    this.heap[idx] = item;
  }
}

class SpikeBus {
  private emitter = new EventEmitter();
  private queue = new MinHeap<Spike>();
  private currentTimer: NodeJS.Timeout | null = null;

  emit<T>(channel: string, data?: T, priority: Priority = Priority.NORMAL) {
    this.emitter.emit(channel, data);
    // cognition hooks
    CognitionBus.handleSpike(channel);
  }

  on<T = any>(
    channel: string,
    handler: (data: T) => void
  ): () => void {
    this.emitter.on(channel, handler);
    return () => this.emitter.off(channel, handler);
  }

  scheduleSpike<T>(
    channel: string,
    data: T,
    delayMs: number,
    priority: Priority = Priority.NORMAL
  ) {
    if (!Number.isFinite(delayMs) || delayMs < 0) delayMs = 0;
    const spike: Spike = {
      time: now() + delayMs,
      channel,
      data,
      priority,
    };
    // back-pressure handling
    if (this.queue.size >= 10000) {
      // remove low priority oldest spikes
      const removed: Spike[] = [];
      while (this.queue.size >= 10000) {
        const s = this.queue.pop();
        if (s && s.priority === Priority.LOW) {
          removed.push(s);
        } else if (s) {
          // push back higher priority spikes
          this.queue.push(s);
          break;
        }
      }
      if (removed.length) {
        log(`Backpressure: dropped ${removed.length} low-priority spikes`);
      }
    }

    this.queue.push(spike);
    this.scheduleNextTimer();
  }

  private scheduleNextTimer() {
    if (this.currentTimer) return; // already scheduled
    const nextSpike = this.queue.peek();
    if (!nextSpike) return;

    const delay = Math.max(0, nextSpike.time - now());
    this.currentTimer = setTimeout(() => {
      this.currentTimer = null;
      this.flushDueSpikes();
      this.scheduleNextTimer();
    }, delay).unref();
  }

  private flushDueSpikes() {
    let spike = this.queue.peek();
    while (spike && spike.time <= now()) {
      spike = this.queue.pop()!;
      this.emit(spike.channel, spike.data, spike.priority);
      spike = this.queue.peek();
    }
  }
}

export const GlobalSpikeBus = new SpikeBus();

/* ================================================================
 * 2. DB POOL GATEWAY (Mock Internal Implementation)
 * ================================================================*/

type DBOpPriority = Priority;

interface DBOperation {
  sql: string;
  params?: any[];
  priority: DBOpPriority;
  resolve?: (v: any) => void;
  reject?: (e: any) => void;
  engine: string;
}

interface PoolStats {
  totalConnections: number;
  activeConnections: number;
  pressure: number;
  healthy: boolean;
}

class LRUCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private max: number, private ttl: number) {}

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (entry && (entry as any).__expires > Date.now()) {
      // move to end
      this.cache.delete(key);
      this.cache.set(key, entry);
      return (entry as any).value;
    }
    this.cache.delete(key);
    return undefined;
  }

  set(key: K, value: V) {
    const expires = Date.now() + this.ttl;
    this.cache.set(key, { value, __expires: expires } as any);
    if (this.cache.size > this.max) {
      // delete oldest
      const first = this.cache.keys().next().value;
      this.cache.delete(first);
    }
  }

  delete(key: K) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

class DbGateway {
  // Pools stub
  private poolAlpha = { active: 0, max: 10 };
  private poolBeta = { active: 0, max: 10 };
  private poolGamma = { active: 0, max: 5 };

  private writeQueue: DBOperation[] = [];
  private lastFlush = now();

  private readCache = new LRUCache<string, any>(500, 30_000);
  private perEngineCounts = new Map<string, { count: number; ts: number; limit: number }>();

  constructor() {
    // schedule periodic flush
    GlobalSpikeBus.on('db:flush', () => this.flushWrites());
  }

  private canProceed(priority: DBOpPriority): boolean {
    const pressure = this.getPoolPressure();
    if (pressure > 0.95) return priority === Priority.CRITICAL;
    if (pressure > 0.8) return priority <= Priority.HIGH;
    return true;
  }

  private countOp(engine: string): boolean {
    const nowTs = Math.floor(Date.now() / 60_000); // minute bucket
    let entry = this.perEngineCounts.get(engine);
    if (!entry || entry.ts !== nowTs) {
      entry = { count: 0, ts: nowTs, limit: EngineRegistry.getQuota(engine) };
      this.perEngineCounts.set(engine, entry);
    }
    if (entry.count >= entry.limit) {
      GlobalSpikeBus.emit(`db:quota-exceeded:${engine}`, { ts: now(), count: entry.count });
      return false;
    }
    entry.count++;
    return true;
  }

  async read<T>(engine: string, key: string, sqlFn: () => Promise<T>, priority: DBOpPriority = Priority.NORMAL): Promise<T> {
    if (!this.canProceed(priority)) {
      return Promise.reject(new Error('DB pool pressure too high'));
    }
    if (!this.countOp(engine)) {
      return Promise.reject(new Error('DB quota exceeded'));
    }

    const cached = this.readCache.get(key);
    if (cached !== undefined) return cached as T;

    const data = await sqlFn();
    this.readCache.set(key, data);
    return data;
  }

  async write(engine: string, operation: DBOperation): Promise<any> {
    if (operation.priority === Priority.CRITICAL || operation.priority === Priority.HIGH) {
      // immediate execute
      return this.executeWrite(operation);
    }

    return new Promise((resolve, reject) => {
      if (!this.countOp(engine)) return reject(new Error('DB quota exceeded'));

      this.writeQueue.push({ ...operation, resolve, reject });
      if (this.writeQueue.length >= 50) this.scheduleFlush(0);
      else this.scheduleFlush(5_000); // ensure flush within 5s
    });
  }

  private flushTimer: NodeJS.Timeout | null = null;

  private scheduleFlush(delay: number) {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      GlobalSpikeBus.emit('db:flush');
    }, delay).unref();
  }

  private async flushWrites() {
    if (!this.writeQueue.length) return;
    if (!this.canProceed(Priority.NORMAL)) {
      // reschedule
      this.scheduleFlush(1_000);
      return;
    }

    const batch = this.writeQueue.splice(0, 50);
    log(`Flushing ${batch.length} DB writes`);
    // Simulate DB write
    for (const op of batch) {
      try {
        // await dbExecute(op.sql, op.params)
        op.resolve?.(true);
        // Invalidate caches via spike
        GlobalSpikeBus.emit(`db:invalidate:${op.sql.split(' ')[2]}`);
      } catch (err) {
        op.reject?.(err);
      }
    }
    this.lastFlush = now();
  }

  isPoolHealthy(): boolean {
    return (
      this.poolAlpha.active <= this.poolAlpha.max &&
      this.poolBeta.active <= this.poolBeta.max &&
      this.poolGamma.active <= this.poolGamma.max
    );
  }

  getPoolPressure(): number {
    const totalActive =
      this.poolAlpha.active + this.poolBeta.active + this.poolGamma.active;
    const max = this.poolAlpha.max + this.poolBeta.max + this.poolGamma.max;
    return totalActive / max;
  }

  getActiveConnections(): number {
    return (
      this.poolAlpha.active + this.poolBeta.active + this.poolGamma.active
    );
  }
}

export const UnifiedDb = new DbGateway();

/* ================================================================
 * 3. API CALL MANAGER
 * ================================================================*/

interface ProviderState {
  tokens: number;
  capacity: number;
  refillRate: number; // tokens per minute
  lastRefill: number;
  failures: number;
  circuitOpenUntil: number; // timestamp
  cache: LRUCache<string, any>;
  queue: Array<() => void>;
}

class ApiManager {
  private providers = new Map<string, ProviderState>();

  configureProvider(
    name: string,
    capacity: number,
    tokensPerMinute: number
  ) {
    const existing = this.providers.get(name);
    if (existing) {
      existing.capacity = capacity;
      existing.refillRate = tokensPerMinute;
      return;
    }
    this.providers.set(name, {
      tokens: capacity,
      capacity,
      refillRate: tokensPerMinute,
      lastRefill: Date.now(),
      failures: 0,
      circuitOpenUntil: 0,
      cache: new LRUCache<string, any>(1000, 5 * 60_000),
      queue: [],
    });
  }

  async call<T>(
    provider: string,
    key: string,
    fn: () => Promise<T>,
    isChat = false
  ): Promise<T> {
    const p = this.providers.get(provider);
    if (!p) throw new Error(`Provider ${provider} not configured`);

    const cached = p.cache.get(key);
    if (cached !== undefined) return cached as T;

    await this.acquireToken(p, provider);

    if (Date.now() < p.circuitOpenUntil) {
      throw new Error(`Circuit open for provider ${provider}`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), isChat ? 120_000 : 30_000).unref();

    const attempt = async (retry: number): Promise<T> => {
      try {
        const result = await fn();
        clearTimeout(timeout);
        p.failures = 0;
        p.cache.set(key, result);
        return result;
      } catch (e) {
        clearTimeout(timeout);
        p.failures += 1;
        if (p.failures >= 3) {
          p.circuitOpenUntil = Date.now() + 60_000;
          log(`Circuit opened for ${provider}`);
          throw e;
        }
        if (retry >= 3) throw e;
        await setTimeoutPromise(jitter([2000, 5000, 15000][retry]));
        return attempt(retry + 1);
      }
    };

    return attempt(0);
  }

  private async acquireToken(p: ProviderState, provider: string) {
    this.refillTokens(p);
    if (p.tokens > 0) {
      p.tokens--;
      return;
    }
    return new Promise<void>((resolve) => {
      p.queue.push(resolve);
    });
  }

  private refillTokens(p: ProviderState) {
    const nowTs = Date.now();
    const minutesPassed = (nowTs - p.lastRefill) / 60_000;
    if (minutesPassed >= 1) {
      const refill = Math.floor(minutesPassed * p.refillRate);
      p.tokens = clamp(
        0,
        p.tokens + refill,
        p.capacity
      );
      p.lastRefill = nowTs;
      // Drain queue
      while (p.tokens > 0 && p.queue.length) {
        p.tokens--;
        const fn = p.queue.shift();
        fn?.();
      }
    }
  }
}

export const UnifiedApiManager = new ApiManager();

/* ================================================================
 * 4. ENGINE REGISTRY
 * ================================================================*/
interface EngineInfo {
  name: string;
  priority: Priority;
  config: any;
  registeredAt: number;
  lastActivity: number;
  spikeCount: number;
  dbOps: number;
}

class EngineRegistryClass {
  private engines = new Map<string, EngineInfo>();

  registerEngine(name: string, priority: Priority, config: any = {}) {
    const info: EngineInfo = {
      name,
      priority,
      config,
      registeredAt: now(),
      lastActivity: now(),
      spikeCount: 0,
      dbOps: 0,
    };
    this.engines.set(name, info);
    log(`Engine registered: ${name}, priority=${Priority[priority]}`);
    // default quota
    const quota = priority <= Priority.HIGH ? 50 : 10;
    this.setQuota(name, quota);
  }

  unregisterEngine(name: string) {
    this.engines.delete(name);
  }

  touchSpike(name: string) {
    const info = this.engines.get(name);
    if (info) {
      info.spikeCount++;
      info.lastActivity = now();
    }
  }

  addDbOp(name: string) {
    const info = this.engines.get(name);
    if (info) info.dbOps++;
  }

  getEngineStatus(name: string): EngineInfo | undefined {
    return this.engines.get(name);
  }

  getAllEngines(): EngineInfo[] {
    return Array.from(this.engines.values());
  }

  idleSweep() {
    const cutoff = now() - 60_000;
    for (const info of this.engines.values()) {
      if (info.lastActivity < cutoff) {
        info.spikeCount = 0;
      }
    }
  }

  /* ---------- quotas ---------- */
  private quotas = new Map<string, number>();
  setQuota(engine: string, opsPerMin: number) {
    this.quotas.set(engine, opsPerMin);
  }
  getQuota(engine: string): number {
    return this.quotas.get(engine) ?? 10;
  }
}

export const EngineRegistry = new EngineRegistryClass();

/* ================================================================
 * 5. COGNITIVE ENHANCEMENT BUS
 * ================================================================*/
interface SpikeRecord {
  channel: string;
  ts: number;
}

class CognitionBusClass {
  private lastSpikeTime = new Map<string, number>();
  private recentSpikes: SpikeRecord[] = [];
  private insights: EventEmitter = new EventEmitter();
  private sequenceCounts = new Map<string, number>();

  onInsight(
    handler: (engine: string, data: any) => void
  ): () => void {
    const cb = (payload: { engine: string; data: any }) => {
      handler(payload.engine, payload.data);
    };
    this.insights.on('insight', cb);
    return () => this.insights.off('insight', cb);
  }

  emitInsight(engine: string, data: any) {
    this.insights.emit('insight', { engine, data });
    GlobalSpikeBus.emit(`cognition:insight:${engine}`, data, Priority.HIGH);
  }

  handleSpike(channel: string) {
    const ts = now();
    this.recentSpikes.push({ channel, ts });
    if (this.recentSpikes.length > 1000) this.recentSpikes.shift();

    // Hebbian cross-wiring detection
    for (let i = this.recentSpikes.length - 2; i >= 0; i--) {
      const prev = this.recentSpikes[i];
      if (ts - prev.ts > 50) break;
      const key = `${prev.channel}->${channel}`;
      const c = (this.sequenceCounts.get(key) || 0) + 1;
      this.sequenceCounts.set(key, c);
      if (c === 10) {
        // create fast-path
        GlobalSpikeBus.on(prev.channel, (data) => {
          GlobalSpikeBus.emit(channel, data, Priority.HIGH);
        });
        log(`Hebbian fast-path created between ${prev.channel} and ${channel}`);
      }
    }

    // Attention mechanism: track user-facing activity
    if (channel.startsWith('user:')) {
      GlobalSpikeBus.emit('attention', { channel, ts }, Priority.CRITICAL);
    }

    // Curiosity signal
    if (this.recentSpikes.length >= 500) {
      // crude novelty check
      const uniq = new Set(this.recentSpikes.map((s) => s.channel));
      if (uniq.size / this.recentSpikes.length < 0.2) {
        GlobalSpikeBus.emit('cognition:curiosity', {}, Priority.HIGH);
      }
    }
  }
}

export const CognitionBus = new CognitionBusClass();

/* ================================================================
 * 6. UNIFIED SHUTDOWN
 * ================================================================*/

let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  log('Initiating unified shutdown…');

  // Flush DB writes
  await UnifiedDb['flushWrites']?.();

  // Drain spike queue
  await new Promise<void>((resolve) => {
    function check() {
      if (GlobalSpikeBus['queue'].size === 0) return resolve();
      setTimeout(check, 50).unref();
    }
    check();
  });

  EngineRegistry.getAllEngines().forEach((e) => {
    EngineRegistry.unregisterEngine(e.name);
  });

  log('Shutdown complete');
}

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);

/* ================================================================
 * Exports
 * ================================================================*/

export {
  GlobalSpikeBus as SpikeBus,
  UnifiedDb as DbGateway,
  UnifiedApiManager as ApiManager,
  shutdown,
};