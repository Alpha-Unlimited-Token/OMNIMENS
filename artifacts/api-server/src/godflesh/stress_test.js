/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

'use strict';

const assert = require('assert');
const { spawnSync } = require('child_process');
const path = require('path');

const framework = require('./framework.js');
const math = require('./math_engine.js');
const mem = require('./memory_system.js');
const { buildSystemPipeline } = require('./system.js');

function timeIt(name, fn) {
  const t0 = Date.now();
  const out = fn();
  const t1 = Date.now();
  console.log('STRESS_TIME', JSON.stringify({ name, ms: t1 - t0 }));
  return out;
}

async function timeItAsync(name, fn) {
  const t0 = Date.now();
  const out = await fn();
  const t1 = Date.now();
  console.log('STRESS_TIME', JSON.stringify({ name, ms: t1 - t0 }));
  return out;
}

function mustThrow(name, fn, re) {
  let threw = false;
  try { fn(); } catch (e) { threw = true; if (re) assert(re.test(String(e)), `${name}: wrong error: ${e}`); }
  assert(threw, `${name}: expected throw`);
  console.log('STRESS_THROW_OK', JSON.stringify({ name }));
}

(async () => {
  // 1) ACP robustness
  timeIt('ACP_roundtrip_1000', () => {
    for (let i = 0; i < 1000; i++) {
      const s = framework.ACP.serialize({ from: 'a', to: 'b', type: 't', payload: { i, x: i % 7 } });
      const env = framework.ACP.deserialize(s);
      assert(env.payload.i === i);
    }
  });

  mustThrow('ACP_deserialize_empty', () => framework.ACP.deserialize(''), /non-empty/);

  // 2) EventBus stress: many listeners + emits
  timeIt('EventBus_500_listeners_2000_emits', () => {
    const bus = new framework.EventBus();
    let sum = 0;
    const offs = [];
    for (let i = 0; i < 500; i++) offs.push(bus.on('x', (p) => { sum += (p ^ i) & 7; }));
    for (let j = 0; j < 2000; j++) bus.emit('x', j);
    for (const off of offs) off();
    assert(sum > 0);
  });

  // 3) math_engine numeric stability: softmax huge logits should not NaN
  timeIt('softmax_huge_logits', () => {
    const P = math.softmax([[1000, 999, 998], [-1000, -1001, -1002]]);
    for (const row of P) {
      const s = row.reduce((a, b) => a + b, 0);
      assert(Number.isFinite(s));
      assert(Math.abs(s - 1) < 1e-9);
    }
  });

  // 4) Hopfield: multiple patterns and random-ish corruption positions (deterministic indices)
  timeIt('Hopfield_10_steps_each_pattern', () => {
    const n = 32;
    const patterns = mem.makeDeterministicPatterns5(n);
    const hop = new mem.PatternCompletionHopfield({ n });
    for (const p of patterns) hop.storePattern(p);

    let totalEnergyDrop = 0;
    for (let i = 0; i < patterns.length; i++) {
      const target = patterns[i];
      const corrupted = target.slice();
      const flips = [];
      for (let k = 0; k < 7; k++) flips.push((i * 13 + k * 7 + 3) % n);
      for (const idx of flips) corrupted[idx] = corrupted[idx] ? 0 : 1;

      const r = hop.complete(corrupted, { steps: 10 });
      const e0 = r.curve[0].energy;
      const e9 = r.curve[r.curve.length - 1].energy;
      totalEnergyDrop += (e0 - e9);
      assert(Number.isFinite(e0) && Number.isFinite(e9));
    }
    console.log('HOPFIELD_ENERGY_DROP', JSON.stringify({ totalEnergyDrop: Number(totalEnergyDrop.toFixed(6)) }));
  });

  // 5) Integrated pipeline stress: run multiple times and ensure ACP validity
  await timeItAsync('pipeline_run_15', async () => {
    const pipeline = buildSystemPipeline({ eventBus: null });
    let accSum = 0;
    for (let i = 0; i < 15; i++) {
      const input = framework.ACP.serialize({ from: 'stress', to: 'system', type: 'run', payload: { i, ts: Date.now() } });
      const outStr = await pipeline.run(input, {});
      const env = framework.ACP.deserialize(outStr);
      assert(env.type === 'system:result');
      accSum += env.payload.training.acc;
    }
    console.log('PIPELINE_ACC_SUM', JSON.stringify({ accSum: Number(accSum.toFixed(4)) }));
  });

  // 6) Run critic_tests.js in a separate process to demonstrate an actual failing test (current Hebbian bug)
  timeIt('spawn critic_tests.js', () => {
    const res = spawnSync(process.execPath, [path.join(__dirname, 'critic_tests.js')], { cwd: __dirname, stdio: 'pipe' });
    const stdout = res.stdout.toString('utf8');
    const stderr = res.stderr.toString('utf8');
    console.log('CRITIC_TESTS_EXIT', JSON.stringify({ code: res.status, hasFailure: res.status !== 0 }));
    // Print only the failing test block if present
    const lines = stdout.split('\n').filter(Boolean);
    const failLines = lines.filter(l => l.includes('TEST_FAIL') || l.includes('BUG DEMO'));
    console.log('CRITIC_TESTS_FAIL_SNIPPET', failLines.slice(0, 12).join('\n'));
    if (stderr.trim()) console.log('CRITIC_TESTS_STDERR', stderr.trim().slice(0, 800));
  });

  console.log('STRESS_DONE', JSON.stringify({ exitCode: process.exitCode || 0 }));
})();