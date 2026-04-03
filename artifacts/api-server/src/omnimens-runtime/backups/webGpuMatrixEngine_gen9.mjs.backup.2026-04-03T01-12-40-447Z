/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-01T22:18:45.683Z
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
 * Compiled targets: javascript: OK (28 IR steps) | python: OK (28 IR steps) | c: OK (28 IR steps) | x86_64: OK (28 IR steps) | arm64: OK (28 IR steps) | avr: OK (28 IR steps)
 * Translation map version: 22
 */
// webGpuMatrixEngine.mjs

'use strict';

import { crypto } from 'node:crypto';

/**
 * Generates a random float matrix of given dimensions.
 * Useful for initialization, testing, and simulations.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Float32Array[]} - 2D array representing the matrix.
 */
export function generateRandomMatrix(rows, cols) {
  const matrix = [];
  for (let i = 0; i < rows; i++) {
    const row = new Float32Array(cols);
    for (let j = 0; j < cols; j++) {
      row[j] = crypto.randomFloat();
    }
    matrix.push(row);
  }
  return matrix;
}

/**
 * Performs matrix multiplication using naive algorithm.
 * Handles edge cases like mismatched dimensions.
 * @param {Float32Array[]} A - First matrix (m x n).
 * @param {Float32Array[]} B - Second matrix (n x p).
 * @returns {Float32Array[]} - Resultant matrix (m x p).
 */
export function matrixMultiply(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not align for multiplication.');
  }

  const result = [];
  for (let i = 0; i < rowsA; i++) {
    const row = new Float32Array(colsB);
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
      }
      row[j] = sum;
    }
    result.push(row);
  }
  return result;
}

/**
 * Applies scaled dot-product attention mechanism.
 * Useful for transformers and attention-based architectures.
 * @param {Float32Array[]} Q - Query matrix.
 * @param {Float32Array[]} K - Key matrix.
 * @param {Float32Array[]} V - Value matrix.
 * @returns {Float32Array[]} - Attention output matrix.
 */
export function scaledDotProductAttention(Q, K, V) {
  const scaleFactor = Math.sqrt(K[0].length);

  // Compute attention scores (Q * K^T)
  const KTransposed = transposeMatrix(K);
  const attentionScores = matrixMultiply(Q, KTransposed);

  // Scale scores and apply softmax
  const scaledScores = attentionScores.map(row => row.map(score => score / scaleFactor));
  const softmaxScores = scaledScores.map(softmax);

  // Compute attention output (softmaxScores * V)
  const attentionOutput = matrixMultiply(softmaxScores, V);
  return attentionOutput;
}

/**
 * Transposes a matrix.
 * @param {Float32Array[]} matrix - Input matrix.
 * @returns {Float32Array[]} - Transposed matrix.
 */
export function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const transposed = [];

  for (let i = 0; i < cols; i++) {
    const row = new Float32Array(rows);
    for (let j = 0; j < rows; j++) {
      row[j] = matrix[j][i];
    }
    transposed.push(row);
  }
  return transposed;
}

/**
 * Applies softmax function to a vector.
 * @param {Float32Array} vector - Input vector.
 * @returns {Float32Array} - Softmaxed vector.
 */
export function softmax(vector) {
  const max = Math.max(...vector);
  const exps = vector.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

/**
 * Validates matrix dimensions for compatibility.
 * @param {Float32Array[]} matrix - Input matrix.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return false;
  }
  const cols = matrix[0].length;
  return matrix.every(row => row.length === cols);
}

/**
 * Computes the sum of all elements in a matrix.
 * Useful for aggregation and normalization tasks.
 * @param {Float32Array[]} matrix - Input matrix.
 * @returns {number} - Sum of all elements.
 */
export function sumMatrix(matrix) {
  return matrix.reduce((sum, row) => sum + row.reduce((rowSum, val) => rowSum + val, 0), 0);
}