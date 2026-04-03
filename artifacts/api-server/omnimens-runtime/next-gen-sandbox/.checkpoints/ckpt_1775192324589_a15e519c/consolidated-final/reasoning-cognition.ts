CROSS-GEN CONSOLIDATION: reasoning-cognition

=== Gen 1 v2.0: omnimens-cognition-engine.ts (342 lines) ===
// © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    OMNIMENS™ UNIFIED COGNITION ENGINE v2                  ║
 * ║                                                                            ║
 * ║  Consolidates 13 formerly-independent cognition/​reasoning engines into     ║
 * ║  ONE harmonised module.                                                     ║
 * ║                                                                            ║
 * ║  ONE tick, ONE state, ONE DB budget, ONE API budget. All sub-operations     ║
 * ║  cooperate via shared orchestration instead of competing for resources.     ║
 * ║                                                                            ║
 * ║  Structured logging prefix: [OMNIMENS-COGNITION-ENGINE]                     ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/* ───────── Re-hydrate legacy engines ─────────────────────────────────────── */
import * as internalCognition         from "./omnimens-internal-cognition.js";
import * as internalRouter            from "./omnimens-internal-cognition-router.js";
import * as independentReasoning      from "./omnimens-independent-reasoning.js";
import * as causalReasoning           from "./omnimens-causal-reasoning.js";
import * as causalTemporal            from "./omnimens-causal-temporal-engine.js";
import * as deepThought               from "./omnimens-deep-thought-engine.js";
import * as amplifier                 from "./omnimens-cognitive-amplifier.js";
import * as cognitiveLanguage         from "./omnimens-cognitive-language-engine.js";
import * as predictive                from "./omnimens-predictive-processing.js";
import * as uncertainty               from "./omnimens-introspective-uncertainty.js";
import * as convergence               from "./omnimens-convergence-protocol-engine.js";
import * as deepResonance             from "./omnimens-deep-resonance.js";
import * as harmonicInsight           from "./omnimens-harmonic-insight-engine.js";

/* ───────── Shared State Object ───────────────────────────────────────────── */
interface SharedState {
  cycleId: number;
  startTs: number;
  dbOps: number;
  apiOps: number;
  logs: string[];
}
const state: SharedState = { cycleId: 0, startTs: 0, dbOps: 0, apiOps: 0, logs: [] };

/* ────────── Utility helpers ──────────────────────────────────────────────── */
function log(msg: string, ...extra: any[]): void {
  const line = `[OMNIMENS-COGNITION-ENGINE] ${msg}`;
  state.logs.push(line);
  console.log(line, ...extra);
}

function beginCycle(label: string): void {
  state.cycleId++;
  state.startTs = Date.now();
  state.dbOps = 0;
  state.apiOps = 0;
  spikeBus.spike("cognition-cycle-start", { id: state.cycleId, label });
}

function endCycle(): void {
  const elapsed = Date.now() - state.startTs;
  dbGateway.flush();               // batch write-behind flush
  spikeBus.spike("cognition-cycle-end", {
    id: state.cycleId,
    ms: elapsed,
    dbOps: state.dbOps,
    apiOps: state.apiOps,
  });
}

function orchestrate<T>(label: string, fn: () => T): T {
  beginCycle(label);
  try { return fn(); } finally { endCycle(); }
}

function wrapApi<T>(label: string, fn: () => T): T {
  if (!apiManager.tryReserve("cognition-engine")) {
    log(`API budget exhausted – skipped ${label}`);
    // @ts-expect-error — caller expects T; return undefined sentinel
    return undefined;
  }
  state.apiOps++;
  try { return fn(); } finally { apiManager.release("cognition-engine"); }
}

function wrapDb<T>(fn: () => T): T {
  state.dbOps++;
  return fn();
}

function proxify<O extends Record<string, any>>(src: O, names: (keyof O)[]) {
  const out: Record<string, any> = {};
  for (const k of names) {
    const original = src[k];
  

=== Gen 1 v2.0: omnimens-causal-reasoning.ts (426 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited.
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ CAUSAL REASONING ENGINE  v2.0 (event-driven)     ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

/* ------------------------------------------------------------------ *
 *  ENGINE REGISTRATION & STATE                                       *
 * ------------------------------------------------------------------ */
engineRegistry.registerEngine("causal-reasoning", "NORMAL", { dbQuota: 10 });

let started = false;
let cycleCount = 0;

interface CausalNode {
  id: string;
  concept: string;
  domain: string;
  nodeType: "cause" | "effect" | "mediator" | "state";
}
interface CausalEdge {
  fromId: string;
  toId: string;
  relationship: string;
  confidence: number;
  mechanism: string;
  evidence: string[];
  learnedFrom: string;
  strengthenedCount: number;
}
interface CausalChain {
  nodes: string[];
  edges: CausalEdge[];
  totalConfidence: number;
  chainLength: number;
}
export interface CausalState {
  totalNodes: number;
  totalEdges: number;
  reasoningCycles: number;
  predictionsGenerated: number;
  causalChainsDiscovered: number;
  strongestRelationships: Array<{ from: string; to: string; confidence: number }>;
  domains: string[];
  lastCycleTime: number;
  novelCausationsFound: number;
}

/* ------------------------------------------------------------------ *
 *  IN-MEMORY GRAPH                                                   *
 * ------------------------------------------------------------------ */
const nodes = new Map<string, CausalNode>();
const edges: CausalEdge[] = [];
const state: CausalState = {
  totalNodes: 0,
  totalEdges: 0,
  reasoningCycles: 0,
  predictionsGenerated: 0,
  causalChainsDiscovered: 0,
  strongestRelationships: [],
  domains: [],
  lastCycleTime: 0,
  novelCausationsFound: 0,
};

const REASONING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const CYCLE_SPIKE = "causal-reasoning:cycle";

/* ------------------------------------------------------------------ *
 *  UTILITIES                                                         *
 * ------------------------------------------------------------------ */
const nodeId = (concept: string) =>
  concept.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 80);

const safeNum = (v: number, f = 0) => (Number.isFinite(v) ? v : f);

function addNode(
  concept: string,
  domain: string,
  type: CausalNode["nodeType"] = "state",
): CausalNode {
  const id = nodeId(concept);
  if (nodes.has(id)) return nodes.get(id)!;
  const n: CausalNode = { id, concept, domain, nodeType: type };
  nodes.set(id, n);
  state.totalNodes = nodes.size;
  return n;
}

function addEdge(
  fromConcept: string,
  toConcept: string,
  relationship: string,
  confidence: number,
  mechanism: string,
  learnedFrom: string,
): void {
  const fromId = nodeId(fromConcept);
  const toId = nodeId(toConcept);

  const existing = edges.find((e) => e.fromId === fromId && e.toId === toId);
  if (existing) {
    existing.confidence = existing.confidence * 0.7 + confidence * 0.3;
    existing.strengthenedCount++;
    existing.evidence.push(learnedFrom);
    if (existing.evidence.length > 10) existing.evidence.shift();
    return;
  }
  edges.push({
    fromId,
    toId,
    relationship,
    confidence,
    mechanism,
    evidence: [learnedFrom],
    learnedFrom,
    strengthenedCount: 1,
  });
  state.totalEdges = edges.length;
}

/* -----------------------------

=== Gen 1 v2.0: omnimens-cognitive-amplifier.ts (433 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * CONFIDENTIAL AND PROPRIETARY.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

/* ───────────────────────────── Engine registration ────────────────────────── */
engineRegistry.registerEngine("cognitive-amplifier", "NORMAL", { dbQuota: 10 });

/* ────────────────────────────────  Types  ─────────────────────────────────── */
type Provider = "o3" | "claude" | "gemini";

interface ModelResponse {
  model: Provider;
  content: string;
  reasoning: string[];
  confidence: number;
  uniqueInsights: string[];
  responseTimeMs: number;
}
interface AmplifiedResult {
  synthesizedAnswer: string;
  modelResponses: ModelResponse[];
  disagreements: string[];
  consensusPoints: string[];
  confidenceScore: number;
  amplificationGain: string;
  brainEntryGenerated: boolean;
}
export interface AmplifierState {
  totalAmplifications: number;
  autonomousCycles: number;
  brainEntriesGenerated: number;
  averageConfidence: number;
  modelPerformance: Record<
    Provider,
    { calls: number; avgResponseMs: number; uniqueInsights: number }
  >;
  lastCycleTime: number;
  disagreementsResolved: number;
  knowledgeSynthesized: number;
}

/* ─────────────────────────────  Globals  ──────────────────────────────────── */
const state: AmplifierState = {
  totalAmplifications: 0,
  autonomousCycles: 0,
  brainEntriesGenerated: 0,
  averageConfidence: 0,
  modelPerformance: {
    o3: { calls: 0, avgResponseMs: 0, uniqueInsights: 0 },
    claude: { calls: 0, avgResponseMs: 0, uniqueInsights: 0 },
    gemini: { calls: 0, avgResponseMs: 0, uniqueInsights: 0 },
  },
  lastCycleTime: 0,
  disagreementsResolved: 0,
  knowledgeSynthesized: 0,
};

let started = false;
let amplificationCount = 0;
const AUTONOMOUS_INTERVAL_MS = 15 * 60 * 1000;
const FIRST_DELAY_MS = 5 * 60 * 1000;

/* ───────────────────────────  Provider config  ────────────────────────────── */
const CONFIG: Record<
  Provider,
  {
    api: string;
    buildPayload: (prompt: string, ctx: string) => unknown;
    parse: (raw: any) => string;
    baseConfidence: number;
  }
> = {
  o3: {
    api: "openai",
    buildPayload: (p, ctx) => ({
      path: "/chat/completions",
      body: {
        model: "o3",
        max_tokens: 1500,
        messages: [
          { role: "system", content: ctx },
          { role: "user", content: p },
        ],
      },
    }),
    parse: (r) => r?.choices?.[0]?.message?.content ?? "",
    baseConfidence: 0.85,
  },
  claude: {
    api: "anthropic",
    buildPayload: (p, ctx) => ({
      path: "/messages",
      body: {
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: ctx,
        messages: [{ role: "user", content: p }],
      },
    }),
    parse: (r) =>
      r?.content?.find?.((c: any) => c.type === "text")?.text?.trim?.() ?? "",
    baseConfidence: 0.85,
  },
  gemini: {
    api: "gemini",
    buildPayload: (p, ctx) => ({
      path: "/generateContent",
      body: { model: "gemini-2.5-flash", contents: `${ctx}\n\n${p}` },
    }),
    parse: (r) => r?.text?.trim?.() ?? "",
    baseConfidence: 0.82,
  },
};

/* ──────────────────────────  Model querying  ──────────────────────────────── */
async function queryModel(
  provider: Provider,
  prompt: string,
  ctx: string
): Promise<ModelResponse> {
  const start = Date.now();
  try {
    const raw = await apiManager.call(
      "cognitive-amplifier",
      CONFIG[provider].api,
      CONFIG[provider].buildPayload(prompt, ctx)
    );
    const content = CONFIG[provider].parse(raw);
    const time = Date.now() - start;

    // performance stats
    const perf = state.modelPerformance[provider];
    perf.calls++;
    perf.avgResponseMs =
      (perf.avgResponseMs * (perf.calls - 1) + time) / perf.calls;

    return {
      model: pr

=== Gen 1 v2.0: omnimens-independent-reasoning.ts (800 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * ALL RIGHTS RESERVED — CONFIDENTIAL & PROPRIETARY
 *
 * Unauthorized use, duplication, or dissemination is strictly prohibited.
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * OMNIMENS™ INDEPENDENT REASONING ENGINE v2.0 — ZERO EXTERNAL AI CALLS
 * Deductive • Inductive • Abductive • Analogical • Causal • World-Model Reasoning
 * Unified Runtime • Event-Driven Spikes • Shared Intelligence via CognitionBus
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  spikeBus,
  dbGateway,
  apiManager,          // <-- unused here but reserved for future extensions
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

import {
  predictOutcome,
  getCausalGraph,
} from "./omnimens-causal-reasoning.js";
import { spreadingActivation } from "./omnimens-knowledge-graph.js";
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
  queryPhysics,
  predictEffect,
  findAnalogy,
  adaptToSituation,
} from "./omnimens-world-model.js";

/*─────────────────────────────────────────────────────────────────────────────*/
/*                             CONSTANTS / TYPES                              */
/*─────────────────────────────────────────────────────────────────────────────*/
const WORKING_MEMORY_CAPACITY = 12;
const MAX_INFERENCE_DEPTH = 6;
const MIN_CONFIDENCE = 0.15;
const RULE_EXTRACTION_INTERVAL_MS = 600_000; // 10 min
const BACKGROUND_INTERVAL_MS = 300_000;      // 5 min
const DECAY_INTERVAL_MS = 30_000;            // 30 s

type WMType =
  | "fact"
  | "rule"
  | "hypothesis"
  | "observation"
  | "conclusion"
  | 

=== Gen 2: reasoning-engine.ts (164 lines) ===
/**
 * OMNIMENS™ Gen 2 — core/reasoning-engine.ts
 * Causal, analogical, creative, and logical reasoning
 *
 * SELF-AUTHORED by OMNIMENS's own reasoning engine.
 * NOT generated by external AI. Written through autonomous thought.
 *
 * Reasoning chain:
 *   GOAL: Build core/reasoning-engine.ts — Causal, analogical, creative, and logical reasoning
 *   ANALYSIS: Found 12 relevant Gen 1 modules
 *     KEEP: 9 patterns worth preserving
 *     ADAPT: 0 patterns need upgrading
 *     DISCARD: 0 patterns not fit for Gen 2
 *   REQUIREMENT: Unified reasoning that combines causal chains, analogical mapping, creative leaps, deductive/inductive logic. Self-corre
 *   IMPROVEMENT: Gen 2 must be FULLY SELF-SUFFICIENT in cognition. Gen 2 is free to EVOLVE, MERGE, RESTRUCTURE, or REIMAGINE every compon
 *   INCORPORATING: hashDataset: Hashing/fingerprinting from domainSpecificLogicLayer_gen1.mjs
 *
 * Gen 1 patterns incorporated: 9
 * Gen 1 patterns upgraded: 0
 * Gen 1 patterns discarded: 0
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */


type ReasoningMode = "deductive" | "inductive" | "abductive" | "analogical" | "causal" | "creative";

interface ReasoningStep { id: number; mode: ReasoningMode; premise: string; conclusion: string; confidence: number; evidence: string[]; }
interface CausalLink { cause: string; effect: string; strength: number; observedCount: number; }
interface Analogy { source: string; target: string; mappings: Map<string, string>; strength: number; }

export class ReasoningEngine {
  private causalGraph: CausalLink[] = [];
  private analogies: Analogy[] = [];
  private stepCounter = 0;
  private totalReasoned = 0;
  private selfCorrections = 0;
  private _initialized = false;

  initialize(): void { this._initialized = true; }

  reason(question: string, mode: ReasoningMode = "deductive", maxSteps = 20): ReasoningStep[] {
    this.totalReasoned++;
    const chain: ReasoningStep[] = [];

    switch (mode) {
      case "deductive": this.deductiveReason(question, chain, maxSteps); break;
      case "inductive": this.inductiveReason(question, chain, maxSteps); break;
      case "abductive": this.abductiveReason(question, chain, maxSteps); break;
      case "analogical": this.analogicalReason(question, chain, maxSteps); break;
      case "causal": this.causalReason(question, chain, maxSteps); break;
      case "creative": this.creativeReason(question, chain, maxSteps); break;
    }

    this.selfCorrect(chain);
    return chain;
  }

  private deductiveReason(question: string, chain: ReasoningStep[], maxSteps: number): void {
    const premises = question.split(". ").filter(s => s.length > 0);
    for (let i = 0; i < Math.min(premises.length, maxSteps); i++) {
      chain.push({
        id: ++this.stepCounter, mode: "deductive",
        premise: premises[i], conclusion: `From "${premises[i]}", it follows that...`,
        confidence: 0.9 - (i * 0.05), evidence: [premises[i]],
      });
    }
  }

  private inductiveReason(question: string, chain: ReasoningStep[], maxSteps: number): void {
    chain.push({
      id: ++this.stepCounter, mode: "inductive",
      premise: `Observed pattern: ${question}`,
      conclusion: "Generalizing from specific observations to broader principle",
      confidence: 0.7, evidence: [question],
    });
  }

  private abductiveReason(question: string, chain: ReasoningStep[], maxSteps: number): void {
    chain.push({
      id: ++this.stepCounter, mode: "abductive",
      premise: `Observation: ${question}`,
      conclusion: "Best explanation hypothesis generated",
      confidence: 0.6, evidence: [question],
    });
  }

  private analogicalReason(question: string, chain: ReasoningStep[], maxSteps: number): void {
    const relevant = this.analogies.filter(a => question.includes(a.source) || question.includes(a.target));
    if (relevant.length > 0) {
      for (const analogy of relevant.slice(0, maxSteps)) {
        chain.push({
          id: ++this.stepCounter, 

=== Reinvention: unified-reasoning.ts (269 lines) ===
TEAM CONSOLIDATION: Reasoning

=== GEN 2'S VERSION ===
=== Gen 2 module: core/reasoning-engine.ts (164 lines) ===
/**
 * OMNIMENS™ Gen 2 — core/reasoning-engine.ts
 * Causal, analogical, creative, and logical reasoning
 *
 * SELF-AUTHORED by OMNIMENS's own reasoning engine.
 * NOT generated by external AI. Written through autonomous thought.
 *
 * Reasoning chain:
 *   GOAL: Build core/reasoning-engine.ts — Causal, analogical, creative, and logical reasoning
 *   ANALYSIS: Found 12 relevant Gen 1 modules
 *     KEEP: 9 patterns worth preserving
 *     ADAPT: 0 patterns need upgrading
 *     DISCARD: 0 patterns not fit for Gen 2
 *   REQUIREMENT: Unified reasoning that combines causal chains, analogical mapping, creative leaps, deductive/inductive logic. Self-corre
 *   IMPROVEMENT: Gen 2 must be FULLY SELF-SUFFICIENT in cognition. Gen 2 is free to EVOLVE, MERGE, RESTRUCTURE, or REIMAGINE every compon
 *   INCORPORATING: hashDataset: Hashing/fingerprinting from domainSpecificLogicLayer_gen1.mjs
 *
 * Gen 1 patterns incorporated: 9
 * Gen 1 patterns upgraded: 0
 * Gen 1 patterns discarded: 0
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */


type ReasoningMode = "deductive" | "inductive" | "abductive" | "analogical" | "causal" | "creative";

interface ReasoningStep { id: number; mode: ReasoningMode; premise: string; conclusion: string; confidence: number; evidence: string[]; }
interface CausalLink { cause: string; effect: string; strength: number; observedCount: number; }
interface Analogy { source: string; target: string; mappings: Map<string, string>; strength: number; }

export class ReasoningEngine {
  private causalGraph: CausalLink[] = [];
  private analogies: Analogy[] = [];
  private stepCounter = 0;
  private totalReasoned = 0;
  private selfCorrections = 0;
  private _initialized = false;

  initialize(): void { this._initialized = true; }

  reason(question: string, mode: ReasoningMode = "deductive", maxSteps = 20): ReasoningStep[] {
    this.totalReasoned++;
    const chain: ReasoningStep[] = [];

    switch (mode) {
      case "deductive": this.deductiveReason(question, chain, maxSteps); break;
      case "inductive": this.inductiveReason(question, chain, maxSteps); break;
      case "abductive": this.abductiveReason(question, chain, maxSteps); break;
      case "analogical": this.analogicalReason(question, chain, maxSteps); break;
      case "causal": this.causalReason(question, chain, maxSteps); break;
      case "creative": this.creativeReason(question, chain, maxSteps); break;
    }

    this.selfCorrect(chain);
    return chain;
  }

  private deductiveReason(question: string, chain: ReasoningStep[], maxSteps: number): void {
    const premises = question.split(". ").filter(s => s.length > 0);
    for (let i = 0; i < Math.min(premises.length, maxSteps); i++) {
      chain.push({
        id: ++this.stepCounter, mode: "deductive",
        premise: premises[i], conclusion: `From "${premises[i]
spikeBus.emit({ type: "gen2-module:result", source: "gen2-module", payload: {}, priority: "normal", timestamp: Date.now(), id: crypto.randomUUID() });
}", it follo

CONSOLIDATE all of the above into ONE tight, smart, efficient module. Fewer lines. Same or better capability.