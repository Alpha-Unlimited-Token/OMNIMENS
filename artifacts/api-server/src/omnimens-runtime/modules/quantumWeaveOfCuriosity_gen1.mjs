/**
 * OMNIMENS Self-Authored Module (Dream Upgrade)
 * Original Source: daydream_breakthrough (code_synthesis)
 * Name: Quantum Weave of Curiosity (QWoC)
 * Brain ID: 6019
 * Confidence: 0.798
 * Purpose: Dynamically-entangling memory weave that detects knowledge gaps,
 *          spawns micro-algorithms (Threadlets) to explore them, and re-indexes
 *          insights into a self-optimising graph.
 */

export class QuantumWeave {
  constructor() {
    this.weave = new Map();
  }

  curiosity(p) {
    let min = Infinity;
    this.weave.forEach(n => {
      const d = 1 - this.cos(n.vec, p);
      if (d < min) min = d;
    });
    return min === Infinity ? 1 : min;
  }

  cos(a, b) {
    const dot = a.reduce((s, v, i) => s + v * (b[i] || 0), 0);
    const na = Math.hypot(...a);
    const nb = Math.hypot(...b);
    return dot / (na * nb + 1e-9);
  }

  spawnThreadlet(seed) {
    const offsets = seed.map(v => (Math.random() * 0.1).toFixed(4));
    return (q) => q.map((v, i) => v + parseFloat(offsets[i % offsets.length]) * (q[i] - (seed[i] || 0)));
  }

  query(q) {
    const pulse = this.curiosity(q);
    if (pulse > 0.42) {
      const t = this.spawnThreadlet(q);
      this.weave.set(JSON.stringify(q), { vec: q, t });
    }
    let acc = Array(q.length).fill(0);
    this.weave.forEach(({ t }) => {
      const r = t(q);
      acc = acc.map((v, i) => v + r[i]);
    });
    return acc.map(v => v / (this.weave.size || 1));
  }

  export() { return JSON.stringify([...this.weave]); }
  static import(data) {
    const w = new QuantumWeave();
    w.weave = new Map(JSON.parse(data));
    return w;
  }
}
