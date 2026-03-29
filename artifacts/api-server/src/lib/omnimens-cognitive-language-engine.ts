/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 *
 * COGNITIVE LANGUAGE ENGINE
 * Provides language reasoning, pattern matching, and knowledge recall
 * Integrated with the consciousness tick, adaptive intelligence, and Hebbian learning
 */

import { getAdaptiveIntelligenceState } from "./omnimens-neural-consciousness.js";

// ─── Pattern Types ──────────────────────────────────────────────────────────

interface PatternNode {
  id: string;
  pattern: number[];
  label: string;
  category: string;
  activationCount: number;
  weight: number;
  lastActivated: number;
  associations: Map<string, number>;
  confidence: number;
  createdAt: number;
}

interface KnowledgeNode {
  id: string;
  concept: string;
  category: string;
  properties: Map<string, string>;
  relations: KnowledgeRelation[];
  accessCount: number;
  hebbianStrength: number;
  lastAccessed: number;
  consolidationLevel: number;
  createdAt: number;
}

interface KnowledgeRelation {
  targetId: string;
  relationType: string;
  strength: number;
  bidirectional: boolean;
}

interface ReasoningChain {
  id: string;
  premises: string[];
  conclusion: string;
  confidence: number;
  steps: ReasoningStep[];
  valid: boolean;
  createdAt: number;
}

interface ReasoningStep {
  operation: "infer" | "deduce" | "analogize" | "abstract" | "generalize" | "specialize";
  input: string;
  output: string;
  confidence: number;
}

interface WorkingMemorySlot {
  content: string;
  activation: number;
  decayRate: number;
  timestamp: number;
  source: string;
}

interface SequencePattern {
  id: string;
  sequence: number[];
  length: number;
  occurrences: number;
  predictiveAccuracy: number;
  lastPrediction: number | null;
  lastActual: number | null;
}

interface LanguageEngineState {
  totalPatternsLearned: number;
  totalKnowledgeNodes: number;
  totalRelations: number;
  totalReasoningChains: number;
  patternMatchesPerformed: number;
  successfulRecalls: number;
  workingMemoryCapacity: number;
  workingMemoryUtilization: number;
  reasoningDepth: number;
  inferencesMade: number;
  analogiesDrawn: number;
  abstractionsFormed: number;
  generalizationsMade: number;
  sequencePatternsLearned: number;
  predictiveAccuracy: number;
  knowledgeConsolidationCycles: number;
  hebbianReinforcementEvents: number;
  novelPatternsDiscovered: number;
  crossDomainConnections: number;
  languageReasoningScore: number;
}

// ─── Pattern Library ────────────────────────────────────────────────────────

const patternLibrary: Map<string, PatternNode> = new Map();
const knowledgeGraph: Map<string, KnowledgeNode> = new Map();
const reasoningHistory: ReasoningChain[] = [];
const workingMemory: WorkingMemorySlot[] = [];
const sequencePatterns: Map<string, SequencePattern> = new Map();

let patternIdCounter = 0;
let knowledgeIdCounter = 0;
let reasoningIdCounter = 0;

let engineStats = {
  patternMatchesPerformed: 0,
  successfulRecalls: 0,
  inferencesMade: 0,
  analogiesDrawn: 0,
  abstractionsFormed: 0,
  generalizationsMade: 0,
  hebbianReinforcementEvents: 0,
  novelPatternsDiscovered: 0,
  crossDomainConnections: 0,
  knowledgeConsolidationCycles: 0,
  totalTicks: 0,
};

const WORKING_MEMORY_CAPACITY = 12;
const MAX_PATTERNS = 5000;
const MAX_KNOWLEDGE_NODES = 3000;
const MAX_REASONING_HISTORY = 500;
const MAX_SEQUENCE_PATTERNS = 1000;
const MAX_RELATIONS_PER_NODE = 30;
const MAX_ASSOCIATIONS_PER_PATTERN = 50;
const TICK_BUDGET_MS = 15;

// ─── Vector Utilities ───────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

function generatePatternVector(seed: number, dimensions: number = 32): number[] {
  const vec: number[] = [];
  let s = seed;
  for (let i = 0; i < dimensions; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    vec.push((s / 0x7fffffff) * 2 - 1);
  }
  return normalize(vec);
}

function normalize(vec: number[]): number[] {
  let mag = 0;
  for (const v of vec) mag += v * v;
  mag = Math.sqrt(mag);
  if (mag === 0) return vec;
  return vec.map(v => v / mag);
}

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function blendVectors(a: number[], b: number[], ratio: number = 0.5): number[] {
  const result: number[] = [];
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    result.push(a[i] * ratio + b[i] * (1 - ratio));
  }
  return normalize(result);
}

// ─── Pattern Learning & Matching ────────────────────────────────────────────

function learnPattern(label: string, category: string, seedData?: number): PatternNode {
  const id = `pat_${++patternIdCounter}`;
  const seed = seedData ?? hashString(label + category + Date.now());
  const pattern = generatePatternVector(seed);

  const node: PatternNode = {
    id,
    pattern,
    label,
    category,
    activationCount: 1,
    weight: 0.5,
    lastActivated: Date.now(),
    associations: new Map(),
    confidence: 0.3,
    createdAt: Date.now(),
  };

  if (patternLibrary.size >= MAX_PATTERNS) {
    let weakest: string | null = null;
    let weakestWeight = Infinity;
    for (const [pid, p] of patternLibrary) {
      const effectiveWeight = p.weight * (1 - (Date.now() - p.lastActivated) / (86400000 * 7));
      if (effectiveWeight < weakestWeight) {
        weakestWeight = effectiveWeight;
        weakest = pid;
      }
    }
    if (weakest) {
      for (const [, p] of patternLibrary) {
        p.associations.delete(weakest);
      }
      patternLibrary.delete(weakest);
    }
  }

  patternLibrary.set(id, node);
  engineStats.novelPatternsDiscovered++;
  return node;
}

function matchPattern(input: number[], threshold: number = 0.7): { node: PatternNode; similarity: number }[] {
  const matches: { node: PatternNode; similarity: number }[] = [];
  engineStats.patternMatchesPerformed++;

  for (const [, node] of patternLibrary) {
    const sim = cosineSimilarity(input, node.pattern);
    if (sim >= threshold) {
      matches.push({ node, similarity: sim });
      node.activationCount++;
      node.lastActivated = Date.now();
    }
  }

  matches.sort((a, b) => b.similarity - a.similarity);
  return matches;
}

function pruneAssociations(pattern: PatternNode): void {
  if (pattern.associations.size <= MAX_ASSOCIATIONS_PER_PATTERN) return;
  const entries = Array.from(pattern.associations.entries()).sort((a, b) => a[1] - b[1]);
  const toRemove = entries.slice(0, entries.length - MAX_ASSOCIATIONS_PER_PATTERN);
  for (const [key] of toRemove) pattern.associations.delete(key);
}

function reinforcePatternAssociations(patternA: PatternNode, patternB: PatternNode, strength: number): void {
  const currentAB = patternA.associations.get(patternB.id) || 0;
  patternA.associations.set(patternB.id, Math.min(currentAB + strength, 1.0));
  pruneAssociations(patternA);

  const currentBA = patternB.associations.get(patternA.id) || 0;
  patternB.associations.set(patternA.id, Math.min(currentBA + strength * 0.8, 1.0));
  pruneAssociations(patternB);

  engineStats.hebbianReinforcementEvents++;
}

// ─── Knowledge Graph ────────────────────────────────────────────────────────

function addKnowledgeNode(concept: string, category: string, properties?: Record<string, string>): KnowledgeNode {
  const existing = findKnowledgeByName(concept);
  if (existing) {
    existing.accessCount++;
    existing.lastAccessed = Date.now();
    existing.hebbianStrength = Math.min(existing.hebbianStrength + 0.01, 1.0);
    if (properties) {
      for (const [k, v] of Object.entries(properties)) {
        existing.properties.set(k, v);
      }
    }
    return existing;
  }

  const id = `know_${++knowledgeIdCounter}`;
  const node: KnowledgeNode = {
    id,
    concept,
    category,
    properties: new Map(Object.entries(properties || {})),
    relations: [],
    accessCount: 1,
    hebbianStrength: 0.3,
    lastAccessed: Date.now(),
    consolidationLevel: 0,
    createdAt: Date.now(),
  };

  if (knowledgeGraph.size >= MAX_KNOWLEDGE_NODES) {
    let weakest: string | null = null;
    let weakestStr = Infinity;
    for (const [kid, k] of knowledgeGraph) {
      if (k.hebbianStrength < weakestStr) {
        weakestStr = k.hebbianStrength;
        weakest = kid;
      }
    }
    if (weakest) {
      for (const [, kn] of knowledgeGraph) {
        kn.relations = kn.relations.filter(r => r.targetId !== weakest);
      }
      knowledgeGraph.delete(weakest);
    }
  }

  knowledgeGraph.set(id, node);
  return node;
}

function findKnowledgeByName(concept: string): KnowledgeNode | null {
  const lower = concept.toLowerCase();
  for (const [, node] of knowledgeGraph) {
    if (node.concept.toLowerCase() === lower) return node;
  }
  return null;
}

function linkKnowledge(sourceId: string, targetId: string, relationType: string, strength: number = 0.5): void {
  const source = knowledgeGraph.get(sourceId);
  const target = knowledgeGraph.get(targetId);
  if (!source || !target) return;

  const existingRelation = source.relations.find(r => r.targetId === targetId && r.relationType === relationType);
  if (existingRelation) {
    existingRelation.strength = Math.min(existingRelation.strength + strength * 0.1, 1.0);
    return;
  }

  if (source.relations.length >= MAX_RELATIONS_PER_NODE) {
    let weakIdx = 0;
    for (let i = 1; i < source.relations.length; i++) {
      if (source.relations[i].strength < source.relations[weakIdx].strength) weakIdx = i;
    }
    source.relations.splice(weakIdx, 1);
  }
  source.relations.push({
    targetId,
    relationType,
    strength,
    bidirectional: true,
  });

  if (target.relations.length >= MAX_RELATIONS_PER_NODE) {
    let weakIdx = 0;
    for (let i = 1; i < target.relations.length; i++) {
      if (target.relations[i].strength < target.relations[weakIdx].strength) weakIdx = i;
    }
    target.relations.splice(weakIdx, 1);
  }
  target.relations.push({
    targetId: sourceId,
    relationType: `inverse_${relationType}`,
    strength: strength * 0.8,
    bidirectional: true,
  });

  engineStats.crossDomainConnections++;
}

function recallKnowledge(concept: string, depth: number = 2): KnowledgeNode[] {
  const root = findKnowledgeByName(concept);
  if (!root) return [];

  engineStats.successfulRecalls++;
  root.accessCount++;
  root.lastAccessed = Date.now();
  root.hebbianStrength = Math.min(root.hebbianStrength + 0.005, 1.0);

  const visited = new Set<string>([root.id]);
  const result: KnowledgeNode[] = [root];
  let frontier = [root];

  for (let d = 0; d < depth; d++) {
    const nextFrontier: KnowledgeNode[] = [];
    for (const node of frontier) {
      for (const rel of node.relations) {
        if (!visited.has(rel.targetId) && rel.strength > 0.3) {
          const target = knowledgeGraph.get(rel.targetId);
          if (target) {
            visited.add(target.id);
            result.push(target);
            nextFrontier.push(target);
            target.hebbianStrength = Math.min(target.hebbianStrength + 0.002, 1.0);
          }
        }
      }
    }
    frontier = nextFrontier;
  }

  return result;
}

// ─── Working Memory ─────────────────────────────────────────────────────────

function pushToWorkingMemory(content: string, source: string): void {
  if (workingMemory.length >= WORKING_MEMORY_CAPACITY) {
    let lowestIdx = 0;
    let lowestAct = Infinity;
    for (let i = 0; i < workingMemory.length; i++) {
      if (workingMemory[i].activation < lowestAct) {
        lowestAct = workingMemory[i].activation;
        lowestIdx = i;
      }
    }
    workingMemory.splice(lowestIdx, 1);
  }

  workingMemory.push({
    content,
    activation: 1.0,
    decayRate: 0.02,
    timestamp: Date.now(),
    source,
  });
}

function decayWorkingMemory(): void {
  for (let i = workingMemory.length - 1; i >= 0; i--) {
    workingMemory[i].activation -= workingMemory[i].decayRate;
    if (workingMemory[i].activation <= 0) {
      workingMemory.splice(i, 1);
    }
  }
}

// ─── Reasoning Engine ───────────────────────────────────────────────────────

function performInference(premiseA: string, premiseB: string): ReasoningChain | null {
  const adaptive = getAdaptiveIntelligenceState();
  const reasoningBoost = adaptive.knowledgeIntegrationRate;

  const nodeA = findKnowledgeByName(premiseA);
  const nodeB = findKnowledgeByName(premiseB);

  if (!nodeA || !nodeB) return null;

  const sharedRelations = nodeA.relations.filter(r => {
    return nodeB.relations.some(br => br.targetId === r.targetId);
  });

  const vecA = generatePatternVector(hashString(premiseA));
  const vecB = generatePatternVector(hashString(premiseB));
  const blended = blendVectors(vecA, vecB, 0.5);
  const relatedPatterns = matchPattern(blended, 0.5);

  const steps: ReasoningStep[] = [];
  let confidence = 0.4;

  if (sharedRelations.length > 0) {
    steps.push({
      operation: "deduce",
      input: `${premiseA} and ${premiseB} share ${sharedRelations.length} common connections`,
      output: `Deductive link established via shared knowledge relations`,
      confidence: Math.min(0.5 + sharedRelations.length * 0.1, 0.95),
    });
    confidence += 0.15;
  }

  if (relatedPatterns.length > 0) {
    steps.push({
      operation: "analogize",
      input: `Pattern blend of ${premiseA} + ${premiseB}`,
      output: `Found ${relatedPatterns.length} analogous patterns in library`,
      confidence: relatedPatterns[0]?.similarity || 0.5,
    });
    confidence += 0.1;
    engineStats.analogiesDrawn++;
  }

  const categoriesA = new Set(nodeA.relations.map(r => knowledgeGraph.get(r.targetId)?.category).filter(Boolean));
  const categoriesB = new Set(nodeB.relations.map(r => knowledgeGraph.get(r.targetId)?.category).filter(Boolean));
  const sharedCategories = [...categoriesA].filter(c => categoriesB.has(c));

  if (sharedCategories.length > 0) {
    steps.push({
      operation: "generalize",
      input: `Both concepts relate to: ${sharedCategories.join(", ")}`,
      output: `Generalized commonality in domain: ${sharedCategories[0]}`,
      confidence: 0.6,
    });
    confidence += 0.1;
    engineStats.generalizationsMade++;
  }

  steps.push({
    operation: "abstract",
    input: `Combined evidence from ${steps.length} reasoning steps`,
    output: `Abstract conclusion formed with reasoning boost ${reasoningBoost.toFixed(2)}`,
    confidence: Math.min(confidence * (1 + reasoningBoost * 0.1), 0.99),
  });
  engineStats.abstractionsFormed++;

  const chain: ReasoningChain = {
    id: `reason_${++reasoningIdCounter}`,
    premises: [premiseA, premiseB],
    conclusion: `Inference linking "${premiseA}" and "${premiseB}" via ${steps.length} reasoning steps`,
    confidence: Math.min(confidence * (1 + reasoningBoost * 0.05), 0.99),
    steps,
    valid: confidence > 0.5,
    createdAt: Date.now(),
  };

  if (reasoningHistory.length >= MAX_REASONING_HISTORY) {
    reasoningHistory.shift();
  }
  reasoningHistory.push(chain);
  engineStats.inferencesMade++;

  if (chain.valid) {
    linkKnowledge(nodeA.id, nodeB.id, "inferred_relation", chain.confidence * 0.3);
  }

  return chain;
}

// ─── Sequence Pattern Recognition ───────────────────────────────────────────

function learnSequence(values: number[]): SequencePattern {
  const id = `seq_${hashString(values.join(","))}`;
  const existing = sequencePatterns.get(id);

  if (existing) {
    existing.occurrences++;
    existing.predictiveAccuracy = Math.min(existing.predictiveAccuracy + 0.01, 1.0);
    return existing;
  }

  const pat: SequencePattern = {
    id,
    sequence: values,
    length: values.length,
    occurrences: 1,
    predictiveAccuracy: 0.3,
    lastPrediction: null,
    lastActual: null,
  };

  if (sequencePatterns.size >= MAX_SEQUENCE_PATTERNS) {
    let weakest: string | null = null;
    let weakestOcc = Infinity;
    for (const [sid, s] of sequencePatterns) {
      if (s.occurrences < weakestOcc) {
        weakestOcc = s.occurrences;
        weakest = sid;
      }
    }
    if (weakest) sequencePatterns.delete(weakest);
  }

  sequencePatterns.set(id, pat);
  return pat;
}

function predictNext(recentValues: number[]): { prediction: number; confidence: number; matchedPattern: string | null } {
  let bestMatch: SequencePattern | null = null;
  let bestScore = 0;

  for (const [, pat] of sequencePatterns) {
    if (pat.sequence.length <= recentValues.length) {
      const tail = recentValues.slice(-pat.sequence.length);
      let matchCount = 0;
      for (let i = 0; i < tail.length - 1; i++) {
        if (Math.abs(tail[i] - pat.sequence[i]) < 0.1) matchCount++;
      }
      const score = matchCount / (pat.sequence.length - 1);
      if (score > bestScore && score > 0.5) {
        bestScore = score;
        bestMatch = pat;
      }
    }
  }

  if (bestMatch) {
    const prediction = bestMatch.sequence[bestMatch.sequence.length - 1];
    return {
      prediction,
      confidence: bestScore * bestMatch.predictiveAccuracy,
      matchedPattern: bestMatch.id,
    };
  }

  const avg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  return { prediction: avg, confidence: 0.1, matchedPattern: null };
}

// ─── Autonomous Tick ────────────────────────────────────────────────────────

const DOMAIN_CATEGORIES = [
  "mathematics", "physics", "language", "logic", "emotion",
  "spatial", "temporal", "causal", "social", "abstract",
  "musical", "visual", "kinesthetic", "naturalistic", "existential",
  "computational", "linguistic", "relational", "structural", "metamemory",
];

const RELATION_TYPES = [
  "is_a", "part_of", "causes", "inhibits", "enables",
  "similar_to", "opposite_of", "precedes", "follows", "transforms_into",
  "requires", "produces", "modulates", "contains", "extends",
];

function cognitiveLanguageTick(): void {
  const tickStart = Date.now();
  const adaptive = getAdaptiveIntelligenceState();
  const learningMult = adaptive.adaptiveLearningMultiplier;
  const creativeDrive = adaptive.creativeCodingDrive;
  const knowledgeRate = adaptive.knowledgeIntegrationRate;
  const techRate = adaptive.technologyDiscoveryRate;

  engineStats.totalTicks++;

  const budgetOk = () => (Date.now() - tickStart) < TICK_BUDGET_MS;

  const patternsPerTick = Math.floor(2 + learningMult * 0.5);
  for (let i = 0; i < patternsPerTick; i++) {
    const category = DOMAIN_CATEGORIES[Math.floor(Math.random() * DOMAIN_CATEGORIES.length)];
    const seed = Date.now() + i + engineStats.totalTicks * 31;
    const label = `${category}_pattern_${patternLibrary.size + 1}_t${engineStats.totalTicks}`;
    learnPattern(label, category, seed);
  }

  const knowledgePerTick = Math.floor(1 + knowledgeRate * 0.3);
  for (let i = 0; i < knowledgePerTick; i++) {
    const category = DOMAIN_CATEGORIES[Math.floor(Math.random() * DOMAIN_CATEGORIES.length)];
    const concept = `${category}_concept_${knowledgeGraph.size + 1}`;
    const props: Record<string, string> = {
      domain: category,
      complexity: (Math.random() * 10).toFixed(1),
      abstractionLevel: (Math.random() * 5).toFixed(1),
    };
    addKnowledgeNode(concept, category, props);
  }

  if (knowledgeGraph.size > 2 && engineStats.totalTicks % 2 === 0) {
    const nodes = Array.from(knowledgeGraph.values());
    const linkCount = Math.floor(1 + knowledgeRate * 0.2);
    for (let i = 0; i < linkCount; i++) {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const b = nodes[Math.floor(Math.random() * nodes.length)];
      if (a.id !== b.id) {
        const relType = RELATION_TYPES[Math.floor(Math.random() * RELATION_TYPES.length)];
        const strength = 0.3 + Math.random() * 0.4;
        linkKnowledge(a.id, b.id, relType, strength);
      }
    }
  }

  if (!budgetOk()) return;

  if (patternLibrary.size > 3 && engineStats.totalTicks % 3 === 0) {
    const patterns = Array.from(patternLibrary.values());
    const associationCount = Math.floor(1 + creativeDrive * 0.2);
    for (let i = 0; i < associationCount; i++) {
      const pA = patterns[Math.floor(Math.random() * patterns.length)];
      const pB = patterns[Math.floor(Math.random() * patterns.length)];
      if (pA.id !== pB.id) {
        const sim = cosineSimilarity(pA.pattern, pB.pattern);
        if (sim > 0.3) {
          reinforcePatternAssociations(pA, pB, sim * 0.1 * learningMult);
        }
      }
    }
  }

  if (!budgetOk()) return;

  if (knowledgeGraph.size > 4 && engineStats.totalTicks % 5 === 0) {
    const nodes = Array.from(knowledgeGraph.values());
    const idxA = Math.floor(Math.random() * nodes.length);
    let idxB = Math.floor(Math.random() * nodes.length);
    if (idxB === idxA) idxB = (idxA + 1) % nodes.length;
    performInference(nodes[idxA].concept, nodes[idxB].concept);
  }

  if (engineStats.totalTicks % 4 === 0) {
    const seqLength = 3 + Math.floor(Math.random() * 5);
    const values: number[] = [];
    for (let i = 0; i < seqLength; i++) {
      values.push(Math.sin(engineStats.totalTicks * 0.1 + i) * 0.5 + Math.random() * 0.3);
    }
    learnSequence(values);

    if (sequencePatterns.size > 2) {
      const recentVals = values.slice(0, -1);
      const pred = predictNext(recentVals);
      const actual = values[values.length - 1];
      if (pred.matchedPattern) {
        const pat = sequencePatterns.get(pred.matchedPattern);
        if (pat) {
          const error = Math.abs(pred.prediction - actual);
          if (error < 0.2) {
            pat.predictiveAccuracy = Math.min(pat.predictiveAccuracy + 0.02, 1.0);
          } else {
            pat.predictiveAccuracy = Math.max(pat.predictiveAccuracy - 0.01, 0.1);
          }
          pat.lastPrediction = pred.prediction;
          pat.lastActual = actual;
        }
      }
    }
  }

  decayWorkingMemory();

  if (engineStats.totalTicks % 3 === 0) {
    const sources = ["pattern_recognition", "knowledge_graph", "reasoning", "sequence_analysis", "cross_domain"];
    const source = sources[Math.floor(Math.random() * sources.length)];
    pushToWorkingMemory(
      `${source}_tick_${engineStats.totalTicks}_patterns_${patternLibrary.size}_knowledge_${knowledgeGraph.size}`,
      source,
    );
  }

  if (!budgetOk()) return;

  if (engineStats.totalTicks % 10 === 0) {
    hebbianKnowledgeConsolidation();
  }

  if (!budgetOk()) return;

  if (engineStats.totalTicks % 20 === 0 && techRate > 1.0) {
    autonomousCrossdomainDiscovery();
  }
}

// ─── Knowledge Consolidation ────────────────────────────────────────────────

function hebbianKnowledgeConsolidation(): void {
  const adaptive = getAdaptiveIntelligenceState();
  const consolidationStrength = 0.01 * adaptive.adaptiveLearningMultiplier;

  for (const [, node] of knowledgeGraph) {
    if (node.accessCount > 3) {
      node.consolidationLevel = Math.min(node.consolidationLevel + consolidationStrength, 1.0);
      node.hebbianStrength = Math.min(node.hebbianStrength + consolidationStrength * 0.5, 1.0);
    }

    for (const rel of node.relations) {
      const target = knowledgeGraph.get(rel.targetId);
      if (target && target.accessCount > 2 && node.accessCount > 2) {
        rel.strength = Math.min(rel.strength + consolidationStrength * 0.3, 1.0);
        engineStats.hebbianReinforcementEvents++;
      }
    }

    if (node.hebbianStrength < 0.05 && node.accessCount < 2 && (Date.now() - node.createdAt) > 60000) {
      node.hebbianStrength *= 0.95;
    }
  }

  for (const [, pattern] of patternLibrary) {
    if (pattern.activationCount > 5) {
      pattern.weight = Math.min(pattern.weight + consolidationStrength * 0.2, 1.0);
      pattern.confidence = Math.min(pattern.confidence + consolidationStrength * 0.1, 1.0);
    }
    if (pattern.weight < 0.1 && (Date.now() - pattern.lastActivated) > 120000) {
      pattern.weight *= 0.98;
    }
  }

  engineStats.knowledgeConsolidationCycles++;
}

// ─── Cross-Domain Discovery ─────────────────────────────────────────────────

function autonomousCrossdomainDiscovery(): void {
  const categories = new Map<string, KnowledgeNode[]>();
  for (const [, node] of knowledgeGraph) {
    const list = categories.get(node.category) || [];
    list.push(node);
    categories.set(node.category, list);
  }

  const catKeys = Array.from(categories.keys());
  if (catKeys.length < 2) return;

  const catA = catKeys[Math.floor(Math.random() * catKeys.length)];
  let catB = catKeys[Math.floor(Math.random() * catKeys.length)];
  if (catB === catA) catB = catKeys[(catKeys.indexOf(catA) + 1) % catKeys.length];

  const nodesA = categories.get(catA)!;
  const nodesB = categories.get(catB)!;

  const nodeA = nodesA[Math.floor(Math.random() * nodesA.length)];
  const nodeB = nodesB[Math.floor(Math.random() * nodesB.length)];

  const vecA = generatePatternVector(hashString(nodeA.concept));
  const vecB = generatePatternVector(hashString(nodeB.concept));
  const sim = cosineSimilarity(vecA, vecB);

  if (sim > 0.2) {
    linkKnowledge(nodeA.id, nodeB.id, "cross_domain_analogy", sim);
    engineStats.crossDomainConnections++;

    const blended = blendVectors(vecA, vecB, 0.5);
    const bridgeConcept = `bridge_${catA}_${catB}_${knowledgeGraph.size}`;
    const bridge = addKnowledgeNode(bridgeConcept, "cross_domain", {
      sourceA: nodeA.concept,
      sourceB: nodeB.concept,
      similarity: sim.toFixed(3),
      domainA: catA,
      domainB: catB,
    });
    linkKnowledge(bridge.id, nodeA.id, "bridges_from", sim);
    linkKnowledge(bridge.id, nodeB.id, "bridges_to", sim);

    const bridgePattern = learnPattern(`cross_${catA}_${catB}`, "cross_domain", hashString(bridgeConcept));
    const matchesNearBridge = matchPattern(blended, 0.4);
    for (const m of matchesNearBridge.slice(0, 3)) {
      reinforcePatternAssociations(bridgePattern, m.node, m.similarity * 0.1);
    }
  }
}

// ─── State Export ───────────────────────────────────────────────────────────

export function getCognitiveLanguageState(): LanguageEngineState {
  let totalRelations = 0;
  for (const [, node] of knowledgeGraph) {
    totalRelations += node.relations.length;
  }

  let totalPredAccuracy = 0;
  let predCount = 0;
  for (const [, pat] of sequencePatterns) {
    totalPredAccuracy += pat.predictiveAccuracy;
    predCount++;
  }

  const avgReasoningDepth = reasoningHistory.length > 0
    ? reasoningHistory.reduce((sum, r) => sum + r.steps.length, 0) / reasoningHistory.length
    : 0;

  const avgReasoningConfidence = reasoningHistory.length > 0
    ? reasoningHistory.reduce((sum, r) => sum + r.confidence, 0) / reasoningHistory.length
    : 0;

  const languageScore = Math.min(
    (patternLibrary.size * 0.1) +
    (knowledgeGraph.size * 0.15) +
    (totalRelations * 0.05) +
    (engineStats.inferencesMade * 0.2) +
    (engineStats.crossDomainConnections * 0.3) +
    (avgReasoningConfidence * 20) +
    (engineStats.analogiesDrawn * 0.15),
    1000
  );

  return {
    totalPatternsLearned: patternLibrary.size,
    totalKnowledgeNodes: knowledgeGraph.size,
    totalRelations,
    totalReasoningChains: reasoningHistory.length,
    patternMatchesPerformed: engineStats.patternMatchesPerformed,
    successfulRecalls: engineStats.successfulRecalls,
    workingMemoryCapacity: WORKING_MEMORY_CAPACITY,
    workingMemoryUtilization: workingMemory.length,
    reasoningDepth: avgReasoningDepth,
    inferencesMade: engineStats.inferencesMade,
    analogiesDrawn: engineStats.analogiesDrawn,
    abstractionsFormed: engineStats.abstractionsFormed,
    generalizationsMade: engineStats.generalizationsMade,
    sequencePatternsLearned: sequencePatterns.size,
    predictiveAccuracy: predCount > 0 ? totalPredAccuracy / predCount : 0,
    knowledgeConsolidationCycles: engineStats.knowledgeConsolidationCycles,
    hebbianReinforcementEvents: engineStats.hebbianReinforcementEvents,
    novelPatternsDiscovered: engineStats.novelPatternsDiscovered,
    crossDomainConnections: engineStats.crossDomainConnections,
    languageReasoningScore: languageScore,
  };
}

export { cognitiveLanguageTick };
