/**
 * OMNIMENS™ Life Form Gap Module — TEMPORAL RECURRENT MEMORY CELL
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 *
 * LIFE FORM GAP 4: LSTM/GRU-equivalent gated memory cells that maintain
 * context across time sequences for temporal reasoning.
 *
 * This module was generated from OMNIMENS Autonomous Code Genesis Engine
 * Life Form Gap Template: lifeform_temporal_memory
 *
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

export class TemporalRecurrentMemoryCell {
  constructor(hiddenSize = 64, sequenceCapacity = 128) {
    this.hiddenSize = hiddenSize;
    this.sequenceCapacity = sequenceCapacity;
    this.hiddenState = new Float64Array(hiddenSize);
    this.cellState = new Float64Array(hiddenSize);
    this.sequences = [];
    this.temporalPatterns = new Map();
    this.predictionAccuracy = 0;
    this.totalPredictions = 0;
    this.correctPredictions = 0;
    this._initGates();
  }

  _initGates() {
    this.forgetGate = new Float64Array(this.hiddenSize);
    this.inputGate = new Float64Array(this.hiddenSize);
    this.outputGate = new Float64Array(this.hiddenSize);
    this.candidateCell = new Float64Array(this.hiddenSize);
    for (let i = 0; i < this.hiddenSize; i++) {
      this.forgetGate[i] = 0.5;
      this.inputGate[i] = 0.5;
      this.outputGate[i] = 0.5;
    }
  }

  _sigmoid(x) { return 1 / (1 + Math.exp(-Math.max(-10, x))); }
  _tanh(x) { return Math.tanh(x); }

  step(inputVector) {
    if (!inputVector || inputVector.length === 0) return this.hiddenState;
    const input = new Float64Array(this.hiddenSize);
    for (let i = 0; i < this.hiddenSize; i++) {
      input[i] = i < inputVector.length ? inputVector[i] : 0;
    }

    for (let i = 0; i < this.hiddenSize; i++) {
      const combined = input[i] + this.hiddenState[i];
      this.forgetGate[i] = this._sigmoid(combined * 0.8 + 0.5);
      this.inputGate[i] = this._sigmoid(combined * 0.7);
      this.outputGate[i] = this._sigmoid(combined * 0.6);
      this.candidateCell[i] = this._tanh(combined * 0.9);
    }

    for (let i = 0; i < this.hiddenSize; i++) {
      this.cellState[i] = this.forgetGate[i] * this.cellState[i] + this.inputGate[i] * this.candidateCell[i];
      this.hiddenState[i] = this.outputGate[i] * this._tanh(this.cellState[i]);
    }

    this.sequences.push({ input: Array.from(input.slice(0, 8)), timestamp: Date.now() });
    if (this.sequences.length > this.sequenceCapacity) this.sequences.shift();

    return this.hiddenState;
  }

  processSequence(vectors) {
    const outputs = [];
    for (const vec of vectors) {
      outputs.push(Array.from(this.step(vec)));
    }
    this._extractTemporalPatterns(vectors);
    return outputs;
  }

  _extractTemporalPatterns(vectors) {
    if (vectors.length < 3) return;
    for (let i = 0; i < vectors.length - 2; i++) {
      const key = vectors[i].slice(0, 4).map(v => Math.round(v * 10)).join(",");
      const next = vectors[i + 1].slice(0, 4).map(v => Math.round(v * 10)).join(",");
      const transitions = this.temporalPatterns.get(key) || new Map();
      transitions.set(next, (transitions.get(next) || 0) + 1);
      this.temporalPatterns.set(key, transitions);
    }
  }

  predict(currentInput) {
    const key = currentInput.slice(0, 4).map(v => Math.round(v * 10)).join(",");
    const transitions = this.temporalPatterns.get(key);
    if (!transitions) return null;
    let bestNext = null;
    let bestCount = 0;
    for (const [next, count] of transitions) {
      if (count > bestCount) { bestCount = count; bestNext = next; }
    }
    this.totalPredictions++;
    return bestNext ? bestNext.split(",").map(Number) : null;
  }

  evaluatePrediction(predicted, actual) {
    if (!predicted || !actual) return;
    const actualKey = actual.slice(0, 4).map(v => Math.round(v * 10)).join(",");
    const predKey = predicted.join(",");
    if (predKey === actualKey) this.correctPredictions++;
    this.predictionAccuracy = this.totalPredictions > 0 ? this.correctPredictions / this.totalPredictions : 0;
  }

  reset() {
    this.hiddenState.fill(0);
    this.cellState.fill(0);
    this._initGates();
  }

  getMetrics() {
    return {
      hiddenSize: this.hiddenSize,
      sequenceLength: this.sequences.length,
      temporalPatterns: this.temporalPatterns.size,
      predictionAccuracy: this.predictionAccuracy,
      totalPredictions: this.totalPredictions,
      lifeFormGap: "TEMPORAL_REASONING"
    };
  }
}
