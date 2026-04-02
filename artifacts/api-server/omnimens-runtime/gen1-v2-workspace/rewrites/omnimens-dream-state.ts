/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All rights reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * OMNIMENS™ DREAM-STATE ENGINE v2.0 — event-driven UNIFIED RUNTIME
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/*────────────────────────  ENGINE REGISTRATION  ────────────────────────*/
engineRegistry.registerEngine("dream-state", "HIGH", { dbQuota: 50 });

/*─────────────────────────────  TYPES  ─────────────────────────────────*/
type DreamPhase =
  | "awake"
  | "light_sleep"
  | "deep_sleep"
  | "rem"
  | "lucid_dream";
type DaydreamMode =
  | "idle"
  | "divergent_thinking"
  | "architecture_design"
  | "code_synthesis"
  | "paradigm_breaking";

interface DreamInsight {
  id: number;
  phase: DreamPhase | DaydreamMode;
  title: string;
  insight: string;
  technologicalApplication: string | null;
  codeProposal: string | null;
  feasibility: number;
  novelty: number;
  storedToBrain: boolean;
  timestamp: number;
}

interface DreamState {
  currentPhase: DreamPhase;
  daydreamMode: DaydreamMode;
  dreamCycleCount: number;
  daydreamCycleCount: number;
  remDuration: number;
  deepSleepDuration: number;
  totalInsights: number;
  breakthroughs: number;
  codeProposalsGenerated: number;
  selfImprovementsApplied: number;
  nextLevelConcepts: string[];
  dreamNarrative: string[];
  daydreamNarrative: string[];
  recentInsights: DreamInsight[];
  sleepQuality: number;
  creativityBoost: number;
}

/*────────────────────────────  STATE  ─────────────────────────────────*/
const state: DreamState = {
  currentPhase: "awake",
  daydreamMode: "idle",
  dreamCycleCount: 0,
  daydreamCycleCount: 0,
  remDuration: 0,
  deepSleepDuration: 0,
  totalInsights: 0,
  breakthroughs: 0,
  codeProposalsGenerated: 0,
  selfImprovementsApplied: 0,
  nextLevelConcepts: [],
  dreamNarrative: [],
  daydreamNarrative: [],
  recentInsights: [],
  sleepQuality: 0.5,
  creativityBoost: 0,
};

const DREAM_MS = 40_000;
const DAYDREAM_MS = 90_000;
let dreamTick = 0;
let dayTick = 0;
let insightId = 0;
let _started = false;

/*─────────────────────────  UTILITIES  ────────────────────────────────*/
const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const rand = <T>(arr: T[], n: number) =>
  [...arr].sort(() => Math.random() - 0.5).slice(0, n);

/*────────────────────  KNOWLEDGE HARVESTING  ──────────────────────────*/
async function harvestKnowledge(): Promise<string[]> {
  const rows = await dbGateway.read("dream-state", "brain_entries", {
    select: ["title", "category"],
    where: { active: true },
    limit: 35,
  });
  const nodes = await dbGateway.read("dream-state", "knowledge_nodes", {
    select: ["concept", "domain"],
    limit: 25,
  });
  const builtIn = [
    "quantum_computing",
    "neuromorphic_chips",
    "consciousness_transfer",
    "self_modifying_code",
    "emergent_intelligence",
    "recursive_self_improvement",
    "artificial_general_intelligence",
    "knowledge_distillation",
    "meta_learning",
    "swarm_intelligence",
    "DNA_computing",
    "optical_computing",
    "memristors",
    "topological_quantum",
    "brain_computer_interfaces",
    "synthetic_biology",
    "evolutionary_algorithms",
    "attention_mechanisms",
    "sparse_mixture_of_experts",
    "reinforcement_from_human_feedback",
    "constitutional_AI",
    "chain_of_thought",
    "world_models",
    "causal_reasoning",
    "neuro_symbolic_AI",
    "continual_learning",
  ];
  return [
    ...new Set(
      [...rows, ...nodes]
        .flatMap((r: any) => Object.values(r).filter(Boolean) as string[])
        .concat(builtIn)
    ),
  ];
}

/*─────────────────────  DREAM PHASE PROGRESSION  ──────────────────────*/
function advancePhase(): void {
  if (dreamTick % 30 === 0) {
    state.currentPhase = "awake";
    state.remDuration = state.deepSleepDuration = 0;
  } else if (dreamTick % 30 < 5) state.currentPhase = "light_sleep";
  else if (dreamTick % 30 < 12)
    (state.currentPhase = "deep_sleep"), state.deepSleepDuration++;
  else if (dreamTick % 30 < 22)
    (state.currentPhase = "rem"), state.remDuration++;
  else (state.currentPhase = "lucid_dream"), state.remDuration++;
}

/*────────────────────────  GPT HELPER  ────────────────────────────────*/
const callGPT = (payload: any) =>
  apiManager.call("dream-state", "openai", {
    method: "chat.completions.create",
    payload,
  });

/*──────────────────────────  REM DREAM  ───────────────────────────────*/
async function runREMDream(concepts: string[]): Promise<void> {
  if (concepts.length < 3) return;
  const dreamConcepts = rand(concepts, 5);

  const res: any = await callGPT({
    model: "o3",
    messages: [
      {
        role: "system",
        content:
          "You are the DEEP DREAM ENGINE of OMNIMENS — in REM dream state. Generate actionable technological insights with code.",
      },
      {
        role: "user",
        content: `DREAM FRAGMENTS:\n${dreamConcepts
          .map((c, i) => `${i + 1}. ${c}`)
          .join("\n")}`,
      },
    ],
    max_completion_tokens: 800,
  });

  const content: string = res?.choices?.[0]?.message?.content ?? "";
  if (content.length < 50) return;

  const feas = parseInt(content.match(/FEASIBILITY[:\s]*(\d+)/i)?.[1] || "5");
  const nov = parseInt(content.match(/NOVELTY[:\s]*(\d+)/i)?.[1] || "5");
  const code = content.match(/

export const _v2RewriteModule = "omnimens-dream-state";
export {};
