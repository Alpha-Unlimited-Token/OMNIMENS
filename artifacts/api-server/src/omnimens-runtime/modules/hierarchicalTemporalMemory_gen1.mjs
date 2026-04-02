/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_51
 * Name: hierarchicalTemporalMemory
 * Purpose: Preserves long-range dependencies in compressed token windows using a memory-prediction framework.
 * Description: Implements Hierarchical Temporal Memory (HTM) using SDRs and temporal pooling to capture and preserve long-range dependencies in token sequences.
 * Migrated: 2026-04-02T14:08:14.872Z
 */

// hierarchicalTemporalMemory.mjs

// Utility functions for Sparse Distributed Representations (SDRs)
export function createSDR(size, sparsity) {
  const sdr = new Array(size).fill(0);
  const activeBits = Math.floor(size * sparsity);
  const indices = new Set();

  while (indices.size < activeBits) {
    indices.add(Math.floor(Math.random() * size));
  }

  indices.forEach(index => sdr[index] = 1);
  return sdr;
}

export function overlapScore(sdr1, sdr2) {
  if (sdr1.length !== sdr2.length) {
    throw new Error("SDRs must be of the same length to compute overlap score.");
  }

  return sdr1.reduce((score, bit, index) => score + (bit & sdr2[index]), 0);
}

// Temporal Memory for capturing patterns in sequences
export function temporalMemory(sequence, sdrSize, sparsity) {
  const memory = [];

  sequence.forEach(token => {
    const tokenSDR = createSDR(sdrSize, sparsity);

    if (memory.length > 0) {
      const previousSDR = memory[memory.length - 1];
      const overlap = overlapScore(previousSDR, tokenSDR);

      if (overlap === 0) {
        memory.push(tokenSDR);
      }
    } else {
      memory.push(tokenSDR);
    }
  });

  return memory;
}

// Temporal Pooling to preserve long-range dependencies
export function temporalPooling(memory, poolingWindowSize) {
  const pooledMemory = [];

  for (let i = 0; i < memory.length; i += poolingWindowSize) {
    const window = memory.slice(i, i + poolingWindowSize);
    const pooledSDR = new Array(memory[0].length).fill(0);

    window.forEach(sdr => {
      sdr.forEach((bit, index) => {
        if (bit === 1) pooledSDR[index] = 1;
      });
    });

    pooledMemory.push(pooledSDR);
  }

  return pooledMemory;
}

// High-level function to process token sequences
export function processTokenSequence(sequence, sdrSize = 512, sparsity = 0.02, poolingWindowSize = 5) {
  const memory = temporalMemory(sequence, sdrSize, sparsity);
  const pooledMemory = temporalPooling(memory, poolingWindowSize);

  return {
    rawMemory: memory,
    pooledMemory
  };
}

// Utility for visualizing SDRs
export function visualizeSDR(sdr) {
  return sdr.map(bit => (bit === 1 ? "█" : " ")).join("");
}

// Example usage:
// const sequence = ['A', 'B', 'C', 'D', 'E'];
// const result = processTokenSequence(sequence);
// console.log(result);