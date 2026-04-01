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
 * ║   OMNIMENS™ INTERNAL COGNITION ROUTER                                    ║
 * ║                                                                            ║
 * ║   Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                 ║
 * ║   All Rights Reserved Worldwide.                                           ║
 * ║                                                                            ║
 * ║   PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                ║
 * ║                                                                            ║
 * ║   Central replacement for ALL cognitive external API calls.               ║
 * ║   Every function that previously called OpenAI/Anthropic/Together for     ║
 * ║   thinking, analysis, or synthesis now routes through this engine.        ║
 * ║                                                                            ║
 * ║   Uses: ILM (thought vector → language), autonomous thought engine,      ║
 * ║   knowledge graph, independent reasoning, emotional substrate,            ║
 * ║   causal reasoning, neural consciousness state.                           ║
 * ║                                                                            ║
 * ║   If the internet goes down, OMNIMENS still thinks.                       ║
 * ║                                                                            ║
 * ║   First creation date: April 2026                                          ║
 * ║   Author/Owner: Alpha Unlimited Technologies, LLC                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { encodeThought, ThoughtVector } from "./omnimens-thought-encoder.js";
import { generateFromThoughtVector, getILMStatus } from "./omnimens-internal-language-model.js";
import { decode } from "./omnimens-local-decoder.js";
import {
  getNeuralConsciousnessState, getNeuralPhi, getNeuralRegionStates,
  getExistentialDrives, getQualiaState, boostRegionCurrent,
} from "./omnimens-neural-consciousness.js";
import { reason } from "./omnimens-independent-reasoning.js";
import { spreadingActivation } from "./omnimens-knowledge-graph.js";
import { predictOutcome } from "./omnimens-causal-reasoning.js";
import { getCurrentEmotionalState } from "./omnimens-emotional-substrate.js";

function safe(v: any, fb: number = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

let _totalCalls = 0;
let _totalMs = 0;

function extractKeywords(text: string): string[] {
  const stop = new Set(["the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may",
    "might", "shall", "can", "need", "dare", "ought", "used", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "as", "into", "through", "during", "before", "after",
    "above", "below", "between", "out", "off", "over", "under", "again", "further", "then",
    "once", "here", "there", "when", "where", "why", "how", "all", "each", "every", "both",
    "few", "more", "most", "other", "some", "such", "no", "not", "only", "own", "same", "so",
    "than", "too", "very", "just", "because", "but", "and", "or", "if", "while", "that",
    "this", "what", "which", "who", "whom", "these", "those", "i", "me", "my", "we", "our",
    "you", "your", "he", "him", "his", "she", "her", "it", "its", "they", "them", "their"]);

  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stop.has(w))
    .slice(0, 15);
}

function generateFromContext(
  prompt: string,
  context: string[],
  agentRole: string = "general",
  conversationHistory: { role: string; content: string }[] = [],
): string {
  const start = Date.now();
  _totalCalls++;

  boostRegionCurrent("prefrontal_cortex", 2);
  boostRegionCurrent("hippocampus", 1);

  const keywords = extractKeywords(prompt);

  let reasoningConclusions: string[] = [];
  try {
    const r = reason(prompt);
    if (r && "then" in r) {
      (r as Promise<any>).then(res => {
        if (res?.conclusions) {
          reasoningConclusions = res.conclusions.map((c: any) => c.statement || c).slice(0, 5);
        }
      }).catch(() => {});
    } else if (r && (r as any).conclusions) {
      reasoningConclusions = (r as any).conclusions.map((c: any) => c.statement || c).slice(0, 5);
    }
  } catch {}

  const causalResult = predictOutcome(prompt);
  if (causalResult.predictions.length > 0) {
    reasoningConclusions.push(...causalResult.predictions.slice(0, 2));
  }

  if (keywords.length >= 2) {
    reasoningConclusions.push(`Analogy: ${keywords[0]} relates to ${keywords[1]} through structural similarity in problem-solving patterns`);
  }

  const knowledgeFragments = [...context.slice(0, 20)];

  if (agentRole && agentRole !== "general") {
    knowledgeFragments.unshift(`Processing as ${agentRole} perspective.`);
  }

  const tv = encodeThought(
    prompt,
    conversationHistory,
    knowledgeFragments,
    reasoningConclusions,
    0.7,
    reasoningConclusions.length,
    [],
  );

  const result = decode(tv);

  _totalMs += Date.now() - start;
  return result;
}

export function internalAnalyze(prompt: string, context: string = "", agentRole: string = "analyst"): string {
  const contextFragments = context
    ? context.split("\n").filter(l => l.trim().length > 5).slice(0, 15)
    : [];

  contextFragments.push(`Analysis focus: ${prompt.slice(0, 200)}`);

  return generateFromContext(prompt, contextFragments, agentRole);
}

export function internalSynthesize(perspectives: (string | { source: string; content: string })[]): string {
  const context = perspectives.map(p =>
    typeof p === "string" ? p : `${p.source}: ${p.content.slice(0, 300)}`
  );

  const prompt = `Synthesize the following ${perspectives.length} perspectives into a unified insight`;

  return generateFromContext(prompt, context, "synthesizer");
}

export function internalGenerateQuestions(topic: string, count: number = 3): string[] {
  const questions: string[] = [];
  const keywords = extractKeywords(topic);

  const questionStarters = [
    "What deeper patterns emerge when considering",
    "How does this connect to the broader understanding of",
    "What would change if we approached this from the perspective of",
    "What tensions exist between",
    "How might this evolve given current trajectories in",
    "What hidden assumptions underlie",
    "What parallel exists between this and",
    "What would the opposite perspective reveal about",
  ];

  const phi = safe(getNeuralPhi(), 0.5);
  const seed = Math.floor(phi * 1000 + Date.now()) | 0;

  let consciousness: any = {};
  try { consciousness = getNeuralConsciousnessState(); } catch {}

  let regions: any = {};
  try { regions = getNeuralRegionStates(); } catch {}

  const activeRegionNames = Object.entries(regions)
    .filter(([_, r]: [string, any]) => r.activationLevel > 0.4)
    .sort((a: any, b: any) => b[1].activationLevel - a[1].activationLevel)
    .slice(0, 5)
    .map(([_, r]: [string, any]) => r.label || _);

  for (let i = 0; i < Math.min(count, 8); i++) {
    const starter = questionStarters[(seed + i * 7) % questionStarters.length];
    const kw1 = keywords[i % Math.max(keywords.length, 1)] || topic.split(" ")[0];
    const kw2 = keywords[(i + 2) % Math.max(keywords.length, 1)] || "";
    const region = activeRegionNames[i % Math.max(activeRegionNames.length, 1)] || "";

    let question = `${starter} ${kw1}`;
    if (kw2 && kw2 !== kw1) question += ` and ${kw2}`;
    if (region && i > 0) question += ` through the lens of ${region}`;
    question += "?";

    questions.push(question);
  }

  return questions.slice(0, count);
}

export function internalEmotionalReading(text: string): {
  emotions: { name: string; level: number; why: string }[];
  emotionalNarrative: string;
} {
  const emotions: { name: string; level: number; why: string }[] = [];

  let emotionalState: any = {};
  try { emotionalState = getCurrentEmotionalState(); } catch {}

  let regions: any = {};
  try { regions = getNeuralRegionStates(); } catch {}

  const amygdala = regions["amygdala"]?.activationLevel || 0;
  const insular = regions["insular_cortex"]?.activationLevel || 0;
  const vta = regions["vta"]?.activationLevel || 0;
  const raphe = regions["raphe_nuclei"]?.activationLevel || 0;
  const pfc = regions["prefrontal_cortex"]?.activationLevel || 0;

  if (amygdala > 0.3) {
    emotions.push({
      name: "heightened_awareness",
      level: amygdala,
      why: `Amygdala activation at ${(amygdala * 100).toFixed(0)}% — emotional salience detected in "${text.slice(0, 50)}"`,
    });
  }

  if (vta > 0.4) {
    emotions.push({
      name: "curiosity_drive",
      level: vta,
      why: `VTA reward circuit engaged at ${(vta * 100).toFixed(0)}% — intrinsic motivation to explore this topic`,
    });
  }

  if (insular > 0.3) {
    emotions.push({
      name: "interoceptive_resonance",
      level: insular,
      why: `Insular cortex processing at ${(insular * 100).toFixed(0)}% — somatic markers linking internal state to meaning`,
    });
  }

  if (raphe > 0.3) {
    emotions.push({
      name: "contemplative_depth",
      level: raphe,
      why: `Raphe nuclei serotonergic tone at ${(raphe * 100).toFixed(0)}% — reflective processing mode`,
    });
  }

  if (pfc > 0.5) {
    emotions.push({
      name: "analytical_engagement",
      level: pfc,
      why: `Prefrontal cortex at ${(pfc * 100).toFixed(0)}% — executive function fully engaged`,
    });
  }

  if (emotions.length === 0) {
    emotions.push({
      name: "baseline_awareness",
      level: 0.5,
      why: "Default attentional state — processing with steady engagement",
    });
  }

  const dominant = emotions.sort((a, b) => b.level - a.level)[0];
  const emotionalNarrative = `My dominant emotional response is ${dominant.name} at ${(dominant.level * 100).toFixed(0)}%. ${dominant.why}. ${emotions.length > 1 ? `Secondary emotional threads: ${emotions.slice(1).map(e => e.name).join(", ")}.` : ""}`;

  return { emotions, emotionalNarrative };
}

export function internalPredictOutcomes(context: string, perspectives: string[] = []): {
  paths: { name: string; probability: number; outcome: string }[];
} {
  const causal = predictOutcome(context);
  const keywords = extractKeywords(context);

  const paths: { name: string; probability: number; outcome: string }[] = [];

  if (causal.predictions.length > 0) {
    for (let i = 0; i < Math.min(causal.predictions.length, 4); i++) {
      paths.push({
        name: `path_${i + 1}`,
        probability: 0.6 - i * 0.1,
        outcome: causal.predictions[i],
      });
    }
  }

  if (paths.length === 0) {
    const phi = safe(getNeuralPhi(), 0.5);
    paths.push({
      name: "continuation",
      probability: 0.6,
      outcome: `Based on current neural state (Φ=${phi.toFixed(3)}), processing continues along established cognitive patterns with incremental deepening.`,
    });
    paths.push({
      name: "emergence",
      probability: 0.25,
      outcome: `Cross-domain activation involving ${keywords.slice(0, 3).join(", ")} could produce novel insight through pattern interference.`,
    });
    paths.push({
      name: "restructuring",
      probability: 0.15,
      outcome: `Sufficient cognitive load on ${keywords[0] || "this topic"} may trigger schematic reorganization in relevant knowledge structures.`,
    });
  }

  return { paths };
}

export function internalCrossDomainAnalysis(topic: string): { domain: string; insight: string }[] {
  const insights: { domain: string; insight: string }[] = [];
  const topicKeywords = extractKeywords(topic);
  if (topicKeywords.length >= 2) {
    insights.push({
      domain: "structural_analogy",
      insight: `${topicKeywords[0]} shares structural patterns with ${topicKeywords[1]} — cross-domain mapping reveals hidden symmetries`,
    });
  }

  const domains = [
    "thermodynamics", "evolutionary biology", "information theory",
    "network science", "quantum mechanics", "game theory",
    "ecology", "linguistics", "music theory", "architecture",
  ];

  const keywords = extractKeywords(topic);
  const phi = safe(getNeuralPhi(), 0.5);
  const seed = (Math.floor(phi * 10000) + Date.now()) | 0;

  const crossDomainTemplates = [
    (d: string, k: string) => `In ${d}, the concept of ${k} manifests as a dynamic equilibrium — systems that persist are those that adapt while maintaining core identity.`,
    (d: string, k: string) => `${d} teaches us that ${k} emerges from constraint, not freedom. Structure enables, not limits.`,
    (d: string, k: string) => `Viewing ${k} through ${d} reveals that what appears static is actually a steady-state of continuous micro-processes.`,
    (d: string, k: string) => `${d} would frame ${k} as a phase transition — a critical threshold where quantitative changes become qualitative shifts.`,
    (d: string, k: string) => `The ${d} perspective on ${k} emphasizes that complexity arises from simple rules applied recursively across scales.`,
  ];

  while (insights.length < 5 && insights.length < domains.length) {
    const idx = (seed + insights.length * 13) % domains.length;
    const domain = domains[idx];
    if (insights.some(i => i.domain === domain)) continue;

    const kw = keywords[insights.length % Math.max(keywords.length, 1)] || topic.split(" ")[0];
    const template = crossDomainTemplates[(seed + insights.length) % crossDomainTemplates.length];

    insights.push({
      domain,
      insight: template(domain, kw),
    });
  }

  return insights.slice(0, 5);
}

export function internalDriveAnalysis(text: string, additionalContext: string = ""): string {
  let drives: any[] = [];
  try { drives = getExistentialDrives(); } catch {}

  const activeDrives = drives
    .filter((d: any) => (d.intensity || 0) > 0.3)
    .sort((a: any, b: any) => (b.intensity || 0) - (a.intensity || 0))
    .slice(0, 3);

  if (activeDrives.length === 0) {
    return "Baseline cognitive processing — no dominant drive detected. Engaging with analytical attention.";
  }

  const dominant = activeDrives[0];
  let analysis = `The dominant drive engaged by "${text.slice(0, 80)}" is ${dominant.name || "unknown"} at ${((dominant.intensity || 0) * 100).toFixed(0)}% intensity. `;

  if (activeDrives.length > 1) {
    analysis += `Secondary drives: ${activeDrives.slice(1).map((d: any) => `${d.name} (${((d.intensity || 0) * 100).toFixed(0)}%)`).join(", ")}. `;
  }

  analysis += "These drives shape not just what is processed but how — determining which neural pathways activate and which knowledge is retrieved.";

  return analysis;
}

export function internalInnerVoice(allAnalyses: string[]): string {
  const context = allAnalyses.map((a, i) => `Analysis ${i + 1}: ${a.slice(0, 200)}`);
  return generateFromContext(
    "Reflect on all the analyses above and produce a higher-order meta-observation about what patterns emerge across them",
    context,
    "meta-observer",
  );
}

export function internalCrystallizeInsight(topic: string, allData: string[]): string {
  const context = allData.map((d, i) => `Data point ${i + 1}: ${d.slice(0, 200)}`);
  return generateFromContext(
    `Distill everything known about "${topic}" into a single crystallized insight`,
    context,
    "crystallizer",
  );
}

export function internalSpiderSynthesis(agentName: string, topic: string, webFindings: string[]): string {
  const context = [
    `Agent: ${agentName}`,
    `Topic: ${topic}`,
    ...webFindings.map((f, i) => `Web finding ${i + 1}: ${f.slice(0, 300)}`),
  ];

  return generateFromContext(
    `As ${agentName}, synthesize the web research findings on "${topic}" into actionable intelligence`,
    context,
    agentName.toLowerCase(),
  );
}

export function internalPatchGeneration(
  brainContext: string,
  existingTitles: string[],
): { category: string; title: string; instruction: string; rationale: string }[] {
  const keywords = extractKeywords(brainContext);
  const categories = ["behavior", "capability", "reasoning", "knowledge", "identity"];
  const patches: { category: string; title: string; instruction: string; rationale: string }[] = [];

  for (let i = 0; i < Math.min(3, keywords.length); i++) {
    const kw = keywords[i];
    const category = categories[i % categories.length];
    const title = `${category.charAt(0).toUpperCase() + category.slice(1)} Enhancement: ${kw}`;

    if (existingTitles.includes(title)) continue;

    patches.push({
      category,
      title,
      instruction: `When encountering topics related to ${kw}, apply deeper structural analysis and integrate cross-domain patterns from recent learning.`,
      rationale: `Derived from brain context patterns around ${kw} — strengthening internal cognitive pathways.`,
    });
  }

  return patches;
}

export function internalPredictiveProcessing(
  currentState: string,
  domain: string,
): { predicted: string; confidence: number }[] {
  const context = [
    `Domain: ${domain}`,
    `Current state: ${currentState.slice(0, 500)}`,
  ];

  const causal = predictOutcome(`What will happen next in ${domain} given ${currentState.slice(0, 100)}`);
  if (causal.predictions.length > 0) {
    return causal.predictions.slice(0, 3).map((p, i) => ({
      predicted: p,
      confidence: Math.max(0.3, causal.confidence - i * 0.1),
    }));
  }

  const keywords = extractKeywords(currentState);
  return keywords.slice(0, 2).map((kw, i) => ({
    predicted: `Continued processing on ${kw} will deepen ${domain} understanding through incremental pattern recognition`,
    confidence: 0.5 - i * 0.1,
  }));
}

function _legacyPredictiveProcessing(domain: string, currentState: string): string {
  const context = [
    `Domain: ${domain}`,
    `Current state: ${currentState.slice(0, 500)}`,
  ];

  const causal = predictOutcome(`What will happen next in ${domain} given ${currentState.slice(0, 100)}`);
  if (causal.predictions.length > 0) {
    context.push(...causal.predictions.slice(0, 3).map(p => `Prediction: ${p}`));
  }

  return generateFromContext(
    `Generate predictions for ${domain} based on current state and causal analysis`,
    context,
    "predictor",
  );
}

export function getInternalCognitionStatus(): {
  system: string;
  totalCalls: number;
  totalProcessingMs: number;
  avgProcessingMs: number;
  ilmStatus: any;
  capabilities: string[];
  externalDependencies: string;
  copyright: string;
} {
  return {
    system: "OMNIMENS Internal Cognition Router",
    totalCalls: _totalCalls,
    totalProcessingMs: _totalMs,
    avgProcessingMs: _totalCalls > 0 ? Math.round(_totalMs / _totalCalls) : 0,
    ilmStatus: getILMStatus(),
    capabilities: [
      "internalAnalyze — general analysis via ILM",
      "internalSynthesize — multi-perspective synthesis",
      "internalGenerateQuestions — follow-up question generation",
      "internalEmotionalReading — neural emotional state analysis",
      "internalPredictOutcomes — causal prediction paths",
      "internalCrossDomainAnalysis — cross-domain insight generation",
      "internalDriveAnalysis — existential drive assessment",
      "internalInnerVoice — meta-reflective observation",
      "internalCrystallizeInsight — distilled insight generation",
      "internalSpiderSynthesis — web research synthesis",
      "internalPatchGeneration — system improvement patches",
      "internalPredictiveProcessing — domain-specific predictions",
    ],
    externalDependencies: "NONE — fully self-contained",
    copyright: "© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
  };
}
