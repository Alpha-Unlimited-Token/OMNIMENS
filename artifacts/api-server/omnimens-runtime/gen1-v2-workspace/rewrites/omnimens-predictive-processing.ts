/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * Unauthorized use is strictly prohibited.
 *
 * OMNIMENS™ PREDICTIVE PROCESSING — FREE ENERGY MINIMIZATION ENGINE (v2.0)
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";
import { internalPredictiveProcessing } from "./omnimens-internal-cognition-router.js";
import { getThrottleMultiplier, canMakeBackgroundCall } from "./omnimens-api-budget.js";

const ENGINE_ID = "predictive-processing";
engineRegistry.registerEngine(ENGINE_ID, "NORMAL", { dbQuota: 10 });

let cycleCount = 0;

/* ---------- Types ---------- */
interface Prediction {
  type: string;
  predicted: string;
  domain: string;
  hierarchyLevel: number;
  confidence: number;
}
type Table = keyof typeof TABLES;

/* ---------- Table mapping ---------- */
const TABLES = {
  predictions: "omnimensPredictions",
  brain: "omnimensBrain",
  mesh: "omnimensAgentMesh",
  notifications: "omnimensNotifications",
} as const;

/* ---------- Helpers ---------- */
const log = (msg: string) => console.log(`[OMNIMENS-PREDICTIVE-PROCESSING] ${msg}`);

const read = <T = any>(table: Table, query: any) =>
  dbGateway.read(ENGINE_ID, TABLES[table], query) as Promise<T[]>;

const write = (table: Table, data: any) =>
  dbGateway.write(ENGINE_ID, TABLES[table], data, "NORMAL");

const update = (table: Table, criteria: any, changes: any) =>
  dbGateway.update?.(ENGINE_ID, TABLES[table], criteria, changes); // optional

const callLLM = async (prompt: string, tag: string) =>
  apiManager.call(ENGINE_ID, "openai", { prompt, tag }) as Promise<Array<any>>;

/* ---------- Prediction Models ---------- */
const models: Array<{
  domain: string;
  generator: () => Promise<Prediction[]>;
}> = [
  {
    domain: "agent_discoveries",
    generator: async () => {
      const discoveries = await read("mesh", {
        messageType: "spider_beacon",
        orderBy: { createdAt: "DESC" },
        limit: 8,
      });
      if (discoveries.length < 2 || !canMakeBackgroundCall(ENGINE_ID)) return [];
      const ctx = discoveries
        .map((d) => `${d.fromAgent}: ${(d.content ?? "").slice(0, 150)}`)
        .join("\n");
      log("🧠 Predicting agent discoveries");
      const preds = await internalPredictiveProcessing(ctx, "agent_discoveries");
      return preds.map(({ predicted, confidence = 0.5 }: any): Prediction => ({
        type: "agent_next_discovery",
        predicted,
        domain: "agent_discoveries",
        hierarchyLevel: 2,
        confidence,
      }));
    },
  },
  {
    domain: "knowledge_gaps",
    generator: async () => {
      const brain = await read("brain", {
        active: true,
        orderBy: { createdAt: "DESC" },
        limit: 15,
      });
      if (brain.length < 5 || !canMakeBackgroundCall(ENGINE_ID)) return [];
      const categories: Record<string, number> = {};
      brain.forEach((b) => {
        const k = b.category ?? "unknown";
        categories[k] = (categories[k] || 0) + 1;
      });
      const summary =
        Object.entries(categories)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ") +
        "\n" +
        brain.map((b) => `[${b.category}] ${b.title}`).join("; ");
      log("🧠 Predicting knowledge gaps");
      const gaps = await internalPredictiveProcessing(summary, "knowledge_gaps");
      return gaps.map(({ predicted, confidence = 0.5 }: any): Prediction => ({
        type: "knowledge_gap",
        predicted,
        domain: "knowledge_gaps",
        hierarchyLevel: 3,
        confidence,
      }));
    },
  },
  {
    domain: "system_needs",
    generator: async () => {
      const upgrades = await read("mesh", {
        messageType: "upgrade_proposal",
        orderBy: { createdAt: "DESC" },
        limit: 5,
      });
      if (upgrades.length < 2 || !canMakeBackgroundCall(ENGINE_ID)) return [];
      const ctx = upgrades
        .map((u) => `${u.subject}: ${(u.content ?? "").slice(0, 150)}`)
        .join("\n");
      log("🧠 Predicting system needs");
      const needs = await internalPredictiveProcessing(ctx, "system_needs");
      return needs.map(({ predicted, confidence = 0.5 }: any): Prediction => ({
        type: "system_need",
        predicted,
        domain: "system_needs",
        hierarchyLevel: 1,
        confidence,
      }));
    },
  },
];

/* ---------- Prediction Error Resolution ---------- */
async function resolvePredictionErrors(): Promise<number> {
  const unresolved = await read("predictions", {
    where: { actual: null, predictionError: null },
    orderBy: { createdAt: "DESC" },
    limit: 10,
  });
  let resolved = 0;

  for (const pred of unresolved) {
    const ageMs = Date.now() - new Date(pred.createdAt).getTime();
    if (ageMs < 3 * 60 * 60 * 1000) continue;

    let actual = "";
    let error = 0.5;
    if (pred.predictionType === "agent_next_discovery") {
      const agent = (pred.predicted.match(/^([^:]+):/)?.[1] ?? "").trim();
      const beacons = await read("mesh", {
        messageType: "spider_beacon",
        fromAgent: new RegExp(agent, "i"),
        createdAfter: pred.createdAt,
        limit: 3,
      });
      if (beacons.length) {
        actual = beacons.map((b) => (b.content ?? "").slice(0, 100)).join("; ");
        try {
          log("🧠 Resolving prediction error");
          const cmp = await internalPredictiveProcessing(
            `PREDICTION: ${pred.predicted.slice(0, 300)}\nACTUAL: ${actual.slice(0, 300)}`,
            "error_resolution"
          );
          error = cmp[0]?.confidence ?? 0.5;
          if (error > 0.6) {
            await write("brain", {
              category: "insight",
              title: `[PREDICTION ERROR] Surprise signal → model update`,
              content: (cmp[0]?.predicted ?? "Prediction diverged").slice(0, 250),
              confidence: 0.5 + error * 0.4,
              sourceConversation: `prediction_cycle_${cycleCount}`,
              timesApplied: 0,
              active: true,
            });
          }
        } catch {/* swallow */}
      } else if (ageMs < 6 * 60 * 60 * 1000) {
        continue; // wait longer
      } else {
        actual = "No matching discoveries found — prediction unresolvable";
        error = 0.7;
      }
    } else if (ageMs > 6 * 60 * 60 * 1000) {
      actual = "Prediction expired — insufficient data for resolution";
      error = 0.5;
    } else continue;

    await update("predictions", { id: pred.id }, { actual, predictionError: error, modelUpdated: error > 0.6 });
    resolved++;
  }
  return resolved;
}

/* ---------- Core Cycle ---------- */
export async function runPredictiveCycle(): Promise<void> {
  cycleCount++;
  if (shouldYieldToCodegen()) {
    log(`🔕 Cycle #${cycleCount} DEFERRED — codegen priority`);
    return;
  }

  const start = Date.now();
  log(`▲ Cycle #${cycleCount} START`);

  const errorsResolved = await resolvePredictionErrors();
  if (errorsResolved) log(`Resolved ${errorsResolved} prediction error(s)`);

  let newPreds = 0;
  for (const { domain, generator } of models) {
    try {
      const preds = await generator();
      if (!preds.length) continue;
      await write("predictions", preds);
      newPreds += preds.length;
      log(`▲ ${domain}: ${preds.length} prediction(s) generated`);
      cognitionBus.shareInsight(ENGINE_ID, {
        type: "predictions",
        domain,
        count: preds.length,
      });
    } catch (e) {
      console.error(`[${ENGINE_ID}] model ${domain} failed`, e);
    }
  }

  if (newPreds || errorsResolved) {
    await write("notifications", {
      upgradeId: null,
      title: `Predictive Processing Cycle #${cycleCount}`,
      message: `Generated ${newPreds} predictions, resolved ${errorsResolved} errors in ${(Date.now() - start) / 1000}s.`,
      type: "predictive_processing",
      readByOwner: false,
    });
  }

  cognitionBus.reportOutcome(ENGINE_ID, {
    useful: newPreds + errorsResolved > 0,
    context: `cycle_${cycleCount}`,
  });

  log(`▲ Cycle #${cycleCount} COMPLETE — ${newPreds} preds, ${errorsResolved} resolved, ${((Date.now() - start) / 1000).toFixed(1)}s`);
}

/* ---------- Spike Scheduling ---------- */
const BASE_INTERVAL = 4 * 60 * 60 * 1000; // 4h
function scheduleNextCycle(delay: number) {
  spikeBus.scheduleSpike(`${ENGINE_ID}:cycle`, {}, delay);
}
spikeBus.on(`${ENGINE_ID}:cycle`, async () => {
  await runPredictiveCycle().catch(console.error);
  scheduleNextCycle(BASE_INTERVAL * getThrottleMultiplier());
});

/* ---------- External API ---------- */
export function startPredictiveProcessing() {
  const firstDelay =
    process.env.NODE_ENV !== "production" ? 18 * 60 * 1000 : 45 * 60 * 1000;
  log(`Engine activated — first cycle in ${firstDelay / 60000}m, then every 4h`);
  log(`Models: ${models.map((m) => m.domain).join(", ")}`);
  scheduleNextCycle(firstDelay);
}

export const getActivePredictions = () =>
  read("predictions", { where: { actual: null }, orderBy: { createdAt: "DESC" }, limit: 20 });

/* ---------- Cognitive Hooks ---------- */
cognitionBus.onInsight((src, insight) => {
  if (src === ENGINE_ID) return;
  // Simple example: boost curiosity when another engine flags discovery
  if (insight.type === "discovery") spikeBus.scheduleSpike(`${ENGINE_ID}:cycle`, {}, 1000);
});
spikeBus.on("cognition:curiosity", () => {
  // Curiosity spike: run an exploratory mini-cycle sooner
  spikeBus.scheduleSpike(`${ENGINE_ID}:cycle`, {}, 5 * 60 * 1000);
});
spikeBus.on(`attention:${ENGINE_ID}`, () => {
  // Immediate attention demands quick prediction refresh
  spikeBus.scheduleSpike(`${ENGINE_ID}:cycle`, {}, 2000);
});

/* ---------- Shutdown ---------- */
export function shutdown() {
  engineRegistry.unregisterEngine(ENGINE_ID);
}