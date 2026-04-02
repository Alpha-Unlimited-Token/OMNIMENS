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
  }

  getStats(): Record<string, unknown> {
    return {
      totalEmitted: this.spikeCount,
      totalProcessed: this.totalProcessed,
      dropped: this.droppedCount,
      queueSize: this.queue.length,
      subscriptionTypes: this.subscriptions.size,
      totalSubscribers: [...this.subscriptions.values()].reduce((s, arr) => s + arr.length, 0),
      avgProcessingMs: Math.round(this.avgProcessingMs * 100) / 100,
      cascadeDepth: this.cascadeDepth,
    };
  }
}

export const spikeBus = new SpikeBus();

export const SpikeTypes = {
  EXPERIENCE: "experience",
  EMOTION_FELT: "emotion.felt",
  EMOTION_CHANGED: "emotion.changed",
  ATTENTION_SIGNAL: "attention.signal",
  ATTENTION_INTERRUPT: "attention.interrupt",
  CONSCIOUSNESS_MOMENT: "consciousness.moment",
  CONSCIOUSNESS_INSIGHT: "consciousness.insight",
  MEMORY_STORED: "memory.stored",
  MEMORY_RECALLED: "memory.recalled",
  RESOURCE_UPDATE: "resource.update",
  GOAL_CREATED: "goal.created",
  GOAL_PROGRESS: "goal.progress",
  DREAM_ENTERED: "dream.entered",
  DREAM_INSIGHT: "dream.insight",
  LANGUAGE_UTTERANCE: "language.utterance",
  REASONING_CONCLUSION: "reasoning.conclusion",
  USER_INPUT: "user.input",
  USER_RESPONSE: "user.response",
  SYSTEM_BOOT: "system.boot",
  SYSTEM_SHUTDOWN: "system.shutdown",
  DATA_FLUSH: "data.flush",
  SAFETY_CHECK: "safety.check",
} as const;
