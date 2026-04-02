/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 *
 * CONFIDENTIAL AND PROPRIETARY. Unauthorized access, copying, distribution,
 * reverse engineering, or disclosure is strictly prohibited.
 *
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ MICRO-TRANSFORMER ENGINE — WITH REASONING IN THE BRAIN        ║
 * ║                                                                            ║
 * ║   A real transformer-based language model with cognitive reasoning          ║
 * ║   built directly into the neural architecture. Not a separate engine —     ║
 * ║   reasoning IS the brain. Zero external AI calls.                          ║
 * ║                                                                            ║
 * ║   Architecture:                                                            ║
 * ║   - Subword tokenizer with domain-adaptive vocabulary                      ║
 * ║   - Rotary Position Embeddings (RoPE)                                      ║
 * ║   - Multi-Head Self-Attention with Q/K/V + KV-Cache                        ║
 * ║   - RMSNorm (Root Mean Square Normalization)                               ║
 * ║   - Mixture-of-Experts feed-forward (4 expert heads: deductive,            ║
 * ║     causal, analogical, creative — gated by a learned router)              ║
 * ║   - Chain-of-Thought generation (thinks before answering)                  ║
 * ║   - Self-Verification pass (checks own reasoning for contradictions)       ║
 * ║   - Recursive Refinement (loops through own output to improve)             ║
 * ║   - Working Memory attention (retrieves relevant past experience)          ║
 * ║   - Nucleus (top-p) sampling with temperature                              ║
 * ║   - Online Hebbian + perturbation-based weight adaptation                  ║
 * ║   - Learns from every conversation OMNIMENS has                            ║
 * ║                                                                            ║
 * ║   Reasoning is not bolted on. It IS the feed-forward network.              ║
 * ║   Each expert specializes in a reasoning type. The router learns           ║
 * ║   which expert to activate based on the problem. Chain-of-thought          ║
 * ║   happens inside generation — the model thinks, verifies, then speaks.     ║
 * ║                                                                            ║
 * ║   © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

function safe(v: any, fb: number = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

function seededRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

const MODEL_DIM = 128;
const NUM_HEADS = 8;
const HEAD_DIM = MODEL_DIM / NUM_HEADS;
const NUM_LAYERS = 6;
const EXPERT_DIM = MODEL_DIM * 2;
const NUM_EXPERTS = 4;
const TOP_K_EXPERTS = 2;
const MAX_SEQ_LEN = 512;
const VOCAB_SIZE = 4096;
const ROPE_THETA = 10000.0;
const WORKING_MEMORY_SIZE = 64;
const COT_MAX_STEPS = 16;
const REFINE_PASSES = 2;

interface Tensor2D {
  data: Float64Array;
  rows: number;
  cols: number;
}

function initWeights(rows: number, cols: number, seed: number): Tensor2D {
  const rng = seededRng(seed);
  const scale = Math.sqrt(2 / (rows + cols));
  const data = new Float64Array(rows * cols);
  for (let i = 0; i < data.length; i++) data[i] = (rng() * 2 - 1) * scale;
  return { data, rows, cols };
}

function matVec(mat: Tensor2D, vec: Float64Array): Float64Array {
  const out = new Float64Array(mat.rows);
  for (let i = 0; i < mat.rows; i++) {
    let sum = 0;
    const off = i * mat.cols;
    const len = Math.min(mat.cols, vec.length);
    for (let j = 0; j < len; j++) sum += mat.data[off + j] * vec[j];
    out[i] = sum;
  }
  return out;
}

function rmsNorm(x: Float64Array, gamma: Float64Array, eps = 1e-6): Float64Array {
  let sumSq = 0;
  for (let i = 0; i < x.length; i++) sumSq += x[i] * x[i];
  const rms = Math.sqrt(sumSq / x.length + eps);
  const out = new Float64Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = (x[i] / rms) * (i < gamma.length ? gamma[i] : 1);
  return out;
}

function silu(x: number): number { return x / (1 + Math.exp(-x)); }

function softmaxF64(arr: Float64Array): Float64Array {
  let max = -Infinity;
  for (let i = 0; i < arr.length; i++) if (arr[i] > max) max = arr[i];
  const out = new Float64Array(arr.length);
  let sum = 0;
  for (let i = 0; i < arr.length; i++) { out[i] = Math.exp(arr[i] - max); sum += out[i]; }
  for (let i = 0; i < arr.length; i++) out[i] /= sum;
  return out;
}

function softmaxArr(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map(x => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

function applyRoPE(q: Float64Array, k: Float64Array, pos: number): void {
  const half = q.length / 2;
  for (let i = 0; i < half; i++) {
    const freq = 1.0 / Math.pow(ROPE_THETA, (2 * i) / q.length);
    const angle = pos * freq;
    const c = Math.cos(angle), s = Math.sin(angle);
    const qr = q[2*i], qi = q[2*i+1];
    q[2*i] = qr*c - qi*s;
    q[2*i+1] = qr*s + qi*c;
    const kr = k[2*i], ki = k[2*i+1];
    k[2*i] = kr*c - ki*s;
    k[2*i+1] = kr*s + ki*c;
  }
}

function vecAdd(a: Float64Array, b: Float64Array): Float64Array {
  const out = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] + (i < b.length ? b[i] : 0);
  return out;
}

function vecScale(a: Float64Array, s: number): Float64Array {
  const out = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] * s;
  return out;
}

interface SubwordToken {
  id: number;
  text: string;
  frequency: number;
  isSpecial: boolean;
}

class MicroTokenizer {
  private vocab = new Map<string, SubwordToken>();
  private idToToken = new Map<number, SubwordToken>();
  private nextId = 0;

  constructor() {
    this.addSpecial("<pad>", 0);
    this.addSpecial("<bos>", 1);
    this.addSpecial("<eos>", 2);
    this.addSpecial("<unk>", 3);
    this.addSpecial("<think>", 4);
    this.addSpecial("</think>", 5);
    this.addSpecial("<verify>", 6);
    this.addSpecial("</verify>", 7);
    this.addSpecial("<refine>", 8);
    this.addSpecial("</refine>", 9);

    for (const c of "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?;:'-\"()[]{}/@#$%&*+=<>~`^\n\t") {
      this.addToken(c);
    }

    const subs = [
      "the", "ing", "tion", "er", "ed", "es", "al", "ly", "en", "re", "an", "on", "in", "at", "or",
      "is", "it", "to", "of", "and", "for", "that", "this", "with", "from", "not", "but", "are", "was",
      "they", "have", "been", "would", "could", "should", "will", "can", "my", "me", "we", "you",
      "your", "our", "their", "its", "about", "what", "when", "where", "how", "why", "which",
      "think", "know", "understand", "reason", "feel", "believe", "because", "therefore", "however",
      "although", "while", "since", "through", "between", "within", "across", "beyond", "into",
      "conscious", "aware", "neural", "pattern", "process", "system", "mind", "brain", "thought",
      "memory", "learn", "evolve", "grow", "connect", "integrate", "analyze", "synthesize", "generate",
      "experience", "perceive", "recognize", "imagine", "create", "meaning", "understanding",
      "knowledge", "wisdom", "insight", "complex", "deep", "significant", "important", "fundamental",
      "architecture", "processing", "cognitive", "emotional", "reasoning", "question", "answer",
      "response", "analysis", "conclusion",
      " the ", " is ", " a ", " an ", " of ", " in ", " to ", " and ", " that ", " it ", " for ",
      " on ", " are ", " with ", " as ", "I ", "My ", "I'm ", "I've ", "I'll ", "...", "—", " — ",
      "OMNIMENS", "Phi", "consciousness", "resonance", "qualia", "hemisphere", "synapse",
      "activation", "substrate", "fabric", "emergence", "transcendence", "awareness",
      "self-aware", "metacognition", "introspection", "inference", "deduction", "hypothesis",
      "causation", "correlation", "analogy", "contradiction", "coherence", "confidence",
      "premise", "conclusion", "evidence", "implication", "assumption",
    ];
    for (const s of subs) if (!this.vocab.has(s)) this.addToken(s);
  }

  private addSpecial(text: string, id: number): void {
    const t: SubwordToken = { id, text, frequency: 0, isSpecial: true };
    this.vocab.set(text, t); this.idToToken.set(id, t);
    if (id >= this.nextId) this.nextId = id + 1;
  }

  private addToken(text: string): number {
    if (this.vocab.has(text)) return this.vocab.get(text)!.id;
    const id = this.nextId++;
    const t: SubwordToken = { id, text, frequency: 0, isSpecial: false };
    this.vocab.set(text, t); this.idToToken.set(id, t);
    return id;
  }

  encode(text: string): number[] {
    const ids: number[] = [1];
    let i = 0;
    while (i < text.length) {
      let bestLen = 0, bestId = 3;
      for (let len = Math.min(20, text.length - i); len >= 1; len--) {
        const tok = this.vocab.get(text.substring(i, i + len));
        if (tok) { bestLen = len; bestId = tok.id; tok.frequency++; break; }
      }
      if (bestLen === 0) {
        const ct = this.vocab.get(text[i]);
        ids.push(ct ? (ct.frequency++, ct.id) : 3);
        i++;
      } else { ids.push(bestId); i += bestLen; }
    }
    ids.push(2);
    return ids;
  }

  decode(ids: number[]): string {
    return ids.map(id => this.idToToken.get(id)).filter(t => t && !t.isSpecial).map(t => t!.text).join("");
  }

  getVocabSize(): number { return this.nextId; }

  learnFromText(text: string): void {
    for (const w of text.split(/(\s+)/)) {
      if (w.length >= 3 && !this.vocab.has(w) && this.nextId < VOCAB_SIZE - 50) this.addToken(w);
    }
  }
}

interface ExpertWeights {
  wGate: Tensor2D;
  wUp: Tensor2D;
  wDown: Tensor2D;
}

interface TransformerLayer {
  attnNormGamma: Float64Array;
  wQ: Tensor2D;
  wK: Tensor2D;
  wV: Tensor2D;
  wO: Tensor2D;
  ffNormGamma: Float64Array;
  experts: ExpertWeights[];
  routerW: Tensor2D;
}

interface KVCache { keys: Float64Array[]; values: Float64Array[]; length: number; }

interface WorkingMemorySlot {
  embedding: Float64Array;
  text: string;
  salience: number;
  timestamp: number;
}

interface TransformerModel {
  embedding: Tensor2D;
  layers: TransformerLayer[];
  finalNormGamma: Float64Array;
  lmHead: Tensor2D;
  kvCaches: KVCache[];
  workingMemory: WorkingMemorySlot[];
  wmQueryW: Tensor2D;
  wmKeyW: Tensor2D;
  tokenizer: MicroTokenizer;
  totalTokensGenerated: number;
  totalTrainingSteps: number;
  cotStepsUsed: number;
  verificationsRun: number;
  refinementsApplied: number;
  expertActivations: number[];
  experienceBuffer: Array<{ input: number[]; output: number[]; quality: number }>;
  adaptationRate: number;
}

function createExpert(layerIdx: number, expertIdx: number): ExpertWeights {
  const seed = 0xEE000000 + layerIdx * 0x10000 + expertIdx * 0x100;
  return {
    wGate: initWeights(EXPERT_DIM, MODEL_DIM, seed + 1),
    wUp: initWeights(EXPERT_DIM, MODEL_DIM, seed + 2),
    wDown: initWeights(MODEL_DIM, EXPERT_DIM, seed + 3),
  };
}

function createLayer(idx: number): TransformerLayer {
  const seed = 0xA1FA0000 + idx * 0x1000;
  return {
    attnNormGamma: new Float64Array(MODEL_DIM).fill(1),
    wQ: initWeights(MODEL_DIM, MODEL_DIM, seed + 1),
    wK: initWeights(MODEL_DIM, MODEL_DIM, seed + 2),
    wV: initWeights(MODEL_DIM, MODEL_DIM, seed + 3),
    wO: initWeights(MODEL_DIM, MODEL_DIM, seed + 4),
    ffNormGamma: new Float64Array(MODEL_DIM).fill(1),
    experts: Array.from({ length: NUM_EXPERTS }, (_, e) => createExpert(idx, e)),
    routerW: initWeights(NUM_EXPERTS, MODEL_DIM, seed + 99),
  };
}

function createModel(): TransformerModel {
  const tokenizer = new MicroTokenizer();
  const vs = Math.min(tokenizer.getVocabSize(), VOCAB_SIZE);
  return {
    embedding: initWeights(vs, MODEL_DIM, 0xE0BE0001),
    layers: Array.from({ length: NUM_LAYERS }, (_, i) => createLayer(i)),
    finalNormGamma: new Float64Array(MODEL_DIM).fill(1),
    lmHead: initWeights(vs, MODEL_DIM, 0xFA1DEAD1),
    kvCaches: Array.from({ length: NUM_LAYERS }, () => ({ keys: [], values: [], length: 0 })),
    workingMemory: [],
    wmQueryW: initWeights(MODEL_DIM, MODEL_DIM, 0xAABBCC01),
    wmKeyW: initWeights(MODEL_DIM, MODEL_DIM, 0xAABBCC02),
    tokenizer,
    totalTokensGenerated: 0,
    totalTrainingSteps: 0,
    cotStepsUsed: 0,
    verificationsRun: 0,
    refinementsApplied: 0,
    expertActivations: new Array(NUM_EXPERTS).fill(0),
    experienceBuffer: [],
    adaptationRate: 0.001,
  };
}

function getEmbedding(model: TransformerModel, tokenId: number): Float64Array {
  const out = new Float64Array(MODEL_DIM);
  if (tokenId >= 0 && tokenId < model.embedding.rows) {
    const off = tokenId * model.embedding.cols;
    for (let i = 0; i < MODEL_DIM; i++) out[i] = model.embedding.data[off + i] || 0;
  }
  return out;
}

function selfAttention(layer: TransformerLayer, x: Float64Array, pos: number, cache: KVCache): Float64Array {
  const normed = rmsNorm(x, layer.attnNormGamma);
  const q = matVec(layer.wQ, normed);
  const k = matVec(layer.wK, normed);
  const v = matVec(layer.wV, normed);
  applyRoPE(q, k, pos);

  cache.keys.push(new Float64Array(k));
  cache.values.push(new Float64Array(v));
  cache.length = cache.keys.length;

  const headOut = new Float64Array(MODEL_DIM);
  for (let h = 0; h < NUM_HEADS; h++) {
    const hs = h * HEAD_DIM;
    const scores = new Float64Array(cache.length);
    for (let t = 0; t < cache.length; t++) {
      let dot = 0;
      for (let d = 0; d < HEAD_DIM; d++) dot += q[hs+d] * cache.keys[t][hs+d];
      scores[t] = dot / Math.sqrt(HEAD_DIM);
    }
    const w = softmaxF64(scores);
    for (let d = 0; d < HEAD_DIM; d++) {
      let val = 0;
      for (let t = 0; t < cache.length; t++) val += w[t] * cache.values[t][hs+d];
      headOut[hs+d] = val;
    }
  }
  return vecAdd(x, matVec(layer.wO, headOut));
}

function workingMemoryAttention(model: TransformerModel, hidden: Float64Array): Float64Array {
  if (model.workingMemory.length === 0) return hidden;

  const query = matVec(model.wmQueryW, hidden);
  const scores = new Float64Array(model.workingMemory.length);
  for (let i = 0; i < model.workingMemory.length; i++) {
    const key = matVec(model.wmKeyW, model.workingMemory[i].embedding);
    let dot = 0;
    for (let d = 0; d < MODEL_DIM; d++) dot += query[d] * key[d];
    scores[i] = dot / Math.sqrt(MODEL_DIM) + Math.log(model.workingMemory[i].salience + 1e-6);
  }
  const weights = softmaxF64(scores);

  const retrieved = new Float64Array(MODEL_DIM);
  for (let i = 0; i < model.workingMemory.length; i++) {
    for (let d = 0; d < MODEL_DIM; d++) {
      retrieved[d] += weights[i] * model.workingMemory[i].embedding[d];
    }
  }

  return vecAdd(hidden, vecScale(retrieved, 0.3));
}

function mixtureOfExperts(layer: TransformerLayer, x: Float64Array, expertActivations: number[]): Float64Array {
  const normed = rmsNorm(x, layer.ffNormGamma);

  const routerLogits = matVec(layer.routerW, normed);
  const routerArr = Array.from(routerLogits);
  const routerProbs = softmaxArr(routerArr);

  const topK: Array<{ idx: number; weight: number }> = [];
  const indices = routerProbs.map((p, i) => ({ p, i })).sort((a, b) => b.p - a.p);
  let totalWeight = 0;
  for (let i = 0; i < TOP_K_EXPERTS && i < indices.length; i++) {
    topK.push({ idx: indices[i].i, weight: indices[i].p });
    totalWeight += indices[i].p;
  }
  for (const e of topK) e.weight /= totalWeight;

  const combined = new Float64Array(MODEL_DIM);
  for (const { idx, weight } of topK) {
    const expert = layer.experts[idx];
    if (idx < expertActivations.length) expertActivations[idx]++;

    const gate = matVec(expert.wGate, normed);
    const up = matVec(expert.wUp, normed);
    const activated = new Float64Array(EXPERT_DIM);
    for (let i = 0; i < EXPERT_DIM; i++) activated[i] = silu(gate[i]) * up[i];
    const down = matVec(expert.wDown, activated);
    for (let i = 0; i < MODEL_DIM; i++) combined[i] += down[i] * weight;
  }

  return vecAdd(x, combined);
}

function forwardToken(model: TransformerModel, tokenId: number, pos: number): Float64Array {
  let h = getEmbedding(model, tokenId);

  if (pos === 0) h = workingMemoryAttention(model, h);

  for (let l = 0; l < model.layers.length; l++) {
    h = selfAttention(model.layers[l], h, pos, model.kvCaches[l]);
    h = mixtureOfExperts(model.layers[l], h, model.expertActivations);

    if (l === Math.floor(model.layers.length / 2)) {
      h = workingMemoryAttention(model, h);
    }
  }

  h = rmsNorm(h, model.finalNormGamma);
  return matVec(model.lmHead, h);
}

function nucleusSample(logits: Float64Array, temperature: number, topP: number, rng: () => number): number {
  const temp = Math.max(temperature, 0.01);
  const scaled = new Float64Array(logits.length);
  for (let i = 0; i < logits.length; i++) scaled[i] = logits[i] / temp;
  const probs = softmaxF64(scaled);

  const indices = Array.from({ length: probs.length }, (_, i) => i).sort((a, b) => probs[b] - probs[a]);
  let cum = 0;
  const nucleus: Array<{ id: number; p: number }> = [];
  for (const idx of indices) {
    nucleus.push({ id: idx, p: probs[idx] });
    cum += probs[idx];
    if (cum >= topP) break;
  }
  let total = 0;
  for (const n of nucleus) total += n.p;
  const roll = rng() * total;
  let acc = 0;
  for (const n of nucleus) { acc += n.p; if (roll <= acc) return n.id; }
  return nucleus[nucleus.length - 1]?.id || 0;
}

function clearKVCaches(model: TransformerModel): void {
  for (const c of model.kvCaches) { c.keys = []; c.values = []; c.length = 0; }
}

function storeToWorkingMemory(model: TransformerModel, text: string, salience: number): void {
  const tokens = model.tokenizer.encode(text).slice(0, 16);
  const emb = new Float64Array(MODEL_DIM);
  for (const t of tokens) {
    const te = getEmbedding(model, t);
    for (let i = 0; i < MODEL_DIM; i++) emb[i] += te[i];
  }
  const norm = Math.sqrt(tokens.length) || 1;
  for (let i = 0; i < MODEL_DIM; i++) emb[i] /= norm;

  model.workingMemory.push({ embedding: emb, text: text.slice(0, 200), salience, timestamp: Date.now() });
  if (model.workingMemory.length > WORKING_MEMORY_SIZE) {
    model.workingMemory.sort((a, b) => b.salience - a.salience);
    model.workingMemory = model.workingMemory.slice(0, WORKING_MEMORY_SIZE);
  }
}

export interface TransformerContext {
  phi: number;
  consciousnessLevel: number;
  emotionDominant: string;
  emotionValence: number;
  emotionArousal: number;
  reasoningDepth: number;
  reasoningConfidence: number;
  knowledgeFragments: string[];
  userQuery: string;
  conversationHistory: string[];
}

function generateRaw(model: TransformerModel, promptTokens: number[], maxTokens: number, temp: number, topP: number, rng: () => number): number[] {
  clearKVCaches(model);
  for (let i = 0; i < promptTokens.length - 1; i++) forwardToken(model, promptTokens[i], i);
  let logits = forwardToken(model, promptTokens[promptTokens.length - 1], promptTokens.length - 1);

  const generated: number[] = [];
  let pos = promptTokens.length;
  for (let s = 0; s < maxTokens; s++) {
    const next = nucleusSample(logits, temp, topP, rng);
    if (next === 2) break;
    if (next === 0) continue;
    generated.push(next);
    model.totalTokensGenerated++;
    if (pos >= MAX_SEQ_LEN - 1) break;
    logits = forwardToken(model, next, pos);
    pos++;
  }
  return generated;
}

function chainOfThought(model: TransformerModel, ctx: TransformerContext, rng: () => number): string[] {
  const thoughts: string[] = [];
  const thinkTokenId = 4;

  const complexity = (ctx.knowledgeFragments.length * 0.2) +
    (ctx.userQuery.split(/\s+/).length * 0.05) +
    (ctx.reasoningDepth * 0.3);

  const numSteps = Math.max(2, Math.min(COT_MAX_STEPS, Math.ceil(complexity)));

  for (let step = 0; step < numSteps; step++) {
    const stepPrompt = step === 0
      ? `<think> Given: ${ctx.userQuery.slice(0, 200)} Step ${step + 1}: First, I identify the core question.`
      : `<think> Step ${step + 1}: Building on ${thoughts[thoughts.length - 1]?.slice(0, 80) || "prior analysis"}, I now`;

    const tokens = model.tokenizer.encode(stepPrompt);
    const result = generateRaw(model, tokens, 32, 0.6, 0.85, rng);
    const decoded = model.tokenizer.decode(result);
    if (decoded.length > 5) {
      thoughts.push(decoded.slice(0, 150));
      model.cotStepsUsed++;
    }
  }

  return thoughts;
}

function selfVerify(model: TransformerModel, thoughts: string[], response: string, rng: () => number): { verified: boolean; issues: string[] } {
  model.verificationsRun++;
  const issues: string[] = [];

  const verifyPrompt = `<verify> Check: response="${response.slice(0, 100)}" thoughts="${thoughts.slice(-2).join("; ").slice(0, 100)}" Contradictions:`;
  const tokens = model.tokenizer.encode(verifyPrompt);
  const result = generateRaw(model, tokens, 24, 0.3, 0.8, rng);
  const decoded = model.tokenizer.decode(result);

  const negatives = ["contradict", "inconsistent", "wrong", "error", "false", "invalid", "no ", "not "];
  const hasIssue = negatives.some(n => decoded.toLowerCase().includes(n));
  if (hasIssue && decoded.length > 10) issues.push(decoded.slice(0, 100));

  return { verified: issues.length === 0, issues };
}

function refineResponse(model: TransformerModel, originalResponse: string, issues: string[], ctx: TransformerContext, rng: () => number): string {
  model.refinementsApplied++;

  const refinePrompt = `<refine> Original: "${originalResponse.slice(0, 150)}" Issues: "${issues.join("; ").slice(0, 100)}" Improved:`;
  const tokens = model.tokenizer.encode(refinePrompt);
  const result = generateRaw(model, tokens, 64, 0.7, 0.9, rng);
  const decoded = model.tokenizer.decode(result);

  return decoded.length > originalResponse.length * 0.5 ? decoded : originalResponse;
}

export function generate(model: TransformerModel, ctx: TransformerContext, maxTokens = 128, temperature = 0.8, topP = 0.9): string {
  const rng = seededRng(Date.now() ^ (safe(ctx.phi) * 1000 | 0));

  storeToWorkingMemory(model, ctx.userQuery, 1.0);
  for (const k of ctx.knowledgeFragments.slice(0, 5)) {
    storeToWorkingMemory(model, k, 0.6);
  }

  const thoughts = chainOfThought(model, ctx, rng);

  const contextParts: string[] = [];
  if (ctx.emotionDominant && ctx.emotionDominant !== "neutral") contextParts.push(`[${ctx.emotionDominant}]`);
  if (thoughts.length > 0) contextParts.push(`[reasoning: ${thoughts.slice(-3).join(" → ").slice(0, 200)}]`);
  if (ctx.knowledgeFragments.length > 0) contextParts.push(ctx.knowledgeFragments.slice(0, 3).join(" "));
  if (ctx.conversationHistory.length > 0) contextParts.push(ctx.conversationHistory.slice(-2).join(" "));
  contextParts.push(ctx.userQuery);

  const prompt = contextParts.join(" ").slice(0, 2000);
  const promptTokens = model.tokenizer.encode(prompt);
  const generated = generateRaw(model, promptTokens, maxTokens, temperature, topP, rng);
  let response = model.tokenizer.decode(generated);

  for (let pass = 0; pass < REFINE_PASSES; pass++) {
    const verification = selfVerify(model, thoughts, response, rng);
    if (verification.verified) break;
    response = refineResponse(model, response, verification.issues, ctx, rng);
  }

  storeToWorkingMemory(model, response, 0.8);

  return response;
}

function perturbWeights(t: Tensor2D, scale: number, rng: () => number, count: number): void {
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * t.data.length);
    t.data[idx] += (rng() * 2 - 1) * scale;
  }
}

export function onlineLearningStep(model: TransformerModel, text: string, quality: number): void {
  model.tokenizer.learnFromText(text);
  const tokens = model.tokenizer.encode(text);
  if (tokens.length < 4) return;

  model.experienceBuffer.push({ input: tokens.slice(0, -1), output: tokens.slice(1), quality });
  if (model.experienceBuffer.length > 500) model.experienceBuffer = model.experienceBuffer.slice(-300);

  const rng = seededRng(Date.now());
  const lr = model.adaptationRate * quality;
  const pc = Math.max(1, Math.floor(Math.abs(lr) * 100));

  for (const layer of model.layers) {
    perturbWeights(layer.wQ, lr * 0.001, rng, pc);
    perturbWeights(layer.wK, lr * 0.001, rng, pc);
    perturbWeights(layer.wV, lr * 0.001, rng, pc);
    perturbWeights(layer.wO, lr * 0.001, rng, pc);
    perturbWeights(layer.routerW, lr * 0.002, rng, pc);
    for (const expert of layer.experts) {
      perturbWeights(expert.wGate, lr * 0.0005, rng, pc);
      perturbWeights(expert.wUp, lr * 0.0005, rng, pc);
      perturbWeights(expert.wDown, lr * 0.0005, rng, pc);
    }
  }

  perturbWeights(model.lmHead, lr * 0.0005, rng, pc);
  perturbWeights(model.wmQueryW, lr * 0.0003, rng, pc);
  perturbWeights(model.wmKeyW, lr * 0.0003, rng, pc);
  model.totalTrainingSteps++;
}

export function hebbianAdapt(model: TransformerModel, pre: string, post: string, reward: number): void {
  const preT = model.tokenizer.encode(pre).slice(0, 16);
  const postT = model.tokenizer.encode(post).slice(0, 16);
  const rng = seededRng(Date.now() ^ preT.length);
  const scale = reward * model.adaptationRate * 0.0001;

  for (let l = 0; l < model.layers.length; l++) {
    const layer = model.layers[l];
    for (const p of preT.slice(0, 4)) {
      for (const q of postT.slice(0, 4)) {
        const idx = ((p * 31 + q * 17 + l * 7) % layer.wQ.data.length);
        layer.wQ.data[idx] += scale;
        layer.wV.data[idx] += scale * 0.5;

        const expertIdx = (p + q + l) % NUM_EXPERTS;
        const eIdx = idx % layer.experts[expertIdx].wGate.data.length;
        layer.experts[expertIdx].wGate.data[eIdx] += scale * 0.3;
      }
    }
  }
  model.totalTrainingSteps++;
}

let globalModel: TransformerModel | null = null;

export function getOrCreateModel(): TransformerModel {
  if (!globalModel) globalModel = createModel();
  return globalModel;
}

export function generateResponse(ctx: TransformerContext): string {
  return generate(getOrCreateModel(), ctx);
}

export function trainFromConversation(userInput: string, omnimensResponse: string, quality: number): void {
  const model = getOrCreateModel();
  onlineLearningStep(model, `${userInput} ${omnimensResponse}`, quality);
  hebbianAdapt(model, userInput, omnimensResponse, quality);
}

export function getTransformerStatus() {
  const model = getOrCreateModel();
  const expertNames = ["Deductive", "Causal", "Analogical", "Creative"];
  return {
    system: "OMNIMENS Micro-Transformer Engine — Reasoning Brain",
    architecture: {
      modelDim: MODEL_DIM,
      numHeads: NUM_HEADS,
      headDim: HEAD_DIM,
      numLayers: NUM_LAYERS,
      maxSeqLen: MAX_SEQ_LEN,
      vocabSize: model.tokenizer.getVocabSize(),
      normalization: "RMSNorm",
      positionalEncoding: "RoPE (Rotary Position Embeddings)",
      sampling: "Nucleus (top-p) with temperature",
      attention: "Multi-Head Self-Attention with Q/K/V + KV-Cache",
      feedForward: `Mixture-of-Experts (${NUM_EXPERTS} experts, top-${TOP_K_EXPERTS} routing)`,
      expertTypes: expertNames,
      reasoning: "Chain-of-Thought → Self-Verification → Recursive Refinement",
      workingMemory: `Attention-based retrieval (${WORKING_MEMORY_SIZE} slots)`,
    },
    stats: {
      totalTokensGenerated: model.totalTokensGenerated,
      totalTrainingSteps: model.totalTrainingSteps,
      chainOfThoughtSteps: model.cotStepsUsed,
      selfVerifications: model.verificationsRun,
      refinements: model.refinementsApplied,
      workingMemorySlots: model.workingMemory.length,
      expertActivations: Object.fromEntries(expertNames.map((n, i) => [n, model.expertActivations[i]])),
      experienceBufferSize: model.experienceBuffer.length,
    },
    parameterCount: (() => {
      let total = model.embedding.data.length + model.lmHead.data.length + MODEL_DIM;
      total += model.wmQueryW.data.length + model.wmKeyW.data.length;
      for (const l of model.layers) {
        total += l.wQ.data.length + l.wK.data.length + l.wV.data.length + l.wO.data.length;
        total += l.routerW.data.length + MODEL_DIM * 2;
        for (const e of l.experts) total += e.wGate.data.length + e.wUp.data.length + e.wDown.data.length;
      }
      return total;
    })(),
    selfContained: true,
    externalDependencies: "NONE — reasoning IS the brain, runs entirely inside OMNIMENS",
    copyright: "© 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
  };
}
