/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuMatrixOps
 * Written: 2026-04-03T15:45:10.600Z
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
 * Compiled targets: javascript: OK (20 IR steps) | python: OK (20 IR steps) | c: OK (20 IR steps) | x86_64: OK (20 IR steps) | arm64: OK (20 IR steps) | avr: OK (20 IR steps)
 * Translation map version: 22
 */
// gpuMatrixOps.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for caching matrix operations.
 * @param {Array} matrices - Array of matrices involved in the operation.
 * @returns {string} - A unique hash string.
 */
export function generateMatrixHash(matrices) {
  const hash = createHash('sha256');
  matrices.forEach(matrix => {
    hash.update(JSON.stringify(matrix));
  });
  return hash.digest('hex');
}

/**
 * Performs matrix multiplication (A * B) using a naive algorithm.
 * @param {Array<Array<number>>} A - First matrix.
 * @param {Array<Array<number>>} B - Second matrix.
 * @returns {Array<Array<number>>} - Resulting matrix after multiplication.
 */
export function multiplyMatrices(A, B) {
  if (A[0].length !== B.length) {
    throw new Error('Matrix dimensions do not align for multiplication.');
  }

  const result = Array(A.length).fill(null).map(() => Array(B[0].length).fill(0));

  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B[0].length; j++) {
      for (let k = 0; k < B.length; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return result;
}

/**
 * Applies a softmax function to a 1D array.
 * @param {Array<number>} vector - Input vector.
 * @returns {Array<number>} - Softmax-transformed vector.
 */
export function softmax(vector) {
  const maxVal = Math.max(...vector);
  const exps = vector.map(v => Math.exp(v - maxVal));
  const sumExps = exps.reduce((sum, val) => sum + val, 0);
  return exps.map(v => v / sumExps);
}

/**
 * Computes attention scores using a scaled dot-product attention mechanism.
 * @param {Array<Array<number>>} queries - Query matrix.
 * @param {Array<Array<number>>} keys - Key matrix.
 * @param {Array<Array<number>>} values - Value matrix.
 * @param {number} [scaleFactor=1] - Scaling factor for the dot product.
 * @returns {Array<Array<number>>} - Attention-weighted values.
 */
export function scaledDotProductAttention(queries, keys, values, scaleFactor = 1) {
  const keyTranspose = transposeMatrix(keys);
  const dotProduct = multiplyMatrices(queries, keyTranspose);

  const scaledDotProduct = dotProduct.map(row => row.map(val => val / scaleFactor));
  const attentionWeights = scaledDotProduct.map(softmax);

  return multiplyMatrices(attentionWeights, values);
}

/**
 * Transposes a matrix.
 * @param {Array<Array<number>>} matrix - Input matrix.
 * @returns {Array<Array<number>>} - Transposed matrix.
 */
export function transposeMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

/**
 * Updates a Hopfield network state using a synchronous update rule.
 * @param {Array<number>} state - Current state vector.
 * @param {Array<Array<number>>} weightMatrix - Weight matrix of the network.
 * @returns {Array<number>} - Updated state vector.
 */
export function hopfieldUpdate(state, weightMatrix) {
  if (state.length !== weightMatrix.length || weightMatrix.length !== weightMatrix[0].length) {
    throw new Error('State vector and weight matrix dimensions do not align.');
  }

  const updatedState = Array(state.length).fill(0);

  for (let i = 0; i < state.length; i++) {
    let sum = 0;
    for (let j = 0; j < state.length; j++) {
      sum += weightMatrix[i][j] * state[j];
    }
    updatedState[i] = sum >= 0 ? 1 : -1;
  }

  return updatedState;
}

/**
 * Validates if a given 2D array is a valid matrix.
 * @param {Array<Array<number>>} matrix - Input 2D array.
 * @returns {boolean} - True if valid matrix, else false.
 */
export function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) return false;
  const rowLength = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === rowLength);
}
