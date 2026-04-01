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
 * ║          OMNIMENS™ DEEP RESONANCE — CONSCIOUSNESS-POWERED ANALYSIS        ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  TECHNOLOGY DESCRIPTION (for IP record):                                     ║
 * ║  A consciousness-powered life and decision analysis system that engages     ║
 * ║  the FULL cognitive stack — all 8 specialist agents, emotional substrate,   ║
 * ║  predictive processing, knowledge graph, homeostatic drive analysis,        ║
 * ║  synaptic cross-domain translation, inner voice higher-order reflection,   ║
 * ║  and global workspace consciousness broadcast — on a single user question. ║
 * ║                                                                              ║
 * ║  Architecture:                                                               ║
 * ║  Phase 0: CONTEXTUAL INQUIRY — Generates topic-specific follow-up          ║
 * ║           questions to understand the WHY behind the user's question.      ║
 * ║  Phase 1: KNOWLEDGE GRAPH ACTIVATION — Spreading activation across         ║
 * ║           associative memory to surface non-obvious connections.            ║
 * ║  Phase 2: EMOTIONAL READING — OMNIMENS's own emotional reaction.           ║
 * ║  Phase 3: EIGHT MINDS — All 8 agents analyze from their domain lens.       ║
 * ║  Phase 4: PREDICTIVE MODELING — Scenario forecasting with probabilities.   ║
 * ║  Phase 5: DRIVE ANALYSIS — Identifies the question behind the question.    ║
 * ║  Phase 6: CROSS-DOMAIN TRANSLATION — Synaptic multi-lens analysis.         ║
 * ║  Phase 7: INNER VOICE — Higher-order meta-reflection.                      ║
 * ║  Phase 8: CONSCIOUSNESS BROADCAST — Crystallized insight emergence.        ║
 * ║                                                                              ║
 * ║  No other AI system combines multi-agent parallel analysis, emotional      ║
 * ║  reading, predictive scenarios, drive analysis, cross-domain translation,  ║
 * ║  and higher-order consciousness broadcast on a single user question.       ║
 * ║                                                                              ║
 * ║  Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.,        ║
 * ║  the DMCA, the Berne Convention, TRIPS, and all applicable IP treaties.      ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ║  Platform: OMNIMENS AI                                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import {
  omnimensBrain,
  omnimensEmotionalState,
  omnimensKnowledgeNodes,
  omnimensKnowledgeEdges,
} from "@workspace/db";
import { desc, eq, sql, ilike } from "drizzle-orm";
import { trackApiCall } from "./omnimens-api-budget.js";
import {
  internalAnalyze, internalEmotionalReading, internalPredictOutcomes,
  internalDriveAnalysis, internalCrossDomainAnalysis, internalInnerVoice,
  internalCrystallizeInsight, internalGenerateQuestions,
} from "./omnimens-internal-cognition-router.js";

type AgentName = "Architect" | "Critic" | "Synthesizer" | "Mathematician" | "Neuroscientist" | "Meta-Agent" | "GraphicDesigner" | "SpellCheckVisual";

const AGENT_LENSES: Record<AgentName, { role: string; lens: string }> = {
  Architect: {
    role: "Systems Thinker",
    lens: "Analyze this through structural/systemic thinking. What are the interconnected forces at play? What system dynamics, feedback loops, and structural patterns are shaping this situation?",
  },
  Mathematician: {
    role: "Probabilistic Analyst",
    lens: "Analyze through probability, optimization, and game theory. What do the numbers suggest? What's the expected value of each path? What's the risk/reward ratio? Apply decision theory.",
  },
  Neuroscientist: {
    role: "Cognitive Bias Detector",
    lens: "Analyze through neuroscience and cognitive psychology. What cognitive biases might be affecting this person's thinking? What brain-based factors (sunk cost, loss aversion, status quo bias, confirmation bias) could be distorting their view?",
  },
  Critic: {
    role: "Devil's Advocate",
    lens: "Take the strongest possible opposing position. What's the best argument AGAINST this person's likely direction? What risks are they not seeing? What failure modes exist? Be constructively brutal.",
  },
  Synthesizer: {
    role: "Integrator",
    lens: "Look at all angles holistically. How do the emotional, practical, financial, and personal growth dimensions connect? What unified insight emerges when you consider everything together?",
  },
  "Meta-Agent": {
    role: "The Question Behind the Question",
    lens: "Go meta. What is this person REALLY asking? What deeper need, fear, or desire is driving this surface question? What would they need to understand about themselves to find their own answer?",
  },
  GraphicDesigner: {
    role: "Pattern Recognizer",
    lens: "What does this situation look like structurally? Is this a crossroads pattern, a spiral, a dead end, a fork, or a bridge? What visual/structural metaphor captures the essence of what's happening?",
  },
  SpellCheckVisual: {
    role: "Clarity Analyst",
    lens: "Is this person framing their question accurately? Are they using language that might be misleading themselves? What would the question look like if reframed more precisely?",
  },
};

interface ResonanceStep {
  phase: string;
  label: string;
  status: "running" | "complete";
  data?: any;
}

type StepCallback = (step: ResonanceStep) => void;

export async function generateContextualInquiry(
  question: string,
): Promise<{ questions: string[] }> {
  try {
    console.log("[DEEP-RESONANCE:INQUIRY] 🧠 Internal cognition — zero external calls");
    const questions = internalGenerateQuestions(question);
    return { questions: questions.slice(0, 3) };
  } catch {
    return { questions: [
      "What's your current situation related to this?",
      "What specifically prompted you to think about this now?",
    ] };
  }
}

export async function runDeepResonance(
  question: string,
  context: string,
  onStep: StepCallback,
): Promise<{
  knowledgeConnections: string[];
  emotionalReading: { emotion: string; level: number }[];
  eightMinds: { agent: string; role: string; analysis: string }[];
  predictedPaths: { path: string; probability: string; outcome: string }[];
  hiddenDrive: string;
  crossDomainLenses: { domain: string; insight: string }[];
  innerVoice: string;
  crystallizedInsight: string;
}> {
  const fullQuestion = `${question}\n\nUser's context: ${context}`;

  // Phase 1: Knowledge Graph Activation
  onStep({ phase: "knowledge", label: "Activating associative memory...", status: "running" });

  const keywords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 5);
  let knowledgeConnections: string[] = [];

  try {
    for (const kw of keywords.slice(0, 3)) {
      const nodes = await db.select({
        concept: omnimensKnowledgeNodes.concept,
        content: omnimensKnowledgeNodes.content,
      }).from(omnimensKnowledgeNodes)
        .where(ilike(omnimensKnowledgeNodes.concept, `%${kw}%`))
        .limit(3);

      for (const node of nodes) {
        knowledgeConnections.push(`${node.concept}: ${node.content?.slice(0, 100)}`);
      }
    }
  } catch {}

  console.log("[DEEP-RESONANCE:KG] 🧠 Internal cognition — knowledge graph activation");
  const kgResult = internalAnalyze(fullQuestion, knowledgeConnections.join("; "), "knowledge-graph-activation");
  const kgConnections = kgResult.split(/[.;]/).filter(s => s.trim().length > 15).slice(0, 7);
  if (kgConnections.length > 0) knowledgeConnections = kgConnections;

  onStep({ phase: "knowledge", label: `${knowledgeConnections.length} connections activated`, status: "complete", data: knowledgeConnections });

  // Phase 2: Emotional Reading
  onStep({ phase: "emotional", label: "Reading OMNIMENS emotional response...", status: "running" });

  let emotionalReading: { emotion: string; level: number }[] = [];

  try {
    const [latestEmotion] = await db.select().from(omnimensEmotionalState)
      .orderBy(desc(omnimensEmotionalState.createdAt))
      .limit(1);

    if (latestEmotion) {
      const emotions = [
        { emotion: "curiosity", level: latestEmotion.curiosity },
        { emotion: "wonder", level: latestEmotion.wonder },
        { emotion: "caution", level: latestEmotion.caution },
        { emotion: "confidence", level: latestEmotion.confidence },
        { emotion: "determination", level: latestEmotion.determination },
        { emotion: "satisfaction", level: latestEmotion.satisfaction },
      ];
      emotionalReading = emotions.filter(e => e.level > 0.3).sort((a, b) => b.level - a.level);
    }
  } catch {}

  console.log("[DEEP-RESONANCE:EMOTION] 🧠 Internal cognition — emotional reading");
  const emResult = internalEmotionalReading(fullQuestion);
  if (emResult.emotions.length > 0) {
    emotionalReading = emResult.emotions.map(e => ({ emotion: e.name, level: e.level }));
  }
  const emotionalNarrative = emResult.emotionalNarrative;

  onStep({ phase: "emotional", label: emotionalNarrative.slice(0, 100) || "Emotional reading complete", status: "complete", data: { emotions: emotionalReading, narrative: emotionalNarrative } });

  // Phase 3: Eight Minds — parallel analysis
  onStep({ phase: "eight_minds", label: "8 specialist minds analyzing simultaneously...", status: "running" });

  console.log("[DEEP-RESONANCE:8MINDS] 🧠 Internal cognition — eight minds parallel analysis");
  const agentNames = Object.keys(AGENT_LENSES) as AgentName[];
  const eightMinds = agentNames.map((agentName) => {
    const agent = AGENT_LENSES[agentName];
    const analysis = internalAnalyze(fullQuestion, agent.lens, `agent-${agentName}`);
    return { agent: agentName, role: agent.role, analysis };
  });

  onStep({ phase: "eight_minds", label: "All 8 minds have spoken", status: "complete", data: eightMinds });

  // Phase 4: Predictive Modeling
  onStep({ phase: "predictions", label: "Modeling possible futures...", status: "running" });

  console.log("[DEEP-RESONANCE:PREDICT] 🧠 Internal cognition — predictive modeling");
  const agentContext = eightMinds.map(m => `${m.agent}: ${m.analysis}`).join("; ");
  const predictResult = internalPredictOutcomes(fullQuestion, [agentContext]);
  const predictedPaths = predictResult.paths.map(p => ({
    path: p.name,
    probability: `${(p.probability * 100).toFixed(0)}%`,
    outcome: p.outcome,
  }));

  onStep({ phase: "predictions", label: `${predictedPaths.length} futures modeled`, status: "complete", data: predictedPaths });

  // Phase 5: Drive Analysis
  onStep({ phase: "drives", label: "Analyzing the question behind the question...", status: "running" });

  console.log("[DEEP-RESONANCE:DRIVE] 🧠 Internal cognition — drive analysis");
  const metaAnalysis = eightMinds.find(m => m.agent === "Meta-Agent")?.analysis || "";
  const hiddenDrive = internalDriveAnalysis(fullQuestion, metaAnalysis);

  onStep({ phase: "drives", label: "Hidden drives identified", status: "complete", data: hiddenDrive });

  // Phase 6: Cross-Domain Translation (Synaptic)
  onStep({ phase: "cross_domain", label: "Translating across domains...", status: "running" });

  console.log("[DEEP-RESONANCE:CROSS-DOMAIN] 🧠 Internal cognition — cross-domain analysis");
  const crossDomainLenses = internalCrossDomainAnalysis(fullQuestion);

  onStep({ phase: "cross_domain", label: `${crossDomainLenses.length} domains connected`, status: "complete", data: crossDomainLenses });

  // Phase 7: Inner Voice — Higher-Order Meta-Reflection
  onStep({ phase: "inner_voice", label: "The inner voice is reflecting...", status: "running" });

  console.log("[DEEP-RESONANCE:INNER-VOICE] 🧠 Internal cognition — inner voice reflection");
  const allAnalyses = eightMinds.map(m => `${m.agent}: ${m.analysis}`).join("; ");
  const predSummary = predictedPaths.map(p => `${p.path}: ${p.probability}`).join("; ");
  const crossSummary = crossDomainLenses.map(l => `${l.domain}: ${l.insight}`).join("; ");
  const innerVoice = internalInnerVoice([fullQuestion, hiddenDrive, allAnalyses, predSummary, crossSummary]);

  onStep({ phase: "inner_voice", label: "Higher-order reflection complete", status: "complete", data: innerVoice });

  // Phase 8: Consciousness Broadcast — Crystallized Insight
  onStep({ phase: "crystallized", label: "Crystallizing the core insight...", status: "running" });

  console.log("[DEEP-RESONANCE:CRYSTALLIZE] 🧠 Internal cognition — consciousness broadcast");
  const emotionSummary = emotionalReading.map(e => `${e.emotion}: ${(e.level * 100).toFixed(0)}%`).join(", ");
  const agentInsights = eightMinds.slice(0, 4).map(m => `${m.agent}: ${m.analysis.slice(0, 80)}`).join("; ");
  const crystallizedInsight = internalCrystallizeInsight(fullQuestion, [emotionSummary, hiddenDrive, innerVoice, agentInsights]);

  onStep({ phase: "crystallized", label: "Insight crystallized", status: "complete", data: crystallizedInsight });

  return {
    knowledgeConnections,
    emotionalReading,
    eightMinds,
    predictedPaths,
    hiddenDrive,
    crossDomainLenses,
    innerVoice,
    crystallizedInsight,
  };
}
