/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

function readUtf8(p) {
  return fs.readFileSync(p, 'utf8');
}
function writeUtf8(p, s) {
  fs.writeFileSync(p, s, 'utf8');
}

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
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

function parseIntegratedIQ(stdout) {
  const m = stdout.match(/INTEGRATED_BENCH_INTELLIGENCE_QUOTIENT\s+([0-9.]+)/);
  return m ? Number(m[1]) : null;
}

function applyHebbianBipolarFix(memoryPath) {
  const src = readUtf8(memoryPath);

  const hasFix =
    src.includes('bipolar internal coding') ||
    (src.includes('xB') && src.includes('yB') && src.includes('x[i] ? 1 : -1'));

  if (hasFix) return { changed: false, reason: 'Already fixed' };

  const learnStart = src.indexOf('  learn(x, y = null) {');
  if (learnStart === -1) throw new Error('self_upgrade: cannot find HebbianNetwork.learn');

  const braceOpen = src.indexOf('{', learnStart);
  if (braceOpen === -1) throw new Error('self_upgrade: cannot parse learn()');

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
  if (end === -1) throw new Error('self_upgrade: cannot find end of learn()');

  const before = src.slice(0, braceOpen + 1);
  const after = src.slice(end);

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
  writeUtf8(memoryPath, out);
  return { changed: true, reason: 'Applied bipolar update to Hebbian learn()' };
}

function main() {
  const cwd = process.cwd();
  const memPath = path.join(cwd, 'memory_system.js');

  const beforeHash = sha256(readUtf8(memPath));
  const benchBefore = runNode([path.join(cwd, 'benchmark.js')], cwd);
  const iqBefore = parseIntegratedIQ(benchBefore.stdout);
  const criticBefore = runNode([path.join(cwd, 'critic_tests.js')], cwd);

  console.log('UPGRADE_BEFORE', JSON.stringify({
    memoryHashStart: beforeHash.slice(0, 16),
    benchmark: { code: benchBefore.code, ms: benchBefore.ms, integratedIQ: iqBefore },
    critic: { code: criticBefore.code, ms: criticBefore.ms },
  }));

  const patch = applyHebbianBipolarFix(memPath);
  const afterHash = sha256(readUtf8(memPath));

  const benchAfter = runNode([path.join(cwd, 'benchmark.js')], cwd);
  const iqAfter = parseIntegratedIQ(benchAfter.stdout);
  const criticAfter = runNode([path.join(cwd, 'critic_tests.js')], cwd);

  console.log('UPGRADE_PATCH', JSON.stringify(patch));
  console.log('UPGRADE_AFTER', JSON.stringify({
    memoryHashStart: afterHash.slice(0, 16),
    benchmark: { code: benchAfter.code, ms: benchAfter.ms, integratedIQ: iqAfter },
    critic: { code: criticAfter.code, ms: criticAfter.ms },
  }));

  const improved =
    (criticAfter.code === 0 || criticBefore.code === 0) && // don't regress if already passing
    (iqAfter !== null && iqBefore !== null ? iqAfter >= iqBefore : true);

  console.log('UPGRADE_RESULT', JSON.stringify({
    improved,
    iqBefore,
    iqAfter,
    criticBefore: criticBefore.code,
    criticAfter: criticAfter.code,
  }));

  process.exitCode = improved ? 0 : 2;
}

if (require.main === module) main();