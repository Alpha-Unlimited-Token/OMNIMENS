'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

function stableStringify(value) {
  const seen = new WeakSet();
  const helper = (v) => {
    if (v === null) return 'null';
    const t = typeof v;
    if (t === 'number') {
      if (Number.isNaN(v)) return '"[NaN]"';
      if (!Number.isFinite(v)) return `"[${
        v > 0 ? 'Infinity' : '-Infinity'
      }]"`;
      return String(v);
    }
    if (t === 'boolean') return v ? 'true' : 'false';
    if (t === 'string') return JSON.stringify(v);
    if (t === 'bigint') return JSON.stringify(v.toString() + 'n');
    if (t === 'undefined') return '"[undefined]"';
    if (t === 'function') return JSON.stringify(`[Function:${v.name || 'anonymous'}]`);
    if (t === 'symbol') return JSON.stringify(v.toString());
    if (Array.isArray(v)) return '[' + v.map(helper).join(',') + ']';
    if (t === 'object') {
      if (seen.has(v)) return '"[Circular]"';
      seen.add(v);
      const keys = Object.keys(v).sort();
      const props = keys.map(k => JSON.stringify(k) + ':' + helper(v[k]));
      return '{' + props.join(',') + '}';
    }
    return JSON.stringify(String(v));
  };
  return helper(value);
}

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

class ModuleRegistry {
  constructor() {
    this._modules = new Map();
  }

  register(name, mod) {
    if (!name || typeof name !== 'string') throw new Error('ModuleRegistry.register: name must be string');
    if (this._modules.has(name)) throw new Error(`ModuleRegistry.register: module already registered: ${name}`);
    if (typeof mod === 'function') {
      this._modules.set(name, { factory: mod, instance: null, type: 'factory' });
      return;
    }
    if (mod && typeof mod === 'object') {
      this._modules.set(name, { factory: null, instance: mod, type: 'instance' });
      return;
    }
    throw new Error('ModuleRegistry.register: mod must be object or factory function');
  }

  has(name) {
    return this._modules.has(name);
  }

  get(name, opts = {}) {
    const rec = this._modules.get(name);
    if (!rec) throw new Error(`ModuleRegistry.get: not found: ${name}`);
    const { fresh = false } = opts;
    if (rec.type === 'instance') return rec.instance;
    if (rec.type === 'factory') {
      if (fresh) return rec.factory();
      if (!rec.instance) rec.instance = rec.factory();
      return rec.instance;
    }
    throw new Error(`ModuleRegistry.get: unknown record type for ${name}`);
  }

  list() {
    return Array.from(this._modules.keys()).sort();
  }

  unregister(name) {
    return this._modules.delete(name);
  }
}

class EventBus {
  constructor() {
    this._subs = new Map(); // event -> [{id, fn, once}]
    this._nextId = 1;
  }

  on(event, fn) {
    if (typeof event !== 'string' || !event) throw new Error('EventBus.on: event must be non-empty string');
    if (typeof fn !== 'function') throw new Error('EventBus.on: fn must be function');
    const id = this._nextId++;
    const arr = this._subs.get(event) || [];
    arr.push({ id, fn, once: false });
    this._subs.set(event, arr);
    return () => this.off(event, id);
  }

  once(event, fn) {
    if (typeof event !== 'string' || !event) throw new Error('EventBus.once: event must be non-empty string');
    if (typeof fn !== 'function') throw new Error('EventBus.once: fn must be function');
    const id = this._nextId++;
    const arr = this._subs.get(event) || [];
    arr.push({ id, fn, once: true });
    this._subs.set(event, arr);
    return () => this.off(event, id);
  }

  off(event, id) {
    const arr = this._subs.get(event);
    if (!arr) return false;
    const idx = arr.findIndex(s => s.id === id);
    if (idx === -1) return false;
    arr.splice(idx, 1);
    if (arr.length === 0) this._subs.delete(event);
    else this._subs.set(event, arr);
    return true;
  }

  emit(event, payload) {
    const arr = this._subs.get(event);
    if (!arr || arr.length === 0) return { delivered: 0, errors: 0 };
    const snapshot = arr.slice();
    let delivered = 0;
    let errors = 0;
    for (const sub of snapshot) {
      try {
        sub.fn(payload);
        delivered++;
      } catch (e) {
        errors++;
      }
      if (sub.once) this.off(event, sub.id);
    }
    return { delivered, errors };
  }

  listeners(event) {
    const arr = this._subs.get(event) || [];
    return arr.map(s => ({ id: s.id, once: s.once }));
  }
}

class PipelineEngine {
  constructor({ eventBus = null } = {}) {
    this.eventBus = eventBus;
    this._steps = [];
  }

  use(step) {
    if (typeof step === 'function') {
      this._steps.push({ name: step.name || 'anonymous', fn: step });
      return this;
    }
    if (step && typeof step === 'object' && typeof step.run === 'function') {
      this._steps.push({ name: step.name || 'step', fn: step.run.bind(step) });
      return this;
    }
    throw new Error('PipelineEngine.use: step must be function or {run()}');
  }

  async run(input, context = {}) {
    let data = input;
    const ctx = context || {};
    for (let i = 0; i < this._steps.length; i++) {
      const step = this._steps[i];
      const t0 = process.hrtime.bigint();
      if (this.eventBus) this.eventBus.emit('pipeline:step:start', { index: i, name: step.name, dataHash: sha256(stableStringify(data)) });
      const out = step.fn(data, ctx);
      data = (out && typeof out.then === 'function') ? await out : out;
      const t1 = process.hrtime.bigint();
      const ms = Number(t1 - t0) / 1e6;
      if (this.eventBus) this.eventBus.emit('pipeline:step:end', { index: i, name: step.name, ms, dataHash: sha256(stableStringify(data)) });
    }
    return data;
  }

  describe() {
    return this._steps.map((s, i) => ({ index: i, name: s.name }));
  }
}

const ACP = {
  version: 1,
  serialize(msg) {
    if (!msg || typeof msg !== 'object') throw new Error('ACP.serialize: msg must be object');
    const envelope = {
      v: ACP.version,
      id: msg.id || crypto.randomUUID(),
      ts: msg.ts || Date.now(),
      from: msg.from || 'unknown',
      to: msg.to || 'unknown',
      type: msg.type || 'message',
      meta: msg.meta && typeof msg.meta === 'object' ? msg.meta : {},
      payload: msg.payload === undefined ? null : msg.payload
    };
    const canonical = stableStringify(envelope);
    const sig = sha256(canonical);
    return JSON.stringify({ envelope, sig });
  },
  deserialize(str) {
    if (typeof str !== 'string' || !str) throw new Error('ACP.deserialize: str must be non-empty string');
    const obj = JSON.parse(str);
    if (!obj || typeof obj !== 'object' || !obj.envelope || typeof obj.sig !== 'string') {
      throw new Error('ACP.deserialize: invalid format');
    }
    const canonical = stableStringify(obj.envelope);
    const sig2 = sha256(canonical);
    if (sig2 !== obj.sig) throw new Error('ACP.deserialize: signature mismatch');
    if (obj.envelope.v !== ACP.version) throw new Error(`ACP.deserialize: version mismatch: ${obj.envelope.v} != ${ACP.version}`);
    return obj.envelope;
  }
};

class BenchmarkSuite {
  constructor({ eventBus = null } = {}) {
    this.eventBus = eventBus;
    this._benchmarks = [];
  }

  add(name, fn, opts = {}) {
    if (typeof name !== 'string' || !name) throw new Error('BenchmarkSuite.add: name must be non-empty string');
    if (typeof fn !== 'function') throw new Error('BenchmarkSuite.add: fn must be function');
    const iters = Number.isFinite(opts.iters) ? Math.max(1, Math.floor(opts.iters)) : 10;
    this._benchmarks.push({ name, fn, iters });
    return this;
  }

  async run(context = {}) {
    const results = [];
    for (const b of this._benchmarks) {
      const times = [];
      let score = 0;
      let ok = 0;
      let err = 0;

      for (let i = 0; i < b.iters; i++) {
        const t0 = process.hrtime.bigint();
        try {
          const out = b.fn(context);
          const val = (out && typeof out.then === 'function') ? await out : out;
          if (typeof val === 'number' && Number.isFinite(val)) score += val;
          ok++;
        } catch (e) {
          err++;
        } finally {
          const t1 = process.hrtime.bigint();
          times.push(Number(t1 - t0) / 1e6);
        }
      }

      times.sort((a, b) => a - b);
      const medianMs = times.length ? times[Math.floor(times.length / 2)] : Infinity;
      const avgScore = ok ? score / ok : 0;

      const rec = { name: b.name, iters: b.iters, ok, err, medianMs, avgScore };
      results.push(rec);
      if (this.eventBus) this.eventBus.emit('bench:result', rec);
    }
    const summary = BenchmarkSuite.summarize(results);
    if (this.eventBus) this.eventBus.emit('bench:summary', summary);
    return { results, summary };
  }

  static summarize(results) {
    const byName = {};
    for (const r of results) byName[r.name] = r;

    const metrics = {
      totalOk: results.reduce((a, r) => a + r.ok, 0),
      totalErr: results.reduce((a, r) => a + r.err, 0),
      medianMsSum: results.reduce((a, r) => a + r.medianMs, 0),
      avgScoreSum: results.reduce((a, r) => a + r.avgScore, 0),
    };

    const intelligence = {
      // Higher is better: reward score, penalize time and errors.
      quotient: (metrics.avgScoreSum + 1) / (1 + metrics.medianMsSum) * (1 / (1 + metrics.totalErr)),
    };

    return { metrics, intelligence, byName };
  }
}

class SelfImprovementEngine {
  constructor({ rootDir, mainFile, eventBus }) {
    this.rootDir = rootDir;
    this.mainFile = mainFile;
    this.eventBus = eventBus || new EventBus();
    this.registry = new ModuleRegistry();
  }

  readSource(file) {
    const full = path.isAbsolute(file) ? file : path.join(this.rootDir, file);
    const code = fs.readFileSync(full, 'utf8');
    return { full, code, bytes: Buffer.byteLength(code, 'utf8'), hash: sha256(code) };
  }

  analyzeBottlenecks(sourceText) {
    const lines = sourceText.split('\n');
    let longest = { line: 0, len: 0, text: '' };
    for (let i = 0; i < lines.length; i++) {
      const len = lines[i].length;
      if (len > longest.len) longest = { line: i + 1, len, text: lines[i] };
    }
    const counts = {
      lines: lines.length,
      chars: sourceText.length,
      functions: (sourceText.match(/\bfunction\b/g) || []).length + (sourceText.match(/=>/g) || []).length,
      classes: (sourceText.match(/\bclass\b/g) || []).length,
      loops: (sourceText.match(/\bfor\b/g) || []).length + (sourceText.match(/\bwhile\b/g) || []).length,
      conditionals: (sourceText.match(/\bif\b/g) || []).length + (sourceText.match(/\bswitch\b/g) || []).length,
    };
    const bottlenecks = [];
    if (longest.len > 140) bottlenecks.push({ type: 'readability', detail: `Longest line ${longest.len} chars at ${longest.line}` });
    if (counts.loops > counts.functions * 5) bottlenecks.push({ type: 'complexity', detail: 'High loop-to-function ratio' });
    if (counts.conditionals > counts.functions * 6) bottlenecks.push({ type: 'complexity', detail: 'High conditional-to-function ratio' });

    return { counts, longest, bottlenecks };
  }

  defineBenchmarks() {
    const suite = new BenchmarkSuite({ eventBus: this.eventBus });

    suite.add('eventbus_throughput', () => {
      const bus = new EventBus();
      let acc = 0;
      const off = bus.on('x', (p) => { acc += p; });
      const n = 20000;
      for (let i = 0; i < n; i++) bus.emit('x', i % 7);
      off();
      // score rewards correctness: sum of residues computed deterministically
      const expected = (() => {
        let s = 0;
        for (let i = 0; i < n; i++) s += i % 7;
        return s;
      })();
      if (acc !== expected) throw new Error('EventBus correctness failed');
      return 1000; // fixed correctness score; speed captured in timing
    }, { iters: 15 });

    suite.add('pipeline_chain', async () => {
      const bus = new EventBus();
      const p = new PipelineEngine({ eventBus: bus });
      p.use((x) => x + 1).use((x) => x * 3).use((x) => x - 2);
      const out = await p.run(10, {});
      if (out !== ((10 + 1) * 3 - 2)) throw new Error('Pipeline correctness failed');
      return 1000;
    }, { iters: 30 });

    suite.add('acp_roundtrip', () => {
      const msg = { from: 'a', to: 'b', type: 'ping', payload: { t: Date.now(), r: Math.random() } };
      const s = ACP.serialize(msg);
      const env = ACP.deserialize(s);
      if (env.from !== 'a' || env.to !== 'b' || env.type !== 'ping') throw new Error('ACP fields mismatch');
      return 1000;
    }, { iters: 100 });

    suite.add('source_read_analyze', () => {
      const { code } = this.readSource(this.mainFile);
      const a = this.analyzeBottlenecks(code);
      // score rewards codebase density (more features) but penalize obvious readability issues
      let score = a.counts.functions + 5 * a.counts.classes;
      score -= a.bottlenecks.length * 3;
      if (!Number.isFinite(score)) throw new Error('Analysis score invalid');
      return score;
    }, { iters: 25 });

    return suite;
  }

  async scoreSelf() {
    const suite = this.defineBenchmarks();
    const { results, summary } = await suite.run({});
    return { results, summary };
  }

  spawnNewProcess(args = []) {
    const res = spawnSync(process.execPath, args, { stdio: 'pipe', cwd: this.rootDir, env: process.env });
    return {
      code: res.status,
      stdout: res.stdout ? res.stdout.toString('utf8') : '',
      stderr: res.stderr ? res.stderr.toString('utf8') : ''
    };
  }
}

module.exports = {
  ModuleRegistry,
  EventBus,
  PipelineEngine,
  ACP,
  BenchmarkSuite,
  SelfImprovementEngine,
  stableStringify,
  sha256,
};

// Self-test: real computed output
if (require.main === module) {
  (async () => {
    const bus = new EventBus();
    bus.on('pipeline:step:end', (e) => {
      if (e && typeof e.ms === 'number') {
        console.log('EVENT pipeline:step:end', stableStringify({ i: e.index, name: e.name, ms: Number(e.ms.toFixed(3)) }));
      }
    });
    bus.on('bench:summary', (s) => {
      console.log('BENCH SUMMARY', stableStringify({
        totalOk: s.metrics.totalOk,
        totalErr: s.metrics.totalErr,
        medianMsSum: Number(s.metrics.medianMsSum.toFixed(3)),
        avgScoreSum: Number(s.metrics.avgScoreSum.toFixed(3)),
        quotient: Number(s.intelligence.quotient.toFixed(6))
      }));
    });

    const reg = new ModuleRegistry();
    reg.register('adder', () => (x) => x + 2);
    reg.register('stateful', { count: 0 });
    const add2 = reg.get('adder');
    const st = reg.get('stateful');
    st.count += add2(5);
    console.log('REGISTRY', stableStringify({ modules: reg.list(), statefulCount: st.count, add2of10: add2(10) }));

    const p = new PipelineEngine({ eventBus: bus });
    p.use((x) => x + 1);
    p.use((x) => x * x);
    const out = await p.run(12, {});
    console.log('PIPELINE OUT', out);

    const serialized = ACP.serialize({ from: 'agentA', to: 'agentB', type: 'hello', payload: { n: out } });
    const env = ACP.deserialize(serialized);
    console.log('ACP', stableStringify({ id: env.id, from: env.from, to: env.to, type: env.type, payloadN: env.payload.n }));

    const engine = new SelfImprovementEngine({ rootDir: process.cwd(), mainFile: path.basename(__filename), eventBus: bus });
    const src = engine.readSource(path.basename(__filename));
    const analysis = engine.analyzeBottlenecks(src.code);
    console.log('ANALYSIS', stableStringify({
      bytes: src.bytes,
      hashStart: src.hash.slice(0, 16),
      counts: analysis.counts,
      longest: { line: analysis.longest.line, len: analysis.longest.len },
      bottlenecks: analysis.bottlenecks
    }));

    const scored = await engine.scoreSelf();
    console.log('BENCH RESULTS', stableStringify(scored.results.map(r => ({
      name: r.name,
      ok: r.ok,
      err: r.err,
      medianMs: Number(r.medianMs.toFixed(3)),
      avgScore: Number(r.avgScore.toFixed(3))
    }))));

    const calc = scored.summary.intelligence.quotient;
    console.log('INTELLIGENCE_QUOTIENT', Number(calc.toFixed(6)));
  })().catch((e) => {
    console.error('SELF-TEST FAILED', e && e.stack ? e.stack : e);
    process.exitCode = 1;
  });
}