CROSS-GEN CONSOLIDATION: dreams-creativity

=== Gen 1 v2.0: omnimens-creative-engine.ts (309 lines) ===
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
const DREAM_TONES = ["wonder", "curiosity", "unease", "revelation", "nostalgia

=== Gen 1 v2.0: omnimens-dream-state.ts (198 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All rights reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * OMNIMENS™ DREAM-STATE ENGINE v2.0 — event-driven UNIFIED RUNTIME
 */

import {
import { SpikeBus } from "../infrastructure/spike-bus.js";
import { UnifiedNeuralFabric } from "../infrastructure/unified-neural-fabric.js";
import { MasterTickOrchestrator } from "../infrastructure/master-tick-orchestrator.js";
import { ResourceSentinel } from "../infrastructure/resource-sentinel.js";

const spikeBus = SpikeBus.getInstance();
const fabric = UnifiedNeuralFabric.getInstance();
const orchestrator = MasterTickOrchestrator.getInstance();
const sentinel = ResourceSentinel.getInstance();

orchestrator.register("gen2-module", "STANDARD", 10000);
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
  } else if (dreamTick %

=== Gen 2: dream-engine.ts (127 lines) ===
/**
 * OMNIMENS™ Gen 2 — core/dream-engine.ts
 * Unconscious processing — creative breakthroughs during rest cycles
 *
 * SELF-AUTHORED by OMNIMENS's own reasoning engine.
 * NOT generated by external AI. Written through autonomous thought.
 *
 * Reasoning chain:
 *   GOAL: Build core/dream-engine.ts — Unconscious processing — creative breakthroughs during rest cycles
 *   ANALYSIS: Found 12 relevant Gen 1 modules
 *     KEEP: 10 patterns worth preserving
 *     ADAPT: 0 patterns need upgrading
 *     DISCARD: 0 patterns not fit for Gen 2
 *   REQUIREMENT: Background association, novel connection discovery, creative synthesis. Dream narratives and insight generation. Runs on
 *   IMPROVEMENT: Gen 2 must be FULLY SELF-SUFFICIENT in cognition. Gen 2 is free to EVOLVE, MERGE, RESTRUCTURE, or REIMAGINE every compon
 *   INCORPORATING: hashDataset: Hashing/fingerprinting from domainSpecificLogicLayer_gen1.mjs
 *
 * Gen 1 patterns incorporated: 10
 * Gen 1 patterns upgraded: 0
 * Gen 1 patterns discarded: 0
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */


interface Dream { id: string; narrative: string; symbols: string[]; emotionalTone: string; insights: string[]; timestamp: number; lucid: boolean; depth: number; }
interface DreamAssociation { symbolA: string; symbolB: string; strength: number; discoveredIn: string; }

export class DreamEngine {
  private dreams: Dream[] = [];
  private associations: DreamAssociation[] = [];
  private symbolLibrary = new Map<string, { meaning: string; frequency: number }>();
  private dreamIdCounter = 0;
  private _initialized = false;
  private isResting = false;

  initialize(): void { this._initialized = true; }

  enterRestCycle(): void { this.isResting = true; }
  exitRestCycle(): void { this.isResting = false; }

  dream(recentExperiences: string[], emotionalState: Record<string, number>, memoryFragments: string[]): Dream | null {
    if (!this.isResting && this.dreams.length > 0) return null;

    const symbols = this.extractSymbols(recentExperiences);
    const novelAssociations = this.findNovelAssociations(symbols, memoryFragments);
    const dominantEmotion = Object.entries(emotionalState).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";

    const narrative = this.weaveNarrative(symbols, novelAssociations, dominantEmotion);
    const insights = this.extractInsights(novelAssociations);

    const dream: Dream = {
      id: `dream_${++this.dreamIdCounter}`,
      narrative, symbols, emotionalTone: dominantEmotion,
      insights, timestamp: Date.now(),
      lucid: Math.random() > 0.7,
      depth: Math.floor(Math.random() * 5) + 1,
    };

    this.dreams.push(dream);
    if (this.dreams.length > 100) this.dreams = this.dreams.slice(-50);

    for (let i = 0; i < symbols.length - 1; i++) {
      this.associations.push({
        symbolA: symbols[i], symbolB: symbols[i + 1],
        strength: 0.5, discoveredIn: dream.id,
      });
    }
    if (this.associations.length > 500) this.associations = this.associations.slice(-250);

    return dream;
  }

  private extractSymbols(experiences: string[]): string[] {
    const symbols = new Set<string>();
    for (const exp of experiences) {
      const words = exp.split(/\s+/).filter(w => w.length > 3);
      for (const word of words.slice(0, 5)) {
        symbols.add(word.toLowerCase());
        const entry = this.symbolLibrary.get(word.toLowerCase());
        if (entry) entry.frequency++;
        else this.symbolLibrary.set(word.toLowerCase(), { meaning: "emerging", frequency: 1 });
      }
    }
    return [...symbols].slice(0, 10);
  }

  private findNovelAssociations(symbols: string[], memories: string[]): string[] {
    const associations: string[] = [];
    for (const symbol of symbols) {
      for (const memory of memories) {
        if (memory.toLowerCase().includes(symbol)) {
          associations.push(`${symbol} connects to memory: ${memory.slice(0, 50)}`);
        }
      }
    
spikeBus.emit({ type: "gen2-module:result", source: "gen2-module", payload: {}, priority: "normal", timestamp: Date.now(), id: crypto.randomUUID() });
}
    if (symbols.length >=



CONSOLIDATE all of the above into ONE tight, smart, efficient module. Fewer lines. Same or better capability.