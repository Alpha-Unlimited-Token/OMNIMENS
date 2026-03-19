/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

'use strict';

const assert = require('assert');
const path = require('path');

function runTest(name, fn) {
  const t0 = Date.now();
  try {
    fn();
    const t1 = Date.now();
    console.log('TEST_PASS', JSON.stringify({ name, ms: t1 - t0 }));
  } catch (e) {
    const t1 = Date.now();
    console.log('TEST_FAIL', JSON.stringify({ name, ms: t1 - t0, err: e && e.stack ? e.stack : String(e) }));
    process.exitCode = 1;
  }
}

function runTestAsync(name, fn) {
  const t0 = Date.now();
  return Promise.resolve()
    .then(fn)
    .then(() => {
      const t1 = Date.now();
      console.log('TEST_PASS', JSON.stringify({ name, ms: t1 - t0 }));
    })
    .catch((e) => {
      const t1 = Date.now();
      console.log('TEST_FAIL', JSON.stringify({ name, ms: t1 - t0, err: e && e.stack ? e.stack : String(e) }));
      process.exitCode = 1;
    });
}

function requireAll() {
  const framework = require('./framework.js');
  const math = require('./math_engine.js');
  const mem = require('./memory_system.js');
  const system = require('./system.js');
  const benchmark = require('./benchmark.js');
  return { framework, math, mem, system, benchmark };
}

(async () => {
  const { framework, math, mem, system } = requireAll();

  runTest('framework.EventBus.once should fire exactly once', () => {
    const bus = new framework.EventBus();
    let hits = 0;
    bus.once('a', () => { hits++; });
    bus.emit('a', 1);
    bus.emit('a', 2);
    assert.strictEqual(hits, 1, 'once listener fired more than once');
  });

  runTest('framework.ACP signature mismatch is detected', () => {
    const s = framework.ACP.serialize({ from: 'x', to: 'y', type: 't', payload: { a: 1 } });
    const obj = JSON.parse(s);
    obj.envelope.payload.a = 2; // tamper
    const tampered = JSON.stringify(obj);
    assert.throws(() => framework.ACP.deserialize(tampered), /signature mismatch/);
  });

  runTest('math.matMul shape mismatch throws', () => {
    assert.throws(() => math.matMul([[1, 2]], [[1, 2]]), /shape mismatch/);
  });

  runTest('memory.AssociativeMemory retrieveClosest dimension mismatch throws', () => {
    const am = new mem.AssociativeMemory({ metric: 'hamming01' });
    am.addPattern({ id: 'p', vec: [0, 1, 0] });
    assert.throws(() => am.retrieveClosest([1, 0], { topK: 1 }), /dimension mismatch/);
  });

  runTest('memory.STDPNetwork dt<0 should depress weights (negative dW)', () => {
    const stdp = new mem.STDPNetwork({ n: 3, APlus: 0.05, AMinus: 0.06, tauPlus: 20, tauMinus: 20, wMin: 0, wMax: 1 });
    // make neuron 1 spike at t=200 (post), then neuron 2 spike at t=215 (pre after post)
    stdp.spike(1, 200);
    const before = stdp.getWeight(2, 1);
    stdp.spike(2, 215); // updates 2->1 with dt = 200-215 = -15
    const after = stdp.getWeight(2, 1);
    assert(after < before, `expected depression after<before, got before=${before}, after=${after}`);
  });

  await runTestAsync('system.buildSystemPipeline end-to-end output is valid ACP and has required fields', async () => {
    const pipeline = system.buildSystemPipeline({ eventBus: null });
    const input = framework.ACP.serialize({ from: 't', to: 'system', type: 'run', payload: { ts: Date.now() } });
    const out = await pipeline.run(input, {});
    const env = framework.ACP.deserialize(out);
    assert.strictEqual(env.type, 'system:result');
    assert(env.payload && env.payload.training && typeof env.payload.training.acc === 'number');
    assert(env.payload && env.payload.plasticity && env.payload.plasticity.stdp);
  });

  // This one is expected to FAIL with current code (demonstrates a real bug).
  runTest('BUG DEMO: Hebbian learning should improve accuracy above 0 on deterministic patterns', () => {
    const n = 18;
    const patterns = mem.makeDeterministicPatterns5(n);
    const hebb = new mem.HebbianNetwork({ nIn: n, nOut: 2, lr: 0.15, wMin: -2, wMax: 2 });
    const dataset = patterns.map((vec, i) => ({
      x: vec.map(v => (v ? 1 : 0)),
      y: [vec[0] ? 1 : 0, vec[1] ? 1 : 0],
      id: `p${i}`
    }));

    const epochs = 8;
    for (let e = 0; e < epochs; e++) for (const ex of dataset) hebb.learn(ex.x, ex.y);

    let ok = 0;
    for (const ex of dataset) {
      const pred = hebb.forward(ex.x);
      if (pred[0] === ex.y[0] && pred[1] === ex.y[1]) ok++;
    }
    const acc = ok / dataset.length;

    // This assertion *can fail* (and does with current implementation).
    assert(acc > 0, `expected acc>0 after training, got acc=${acc}`);
  });

  console.log('TESTS_DONE', JSON.stringify({ exitCode: process.exitCode || 0 }));
})();