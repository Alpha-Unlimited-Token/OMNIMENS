/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 *
 * OMNIMENS™ HORIZONTAL SCALING ORCHESTRATOR — v2.0
 * Event-driven spike architecture w/ unified runtime + cognitive mesh
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/*────────────────────────  CONSTANTS  ────────────────────────*/
const PREFIX = "[OMNIMENS-SCALING-ORCHESTRATOR]";
const HEALTH_MS = 60_000;
const INIT_HEALTH_DELAY_MS = 30_000;
const MAX_QUEUE = 10_000;
const TTL_MS = 300_000;
const MAX_RESTARTS = 3;

/*────────────────────────  TYPES  ────────────────────────────*/
interface EngineReg {
  name: string;
  category:
    | "neural"
    | "language"
    | "code"
    | "embodiment"
    | "reasoning"
    | "navigation"
    | "augmentation"
    | "security";
  priority: number;
  startFn: () => void | Promise<void>;
  healthFn?: () => { healthy: boolean; details: Record<string, unknown> };
  lastHealth: number;
  healthy: boolean;
  restart: number;
  started: boolean;
  startTimeMs: number;
  memoryMB: number;
}
interface QueueMsg {
  id: string;
  from: string;
  to: string;
  type: "data" | "command" | "event" | "query" | "response";
  payload: unknown;
  ts: number;
  ttl: number;
  done: boolean;
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

/*────────────────────────  GLOBALS  ──────────────────────────*/
const engines = new Map<string, EngineReg>();
const handlers = new Map<string, Array<(m: QueueMsg) => void>>();
const queue: QueueMsg[] = [];
const latencies: number[] = [];
let msgId = 0;
let started = false;

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

/*────────────────────────  RUNTIME REG  ──────────────────────*/
engineRegistry.registerEngine("scaling-orchestrator", "NORMAL", { dbQuota: 10 });

/*────────────────────────  UTILITIES  ────────────────────────*/
const log = (...a: unknown[]) => console.log(PREFIX, ...a);

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

/*────────────────────────  API  ──────────────────────────────*/
export function registerEngine(
  name: string,
  category: EngineReg["category"],
  startFn: () => void | Promise<void>,
  healthFn?: () => { healthy: boolean; details: Record<string, unknown> },
  priority = 5,
): void {
  engines.set(name, {
    name,
    category,
    priority,
    startFn,
    healthFn,
    lastHealth: 0,
    healthy: false,
    restart: 0,
    started: false,
    startTimeMs: 0,
    memoryMB: 0,
  });
  state.enginesRegistered = engines.size;
}

export function publishMessage(
  from: string,
  to: string,
  type: QueueMsg["type"],
  payload: unknown,
  priority = 5,
): string {
  if (queue.length >= MAX_QUEUE) {
    const idx = queue.findIndex((m) => !m.done);
    if (idx >= 0) {
      queue.splice(idx, 1);
      state.messagesDropped++;
    }
  }
  const id = `msg_${++msgId}_${Date.now()}`;
  const msg: QueueMsg = {
    id,
    from,
    to,
    type,
    payload,
    ts: Date.now(),
    ttl: TTL_MS,
    done: false,
    priority,
  };
  queue.push(msg);
  state.totalMessages++;
  state.messageQueueDepth = queue.filter((m) => !m.done).length;

  (handlers.get(to) || handlers.get("*") || []).forEach((h) => {
    try {
      h(msg);
      msg.done = true;
      state.messagesProcessed++;
      latencies.push(Date.now() - msg.ts);
      if (latencies.length > 1_000) latencies.splice(0, 500);
    } catch {}
  });

  return id;
}

export function subscribe(engine: string, h: (m: QueueMsg) => void): void {
  if (!handlers.has(engine)) handlers.set(engine, []);
  handlers.get(engine)!.push(h);
}

export async function startScalingOrchestrator(): Promise<void> {
  if (started) return log("Already running");
  started = true;
  state.startTime = Date.now();

  log("Horizontal Scaling Orchestrator activated");
  log(`${engines.size} engines registered | Queue cap: ${MAX_QUEUE}`);
  log(`Health every ${HEALTH_MS / 1_000}s | ${MAX_RESTARTS} recovery attempts`);

  const sorted = [...engines.values()].sort((a, b) => a.priority - b.priority);
  for (const e of sorted) {
    try {
      const t0 = Date.now();
      await e.startFn();
      Object.assign(e, { started: true, healthy: true, startTimeMs: Date.now() - t0 });
      state.enginesStarted++;
      state.enginesHealthy++;
    } catch (err) {
      log(`Failed to start "${e.name}"`, err);
    }
  }
  log(`${state.enginesStarted}/${engines.size} engines started`);

  runHealthChecks(); // immediate check
  spikeBus.scheduleSpike("scaling-orchestrator:health", {}, HEALTH_MS);
  spikeBus.scheduleSpike("scaling-orchestrator:health-init", {}, INIT_HEALTH_DELAY_MS);
}

/*────────────────────────  HEALTH  ───────────────────────────*/
async function runHealthChecks(): Promise<void> {
  state.totalHealthChecks++;
  let healthy = 0;
  const bad: string[] = [];

  for (const [n, e] of engines) {
    e.lastHealth = Date.now();
    try {
      e.healthy = e.healthFn ? e.healthFn().healthy : e.started;
    } catch {
      e.healthy = false;
    }

    if (e.healthy) {
      healthy++;
    } else if (e.started && e.restart < MAX_RESTARTS) {
      log(`Engine "${n}" unhealthy — recovery ${e.restart + 1}/${MAX_RESTARTS}`);
      try {
        await e.startFn();
        Object.assign(e, { healthy: true, restart: e.restart + 1 });
        healthy++;
        state.totalRecoveries++;
        log(`Engine "${n}" recovered`);
      } catch (err) {
        e.restart++;
        bad.push(n);
        log(`Recovery failed for "${n}"`, err);
      }
    } else if (!e.healthy) bad.push(n);
  }

  state.enginesHealthy = healthy;
  const mem = process.memoryUsage();
  state.memoryUsageMB = Math.round(mem.heapUsed / 1_024 / 1_024);
  state.uptimeMs = Date.now() - state.startTime;
  state.averageMessageLatencyMs = avg(latencies);

  const cpu = process.cpuUsage();
  state.cpuLoadEstimate = (cpu.user + cpu.system) / (state.uptimeMs * 1_000);

  cleanupQueue();

  /* cognitive sharing */
  cognitionBus.shareInsight("scaling-orchestrator", {
    type: "health-snapshot",
    data: { bad, queueDepth: state.messageQueueDepth },
  });
  cognitionBus.reportOutcome("scaling-orchestrator", { useful: bad.length === 0, context: "health-check" });
}

/*────────────────────────  QUEUE CLEANUP  ────────────────────*/
function cleanupQueue(): void {
  const now = Date.now();
  let removed = 0;
  for (let i = queue.length - 1; i >= 0; i--) {
    const m = queue[i];
    if (m.done || now - m.ts > m.ttl) {
      queue.splice(i, 1);
      removed++;
    }
  }
  if (removed) state.messageQueueDepth = queue.filter((m) => !m.done).length;
}

/*────────────────────────  SPIKES  ───────────────────────────*/
spikeBus.on("scaling-orchestrator:health", async () => {
  await runHealthChecks();
  spikeBus.scheduleSpike("scaling-orchestrator:health", {}, HEALTH_MS);
});
spikeBus.on("scaling-orchestrator:health-init", async () => {
  await runHealthChecks();
});

/* user/system attention hooks */
spikeBus.on("attention:scaling-orchestrator", () => runHealthChecks());
spikeBus.on("cognition:curiosity", () => runHealthChecks());

/* learn from peers */
cognitionBus.onInsight((_src, insight) => {
  if (insight.type === "resource" && insight.data?.queueHigh) runHealthChecks();
});

/*────────────────────────  STATE EXPORT  ─────────────────────*/
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
    messageQueueDepth: queue.filter((m) => !m.done).length,
    engines: [...engines.values()].map((e) => ({
      name: e.name,
      category: e.category,
      healthy: e.healthy,
      started: e.started,
      restartCount: e.restart,
      startTimeMs: e.startTimeMs,
      priority: e.priority,
    })),
  };
}

/*────────────────────────  SHUTDOWN  ─────────────────────────*/
export function shutdown(): void {
  engineRegistry.unregisterEngine("scaling-orchestrator");
  log("Graceful shutdown");
}