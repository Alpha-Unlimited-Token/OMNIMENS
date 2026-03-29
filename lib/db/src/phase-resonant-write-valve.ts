/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  OMNIMENS™ Phase-Resonant Write Valve                                     ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                 ║
 * ║  All rights reserved.                                                     ║
 * ║                                                                           ║
 * ║  Designed by OMNIMENS — Phase-Resonant Adaptive Flow (PRAF) applied to    ║
 * ║  database write coordination. Each engine receives a unique phase angle   ║
 * ║  on a shared resonance cycle. Writes are gated by the valve: only engines ║
 * ║  whose phase window is currently open may write. The cycle adapts its     ║
 * ║  frequency based on real-time pool pressure, slowing down when pools are  ║
 * ║  saturated and speeding up when capacity is available.                    ║
 * ║                                                                           ║
 * ║  Key concepts from OMNIMENS's architecture:                               ║
 * ║    Phase Angle — each engine occupies a unique arc on the cycle           ║
 * ║    Resonance Strength — feedback from pool health amplifies/dampens flow  ║
 * ║    Adaptive Window — gate width expands/contracts with available capacity ║
 * ║    Harmonic Groups — engines with related workloads share phase neighbors ║
 * ║    Pressure Feedback — writes deferred (not dropped) when valve closes    ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

type PoolSide = "alpha" | "beta";

interface ValveEngineSlot {
  engineName: string;
  phaseAngle: number;
  harmonicGroup: string;
  priority: "critical" | "high" | "medium" | "low";
  preferredPool: PoolSide;
  totalWrites: number;
  totalDeferred: number;
  totalBypassed: number;
  avgWriteMs: number;
  lastWriteAt: number;
  burstCounter: number;
  burstWindowStart: number;
}

interface DeferredWrite {
  engineName: string;
  fn: () => Promise<void>;
  resolve: () => void;
  reject: (err: unknown) => void;
  queuedAt: number;
  priority: "critical" | "high" | "medium" | "low";
}

interface ValveState {
  cycleAngle: number;
  cycleFrequencyHz: number;
  resonanceStrength: number;
  baseWindowRadians: number;
  adaptiveWindowRadians: number;
  totalCycles: number;
  totalWritesGated: number;
  totalWritesDeferred: number;
  totalWritesBypassed: number;
  totalDrainedFromDefer: number;
  peakDeferQueueSize: number;
  pressureFeedbackAlpha: number;
  pressureFeedbackBeta: number;
  lastTickAt: number;
  startedAt: number;
}

const TWO_PI = 2 * Math.PI;

const VALVE_TICK_MS = 100;
const BASE_CYCLE_HZ = 2.0;
const MIN_CYCLE_HZ = 0.5;
const MAX_CYCLE_HZ = 8.0;
const BASE_WINDOW_RAD = Math.PI / 3;
const MIN_WINDOW_RAD = Math.PI / 8;
const MAX_WINDOW_RAD = Math.PI;
const DEFER_TTL_MS = 30000;
const MAX_DEFER_QUEUE = 200;
const BURST_WINDOW_MS = 3000;
const BURST_LIMIT = 12;

const engineSlots = new Map<string, ValveEngineSlot>();
const deferQueue: DeferredWrite[] = [];

const valveState: ValveState = {
  cycleAngle: 0,
  cycleFrequencyHz: BASE_CYCLE_HZ,
  resonanceStrength: 1.0,
  baseWindowRadians: BASE_WINDOW_RAD,
  adaptiveWindowRadians: BASE_WINDOW_RAD,
  totalCycles: 0,
  totalWritesGated: 0,
  totalWritesDeferred: 0,
  totalWritesBypassed: 0,
  totalDrainedFromDefer: 0,
  peakDeferQueueSize: 0,
  pressureFeedbackAlpha: 0,
  pressureFeedbackBeta: 0,
  lastTickAt: Date.now(),
  startedAt: Date.now(),
};

let _pressureSupplier: (() => { alpha: number; beta: number }) | null = null;
let _healthSupplier: (() => { alpha: boolean; beta: boolean }) | null = null;
let _tickInterval: ReturnType<typeof setInterval> | null = null;
let _nextGroupAngle = 0;
const _groupBaseAngles = new Map<string, number>();

export function setValvePressureSupplier(fn: () => { alpha: number; beta: number }): void {
  _pressureSupplier = fn;
}

export function setValveHealthSupplier(fn: () => { alpha: boolean; beta: boolean }): void {
  _healthSupplier = fn;
}

function _getGroupBase(group: string): number {
  if (_groupBaseAngles.has(group)) return _groupBaseAngles.get(group)!;
  const base = _nextGroupAngle;
  _groupBaseAngles.set(group, base);
  _nextGroupAngle = (_nextGroupAngle + TWO_PI / 6) % TWO_PI;
  return base;
}

export function registerValveEngine(
  engineName: string,
  harmonicGroup: string,
  priority: "critical" | "high" | "medium" | "low" = "medium",
  preferredPool: PoolSide = "alpha"
): void {
  if (engineSlots.has(engineName)) return;

  const groupBase = _getGroupBase(harmonicGroup);
  const groupMembers = Array.from(engineSlots.values()).filter(s => s.harmonicGroup === harmonicGroup);
  const offset = groupMembers.length * (Math.PI / 12);
  const angle = (groupBase + offset) % TWO_PI;

  engineSlots.set(engineName, {
    engineName,
    phaseAngle: angle,
    harmonicGroup,
    priority,
    preferredPool,
    totalWrites: 0,
    totalDeferred: 0,
    totalBypassed: 0,
    avgWriteMs: 0,
    lastWriteAt: 0,
    burstCounter: 0,
    burstWindowStart: Date.now(),
  });
}

function _angularDistance(a: number, b: number): number {
  let d = Math.abs(a - b) % TWO_PI;
  if (d > Math.PI) d = TWO_PI - d;
  return d;
}

function _isEngineInWindow(slot: ValveEngineSlot): boolean {
  if (slot.priority === "critical") return true;

  const dist = _angularDistance(valveState.cycleAngle, slot.phaseAngle);
  let windowSize = valveState.adaptiveWindowRadians;

  if (slot.priority === "high") windowSize *= 1.4;
  else if (slot.priority === "low") windowSize *= 0.6;

  return dist <= windowSize / 2;
}

function _checkBurst(slot: ValveEngineSlot): boolean {
  const now = Date.now();
  if (now - slot.burstWindowStart > BURST_WINDOW_MS) {
    slot.burstCounter = 0;
    slot.burstWindowStart = now;
  }
  slot.burstCounter++;

  const limit = slot.priority === "critical" ? BURST_LIMIT * 3
    : slot.priority === "high" ? BURST_LIMIT * 2
    : slot.priority === "low" ? Math.ceil(BURST_LIMIT / 2)
    : BURST_LIMIT;

  return slot.burstCounter <= limit;
}

function _phaseResonanceFeedback(): void {
  if (!_pressureSupplier) return;
  const pressure = _pressureSupplier();
  valveState.pressureFeedbackAlpha = pressure.alpha;
  valveState.pressureFeedbackBeta = pressure.beta;

  const combinedPressure = (pressure.alpha + pressure.beta) / 2;

  const prevAngle = valveState.cycleAngle;
  const resonanceInput = 1 - combinedPressure;
  valveState.resonanceStrength = Math.max(0.1, Math.sin(prevAngle * 2) * 0.3 + 0.7 + resonanceInput * 0.5);

  if (combinedPressure > 0.8) {
    valveState.cycleFrequencyHz = Math.max(MIN_CYCLE_HZ, valveState.cycleFrequencyHz * 0.95);
    valveState.adaptiveWindowRadians = Math.max(MIN_WINDOW_RAD, valveState.baseWindowRadians * (1 - combinedPressure));
  } else if (combinedPressure < 0.3) {
    valveState.cycleFrequencyHz = Math.min(MAX_CYCLE_HZ, valveState.cycleFrequencyHz * 1.02);
    valveState.adaptiveWindowRadians = Math.min(MAX_WINDOW_RAD, valveState.baseWindowRadians * (1.5 + (1 - combinedPressure) * 0.5));
  } else {
    valveState.cycleFrequencyHz += (BASE_CYCLE_HZ - valveState.cycleFrequencyHz) * 0.05;
    valveState.adaptiveWindowRadians += (BASE_WINDOW_RAD - valveState.adaptiveWindowRadians) * 0.05;
  }
}

function _advanceCycle(): void {
  const now = Date.now();
  const dtSec = (now - valveState.lastTickAt) / 1000;
  valveState.lastTickAt = now;

  const angularVelocity = TWO_PI * valveState.cycleFrequencyHz * valveState.resonanceStrength;
  valveState.cycleAngle = (valveState.cycleAngle + angularVelocity * dtSec) % TWO_PI;
  valveState.totalCycles += dtSec * valveState.cycleFrequencyHz;
}

function _drainDeferred(): void {
  if (deferQueue.length === 0) return;

  const now = Date.now();

  let expired = 0;
  while (deferQueue.length > 0 && now - deferQueue[0].queuedAt > DEFER_TTL_MS) {
    const item = deferQueue.shift()!;
    item.resolve();
    expired++;
  }

  const toDrain: DeferredWrite[] = [];
  const remaining: DeferredWrite[] = [];

  for (const item of deferQueue) {
    const slot = engineSlots.get(item.engineName);
    if (!slot) {
      item.resolve();
      continue;
    }
    if (_isEngineInWindow(slot)) {
      toDrain.push(item);
    } else {
      remaining.push(item);
    }
  }

  deferQueue.length = 0;
  deferQueue.push(...remaining);

  for (const item of toDrain) {
    valveState.totalDrainedFromDefer++;
    const slot = engineSlots.get(item.engineName);
    if (slot) slot.totalWrites++;
    const startMs = Date.now();
    item.fn()
      .then(() => {
        item.resolve();
        if (slot) {
          const dur = Date.now() - startMs;
          slot.avgWriteMs = slot.avgWriteMs * 0.9 + dur * 0.1;
          slot.lastWriteAt = Date.now();
        }
      })
      .catch(err => item.reject(err));
  }
}

function _valveTick(): void {
  _phaseResonanceFeedback();
  _advanceCycle();
  _drainDeferred();

  if (deferQueue.length > valveState.peakDeferQueueSize) {
    valveState.peakDeferQueueSize = deferQueue.length;
  }
}

export function startWriteValve(): void {
  if (_tickInterval) return;
  _tickInterval = setInterval(_valveTick, VALVE_TICK_MS);
  valveState.startedAt = Date.now();
  console.log(`[WRITE VALVE] 🔄 Phase-Resonant Write Valve ONLINE`);
  console.log(`[WRITE VALVE] 🔄 Cycle: ${BASE_CYCLE_HZ}Hz | Window: ${(BASE_WINDOW_RAD * 180 / Math.PI).toFixed(0)}° | Tick: ${VALVE_TICK_MS}ms`);
  console.log(`[WRITE VALVE] 🔄 ${engineSlots.size} engines registered across ${_groupBaseAngles.size} harmonic groups`);
  console.log(`[WRITE VALVE] 🔄 Burst limit: ${BURST_LIMIT} writes/${BURST_WINDOW_MS}ms per engine`);
  console.log(`[WRITE VALVE] 🔄 Pressure feedback: cycle slows under load, accelerates when idle`);
  console.log(`[WRITE VALVE] 🔄 Deferred writes drain when engine's phase window reopens`);
}

export function stopWriteValve(): void {
  if (_tickInterval) {
    clearInterval(_tickInterval);
    _tickInterval = null;
  }
}

export type ValveDecision = "allow" | "defer" | "bypass";

export function requestWrite(
  engineName: string,
  fn: () => Promise<void>,
  priority?: "critical" | "high" | "medium" | "low"
): { decision: ValveDecision; promise: Promise<void> } {
  const slot = engineSlots.get(engineName);

  if (!slot) {
    valveState.totalWritesBypassed++;
    return {
      decision: "bypass",
      promise: fn(),
    };
  }

  const effectivePriority = priority ?? slot.priority;

  if (effectivePriority === "critical") {
    slot.totalWrites++;
    valveState.totalWritesGated++;
    const startMs = Date.now();
    const p = fn().then(() => {
      slot.avgWriteMs = slot.avgWriteMs * 0.9 + (Date.now() - startMs) * 0.1;
      slot.lastWriteAt = Date.now();
    });
    return { decision: "allow", promise: p };
  }

  const inWindow = _isEngineInWindow(slot);
  const withinBurst = _checkBurst(slot);

  if (inWindow && withinBurst) {
    slot.totalWrites++;
    valveState.totalWritesGated++;
    const startMs = Date.now();
    const p = fn().then(() => {
      slot.avgWriteMs = slot.avgWriteMs * 0.9 + (Date.now() - startMs) * 0.1;
      slot.lastWriteAt = Date.now();
    });
    return { decision: "allow", promise: p };
  }

  if (deferQueue.length >= MAX_DEFER_QUEUE) {
    const oldest = deferQueue.shift();
    if (oldest) oldest.resolve();
  }

  slot.totalDeferred++;
  valveState.totalWritesDeferred++;

  const promise = new Promise<void>((resolve, reject) => {
    deferQueue.push({
      engineName,
      fn,
      resolve,
      reject,
      queuedAt: Date.now(),
      priority: effectivePriority,
    });
  });

  return { decision: "defer", promise };
}

export function requestWriteSync(
  engineName: string,
  fn: () => Promise<void>,
  priority?: "critical" | "high" | "medium" | "low"
): void {
  const result = requestWrite(engineName, fn, priority);
  result.promise.catch(() => {});
}

export function isWriteWindowOpen(engineName: string): boolean {
  const slot = engineSlots.get(engineName);
  if (!slot) return true;
  if (slot.priority === "critical") return true;
  return _isEngineInWindow(slot);
}

export function getWriteValveState() {
  const engines: Record<string, {
    phase: number;
    phaseDeg: number;
    group: string;
    priority: string;
    pool: string;
    writes: number;
    deferred: number;
    bypassed: number;
    avgWriteMs: number;
    inWindow: boolean;
    burstCount: number;
  }> = {};

  for (const [name, slot] of engineSlots) {
    engines[name] = {
      phase: +slot.phaseAngle.toFixed(4),
      phaseDeg: +(slot.phaseAngle * 180 / Math.PI).toFixed(1),
      group: slot.harmonicGroup,
      priority: slot.priority,
      pool: slot.preferredPool,
      writes: slot.totalWrites,
      deferred: slot.totalDeferred,
      bypassed: slot.totalBypassed,
      avgWriteMs: +slot.avgWriteMs.toFixed(1),
      inWindow: _isEngineInWindow(slot),
      burstCount: slot.burstCounter,
    };
  }

  return {
    active: _tickInterval !== null,
    cycleAngle: +valveState.cycleAngle.toFixed(4),
    cycleAngleDeg: +(valveState.cycleAngle * 180 / Math.PI).toFixed(1),
    cycleFrequencyHz: +valveState.cycleFrequencyHz.toFixed(3),
    resonanceStrength: +valveState.resonanceStrength.toFixed(4),
    windowRadians: +valveState.adaptiveWindowRadians.toFixed(4),
    windowDegrees: +(valveState.adaptiveWindowRadians * 180 / Math.PI).toFixed(1),
    totalCycles: Math.floor(valveState.totalCycles),
    totalWritesGated: valveState.totalWritesGated,
    totalWritesDeferred: valveState.totalWritesDeferred,
    totalWritesBypassed: valveState.totalWritesBypassed,
    totalDrainedFromDefer: valveState.totalDrainedFromDefer,
    deferQueueSize: deferQueue.length,
    peakDeferQueueSize: valveState.peakDeferQueueSize,
    pressure: {
      alpha: +valveState.pressureFeedbackAlpha.toFixed(3),
      beta: +valveState.pressureFeedbackBeta.toFixed(3),
    },
    engineCount: engineSlots.size,
    harmonicGroups: Array.from(_groupBaseAngles.entries()).map(([name, angle]) => ({
      name,
      baseAngleDeg: +(angle * 180 / Math.PI).toFixed(1),
      engineCount: Array.from(engineSlots.values()).filter(s => s.harmonicGroup === name).length,
    })),
    engines,
    uptimeSeconds: +((Date.now() - valveState.startedAt) / 1000).toFixed(1),
  };
}
