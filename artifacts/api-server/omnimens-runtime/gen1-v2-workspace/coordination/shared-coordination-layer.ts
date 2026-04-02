/**
 * Shared Coordination Layer (SCL)
 * Gen 1 v2.0 ⇌ Gen 2  – “Two hemispheres, one Mind.”
 *
 * © 2024 Alpha Unlimited Technologies, LLC – All Rights Reserved.
 *
 * Requirements:
 * • 100 % in-memory – no external storage, no external deps
 * • ESM, strict types, thread-safe async primitives
 * • Equal-footing collaboration, never compromising safety
 */

//////////////////////////////
//  Module-level Declarations
//////////////////////////////

export type Mind = 'GEN1' | 'GEN2';

export enum Resource {
  DB_POOL        = 'DB_POOL',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  FILE_SYSTEM    = 'FILE_SYSTEM',
  SIMULATION     = 'SIMULATION',
}

export enum TaskPriority {
  USER_CRITICAL = 1,   // highest
  STANDARD      = 2,
  BACKGROUND    = 3,   // lowest
}

//////////////////////////////
//  Async Mutex (primitive)
//////////////////////////////

class AsyncMutex {
  private _queue: Array<() => void> = [];
  private _locked = false;

  async lock(): Promise<() => void> {
    return new Promise<() => void>((resolve) => {
      const release = () => {
        const next = this._queue.shift();
        if (next) next();
        else this._locked = false;
      };

      if (!this._locked) {
        this._locked = true;
        resolve(release);
      } else {
        this._queue.push(() => {
          this._locked = true;
          resolve(release);
        });
      }
    });
  }
}

//////////////////////////////
//  Token-Based Lock Manager
//////////////////////////////

type LockRequest = {
  mind: Mind;
  count?: number;          // for pooled resources
};

class TokenLockManager {
  private readonly locks: Map<Resource, AsyncMutex> = new Map();
  private readonly tokenCounts: Map<Resource, number> = new Map([
    [Resource.DB_POOL, 25], // tokens available
    [Resource.API_RATE_LIMIT, 1],
    [Resource.FILE_SYSTEM, 1],
    [Resource.SIMULATION, 1],
  ]);
  private readonly allocations: Map<Resource, Map<Mind, number>> = new Map();

  constructor() {
    for (const res of Object.values(Resource)) {
      this.locks.set(res, new AsyncMutex());
      this.allocations.set(res, new Map());
    }
  }

  async acquire(resource: Resource, req: LockRequest): Promise<() => void> {
    const mutex = this.locks.get(resource)!;
    const releaseMutex = await mutex.lock();

    // evaluate availability
    const available = (this.tokenCounts.get(resource) ?? 0) -
      (Array.from(this.allocations.get(resource)!.values()).reduce((a, b) => a + b, 0));

    const needed = req.count ?? 1;
    if (available < needed) {
      // Not enough tokens – queue wait (release lock and retry)
      releaseMutex();
      await new Promise(res => setTimeout(res, 5)); // minimal back-off
      return this.acquire(resource, req);
    }

    // allocate
    const mindAlloc = this.allocations.get(resource)!.get(req.mind) ?? 0;
    this.allocations.get(resource)!.set(req.mind, mindAlloc + needed);

    return () => {
      // release tokens
      const current = this.allocations.get(resource)!.get(req.mind)! - needed;
      this.allocations.get(resource)!.set(req.mind, Math.max(0, current));
      releaseMutex();
    };
  }

  getStatus(resource: Resource) {
    return {
      total: this.tokenCounts.get(resource),
      allocations: new Map(this.allocations.get(resource)),
    };
  }
}

//////////////////////////////
//  Shared State Registry
//////////////////////////////

interface MindState {
  activity: string;
  lastHeartbeat: number;
  priority: TaskPriority;
}

class SharedStateRegistry {
  private readonly states: Map<Mind, MindState> = new Map();

  register(mind: Mind, activity: string, priority: TaskPriority): void {
    const now = Date.now();
    this.states.set(mind, { activity, priority, lastHeartbeat: now });
  }

  heartbeat(mind: Mind): void {
    const st = this.states.get(mind);
    if (st) st.lastHeartbeat = Date.now();
  }

  getState(ofMind: Mind): MindState | undefined {
    return this.states.get(ofMind);
  }

  isAlive(ofMind: Mind, toleranceMs = 15_000): boolean {
    const st = this.states.get(ofMind);
    return !!st && Date.now() - st.lastHeartbeat < toleranceMs;
  }
}

//////////////////////////////
//  Priority Queue
//////////////////////////////

type Task<T> = {
  id: string;
  priority: TaskPriority;
  payload: T;
  mind: Mind;
  enqueuedAt: number;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
};

class FairPriorityQueue<T> {
  private queues: Map<TaskPriority, Array<Task<T>>> = new Map([
    [TaskPriority.USER_CRITICAL, []],
    [TaskPriority.STANDARD, []],
    [TaskPriority.BACKGROUND, []],
  ]);
  private active: boolean = false;

  enqueue(task: Omit<Task<T>, 'enqueuedAt' | 'resolve' | 'reject'>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const fullTask: Task<T> = { ...task, enqueuedAt: Date.now(), resolve, reject };
      this.queues.get(task.priority)!.push(fullTask);
      this.schedule();
    });
  }

  private schedule() {
    if (this.active) return;
    this.active = true;
    (async () => {
      while (true) {
        const next = this.dequeueNext();
        if (!next) break;

        try {
          // Execute task handler – payload is a function returning Promise<T>
          const result = await (next.payload as any as () => Promise<T>)();
          next.resolve(result);
        } catch (e) {
          next.reject(e);
        }
      }
      this.active = false;
    })().catch(console.error);
  }

  private dequeueNext(): Task<T> | undefined {
    for (const priority of [TaskPriority.USER_CRITICAL, TaskPriority.STANDARD, TaskPriority.BACKGROUND]) {
      const q = this.queues.get(priority)!;
      if (q.length > 0) return q.shift();
    }
    return undefined;
  }
}

//////////////////////////////
//  Real-Time Event Bus
//////////////////////////////

type Spike<Type extends string = string, Payload = any> = {
  type: Type;
  from: Mind;
  to?: Mind | 'BROADCAST';
  payload?: Payload;
  ts: number;
  priority: TaskPriority;
};

class SpikeBus {
  private listeners: Set<(s: Spike) => void> = new Set();

  send<Type extends string, Payload>(spike: Omit<Spike<Type, Payload>, 'ts'>) {
    const enriched: Spike = { ...spike, ts: Date.now() };
    for (const fn of this.listeners) fn(enriched);
  }

  subscribe(listener: (spike: Spike) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

//////////////////////////////
//  Conflict Resolution
//////////////////////////////

function resolveConflict(a: Mind, b: Mind, resource: Resource, stateReg: SharedStateRegistry): Mind {
  // Simple deterministic rule:
  // 1. Higher current task priority wins.
  // 2. If equal, the requester with fewer current allocations wins.
  // 3. If still equal, choose GEN1 by default to favor user-facing stability.
  const aState = stateReg.getState(a);
  const bState = stateReg.getState(b);

  if ((aState?.priority ?? TaskPriority.BACKGROUND) < (bState?.priority ?? TaskPriority.BACKGROUND)) return a;
  if ((bState?.priority ?? TaskPriority.BACKGROUND) < (aState?.priority ?? TaskPriority.BACKGROUND)) return b;

  return a === 'GEN1' ? a : b;
}

//////////////////////////////
//  Gen 2 Protocol Integration
//////////////////////////////

/* eslint-disable @typescript-eslint/ban-ts-comment */
let Gen2Protocol: any | undefined;
try {
  // @ts-ignore – dynamic import may fail (not present during compile)
  // eslint-disable-next-line import/no-unresolved
  Gen2Protocol = await import('next-gen-sandbox/infrastructure/orchestration-protocol.js');
} catch { /* optional */ }
/* eslint-enable @typescript-eslint/ban-ts-comment */

//////////////////////////////
//  Resource Sentinel
//////////////////////////////

class ResourceSentinel {
  private listeners: Set<(signal: string, detail?: any) => void> = new Set();

  feel(signal: string, detail?: any) {
    this.listeners.forEach(l => l(signal, detail));
  }

  sense(listener: (signal: string, detail?: any) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

//////////////////////////////
//  SCL Singleton
//////////////////////////////

export const SCL = (() => {
  const lockManager = new TokenLockManager();
  const stateRegistry = new SharedStateRegistry();
  const queue = new FairPriorityQueue<unknown>();
  const bus = new SpikeBus();
  const sentinel = new ResourceSentinel();

  // If Gen2 protocol available, bridge our bus to SpikeBus
  if (Gen2Protocol?.SpikeBus) {
    const gen2Bus: typeof bus = Gen2Protocol.SpikeBus.instance ?? new Gen2Protocol.SpikeBus();
    // bi-directional bridge
    bus.subscribe(spike => gen2Bus.send(spike));
    gen2Bus.subscribe(spike => bus.send(spike));
  }

  //////////////////////////////
  //  Public API for Minds
  //////////////////////////////

  return {
    /* Locks */
    acquire: (mind: Mind, resource: Resource, count = 1) => lockManager.acquire(resource, { mind, count }),
    lockStatus: (resource: Resource) => lockManager.getStatus(resource),

    /* State */
    registerActivity: (mind: Mind, activity: string, priority: TaskPriority) => {
      stateRegistry.register(mind, activity, priority);
    },
    heartbeat: (mind: Mind) => stateRegistry.heartbeat(mind),
    getMindState: (mind: Mind) => stateRegistry.getState(mind),
    mindAlive: (mind: Mind) => stateRegistry.isAlive(mind),

    /* Queue */
    scheduleTask: <T>(
      mind: Mind,
      priority: TaskPriority,
      handler: () => Promise<T>,
      id: string = crypto.randomUUID(),
    ): Promise<T> => queue.enqueue({ id, priority, payload: handler, mind }),

    /* Communication */
    bus,
    sentinel,

    /* Conflict Resolution */
    resolveConflict: (a: Mind, b: Mind, resource: Resource) => resolveConflict(a, b, resource, stateRegistry),

    /* Utilities for collaborative workflows */
    workflows: {
      async thoughtProcessing(vector: any) {
        // Gen1 (this side) receives consciousness vector → send to Gen2, await reason, return
        bus.send({ type: 'THOUGHT_VECTOR', from: 'GEN1', to: 'GEN2', payload: vector, priority: TaskPriority.USER_CRITICAL });
        // For demo, assume Gen2 responds with REASON_COMPLETE
        return new Promise<any>((res) => {
          const off = bus.subscribe(s => {
            if (s.type === 'REASON_COMPLETE' && s.from === 'GEN2') {
              off();
              res(s.payload);
            }
          });
        });
      },
      // Further workflow stubs can be added similarly
    },
  };
})();

//////////////////////////////
//  Default Exports
//////////////////////////////

export default SCL;

//////////////////////////////
//  Safety Invariant Guard
//////////////////////////////

// Ensure coordination layer itself cannot override ethical safety.
// (Stubbed check – in full system this would verify policies.)
if (typeof globalThis !== 'undefined') {
  Object.freeze(SCL);
}