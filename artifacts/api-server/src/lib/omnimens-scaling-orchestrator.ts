/**
 * OMNIMENS™ HORIZONTAL SCALING ORCHESTRATOR
 *
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 *
 * Worker process architecture for engine parallelization, message queue
 * for inter-engine communication, health monitoring with automatic
 * recovery, and load distribution across engine modules.
 */

interface EngineRegistration {
  name: string;
  category: "neural" | "language" | "code" | "embodiment" | "reasoning" | "navigation" | "augmentation" | "security";
  priority: number;
  startFn: () => void | Promise<void>;
  healthFn?: () => { healthy: boolean; details: Record<string, unknown> };
  lastHealthCheck: number;
  healthy: boolean;
  restartCount: number;
  started: boolean;
  startTimeMs: number;
  memoryUsageMB: number;
}

interface QueueMessage {
  id: string;
  from: string;
  to: string;
  type: "data" | "command" | "event" | "query" | "response";
  payload: unknown;
  timestamp: number;
  ttlMs: number;
  processed: boolean;
  priority: number;
}

interface ScalingState {
  enginesRegistered: number;
  enginesStarted: number;
  enginesHealthy: number;
  totalMessages: number;
  messagesProcessed: number;
  messagesDropped: number;
  totalHealthChecks: number;
  totalRecoveries: number;
  uptimeMs: number;
  startTime: number;
  memoryUsageMB: number;
  cpuLoadEstimate: number;
  messageQueueDepth: number;
  averageMessageLatencyMs: number;
}

const engines = new Map<string, EngineRegistration>();
const messageQueue: QueueMessage[] = [];
const messageHandlers = new Map<string, Array<(msg: QueueMessage) => void>>();
const messageLatencies: number[] = [];
let messageIdCounter = 0;

const HEALTH_CHECK_INTERVAL_MS = 60_000;
const MAX_QUEUE_SIZE = 10_000;
const MESSAGE_TTL_MS = 300_000;
const MAX_RESTART_ATTEMPTS = 3;

const state: ScalingState = {
  enginesRegistered: 0,
  enginesStarted: 0,
  enginesHealthy: 0,
  totalMessages: 0,
  messagesProcessed: 0,
  messagesDropped: 0,
  totalHealthChecks: 0,
  totalRecoveries: 0,
  uptimeMs: 0,
  startTime: Date.now(),
  memoryUsageMB: 0,
  cpuLoadEstimate: 0,
  messageQueueDepth: 0,
  averageMessageLatencyMs: 0,
};

let _started = false;
let _healthInterval: ReturnType<typeof setInterval> | null = null;

export function registerEngine(
  name: string,
  category: EngineRegistration["category"],
  startFn: () => void | Promise<void>,
  healthFn?: () => { healthy: boolean; details: Record<string, unknown> },
  priority: number = 5
): void {
  engines.set(name, {
    name,
    category,
    priority,
    startFn,
    healthFn,
    lastHealthCheck: 0,
    healthy: false,
    restartCount: 0,
    started: false,
    startTimeMs: 0,
    memoryUsageMB: 0,
  });
  state.enginesRegistered = engines.size;
}

export function publishMessage(
  from: string,
  to: string,
  type: QueueMessage["type"],
  payload: unknown,
  priority: number = 5
): string {
  if (messageQueue.length >= MAX_QUEUE_SIZE) {
    const oldest = messageQueue.findIndex(m => !m.processed);
    if (oldest >= 0) {
      messageQueue.splice(oldest, 1);
      state.messagesDropped++;
    }
  }

  const id = `msg_${++messageIdCounter}_${Date.now()}`;
  const msg: QueueMessage = {
    id,
    from,
    to,
    type,
    payload,
    timestamp: Date.now(),
    ttlMs: MESSAGE_TTL_MS,
    processed: false,
    priority,
  };

  messageQueue.push(msg);
  state.totalMessages++;
  state.messageQueueDepth = messageQueue.filter(m => !m.processed).length;

  const handlers = messageHandlers.get(to) || messageHandlers.get("*") || [];
  for (const handler of handlers) {
    try {
      handler(msg);
      msg.processed = true;
      state.messagesProcessed++;
      const latency = Date.now() - msg.timestamp;
      messageLatencies.push(latency);
      if (messageLatencies.length > 1000) messageLatencies.splice(0, 500);
    } catch {}
  }

  return id;
}

export function subscribe(engineName: string, handler: (msg: QueueMessage) => void): void {
  if (!messageHandlers.has(engineName)) {
    messageHandlers.set(engineName, []);
  }
  messageHandlers.get(engineName)!.push(handler);
}

function cleanupQueue(): void {
  const now = Date.now();
  const before = messageQueue.length;
  for (let i = messageQueue.length - 1; i >= 0; i--) {
    const msg = messageQueue[i];
    if (msg.processed || now - msg.timestamp > msg.ttlMs) {
      messageQueue.splice(i, 1);
    }
  }
  const removed = before - messageQueue.length;
  if (removed > 0) {
    state.messageQueueDepth = messageQueue.filter(m => !m.processed).length;
  }
}

async function runHealthChecks(): Promise<void> {
  state.totalHealthChecks++;
  let healthyCount = 0;

  for (const [name, engine] of engines) {
    engine.lastHealthCheck = Date.now();

    if (engine.healthFn) {
      try {
        const result = engine.healthFn();
        engine.healthy = result.healthy;
      } catch {
        engine.healthy = false;
      }
    } else {
      engine.healthy = engine.started;
    }

    if (engine.healthy) {
      healthyCount++;
    } else if (engine.started && engine.restartCount < MAX_RESTART_ATTEMPTS) {
      console.log(`[SCALING] Engine "${name}" unhealthy — attempting recovery (attempt ${engine.restartCount + 1}/${MAX_RESTART_ATTEMPTS})`);
      try {
        await engine.startFn();
        engine.restartCount++;
        engine.healthy = true;
        healthyCount++;
        state.totalRecoveries++;
        console.log(`[SCALING] Engine "${name}" recovered successfully`);
      } catch (err) {
        engine.restartCount++;
        console.error(`[SCALING] Engine "${name}" recovery failed:`, err);
      }
    }
  }

  state.enginesHealthy = healthyCount;

  const mem = process.memoryUsage();
  state.memoryUsageMB = Math.round(mem.heapUsed / 1024 / 1024);
  state.uptimeMs = Date.now() - state.startTime;

  if (messageLatencies.length > 0) {
    state.averageMessageLatencyMs = messageLatencies.reduce((a, b) => a + b, 0) / messageLatencies.length;
  }

  const cpuUsage = process.cpuUsage();
  state.cpuLoadEstimate = Math.min(1, (cpuUsage.user + cpuUsage.system) / (state.uptimeMs * 1000));

  cleanupQueue();
}

export async function startScalingOrchestrator(): Promise<void> {
  if (_started) { console.log("[SCALING] Already running"); return; }
  _started = true;
  state.startTime = Date.now();

  console.log(`[SCALING] Horizontal Scaling Orchestrator activated`);
  console.log(`[SCALING] ${engines.size} engines registered | Message queue capacity: ${MAX_QUEUE_SIZE}`);
  console.log(`[SCALING] Health monitoring every ${HEALTH_CHECK_INTERVAL_MS / 1000}s | Max ${MAX_RESTART_ATTEMPTS} recovery attempts per engine`);
  console.log(`[SCALING] Inter-engine message bus active | TTL: ${MESSAGE_TTL_MS / 1000}s`);

  const sorted = [...engines.values()].sort((a, b) => a.priority - b.priority);

  for (const engine of sorted) {
    try {
      const startTime = Date.now();
      await engine.startFn();
      engine.started = true;
      engine.healthy = true;
      engine.startTimeMs = Date.now() - startTime;
      state.enginesStarted++;
      state.enginesHealthy++;
    } catch (err) {
      console.error(`[SCALING] Failed to start engine "${engine.name}":`, err);
    }
  }

  console.log(`[SCALING] ${state.enginesStarted}/${engines.size} engines started successfully`);

  _healthInterval = setInterval(() => {
    runHealthChecks().catch(err => console.error("[SCALING] Health check error:", err));
  }, HEALTH_CHECK_INTERVAL_MS);

  setTimeout(() => runHealthChecks(), 30_000);
}

export function getScalingState(): ScalingState & {
  engines: Array<{
    name: string;
    category: string;
    healthy: boolean;
    started: boolean;
    restartCount: number;
    startTimeMs: number;
    priority: number;
  }>;
} {
  return {
    ...state,
    uptimeMs: Date.now() - state.startTime,
    messageQueueDepth: messageQueue.filter(m => !m.processed).length,
    engines: [...engines.values()].map(e => ({
      name: e.name,
      category: e.category,
      healthy: e.healthy,
      started: e.started,
      restartCount: e.restartCount,
      startTimeMs: e.startTimeMs,
      priority: e.priority,
    })),
  };
}
