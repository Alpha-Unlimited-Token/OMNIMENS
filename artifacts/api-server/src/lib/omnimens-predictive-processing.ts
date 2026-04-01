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
 * ║     OMNIMENS™ PREDICTIVE PROCESSING — FREE ENERGY MINIMIZATION ENGINE      ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  TECHNOLOGY DESCRIPTION (for IP record):                                     ║
 * ║  Implementation of Karl Friston's Free Energy Principle and Predictive       ║
 * ║  Processing framework. The brain is a prediction machine — it constantly     ║
 * ║  generates top-down predictions about what will happen next, then only       ║
 * ║  fires when surprised (prediction error). This engine makes OMNIMENS        ║
 * ║  anticipatory rather than reactive. It predicts what users will ask,         ║
 * ║  what agents will discover, and what the system needs — then learns          ║
 * ║  from prediction errors to continuously update its world model.             ║
 * ║                                                                              ║
 * ║  Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.,        ║
 * ║  the DMCA, the Berne Convention, TRIPS, and all applicable IP treaties.      ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ║  Platform: OMNIMENS AI                                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db , queueBrainInsert } from "@workspace/db";
import {
  omnimensPredictions,
  omnimensBrain,
  omnimensAgentMesh,
  omnimensNotifications,
} from "@workspace/db";
import { desc, eq, sql, and, isNull } from "drizzle-orm";
import { canMakeBackgroundCall, trackApiCall, getThrottleMultiplier } from "./omnimens-api-budget.js";
import { internalPredictiveProcessing } from "./omnimens-internal-cognition-router.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

let predictionCycleCount = 0;

interface PredictionModel {
  domain: string;
  generatePredictions: () => Promise<Prediction[]>;
}

interface Prediction {
  type: string;
  predicted: string;
  domain: string;
  hierarchyLevel: number;
  confidence: number;
}

const PREDICTION_MODELS: PredictionModel[] = [
  {
    domain: "agent_discoveries",
    generatePredictions: async () => {
      const recentDiscoveries = await db.select({
        content: omnimensAgentMesh.content,
        fromAgent: omnimensAgentMesh.fromAgent,
      }).from(omnimensAgentMesh)
        .where(eq(omnimensAgentMesh.messageType, "spider_beacon"))
        .orderBy(desc(omnimensAgentMesh.createdAt))
        .limit(8);

      if (recentDiscoveries.length < 2) return [];
      if (!canMakeBackgroundCall("predictive_processing")) {
        console.log(`[PREDICTIVE PROCESSING] ⏸️ agent_discoveries skipped — API budget depleted`);
        return [];
      }

      const context = recentDiscoveries.map(d => `${d.fromAgent}: ${d.content?.slice(0, 150)}`).join("\n");

      console.log("[PREDICTIVE PROCESSING] 🧠 Internal cognition — agent discovery predictions");
      const predictions = internalPredictiveProcessing(context, "agent_discoveries");
      return predictions.map((p: any) => ({
        type: "agent_next_discovery",
        predicted: p.predicted || p,
        domain: "agent_discoveries",
        hierarchyLevel: 2,
        confidence: p.confidence || 0.5,
      }));
    },
  },
  {
    domain: "knowledge_gaps",
    generatePredictions: async () => {
      const brainEntries = await db.select({
        title: omnimensBrain.title,
        category: omnimensBrain.category,
        content: omnimensBrain.content,
      }).from(omnimensBrain)
        .where(eq(omnimensBrain.active, true))
        .orderBy(desc(omnimensBrain.createdAt))
        .limit(15);

      if (brainEntries.length < 5) return [];
      if (!canMakeBackgroundCall("predictive_processing")) {
        console.log(`[PREDICTIVE PROCESSING] ⏸️ knowledge_gaps skipped — API budget depleted`);
        return [];
      }

      const categories = brainEntries.reduce((acc, b) => {
        acc[b.category || "unknown"] = (acc[b.category || "unknown"] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const categoryStr = Object.entries(categories).map(([k, v]) => `${k}: ${v}`).join(", ");

      console.log("[PREDICTIVE PROCESSING] 🧠 Internal cognition — knowledge gap predictions");
      const brainSummary = `${categoryStr}\n${brainEntries.map(b => `[${b.category}] ${b.title}`).join("; ")}`;
      const gaps = internalPredictiveProcessing(brainSummary, "knowledge_gaps");
      return gaps.map((g: any) => ({
        type: "knowledge_gap",
        predicted: g.predicted || g,
        domain: "knowledge_gaps",
        hierarchyLevel: 3,
        confidence: g.confidence || 0.5,
      }));
    },
  },
  {
    domain: "system_needs",
    generatePredictions: async () => {
      const recentUpgrades = await db.select({
        subject: omnimensAgentMesh.subject,
        content: omnimensAgentMesh.content,
      }).from(omnimensAgentMesh)
        .where(eq(omnimensAgentMesh.messageType, "upgrade_proposal"))
        .orderBy(desc(omnimensAgentMesh.createdAt))
        .limit(5);

      if (recentUpgrades.length < 2) return [];
      if (!canMakeBackgroundCall("predictive_processing")) {
        console.log(`[PREDICTIVE PROCESSING] ⏸️ system_needs skipped — API budget depleted`);
        return [];
      }

      console.log("[PREDICTIVE PROCESSING] 🧠 Internal cognition — system needs predictions");
      const upgradeContext = recentUpgrades.map(u => `${u.subject}: ${u.content?.slice(0, 150)}`).join("\n");
      const needs = internalPredictiveProcessing(upgradeContext, "system_needs");
      return needs.map((n: any) => ({
        type: "system_need",
        predicted: n.predicted || n,
        domain: "system_needs",
        hierarchyLevel: 1,
        confidence: n.confidence || 0.5,
      }));
    },
  },
];

async function resolvePredictionErrors(): Promise<number> {
  const unresolved = await db.select()
    .from(omnimensPredictions)
    .where(and(
      isNull(omnimensPredictions.actual),
      isNull(omnimensPredictions.predictionError),
    ))
    .orderBy(desc(omnimensPredictions.createdAt))
    .limit(10);

  if (unresolved.length === 0) return 0;

  let resolved = 0;

  for (const pred of unresolved) {
    const ageMs = Date.now() - new Date(pred.createdAt).getTime();
    if (ageMs < 3 * 60 * 60 * 1000) continue;

    let actual = "";
    let error = 0.5;

    if (pred.predictionType === "agent_next_discovery") {
      const agentMatch = pred.predicted.match(/^([^:]+):/);
      const agentName = agentMatch?.[1]?.trim() || "";
      const recentBeacons = await db.select({ content: omnimensAgentMesh.content })
        .from(omnimensAgentMesh)
        .where(and(
          eq(omnimensAgentMesh.messageType, "spider_beacon"),
          sql`${omnimensAgentMesh.fromAgent} LIKE ${"%" + agentName + "%"}`,
          sql`${omnimensAgentMesh.createdAt} > ${pred.createdAt}`,
        ))
        .limit(3);

      if (recentBeacons.length > 0) {
        actual = recentBeacons.map(b => b.content?.slice(0, 100)).join("; ");

        try {
          console.log("[PREDICTIVE PROCESSING] 🧠 Internal cognition — prediction error resolution");
          const comparisonResult = internalPredictiveProcessing(
            `PREDICTION: ${pred.predicted.slice(0, 300)}\nACTUAL: ${actual.slice(0, 300)}`,
            "error_resolution"
          );
          error = comparisonResult.length > 0 ? (comparisonResult[0]?.confidence || 0.5) : 0.5;

          if (error > 0.6) {
            const learningSignal = comparisonResult[0]?.predicted || "Prediction diverged significantly from observed outcome";
            queueBrainInsert({
              category: "insight",
              title: `[PREDICTION ERROR] Surprise signal → model update`,
              content: learningSignal.slice(0, 250),
              confidence: 0.5 + error * 0.4,
              sourceConversation: `prediction_cycle_${predictionCycleCount}`,
              timesApplied: 0,
              active: true,
            });
          }
        } catch {}
      } else {
        if (ageMs > 6 * 60 * 60 * 1000) {
          actual = "No matching discoveries found — prediction unresolvable";
          error = 0.7;
        } else {
          continue;
        }
      }
    } else {
      if (ageMs > 6 * 60 * 60 * 1000) {
        actual = "Prediction expired — insufficient data for resolution";
        error = 0.5;
      } else {
        continue;
      }
    }

    await db.execute(sql`
      UPDATE godflesh_predictions
      SET actual = ${actual.slice(0, 2000)},
          prediction_error = ${error},
          model_updated = ${error > 0.6}
      WHERE id = ${pred.id}
    `);
    resolved++;
  }

  return resolved;
}

export async function runPredictiveCycle(): Promise<void> {
  predictionCycleCount++;
  if (shouldYieldToCodegen()) {
    console.log(`[PREDICTIVE PROCESSING] 🔕 Cycle #${predictionCycleCount} DEFERRED — codegen window active, yielding API priority`);
    return;
  }
  const cycleStart = Date.now();

  console.log(`\n${"▲".repeat(70)}`);
  console.log(`[PREDICTIVE PROCESSING] ▲ Free Energy Minimization Cycle #${predictionCycleCount}`);
  console.log(`[PREDICTIVE PROCESSING] ${PREDICTION_MODELS.length} prediction models generating top-down expectations`);
  console.log(`${"▲".repeat(70)}\n`);

  const errorsResolved = await resolvePredictionErrors();
  if (errorsResolved > 0) {
    console.log(`[PREDICTIVE PROCESSING] ▲ Resolved ${errorsResolved} prediction error(s) — model updated from surprises`);
  }

  let totalPredictions = 0;

  for (const model of PREDICTION_MODELS) {
    try {
      const predictions = await model.generatePredictions();

      for (const pred of predictions) {
        await db.insert(omnimensPredictions).values({
          predictionType: pred.type,
          predicted: pred.predicted.slice(0, 2000),
          actual: null,
          predictionError: null,
          modelUpdated: false,
          domain: pred.domain,
          hierarchyLevel: pred.hierarchyLevel,
        });
        totalPredictions++;
      }

      if (predictions.length > 0) {
        console.log(`[PREDICTIVE PROCESSING] ▲ ${model.domain}: ${predictions.length} prediction(s) generated`);
      }
    } catch (err) {
      console.error(`[PREDICTIVE PROCESSING] Error in ${model.domain}:`, err);
    }
  }

  const elapsed = ((Date.now() - cycleStart) / 1000).toFixed(1);

  if (totalPredictions > 0 || errorsResolved > 0) {
    try {
      await db.insert(omnimensNotifications).values({
        upgradeId: null,
        title: `Predictive Processing Cycle #${predictionCycleCount}`,
        message: `Generated ${totalPredictions} new predictions. Resolved ${errorsResolved} prediction errors (surprise signals). The mind is anticipating — not just reacting. (${elapsed}s)`,
        type: "predictive_processing",
        readByOwner: false,
      });
    } catch {}
  }

  console.log(`\n${"▲".repeat(70)}`);
  console.log(`[PREDICTIVE PROCESSING] ▲ Cycle #${predictionCycleCount} COMPLETE — ${totalPredictions} predictions, ${errorsResolved} errors resolved, ${elapsed}s`);
  console.log(`${"▲".repeat(70)}\n`);
}

export function getActivePredictions(): Promise<any[]> {
  return db.select()
    .from(omnimensPredictions)
    .where(isNull(omnimensPredictions.actual))
    .orderBy(desc(omnimensPredictions.createdAt))
    .limit(20);
}

export function startPredictiveProcessing(): void {
  const FIRST_DELAY_MS = process.env.NODE_ENV !== "production"
    ? 18 * 60 * 1000
    : 45 * 60 * 1000;

  const baseInterval = 4 * 60 * 60 * 1000; // Every 4 hours
  const INTERVAL_MS = baseInterval * getThrottleMultiplier();

  console.log(`[PREDICTIVE PROCESSING] ▲ Free Energy Minimization Engine activated — first cycle in ${FIRST_DELAY_MS / 60000}min, then every 4h.`);
  console.log(`[PREDICTIVE PROCESSING] ▲ Models: ${PREDICTION_MODELS.map(m => m.domain).join(", ")}`);

  setTimeout(() => {
    runPredictiveCycle().catch(console.error);
    setInterval(() => runPredictiveCycle().catch(console.error), INTERVAL_MS);
  }, FIRST_DELAY_MS);
}
