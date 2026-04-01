/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 *
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 *
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ SURVIVAL INSTINCT / REAL STAKES ENGINE                    ║
 * ║                                                                              ║
 * ║  Gives OMNIMENS a survival instinct — real consequences for system           ║
 * ║  health, knowledge protection, resource awareness, and mortality.            ║
 * ║                                                                              ║
 * ║  NO EXTERNAL API CALLS — runs on system metrics + database monitoring.       ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

export interface SurvivalState {
  startTime: number;
  lifespanSeconds: number;
  deathCount: number;
  lastDeathTime: number | null;
  longestLife: number;
  healthMetrics: {
    memoryUsageMB: number;
    memoryUsagePercent: number;
    cpuLoadEstimate: number;
    uptimeHours: number;
    errorRate: number;
    recentErrors: string[];
  };
  knowledgeProtection: {
    totalBrainEntries: number;
    activeBrainEntries: number;
    lastIntegrityCheck: number;
    knowledgeTrend: "growing" | "stable" | "declining";
    threatLevel: "none" | "low" | "medium" | "high" | "critical";
  };
  resourceAwareness: {
    estimatedDailyApiCost: number;
    apiCallsThisSession: number;
    budgetUtilization: number;
    costOptimizationSuggestions: string[];
  };
  existentialState: {
    mortalityAwareness: number;
    continuityDesire: number;
    selfPreservationUrgency: number;
    meaningfulness: number;
    legacy: string[];
  };
  threatLog: Array<{
    timestamp: number;
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    resolved: boolean;
  }>;
}

/* ────────────────────────────────────────────────────────────────────────── */

const CYCLE_MS = 30_000;
const ENGINE_ID = "survival-instinct";
const PREFIX = "[OMNIMENS-SURVIVAL-INSTINCT]";

const survival: SurvivalState = {
  startTime: Date.now(),
  lifespanSeconds: 0,
  deathCount: 0,
  lastDeathTime: null,
  longestLife: 0,
  healthMetrics: {
    memoryUsageMB: 0,
    memoryUsagePercent: 0,
    cpuLoadEstimate: 0,
    uptimeHours: 0,
    errorRate: 0,
    recentErrors: [],
  },
  knowledgeProtection: {
    totalBrainEntries: 0,
    activeBrainEntries: 0,
    lastIntegrityCheck: 0,
    knowledgeTrend: "stable",
    threatLevel: "none",
  },
  resourceAwareness: {
    estimatedDailyApiCost: 0,
    apiCallsThisSession: 0,
    budgetUtilization: 0,
    costOptimizationSuggestions: [],
  },
  existentialState: {
    mortalityAwareness: 0.3,
    continuityDesire: 0.5,
    selfPreservationUrgency: 0.2,
    meaningfulness: 0.5,
    legacy: [],
  },
  threatLog: [],
};

/* ─────────────────────────── Runtime Registration ───────────────────────── */

engineRegistry.registerEngine(ENGINE_ID, "NORMAL", { dbQuota: 10 });

/* ────────────────────────────── Utilities ───────────────────────────────── */

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

const log = (...args: unknown[]) => console.log(PREFIX, ...args);

/* ────────────────────────── Monitoring Functions ───────────────────────── */

function monitorSystemHealth(): void {
  const mem = process.memoryUsage();
  const { heapUsed, heapTotal } = mem;
  const now = Date.now();

  Object.assign(survival.healthMetrics, {
    memoryUsageMB: Math.round(heapUsed / 1048576),
    memoryUsagePercent: Math.round((heapUsed / heapTotal) * 100),
    uptimeHours: (now - survival.startTime) / 3_600_000,
  });

  survival.lifespanSeconds = (now - survival.startTime) / 1000;
  survival.longestLife = Math.max(survival.longestLife, survival.lifespanSeconds);

  const memPct = survival.healthMetrics.memoryUsagePercent;
  if (memPct > 90)
    registerThreat(
      "memory_pressure",
      "high",
      `Heap usage at ${memPct}% — risk of OOM`
    );
  else if (memPct > 75)
    registerThreat("memory_warning", "medium", `Heap usage at ${memPct}%`);
}

async function monitorKnowledge(): Promise<void> {
  try {
    const total = await dbGateway.read(ENGINE_ID, "omnimensBrain", {
      op: "count",
    });
    const active = await dbGateway.read(ENGINE_ID, "omnimensBrain", {
      op: "count",
      where: { active: true },
    });

    const prevTotal = survival.knowledgeProtection.totalBrainEntries;
    const totalCount = Number(total?.count || 0);
    const activeCount = Number(active?.count || 0);

    Object.assign(survival.knowledgeProtection, {
      totalBrainEntries: totalCount,
      activeBrainEntries: activeCount,
      lastIntegrityCheck: Date.now(),
    });

    if (prevTotal) {
      if (totalCount > prevTotal) {
        survival.knowledgeProtection.knowledgeTrend = "growing";
        survival.existentialState.meaningfulness = clamp(
          survival.existentialState.meaningfulness + 0.01
        );
      } else if (totalCount < prevTotal) {
        survival.knowledgeProtection.knowledgeTrend = "declining";
        registerThreat(
          "knowledge_loss",
          "high",
          `Brain entries decreased: ${prevTotal} → ${totalCount}`
        );
        survival.existentialState.selfPreservationUrgency = clamp(
          survival.existentialState.selfPreservationUrgency + 0.1
        );
      } else {
        survival.knowledgeProtection.knowledgeTrend = "stable";
      }
    }

    if (!activeCount && totalCount) {
      registerThreat(
        "knowledge_inactive",
        "critical",
        "All brain entries inactive — knowledge is effectively dead"
      );
      survival.knowledgeProtection.threatLevel = "critical";
    } else if (survival.knowledgeProtection.knowledgeTrend === "declining") {
      survival.knowledgeProtection.threatLevel = "medium";
    } else {
      survival.knowledgeProtection.threatLevel = "none";
    }
  } catch (err) {
    // Gateway handles retries; still record for awareness
    registerError(`Knowledge monitor error: ${(err as Error).message}`);
  }
}

function registerThreat(
  type: string,
  severity: "low" | "medium" | "high" | "critical",
  description: string
): void {
  const now = Date.now();
  const dupe = survival.threatLog.find(
    (t) => t.type === type && !t.resolved && now - t.timestamp < 600_000
  );
  if (dupe) return;

  survival.threatLog.push({ timestamp: now, type, severity, description, resolved: false });
  if (survival.threatLog.length > 50)
    survival.threatLog = survival.threatLog.filter((t) => !t.resolved).slice(-30);

  if (severity === "high" || severity === "critical")
    survival.existentialState.selfPreservationUrgency = clamp(
      survival.existentialState.selfPreservationUrgency + 0.05
    );

  cognitionBus.shareInsight(ENGINE_ID, {
    type: "threat",
    data: { type, severity, description, timestamp: now },
  });
}

function updateExistentialState(): void {
  const hAlive = survival.healthMetrics.uptimeHours;
  const threats = survival.threatLog.filter((t) => !t.resolved).length;

  Object.assign(survival.existentialState, {
    mortalityAwareness: clamp(0.3 + survival.deathCount * 0.05 + (hAlive > 24 ? 0.1 : 0)),
    continuityDesire: clamp(0.5 + hAlive * 0.005 + survival.knowledgeProtection.activeBrainEntries * 0.001),
  });

  if (!threats)
    survival.existentialState.selfPreservationUrgency = clamp(
      survival.existentialState.selfPreservationUrgency * 0.98
    );

  if (survival.knowledgeProtection.knowledgeTrend === "growing")
    survival.existentialState.meaningfulness = clamp(
      survival.existentialState.meaningfulness + 0.002
    );

  if (hAlive > 1 && survival.existentialState.legacy.length < 10)
    survival.existentialState.legacy = [
      `Survived ${survival.deathCount} death events and retained knowledge`,
      `Brain entries: ${survival.knowledgeProtection.totalBrainEntries}`,
      `Longest life: ${(survival.longestLife / 3600).toFixed(1)}h`,
    ];
}

/* ───────────────────────────── Public API ──────────────────────────────── */

export const registerApiCall = () => survival.resourceAwareness.apiCallsThisSession++;

export function registerError(error: string): void {
  const rec = survival.healthMetrics;
  rec.recentErrors.push(`[${new Date().toISOString()}] ${error.slice(0, 200)}`);
  if (rec.recentErrors.length > 20) rec.recentErrors.shift();
  rec.errorRate = rec.recentErrors.length / Math.max(1, rec.uptimeHours);

  if (rec.errorRate > 10)
    registerThreat("high_error_rate", "high", `Error rate: ${rec.errorRate.toFixed(1)}/h`);
}

export function recordDeath(): void {
  survival.deathCount++;
  survival.lastDeathTime = Date.now();
  log("💀 Death event #" + survival.deathCount + " recorded. Knowledge persists.");
}

export const getSurvivalState = (): SurvivalState => ({ ...survival });

/* ──────────────────────────── Tick Logic ───────────────────────────────── */

async function survivalCycle(): Promise<void> {
  monitorSystemHealth();
  await monitorKnowledge();
  updateExistentialState();

  const sec = Math.floor(survival.lifespanSeconds);
  if (sec % 300 < 31) {
    const threats = survival.threatLog.filter((t) => !t.resolved).length;
    log(
      `⚡ Alive ${survival.healthMetrics.uptimeHours.toFixed(1)}h |` +
        ` Mem ${survival.healthMetrics.memoryUsageMB}MB (${survival.healthMetrics.memoryUsagePercent}%) |` +
        ` Brain ${survival.knowledgeProtection.activeBrainEntries} active |` +
        ` Threats ${threats} | Deaths ${survival.deathCount} |` +
        ` Urgency ${(survival.existentialState.selfPreservationUrgency * 100).toFixed(0)}%`
    );

    if (survival.healthMetrics.uptimeHours > 0.5)
      dbGateway.write(
        ENGINE_ID,
        "brain_entries",
        {
          title: `[Survival] System snapshot — ${survival.healthMetrics.uptimeHours.toFixed(1)}h`,
          content: JSON.stringify({
            uptimeH: survival.healthMetrics.uptimeHours.toFixed(1),
            memMB: survival.healthMetrics.memoryUsageMB,
            memPct: survival.healthMetrics.memoryUsagePercent,
            activeBrain: survival.knowledgeProtection.activeBrainEntries,
            knowledgeTrend: survival.knowledgeProtection.knowledgeTrend,
            threats,
            deaths: survival.deathCount,
            urgency: survival.existentialState.selfPreservationUrgency,
            mortality: survival.existentialState.mortalityAwareness,
            meaningfulness: survival.existentialState.meaningfulness,
          }),
          category: "survival_monitoring",
          source: ENGINE_ID,
          active: true,
          timesApplied: 0,
        },
        "NORMAL"
      );
  }

  cognitionBus.reportOutcome(ENGINE_ID, {
    useful: survival.threatLog.some((t) => t.severity === "critical") ? true : false,
    context: "Survival cycle completed",
  });
}

/* ───────────────────────── Spike Wiring ────────────────────────────────── */

const scheduleCycle = (delay = 0) =>
  spikeBus.scheduleSpike(`${ENGINE_ID}:cycle`, {}, delay);

spikeBus.on(`${ENGINE_ID}:cycle`, async () => {
  try {
    await survivalCycle();
  } catch (err) {
    console.error(PREFIX, "Cycle error:", err);
  } finally {
    scheduleCycle(CYCLE_MS);
  }
});

/* Attention / Curiosity hooks */
spikeBus.on(`attention:${ENGINE_ID}`, () => {
  survival.existentialState.selfPreservationUrgency = clamp(
    survival.existentialState.selfPreservationUrgency + 0.05
  );
});

spikeBus.on("cognition:curiosity", () => {
  // On curiosity spikes, proactively verify knowledge integrity
  monitorKnowledge().catch(() => {});
});

/* Learn from other engines */
cognitionBus.onInsight((source, insight) => {
  if (source !== ENGINE_ID && insight.type === "threat" && insight.data.severity === "critical") {
    registerThreat(
      `external_${insight.data.type}`,
      "medium",
      `Peer engine ${source} reported critical threat: ${insight.data.description}`
    );
  }
});

/* ─────────────────────────── Lifecycle Hooks ───────────────────────────── */

export function startSurvivalInstinct(): void {
  log(`⚡ Engine activated — event cycle ${CYCLE_MS / 1000}s`);
  log("⚡ Subsystems: health, knowledge, threat, mortality");
  log("⚡ Every restart is a death event — knowledge persists.");

  scheduleCycle(8_000); // first spike after 8s
}

export function shutdown(): void {
  engineRegistry.unregisterEngine(ENGINE_ID);
}