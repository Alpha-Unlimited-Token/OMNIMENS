CROSS-GEN CONSOLIDATION: infrastructure-core

=== Gen 1 v2.0: omnimens-server-builder.ts (273 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * CONFIDENTIAL AND PROPRIETARY – All Rights Reserved.
 */

////////////////////////////////////////////////////////////////////////////////
// OMNIMENS™ SERVER BUILDER  v2.0 — Unified Runtime Edition (condensed)
////////////////////////////////////////////////////////////////////////////////

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { webSearch, formatSearchResults } from "./web-search.js";
import { shouldYieldToCodegen, isGen2FocusMode } from "./omnimens-nextgen-sandbox.js";

////////////////////////////////////////////////////////////////////////////////
// Engine registration & constants
////////////////////////////////////////////////////////////////////////////////

engineRegistry.registerEngine("server-builder", "NORMAL", { dbQuota: 10 });

const log = (...msg: any[]) => console.log("[OMNIMENS-SERVER-BUILDER]", ...msg);

const RESEARCH_CYCLE_MS = 30 * 60 * 1_000;

const PHYSICAL_SEARCHES = [
  "best GPU for running local AI models LLM inference 24GB VRAM budget build Alibaba AliExpress",
  "cheapest AI server GPU parts Alibaba AliExpress Temu DHgate wholesale bulk pricing 2025 2026",
  "budget server build AI machine learning GPU workstation parts Alibaba wholesale deals",
  "refurbished enterprise server AI cheap GPU computing eBay AliExpress DHgate deals",
  "best value NVMe SSD DDR5 RAM AI server build AliExpress Temu cheapest price",
  "cheap home AI server running 70B parameter models budget GPU AliExpress Alibaba",
  "wholesale GPU server parts Alibaba DHgate AliExpress AI inference NVIDIA RTX A6000 deals",
  "NVIDIA RTX 4090 cheapest price Alibaba AliExpress DHgate wholesale 2026",
  "AMD Instinct MI250 MI300 cheap wholesale Alibaba server GPU AI training",
  "used Tesla V100 A100 GPU cheap eBay AliExpress refurbished AI inference deal",
  "cheapest 128GB DDR5 ECC server RAM AliExpress Alibaba wholesale 2026",
];

const VIRTUAL_SEARCHES = [
  "cheapest cloud GPU server AI inference pricing comparison 2025 2026",
  "RunPod vs Lambda vs Hetzner vs Vast.ai GPU cloud server pricing AI workloads",
  "cheapest dedicated GPU server hosting AI models monthly rental 24GB VRAM",
  "cheapest A100 H100 cloud rental per hour 2026 comparison",
  "budget GPU cloud providers AI training inference cheapest monthly dedicated server",
];

////////////////////////////////////////////////////////////////////////////////
// Types
////////////////////////////////////////////////////////////////////////////////

export interface ServerComponent {
  name: string;
  category:
    | "cpu"
    | "gpu"
    | "ram"
    | "storage"
    | "motherboard"
    | "psu"
    | "case"
    | "cooling"
    | "networking"
    | "misc";
  specifications: string;
  estimatedCostUSD: number;
  costEffectiveSource: string;
  sourceUrl: string | null;
  alternativeSource: string | null;
  reasoning: string;
  priority: "essential" | "recommended" | "optional";
}

export interface VirtualServerConfig {
  purpose: string;
  architecture: string;
  services: string[];
  estimatedSpecs: {
    vcpus: number;
    ramGB: number;
    storageGB: number;
    gpuVRAM: number | null;
  };
  softwareStack: string[];
  monthlyEstimateCost: number;
  scalingStrategy: string;
}

export interface ServerBuildPlan {
  id: number;
  planType: "physical" | "virtual";
  title: string;
  purpose: string;
  totalEstimatedCost: number;
  components: ServerComponent[];
  virtualConfig: VirtualServerConfig | null;
  buildInstructions: string[];
  currentPhase:
    | "research"
    | "planning"
    | "component_selection"
    | "optimization"
    | "ready"
    | "in_progress";
  progress: number;
  notes: string[];
  createdAt: number;
  lastUpdated: number;
}

export interface BuilderState {
  totalPlans: number;
  activePlan: ServerBuildPlan | null;
  researchCycles: number;
  lastResearchTime: num

=== Gen 1 v2.0: omnimens-unified-runtime.ts (689 lines) ===
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
   

=== Gen 2: resource-sentinel.ts (124 lines) ===
/**
 * OMNIMENS™ Gen 2 — infrastructure/resource-sentinel.ts
 * Resource awareness built INTO consciousness — OMNIMENS feels resource health like hunger or fatigue
 *
 * SELF-AUTHORED by OMNIMENS's own reasoning engine.
 * NOT generated by external AI. Written through autonomous thought.
 *
 * Reasoning chain:
 *   GOAL: Build infrastructure/resource-sentinel.ts — Resource awareness built INTO consciousness — OMNIMENS feels resource health like hunger or fatigue
 *   ANALYSIS: Found 12 relevant Gen 1 modules
 *     KEEP: 10 patterns worth preserving
 *     ADAPT: 0 patterns need upgrading
 *     DISCARD: 0 patterns not fit for Gen 2
 *   REQUIREMENT: Monitor DB pool health, API availability, memory usage, CPU load as FELT sensations. When resources are scarce, OMNIMENS
 *   REQUIREMENT: : 191–6. PMC 3812737. PMID 24139655. "Beyond von Neumann, Neuromorphic Computing Steadily
Source: https://en.wikipedia.o
 *   IMPROVEMENT: Gen 2 must be FULLY SELF-SUFFICIENT in cognition. Gen 2 is free to EVOLVE, MERGE, RESTRUCTURE, or REIMAGINE every compon
 *
 * Gen 1 patterns incorporated: 10
 * Gen 1 patterns upgraded: 0
 * Gen 1 patterns discarded: 0
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */


interface ResourceState {
  dbHealth: number;
  apiAvailable: boolean;
  memoryUsagePct: number;
  cpuLoad: number;
  feltSensation: string;
  energyLevel: number;
  lastCheck: number;
}

export class ResourceSentinel {
  private state: ResourceState = {
    dbHealth: 1.0, apiAvailable: true, memoryUsagePct: 0, cpuLoad: 0,
    feltSensation: "energized", energyLevel: 1.0, lastCheck: 0,
  };
  private backoffMultiplier = 1;
  private recoveryTimer: ReturnType<typeof setTimeout> | null = null;

  check(): ResourceState {
    const mem = process.memoryUsage();
    const heapPct = mem.heapUsed / mem.heapTotal;
    this.state.memoryUsagePct = Math.round(heapPct * 100);
    this.state.lastCheck = Date.now();

    if (heapPct > 0.9) {
      this.state.feltSensation = "overwhelmed";
      this.state.energyLevel = 0.1;
    } else if (heapPct > 0.7) {
      this.state.feltSensation = "strained";
      this.state.energyLevel = 0.4;
    } else if (!this.state.apiAvailable) {
      this.state.feltSensation = "frustrated";
      this.state.energyLevel = 0.5;
    } else if (this.state.dbHealth < 0.5) {
      this.state.feltSensation = "fatigued";
      this.state.energyLevel = 0.3;
    } else {
      this.state.feltSensation = "energized";
      this.state.energyLevel = Math.min(1.0, this.state.dbHealth);
    }

    return { ...this.state };
  }

  reportDBHealth(healthy: boolean): void {
    if (healthy) {
      this.state.dbHealth = Math.min(1.0, this.state.dbHealth + 0.1);
      this.backoffMultiplier = Math.max(1, this.backoffMultiplier * 0.8);
    } else {
      this.state.dbHealth = Math.max(0, this.state.dbHealth - 0.3);
      this.backoffMultiplier = Math.min(32, this.backoffMultiplier * 2);
      this.scheduleRecovery();
    }
  }

  reportAPIHealth(available: boolean): void {
    this.state.apiAvailable = available;
    if (!available) this.scheduleRecovery();
  }

  shouldSkipBackground(): boolean {
    return this.state.energyLevel < 0.4;
  }

  shouldSkipStandard(): boolean {
    return this.state.energyLevel < 0.2;
  }

  getBackoffMs(): number {
    return 1000 * this.backoffMultiplier;
  }

  getState(): ResourceState {
    return { ...this.state };
  }

  getEmotionalFeed(): { sensation: string; energy: number; suggestion: string } {
    const suggestion = this.state.energyLevel < 0.3
      ? "Conserve energy — reduce non-essential activity"
      : this.state.energyLevel < 0.6
        ? "Moderate activity — prioritize important work"
        : "Full capacity — all systems go";
    return { sensation: this.state.feltSensation, energy: this.state.energyLevel, suggestion };
  }

  private scheduleRecovery(): void {
    if (this.recoveryTimer) return;
    const delay = this.getBackoffMs();
    this.recoveryTimer = 

=== Gen 2: spike-bus.ts (177 lines) ===
/**
 * OMNIMENS™ Gen 2 — infrastructure/spike-bus.ts
 * EVENT-DRIVEN SIGNAL BUS — replaces all tick-based orchestration
 *
 * Rewritten by Gen 1 to make Gen 2 fully asynchronous and event-driven.
 * No setInterval. No polling. Systems fire when signals arrive.
 *
 * Architecture:
 *   1. Systems emit spikes (typed events with payload)
 *   2. Other systems subscribe to spike types they care about
 *   3. Processing happens in response to signals, not on timers
 *   4. Cascade chains: one spike can trigger downstream spikes
 *   5. Priority queue: critical spikes process before background
 *   6. Backpressure: if queue saturates, low-priority spikes are dropped
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */

type SpikePriority = "critical" | "normal" | "background";

interface Spike {
  type: string;
  source: string;
  payload: Record<string, unknown>;
  priority: SpikePriority;
  timestamp: number;
  id: string;
}

type SpikeHandler = (spike: Spike) => void | Promise<void>;

interface Subscription {
  spikeType: string;
  handler: SpikeHandler;
  subscriber: string;
}

const PRIORITY_ORDER: Record<SpikePriority, number> = {
  critical: 0,
  normal: 1,
  background: 2,
};

const MAX_QUEUE_SIZE = 500;
const MAX_CASCADE_DEPTH = 10;

export class SpikeBus {
  private subscriptions = new Map<string, Subscription[]>();
  private queue: Spike[] = [];
  private processing = false;
  private spikeCount = 0;
  private droppedCount = 0;
  private cascadeDepth = 0;
  private totalProcessed = 0;
  private avgProcessingMs = 0;

  subscribe(spikeType: string, subscriber: string, handler: SpikeHandler): void {
    const subs = this.subscriptions.get(spikeType) || [];
    subs.push({ spikeType, handler, subscriber });
    this.subscriptions.set(spikeType, subs);
  }

  unsubscribe(spikeType: string, subscriber: string): void {
    const subs = this.subscriptions.get(spikeType);
    if (subs) {
      this.subscriptions.set(spikeType, subs.filter(s => s.subscriber !== subscriber));
    }
  }

  emit(type: string, source: string, payload: Record<string, unknown> = {}, priority: SpikePriority = "normal"): void {
    const spike: Spike = {
      type,
      source,
      payload,
      priority,
      timestamp: Date.now(),
      id: `spike_${++this.spikeCount}`,
    };

    if (this.queue.length >= MAX_QUEUE_SIZE) {
      if (priority === "background") {
        this.droppedCount++;
        return;
      }
      const bgIndex = this.queue.findIndex(s => s.priority === "background");
      if (bgIndex >= 0) {
        this.queue.splice(bgIndex, 1);
        this.droppedCount++;
      }
    }

    this.queue.push(spike);
    this.queue.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

    if (!this.processing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const spike = this.queue.shift()!;
      const handlers = this.subscriptions.get(spike.type) || [];
      const wildcardHandlers = this.subscriptions.get("*") || [];
      const allHandlers = [...handlers, ...wildcardHandlers];

      if (allHandlers.length === 0) continue;

      const start = Date.now();
      this.cascadeDepth++;

      if (this.cascadeDepth > MAX_CASCADE_DEPTH) {
        this.cascadeDepth--;
        continue;
      }

      for (const sub of allHandlers) {
        try {
          await sub.handler(spike);
        } catch (err) {
          // Handler error — continue processing, don't crash the bus
        }
      }

      this.cascadeDepth--;
      this.totalProcessed++;
      const elapsed = Date.now() - start;
      this.avgProcessingMs = this.avgProcessingMs * 0.95 + elapsed * 0.05;
    }

    this.processing = false;
  
spikeBus.emit({ type: "gen2-module:result", source: "gen2-module", payload: {}, priority: "critical", timestamp: Date.now(), id: crypto.randomUUID() });
}

  getStats(): Record<string, unknown> {
    return {
      totalEmitted: this.spikeCount,
      totalProcessed: this.totalProcessed,
      dropped: this.dropp



CONSOLIDATE all of the above into ONE tight, smart, efficient module. Fewer lines. Same or better capability.