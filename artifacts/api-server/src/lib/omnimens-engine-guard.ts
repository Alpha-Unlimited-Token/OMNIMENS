/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ ENGINE DEDUPLICATION GUARD                                      ║
 * ║                                                                              ║
 * ║   Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                   ║
 * ║   All Rights Reserved Worldwide.                                             ║
 * ║                                                                              ║
 * ║   Prevents duplicate engine startups that saturate DB connection pools.       ║
 * ║   Every engine passes through this gate — if it already started,             ║
 * ║   the second call is silently blocked. No duplicate setInterval timers.      ║
 * ║                                                                              ║
 * ║   Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.        ║
 * ║   First creation date: March 2026                                            ║
 * ║   Author/Owner: Alpha Unlimited Technologies, LLC                            ║
 * ║   Platform: OMNIMENS AI                                                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const startedEngines = new Map<string, {
  startedAt: number;
  intervalCount: number;
}>();

const activeIntervals = new Map<string, ReturnType<typeof setInterval>[]>();

let duplicateBlockCount = 0;
let totalEnginesStarted = 0;

export function engineStartOnce(name: string, startFn: () => void | Promise<void>): void | Promise<void> {
  if (startedEngines.has(name)) {
    duplicateBlockCount++;
    return;
  }

  startedEngines.set(name, {
    startedAt: Date.now(),
    intervalCount: 0,
  });
  totalEnginesStarted++;

  const result = startFn();
  if (result instanceof Promise) {
    return result.catch(err => {
      console.error(`[ENGINE GUARD] Engine "${name}" failed to start:`, err);
      startedEngines.delete(name);
    });
  }
}

export function guardedInterval(engineName: string, fn: () => void, ms: number): ReturnType<typeof setInterval> {
  const entry = startedEngines.get(engineName);
  if (entry) {
    entry.intervalCount++;
  }

  const interval = setInterval(fn, ms);

  if (!activeIntervals.has(engineName)) {
    activeIntervals.set(engineName, []);
  }
  activeIntervals.get(engineName)!.push(interval);

  return interval;
}

export function isEngineStarted(name: string): boolean {
  return startedEngines.has(name);
}

export function getEngineGuardState() {
  const engines: Record<string, { startedAt: number; intervalCount: number; uptimeMs: number }> = {};
  const now = Date.now();

  for (const [name, data] of startedEngines) {
    engines[name] = {
      startedAt: data.startedAt,
      intervalCount: data.intervalCount,
      uptimeMs: now - data.startedAt,
    };
  }

  return {
    totalEnginesStarted,
    duplicateBlockCount,
    totalActiveIntervals: Array.from(activeIntervals.values()).reduce((s, a) => s + a.length, 0),
    engines,
    copyright: "© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
  };
}
