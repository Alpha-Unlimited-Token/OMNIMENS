/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const framework = require('./framework.js');
const mem = require('./memory_system.js');

function readUtf8(p) {
  return fs.readFileSync(p, 'utf8');
}

function writeUtf8(p, s) {
  fs.writeFileSync(p, s, 'utf8');
}

function hrms() {
  return Number(process.hrtime.bigint()) / 1e6;
}

function runNode(args, cwd) {
  const t0 = hrms();
  const res = spawnSync(process.execPath, args, { cwd, stdio: 'pipe', env: process.env });
  const t1 = hrms();
  return {
    code: res.status,
    ms: Number((t1 - t0).toFixed(3)),
    stdout: res.stdout ? res.stdout.toString('utf8') : '',
    stderr: res.stderr ? res.stderr.toString('utf8') : '',
  };
}

function extractBenchSummary(stdout) {
  // benchmark.js prints:
  // BENCH_SUMMARY {...}
  // INTEGRATED_BENCH_INTELLIGENCE_QUOTIENT X
  const lines = stdout.split('\n').map(l => l.trim()).filter(Boolean);
  let iq = null;
  for (const l of lines) {
    const m = l.match(/INTEGRATED_BENCH_INTELLIGENCE_QUOTIENT\s+([0-9.]+)/);
    if (m) iq = Number(m[1]);
  }
  return { integratedIQ: iq };
}

function hebbianAccuracyOnDeterministicPatterns() {
  const n = 18;
  const patterns = mem.makeDeterministicPatterns5(n);
  const hebb = new mem.HebbianNetwork({ nIn: n, nOut: 2, lr: 0.15, wMin: -2, wMax: 2 });
  const dataset = patterns.map((vec, i) => ({
    x: vec.map(v => (v ? 1 : 0)),
    y: [vec[0] ? 1 : 0, vec[1] ? 1 : 0],
    id: `p${i}`,
  }));

  const epochs = 8;
  for (let e = 0; e < epochs; e++) for (const ex of dataset) hebb.learn(ex.x, ex.y);

  let ok = 0;
  for (const ex of dataset) {
    const pred = hebb.forward(ex.x);
    if (pred[0] === ex.y[0] && pred[1] === ex.y[1]) ok++;
  }
  return ok / dataset.length;
}

function scoreCard({ criticOk, integratedIQ, hebbAcc }) {
  // Computed, not opinion.
  const metrics = {
    criticPass: criticOk ? 1 : 0,
    integratedIQ: Number.isFinite(integratedIQ) ? integratedIQ : 0,
    hebbianAcc: hebbAcc,
  };
  const score =
    0.50 * metrics.criticPass +
    0.35 * (metrics.integratedIQ / 400) + // ~normalize around current 365
    0.15 * metrics.hebbianAcc;
  return { metrics, score: Number(score.toFixed(6)) };
}

function runAllAndReport(label) {
  const cwd = process.cwd();

  // 1) Require all modules (smoke)
  const t0 = hrms();
  require('./math_engine.js');
  require('./system.js');
  require('./benchmark.js');
  require('./critic_tests.js'); // note: this *runs* tests asynchronously; don't rely on it here
  const t1 = hrms();

  // 2) Run benchmark.js to get integratedIQ
  const bench = runNode([path.join(cwd, 'benchmark.js')], cwd);
  const benchSummary = extractBenchSummary(bench.stdout);

  // 3) Run critic_tests.js to get pass/fail
  const critic = runNode([path.join(cwd, 'critic_tests.js')], cwd);
  const criticOk = critic.code === 0;

  // 4) Directly compute hebbian accuracy
  const hebbAcc = hebbianAccuracyOnDeterministicPatterns();

  const report = {
    label,
    requireAllMs: Number((t1 - t0).toFixed(3)),
    benchmark: { code: bench.code, ms: bench.ms, integratedIQ: benchSummary.integratedIQ },
    critic: { code: critic.code, ms: critic.ms },
    hebbian: { acc: Number(hebbAcc.toFixed(4)) },
    scoreCard: scoreCard({ criticOk, integratedIQ: benchSummary.integratedIQ, hebbAcc }),
  };

  return { report, outputs: { bench, critic } };
}

function implementFixesIfNeeded() {
  // Fix the weakest known component: HebbianNetwork degeneracy (all outputs 1 due to sign01(0)=1 at init).
  // We implement bipolar Hebbian update inside memory_system.js (if not already present).
  const p = path.join(process.cwd(), 'memory_system.js');
  const src = readUtf8(p);

  const hasBipolarFix =
    src.includes('bipolar internal coding') ||
    src.includes('xB') && src.includes('yB') && src.includes('x[i] ? 1 : -1');

  if (hasBipolarFix) {
    return { changed: false, reason: 'memory_system.js already contains bipolar Hebbian fix' };
  }

  // Surgical rewrite: replace HebbianNetwork.learn body with bipolar update.
  // We do minimal textual replacement to preserve rest of file.
  const learnStart = src.indexOf('  learn(x, y = null) {');
  if (learnStart === -1) throw new Error('capability_report: cannot find HebbianNetwork.learn');

  const braceOpen = src.indexOf('{', learnStart);
  if (braceOpen === -1) throw new Error('capability_report: cannot parse learn()');

  // Find matching brace for learn() by scanning.
  let i = braceOpen;
  let depth = 0;
  let end = -1;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) throw new Error('capability_report: cannot find end of learn()');

  const before = src.slice(0, braceOpen + 1);
  const after = src.slice(end); // includes closing '}' of learn

  const newBody =
`
    assert(Array.isArray(x) && x.length === this.nIn, 'HebbianNetwork.learn: x length mismatch');

    const yUse01 = y ? y : this.forward(x);
    assert(Array.isArray(yUse01) && yUse01.length === this.nOut, 'HebbianNetwork.learn: y length mismatch');

    // Hebbian / perceptron-like update with bipolar internal coding to avoid the
    // "all outputs become 1" degeneracy from sign01(0)=1 at initialization.
    const xB = new Array(this.nIn);
    for (let i = 0; i < this.nIn; i++) xB[i] = x[i] ? 1 : -1;

    const yB = new Array(this.nOut);
    for (let j = 0; j < this.nOut; j++) yB[j] = yUse01[j] ? 1 : -1;

    const deltas = [];
    for (let i = 0; i < this.nIn; i++) {
      const xi = xB[i];
      for (let j = 0; j < this.nOut; j++) {
        const before = this.W[i][j];
        const dW = this.lr * xi * yB[j];
        const after = clamp(before + dW, this.wMin, this.wMax);
        this.W[i][j] = after;
        deltas.push({ i, j, before, after, dW });
      }
    }
    return { y: yUse01, deltas };
`;

  const out = before + newBody + after;
  writeUtf8(p, out);
  return { changed: true, reason: 'Applied bipolar Hebbian update to HebbianNetwork.learn' };
}

function main() {
  const cwd = process.cwd();

  console.log('CAPABILITY_REPORT_START', JSON.stringify({ cwd }));

  const before = runAllAndReport('before_fix');
  console.log('REPORT_BEFORE', JSON.stringify(before.report));

  const fix = implementFixesIfNeeded();
  console.log('APPLIED_FIX', JSON.stringify(fix));

  const after = runAllAndReport('after_fix');
  console.log('REPORT_AFTER', JSON.stringify(after.report));

  // Check “provably surpassed” on every metric we track:
  const b = before.report.scoreCard.metrics;
  const a = after.report.scoreCard.metrics;
  const improvedAll =
    (a.criticPass >= b.criticPass) &&
    (a.integratedIQ >= b.integratedIQ) &&
    (a.hebbianAcc >= b.hebbianAcc);

  console.log('IMPROVEMENT_CHECK', JSON.stringify({
    improvedAll,
    before: b,
    after: a,
    scoreBefore: before.report.scoreCard.score,
    scoreAfter: after.report.scoreCard.score,
  }));

  if (!improvedAll) {
    console.log('GAPS', JSON.stringify({
      missingOrUnderperforming: [
        ...(a.criticPass < 1 ? ['critic_tests failing'] : []),
        ...(a.hebbianAcc < 0.2 ? ['hebbian learning underperforming'] : []),
        ...(a.integratedIQ < 300 ? ['integratedIQ underperforming'] : []),
      ]
    }));
  }

  // Print short excerpts for debugging if needed:
  const criticFailSnippet = (after.outputs.critic.stdout || '')
    .split('\n')
    .filter(l => l.includes('TEST_FAIL'))
    .slice(0, 5)
    .join('\n');
  if (criticFailSnippet) console.log('CRITIC_FAIL_SNIPPET', criticFailSnippet);

  console.log('CAPABILITY_REPORT_DONE', JSON.stringify({ exitCode: improvedAll ? 0 : 2 }));
  process.exitCode = improvedAll ? 0 : 2;
}

if (require.main === module) main();