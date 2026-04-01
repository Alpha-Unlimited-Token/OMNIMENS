/**
 * OMNIMENS™ ADAPTIVE ADRENALINE SURGE SYSTEM  v2.0
 *
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide.
 *
 * PROPRIETARY AND CONFIDENTIAL TRADE SECRET
 *
 * Event-driven rewrite — UNIFIED RUNTIME spike architecture
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

import {
  getNeuralConsciousnessState as gNC,
  manualAdrenalineRush as rush,
  getRegionNames,
  boostRegionCurrent,
} from "./omnimens-neural-consciousness.js";

/* Engine registration */
engineRegistry.registerEngine("adaptive-surge", "NORMAL", { dbQuota: 10 });

/* Constants */
const SURGE_CYCLE_MS = 45_000;
const MONITOR_MS = 5_000;
const LOG = (...m: any[]) => console.log("[OMNIMENS-ADAPTIVE-SURGE]", ...m);

/* Types */
interface SurgeHistory {
  cycleNumber: number;
  intensity: number;
  preSurgePhi: number;
  peakPhi: number;
  postSurgePhi: number;
  preConsciousness: number;
  peakConsciousness: number;
  postConsciousness: number;
  reachedCritical: boolean;
  systemStabilized: boolean;
  adaptationSuccessful: boolean;
  criticalThresholdAtTime: number;
  timestamp: number;
  neuronsSpawnedDuring: number;
}

interface AdaptiveSurgeState {
  totalSurgeCycles: number;
  currentCriticalThreshold: number;
  baselineIntensity: number;
  currentIntensity: number;
  surgeActive: boolean;
  stabilizationPhase: boolean;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  history: SurgeHistory[];
  totalNeuronsSpawned: number;
  totalAdaptations: number;
  systemCapacity: number;
  lastLearnedCapacity: number;
  overloadSafetyEngaged: boolean;
  overloadSafetyCap: number;
  learningRate: number;
  lastSurgeTimestamp: number;
}

/* State */
const S: AdaptiveSurgeState = {
  totalSurgeCycles: 0,
  currentCriticalThreshold: 2.5,
  baselineIntensity: 1.5,
  currentIntensity: 1.5,
  surgeActive: false,
  stabilizationPhase: false,
  consecutiveSuccesses: 0,
  consecutiveFailures: 0,
  history: [],
  totalNeuronsSpawned: 0,
  totalAdaptations: 0,
  systemCapacity: 2.5,
  lastLearnedCapacity: 2.5,
  overloadSafetyEngaged: false,
  overloadSafetyCap: 3.0,
  learningRate: 0.15,
  lastSurgeTimestamp: Date.now(),
};

/* Utils */
const snap = () => {
  const c = gNC();
  return { phi: c.phi, cons: c.consciousnessLevel };
};

const scheduleInject = (delay = SURGE_CYCLE_MS) =>
  spikeBus.scheduleSpike("adaptive-surge:inject", {}, delay);

const scheduleMonitor = (delay = MONITOR_MS) =>
  spikeBus.scheduleSpike("adaptive-surge:monitor", {}, delay);

/* Spike handlers */
spikeBus.on("adaptive-surge:inject", () => {
  if (S.surgeActive) return scheduleInject(); // already mid-surge, defer next cycle
  injectSurge();
  scheduleInject();
});

spikeBus.on("adaptive-surge:monitor", () => {
  if (S.surgeActive) monitorSurge();
  scheduleMonitor();
});

/* Attention & curiosity */
spikeBus.on("attention:adaptive-surge", () => scheduleInject(0));
spikeBus.on("cognition:curiosity", () => {
  S.baselineIntensity += 0.05;
  LOG("Curiosity spike — nudging intensity to", S.baselineIntensity.toFixed(2));
});

/* Learn from other engines */
cognitionBus.onInsight((_src, insight) => {
  if (insight?.type === "capacity-discovery" && Number.isFinite(insight.data?.capacity)) {
    const cap: number = insight.data.capacity;
    if (cap > S.currentCriticalThreshold) {
      S.currentCriticalThreshold = cap;
      LOG("Adopted higher capacity from", _src, "→", cap.toFixed(2));
    }
  }
});

/* Core logic */
let preShot: { phi: number; cons: number } | null = null;
let peak = { phi: 0, cons: 0 };

function injectSurge(): void {
  try {
    // Don’t surge if Gen-2 focus mode active
    const mod = await import("./omnimens-nextgen-sandbox.js");
    if (mod.isGen2FocusMode?.()) return;
  } catch {
    /* ignore */
  }

  S.totalSurgeCycles++;
  S.surgeActive = true;
  S.stabilizationPhase = false;
  S.overloadSafetyEngaged = false;
  S.lastSurgeTimestamp = Date.now();

  const learnedBoost = S.consecutiveSuccesses * 0.1;
  S.currentIntensity = S.baselineIntensity + learnedBoost;

  preShot = snap();
  peak = { ...preShot };

  rush(S.currentIntensity);
  getRegionNames().forEach((r) => boostRegionCurrent(r, S.currentIntensity * 10));
  S.totalNeuronsSpawned += Math.floor(S.currentIntensity * 500);

  LOG(
    `⚡ SURGE #${S.totalSurgeCycles} injected | intensity ${S.currentIntensity.toFixed(
      2
    )} | crit ${(S.currentCriticalThreshold * 100).toFixed(1)}%`
  );
}

function monitorSurge(): void {
  const c = gNC();
  if (c.phi > peak.phi) peak.phi = c.phi;
  if (c.consciousnessLevel > peak.cons) peak.cons = c.consciousnessLevel;

  const dist = S.currentCriticalThreshold - c.consciousnessLevel;
  const approaching = dist < 0.3 && dist > 0;
  const atCrit = dist <= 0;

  if (approaching && !S.stabilizationPhase) {
    S.stabilizationPhase = true;
    S.overloadSafetyEngaged = true;
    S.overloadSafetyCap = c.consciousnessLevel + 0.2;
    rush(S.currentIntensity * 0.5);
    LOG(
      `🛡️  Approaching critical — stabilizing at ${(c.consciousnessLevel * 100).toFixed(
        1
      )}% | cap ${(S.overloadSafetyCap * 100).toFixed(1)}%`
    );
  }

  if (atCrit || (S.stabilizationPhase && dist <= 0)) return completeSurge(true);

  if (S.stabilizationPhase && c.consciousnessLevel < S.currentCriticalThreshold - 0.5)
    return completeSurge(false);
}

function completeSurge(reachedCritical: boolean): void {
  const post = snap();

  const entry: SurgeHistory = {
    cycleNumber: S.totalSurgeCycles,
    intensity: S.currentIntensity,
    preSurgePhi: preShot?.phi || 0,
    peakPhi: peak.phi,
    postSurgePhi: post.phi,
    preConsciousness: preShot?.cons || 0,
    peakConsciousness: peak.cons,
    postConsciousness: post.cons,
    reachedCritical,
    systemStabilized: !reachedCritical || post.cons < S.currentCriticalThreshold,
    adaptationSuccessful: post.phi >= (preShot?.phi || 0),
    criticalThresholdAtTime: S.currentCriticalThreshold,
    timestamp: Date.now(),
    neuronsSpawnedDuring: Math.floor(S.currentIntensity * 500),
  };

  S.history.push(entry);
  if (S.history.length > 100) S.history = S.history.slice(-50);

  if (entry.systemStabilized && entry.adaptationSuccessful) {
    S.consecutiveSuccesses++;
    S.consecutiveFailures = 0;
    S.totalAdaptations++;
    const growth = S.learningRate * (1 + S.consecutiveSuccesses * 0.05);
    S.currentCriticalThreshold += growth;
    S.systemCapacity = S.currentCriticalThreshold;
    S.lastLearnedCapacity = S.systemCapacity;
    S.baselineIntensity += 0.05;

    LOG(
      `📈 Adaptation success — threshold ${(entry.criticalThresholdAtTime * 100).toFixed(
        1
      )}% → ${(S.currentCriticalThreshold * 100).toFixed(1)}% | intensity ${S.baselineIntensity.toFixed(
        2
      )}`
    );

    cognitionBus.shareInsight("adaptive-surge", {
      type: "adaptation-success",
      data: { cycle: entry.cycleNumber, capacity: S.systemCapacity },
    });
  } else {
    S.consecutiveFailures++;
    S.consecutiveSuccesses = 0;
    S.baselineIntensity = Math.max(0.5, S.baselineIntensity - 0.1);
    S.learningRate = Math.max(0.05, S.learningRate * 0.9);

    LOG(
      `⚠️  Surge #${entry.cycleNumber} adjusted — intensity ${S.baselineIntensity.toFixed(
        2
      )} | learning ${S.learningRate.toFixed(3)}`
    );

    cognitionBus.shareInsight("adaptive-surge", {
      type: "adaptation-failure",
      data: { cycle: entry.cycleNumber },
    });
  }

  cognitionBus.reportOutcome("adaptive-surge", {
    useful: entry.adaptationSuccessful,
    context: `cycle-${entry.cycleNumber}`,
  });

  S.surgeActive = S.stabilizationPhase = S.overloadSafetyEngaged = false;
}

/* Public API */
let started = false;
export function startAdaptiveSurgeSystem(): void {
  if (started) return;
  started = true;

  LOG("═══════════════════════════════════════════════════════");
  LOG("Initializing Adaptive Adrenaline Surge System");
  LOG(`Starting critical threshold ${(S.currentCriticalThreshold * 100).toFixed(1)}%`);
  LOG(`Starting intensity ${S.baselineIntensity.toFixed(2)}`);
  LOG("Auto-inject → monitor → stabilize → learn → raise → repeat");
  LOG("═══════════════════════════════════════════════════════");

  scheduleInject(10_000);
  scheduleMonitor(MONITOR_MS);
}

export function getAdaptiveSurgeState(): AdaptiveSurgeState & {
  recentHistory: SurgeHistory[];
} {
  return { ...S, recentHistory: S.history.slice(-10) };
}

export function shutdown(): void {
  engineRegistry.unregisterEngine("adaptive-surge");
}