/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuTensorEngine
 * Written: 2026-04-02T14:13:17.620Z
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
// webGpuTensorEngine.mjs

import { randomUUID } from 'crypto';

/**
 * Generates a 2D tensor (matrix) with specified dimensions, filled with random values.
 * @param {number} rows - Number of rows in the tensor.
 * @param {number} cols - Number of columns in the tensor.
 * @returns {Array<Array<number>>} - A 2D array representing the tensor.
 */
export function generateRandomTensor(rows, cols) {
  if (rows <= 0 || cols <= 0) throw new Error('Rows and columns must be positive integers.');
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random()));
}

/**
 * Performs matrix multiplication on two 2D tensors.
 * @param {Array<Array<number>>} A - The first matrix.
 * @param {Array<Array<number>>} B - The second matrix.
 * @returns {Array<Array<number>>} - The resulting matrix after multiplication.
 */
export function matrixMultiply(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) throw new Error('Matrix dimensions do not align for multiplication.');

  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return result;
}

/**
 * Computes attention scores using the scaled dot-product attention mechanism.
 * @param {Array<Array<number>>} queries - Query matrix.
 * @param {Array<Array<number>>} keys - Key matrix.
 * @param {Array<Array<number>>} values - Value matrix.
 * @returns {Array<Array<number>>} - Attention output matrix.
 */
export function computeAttention(queries, keys, values) {
  const dk = keys[0].length; // Dimensionality of keys
  const scaledScores = matrixMultiply(queries, transposeMatrix(keys)).map(row => row.map(val => val / Math.sqrt(dk)));
  const attentionWeights = softmax2D(scaledScores);
  return matrixMultiply(attentionWeights, values);
}

/**
 * Transposes a 2D matrix.
 * @param {Array<Array<number>>} matrix - The matrix to transpose.
 * @returns {Array<Array<number>>} - Transposed matrix.
 */
export function transposeMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

/**
 * Applies the softmax function to a 2D matrix row-wise.
 * @param {Array<Array<number>>} matrix - The input matrix.
 * @returns {Array<Array<number>>} - Matrix with softmax applied row-wise.
 */
export function softmax2D(matrix) {
  return matrix.map(row => {
    const maxVal = Math.max(...row);
    const exps = row.map(val => Math.exp(val - maxVal));
    const sumExps = exps.reduce((sum, val) => sum + val, 0);
    return exps.map(val => val / sumExps);
  });
}

/**
 * Updates a Hopfield memory state using Hebbian learning rule.
 * @param {Array<number>} state - Current state vector.
 * @param {Array<Array<number>>} weights - Weight matrix.
 * @returns {Array<number>} - Updated state vector.
 */
export function hopfieldUpdate(state, weights) {
  if (state.length !== weights.length || weights.length !== weights[0].length) {
    throw new Error('State vector and weight matrix dimensions must align.');
  }

  const newState = Array(state.length).fill(0);

  for (let i = 0; i < state.length; i++) {
    let sum = 0;
    for (let j = 0; j < state.length; j++) {
      sum += weights[i][j] * state[j];
    }
    newState[i] = sum >= 0 ? 1 : -1; // Binary threshold activation
  }

  return newState;
}

/**
 * Generates a unique identifier for tensor operations.
 * @returns {string} - A UUID string.
 */
export function generateOperationId() {
  return randomUUID();
}
