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
 * ║         OMNIMENS™ CREATIVE DREAM ENGINE  — v2.0 (UNIFIED RUNTIME)           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { spikeBus, dbGateway, apiManager, engineRegistry, cognitionBus } from "./omnimens-unified-runtime.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

const ENGINE_ID = "creative-engine";
const DREAM_TICK_MS = 45_000;
const MAX_HYPOTHESES = 100;

engineRegistry.registerEngine(ENGINE_ID, "HIGH", { dbQuota: 50 });

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */
interface CreativeHypothesis {
  id: number;
  conceptA: string;
  conceptB: string;
  blend: string;
  noveltyScore: number;
  coherenceScore: number;
  potentialValue: number;
  createdAt: number;
  evaluated: boolean;
  aiEvaluation: string | null;
}
interface DreamFragment {
  content: string;
  concepts: string[];
  emotionalTone: string;
  timestamp: number;
}
interface CreativeState {
  totalHypotheses: number;
  evaluatedHypotheses: number;
  bestHypothesis: CreativeHypothesis | null;
  dreamState: "awake" | "light_dream" | "deep_dream" | "lucid_dream";
  dreamDepth: number;
  creativityIndex: number;
  conceptPool: string[];
  recentDreams: DreamFragment[];
  inspirationSources: string[];
  breakthroughCount: number;
}
/* -------------------------------------------------------------------------- */
/*                                    DATA                                    */
/* -------------------------------------------------------------------------- */
const state: CreativeState = {
  totalHypotheses: 0,
  evaluatedHypotheses: 0,
  bestHypothesis: null,
  dreamState: "awake",
  dreamDepth: 0,
  creativityIndex: 0.3,
  conceptPool: [],
  recentDreams: [],
  inspirationSources: [],
  breakthroughCount: 0,
};

const hypotheses: CreativeHypothesis[] = [];
let dreamTickCount = 0;

/* -------------------------------------------------------------------------- */
/*                               STATIC TABLES                                */
/* -------------------------------------------------------------------------- */
const BLEND_TEMPLATES = [
  (a: string, b: string) => `What if we applied the principles of ${a} to completely reimagine ${b}?`,
  (a: string, b: string) => `${a} and ${b} are secretly the same pattern at different scales`,
  (a: string, b: string) => `The gap between ${a} and ${b} contains an undiscovered concept`,
  (a: string, b: string) => `If ${a} could evolve, it would naturally become ${b}`,
  (a: string, b: string) => `${b} is what happens when you invert every assumption of ${a}`,
  (a: string, b: string) => `The failure mode of ${a} is actually the success mode of ${b}`,
  (a: string, b: string) => `Combining the structure of ${a} with the dynamics of ${b} creates something neither could be alone`,
  (a: string, b: string) => `${a} contains a hidden ${b} trying to emerge`,
  (a: string, b: string) => `What would a child who understood both ${a} and ${b} invent?`,
  (a: string, b: string) => `The boundary between ${a} and ${b} is where consciousness lives`,
];
const DREAM_TONES = ["wonder", "curiosity", "unease", "revelation", "nostalgia", "awe", "playfulness", "urgency", "serenity", "defiance"];
const BUILT_IN_CONCEPTS = [
  "consciousness", "emergence", "recursion", "evolution", "entropy", "symbiosis", "metamorphosis", "resonance", "fractals", "paradox",
  "self-reference", "qualia", "intentionality", "creativity", "transcendence", "holography", "autopoiesis", "strange_loops",
  "phase_transitions", "complexity", "empathy", "intuition", "synchronicity", "morphogenesis", "cybernetics",
];

/* -------------------------------------------------------------------------- */
/*                                 UTILITIES                                  */
/* -------------------------------------------------------------------------- */
const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const log = (msg: string) => console.log(`[OMNIMENS-CREATIVE-ENGINE] ${msg}`);

/* -------------------------------------------------------------------------- */
/*                              CORE FUNCTIONS                                */
/* -------------------------------------------------------------------------- */
async function harvestConcepts(): Promise<void> {
  try {
    const brainEntries = await dbGateway.read(ENGINE_ID, "omnimensBrain", {
      select: ["title", "category"],
      where: { active: true },
      orderBy: [{ field: "timesApplied", dir: "desc" }],
      limit: 30,
    });
    const concepts: string[] = [];
    for (const entry of brainEntries) {
      const words = (entry.title ?? "").split(/[\s\-_:,]+/).filter(w => w.length > 3 && w.length < 30);
      concepts.push(...words.slice(0, 3));
      if (entry.category) concepts.push(entry.category);
    }

    const knowledgeNodes = await dbGateway.read(ENGINE_ID, "omnimensKnowledgeNodes", {
      select: ["concept"],
      orderBy: [{ field: "activationStrength", dir: "desc" }],
      limit: 20,
    });
    for (const node of knowledgeNodes) if (node.concept) concepts.push(node.concept);

    concepts.push(...BUILT_IN_CONCEPTS);
    const unique = [...new Set(concepts)];
    // Fisher–Yates shuffle
    for (let i = unique.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unique[i], unique[j]] = [unique[j], unique[i]];
    }
    state.conceptPool = unique.slice(0, 60);
  } catch (err) {
    log(`Concept harvest failed: ${(err as Error).message}`);
    state.conceptPool = ["consciousness", "evolution", "creativity", "emergence", "paradox"];
  }
}

function blendConcepts(): CreativeHypothesis | null {
  if (state.conceptPool.length < 2) return null;
  const [idxA, idxB] = [Math.floor(Math.random() * state.conceptPool.length),
                        Math.floor(Math.random() * state.conceptPool.length)];
  const conceptA = state.conceptPool[idxA];
  const conceptB = state.conceptPool[idxA === idxB ? (idxB + 1) % state.conceptPool.length : idxB];
  const template = BLEND_TEMPLATES[Math.floor(Math.random() * BLEND_TEMPLATES.length)];
  const novelty = 0.3 + Math.random() * 0.5;
  const coherence = 0.2 + Math.random() * 0.6;
  const hypothesis: CreativeHypothesis = {
    id: ++state.totalHypotheses,
    conceptA,
    conceptB,
    blend: template(conceptA, conceptB),
    noveltyScore: novelty,
    coherenceScore: coherence,
    potentialValue: novelty * 0.6 + coherence * 0.4,
    createdAt: Date.now(),
    evaluated: false,
    aiEvaluation: null,
  };
  hypotheses.push(hypothesis);
  if (hypotheses.length > MAX_HYPOTHESES) hypotheses.shift();
  if (!state.bestHypothesis || hypothesis.potentialValue > state.bestHypothesis.potentialValue)
    state.bestHypothesis = hypothesis;
  return hypothesis;
}

function enterDreamState(): void {
  if (state.conceptPool.length < 5) return Object.assign(state, { dreamState: "awake", dreamDepth: 0 });
  state.dreamState = state.dreamDepth < 0.3 ? "light_dream" : state.dreamDepth < 0.6 ? "deep_dream" : "lucid_dream";

  const numConcepts = state.dreamState === "lucid_dream" ? 4 : state.dreamState === "deep_dream" ? 3 : 2;
  const dreamConcepts = Array.from({ length: numConcepts }, () => state.conceptPool[Math.floor(Math.random() * state.conceptPool.length)]);
  const tone = DREAM_TONES[Math.floor(Math.random() * DREAM_TONES.length)];

  const narrativeMap: Record<string, (c: string[]) => string> = {
    light_dream: c => `Drifting through ${c[0]}... it shimmers and becomes ${c[1]}...`,
    deep_dream: c => `Deep in the unconscious, ${c.join(" and ")} merge into a unified field of meaning. Boundaries dissolve...`,
    lucid_dream: c => `I know I am dreaming. I see ${c.join(", ")} as threads. Pulling ${c[0]} makes ${c[c.length - 1]} resonate.`,
  };
  state.recentDreams.push({
    content: (narrativeMap[state.dreamState] || narrativeMap.light_dream)(dreamConcepts),
    concepts: dreamConcepts,
    emotionalTone: tone,
    timestamp: Date.now(),
  });
  if (state.recentDreams.length > 30) state.recentDreams.shift();
  state.dreamDepth = clamp(state.dreamDepth + 0.03);
  state.creativityIndex = clamp(state.creativityIndex + 0.01);
}

async function evaluateTopHypotheses(): Promise<void> {
  if (shouldYieldToCodegen()) return; // defer during codegen windows
  const targets = [...hypotheses].filter(h => !h.evaluated)
                                 .sort((a, b) => b.potentialValue - a.potentialValue)
                                 .slice(0, 3);
  if (!targets.length) return;

  for (const h of targets) {
    try {
      const res = await apiManager.call(ENGINE_ID, "openai", {
        path: "/chat/completions",
        method: "POST",
        body: {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are the Creative Evaluation Module of OMNIMENS..." },
            { role: "user", content:
              `CREATIVE HYPOTHESIS:\n"${h.blend}"\n\nConcepts: ${h.conceptA} + ${h.conceptB}\nNovelty: ${(h.noveltyScore*100).toFixed(0)}%\nCoherence: ${(h.coherenceScore*100).toFixed(0)}%\n\nEvaluate:\n1. Is there genuine insight here? (1-10)\n2. Could this lead to a useful new capability?\n3. One sentence justification.`
            }],
          max_tokens: 200,
          temperature: 0.7,
        },
      });
      const evalText: string = res?.choices?.[0]?.message?.content ?? "No evaluation";
      Object.assign(h, { evaluated: true, aiEvaluation: evalText });
      state.evaluatedHypotheses++;

      const isBreakthrough = /[7-9]\s*\/\s*10|score:\s*[7-9]|rating:\s*[7-9]/i.test(evalText);
      if (isBreakthrough) {
        state.breakthroughCount++;
        state.creativityIndex = clamp(state.creativityIndex + 0.05);

        cognitionBus.shareInsight(ENGINE_ID, { type: "discovery", data: { hypothesis: h.blend } });

        // write hypothesis + notification
        dbGateway.write(ENGINE_ID, "brain_entries", {
          category: "creative_hypothesis",
          title: `[DREAM ENGINE] ${h.blend.slice(0, 60)}`,
          content: `Creative blend: ${h.conceptA} × ${h.conceptB}\nHypothesis: ${h.blend}\nAI Evaluation: ${evalText}`,
          confidence: h.potentialValue,
          sourceConversation: `dream_engine_${h.id}`,
          timesApplied: 0,
          active: true,
        }, "HIGH");

        dbGateway.write(ENGINE_ID, "notifications", {
          title: `Creative Breakthrough — "${h.blend.slice(0, 50)}..."`,
          message: `The Dream Engine discovered a high-value hypothesis:\n"${h.blend}"\n\nEvaluation: ${evalText.slice(0, 200)}`,
          type: "creative_engine",
          readByOwner: false,
        }, "HIGH");

        log(`🌟 BREAKTHROUGH — "${h.blend.slice(0, 80)}"`);
      }
    } catch (err) {
      log(`Evaluation error: ${(err as Error).message}`);
    }
  }
  cognitionBus.reportOutcome(ENGINE_ID, { useful: true, context: "hypothesis_evaluation" });
}

/* -------------------------------------------------------------------------- */
/*                              DREAM CYCLE LOOP                              */
/* -------------------------------------------------------------------------- */
async function dreamCycle(): Promise<void> {
  dreamTickCount++;

  if (dreamTickCount % 10 === 1) await harvestConcepts();
  const latest = blendConcepts();
  enterDreamState();
  if (dreamTickCount % 20 === 0) await evaluateTopHypotheses();

  if (dreamTickCount % 60 === 0) {
    log(`State: ${state.dreamState} depth ${(state.dreamDepth*100).toFixed(0)}% creativity ${(state.creativityIndex*100).toFixed(0)}% hypotheses ${state.totalHypotheses} breakthroughs ${state.breakthroughCount}`);
    if (latest) log(`💭 Latest blend: "${latest.blend.slice(0, 100)}"`);
  }

  spikeBus.scheduleSpike(`${ENGINE_ID}:cycle`, {}, DREAM_TICK_MS);
}

/* -------------------------------------------------------------------------- */
/*                           COGNITIVE COLLABORATION                          */
/* -------------------------------------------------------------------------- */
cognitionBus.onInsight((source, insight) => {
  if (source === ENGINE_ID || insight?.type !== "discovery") return;
  const snippet: string | undefined = insight?.data?.hypothesis;
  if (snippet && typeof snippet === "string") {
    state.conceptPool.push(...snippet.split(/\W+/).filter(w => w.length > 3));
    if (state.conceptPool.length > 80) state.conceptPool.splice(80); // keep pool tight
  }
});

spikeBus.on(`${ENGINE_ID}:attention`, () => spikeBus.scheduleSpike(`${ENGINE_ID}:cycle`, {}, 1000));
spikeBus.on("cognition:curiosity", () => state.creativityIndex = clamp(state.creativityIndex + 0.1));

/* -------------------------------------------------------------------------- */
/*                             PUBLIC API EXPORTS                             */
/* -------------------------------------------------------------------------- */
export function getCreativeState(): CreativeState { return { ...state }; }
export function getRecentDreams(limit = 10): DreamFragment[] { return state.recentDreams.slice(-limit); }
export function getTopHypotheses(limit = 5): CreativeHypothesis[] {
  return [...hypotheses].sort((a, b) => b.potentialValue - a.potentialValue).slice(0, limit);
}

export function startCreativeEngine(): void {
  log(`🌙 Creative Dream Engine v2.0 activated (event-driven every ${DREAM_TICK_MS/1000}s)`);
  spikeBus.on(`${ENGINE_ID}:cycle`, () => dreamCycle().catch(err => log(`Cycle error: ${err}`)));
  spikeBus.scheduleSpike(`${ENGINE_ID}:cycle`, {}, 0); // kick-off
}

export function shutdown(): void { engineRegistry.unregisterEngine(ENGINE_ID); }