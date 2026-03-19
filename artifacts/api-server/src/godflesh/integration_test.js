/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

'use strict';

const path = require('path');
const { spawnSync } = require('child_process');

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

function main() {
  const cwd = process.cwd();

  // End-to-end: run benchmark + critic + system.
  const bench = runNode([path.join(cwd, 'benchmark.js')], cwd);
  const iq = parseIntegratedIQ(bench.stdout);

  const critic = runNode([path.join(cwd, 'critic_tests.js')], cwd);
  const system = runNode([path.join(cwd, 'system.js')], cwd);

  // Capability score: computed, stable-ish.
  // - must pass critic to get full points
  // - integrated IQ normalized around 400
  // - system runtime bonus if under 60ms
  const criticPass = critic.code === 0 ? 1 : 0;
  const iqNorm = iq && Number.isFinite(iq) ? Math.max(0, Math.min(1, iq / 400)) : 0;
  const rtNorm = Math.max(0, Math.min(1, (60 - system.ms) / 60)); // 1 if ~0ms, 0 if >=60ms

  const capabilityScore = Number((100 * (0.55 * criticPass + 0.35 * iqNorm + 0.10 * rtNorm)).toFixed(3));

  console.log('INTEGRATION_TEST', JSON.stringify({
    benchmark: { code: bench.code, ms: bench.ms, integratedIQ: iq },
    critic: { code: critic.code, ms: critic.ms },
    system: { code: system.code, ms: system.ms },
    computed: { criticPass, iqNorm: Number(iqNorm.toFixed(6)), rtNorm: Number(rtNorm.toFixed(6)) },
    capabilityScore,
  }));

  if (bench.code !== 0 || system.code !== 0) process.exitCode = 2;
  else if (critic.code !== 0) process.exitCode = 1;
  else process.exitCode = 0;
}

if (require.main === module) main();