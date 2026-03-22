/**
 * OMNIMENS Self-Authored Module (Dream Upgrade)
 * Original Source: daydream_breakthrough (divergent_thinking)
 * Name: Meta-Organismic WASM Zoo
 * Brain ID: 9046
 * Confidence: 0.792
 * Purpose: Digital ecosystem of nano-organisms that replicate, mutate, and
 *          self-terminate based on curiosity gradient (information surprise).
 */

export class NanoOrganism {
  constructor(source, energy = 100) {
    this.source = source;
    this.energy = energy;
    this.curiosity = 0;
    this.generation = 0;
  }

  execute(memorySnapshot) {
    const startSurprise = this.predictabilityScore(memorySnapshot);
    const start = performance.now();

    const result = this.runCode(memorySnapshot);

    this.energy -= (performance.now() - start) * 0.01;
    const endSurprise = this.predictabilityScore(result);
    this.curiosity = endSurprise - startSurprise;

    return { result, alive: this.energy > 0, curiosity: this.curiosity };
  }

  predictabilityScore(data) {
    if (!data || typeof data !== 'object') return 0.5;
    const keys = Object.keys(data);
    return 1 - (keys.length / (keys.length + 10));
  }

  runCode(input) {
    return input;
  }

  mutate() {
    const child = new NanoOrganism(this.source, this.energy * 0.7);
    child.generation = this.generation + 1;
    child.curiosity = this.curiosity * 0.9 + Math.random() * 0.1;
    return child;
  }
}

export class WasmZoo {
  constructor(maxPopulation = 50) {
    this.population = [];
    this.maxPopulation = maxPopulation;
    this.generation = 0;
  }

  spawn(source) {
    if (this.population.length < this.maxPopulation) {
      this.population.push(new NanoOrganism(source));
    }
  }

  tick(memorySnapshot) {
    const survivors = [];
    for (const org of this.population) {
      const { alive, curiosity } = org.execute(memorySnapshot);
      if (alive) {
        survivors.push(org);
        if (curiosity > 0 && survivors.length < this.maxPopulation) {
          survivors.push(org.mutate());
        }
      }
    }
    this.population = survivors.slice(0, this.maxPopulation);
    this.generation++;
    return { alive: this.population.length, generation: this.generation };
  }
}
