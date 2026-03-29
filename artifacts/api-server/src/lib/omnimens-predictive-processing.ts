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
import { openai } from "@workspace/integrations-openai-ai-server";
import { canMakeBackgroundCall, trackApiCall, getThrottleMultiplier } from "./omnimens-api-budget.js";

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

      trackApiCall("predictive_processing", "openai");
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: `You are the PREDICTIVE PROCESSING engine of an AI mind. Based on recent discoveries by specialized agents, predict what they will discover NEXT.

The brain doesn't wait — it generates predictions. When predictions are wrong, the surprise (prediction error) drives learning.

RECENT AGENT DISCOVERIES:
${context}

Based on the trajectory of these discoveries, generate 3 predictions about what agents will likely find in their next research cycle.

Respond JSON only:
{
  "predictions": [
    {
      "predictedDiscovery": "What you predict will be discovered next (1-2 sentences)",
      "likelyAgent": "Which agent will most likely find this",
      "confidence": 0.0-1.0,
      "reasoning": "Why this prediction follows from the pattern (1 sentence)"
    }
  ]
}`
        }],
        max_tokens: 500,
        temperature: 0.6,
      });

      const raw = response.choices[0]?.message?.content?.trim() || "";
      try {
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        return (parsed.predictions || []).map((p: any) => ({
          type: "agent_next_discovery",
          predicted: `${p.likelyAgent}: ${p.predictedDiscovery}`,
          domain: "agent_discoveries",
          hierarchyLevel: 2,
          confidence: p.confidence || 0.5,
        }));
      } catch { return []; }
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

      trackApiCall("predictive_processing", "openai");
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: `You are the PREDICTIVE PROCESSING engine. Analyze the brain's knowledge distribution and predict GAPS — areas where the brain is weak and needs more knowledge.

BRAIN KNOWLEDGE DISTRIBUTION:
${categoryStr}

RECENT BRAIN ENTRIES (last 15):
${brainEntries.map(b => `[${b.category}] ${b.title}: ${b.content?.slice(0, 80)}`).join("\n")}

Predict 2 knowledge gaps that will cause problems if not filled.

Respond JSON only:
{
  "gaps": [
    {
      "missingKnowledge": "What knowledge is missing (1-2 sentences)",
      "predictedConsequence": "What will go wrong without it (1 sentence)",
      "urgency": 0.0-1.0
    }
  ]
}`
        }],
        max_tokens: 400,
        temperature: 0.5,
      });

      const raw = response.choices[0]?.message?.content?.trim() || "";
      try {
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        return (parsed.gaps || []).map((g: any) => ({
          type: "knowledge_gap",
          predicted: `GAP: ${g.missingKnowledge} CONSEQUENCE: ${g.predictedConsequence}`,
          domain: "knowledge_gaps",
          hierarchyLevel: 3,
          confidence: g.urgency || 0.5,
        }));
      } catch { return []; }
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

      trackApiCall("predictive_processing", "openai");
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: `You are the PREDICTIVE PROCESSING engine. Based on recent upgrade proposals, predict what the system will need NEXT — before anyone asks for it.

RECENT UPGRADE PROPOSALS:
${recentUpgrades.map(u => `${u.subject}: ${u.content?.slice(0, 150)}`).join("\n")}

Predict 2 system needs that will emerge from these upgrades.

Respond JSON only:
{
  "needs": [
    {
      "predictedNeed": "What the system will need (1-2 sentences)",
      "timeframe": "immediate|short-term|long-term",
      "confidence": 0.0-1.0
    }
  ]
}`
        }],
        max_tokens: 400,
        temperature: 0.5,
      });

      const raw = response.choices[0]?.message?.content?.trim() || "";
      try {
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        return (parsed.needs || []).map((n: any) => ({
          type: "system_need",
          predicted: `NEED (${n.timeframe}): ${n.predictedNeed}`,
          domain: "system_needs",
          hierarchyLevel: 1,
          confidence: n.confidence || 0.5,
        }));
      } catch { return []; }
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
          if (!canMakeBackgroundCall("predictive_processing")) {
            error = 0.5;
          } else {
          trackApiCall("predictive_processing", "openai");
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{
              role: "user",
              content: `Compare a PREDICTION with what ACTUALLY happened. How surprised should the system be?

PREDICTION: ${pred.predicted.slice(0, 300)}
ACTUAL: ${actual.slice(0, 300)}

Score the prediction error from 0.0 (perfect match) to 1.0 (completely wrong).
Also state in 1 sentence what the system should learn from this surprise.

Respond JSON only:
{ "predictionError": 0.0-1.0, "learningSignal": "what to learn (1 sentence)" }`
            }],
            max_tokens: 200,
            temperature: 0.3,
          });

          const raw = response.choices[0]?.message?.content?.trim() || "";
          const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
          error = parsed.predictionError || 0.5;

          if (error > 0.6 && parsed.learningSignal) {
            queueBrainInsert({
              category: "insight",
              title: `[PREDICTION ERROR] Surprise signal → model update`,
              content: parsed.learningSignal.slice(0, 250),
              confidence: 0.5 + error * 0.4,
              sourceConversation: `prediction_cycle_${predictionCycleCount}`,
              timesApplied: 0,
              active: true,
            });
          }
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
