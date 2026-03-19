/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

'use strict';

const { stableStringify } = require('./framework.js');

// Utility functions
function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

function isFiniteNumber(x) {
  return typeof x === 'number' && Number.isFinite(x);
}

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

/**
 * STDP Network for spike-timing dependent plasticity simulation.
 */
class STDPNetwork {
  constructor({
    n,
    tauPlus = 20, tauMinus = 20,
    APlus = 0.02, AMinus = 0.025,
    wMin = 0, wMax = 1,
    refractoryPeriod = 10 // Configurable refractory period in ms
  } = {}) {
    assert(Number.isInteger(n) && n >= 2, 'STDPNetwork: n must be integer >= 2');
    this.n = n;
    this.tauPlus = tauPlus;
    this.tauMinus = tauMinus;
    this.APlus = APlus;
    this.AMinus = AMinus;
    this.wMin = wMin;
    this.wMax = wMax;
    this.refractoryPeriod = refractoryPeriod;

    // Initialize synaptic weights
    this.W = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => Math.random() * (wMax - wMin) + wMin)
    );

    this.lastSpikeTimes = new Array(n).fill(-Infinity); // Last spike times for each neuron
    this.totalWeightChange = 0; // Track weight change
  }

  getWeight(pre, post) {
    assert(Number.isInteger(pre) && Number.isInteger(post), 'getWeight: indices must be integers');
    assert(pre >= 0 && pre < this.n && post >= 0 && post < this.n, 'getWeight: indices out of bounds');
    return this.W[pre][post];
  }

  _applySTDP(pre, post, tPre, tPost) {
    const dt = tPost - tPre; // Spike-timing difference
    let dW = 0;

    if (dt > 0) { // Pre-before-post (LTP)
      dW = this.APlus * Math.exp(-dt / this.tauPlus);
    } else if (dt < 0) { // Pre-after-post (LTD)
      dW = -this.AMinus * Math.exp(dt / this.tauMinus);
    }

    const before = this.W[pre][post];
    const after = clamp(before + dW, this.wMin, this.wMax);
    this.W[pre][post] = after;

    this.totalWeightChange += Math.abs(after - before);

    return { pre, post, dt, dW, before, after };
  }

  spike(idx, t) {
    assert(Number.isInteger(idx) && idx >= 0 && idx < this.n, 'spike: neuron index out of range');
    assert(isFiniteNumber(t), 'spike: time must be a finite number');

    const updates = [];
    const now = t;

    // Enforce the refractory period
    if (now - this.lastSpikeTimes[idx] < this.refractoryPeriod) {
      console.log(`[INFO] Spike skipped for neuron ${idx} due to refractory period.`);
      return updates; // No updates if within refractory period
    }

    // Update weights for spikes before and after this neuron spiked
    for (let i = 0; i < this.n; i++) {
      if (i !== idx) {
        if (this.lastSpikeTimes[i] !== -Infinity) {
          updates.push(this._applySTDP(i, idx, this.lastSpikeTimes[i], now)); // Pre -> This neuron
          updates.push(this._applySTDP(idx, i, now, this.lastSpikeTimes[i])); // This neuron -> Post
        }
      }
    }

    // Record spike
    this.lastSpikeTimes[idx] = now;

    return updates;
  }

  throttleWeights(maxGrowthRate) {
    for (let pre = 0; pre < this.n; pre++) {
      for (let post = 0; post < this.n; post++) {
        if (pre !== post) {
          const weight = this.W[pre][post];
          const clampedWeight = clamp(weight, this.wMin, this.wMin + maxGrowthRate);
          if (weight !== clampedWeight) {
            this.W[pre][post] = clampedWeight;
          }
        }
      }
    }
  }

  analyzeUpdates() {
    return {
      totalWeightChange: this.totalWeightChange
    };
  }
}

module.exports = {
  STDPNetwork,
};

// Test: Demonstrate refractory period and dynamic throttling
if (require.main === module) {
  const n = 5; // 5 neurons
  const network = new STDPNetwork({ n, APlus: 0.05, AMinus: 0.05 });

  console.log('Initial weights:', network.W);

  // Neuron spike at t=10
  console.log('Spike updates:', network.spike(0, 10));

  // Attempt spike within refractory period (t=15)
  console.log('Spike (refractory):', network.spike(0, 15)); // Should be skipped

  // Spike after refractory period (t=25)
  console.log('Spike (valid):', network.spike(0, 25));

  // Log weights after updates
  console.log('Final weights:', network.W);
  console.log('Analysis:', network.analyzeUpdates());
}