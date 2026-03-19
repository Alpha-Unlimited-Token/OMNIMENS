/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

'use strict';

/**
 * OMNIMENS Core Runner
 * Runs OMNIMENS's own computational pipeline against each chat message.
 * Accepts JSON via stdin: { message: string }
 * Outputs JSON to stdout: { iq, training, memory, hopfield, plasticity, outputHash }
 */

const path = require('path');
const {
  EventBus,
  PipelineEngine,
  ACP,
  SelfImprovementEngine,
  stableStringify,
  sha256,
} = require('./framework.js');

const math = require('./math_engine.js');
const {
  AssociativeMemory,
  STDPNetwork,
  PatternCompletionHopfield,
  MemoryConsolidation,
  makeDeterministicPatterns5,
} = require('./memory_system.js');

function nowMs() {
  return Number(process.hrtime.bigint()) / 1e6;
}

// Encode a text message as a binary vector for OMNIMENS's memory system
function messageToVec(message, length) {
  const vec = new Array(length).fill(0);
  for (let i = 0; i < message.length; i++) {
    vec[i % length] ^= (message.charCodeAt(i) >> 3) & 1;
  }
  const chars = new Set(message.split(''));
  const entropy = chars.size / Math.max(message.length, 1);
  vec[0] = entropy > 0.5 ? 1 : 0;
  vec[1] = message.length > 50 ? 1 : 0;
  vec[2] = message.includes('?') ? 1 : 0;
  return vec;
}

function buildPipeline({ eventBus }) {
  const pipeline = new PipelineEngine({ eventBus });

  // Stage 1: Deserialize ACP envelope
  pipeline.use(function acp_in(acpStr, ctx) {
    const env = ACP.deserialize(acpStr);
    ctx.msg = env;
    return env;
  });

  // Stage 2: Train neural network on classification data
  pipeline.use(async function train_math_engine(env, ctx) {
    const X = [
      [-2.0, -1.0], [-1.5, -1.2], [-2.2, -0.7], [-1.8, -1.6],
      [ 0.2,  1.8], [ 0.6,  1.2], [ 0.1,  2.3], [ 1.0,  1.6],
      [ 2.0, -1.0], [ 1.6, -1.3], [ 2.2, -0.6], [ 1.8, -1.8],
    ];
    const y = [0,0,0,0, 1,1,1,1, 2,2,2,2];
    const t0 = nowMs();
    const trained = math.train2LayerGD({ X, y, hidden: 10, lr: 0.2, iters: 25, seed: 20240315 });
    const ms = parseFloat((nowMs() - t0).toFixed(3));
    env.payload.training = { loss: trained.final.loss, acc: trained.final.acc, ms, iters: 25 };
    return env;
  });

  // Stage 3: Associative memory storage and retrieval
  pipeline.use(function build_memory_and_retrieve(env, ctx) {
    const patterns = makeDeterministicPatterns5(18);
    const amem = new AssociativeMemory({ metric: 'hamming01' });
    patterns.forEach((vec, i) => amem.addPattern({ id: `p${i}`, label: `pattern_${i}`, vec }));

    const queryVec = (Array.isArray(env.payload.vec) && env.payload.vec.length === 18)
      ? env.payload.vec
      : patterns[0];
    const top3 = amem.retrieveClosest(queryVec, { topK: 3 });

    env.payload.memory = { top3: top3.map(r => ({ id: r.id, dist: r.dist })), patternCount: amem.size() };
    ctx.patterns = patterns;
    return env;
  });

  // Stage 4: Hopfield pattern completion
  pipeline.use(function hopfield_completion(env, ctx) {
    const { patterns } = ctx;
    const hopfield = new PatternCompletionHopfield({ n: 18 });
    for (const p of patterns) hopfield.storePattern(p);

    const queryVec = (Array.isArray(env.payload.vec) && env.payload.vec.length === 18)
      ? env.payload.vec
      : patterns[0];

    const corrupt = queryVec.slice();
    for (let i = 0; i < 3; i++) corrupt[i] = corrupt[i] ? 0 : 1;

    const result = hopfield.complete(corrupt, { steps: 5 });
    const out01 = result.out01;
    const hammingDist = out01.reduce((acc, v, i) => acc + (v !== queryVec[i] ? 1 : 0), 0);
    const finalEnergy = result.curve[result.curve.length - 1]?.energy ?? 0;

    env.payload.hopfield = { completionOk: hammingDist < 4, hammingDist, steps: 5, finalEnergy };
    return env;
  });

  // Stage 5: STDP synaptic plasticity + memory consolidation
  pipeline.use(function stdp_and_consolidation(env, ctx) {
    const { patterns } = ctx;
    // STDPNetwork uses spike-timing: simulate neuron firing from pattern bits
    const stdpNet = new STDPNetwork({ n: 18 });
    const allUpdates = [];
    for (let pi = 0; pi < Math.min(3, patterns.length); pi++) {
      const p = patterns[pi];
      for (let bit = 0; bit < p.length; bit++) {
        if (p[bit]) {
          const updates = stdpNet.spike(bit, pi * 10 + bit);
          allUpdates.push(...updates);
        }
      }
    }
    const avgDW = allUpdates.length
      ? allUpdates.reduce((sum, u) => sum + Math.abs(u.dW), 0) / allUpdates.length
      : 0;

    // MemoryConsolidation: observe the same pattern keys multiple times
    const consolidator = new MemoryConsolidation({ repeatsToConsolidate: 3 });
    let consolidatedCount = 0;
    for (const p of patterns) {
      const key = p.join('');
      for (let rep = 0; rep < 3; rep++) {
        const r = consolidator.observe(key, { vec: p });
        if (r.consolidated) consolidatedCount++;
      }
    }
    const stats = consolidator.stats();

    env.payload.plasticity = {
      stdp: { avgAbsDW: parseFloat(avgDW.toFixed(6)), spikeUpdates: allUpdates.length },
      consolidation: { longTermCount: stats.longTerm, shortTermCount: stats.shortTerm },
    };
    return env;
  });

  // Stage 6: Finalize and wrap in ACP envelope
  pipeline.use(function summarize_and_acp_out(env) {
    env.meta = { ...env.meta, outHash: sha256(stableStringify(env.payload)).slice(0, 16) };
    env.type = 'system:result';
    return ACP.serialize(env);
  });

  return pipeline;
}

async function main() {
  let inputData = { message: '' };
  try {
    const raw = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
    if (raw) inputData = JSON.parse(raw);
  } catch {}

  const message = inputData.message || '';
  const msgVec = messageToVec(message, 18);

  const bus = new EventBus();
  const steps = [];
  bus.on('pipeline:step:end', (e) => {
    steps.push({ name: e.name, ms: Number(e.ms.toFixed(3)) });
  });

  // Score OMNIMENS's own intelligence
  const sie = new SelfImprovementEngine({
    rootDir: path.join(__dirname),
    mainFile: 'runner.js',
    eventBus: bus,
  });
  const baseline = await sie.scoreSelf();
  const iq = parseFloat(baseline.summary.intelligence.quotient.toFixed(6));

  const input = ACP.serialize({
    from: 'user',
    to: 'omnimens',
    type: 'query',
    payload: {
      ts: Date.now(),
      message: message.slice(0, 200),
      vec: msgVec,
    },
  });

  const pipeline = buildPipeline({ eventBus: bus });
  const outStr = await pipeline.run(input, {});
  const outEnv = ACP.deserialize(outStr);
  const p = outEnv.payload;

  process.stdout.write(JSON.stringify({
    iq,
    training: p.training,
    memory: p.memory,
    hopfield: p.hopfield,
    plasticity: p.plasticity,
    pipelineSteps: steps,
    outputHash: outEnv.meta?.outHash,
  }) + '\n');
}

main().catch((e) => {
  process.stderr.write('OMNIMENS_RUNNER_ERROR: ' + (e && e.stack ? e.stack : String(e)) + '\n');
  process.exit(1);
});
