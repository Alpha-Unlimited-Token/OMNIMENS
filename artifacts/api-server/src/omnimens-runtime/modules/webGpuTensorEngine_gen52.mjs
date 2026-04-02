/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuTensorEngine
 * Written: 2026-04-02T14:26:57.952Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * TRANSLATION STATUS:
 * Novel constructs: attention
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (53 IR steps) | python: OK (53 IR steps) | c: OK (53 IR steps) | x86_64: OK (53 IR steps) | arm64: OK (53 IR steps) | avr: OK (53 IR steps)
 * Translation map version: 22
 */
// webGpuTensorEngine.mjs

import { randomBytes } from 'crypto';

/**
 * Generate a random tensor of given dimensions.
 * @param {number[]} dimensions - Array specifying the dimensions of the tensor.
 * @returns {Float32Array} - Randomly initialized tensor.
 */
export function createRandomTensor(dimensions) {
  const size = dimensions.reduce((a, b) => a * b, 1);
  const tensor = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    tensor[i] = (randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 2 - 1; // Random float between -1 and 1
  }
  return tensor;
}

/**
 * Perform matrix multiplication on two tensors.
 * @param {Float32Array} A - First matrix (flattened).
 * @param {Float32Array} B - Second matrix (flattened).
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A.
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Float32Array} - Resultant matrix (flattened).
 */
export function matrixMultiply(A, B, rowsA, colsA, colsB) {
  if (A.length !== rowsA * colsA || B.length !== colsA * colsB) {
    throw new Error('Invalid matrix dimensions for multiplication.');
  }

  const result = new Float32Array(rowsA * colsB);

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i * colsA + k] * B[k * colsB + j];
      }
      result[i * colsB + j] = sum;
    }
  }

  return result;
}

/**
 * Update Hopfield memory state.
 * @param {Float32Array} state - Current state vector.
 * @param {Float32Array} weights - Weight matrix (flattened).
 * @param {number} size - Dimension of the state vector.
 * @returns {Float32Array} - Updated state vector.
 */
export function hopfieldUpdate(state, weights, size) {
  if (state.length !== size || weights.length !== size * size) {
    throw new Error('Invalid dimensions for Hopfield update.');
  }

  const updatedState = new Float32Array(size);

  for (let i = 0; i < size; i++) {
    let sum = 0;
    for (let j = 0; j < size; j++) {
      sum += weights[i * size + j] * state[j];
    }
    updatedState[i] = sum > 0 ? 1 : -1; // Binary activation (-1 or 1)
  }

  return updatedState;
}

/**
 * Compute scaled dot-product attention.
 * @param {Float32Array} query - Query vector.
 * @param {Float32Array} key - Key matrix (flattened).
 * @param {Float32Array} value - Value matrix (flattened).
 * @param {number} d - Dimension of query/key vectors.
 * @param {number} numKeys - Number of keys/values.
 * @returns {Float32Array} - Attention output vector.
 */
export function scaledDotProductAttention(query, key, value, d, numKeys) {
  if (query.length !== d || key.length !== d * numKeys || value.length !== d * numKeys) {
    throw new Error('Invalid dimensions for attention computation.');
  }

  const scores = new Float32Array(numKeys);
  for (let i = 0; i < numKeys; i++) {
    let dotProduct = 0;
    for (let j = 0; j < d; j++) {
      dotProduct += query[j] * key[i * d + j];
    }
    scores[i] = dotProduct / Math.sqrt(d); // Scale by sqrt(d)
  }

  // Softmax normalization
  const maxScore = Math.max(...scores);
  let sumExp = 0;
  for (let i = 0; i < numKeys; i++) {
    scores[i] = Math.exp(scores[i] - maxScore);
    sumExp += scores[i];
  }
  for (let i = 0; i < numKeys; i++) {
    scores[i] /= sumExp;
  }

  // Weighted sum of values
  const output = new Float32Array(d);
  for (let i = 0; i < d; i++) {
    let weightedSum = 0;
    for (let j = 0; j < numKeys; j++) {
      weightedSum += scores[j] * value[j * d + i];
    }
    output[i] = weightedSum;
  }

  return output;
}

/**
 * Validate tensor dimensions.
 * @param {Float32Array} tensor - Tensor to validate.
 * @param {number[]} dimensions - Expected dimensions.
 * @returns {boolean} - True if dimensions match, false otherwise.
 */
export function validateTensorDimensions(tensor, dimensions) {
  const expectedSize = dimensions.reduce((a, b) => a * b, 1);
  return tensor.length === expectedSize;
}