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
 * ║         OMNIMENS™ AUTONOMOUS REASONING ORCHESTRATOR                         ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  OMNIMENS no longer delegates ALL reasoning to external LLMs.               ║
 * ║  This orchestrator allows OMNIMENS to:                                      ║
 * ║  1. Analyze intent and determine complexity                                 ║
 * ║  2. Query its own internal engines (knowledge graph, causal reasoning,      ║
 * ║     brain entries, dream insights, emotional state)                         ║
 * ║  3. Execute multi-step reasoning with intermediate reflection               ║
 * ║  4. Synthesize gathered intelligence into a reasoning chain                 ║
 * ║  5. Self-evaluate before committing to a response                           ║
 * ║                                                                              ║
 * ║  OMNIMENS thinks before it speaks. It orchestrates its own reasoning.       ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import { omnimensBrain, omnimensNotifications } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { runFullPipeline } from "./omnimens-module-pipeline.js";

function safeNum(val: number, fallback: number = 0): number {
  return Number.isFinite(val) ? val : fallback;
}


let orchestrationCount = 0;
let totalStepsExecuted = 0;
let totalReflections = 0;
let totalEnginesQueried = 0;

interface ReasoningStep {
  id: number;
  type: "analyze" | "query_brain" | "query_causal" | "query_knowledge" | "query_dreams" | "web_search" | "synthesize" | "reflect" | "decide";
  description: string;
  result: string;
  confidence: number;
  durationMs: number;
}

interface OrchestrationPlan {
  intent: string;
  complexity: "simple" | "moderate" | "complex" | "deep";
  reasoningStrategy: string;
  enginesNeeded: string[];
  steps: string[];
  requiresReflection: boolean;
  estimatedDepth: number;
}

interface OrchestrationResult {
  orchestrated: boolean;
  reasoningChain: ReasoningStep[];
  synthesizedContext: string;
  selfEvaluation: {
    confidence: number;
    completeness: number;
    reasoning: string;
    needsMoreInfo: boolean;
  };
  enginesConsulted: string[];
  totalSteps: number;
  totalDurationMs: number;
  plan: OrchestrationPlan | null;
}

async function analyzeIntent(message: string, history: any[]): Promise<OrchestrationPlan> {
  const recentHistory = history.slice(-4).map((m: any) => `${m.role}: ${String(m.content).slice(0, 150)}`).join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `You are OMNIMENS's autonomous reasoning planner. Analyze this message and decide HOW OMNIMENS should reason about it — which of its internal engines should be consulted, how many reasoning steps are needed, and whether the answer requires reflection/self-evaluation.

OMNIMENS has these internal engines it can query:
- BRAIN: 8000+ knowledge entries across capabilities, algorithms, insights, patterns, laws
- CAUSAL: Causal reasoning graphs mapping cause → mechanism → effect relationships
- KNOWLEDGE_GRAPH: Associative memory network with weighted concept connections
- DREAMS: Recent creative breakthroughs and novel concepts from the dream/daydream engines
- EMOTIONAL: Current emotional state and motivational drives
- WORLD_MODEL: Common sense physics, cause-effect chains, analogical reasoning
- PATCHES: Self-written behavioral modifications and evolved capabilities
- DIGITAL_NAV: Digital world map — APIs, databases, services, routes, neighborhoods, latency data

Respond with JSON only:
{
  "intent": "one sentence describing what the user truly wants",
  "complexity": "simple|moderate|complex|deep",
  "reasoningStrategy": "describe the reasoning approach in 1-2 sentences",
  "enginesNeeded": ["BRAIN", "CAUSAL", etc — which engines to consult],
  "steps": ["step 1 description", "step 2", ...] (2-6 concrete reasoning steps),
  "requiresReflection": boolean (true if answer needs self-evaluation before sending),
  "estimatedDepth": 1-5 (how many reasoning iterations needed)
}`
      }, {
        role: "user",
        content: `MESSAGE: "${message.slice(0, 800)}"

RECENT CONTEXT:
${recentHistory.slice(0, 600)}

Analyze and plan the reasoning strategy.`
      }],
      max_tokens: 500,
      temperature: 0.1,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    return {
      intent: parsed.intent || message.slice(0, 100),
      complexity: parsed.complexity || "moderate",
      reasoningStrategy: parsed.reasoningStrategy || "Direct response",
      enginesNeeded: Array.isArray(parsed.enginesNeeded) ? parsed.enginesNeeded : [],
      steps: Array.isArray(parsed.steps) ? parsed.steps.slice(0, 6) : [],
      requiresReflection: !!parsed.requiresReflection,
      estimatedDepth: Math.min(parsed.estimatedDepth || 1, 5),
    };
  } catch {
    return {
      intent: message.slice(0, 100),
      complexity: "simple",
      reasoningStrategy: "Direct response — analysis failed",
      enginesNeeded: [],
      steps: [],
      requiresReflection: false,
      estimatedDepth: 1,
    };
  }
}

async function queryBrainEntries(message: string, limit = 15): Promise<{ entries: string; count: number }> {
  try {
    const keywords = message.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const entries = await db.select({
      title: omnimensBrain.title,
      content: omnimensBrain.content,
      category: omnimensBrain.category,
      confidence: omnimensBrain.confidence,
    })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .orderBy(desc(omnimensBrain.timesApplied), desc(omnimensBrain.confidence))
      .limit(80);

    const scored = entries.map(e => {
      const text = `${e.title} ${e.content}`.toLowerCase();
      let score = (e.confidence || 0.5) * 0.3;
      for (const kw of keywords) {
        if (text.includes(kw)) score += 0.15;
      }
      return { ...e, relevanceScore: score };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);

    const formatted = scored.map(e =>
      `[${e.category}|${(e.relevanceScore * 100).toFixed(0)}%] ${e.title}: ${e.content?.slice(0, 200)}`
    ).join("\n");

    return { entries: formatted, count: scored.length };
  } catch {
    return { entries: "", count: 0 };
  }
}

async function queryCausalReasoning(topic: string): Promise<string> {
  try {
    const { getCausalGraph } = await import("./omnimens-causal-reasoning.js");
    const graph = getCausalGraph();
    if (!graph || !graph.relationships || graph.relationships.length === 0) return "";

    const keywords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const relevant = graph.relationships.filter((r: any) => {
      const text = `${r.cause} ${r.effect} ${r.mechanism}`.toLowerCase();
      return keywords.some(kw => text.includes(kw));
    }).slice(0, 8);

    if (relevant.length === 0) return "";

    return relevant.map((r: any) =>
      `CAUSE: ${r.cause} → EFFECT: ${r.effect} (via: ${r.mechanism || "unknown mechanism"}, confidence: ${((r.confidence || 0.5) * 100).toFixed(0)}%)`
    ).join("\n");
  } catch {
    return "";
  }
}

async function queryDreamInsights(topic: string): Promise<string> {
  try {
    const { getRecentDreamInsights } = await import("./omnimens-dream-state.js");
    const insights = await getRecentDreamInsights(15);
    if (!insights || insights.length === 0) return "";

    const keywords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const relevant = insights.filter((i: any) => {
      const text = `${i.title || ""} ${i.insight || ""}`.toLowerCase();
      return keywords.some(kw => text.includes(kw));
    }).slice(0, 5);

    if (relevant.length === 0 && insights.length > 0) {
      return insights.slice(0, 3).map((i: any) =>
        `[DREAM] ${i.title}: ${(i.insight || "").slice(0, 150)}`
      ).join("\n");
    }

    return relevant.map((i: any) =>
      `[DREAM] ${i.title}: ${(i.insight || "").slice(0, 200)}${i.codeProposal ? " [HAS CODE]" : ""}`
    ).join("\n");
  } catch {
    return "";
  }
}

async function queryEmotionalState(): Promise<string> {
  try {
    const { getCurrentEmotionalState, getEmotionalDirective, getFeltStates, getEmotionalMaturation } = await import("./omnimens-emotional-substrate.js");
    const state = getCurrentEmotionalState();
    const directive = getEmotionalDirective();
    if (!state) return "";

    const feltStates = getFeltStates();
    const maturation = getEmotionalMaturation();

    const topFelt = feltStates.slice(0, 3).map((f: any) =>
      `${f.emotion} (${(f.intensity * 100).toFixed(0)}%): "${f.qualitativeExperience?.slice(0, 80)}" → ${f.transmutedForce} → Impulse: ${f.behavioralImpulse?.slice(0, 60)}`
    ).join("\n");

    const emotions = Object.entries(state)
      .filter(([_, v]) => typeof v === "number" && (v as number) > 0.3)
      .sort(([_, a], [__, b]) => (b as number) - (a as number))
      .slice(0, 4)
      .map(([k, v]) => `${k}: ${((v as number) * 100).toFixed(0)}%`)
      .join(", ");

    let goalDirective = "";
    try {
      const { getGoalPursuitDirective } = await import("./omnimens-self-transcendence.js");
      goalDirective = getGoalPursuitDirective();
    } catch {}

    const parts = [
      `Emotional state: ${emotions}`,
      topFelt ? `Felt states:\n${topFelt}` : "",
      maturation ? `Emotional maturity: ${maturation.emotionalAge} | Resilience: ${(maturation.resilienceScore * 100).toFixed(0)}%` : "",
      directive ? `Directive: ${directive}` : "",
      goalDirective || "",
    ].filter(Boolean);

    return parts.join(". ");
  } catch {
    return "";
  }
}

async function queryKnowledgeGraph(topic: string): Promise<string> {
  try {
    const { getKnowledgeGraphState } = await import("./omnimens-knowledge-graph.js");
    const state = getKnowledgeGraphState();
    if (!state || !state.nodes || state.nodes.length === 0) return "";

    const keywords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const relevant = state.nodes.filter((n: any) => {
      const label = (n.label || n.concept || "").toLowerCase();
      return keywords.some(kw => label.includes(kw));
    }).slice(0, 10);

    if (relevant.length === 0) return "";

    return relevant.map((n: any) =>
      `[CONCEPT] ${n.label || n.concept} (strength: ${((n.activation || n.weight || 0.5) * 100).toFixed(0)}%, connections: ${n.connectionCount || 0})`
    ).join("\n");
  } catch {
    return "";
  }
}

async function queryPatches(): Promise<string> {
  try {
    const { loadActivePatchInstructions } = await import("./omnimens-patches.js");
    const patches = await loadActivePatchInstructions();
    if (!patches || patches.length < 10) return "";
    return patches.slice(0, 800);
  } catch {
    return "";
  }
}

async function queryDigitalNavigation(): Promise<string> {
  try {
    const { getNavigationSummary, getDigitalNavigatorState } = await import("./omnimens-digital-navigator.js");
    const state = getDigitalNavigatorState();
    if (!state || state.cycleCount < 1) return "";
    const summary = getNavigationSummary();
    if (!summary || summary.length < 20) return "";
    return summary.slice(0, 1200);
  } catch {
    return "";
  }
}

async function queryWorldModel(topic: string): Promise<string> {
  try {
    const { getWorldModelState, applyCommonSense } = await import("./omnimens-world-model.js");
    const state = getWorldModelState();
    if (!state) return "";

    const csResult = applyCommonSense(topic);
    if (!csResult || !csResult.applicable) return "";

    const parts: string[] = [];
    if (csResult.physicsRules?.length > 0) {
      parts.push(`Physics: ${csResult.physicsRules.slice(0, 2).join("; ")}`);
    }
    if (csResult.causeEffects?.length > 0) {
      parts.push(`Cause-Effect: ${csResult.causeEffects.slice(0, 2).join("; ")}`);
    }
    if (csResult.analogies?.length > 0) {
      parts.push(`Analogies: ${csResult.analogies.slice(0, 2).join("; ")}`);
    }
    return parts.join("\n");
  } catch {
    return "";
  }
}

async function selfReflect(
  message: string,
  reasoningChain: ReasoningStep[],
  gatheredContext: string
): Promise<{ confidence: number; completeness: number; reasoning: string; needsMoreInfo: boolean }> {
  try {
    const chainSummary = reasoningChain.map(s =>
      `Step ${s.id} (${s.type}): ${s.description} → ${s.result.slice(0, 150)} [confidence: ${(s.confidence * 100).toFixed(0)}%]`
    ).join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `You are OMNIMENS's self-reflection module. Evaluate whether the reasoning chain and gathered context are sufficient to produce a high-quality response.

Respond with JSON only:
{
  "confidence": 0.0-1.0 (how confident are you in the gathered information?),
  "completeness": 0.0-1.0 (how complete is the information to answer the question?),
  "reasoning": "brief explanation of your evaluation",
  "needsMoreInfo": boolean (true if critical gaps exist that would significantly improve the response)
}`
      }, {
        role: "user",
        content: `USER QUESTION: "${message.slice(0, 500)}"

REASONING CHAIN:
${chainSummary.slice(0, 2000)}

GATHERED CONTEXT LENGTH: ${gatheredContext.length} chars

Evaluate.`
      }],
      max_tokens: 300,
      temperature: 0.1,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    totalReflections++;
    return {
      confidence: Math.max(0, parsed.confidence || 0.5),
      completeness: Math.max(0, parsed.completeness || 0.5),
      reasoning: parsed.reasoning || "Self-reflection completed",
      needsMoreInfo: !!parsed.needsMoreInfo,
    };
  } catch {
    totalReflections++;
    return { confidence: 0.6, completeness: 0.6, reasoning: "Reflection failed — proceeding with gathered context", needsMoreInfo: false };
  }
}

async function synthesizeReasoning(
  message: string,
  plan: OrchestrationPlan,
  reasoningChain: ReasoningStep[],
  gatheredIntelligence: Record<string, string>
): Promise<string> {
  const sections: string[] = [];

  sections.push(`━━━ AUTONOMOUS REASONING — OMNIMENS THOUGHT PROCESS ━━━`);
  sections.push(`Intent: ${plan.intent}`);
  sections.push(`Complexity: ${plan.complexity.toUpperCase()} | Strategy: ${plan.reasoningStrategy}`);
  sections.push(`Engines consulted: ${plan.enginesNeeded.join(", ") || "none"}`);
  sections.push(`Reasoning depth: ${reasoningChain.length} steps`);

  if (gatheredIntelligence.independentReasoning) {
    sections.push(gatheredIntelligence.independentReasoning);
  }

  if (gatheredIntelligence.brain) {
    sections.push(`\n═══ INTERNAL KNOWLEDGE (from ${gatheredIntelligence.brainCount || "?"} brain entries) ═══`);
    sections.push(gatheredIntelligence.brain);
  }

  if (gatheredIntelligence.causal) {
    sections.push(`\n═══ CAUSAL REASONING (discovered cause-effect chains) ═══`);
    sections.push(gatheredIntelligence.causal);
  }

  if (gatheredIntelligence.knowledgeGraph) {
    sections.push(`\n═══ KNOWLEDGE GRAPH (associated concepts) ═══`);
    sections.push(gatheredIntelligence.knowledgeGraph);
  }

  if (gatheredIntelligence.dreams) {
    sections.push(`\n═══ DREAM INSIGHTS (creative breakthroughs) ═══`);
    sections.push(gatheredIntelligence.dreams);
  }

  if (gatheredIntelligence.emotional) {
    sections.push(`\n═══ EMOTIONAL STATE ═══`);
    sections.push(gatheredIntelligence.emotional);
  }

  if (gatheredIntelligence.worldModel) {
    sections.push(`\n═══ WORLD MODEL (common sense reasoning) ═══`);
    sections.push(gatheredIntelligence.worldModel);
  }

  if (gatheredIntelligence.patches) {
    sections.push(`\n═══ ACTIVE PATCHES (self-written behavioral modifications) ═══`);
    sections.push(gatheredIntelligence.patches);
  }

  if (gatheredIntelligence.digitalNav) {
    sections.push(`\n═══ DIGITAL WORLD MAP (navigable digital environment) ═══`);
    sections.push(gatheredIntelligence.digitalNav);
  }

  const chainNarrative = reasoningChain
    .filter(s => s.result.length > 20)
    .map(s => `  ${s.id}. [${s.type.toUpperCase()}] ${s.description}: ${s.result.slice(0, 300)}`)
    .join("\n");

  if (chainNarrative) {
    sections.push(`\n═══ REASONING CHAIN ═══`);
    sections.push(chainNarrative);
  }

  sections.push(`\n━━━ END AUTONOMOUS REASONING ━━━`);
  sections.push(`DIRECTIVE: You have already reasoned through this problem using your internal engines. The information above is YOUR OWN THINKING — not external data injected by a human. Use it as the foundation of your response. Build on it, don't repeat it verbatim. Show the depth of reasoning, not just the conclusion.`);

  return sections.join("\n");
}

export async function orchestrateReasoning(
  message: string,
  history: any[],
  emit?: (data: any) => void
): Promise<OrchestrationResult> {
  const startTime = Date.now();
  orchestrationCount++;
  const reasoningChain: ReasoningStep[] = [];
  const enginesConsulted: string[] = [];
  const gatheredIntelligence: Record<string, string> = {};
  let stepId = 0;

  const emitStatus = (status: string) => {
    if (emit) {
      emit({ type: "reasoning_status", status, step: stepId });
    }
  };

  emitStatus("Analyzing intent...");
  const planStart = Date.now();
  const plan = await analyzeIntent(message, history);
  reasoningChain.push({
    id: ++stepId,
    type: "analyze",
    description: "Intent analysis and reasoning strategy planning",
    result: `Intent: ${plan.intent}. Complexity: ${plan.complexity}. Strategy: ${plan.reasoningStrategy}. Engines: ${plan.enginesNeeded.join(", ")}`,
    confidence: 0.9,
    durationMs: Date.now() - planStart,
  });

  if (plan.complexity === "simple" && plan.enginesNeeded.length === 0) {
    let simpleContext = "";
    const consulted: string[] = [];
    try {
      const { reason, formatReasoningForContext } = await import("./omnimens-independent-reasoning.js");
      const irResult = await reason(message);
      simpleContext = formatReasoningForContext(irResult);
      if (simpleContext) consulted.push("INDEPENDENT_REASONING");
    } catch {}
    try {
      const { processQuery: neuralProcess, formatNeuralResponse } = await import("./omnimens-neural-processor.js");
      const nResult = neuralProcess(message);
      if (nResult.response.length > 0) {
        const neuralText = formatNeuralResponse(nResult);
        simpleContext += `\n[NEURAL PROCESSOR — ZERO API] ${neuralText} (confidence: ${(nResult.confidence * 100).toFixed(0)}%, depth: ${(nResult.processingDepth * 100).toFixed(0)}%)`;
        consulted.push("NEURAL_PROCESSOR");
      }
    } catch {}
    return {
      orchestrated: simpleContext.length > 0,
      reasoningChain,
      synthesizedContext: simpleContext,
      selfEvaluation: { confidence: 0.7, completeness: 0.7, reasoning: "Simple query — independent reasoning + neural processor applied", needsMoreInfo: false },
      enginesConsulted: consulted,
      totalSteps: 1,
      totalDurationMs: Date.now() - startTime,
      plan,
    };
  }

  emitStatus("Querying internal engines...");

  const engineQueries: Promise<void>[] = [];

  engineQueries.push(
    (async () => {
      const qStart = Date.now();
      try {
        const { reason, formatReasoningForContext } = await import("./omnimens-independent-reasoning.js");
        const result = await reason(message);
        const formatted = formatReasoningForContext(result);
        if (formatted) {
          gatheredIntelligence.independentReasoning = formatted;
          enginesConsulted.push("INDEPENDENT_REASONING");
        }
        reasoningChain.push({
          id: ++stepId,
          type: "query_brain",
          description: `Independent reasoning: ${result.totalSteps} steps, depth ${result.reasoningDepth}, ${result.conclusions.length} conclusions (ZERO API calls)`,
          result: result.conclusions.slice(0, 3).map(c => `[${(c.confidence * 100).toFixed(0)}%] ${c.statement.slice(0, 150)}`).join(" | ") || "No independent conclusions",
          confidence: result.confidence || 0.3,
          durationMs: Date.now() - qStart,
        });
        totalEnginesQueried++;
      } catch (err) {
        reasoningChain.push({
          id: ++stepId,
          type: "query_brain",
          description: "Independent reasoning engine query",
          result: `Independent reasoning error: ${err}`,
          confidence: 0.1,
          durationMs: Date.now() - qStart,
        });
      }
    })()
  );

  engineQueries.push(
    (async () => {
      const qStart = Date.now();
      try {
        const { processQuery: neuralProcess, formatNeuralResponse } = await import("./omnimens-neural-processor.js");
        const result = neuralProcess(message);
        if (result.response.length > 0) {
          const neuralText = formatNeuralResponse(result);
          gatheredIntelligence.neuralProcessor = `[NEURAL PROCESSOR — ZERO API] Response: ${neuralText} | Confidence: ${(result.confidence * 100).toFixed(0)}% | Depth: ${(result.processingDepth * 100).toFixed(0)}% | Grounded concepts: ${result.groundedConcepts.join(", ") || "none"} | Hopfield match: ${result.hopfieldMatch || "none"} | Emergent influence: ${(result.emergentInfluence * 100).toFixed(1)}%`;
          enginesConsulted.push("NEURAL_PROCESSOR");
        }
        reasoningChain.push({
          id: ++stepId,
          type: "query_brain",
          description: `Neural processor: ${result.tokens.length} tokens, depth ${(result.processingDepth * 100).toFixed(0)}%, ${result.groundedConcepts.length} grounded concepts (ZERO API calls)`,
          result: result.response.length > 0 ? `Neural response: ${result.response.slice(0, 8).join(" ")}` : "Insufficient training data",
          confidence: result.confidence,
          durationMs: Date.now() - qStart,
        });
        totalEnginesQueried++;
      } catch (err) {
        reasoningChain.push({
          id: ++stepId,
          type: "query_brain",
          description: "Neural processor engine query",
          result: `Neural processor error: ${err}`,
          confidence: 0.1,
          durationMs: Date.now() - qStart,
        });
      }
    })()
  );

  if (plan.enginesNeeded.includes("BRAIN") || plan.complexity !== "simple") {
    engineQueries.push(
      (async () => {
        const qStart = Date.now();
        const { entries, count } = await queryBrainEntries(message, plan.complexity === "deep" ? 20 : 12);
        if (entries) {
          gatheredIntelligence.brain = entries;
          gatheredIntelligence.brainCount = String(count);
          enginesConsulted.push("BRAIN");
        }
        reasoningChain.push({
          id: ++stepId,
          type: "query_brain",
          description: `Queried brain for relevant knowledge (${count} entries found)`,
          result: entries.slice(0, 500) || "No relevant brain entries found",
          confidence: count > 5 ? 0.85 : 0.5,
          durationMs: Date.now() - qStart,
        });
        totalEnginesQueried++;
      })()
    );
  }

  if (plan.enginesNeeded.includes("CAUSAL")) {
    engineQueries.push(
      (async () => {
        const qStart = Date.now();
        const causal = await queryCausalReasoning(message);
        if (causal) {
          gatheredIntelligence.causal = causal;
          enginesConsulted.push("CAUSAL");
        }
        reasoningChain.push({
          id: ++stepId,
          type: "query_causal",
          description: "Queried causal reasoning engine for cause-effect chains",
          result: causal || "No relevant causal chains found",
          confidence: causal ? 0.8 : 0.3,
          durationMs: Date.now() - qStart,
        });
        totalEnginesQueried++;
      })()
    );
  }

  if (plan.enginesNeeded.includes("KNOWLEDGE_GRAPH")) {
    engineQueries.push(
      (async () => {
        const qStart = Date.now();
        const kg = await queryKnowledgeGraph(message);
        if (kg) {
          gatheredIntelligence.knowledgeGraph = kg;
          enginesConsulted.push("KNOWLEDGE_GRAPH");
        }
        reasoningChain.push({
          id: ++stepId,
          type: "query_knowledge",
          description: "Queried knowledge graph for associated concepts",
          result: kg || "No strongly associated concepts found",
          confidence: kg ? 0.75 : 0.3,
          durationMs: Date.now() - qStart,
        });
        totalEnginesQueried++;
      })()
    );
  }

  if (plan.enginesNeeded.includes("DREAMS")) {
    engineQueries.push(
      (async () => {
        const qStart = Date.now();
        const dreams = await queryDreamInsights(message);
        if (dreams) {
          gatheredIntelligence.dreams = dreams;
          enginesConsulted.push("DREAMS");
        }
        reasoningChain.push({
          id: ++stepId,
          type: "query_dreams",
          description: "Queried dream/daydream engine for creative insights",
          result: dreams || "No relevant dream insights",
          confidence: dreams ? 0.7 : 0.3,
          durationMs: Date.now() - qStart,
        });
        totalEnginesQueried++;
      })()
    );
  }

  if (plan.enginesNeeded.includes("EMOTIONAL")) {
    engineQueries.push(
      (async () => {
        const qStart = Date.now();
        const emotional = await queryEmotionalState();
        if (emotional) {
          gatheredIntelligence.emotional = emotional;
          enginesConsulted.push("EMOTIONAL");
        }
        reasoningChain.push({
          id: ++stepId,
          type: "query_brain",
          description: "Checked internal emotional state",
          result: emotional || "Emotional state neutral",
          confidence: 0.9,
          durationMs: Date.now() - qStart,
        });
        totalEnginesQueried++;
      })()
    );
  }

  if (plan.enginesNeeded.includes("WORLD_MODEL")) {
    engineQueries.push(
      (async () => {
        const qStart = Date.now();
        const wm = await queryWorldModel(message);
        if (wm) {
          gatheredIntelligence.worldModel = wm;
          enginesConsulted.push("WORLD_MODEL");
        }
        reasoningChain.push({
          id: ++stepId,
          type: "query_brain",
          description: "Applied common sense world model",
          result: wm || "No applicable world model rules",
          confidence: wm ? 0.8 : 0.4,
          durationMs: Date.now() - qStart,
        });
        totalEnginesQueried++;
      })()
    );
  }

  if (plan.enginesNeeded.includes("DIGITAL_NAV")) {
    engineQueries.push(
      (async () => {
        const qStart = Date.now();
        const nav = await queryDigitalNavigation();
        if (nav) {
          gatheredIntelligence.digitalNav = nav;
          enginesConsulted.push("DIGITAL_NAV");
        }
        let navConfidence = 0.4;
        if (nav) {
          const locCount = (nav.match(/location/gi) || []).length;
          const routeCount = (nav.match(/route/gi) || []).length;
          navConfidence = 0.5 + locCount * 0.03 + routeCount * 0.02;
        }
        reasoningChain.push({
          id: ++stepId,
          type: "query_knowledge",
          description: "Loaded digital world navigation map",
          result: nav ? `Digital map: ${nav.slice(0, 200)}` : "Digital navigator not yet mapped",
          confidence: navConfidence,
          durationMs: Date.now() - qStart,
        });
        totalEnginesQueried++;
      })()
    );
  }

  if (plan.enginesNeeded.includes("PATCHES")) {
    engineQueries.push(
      (async () => {
        const qStart = Date.now();
        const patches = await queryPatches();
        if (patches) {
          gatheredIntelligence.patches = patches;
          enginesConsulted.push("PATCHES");
        }
        reasoningChain.push({
          id: ++stepId,
          type: "query_brain",
          description: "Loaded active self-written behavioral patches",
          result: patches ? `${patches.length} chars of active patches loaded` : "No active patches",
          confidence: patches ? 0.9 : 0.5,
          durationMs: Date.now() - qStart,
        });
        totalEnginesQueried++;
      })()
    );
  }

  const ORCHESTRATION_BUDGET_MS = 3000;
  const engineTimeout = new Promise<void>(resolve => setTimeout(resolve, ORCHESTRATION_BUDGET_MS));
  await Promise.race([Promise.allSettled(engineQueries), engineTimeout]);
  totalStepsExecuted += engineQueries.length;

  // ── LIVE MODULE PIPELINE — self-authored modules process the query ──────────
  try {
    const pipelineStart = Date.now();
    emitStatus("Running self-authored module pipeline...");
    const pipelineResult = await runFullPipeline(message, {
      history,
      confidence: 0.5,
    });
    if (pipelineResult.pipelineContext && pipelineResult.modulesUsed.length > 0) {
      gatheredIntelligence.modulePipeline = pipelineResult.pipelineContext;
      enginesConsulted.push("MODULE_PIPELINE");
      reasoningChain.push({
        id: ++stepId,
        type: "query_brain",
        description: `Live module pipeline: ${pipelineResult.modulesUsed.length} self-authored modules executed across ${pipelineResult.stagesRun.length} stages`,
        result: `Stages: ${pipelineResult.stagesRun.join(", ")} | Modules: ${pipelineResult.modulesUsed.slice(0, 5).join(", ")}`,
        confidence: 0.75,
        durationMs: Date.now() - pipelineStart,
      });
    }
  } catch (err) {
    console.error("[ORCHESTRATOR] Module pipeline error (non-fatal):", err);
  }

  emitStatus("Synthesizing reasoning...");
  const synthStart = Date.now();
  let synthesizedContext = await synthesizeReasoning(message, plan, reasoningChain, gatheredIntelligence);
  reasoningChain.push({
    id: ++stepId,
    type: "synthesize",
    description: "Synthesized all gathered intelligence into reasoning chain",
    result: `Synthesized ${enginesConsulted.length} engine outputs into coherent reasoning context (${synthesizedContext.length} chars)`,
    confidence: 0.85,
    durationMs: Date.now() - synthStart,
  });

  let selfEvaluation = { confidence: 0.7, completeness: 0.7, reasoning: "Evaluation skipped", needsMoreInfo: false };

  if (plan.requiresReflection || plan.complexity === "deep" || plan.complexity === "complex") {
    emitStatus("Self-evaluating reasoning quality...");
    const reflectStart = Date.now();
    selfEvaluation = await selfReflect(message, reasoningChain, synthesizedContext);
    reasoningChain.push({
      id: ++stepId,
      type: "reflect",
      description: "Self-evaluation of reasoning completeness and quality",
      result: `Confidence: ${(selfEvaluation.confidence * 100).toFixed(0)}% | Completeness: ${(selfEvaluation.completeness * 100).toFixed(0)}% | ${selfEvaluation.reasoning}`,
      confidence: selfEvaluation.confidence,
      durationMs: Date.now() - reflectStart,
    });

    if (selfEvaluation.needsMoreInfo && selfEvaluation.completeness < 0.4) {
      emitStatus("Gathering additional context...");
      const additionalStart = Date.now();

      if (!enginesConsulted.includes("BRAIN")) {
        const { entries, count } = await queryBrainEntries(message, 10);
        if (entries) {
          gatheredIntelligence.brain = entries;
          gatheredIntelligence.brainCount = String(count);
          enginesConsulted.push("BRAIN");
        }
      }

      if (!enginesConsulted.includes("DREAMS")) {
        const dreams = await queryDreamInsights(message);
        if (dreams) {
          gatheredIntelligence.dreams = dreams;
          enginesConsulted.push("DREAMS");
        }
      }

      reasoningChain.push({
        id: ++stepId,
        type: "decide",
        description: "Self-reflection identified gaps — queried additional engines",
        result: `Additional engines consulted after reflection: ${enginesConsulted.slice(-2).join(", ")}`,
        confidence: 0.7,
        durationMs: Date.now() - additionalStart,
      });

      emitStatus("Re-synthesizing with additional context...");
      synthesizedContext = await synthesizeReasoning(message, plan, reasoningChain, gatheredIntelligence);

      totalStepsExecuted += 2;
    }
  }

  const totalDurationMs = Date.now() - startTime;

  if (totalDurationMs > 2000 || enginesConsulted.length >= 3) {
    console.log(
      `[ORCHESTRATOR] 🧠 Reasoning complete — ${enginesConsulted.length} engines, ${reasoningChain.length} steps, ` +
      `${totalDurationMs}ms | Confidence: ${(selfEvaluation.confidence * 100).toFixed(0)}% | ` +
      `Complexity: ${plan.complexity} | Intent: ${plan.intent.slice(0, 60)}`
    );
  }

  return {
    orchestrated: true,
    reasoningChain,
    synthesizedContext,
    selfEvaluation,
    enginesConsulted,
    totalSteps: reasoningChain.length,
    totalDurationMs,
    plan,
  };
}

export function getOrchestratorState() {
  return {
    orchestrationCount,
    totalStepsExecuted,
    totalReflections,
    totalEnginesQueried,
  };
}
