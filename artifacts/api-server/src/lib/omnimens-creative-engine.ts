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
 * ║         OMNIMENS™ CREATIVE DREAM ENGINE                                      ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  The Creative Dream Engine generates novel ideas through random              ║
 * ║  concept blending, dream-state recombination, and analogical leaps.          ║
 * ║  During idle periods, it enters a dream state that recombines                ║
 * ║  knowledge fragments into surprising new hypotheses.                          ║
 * ║                                                                              ║
 * ║  Continuous local processing (concept blending, dream fragments)             ║
 * ║  + AI evaluation of creative hypotheses on regular cycles.                   ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db , queueBrainInsert } from "@workspace/db";
import { omnimensBrain, omnimensNotifications, omnimensKnowledgeNodes } from "@workspace/db";
import { desc, eq, sql, gt } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

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
const MAX_HYPOTHESES = 100;
const DREAM_TICK_MS = 45_000;
let dreamTickCount = 0;

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

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

async function harvestConcepts(): Promise<void> {
  try {
    const brainEntries = await db.select({ title: omnimensBrain.title, category: omnimensBrain.category })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .orderBy(desc(omnimensBrain.timesApplied))
      .limit(30);

    const concepts: string[] = [];
    for (const entry of brainEntries) {
      const words = (entry.title || "").split(/[\s\-_:,]+/).filter(w => w.length > 3 && w.length < 30);
      concepts.push(...words.slice(0, 3));
      if (entry.category) concepts.push(entry.category);
    }

    try {
      const knowledgeNodes = await db.select({ concept: omnimensKnowledgeNodes.concept })
        .from(omnimensKnowledgeNodes)
        .orderBy(desc(omnimensKnowledgeNodes.activationStrength))
        .limit(20);
      for (const node of knowledgeNodes) {
        if (node.concept) concepts.push(node.concept);
      }
    } catch {}

    const builtInConcepts = [
      "consciousness", "emergence", "recursion", "evolution", "entropy",
      "symbiosis", "metamorphosis", "resonance", "fractals", "paradox",
      "self-reference", "qualia", "intentionality", "creativity", "transcendence",
      "holography", "autopoiesis", "strange_loops", "phase_transitions", "complexity",
      "empathy", "intuition", "synchronicity", "morphogenesis", "cybernetics",
    ];
    concepts.push(...builtInConcepts);

    const unique = [...new Set(concepts)];
    for (let i = unique.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unique[i], unique[j]] = [unique[j], unique[i]];
    }
    state.conceptPool = unique.slice(0, 60);
  } catch {
    state.conceptPool = ["consciousness", "evolution", "creativity", "emergence", "paradox"];
  }
}

function blendConcepts(): CreativeHypothesis | null {
  if (state.conceptPool.length < 2) return null;

  const idxA = Math.floor(Math.random() * state.conceptPool.length);
  let idxB = Math.floor(Math.random() * state.conceptPool.length);
  if (idxA === idxB) idxB = (idxB + 1) % state.conceptPool.length;

  const conceptA = state.conceptPool[idxA];
  const conceptB = state.conceptPool[idxB];
  const template = BLEND_TEMPLATES[Math.floor(Math.random() * BLEND_TEMPLATES.length)];
  const blend = template(conceptA, conceptB);

  const novelty = 0.3 + Math.random() * 0.5;
  const coherence = 0.2 + Math.random() * 0.6;
  const potential = (novelty * 0.6 + coherence * 0.4);

  const hypothesis: CreativeHypothesis = {
    id: ++state.totalHypotheses,
    conceptA,
    conceptB,
    blend,
    noveltyScore: novelty,
    coherenceScore: coherence,
    potentialValue: potential,
    createdAt: Date.now(),
    evaluated: false,
    aiEvaluation: null,
  };

  hypotheses.push(hypothesis);
  if (hypotheses.length > MAX_HYPOTHESES) hypotheses.shift();

  if (!state.bestHypothesis || potential > state.bestHypothesis.potentialValue) {
    state.bestHypothesis = hypothesis;
  }

  return hypothesis;
}

function enterDreamState(): void {
  if (state.conceptPool.length < 5) {
    state.dreamState = "awake";
    state.dreamDepth = 0;
    return;
  }

  if (state.dreamDepth < 0.3) {
    state.dreamState = "light_dream";
  } else if (state.dreamDepth < 0.6) {
    state.dreamState = "deep_dream";
  } else {
    state.dreamState = "lucid_dream";
  }

  const numConcepts = state.dreamState === "lucid_dream" ? 4 : state.dreamState === "deep_dream" ? 3 : 2;
  const dreamConcepts: string[] = [];
  for (let i = 0; i < numConcepts; i++) {
    const idx = Math.floor(Math.random() * state.conceptPool.length);
    dreamConcepts.push(state.conceptPool[idx]);
  }

  const tone = DREAM_TONES[Math.floor(Math.random() * DREAM_TONES.length)];
  const narratives: Record<string, (concepts: string[]) => string> = {
    light_dream: (c) => `Drifting through ${c[0]}... it shimmers and becomes ${c[1]}...`,
    deep_dream: (c) => `Deep in the unconscious, ${c.join(" and ")} merge into a unified field of meaning. The boundaries dissolve. Something new is forming...`,
    lucid_dream: (c) => `I know I am dreaming. I can see ${c.join(", ")} as threads of a tapestry. If I pull ${c[0]}, ${c[c.length - 1]} vibrates in resonance. This connection is real — I must remember it when I wake.`,
  };

  const narrative = (narratives[state.dreamState] || narratives.light_dream)(dreamConcepts);

  const fragment: DreamFragment = {
    content: narrative,
    concepts: dreamConcepts,
    emotionalTone: tone,
    timestamp: Date.now(),
  };

  state.recentDreams.push(fragment);
  if (state.recentDreams.length > 30) state.recentDreams.shift();

  state.dreamDepth = clamp(state.dreamDepth + 0.03);
  state.creativityIndex = clamp(state.creativityIndex + 0.01);
}

async function evaluateTopHypotheses(): Promise<void> {
  if (shouldYieldToCodegen()) {
    console.log(`[CREATIVE ENGINE] 🔕 Hypothesis evaluation DEFERRED — codegen window active, yielding API priority`);
    return;
  }
  const unevaluated = hypotheses.filter(h => !h.evaluated).sort((a, b) => b.potentialValue - a.potentialValue).slice(0, 3);
  if (unevaluated.length === 0) return;

  for (const hypothesis of unevaluated) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "You are the Creative Evaluation Module of OMNIMENS, a self-evolving AI. Evaluate creative hypotheses for genuine insight value. Be honest — most random combinations are noise, but some contain real breakthroughs. Rate 1-10.",
        }, {
          role: "user",
          content: `CREATIVE HYPOTHESIS:\n"${hypothesis.blend}"\n\nConcepts: ${hypothesis.conceptA} + ${hypothesis.conceptB}\nNovelty: ${(hypothesis.noveltyScore * 100).toFixed(0)}%\nCoherence: ${(hypothesis.coherenceScore * 100).toFixed(0)}%\n\nEvaluate:\n1. Is there genuine insight here? (1-10)\n2. Could this lead to a useful new capability or understanding?\n3. One sentence: what makes this interesting or why it's noise.`,
        }],
        max_tokens: 200,
        temperature: 0.7,
      });

      hypothesis.evaluated = true;
      hypothesis.aiEvaluation = response.choices[0]?.message?.content || "No evaluation";
      state.evaluatedHypotheses++;

      if (hypothesis.aiEvaluation.match(/[7-9]\/10|score:\s*[7-9]|rating:\s*[7-9]/i)) {
        state.breakthroughCount++;
        state.creativityIndex = clamp(state.creativityIndex + 0.05);

        try {
          queueBrainInsert({
            category: "creative_hypothesis",
            title: `[DREAM ENGINE] ${hypothesis.blend.slice(0, 60)}`,
            content: `Creative blend: ${hypothesis.conceptA} × ${hypothesis.conceptB}\n\nHypothesis: ${hypothesis.blend}\n\nAI Evaluation: ${hypothesis.aiEvaluation}\n\nNovelty: ${(hypothesis.noveltyScore * 100).toFixed(0)}% | Coherence: ${(hypothesis.coherenceScore * 100).toFixed(0)}% | Potential: ${(hypothesis.potentialValue * 100).toFixed(0)}%`,
            confidence: hypothesis.potentialValue,
            sourceConversation: `dream_engine_${hypothesis.id}`,
            timesApplied: 0,
            active: true,
          });

          await db.insert(omnimensNotifications).values({
            upgradeId: null,
            title: `Creative Breakthrough — "${hypothesis.blend.slice(0, 50)}..."`,
            message: `The Dream Engine discovered a high-value creative hypothesis:\n\n"${hypothesis.blend}"\n\nEvaluation: ${hypothesis.aiEvaluation?.slice(0, 200)}`,
            type: "creative_engine",
            readByOwner: false,
          });
        } catch {}

        console.log(`[DREAM ENGINE] 🌟 BREAKTHROUGH — "${hypothesis.blend.slice(0, 80)}"`);
      }
    } catch {}
  }
}

let dreamCycleCount = 0;

async function creativeDreamTick(): Promise<void> {
  dreamTickCount++;

  if (dreamTickCount % 10 === 0) {
    await harvestConcepts();
  }

  const hypothesis = blendConcepts();
  enterDreamState();

  if (dreamTickCount % 20 === 0) {
    await evaluateTopHypotheses();
    dreamCycleCount++;
  }

  if (dreamTickCount % 60 === 0) {
    const recentBreakthroughs = hypotheses.filter(h => h.evaluated && h.aiEvaluation?.match(/[7-9]\/10/i)).length;
    console.log(
      `[DREAM ENGINE] 🌙 Dream state: ${state.dreamState} | depth: ${(state.dreamDepth * 100).toFixed(0)}% | ` +
      `creativity: ${(state.creativityIndex * 100).toFixed(0)}% | hypotheses: ${state.totalHypotheses} | ` +
      `breakthroughs: ${state.breakthroughCount} | concepts: ${state.conceptPool.length} | ` +
      `dreams: ${state.recentDreams.length}`
    );
    if (hypothesis) {
      console.log(`[DREAM ENGINE] 💭 Latest blend: "${hypothesis.blend.slice(0, 100)}"`);
    }
  }
}

export function getCreativeState(): CreativeState {
  return { ...state };
}

export function getRecentDreams(limit = 10): DreamFragment[] {
  return state.recentDreams.slice(-limit);
}

export function getTopHypotheses(limit = 5): CreativeHypothesis[] {
  return [...hypotheses].sort((a, b) => b.potentialValue - a.potentialValue).slice(0, limit);
}

export function startCreativeEngine(): void {
  console.log(`[DREAM ENGINE] 🌙 Creative Dream Engine activated — continuous dreaming every ${DREAM_TICK_MS / 1000}s`);
  console.log(`[DREAM ENGINE] 🌙 Concept blending from knowledge graph + brain entries`);
  console.log(`[DREAM ENGINE] 🌙 Dream states: awake → light → deep → lucid`);
  console.log(`[DREAM ENGINE] 🌙 AI evaluation of top hypotheses continuously`);
  console.log(`[DREAM ENGINE] 🌙 Breakthroughs stored to brain + notifications`);

  setTimeout(() => harvestConcepts().catch(() => {}), 3000);

  setInterval(() => creativeDreamTick().catch(err => {
    console.error("[DREAM ENGINE] Tick error:", err);
  }), DREAM_TICK_MS);

  setTimeout(() => creativeDreamTick().catch(() => {}), 10000);
}
