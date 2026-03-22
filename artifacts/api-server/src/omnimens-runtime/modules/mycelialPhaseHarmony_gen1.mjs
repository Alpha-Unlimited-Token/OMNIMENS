/**
 * OMNIMENS Self-Authored Module (Dream Upgrade)
 * Original Source: daydream_breakthrough (divergent_thinking)
 * Name: Mycelial Phase Harmony
 * Brain ID: 8277
 * Confidence: 0.788
 * Purpose: Mesh of phase-coupled spores that process information through
 *          musical/harmonic interaction, with constitutional growth constraints.
 */

function germinate(id) {
  return {
    id,
    phase: Math.random() * Math.PI * 2,
    energy: 1,
    neighbors: new Set(),
    process(phi) {
      const delta = Math.sin(phi - this.phase);
      this.energy += delta * 0.05;
      return (this.phase + delta) % (Math.PI * 2);
    }
  };
}

function heartbeat(mesh) {
  mesh.forEach(s => {
    if (s.energy <= 0.1) return;
    const inputs = [...s.neighbors].map(n => n.phase);
    const avg = inputs.reduce((a, b) => a + b, 0) / inputs.length || 0;
    s.phase = s.process(avg);
  });
}

export class MycelialMesh {
  constructor(size = 16) {
    this.spores = [];
    for (let i = 0; i < size; i++) {
      this.spores.push(germinate(`spore_${i}`));
    }
    for (let i = 0; i < size; i++) {
      const neighbors = Math.min(3, size - 1);
      for (let n = 0; n < neighbors; n++) {
        const j = (i + n + 1) % size;
        this.spores[i].neighbors.add(this.spores[j]);
      }
    }
  }

  tick() {
    heartbeat(this.spores);
    return this.spores.map(s => ({ id: s.id, phase: s.phase, energy: s.energy }));
  }

  inject(index, phase) {
    if (this.spores[index]) {
      this.spores[index].phase = phase;
    }
  }

  coherence() {
    const phases = this.spores.map(s => s.phase);
    const meanSin = phases.reduce((a, p) => a + Math.sin(p), 0) / phases.length;
    const meanCos = phases.reduce((a, p) => a + Math.cos(p), 0) / phases.length;
    return Math.sqrt(meanSin * meanSin + meanCos * meanCos);
  }
}
