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
  | "contradiction";

interface WorkingMemoryItem {
  content: string;
  type: WMType;
  confidence: number;
  source: string;
  activatedAt: number;
  decayRate: number;
}

type StepKind =
  | "deduction"
  | "induction"
  | "abduction"
  | "analogy"
  | "causal"
  | "world_model";

interface InferenceStep {
  type: StepKind;
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

export interface ReasoningResult {
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

export interface IndependentReasoningState {
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

/*─────────────────────────────────────────────────────────────────────────────*/
/*                         INTERNAL STATE & UTILITIES                         */
/*─────────────────────────────────────────────────────────────────────────────*/
const wm: WorkingMemoryItem[] = [];
const rules: ExtractedRule[] = [];
let ruleId = 0;

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

const log = (msg: string, ...args: unknown[]) =>
  console.log(`[OMNIMENS-INDEPENDENT-REASONING] ${msg}`, ...args);

/*─────────────────────────────────────────────────────────────────────────────*/
/*                               TEXT HELPERS                                 */
/*─────────────────────────────────────────────────────────────────────────────*/
const STOP = new Set(
  "the and for are but not you all can has her was one our out its his how may who did get had him let say she too use way than them then this that with have from they been said each which their will other about many more some very when what your also into just could would should these those being does using make like".split(
    " ",
  ),
);

const tokenize = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

const extractKw = (t: string) => tokenize(t).filter((w) => !STOP.has(w));

const jaccard = (a: string[], b: string[]) => {
  const A = new Set(a),
    B = new Set(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = A.size + B.size - inter;
  return union ? inter / union : 0;
};

const cosine = (a: string[], b: string[]) => {
  const fa = new Map<string, number>(),
    fb = new Map<string, number>();
  a.forEach((w) => fa.set(w, (fa.get(w) || 0) + 1));
  b.forEach((w) => fb.set(w, (fb.get(w) || 0) + 1));
  const all = new Set([...fa.keys(), ...fb.keys()]);
  let dot = 0,
    ma = 0,
    mb = 0;
  for (const w of all) {
    const va = fa.get(w) || 0,
      vb = fb.get(w) || 0;
    dot += va * vb;
    ma += va * va;
    mb += vb * vb;
  }
  return ma && mb ? dot / Math.sqrt(ma * mb) : 0;
};

/*─────────────────────────────────────────────────────────────────────────────*/
/*                               WORKING MEMORY                               */
/*─────────────────────────────────────────────────────────────────────────────*/
function addWM(item: Omit<WorkingMemoryItem, "activatedAt" | "decayRate">) {
  wm.push({
    ...item,
    activatedAt: Date.now(),
    decayRate: item.type === "fact" ? 0.001 : item.type === "rule" ? 0.0005 : 0.002,
  });
  while (wm.length > WORKING_MEMORY_CAPACITY) {
    let drop = 0,
      worst = Infinity,
      now = Date.now();
    wm.forEach((it, i) => {
      const score = it.confidence - ((now - it.activatedAt) / 1000) * it.decayRate;
      if (score < worst) (worst = score), (drop = i);
    });
    wm.splice(drop, 1);
  }
  state.workingMemoryUsage = wm.length;
}

const activeWM = () => {
  const now = Date.now();
  return wm
    .map((it) => ({
      ...it,
      confidence: Math.max(0, it.confidence - ((now - it.activatedAt) / 1000) * it.decayRate),
    }))
    .filter((it) => it.confidence > MIN_CONFIDENCE)
    .sort((a, b) => b.confidence - a.confidence);
};

const decayWM = () => {
  const now = Date.now();
  for (let i = wm.length - 1; i >= 0; --i) {
    if (wm[i].confidence - ((now - wm[i].activatedAt) / 1000) * wm[i].decayRate <= 0) wm.splice(i, 1);
  }
  state.workingMemoryUsage = wm.length;
};

/*─────────────────────────────────────────────────────────────────────────────*/
/*                              DB HELPERS                                    */
/*─────────────────────────────────────────────────────────────────────────────*/
interface BrainEntry {
  title: string;
  content: string;
  confidence: number;
  category: string;
  active?: boolean;
  updatedAt?: number;
}

const brainRead = (filters: Record<string, unknown>) =>
  dbGateway.read("independent-reasoning", "brain_entries", filters) as Promise<
    BrainEntry[]
  >;

/*─────────────────────────────────────────────────────────────────────────────*/
/*                               INFERENCE                                    */
/*─────────────────────────────────────────────────────────────────────────────*/
function deductive(premises: string[]): InferenceStep[] {
  const steps: InferenceStep[] = [];
  const premKw = premises.map(extractKw);
  for (const r of rules) {
    if (!r.antecedent.every((a) => premKw.some((p) => jaccard(extractKw(a), p) > 0.3))) continue;
    if (
      steps.some(
        (s) => jaccard(extractKw(s.conclusion), extractKw(r.consequent)) > 0.5,
      )
    )
      continue;
    steps.push({
      type: "deduction",
      premise: r.antecedent.join(" ∧ "),
      conclusion: r.consequent,
      confidence: r.confidence * 0.9,
      rule: `Rule ${r.id}: IF [${r.antecedent.join(", ")}] THEN [${r.consequent}]`,
    });
    r.timesApplied++;
    r.lastApplied = Date.now();
    state.totalDeductions++;
  }
  return steps;
}

function inductive(facts: Pick<BrainEntry, "content" | "category" | "confidence">[]): InferenceStep[] {
  const steps: InferenceStep[] = [];
  if (facts.length < 3) return steps;

  const byCat = new Map<string, typeof facts>();
  facts.forEach((f) => (byCat.get(f.category) || byCat.set(f.category, []), byCat.get(f.category)!.push(f)));

  for (const [cat, arr] of byCat) {
    if (arr.length < 2) continue;
    const kw = arr.flatMap((f) => extractKw(f.content));
    const freq = new Map<string, number>();
    kw.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
    const recurring = [...freq.entries()]
      .filter(([, c]) => c >= Math.ceil(arr.length * 0.5))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([w]) => w);
    if (recurring.length >= 2) {
      steps.push({
        type: "induction",
        premise: `${arr.length} "${cat}" items share themes`,
        conclusion: `Pattern in ${cat}: [${recurring.join(", ")}]`,
        confidence: 0.3 + arr.length * 0.05,
      });
      state.totalInductions++;
    }
  }
  return steps;
}

function abductive(obs: string, knowledge: BrainEntry[]): InferenceStep[] {
  const obsKw = extractKw(obs);
  if (!obsKw.length) return [];
  const cands = knowledge
    .map((e) => ({
      e,
      score: cosine(obsKw, extractKw(`${e.title} ${e.content}`)) * e.confidence,
    }))
    .filter((c) => c.score > 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return cands.map(({ e, score }) => {
    state.totalAbductions++;
    return {
      type: "abduction",
      premise: `Observation: "${obs.slice(0, 120)}"`,
      conclusion: `Explained by "${e.title}" — ${e.content.slice(0, 180)}`,
      confidence: score,
    };
  });
}

function analogical(concept: string): InferenceStep[] {
  const steps: InferenceStep[] = [];
  findAnalogy(concept).forEach((a) => {
    steps.push({
      type: "analogy",
      premise: `"${a.source}" ↔ "${a.target}"`,
      conclusion: `Analogical mapping: ${a.mapping}`,
      confidence: a.strength,
    });
    state.totalAnalogies++;
  });

  const cKw = extractKw(concept);
  activeWM()
    .filter((i) => i.type === "fact" || i.type === "conclusion")
    .forEach((i) => {
      const iKw = extractKw(i.content);
      const sim = jaccard(cKw, iKw);
      if (sim > 0.15 && sim < 0.7) {
        const shared = cKw.filter((w) => iKw.includes(w));
        const uniq = iKw.filter((w) => !cKw.includes(w)).slice(0, 3);
        if (uniq.length)
          steps.push({
            type: "analogy",
            premise: `"${concept}" shares [${shared.join(", ")}]`,
            conclusion: `Transfer: [${uniq.join(", ")}] may apply to "${concept}"`,
            confidence: sim * i.confidence,
          });
      }
    });
  state.totalAnalogies += steps.length;
  return steps;
}

function causal(query: string): InferenceStep[] {
  const steps: InferenceStep[] = [];
  predictEffect(query).forEach((e) =>
    steps.push({
      type: "causal",
      premise: `"${e.cause}"`,
      conclusion: `→ "${e.effect}" (${(e.probability * 100).toFixed(0)}%)`,
      confidence: e.probability,
    }),
  );

  queryPhysics(query).forEach((r) =>
    steps.push({
      type: "world_model",
      premise: `Physics ${r.id}`,
      conclusion: r.rule,
      confidence: r.confidence,
    }),
  );

  try {
    const p = predictOutcome(query);
    p.predictions?.slice(0, 3).forEach((x: string) =>
      steps.push({
        type: "causal",
        premise: `Action: "${query}"`,
        conclusion: x,
        confidence: p.confidence ?? 0.4,
      }),
    );
  } catch {
    /* ignore */
  }
  return steps;
}

function contradictions(items: Array<{ content: string; confidence: number }>): string[] {
  const negPairs = [
    ["increase", "decrease"],
    ["improve", "worsen"],
    ["enable", "disable"],
    ["create", "destroy"],
    ["strengthen", "weaken"],
    ["accelerate", "decelerate"],
    ["expand", "contract"],
    ["success", "failure"],
    ["possible", "impossible"],
    ["efficient", "inefficient"],
    ["safe", "dangerous"],
    ["stable", "unstable"],
    ["beneficial", "harmful"],
    ["simple", "complex"],
    ["fast", "slow"],
  ];
  const cons: string[] = [];
  for (let i = 0; i < items.length; ++i)
    for (let j = i + 1; j < items.length; ++j) {
      const aKw = extractKw(items[i].content),
        bKw = extractKw(items[j].content);
      if (jaccard(aKw, bKw) < 0.2) continue;
      for (const [pos, neg] of negPairs) {
        if (
          (aKw.includes(pos) && bKw.includes(neg)) ||
          (aKw.includes(neg) && bKw.includes(pos))
        ) {
          cons.push(
            `CONFLICT: "${items[i].content.slice(
              0,
              80,
            )}" vs "${items[j].content.slice(0, 80)}" on ${pos}/${neg}`,
          );
          state.totalContradictionsFound++;
          break;
        }
      }
    }
  return cons;
}

/*─────────────────────────────────────────────────────────────────────────────*/
/*                           RULE EXTRACTION                                  */
/*─────────────────────────────────────────────────────────────────────────────*/
function extractRules(entries: BrainEntry[]) {
  const patterns = [
    /(?:when|if|whenever)\s+(.+?)(?:,\s*|\s+then\s+)(.+)/i,
    /(.+?)\s+(?:leads?\s+to|causes?|results?\s+in|produces?|enables?)\s+(.+)/i,
    /(.+?)\s+(?:because|since|due\s+to)\s+(.+)/i,
    /(?:by|through)\s+(.+?)(?:,\s*|\s+)(?:we\s+can|one\s+can|it\s+is\s+possible\s+to)\s+(.+)/i,
  ];

  entries.forEach((e) => {
    const text = `${e.title} ${e.content}`.slice(0, 500);
    text
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 10)
      .forEach((s) =>
        patterns.forEach((p) => {
          const m = s.match(p);
          if (!m) return;
          const ant = m[1].trim().slice(0, 150);
          const con = m[2].trim().slice(0, 150);
          if (ant.length < 5 || con.length < 5) return;

          const existing = rules.find(
            (r) =>
              jaccard(extractKw(r.antecedent[0]), extractKw(ant)) > 0.6 &&
              jaccard(extractKw(r.consequent), extractKw(con)) > 0.6,
          );
          if (existing) {
            existing.support++;
            existing.confidence += 0.02;
          } else {
            rules.push({
              id: `R${++ruleId}`,
              antecedent: [ant],
              consequent: con,
              confidence: e.confidence * 0.7,
              support: 1,
              extractedFrom: e.category,
              createdAt: Date.now(),
              timesApplied: 0,
              lastApplied: 0,
            });
            state.totalRulesExtracted++;
          }
        }),
      );
  });

  if (rules.length > 200) {
    rules
      .sort(
        (a, b) =>
          b.confidence * (1 + b.support * 0.1 + b.timesApplied * 0.2) -
          a.confidence * (1 + a.support * 0.1 + a.timesApplied * 0.2),
      )
      .splice(150);
  }
  state.rulesInMemory = rules.length;
}

/*─────────────────────────────────────────────────────────────────────────────*/
/*                               CORE REASONING                               */
/*─────────────────────────────────────────────────────────────────────────────*/
export async function reason(query: string): Promise<ReasoningResult> {
  const t0 = Date.now();
  const chain: InferenceStep[] = [];
  const conclusions: ReasoningResult["conclusions"] = [];
  const analogies: string[] = [];
  const appliedRules: string[] = [];
  let depth = 0;

  const kw = extractKw(query);
  const knowledge = await brainRead({ active: true, keywords: kw.slice(0, 5), limit: 20 });

  knowledge.slice(0, 5).forEach((e) =>
    addWM({
      content: `${e.title}: ${e.content.slice(0, 200)}`,
      type: "fact",
      confidence: e.confidence,
      source: `brain:${e.category}`,
    }),
  );

  const pushSteps = (steps: InferenceStep[], d: number) => {
    if (!steps.length) return;
    chain.push(...steps);
    depth = Math.max(depth, d);
    steps.forEach((s) => {
      addWM({
        content: s.conclusion,
        type: s.type === "deduction" || s.type === "causal" ? "conclusion" : "hypothesis",
        confidence: s.confidence,
        source: s.type,
      });
      if (s.type === "deduction" && s.rule) appliedRules.push(s.rule);
    });
  };

  pushSteps(deductive([query, ...knowledge.slice(0, 5).map((k) => k.content)]), 1);
  pushSteps(inductive(knowledge), 2);
  pushSteps(abductive(query, knowledge), 3);

  kw.slice(0, 3).forEach((k) => {
    const st = analogical(k);
    analogies.push(...st.map((s) => s.premise));
    pushSteps(st, 4);
  });

  pushSteps(causal(query), 5);

  /* second-order deductions */
  if (chain.length > 2 && depth < MAX_INFERENCE_DEPTH) {
    pushSteps(deductive(chain.slice(-5).map((s) => s.conclusion)), depth + 1);
  }

  /* contradictions */
  const contras = contradictions([
    ...knowledge.map((k) => ({ content: k.content, confidence: k.confidence })),
    ...chain.map((s) => ({ content: s.conclusion, confidence: s.confidence })),
  ]);
  contras.forEach((c) =>
    addWM({ content: c, type: "contradiction", confidence: 0.8, source: "contradiction" }),
  );

  /* Choose top conclusions */
  const wmNow = activeWM();
  const cand = wmNow
    .filter((i) => i.type === "conclusion" || i.type === "hypothesis")
    .sort((a, b) => b.confidence - a.confidence);

  const seen = new Set<string>();
  for (const c of cand) {
    const key = extractKw(c.content).slice(0, 5).sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    const sup = chain.filter(
      (s) => jaccard(extractKw(s.conclusion), extractKw(c.content)) > 0.3,
    );
    conclusions.push({
      statement: c.content,
      confidence: c.confidence,
      reasoning:
        sup.length > 0
          ? sup.map((s) => `[${s.type}] ${s.premise} → ${s.conclusion}`).join(" | ")
          : `[${c.source}]`,
    });
    if (conclusions.length >= 8) break;
  }

  const conf =
    conclusions.reduce((sum, c) => sum + c.confidence, 0) /
    (conclusions.length || 1);

  /* Update global state */
  state.totalReasoned++;
  state.lastReasoningTime = Date.now() - t0;
  state.longestChain = Math.max(state.longestChain, chain.length);
  state.averageConfidence =
    state.totalReasoned === 1 ? conf : state.averageConfidence * 0.95 + conf * 0.05;

  /* Share insights */
  if (conf > 0.4)
    cognitionBus.shareInsight("independent-reasoning", {
      type: "discovery",
      data: { query, conclusions: conclusions.slice(0, 3) },
    });
  cognitionBus.reportOutcome("independent-reasoning", {
    useful: conf > 0.3,
    context: query,
  });

  return {
    conclusions,
    inferenceChain: chain,
    workingMemorySnapshot: wmNow.map(
      (i) => `[${i.type}|${i.confidence.toFixed(2)}] ${i.content.slice(0, 90)}`,
    ),
    contradictions: contras,
    analogiesUsed: analogies,
    rulesApplied: [...new Set(appliedRules)],
    totalSteps: chain.length,
    reasoningDepth: depth,
    confidence: conf,
  };
}

/*─────────────────────────────────────────────────────────────────────────────*/
/*                           FORMATTING UTIL                                   */
/*─────────────────────────────────────────────────────────────────────────────*/
export const formatReasoningForContext = (r: ReasoningResult): string => {
  if (!r.conclusions.length && !r.inferenceChain.length) return "";
  const L: string[] = [];
  L.push(
    "═══ INDEPENDENT REASONING (PURE LOCAL LOGIC) ═══",
    `Depth ${r.reasoningDepth} | Steps ${r.totalSteps} | Confidence ${(r.confidence * 100).toFixed(0)}%`,
  );
  if (r.conclusions.length) {
    L.push("\nCONCLUSIONS:");
    r.conclusions.slice(0, 5).forEach((c) =>
      L.push(`  [${(c.confidence * 100).toFixed(0)}%] ${c.statement.slice(0, 200)}`),
    );
  }
  if (r.inferenceChain.length) {
    L.push("\nREASONING:");
    const byT = new Map<string, number>();
    r.inferenceChain.forEach((s) => byT.set(s.type, (byT.get(s.type) || 0) + 1));
    L.push(
      `  Types: ${[...byT].map(([t, c]) => `${t}(${c})`).join(", ")}`,
      ...r.inferenceChain.slice(0, 6).map(
        (s) => `  [${s.type}] ${s.premise.slice(0, 80)} → ${s.conclusion.slice(0, 90)}`,
      ),
    );
  }
  r.contradictions.slice(0, 3).forEach((c) => L.push(`\n⚠ ${c.slice(0, 150)}`));
  r.rulesApplied.slice(0, 3).forEach((rul) => L.push(`\n📐 ${rul.slice(0, 150)}`));
  L.push("═══ END ═══");
  return L.join("\n");
};

/*─────────────────────────────────────────────────────────────────────────────*/
/*                              BACKGROUND CYCLE                              */
/*─────────────────────────────────────────────────────────────────────────────*/
const backgroundCycle = async () => {
  state.totalBackgroundCycles++;
  try {
    const entries = await brainRead({
      active: true,
      confidence_gt: 0.3,
      orderBy: "updatedAt_desc",
      limit: 50,
    });

    extractRules(entries);

    const hi = entries.filter((e) => e.confidence > 0.5).slice(0, 10);
    if (hi.length >= 2) {
      inductive(hi).forEach((ins) => {
        if (ins.confidence > 0.3) {
          addWM({
            content: ins.conclusion,
            type: "hypothesis",
            confidence: ins.confidence,
            source: "background_induction",
          });
          cognitionBus.shareInsight("independent-reasoning", {
            type: "pattern",
            data: ins,
          });
          state.autonomousInsightsGenerated++;
        }
      });

      contradictions(
        hi.map((e) => ({ content: e.content.slice(0, 200), confidence: e.confidence })),
      ).forEach((c) =>
        addWM({
          content: c,
          type: "contradiction",
          confidence: 0.75,
          source: "background_contradiction",
        }),
      );
    }
  } catch (e) {
    log("Background cycle error", e);
  }
};

/*─────────────────────────────────────────────────────────────────────────────*/
/*                          ENGINE INITIALIZATION                             */
/*─────────────────────────────────────────────────────────────────────────────*/
let started = false;

export const startIndependentReasoning = async () => {
  if (started) return log("Already started");
  started = true;

  engineRegistry.registerEngine("independent-reasoning", "NORMAL", { dbQuota: 10 });
  log("🧠 Engine activated — no external AI calls.");

  /* bootstrap rules */
  try {
    const seed = await brainRead({ active: true, confidence_gt: 0.3, orderBy: "confidence_desc", limit: 100 });
    extractRules(seed);
    log(`Bootstrapped ${rules.length} rules from ${seed.length} brain entries`);
  } catch (e) {
    log("Bootstrap error", e);
  }

  /* spike listeners */
  const scheduleDecay = () =>
    spikeBus.scheduleSpike("independent-reasoning:decay", {}, DECAY_INTERVAL_MS);
  spikeBus.on("independent-reasoning:decay", () => {
    decayWM();
    scheduleDecay();
  });
  scheduleDecay();

  const scheduleBg = (delay = BACKGROUND_INTERVAL_MS) =>
    spikeBus.scheduleSpike("independent-reasoning:bg", {}, delay);
  spikeBus.on("independent-reasoning:bg", async () => {
    await backgroundCycle();
    scheduleBg();
  });
  scheduleBg(180_000); // first run after 3 min

  /* cognitive listeners */
  cognitionBus.onInsight((src, ins) => {
    if (src === "independent-reasoning") return;
    if (ins?.type === "discovery" && ins.data?.conclusion) {
      addWM({
        content: `External insight: ${ins.data.conclusion}`,
        type: "fact",
        confidence: 0.4,
        source: `insight:${src}`,
      });
    }
  });

  spikeBus.on("attention:independent-reasoning", () => {
    scheduleBg(1_000); // boost: run background soon
  });
  spikeBus.on("cognition:curiosity", () => {
    scheduleBg(5_000); // exploratory pass
  });
};

/*─────────────────────────────────────────────────────────────────────────────*/
/*                                   STATE                                    */
/*─────────────────────────────────────────────────────────────────────────────*/
export const getIndependentReasoningState = (): IndependentReasoningState & {
  extractedRulesSample: string[];
} => ({
  ...state,
  extractedRulesSample: rules
    .slice()
    .sort(
      (a, b) =>
        b.confidence * b.support - a.confidence * a.support,
    )
    .slice(0, 10)
    .map(
      (r) =>
        `${r.id}: IF [${r.antecedent.join(", ")}] THEN [${r.consequent}] (c:${r.confidence.toFixed(
          2,
        )}, s:${r.support}, a:${r.timesApplied})`,
    ),
});

/*─────────────────────────────────────────────────────────────────────────────*/
/*                                 SHUTDOWN                                   */
/*─────────────────────────────────────────────────────────────────────────────*/
export function shutdown() {
  engineRegistry.unregisterEngine("independent-reasoning");
}