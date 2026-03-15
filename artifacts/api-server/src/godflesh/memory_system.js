'use strict';

const { stableStringify } = require('./framework.js');

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

function isFiniteNumber(x) {
  return typeof x === 'number' && Number.isFinite(x);
}

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

function dot(a, b) {
  assert(Array.isArray(a) && Array.isArray(b) && a.length === b.length, 'dot: length mismatch');
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function l2Squared(a, b) {
  assert(Array.isArray(a) && Array.isArray(b) && a.length === b.length, 'l2Squared: length mismatch');
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return s;
}

function hammingDistance01(a, b) {
  assert(Array.isArray(a) && Array.isArray(b) && a.length === b.length, 'hammingDistance01: length mismatch');
  let d = 0;
  for (let i = 0; i < a.length; i++) if ((a[i] ? 1 : 0) !== (b[i] ? 1 : 0)) d++;
  return d;
}

function sign01(x) {
  return x >= 0 ? 1 : 0;
}

function cloneVec(v) {
  assert(Array.isArray(v), 'cloneVec: v must be array');
  const out = new Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v[i];
  return out;
}

class AssociativeMemory {
  constructor({ metric = 'hamming01' } = {}) {
    this.metric = metric;
    this._patterns = new Map(); // id -> { id, label, vec:Array<number>, addedAt }
  }

  addPattern({ id, label, vec }) {
    assert(typeof id === 'string' && id.length > 0, 'AssociativeMemory.addPattern: id must be non-empty string');
    assert(Array.isArray(vec) && vec.length > 0, 'AssociativeMemory.addPattern: vec must be non-empty array');
    for (const x of vec) assert(isFiniteNumber(x), 'AssociativeMemory.addPattern: vec must be numeric');
    const rec = { id, label: label === undefined ? null : label, vec: cloneVec(vec), addedAt: Date.now() };
    this._patterns.set(id, rec);
    return rec;
  }

  list() {
    return Array.from(this._patterns.keys()).sort();
  }

  get(id) {
    return this._patterns.get(id) || null;
  }

  size() {
    return this._patterns.size;
  }

  _distance(a, b) {
    if (this.metric === 'l2') return l2Squared(a, b);
    if (this.metric === 'hamming01') return hammingDistance01(a, b);
    throw new Error(`AssociativeMemory: unknown metric ${this.metric}`);
  }

  retrieveClosest(queryVec, { topK = 1 } = {}) {
    assert(Array.isArray(queryVec) && queryVec.length > 0, 'retrieveClosest: queryVec must be non-empty array');
    assert(Number.isInteger(topK) && topK >= 1, 'retrieveClosest: topK must be integer >=1');
    const results = [];
    for (const rec of this._patterns.values()) {
      assert(rec.vec.length === queryVec.length, 'retrieveClosest: query dimension mismatch vs stored pattern');
      const dist = this._distance(queryVec, rec.vec);
      results.push({ id: rec.id, label: rec.label, dist, vec: rec.vec });
    }
    results.sort((a, b) => a.dist - b.dist);
    return results.slice(0, Math.min(topK, results.length));
  }
}

class STDPNetwork {
  constructor({ n, tauPlus = 20, tauMinus = 20, APlus = 0.02, AMinus = 0.025, wMin = 0, wMax = 1 } = {}) {
    assert(Number.isInteger(n) && n >= 2, 'STDPNetwork: n must be integer >=2');
    this.n = n;
    this.tauPlus = tauPlus;
    this.tauMinus = tauMinus;
    this.APlus = APlus;
    this.AMinus = AMinus;
    this.wMin = wMin;
    this.wMax = wMax;

    // weights: pre -> post
    this.W = new Array(n);
    for (let i = 0; i < n; i++) {
      const row = new Array(n);
      for (let j = 0; j < n; j++) row[j] = (i === j) ? 0 : 0.1;
      this.W[i] = row;
    }

    this.lastSpike = new Array(n).fill(null); // ms timestamps, null if never
  }

  getWeight(pre, post) {
    assert(Number.isInteger(pre) && Number.isInteger(post), 'getWeight: indices must be int');
    assert(pre >= 0 && pre < this.n && post >= 0 && post < this.n, 'getWeight: index out of range');
    return this.W[pre][post];
  }

  _applySTDP(pre, post, tPre, tPost) {
    assert(pre !== post, '_applySTDP: no self');
    const dt = tPost - tPre; // post - pre
    let dW = 0;
    if (dt > 0) {
      dW = this.APlus * Math.exp(-dt / this.tauPlus);
    } else if (dt < 0) {
      dW = -this.AMinus * Math.exp(dt / this.tauMinus); // dt negative -> exp(-|dt|/tau)
    } else {
      dW = 0;
    }
    const before = this.W[pre][post];
    const after = clamp(before + dW, this.wMin, this.wMax);
    this.W[pre][post] = after;
    return { dt, dW, before, after };
  }

  spike(idx, t) {
    assert(Number.isInteger(idx) && idx >= 0 && idx < this.n, 'spike: idx out of range');
    assert(isFiniteNumber(t), 'spike: t must be finite number');
    const updates = [];

    for (let pre = 0; pre < this.n; pre++) {
      if (pre === idx) continue;
      const tPre = this.lastSpike[pre];
      if (tPre === null) continue;
      const u = this._applySTDP(pre, idx, tPre, t);
      updates.push({ pre, post: idx, ...u });
    }

    for (let post = 0; post < this.n; post++) {
      if (post === idx) continue;
      const tPost = this.lastSpike[post];
      if (tPost === null) continue;
      const u = this._applySTDP(idx, post, t, tPost);
      updates.push({ pre: idx, post, ...u });
    }

    this.lastSpike[idx] = t;
    return updates;
  }
}

class HebbianNetwork {
  constructor({ nIn, nOut, lr = 0.1, wMin = -1, wMax = 1 } = {}) {
    assert(Number.isInteger(nIn) && nIn >= 1, 'HebbianNetwork: nIn must be >=1');
    assert(Number.isInteger(nOut) && nOut >= 1, 'HebbianNetwork: nOut must be >=1');
    assert(isFiniteNumber(lr) && lr > 0, 'HebbianNetwork: lr must be >0');
    this.nIn = nIn;
    this.nOut = nOut;
    this.lr = lr;
    this.wMin = wMin;
    this.wMax = wMax;

    this.W = new Array(nIn);
    for (let i = 0; i < nIn; i++) {
      const row = new Array(nOut);
      for (let j = 0; j < nOut; j++) row[j] = 0;
      this.W[i] = row;
    }

    // Bias per output prevents the sign01(0)=1 degeneracy at init and allows learning 0-targets.
    this.b = new Array(nOut);
    for (let j = 0; j < nOut; j++) this.b[j] = 0;
  }

  forward(x) {
    assert(Array.isArray(x) && x.length === this.nIn, 'HebbianNetwork.forward: x length mismatch');
    const y = new Array(this.nOut).fill(0);
    for (let j = 0; j < this.nOut; j++) {
      let s = this.b[j];
      for (let i = 0; i < this.nIn; i++) s += x[i] * this.W[i][j];
      y[j] = sign01(s);
    }
    return y;
  }

  /**
   * Supervised perceptron learning (binary 0/1) with bias:
   *  yHat = step(w·x + b)
   *  e = (yTarget - yHat) ∈ {-1,0,+1}
   *  w += lr * e * x
   *  b += lr * e
   *
   * If y is not provided, falls back to unsupervised Hebbian (using current output).
   */
  learn(x, y = null) {
    assert(Array.isArray(x) && x.length === this.nIn, 'HebbianNetwork.learn: x length mismatch');

    const yTarget = y ? y : this.forward(x);
    assert(Array.isArray(yTarget) && yTarget.length === this.nOut, 'HebbianNetwork.learn: y length mismatch');

    const yHat = this.forward(x);
    const deltas = [];

    for (let j = 0; j < this.nOut; j++) {
      const e = (yTarget[j] ? 1 : 0) - (yHat[j] ? 1 : 0);
      if (e !== 0) {
        const bBefore = this.b[j];
        this.b[j] = clamp(this.b[j] + this.lr * e, this.wMin, this.wMax);
        deltas.push({ type: 'b', j, before: bBefore, after: this.b[j], d: this.b[j] - bBefore });
      }

      for (let i = 0; i < this.nIn; i++) {
        const before = this.W[i][j];
        const dW = this.lr * e * x[i];
        const after = clamp(before + dW, this.wMin, this.wMax);
        this.W[i][j] = after;
        if (dW !== 0) deltas.push({ type: 'w', i, j, before, after, dW });
      }
    }

    return { y: yHat, deltas };
  }
}

class MemoryConsolidation {
  constructor({ repeatsToConsolidate = 3 } = {}) {
    assert(Number.isInteger(repeatsToConsolidate) && repeatsToConsolidate >= 1, 'MemoryConsolidation: repeatsToConsolidate >=1');
    this.repeatsToConsolidate = repeatsToConsolidate;
    this.shortTerm = new Map();
    this.longTerm = new Map();
  }

  observe(key, payload) {
    assert(typeof key === 'string' && key.length > 0, 'observe: key must be non-empty string');
    const now = Date.now();
    const rec = this.shortTerm.get(key) || { key, count: 0, lastSeen: now, payload: null };
    rec.count += 1;
    rec.lastSeen = now;
    rec.payload = payload;
    this.shortTerm.set(key, rec);

    let consolidated = false;
    if (rec.count >= this.repeatsToConsolidate) {
      const lt = this.longTerm.get(key) || { key, count: 0, consolidatedAt: now, payload: null };
      lt.count += rec.count;
      lt.consolidatedAt = now;
      lt.payload = payload;
      this.longTerm.set(key, lt);
      this.shortTerm.delete(key);
      consolidated = true;
    }
    return { consolidated, shortTermCount: rec.count, longTermCount: this.longTerm.get(key) ? this.longTerm.get(key).count : 0 };
  }

  hasLongTerm(key) {
    return this.longTerm.has(key);
  }

  stats() {
    return { shortTerm: this.shortTerm.size, longTerm: this.longTerm.size };
  }
}

class PatternCompletionHopfield {
  constructor({ n, wMaxAbs = 2 } = {}) {
    assert(Number.isInteger(n) && n >= 2, 'PatternCompletionHopfield: n must be >=2');
    this.n = n;
    this.wMaxAbs = wMaxAbs;
    this.W = new Array(n);
    for (let i = 0; i < n; i++) {
      const row = new Array(n);
      for (let j = 0; j < n; j++) row[j] = 0;
      this.W[i] = row;
    }
    this.stored = [];
  }

  _toBipolar01(vec01) {
    assert(Array.isArray(vec01) && vec01.length === this.n, '_toBipolar01: length mismatch');
    const out = new Array(this.n);
    for (let i = 0; i < this.n; i++) out[i] = vec01[i] ? 1 : -1;
    return out;
  }

  _to01(bipolar) {
    assert(Array.isArray(bipolar) && bipolar.length === this.n, '_to01: length mismatch');
    const out = new Array(this.n);
    for (let i = 0; i < this.n; i++) out[i] = bipolar[i] >= 0 ? 1 : 0;
    return out;
  }

  storePattern(vec01) {
    const x = this._toBipolar01(vec01);
    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j < this.n; j++) {
        if (i === j) continue;
        const before = this.W[i][j];
        const after = clamp(before + (x[i] * x[j]) / this.n, -this.wMaxAbs, this.wMaxAbs);
        this.W[i][j] = after;
      }
    }
    this.stored.push(x);
    return x;
  }

  energy(bipolarState) {
    assert(Array.isArray(bipolarState) && bipolarState.length === this.n, 'energy: length mismatch');
    let sWs = 0;
    for (let i = 0; i < this.n; i++) {
      let rowSum = 0;
      for (let j = 0; j < this.n; j++) rowSum += this.W[i][j] * bipolarState[j];
      sWs += bipolarState[i] * rowSum;
    }
    return -0.5 * sWs;
  }

  complete(partialVec01, { steps = 12 } = {}) {
    assert(Array.isArray(partialVec01) && partialVec01.length === this.n, 'complete: length mismatch');
    assert(Number.isInteger(steps) && steps >= 1, 'complete: steps must be >=1');

    let state = this._toBipolar01(partialVec01);
    const curve = [];
    for (let t = 0; t < steps; t++) {
      const next = new Array(this.n);
      for (let i = 0; i < this.n; i++) {
        let h = 0;
        for (let j = 0; j < this.n; j++) h += this.W[i][j] * state[j];
        next[i] = h >= 0 ? 1 : -1;
      }
      state = next;
      curve.push({ step: t, energy: this.energy(state) });
    }
    return { out01: this._to01(state), curve };
  }

  bestStoredMatch(vec01) {
    assert(Array.isArray(vec01) && vec01.length === this.n, 'bestStoredMatch: length mismatch');
    const x = this._toBipolar01(vec01);
    let best = { index: -1, dot: -Infinity, stored01: null };
    for (let p = 0; p < this.stored.length; p++) {
      const s = this.stored[p];
      const dp = dot(x, s);
      if (dp > best.dot) best = { index: p, dot: dp, stored01: this._to01(s) };
    }
    return best;
  }
}

function makeDeterministicPatterns5(n = 16) {
  assert(Number.isInteger(n) && n >= 8, 'makeDeterministicPatterns5: n must be >=8');
  const patterns = [];
  for (let p = 0; p < 5; p++) {
    const v = new Array(n);
    for (let i = 0; i < n; i++) {
      const bit = ((i * (p + 3) + p * p + 7) % (p + 2 + 5)) < (p + 2) ? 1 : 0;
      v[i] = bit;
    }
    patterns.push(v);
  }
  const seen = new Set();
  for (let p = 0; p < patterns.length; p++) {
    let key = patterns[p].join('');
    if (seen.has(key)) {
      const iFlip = (p * 7 + 3) % n;
      patterns[p][iFlip] = patterns[p][iFlip] ? 0 : 1;
      key = patterns[p].join('');
    }
    seen.add(key);
  }
  return patterns;
}

module.exports = {
  AssociativeMemory,
  STDPNetwork,
  HebbianNetwork,
  MemoryConsolidation,
  PatternCompletionHopfield,
  makeDeterministicPatterns5,
};

if (require.main === module) {
  const n = 18;
  const patterns = makeDeterministicPatterns5(n).map((vec, i) => ({ id: `p${i}`, label: `pattern_${i}`, vec }));
  const am = new AssociativeMemory({ metric: 'hamming01' });
  for (const p of patterns) am.addPattern(p);

  console.log('ASSOC_MEM stored', stableStringify({ nPatterns: am.size(), ids: am.list() }));

  let exactOk = 0;
  for (const p of patterns) {
    const top = am.retrieveClosest(p.vec, { topK: 1 })[0];
    const ok = top && top.id === p.id && top.dist === 0;
    if (ok) exactOk++;
    console.log('ASSOC_MEM retrieve_exact', stableStringify({ query: p.id, got: top.id, dist: top.dist }));
  }
  console.log('ASSOC_MEM exact_accuracy', stableStringify({ exactOk, total: patterns.length, acc: Number((exactOk / patterns.length).toFixed(4)) }));

  const target = patterns[3];
  const corrupted = cloneVec(target.vec);
  const flips = [2, 7, 15].map(i => i % n);
  for (const idx of flips) corrupted[idx] = corrupted[idx] ? 0 : 1;
  const closest = am.retrieveClosest(corrupted, { topK: 3 });
  console.log('ASSOC_MEM corrupt_query', stableStringify({ target: target.id, flips, top3: closest.map(r => ({ id: r.id, dist: r.dist })) }));

  const hop = new PatternCompletionHopfield({ n });
  for (const p of patterns) hop.storePattern(p.vec);
  const completion = hop.complete(corrupted, { steps: 10 });
  const match = am.retrieveClosest(completion.out01, { topK: 1 })[0];
  const curveShort = completion.curve.map(e => Number(e.energy.toFixed(6)));
  console.log('HOPFIELD completion', stableStringify({ completedClosest: { id: match.id, dist: match.dist }, energyCurve: curveShort }));

  const stdp = new STDPNetwork({ n: 3, tauPlus: 20, tauMinus: 20, APlus: 0.05, AMinus: 0.06, wMin: 0, wMax: 1 });
  const wBefore = stdp.getWeight(0, 1);
  const u1 = stdp.spike(0, 100);
  const u2 = stdp.spike(1, 110);
  const wAfter = stdp.getWeight(0, 1);
  console.log('STDP weight_change', stableStringify({
    w_0_1_before: Number(wBefore.toFixed(6)),
    w_0_1_after: Number(wAfter.toFixed(6)),
    delta: Number((wAfter - wBefore).toFixed(6)),
    updatesCount: u1.length + u2.length
  }));

  const w21Before = stdp.getWeight(2, 1);
  stdp.spike(1, 200);
  stdp.spike(2, 215);
  const w21After = stdp.getWeight(2, 1);
  console.log('STDP depression', stableStringify({
    w_2_1_before: Number(w21Before.toFixed(6)),
    w_2_1_after: Number(w21After.toFixed(6)),
    delta: Number((w21After - w21Before).toFixed(6))
  }));

  // Hebbian/perceptron supervised learning test: predict first 2 bits.
  const hebb = new HebbianNetwork({ nIn: n, nOut: 2, lr: 0.15, wMin: -2, wMax: 2 });
  const dataset = patterns.map(p => ({
    x: p.vec.map(v => (v ? 1 : 0)),
    y: [p.vec[0] ? 1 : 0, p.vec[1] ? 1 : 0],
    id: p.id
  }));

  const epochs = 12;
  for (let e = 0; e < epochs; e++) {
    for (const ex of dataset) hebb.learn(ex.x, ex.y);
    let ok = 0;
    for (const ex of dataset) {
      const pred = hebb.forward(ex.x);
      if (pred[0] === ex.y[0] && pred[1] === ex.y[1]) ok++;
    }
    const acc = ok / dataset.length;
    console.log('HEBB curve', JSON.stringify({ epoch: e, acc: Number(acc.toFixed(4)), b: hebb.b.map(v => Number(v.toFixed(4))) }));
  }

  console.log('HEBB final', stableStringify({
    bias: hebb.b.map(v => Number(v.toFixed(6))),
    probeW00: Number(hebb.W[0][0].toFixed(6)),
    probeW01: Number(hebb.W[0][1].toFixed(6))
  }));

  const cons = new MemoryConsolidation({ repeatsToConsolidate: 3 });
  const key = 'episode:alpha';
  const obs1 = cons.observe(key, { valence: 0.2, context: 'lab' });
  const obs2 = cons.observe(key, { valence: 0.3, context: 'lab' });
  const obs3 = cons.observe(key, { valence: 0.4, context: 'lab' });
  console.log('CONSOLIDATION', stableStringify({
    obs1, obs2, obs3,
    stats: cons.stats(),
    longTermHasKey: cons.hasLongTerm(key)
  }));

  const completedBest = match.id;
  const completionOk = completedBest === target.id;
  console.log('PATTERN_COMPLETION_RESULT', stableStringify({
    target: target.id,
    assocClosestFromCorrupt: closest[0].id,
    hopfieldCompletedClosest: completedBest,
    ok: completionOk
  }));
}