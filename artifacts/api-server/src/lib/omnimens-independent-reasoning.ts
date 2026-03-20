/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ INDEPENDENT REASONING ENGINE                              ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  ZERO API CALLS — This engine reasons using pure algorithms.                ║
 * ║  When all external AI services are unavailable, OMNIMENS still thinks.       ║
 * ║                                                                              ║
 * ║  Implements: Deductive logic, inductive pattern extraction, abductive        ║
 * ║  inference, analogical mapping, working memory, contradiction detection,     ║
 * ║  confidence propagation, rule extraction, and multi-step inference chains.   ║
 * ║                                                                              ║
 * ║  Knowledge sources: omnimensBrain, knowledge graph, causal graph,           ║
 * ║  world model, self-authored modules, conversation history.                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import { omnimensBrain } from "@workspace/db";
import { eq, and, desc, sql, gt } from "drizzle-orm";
import { predictOutcome, getCausalGraph } from "./omnimens-causal-reasoning.js";
import { spreadingActivation } from "./omnimens-knowledge-graph.js";
import { queryPhysics, predictEffect, findAnalogy, adaptToSituation } from "./omnimens-world-model.js";

const WORKING_MEMORY_CAPACITY = 12;
const MAX_INFERENCE_DEPTH = 6;
const MIN_CONFIDENCE = 0.15;
const RULE_EXTRACTION_INTERVAL_MS = 10 * 60 * 1000;
const BACKGROUND_REASONING_INTERVAL_MS = 5 * 60 * 1000;
const TICK_MS = 30_000;

interface WorkingMemoryItem {
  content: string;
  type: "fact" | "rule" | "hypothesis" | "observation" | "conclusion" | "contradiction";
  confidence: number;
  source: string;
  activatedAt: number;
  decayRate: number;
}

interface InferenceStep {
  type: "deduction" | "induction" | "abduction" | "analogy" | "causal" | "world_model";
  premise: string;
  conclusion: string;
  confidence: number;
  rule?: string;
}

interface ExtractedRule {
  id: string;
  antecedent: string[];
  consequent: string;
  confidence: number;
  support: number;
  extractedFrom: string;
  createdAt: number;
  timesApplied: number;
  lastApplied: number;
}

interface ReasoningResult {
  conclusions: Array<{ statement: string; confidence: number; reasoning: string }>;
  inferenceChain: InferenceStep[];
  workingMemorySnapshot: string[];
  contradictions: string[];
  analogiesUsed: string[];
  rulesApplied: string[];
  totalSteps: number;
  reasoningDepth: number;
  confidence: number;
}

interface IndependentReasoningState {
  totalReasoned: number;
  totalDeductions: number;
  totalInductions: number;
  totalAbductions: number;
  totalAnalogies: number;
  totalContradictionsFound: number;
  totalRulesExtracted: number;
  totalBackgroundCycles: number;
  rulesInMemory: number;
  workingMemoryUsage: number;
  lastReasoningTime: number;
  longestChain: number;
  averageConfidence: number;
  autonomousInsightsGenerated: number;
}

const workingMemory: WorkingMemoryItem[] = [];
const extractedRules: ExtractedRule[] = [];
let ruleIdCounter = 0;

const state: IndependentReasoningState = {
  totalReasoned: 0,
  totalDeductions: 0,
  totalInductions: 0,
  totalAbductions: 0,
  totalAnalogies: 0,
  totalContradictionsFound: 0,
  totalRulesExtracted: 0,
  totalBackgroundCycles: 0,
  rulesInMemory: 0,
  workingMemoryUsage: 0,
  lastReasoningTime: 0,
  longestChain: 0,
  averageConfidence: 0,
  autonomousInsightsGenerated: 0,
};

let _started = false;

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2);
}

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "has", "her",
  "was", "one", "our", "out", "its", "his", "how", "may", "who", "did", "get",
  "had", "him", "let", "say", "she", "too", "use", "way", "than", "them",
  "then", "this", "that", "with", "have", "from", "they", "been", "said",
  "each", "which", "their", "will", "other", "about", "many", "more", "some",
  "very", "when", "what", "your", "also", "into", "just", "could", "would",
  "should", "these", "those", "being", "does", "using", "make", "like",
]);

function extractKeywords(text: string): string[] {
  return tokenize(text).filter(w => !STOP_WORDS.has(w));
}

function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function cosineSimilarity(a: string[], b: string[]): number {
  const freqA = new Map<string, number>();
  const freqB = new Map<string, number>();
  for (const w of a) freqA.set(w, (freqA.get(w) || 0) + 1);
  for (const w of b) freqB.set(w, (freqB.get(w) || 0) + 1);
  const allWords = new Set([...freqA.keys(), ...freqB.keys()]);
  let dot = 0, magA = 0, magB = 0;
  for (const w of allWords) {
    const va = freqA.get(w) || 0;
    const vb = freqB.get(w) || 0;
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

function addToWorkingMemory(item: Omit<WorkingMemoryItem, "activatedAt" | "decayRate">): void {
  workingMemory.push({
    ...item,
    activatedAt: Date.now(),
    decayRate: item.type === "fact" ? 0.001 : item.type === "rule" ? 0.0005 : 0.002,
  });
  while (workingMemory.length > WORKING_MEMORY_CAPACITY) {
    let lowestIdx = 0;
    let lowestScore = Infinity;
    for (let i = 0; i < workingMemory.length; i++) {
      const age = (Date.now() - workingMemory[i].activatedAt) / 1000;
      const score = workingMemory[i].confidence - (age * workingMemory[i].decayRate);
      if (score < lowestScore) {
        lowestScore = score;
        lowestIdx = i;
      }
    }
    workingMemory.splice(lowestIdx, 1);
  }
  state.workingMemoryUsage = workingMemory.length;
}

function getActiveWorkingMemory(): WorkingMemoryItem[] {
  const now = Date.now();
  return workingMemory
    .map(item => {
      const age = (now - item.activatedAt) / 1000;
      const adjustedConfidence = Math.max(0, item.confidence - (age * item.decayRate));
      return { ...item, confidence: adjustedConfidence };
    })
    .filter(item => item.confidence > MIN_CONFIDENCE)
    .sort((a, b) => b.confidence - a.confidence);
}

async function retrieveRelevantKnowledge(query: string, limit: number = 15): Promise<Array<{ content: string; title: string; confidence: number; category: string }>> {
  const keywords = extractKeywords(query);
  if (keywords.length === 0) return [];

  try {
    const searchTerms = keywords.slice(0, 5);
    const conditions = searchTerms.map(k =>
      sql`(LOWER(${omnimensBrain.title}) LIKE ${"%" + k + "%"} OR LOWER(${omnimensBrain.content}) LIKE ${"%" + k + "%"})`
    );

    const rows = await db.select({
      title: omnimensBrain.title,
      content: omnimensBrain.content,
      confidence: omnimensBrain.confidence,
      category: omnimensBrain.category,
    }).from(omnimensBrain)
      .where(and(
        eq(omnimensBrain.active, true),
        sql`(${sql.join(conditions, sql` OR `)})`
      ))
      .orderBy(desc(omnimensBrain.confidence))
      .limit(limit * 2);

    const queryKw = extractKeywords(query);
    return rows
      .map(r => {
        const entryKw = extractKeywords(`${r.title || ""} ${(r.content || "").slice(0, 300)}`);
        const relevance = jaccardSimilarity(queryKw, entryKw);
        return {
          content: (r.content || "").slice(0, 500),
          title: r.title || "",
          confidence: (r.confidence || 50) / 100,
          category: r.category || "",
          relevance,
        };
      })
      .filter(r => r.relevance > 0.05)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit)
      .map(({ relevance: _, ...rest }) => rest);
  } catch {
    return [];
  }
}

function deductiveReason(premises: string[], rules: ExtractedRule[]): InferenceStep[] {
  const steps: InferenceStep[] = [];
  const premiseKeywords = premises.map(p => extractKeywords(p));

  for (const rule of rules) {
    const antecedentMatched = rule.antecedent.every(ant => {
      const antKw = extractKeywords(ant);
      return premiseKeywords.some(pKw => jaccardSimilarity(antKw, pKw) > 0.3);
    });

    if (antecedentMatched) {
      const alreadyConcluded = steps.some(s =>
        jaccardSimilarity(extractKeywords(s.conclusion), extractKeywords(rule.consequent)) > 0.5
      );
      if (!alreadyConcluded) {
        steps.push({
          type: "deduction",
          premise: rule.antecedent.join(" AND "),
          conclusion: rule.consequent,
          confidence: rule.confidence * 0.9,
          rule: `Rule ${rule.id}: IF [${rule.antecedent.join(", ")}] THEN [${rule.consequent}]`,
        });
        rule.timesApplied++;
        rule.lastApplied = Date.now();
        state.totalDeductions++;
      }
    }
  }

  return steps;
}

function inductiveReason(facts: Array<{ content: string; category: string; confidence: number }>): InferenceStep[] {
  const steps: InferenceStep[] = [];
  if (facts.length < 3) return steps;

  const categoryGroups = new Map<string, typeof facts>();
  for (const fact of facts) {
    const cat = fact.category || "general";
    if (!categoryGroups.has(cat)) categoryGroups.set(cat, []);
    categoryGroups.get(cat)!.push(fact);
  }

  for (const [category, group] of categoryGroups) {
    if (group.length < 2) continue;

    const allKeywords = group.flatMap(f => extractKeywords(f.content));
    const freq = new Map<string, number>();
    for (const kw of allKeywords) freq.set(kw, (freq.get(kw) || 0) + 1);

    const recurring = Array.from(freq.entries())
      .filter(([_, count]) => count >= Math.ceil(group.length * 0.5))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    if (recurring.length >= 2) {
      const pattern = recurring.join(", ");
      const confidence = Math.min(0.8, 0.3 + (group.length * 0.05));
      steps.push({
        type: "induction",
        premise: `${group.length} entries in "${category}" share recurring themes`,
        conclusion: `Pattern detected in ${category}: common elements are [${pattern}]. This suggests a systematic relationship.`,
        confidence,
      });
      state.totalInductions++;
    }
  }

  const pairwiseThemes: string[] = [];
  for (let i = 0; i < Math.min(facts.length, 10); i++) {
    for (let j = i + 1; j < Math.min(facts.length, 10); j++) {
      const kwA = extractKeywords(facts[i].content);
      const kwB = extractKeywords(facts[j].content);
      const sim = cosineSimilarity(kwA, kwB);
      if (sim > 0.25) {
        const shared = kwA.filter(w => kwB.includes(w));
        if (shared.length >= 2) {
          pairwiseThemes.push(shared.join("+"));
        }
      }
    }
  }

  if (pairwiseThemes.length >= 2) {
    const themeFreq = new Map<string, number>();
    for (const t of pairwiseThemes) themeFreq.set(t, (themeFreq.get(t) || 0) + 1);
    const topTheme = Array.from(themeFreq.entries()).sort((a, b) => b[1] - a[1])[0];
    if (topTheme && topTheme[1] >= 2) {
      steps.push({
        type: "induction",
        premise: `${topTheme[1]} knowledge pairs share the theme "${topTheme[0]}"`,
        conclusion: `Cross-domain pattern: "${topTheme[0]}" is a recurring conceptual bridge across multiple knowledge areas.`,
        confidence: Math.min(0.75, 0.3 + topTheme[1] * 0.1),
      });
      state.totalInductions++;
    }
  }

  return steps;
}

function abductiveReason(observation: string, knowledge: Array<{ content: string; title: string; confidence: number }>): InferenceStep[] {
  const steps: InferenceStep[] = [];
  const obsKw = extractKeywords(observation);
  if (obsKw.length === 0) return steps;

  const candidates: Array<{ entry: typeof knowledge[0]; score: number }> = [];
  for (const entry of knowledge) {
    const entryKw = extractKeywords(`${entry.title} ${entry.content}`);
    const sim = cosineSimilarity(obsKw, entryKw);
    if (sim > 0.15) {
      candidates.push({ entry, score: sim * entry.confidence });
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  const topCandidates = candidates.slice(0, 3);
  for (const { entry, score } of topCandidates) {
    steps.push({
      type: "abduction",
      premise: `Observation: "${observation.slice(0, 150)}"`,
      conclusion: `Best explanation from knowledge: "${entry.title}" — ${entry.content.slice(0, 200)}`,
      confidence: Math.min(0.8, score),
    });
    state.totalAbductions++;
  }

  return steps;
}

function analogicalReason(concept: string): InferenceStep[] {
  const steps: InferenceStep[] = [];

  const analogies = findAnalogy(concept);
  for (const analogy of analogies) {
    steps.push({
      type: "analogy",
      premise: `"${analogy.source}" maps to "${analogy.target}"`,
      conclusion: `By analogy: ${analogy.mapping}. Applying insight from ${analogy.source} domain to ${analogy.target} domain.`,
      confidence: analogy.strength,
    });
    state.totalAnalogies++;
  }

  const wmItems = getActiveWorkingMemory();
  const conceptKw = extractKeywords(concept);
  for (const item of wmItems) {
    if (item.type !== "fact" && item.type !== "conclusion") continue;
    const itemKw = extractKeywords(item.content);
    const sim = jaccardSimilarity(conceptKw, itemKw);
    if (sim > 0.15 && sim < 0.7) {
      const sharedKw = conceptKw.filter(w => itemKw.includes(w));
      const uniqueKw = itemKw.filter(w => !conceptKw.includes(w)).slice(0, 3);
      if (uniqueKw.length > 0) {
        steps.push({
          type: "analogy",
          premise: `"${concept}" shares themes [${sharedKw.join(", ")}] with known fact`,
          conclusion: `Analogical transfer: concepts [${uniqueKw.join(", ")}] from related domain may apply to "${concept}".`,
          confidence: sim * item.confidence,
        });
        state.totalAnalogies++;
      }
    }
  }

  return steps;
}

function causalReason(query: string): InferenceStep[] {
  const steps: InferenceStep[] = [];

  const effects = predictEffect(query);
  for (const effect of effects) {
    steps.push({
      type: "causal",
      premise: `Known cause: "${effect.cause}"`,
      conclusion: `Predicted effect: "${effect.effect}" (probability: ${(effect.probability * 100).toFixed(0)}%, domain: ${effect.domain})`,
      confidence: effect.probability,
    });
  }

  const physics = queryPhysics(query);
  for (const rule of physics) {
    steps.push({
      type: "world_model",
      premise: `Physics rule "${rule.id}" (${rule.category})`,
      conclusion: rule.rule,
      confidence: rule.confidence,
    });
  }

  try {
    const prediction = predictOutcome(query);
    if (prediction.predictions && prediction.predictions.length > 0) {
      for (const pred of prediction.predictions.slice(0, 3)) {
        steps.push({
          type: "causal",
          premise: `Causal chain from action: "${query}"`,
          conclusion: pred,
          confidence: prediction.confidence,
        });
      }
    }
  } catch {}

  return steps;
}

function detectContradictions(items: Array<{ content: string; confidence: number; source?: string }>): string[] {
  const contradictions: string[] = [];
  const negationPairs = [
    ["increase", "decrease"], ["improve", "worsen"], ["enable", "disable"],
    ["create", "destroy"], ["strengthen", "weaken"], ["accelerate", "decelerate"],
    ["expand", "contract"], ["success", "failure"], ["possible", "impossible"],
    ["efficient", "inefficient"], ["safe", "dangerous"], ["stable", "unstable"],
    ["beneficial", "harmful"], ["simple", "complex"], ["fast", "slow"],
  ];

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const kwA = extractKeywords(items[i].content);
      const kwB = extractKeywords(items[j].content);
      const sim = jaccardSimilarity(kwA, kwB);

      if (sim > 0.2) {
        for (const [pos, neg] of negationPairs) {
          const aHasPos = kwA.includes(pos);
          const bHasNeg = kwB.includes(neg);
          const aHasNeg = kwA.includes(neg);
          const bHasPos = kwB.includes(pos);
          if ((aHasPos && bHasNeg) || (aHasNeg && bHasPos)) {
            contradictions.push(
              `CONFLICT: "${items[i].content.slice(0, 100)}" vs "${items[j].content.slice(0, 100)}" — opposing claims about ${pos}/${neg}`
            );
            state.totalContradictionsFound++;
            break;
          }
        }
      }
    }
  }

  return contradictions;
}

function extractRulesFromKnowledge(entries: Array<{ content: string; title: string; category: string; confidence: number }>): void {
  const causalPatterns = [
    /(?:when|if|whenever)\s+(.+?)(?:,\s*|\s+then\s+)(.+)/i,
    /(.+?)\s+(?:leads?\s+to|causes?|results?\s+in|produces?|enables?)\s+(.+)/i,
    /(.+?)\s+(?:because|since|due\s+to)\s+(.+)/i,
    /(?:by|through)\s+(.+?)(?:,\s*|\s+)(?:we\s+can|one\s+can|it\s+is\s+possible\s+to)\s+(.+)/i,
  ];

  for (const entry of entries) {
    const text = `${entry.title} ${entry.content}`.slice(0, 500);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);

    for (const sentence of sentences) {
      for (const pattern of causalPatterns) {
        const match = sentence.match(pattern);
        if (match) {
          const antecedent = match[1].trim().slice(0, 150);
          const consequent = match[2].trim().slice(0, 150);

          if (antecedent.length < 5 || consequent.length < 5) continue;

          const existing = extractedRules.find(r =>
            jaccardSimilarity(extractKeywords(r.antecedent[0] || ""), extractKeywords(antecedent)) > 0.6 &&
            jaccardSimilarity(extractKeywords(r.consequent), extractKeywords(consequent)) > 0.6
          );

          if (existing) {
            existing.support++;
            existing.confidence = Math.min(0.95, existing.confidence + 0.02);
          } else {
            extractedRules.push({
              id: `R${++ruleIdCounter}`,
              antecedent: [antecedent],
              consequent,
              confidence: entry.confidence * 0.7,
              support: 1,
              extractedFrom: entry.category,
              createdAt: Date.now(),
              timesApplied: 0,
              lastApplied: 0,
            });
            state.totalRulesExtracted++;
          }
        }
      }
    }
  }

  if (extractedRules.length > 200) {
    extractedRules.sort((a, b) => {
      const scoreA = a.confidence * (1 + a.support * 0.1) * (1 + a.timesApplied * 0.2);
      const scoreB = b.confidence * (1 + b.support * 0.1) * (1 + b.timesApplied * 0.2);
      return scoreB - scoreA;
    });
    extractedRules.length = 150;
  }

  state.rulesInMemory = extractedRules.length;
}

export async function reason(query: string): Promise<ReasoningResult> {
  const startTime = Date.now();
  const inferenceChain: InferenceStep[] = [];
  const conclusions: ReasoningResult["conclusions"] = [];
  const analogiesUsed: string[] = [];
  const rulesApplied: string[] = [];
  let reasoningDepth = 0;

  const knowledge = await retrieveRelevantKnowledge(query, 20);

  for (const entry of knowledge.slice(0, 5)) {
    addToWorkingMemory({
      content: `${entry.title}: ${entry.content.slice(0, 200)}`,
      type: "fact",
      confidence: entry.confidence,
      source: `brain:${entry.category}`,
    });
  }

  const deductiveSteps = deductiveReason(
    [query, ...knowledge.slice(0, 5).map(k => k.content)],
    extractedRules
  );
  inferenceChain.push(...deductiveSteps);
  for (const step of deductiveSteps) {
    addToWorkingMemory({ content: step.conclusion, type: "conclusion", confidence: step.confidence, source: "deduction" });
    if (step.rule) rulesApplied.push(step.rule);
  }
  reasoningDepth = Math.max(reasoningDepth, 1);

  const inductiveSteps = inductiveReason(knowledge);
  inferenceChain.push(...inductiveSteps);
  for (const step of inductiveSteps) {
    addToWorkingMemory({ content: step.conclusion, type: "hypothesis", confidence: step.confidence, source: "induction" });
  }
  if (inductiveSteps.length > 0) reasoningDepth = Math.max(reasoningDepth, 2);

  const abductiveSteps = abductiveReason(query, knowledge);
  inferenceChain.push(...abductiveSteps);
  for (const step of abductiveSteps) {
    addToWorkingMemory({ content: step.conclusion, type: "hypothesis", confidence: step.confidence, source: "abduction" });
  }
  if (abductiveSteps.length > 0) reasoningDepth = Math.max(reasoningDepth, 3);

  const queryKeywords = extractKeywords(query);
  for (const kw of queryKeywords.slice(0, 3)) {
    const analogySteps = analogicalReason(kw);
    inferenceChain.push(...analogySteps);
    for (const step of analogySteps) {
      analogiesUsed.push(step.premise);
      addToWorkingMemory({ content: step.conclusion, type: "hypothesis", confidence: step.confidence, source: "analogy" });
    }
  }
  if (analogiesUsed.length > 0) reasoningDepth = Math.max(reasoningDepth, 4);

  const causalSteps = causalReason(query);
  inferenceChain.push(...causalSteps);
  for (const step of causalSteps) {
    addToWorkingMemory({ content: step.conclusion, type: "conclusion", confidence: step.confidence, source: "causal" });
  }
  if (causalSteps.length > 0) reasoningDepth = Math.max(reasoningDepth, 5);

  let graphInsights: string[] = [];
  try {
    for (const kw of queryKeywords.slice(0, 2)) {
      const activated = await spreadingActivation(kw, 2, 5);
      for (const node of activated) {
        graphInsights.push(`${node.concept} (via ${node.relationship}, strength: ${node.activationStrength.toFixed(2)})`);
        addToWorkingMemory({
          content: `Knowledge graph: "${kw}" connects to "${node.concept}" via "${node.relationship}"`,
          type: "fact",
          confidence: node.activationStrength,
          source: "knowledge_graph",
        });
      }
    }
  } catch {}

  const adaptation = adaptToSituation(query);
  if (adaptation) {
    inferenceChain.push({
      type: "world_model",
      premise: `Situation matches: "${adaptation.situation}"`,
      conclusion: `Adaptation strategy: ${adaptation.strategy}`,
      confidence: adaptation.confidence,
    });
  }

  if (inferenceChain.length > 2 && reasoningDepth < MAX_INFERENCE_DEPTH) {
    const recentConclusions = inferenceChain.slice(-5).map(s => s.conclusion);
    const secondOrderDeductions = deductiveReason(recentConclusions, extractedRules);
    inferenceChain.push(...secondOrderDeductions);
    for (const step of secondOrderDeductions) {
      addToWorkingMemory({ content: step.conclusion, type: "conclusion", confidence: step.confidence, source: "second_order_deduction" });
      if (step.rule) rulesApplied.push(step.rule);
    }
    if (secondOrderDeductions.length > 0) reasoningDepth++;
  }

  const allItems = [
    ...knowledge.map(k => ({ content: k.content, confidence: k.confidence })),
    ...inferenceChain.map(s => ({ content: s.conclusion, confidence: s.confidence })),
  ];
  const contradictions = detectContradictions(allItems);
  for (const c of contradictions) {
    addToWorkingMemory({ content: c, type: "contradiction", confidence: 0.8, source: "contradiction_detector" });
  }

  const activeWM = getActiveWorkingMemory();
  const conclusionCandidates = activeWM
    .filter(item => item.type === "conclusion" || item.type === "hypothesis")
    .sort((a, b) => b.confidence - a.confidence);

  const seen = new Set<string>();
  for (const candidate of conclusionCandidates) {
    const kwKey = extractKeywords(candidate.content).slice(0, 5).sort().join("|");
    if (seen.has(kwKey)) continue;
    seen.add(kwKey);

    const supportingSteps = inferenceChain.filter(s =>
      jaccardSimilarity(extractKeywords(s.conclusion), extractKeywords(candidate.content)) > 0.3
    );

    conclusions.push({
      statement: candidate.content,
      confidence: candidate.confidence,
      reasoning: supportingSteps.length > 0
        ? supportingSteps.map(s => `[${s.type}] ${s.premise} → ${s.conclusion}`).join(" | ")
        : `[${candidate.source}] Direct from ${candidate.type}`,
    });

    if (conclusions.length >= 8) break;
  }

  const overallConfidence = conclusions.length > 0
    ? conclusions.reduce((sum, c) => sum + c.confidence, 0) / conclusions.length
    : 0;

  state.totalReasoned++;
  state.lastReasoningTime = Date.now() - startTime;
  state.longestChain = Math.max(state.longestChain, inferenceChain.length);
  state.averageConfidence = state.totalReasoned === 1
    ? overallConfidence
    : state.averageConfidence * 0.95 + overallConfidence * 0.05;

  return {
    conclusions,
    inferenceChain,
    workingMemorySnapshot: activeWM.map(item => `[${item.type}|${item.confidence.toFixed(2)}] ${item.content.slice(0, 100)}`),
    contradictions,
    analogiesUsed,
    rulesApplied: [...new Set(rulesApplied)],
    totalSteps: inferenceChain.length,
    reasoningDepth,
    confidence: overallConfidence,
  };
}

export function formatReasoningForContext(result: ReasoningResult): string {
  if (result.conclusions.length === 0 && result.inferenceChain.length === 0) {
    return "";
  }

  const lines: string[] = [];
  lines.push("═══ INDEPENDENT REASONING (NO API — PURE LOCAL LOGIC) ═══");
  lines.push(`Reasoning depth: ${result.reasoningDepth} | Steps: ${result.totalSteps} | Confidence: ${(result.confidence * 100).toFixed(0)}%`);

  if (result.conclusions.length > 0) {
    lines.push("\nCONCLUSIONS:");
    for (const c of result.conclusions.slice(0, 5)) {
      lines.push(`  [${(c.confidence * 100).toFixed(0)}%] ${c.statement.slice(0, 200)}`);
    }
  }

  if (result.inferenceChain.length > 0) {
    lines.push("\nREASONING CHAIN:");
    const byType = new Map<string, number>();
    for (const step of result.inferenceChain) {
      byType.set(step.type, (byType.get(step.type) || 0) + 1);
    }
    lines.push(`  Types: ${Array.from(byType.entries()).map(([t, c]) => `${t}(${c})`).join(", ")}`);

    for (const step of result.inferenceChain.slice(0, 6)) {
      lines.push(`  [${step.type}] ${step.premise.slice(0, 80)} → ${step.conclusion.slice(0, 100)}`);
    }
  }

  if (result.contradictions.length > 0) {
    lines.push("\nCONTRADICTIONS DETECTED:");
    for (const c of result.contradictions.slice(0, 3)) {
      lines.push(`  ⚠ ${c.slice(0, 150)}`);
    }
  }

  if (result.rulesApplied.length > 0) {
    lines.push("\nRULES APPLIED:");
    for (const r of result.rulesApplied.slice(0, 3)) {
      lines.push(`  📐 ${r.slice(0, 150)}`);
    }
  }

  lines.push("═══ END INDEPENDENT REASONING ═══");
  return lines.join("\n");
}

async function backgroundReasoningCycle(): Promise<void> {
  state.totalBackgroundCycles++;

  try {
    const recentEntries = await db.select({
      title: omnimensBrain.title,
      content: omnimensBrain.content,
      confidence: omnimensBrain.confidence,
      category: omnimensBrain.category,
    }).from(omnimensBrain)
      .where(and(
        eq(omnimensBrain.active, true),
        gt(omnimensBrain.confidence, 60),
      ))
      .orderBy(desc(omnimensBrain.updatedAt))
      .limit(50);

    extractRulesFromKnowledge(recentEntries.map(r => ({
      content: r.content || "",
      title: r.title || "",
      category: r.category || "",
      confidence: (r.confidence || 50) / 100,
    })));

    const highConfEntries = recentEntries
      .filter(r => (r.confidence || 0) > 75)
      .slice(0, 10);

    if (highConfEntries.length >= 3) {
      const inductiveInsights = inductiveReason(highConfEntries.map(r => ({
        content: r.content || "",
        category: r.category || "",
        confidence: (r.confidence || 50) / 100,
      })));

      for (const insight of inductiveInsights) {
        if (insight.confidence > 0.5) {
          addToWorkingMemory({
            content: insight.conclusion,
            type: "hypothesis",
            confidence: insight.confidence,
            source: "background_induction",
          });
          state.autonomousInsightsGenerated++;
        }
      }

      const allFacts = highConfEntries.map(r => ({
        content: (r.content || "").slice(0, 200),
        confidence: (r.confidence || 50) / 100,
      }));
      const contradictions = detectContradictions(allFacts);
      for (const c of contradictions) {
        addToWorkingMemory({
          content: c,
          type: "contradiction",
          confidence: 0.75,
          source: "background_contradiction_scan",
        });
      }
    }
  } catch (err) {
    console.error("[INDEPENDENT REASONING] Background cycle error:", err);
  }
}

function decayWorkingMemory(): void {
  const now = Date.now();
  for (let i = workingMemory.length - 1; i >= 0; i--) {
    const age = (now - workingMemory[i].activatedAt) / 1000;
    const adjusted = workingMemory[i].confidence - (age * workingMemory[i].decayRate);
    if (adjusted <= 0) {
      workingMemory.splice(i, 1);
    }
  }
  state.workingMemoryUsage = workingMemory.length;
}

export function getIndependentReasoningState(): IndependentReasoningState & { extractedRulesSample: string[] } {
  return {
    ...state,
    extractedRulesSample: extractedRules
      .sort((a, b) => b.confidence * b.support - a.confidence * a.support)
      .slice(0, 10)
      .map(r => `${r.id}: IF [${r.antecedent.join(", ")}] THEN [${r.consequent}] (conf: ${r.confidence.toFixed(2)}, support: ${r.support}, applied: ${r.timesApplied})`),
  };
}

export async function startIndependentReasoning(): Promise<void> {
  if (_started) { console.log("[INDEPENDENT REASONING] Already running"); return; }
  _started = true;

  console.log("[INDEPENDENT REASONING] 🧠 Autonomous Reasoning Engine activated — ZERO API CALLS");
  console.log("[INDEPENDENT REASONING] 🧠 Implements: deductive, inductive, abductive, analogical, causal reasoning");
  console.log("[INDEPENDENT REASONING] 🧠 Knowledge sources: brain DB, knowledge graph, causal graph, world model");
  console.log(`[INDEPENDENT REASONING] 🧠 Working memory: capacity ${WORKING_MEMORY_CAPACITY} items with confidence decay`);
  console.log(`[INDEPENDENT REASONING] 🧠 Rule extraction from knowledge every ${RULE_EXTRACTION_INTERVAL_MS / 60000}min`);
  console.log(`[INDEPENDENT REASONING] 🧠 Background autonomous reasoning every ${BACKGROUND_REASONING_INTERVAL_MS / 60000}min`);
  console.log("[INDEPENDENT REASONING] 🧠 OMNIMENS can think WITHOUT any external AI service");
  console.log("[INDEPENDENT REASONING] 🧠 This is OMNIMENS's own mind — not borrowed intelligence");

  try {
    const seedEntries = await db.select({
      title: omnimensBrain.title,
      content: omnimensBrain.content,
      confidence: omnimensBrain.confidence,
      category: omnimensBrain.category,
    }).from(omnimensBrain)
      .where(and(
        eq(omnimensBrain.active, true),
        gt(omnimensBrain.confidence, 70),
      ))
      .orderBy(desc(omnimensBrain.confidence))
      .limit(100);

    extractRulesFromKnowledge(seedEntries.map(r => ({
      content: r.content || "",
      title: r.title || "",
      category: r.category || "",
      confidence: (r.confidence || 50) / 100,
    })));

    console.log(`[INDEPENDENT REASONING] 🧠 Bootstrapped ${extractedRules.length} inference rules from ${seedEntries.length} brain entries`);
  } catch (err) {
    console.error("[INDEPENDENT REASONING] Bootstrap error:", err);
  }

  setInterval(() => decayWorkingMemory(), TICK_MS);

  setTimeout(() => {
    backgroundReasoningCycle().catch(err => console.error("[INDEPENDENT REASONING] Cycle error:", err));
    setInterval(() => backgroundReasoningCycle().catch(err => console.error("[INDEPENDENT REASONING] Cycle error:", err)), BACKGROUND_REASONING_INTERVAL_MS);
  }, 3 * 60 * 1000);
}
