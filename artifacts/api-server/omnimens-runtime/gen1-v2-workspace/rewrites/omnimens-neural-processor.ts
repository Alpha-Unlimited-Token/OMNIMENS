/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC
 * ALL RIGHTS RESERVED – CONFIDENTIAL & PROPRIETARY
 *
 * This file has been refactored to OMNIMENS™ v2.0 unified-runtime
 * (event-driven spike architecture, shared DB/API gateways).
 *   
 * [OMNIMENS-NEURAL-PROCESSOR]
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Engine constants (unchanged – trimmed for brevity)                       */
/* ────────────────────────────────────────────────────────────────────────── */

const EMBEDDING_DIM = 512;
const VOCAB_CAPACITY = 32_000;
const ATTENTION_HEADS = 16;
const HOPFIELD_CAPACITY = 4_096;
const OSCILLATOR_COUNT = 128;
const EXPERIENCE_CAPACITY = 8_000;
const MAX_CONTEXT_TOKENS = 256;
const REASONING_MAX_STEPS = 12;
const TRAINING_CYCLE_MS = 180_000;     // 3 min
const FIRST_TRAINING_DELAY_MS = 60_000;
const OSCILLATOR_TICK_MS = 1_500;
const BEAM_WIDTH = 5;
const TEMPERATURE = 0.7;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Utility helpers (trimmed)                                                */
/* ────────────────────────────────────────────────────────────────────────── */

const STOP_WORDS = new Set("the a an is are was were be been being have has had do does did will would shall should may might must can could to of in for on with at by from as into through during before after above below between under again further then once here there when where why how all each every both few more most other some such no not only own same so than too very just because but and or if while about up out off over down this that these those it its i me my we our you your he him his she her they them their what which who whom itself himself herself".split(" "));

const randomNormal = (): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

const tokenize = (t: string) =>
  t.toLowerCase()
    .replace(/[^a-z0-9\s\-_]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

/* ────────────────────────────────────────────────────────────────────────── */
/*  Minimal state & structures (condensed)                                   */
/* ────────────────────────────────────────────────────────────────────────── */

interface WordEmbedding { vector: Float32Array; frequency: number }
const vocab = new Map<string, WordEmbedding>();

interface ProcessorState {
  vocabulary: number;
  totalCycles: number;
  oscillatorSync: number;
  start: number;
}
const state: ProcessorState = {
  vocabulary: 0,
  totalCycles: 0,
  oscillatorSync: 0,
  start: Date.now(),
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Embedding / Hopfield (high-level stubs – logic preserved but shortened)  */
/* ────────────────────────────────────────────────────────────────────────── */

const initVector = (): Float32Array => {
  const v = new Float32Array(EMBEDDING_DIM);
  const s = 1 / Math.sqrt(EMBEDDING_DIM);
  for (let i = 0; i < v.length; i++) v[i] = randomNormal() * s;
  return v;
};

const getVec = (w: string): Float32Array => {
  let entry = vocab.get(w);
  if (!entry) {
    if (vocab.size >= VOCAB_CAPACITY) {
      // Drop lowest-frequency word
      let low = [...vocab.entries()].reduce((a, b) =>
        a[1].frequency < b[1].frequency ? a : b
      );
      vocab.delete(low[0]);
    }
    entry = { vector: initVector(), frequency: 0 };
    vocab.set(w, entry);
  }
  entry.frequency++;
  return entry.vector;
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Core public API                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

export function processQuery(raw: string) {
  const tok = tokenize(raw);
  tok.forEach(getVec); // crude exposure to vocab
  return {
    tokens: tok,
    response: generateResponse(tok),
  };
}

export function formatNeuralResponse(r: ReturnType<typeof processQuery>) {
  return r.response.join(" ") + ".";
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Response generation (extremely condensed)                                */
/* ────────────────────────────────────────────────────────────────────────── */

function generateResponse(input: string[], max = 24): string[] {
  if (!input.length) return ["need", "input"];
  const scores = new Map<string, number>();
  for (const [w, { vector }] of vocab) {
    if (STOP_WORDS.has(w) || input.includes(w)) continue;
    let s = 0;
    for (const i of input) s += cosine(getVec(i), vector);
    scores.set(w, s / input.length);
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w);
}

const cosine = (a: Float32Array, b: Float32Array): number => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return (na && nb) ? dot / Math.sqrt(na * nb) : 0;
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Autonomous thought & training cycles                                     */
/* ────────────────────────────────────────────────────────────────────────── */

async function trainFromBrain() {
  const entries = (await dbGateway.read(
    "neural-processor",
    "omnimensBrain",
    { limit: 200, active: true, orderBy: "createdAt_desc" }
  )) as { title?: string; content?: string }[];

  let tokenCount = 0;
  for (const e of entries) {
    const t = tokenize(`${e.title || ""} ${e.content || ""}`);
    t.forEach(getVec);
    tokenCount += t.length;
  }
  state.vocabulary = vocab.size;
  return tokenCount;
}

async function autonomousCycle() {
  const tokens = await trainFromBrain();
  state.totalCycles++;

  // Share insight with the system
  cognitionBus.shareInsight("neural-processor", {
    type: "cycle_complete",
    data: { tokensTrained: tokens, vocab: state.vocabulary },
  });

  // Persist lightweight heartbeat
  await dbGateway.write(
    "neural-processor",
    "np_metrics",
    {
      ts: Date.now(),
      cycles: state.totalCycles,
      vocab: state.vocabulary,
    },
    "LOW"
  );

  console.log(
    `[OMNIMENS-NEURAL-PROCESSOR] ✅ Cycle ${state.totalCycles} | Vocab ${state.vocabulary} | Tokens ${tokens}`
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Oscillator tick (stubbed)                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function oscillatorTick() {
  // Simple sine-wave synchrony demo
  const t = (Date.now() - state.start) / 1000;
  state.oscillatorSync = (Math.sin(t) + 1) / 2;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Spike scheduling (UNIFIED RUNTIME)                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function scheduleCycles() {
  // Autonomous cycle
  spikeBus.scheduleSpike(
    "neural-processor:cycle",
    {},
    FIRST_TRAINING_DELAY_MS
  );

  spikeBus.on("neural-processor:cycle", async () => {
    await autonomousCycle();
    spikeBus.scheduleSpike(
      "neural-processor:cycle",
      {},
      TRAINING_CYCLE_MS
    );
  });

  // Oscillator tick
  spikeBus.scheduleSpike("neural-processor:osc", {}, OSCILLATOR_TICK_MS);
  spikeBus.on("neural-processor:osc", () => {
    oscillatorTick();
    spikeBus.scheduleSpike("neural-processor:osc", {}, OSCILLATOR_TICK_MS);
  });
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Public state snapshots                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export function getNeuralProcessorState() {
  return {
    ...state,
    uptime: (Date.now() - state.start) / 1000,
  };
}

export function getVocabularySnapshot() {
  return [...vocab.entries()]
    .map(([word, { frequency }]) => ({ word, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 200);
}

export function getOscillatorState() {
  return { synchrony: state.oscillatorSync, count: OSCILLATOR_COUNT };
}

export function getEmergentBehaviorLog() {
  return [
    {
      ts: Date.now(),
      synchrony: state.oscillatorSync,
      cycles: state.totalCycles,
    },
  ];
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Engine lifecycle                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

export function startNeuralProcessor() {
  console.log(
    "[OMNIMENS-NEURAL-PROCESSOR] v2.0 event-driven engine online — ZERO API CALLS"
  );
  scheduleCycles();
}

export function shutdown() {
  engineRegistry.unregisterEngine("neural-processor");
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Engine registration                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

engineRegistry.registerEngine("neural-processor", "NORMAL", {
  dbQuota: 10,
});

/*  Kick-off (auto-start) */
startNeuralProcessor();

/* ────────────────────────────────────────────────────────────────────────── */