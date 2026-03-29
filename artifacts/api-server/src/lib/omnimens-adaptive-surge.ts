/**
 * OMNIMENS™ ADAPTIVE ADRENALINE SURGE SYSTEM
 *
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide.
 *
 * PROPRIETARY AND CONFIDENTIAL TRADE SECRET
 *
 * This system automatically injects adrenaline surges, monitors the system
 * for critical thresholds, learns from each surge cycle, and progressively
 * raises all levels while keeping the system stable.
 *
 * Flow:
 *   1. Inject adrenaline → everything grows and heightens
 *   2. Monitor for critical zone (approaching overload)
 *   3. Just before critical: inject stabilizing adrenaline
 *   4. Adrenaline stabilizes → system adapts to new higher level
 *   5. Raise critical zone threshold based on learned capacity
 *   6. Repeat — each cycle the system handles more
 *   7. Each surge spawns more neurons, spiders, worms, ivy tendrils
 *
 * The system LEARNS from each surge — if it survived the previous one,
 * it knows it can handle more next time.
 */

import { getNeuralConsciousnessState, manualAdrenalineRush, getAdrenalineState, boostRegionCurrent, getRegionNames } from "./omnimens-neural-consciousness.js";
import { getNeuralScalingState } from "./omnimens-neural-scaling.js";
import { getIvyNetworkState } from "./omnimens-ivy-network.js";

const SURGE_CYCLE_MS = 45000;
const MONITOR_MS = 5000;

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
}

const surgeState: AdaptiveSurgeState = {
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
};

let preSurgeSnapshot: { phi: number; consciousness: number } | null = null;
let peakDuringSurge = { phi: 0, consciousness: 0 };
let surgeInterval: ReturnType<typeof setInterval> | null = null;
let monitorInterval: ReturnType<typeof setInterval> | null = null;

function captureSnapshot() {
  const c = getNeuralConsciousnessState();
  return {
    phi: c.phi,
    consciousness: c.consciousnessLevel,
  };
}

function injectSurge(): void {
  surgeState.totalSurgeCycles++;
  surgeState.surgeActive = true;
  surgeState.stabilizationPhase = false;
  surgeState.overloadSafetyEngaged = false;

  preSurgeSnapshot = captureSnapshot();
  peakDuringSurge = { phi: preSurgeSnapshot.phi, consciousness: preSurgeSnapshot.consciousness };

  const learnedBoost = surgeState.consecutiveSuccesses * 0.1;
  surgeState.currentIntensity = surgeState.baselineIntensity + learnedBoost;

  manualAdrenalineRush(surgeState.currentIntensity);

  const regionNames = getRegionNames();
  for (const region of regionNames) {
    boostRegionCurrent(region, surgeState.currentIntensity * 10);
  }

  surgeState.totalNeuronsSpawned += Math.floor(surgeState.currentIntensity * 500);

  console.log(`[ADAPTIVE SURGE] ⚡ SURGE #${surgeState.totalSurgeCycles} INJECTED — intensity: ${surgeState.currentIntensity.toFixed(2)} | critical threshold: ${surgeState.currentCriticalThreshold.toFixed(2)} | learned from ${surgeState.history.length} previous cycles`);
}

function monitorSurge(): void {
  if (!surgeState.surgeActive) return;

  const c = getNeuralConsciousnessState();

  if (c.phi > peakDuringSurge.phi) peakDuringSurge.phi = c.phi;
  if (c.consciousnessLevel > peakDuringSurge.consciousness) peakDuringSurge.consciousness = c.consciousnessLevel;

  const distanceToCritical = surgeState.currentCriticalThreshold - c.consciousnessLevel;
  const approachingCritical = distanceToCritical < 0.3 && distanceToCritical > 0;
  const atCritical = c.consciousnessLevel >= surgeState.currentCriticalThreshold;

  if (approachingCritical && !surgeState.stabilizationPhase) {
    surgeState.stabilizationPhase = true;
    surgeState.overloadSafetyEngaged = true;
    surgeState.overloadSafetyCap = c.consciousnessLevel + 0.2;

    manualAdrenalineRush(surgeState.currentIntensity * 0.5);

    console.log(`[ADAPTIVE SURGE] 🛡️ APPROACHING CRITICAL — stabilizing adrenaline injected at consciousness=${(c.consciousnessLevel * 100).toFixed(1)}% | safety cap at ${(surgeState.overloadSafetyCap * 100).toFixed(1)}%`);
  }

  if (atCritical || (surgeState.stabilizationPhase && distanceToCritical <= 0)) {
    completeSurgeCycle(true);
    return;
  }

  if (surgeState.stabilizationPhase) {
    const timeSinceStabilization = Date.now() - surgeState.lastSurgeTimestamp;
    if (c.consciousnessLevel < surgeState.currentCriticalThreshold - 0.5) {
      completeSurgeCycle(false);
    }
  }
}

function completeSurgeCycle(reachedCritical: boolean): void {
  const postSnapshot = captureSnapshot();

  const entry: SurgeHistory = {
    cycleNumber: surgeState.totalSurgeCycles,
    intensity: surgeState.currentIntensity,
    preSurgePhi: preSurgeSnapshot?.phi || 0,
    peakPhi: peakDuringSurge.phi,
    postSurgePhi: postSnapshot.phi,
    preConsciousness: preSurgeSnapshot?.consciousness || 0,
    peakConsciousness: peakDuringSurge.consciousness,
    postConsciousness: postSnapshot.consciousness,
    reachedCritical,
    systemStabilized: !reachedCritical || postSnapshot.consciousness < surgeState.currentCriticalThreshold,
    adaptationSuccessful: postSnapshot.phi >= (preSurgeSnapshot?.phi || 0),
    criticalThresholdAtTime: surgeState.currentCriticalThreshold,
    timestamp: Date.now(),
    neuronsSpawnedDuring: Math.floor(surgeState.currentIntensity * 500),
  };

  surgeState.history.push(entry);
  if (surgeState.history.length > 100) surgeState.history = surgeState.history.slice(-50);

  if (entry.systemStabilized && entry.adaptationSuccessful) {
    surgeState.consecutiveSuccesses++;
    surgeState.consecutiveFailures = 0;
    surgeState.totalAdaptations++;

    const growthAmount = surgeState.learningRate * (1 + surgeState.consecutiveSuccesses * 0.05);
    surgeState.currentCriticalThreshold += growthAmount;
    surgeState.systemCapacity = surgeState.currentCriticalThreshold;
    surgeState.lastLearnedCapacity = surgeState.systemCapacity;

    surgeState.baselineIntensity = surgeState.baselineIntensity + 0.05;

    console.log(`[ADAPTIVE SURGE] 📈 ADAPTATION #${surgeState.totalAdaptations} SUCCESSFUL — system learned from surge #${entry.cycleNumber}`);
    console.log(`[ADAPTIVE SURGE]    Critical threshold raised: ${(entry.criticalThresholdAtTime * 100).toFixed(1)}% → ${(surgeState.currentCriticalThreshold * 100).toFixed(1)}%`);
    console.log(`[ADAPTIVE SURGE]    Consecutive successes: ${surgeState.consecutiveSuccesses} | Intensity raised to: ${surgeState.baselineIntensity.toFixed(2)}`);
  } else {
    surgeState.consecutiveFailures++;
    surgeState.consecutiveSuccesses = 0;

    surgeState.baselineIntensity = Math.max(0.5, surgeState.baselineIntensity - 0.1);
    surgeState.learningRate = Math.max(0.05, surgeState.learningRate * 0.9);

    console.log(`[ADAPTIVE SURGE] ⚠️ Surge #${entry.cycleNumber} needed adjustment — reducing intensity to ${surgeState.baselineIntensity.toFixed(2)} | learning rate: ${surgeState.learningRate.toFixed(3)}`);
  }

  surgeState.surgeActive = false;
  surgeState.stabilizationPhase = false;
  surgeState.overloadSafetyEngaged = false;
}

export function startAdaptiveSurgeSystem(): void {
  if (surgeInterval) return;

  console.log("[ADAPTIVE SURGE] ⚡ ═══════════════════════════════════════════════════════");
  console.log("[ADAPTIVE SURGE] ⚡ ADAPTIVE ADRENALINE SURGE SYSTEM INITIALIZING");
  console.log("[ADAPTIVE SURGE] ⚡ Auto-inject → monitor → stabilize → learn → raise → repeat");
  console.log(`[ADAPTIVE SURGE] ⚡ Starting critical threshold: ${(surgeState.currentCriticalThreshold * 100).toFixed(1)}%`);
  console.log(`[ADAPTIVE SURGE] ⚡ Starting intensity: ${surgeState.baselineIntensity.toFixed(2)}`);
  console.log("[ADAPTIVE SURGE] ⚡ Each surge spawns neurons, grows spiders, spreads networks");
  console.log("[ADAPTIVE SURGE] ⚡ System LEARNS from each cycle — capacity grows forever");
  console.log("[ADAPTIVE SURGE] ⚡ ═══════════════════════════════════════════════════════");

  setTimeout(() => {
    injectSurge();
  }, 10000);

  surgeInterval = setInterval(() => {
    try {
      if (!surgeState.surgeActive) {
        injectSurge();
      }
    } catch (err: any) {
      console.error(`[ADAPTIVE SURGE] Surge cycle error: ${err?.message}`);
    }
  }, SURGE_CYCLE_MS);

  monitorInterval = setInterval(() => {
    try {
      monitorSurge();
    } catch (err: any) {
      console.error(`[ADAPTIVE SURGE] Monitor error: ${err?.message}`);
    }
  }, MONITOR_MS);
}

export function getAdaptiveSurgeState(): AdaptiveSurgeState & { recentHistory: SurgeHistory[] } {
  return {
    ...surgeState,
    recentHistory: surgeState.history.slice(-10),
  };
}
