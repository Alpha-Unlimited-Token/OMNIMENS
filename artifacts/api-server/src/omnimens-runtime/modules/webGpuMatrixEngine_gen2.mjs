/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-03T16:08:20.681Z
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
 * Compiled targets: javascript: OK (11 IR steps) | python: OK (11 IR steps) | c: OK (11 IR steps) | x86_64: OK (11 IR steps) | arm64: OK (11 IR steps) | avr: OK (11 IR steps)
 * Translation map version: 22
 */
// webGpuMatrixEngine.mjs

import { GPU } from 'gpu.js';

const gpu = new GPU();

/**
 * Performs high-dimensional matrix multiplication using WebGPU acceleration.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resulting matrix after multiplication.
 */
export function gpuMatrixMultiply(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const multiplyKernel = gpu.createKernel(function (a, b) {
    let sum = 0;
    for (let i = 0; i < this.constants.size; i++) {
      sum += a[this.thread.y][i] * b[i][this.thread.x];
    }
    return sum;
  })
    .setOutput([matrixB[0].length, matrixA.length])
    .setConstants({ size: matrixB.length });

  return multiplyKernel(matrixA, matrixB);
}

/**
 * Applies scaled dot-product attention mechanism using WebGPU.
 * @param {number[][]} queries - Query matrix.
 * @param {number[][]} keys - Key matrix.
 * @param {number[][]} values - Value matrix.
 * @returns {number[][]} - Attention output matrix.
 */
export function gpuScaledDotProductAttention(queries, keys, values) {
  const scaleFactor = Math.sqrt(keys[0].length);

  // Compute attention scores (queries * keys^T)
  const keysTransposed = transposeMatrix(keys);
  const attentionScores = gpuMatrixMultiply(queries, keysTransposed);

  // Scale attention scores
  const scaledScores = attentionScores.map(row => row.map(value => value / scaleFactor));

  // Apply softmax to attention scores
  const softmaxScores = scaledScores.map(row => softmax(row));

  // Compute attention output (softmaxScores * values)
  return gpuMatrixMultiply(softmaxScores, values);
}

/**
 * Transposes a matrix.
 * @param {number[][]} matrix - Matrix to transpose.
 * @returns {number[][]} - Transposed matrix.
 */
export function transposeMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

/**
 * Applies the softmax function to a vector.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Softmaxed vector.
 */
export function softmax(vector) {
  const maxVal = Math.max(...vector);
  const expVector = vector.map(value => Math.exp(value - maxVal));
  const sumExp = expVector.reduce((sum, value) => sum + value, 0);
  return expVector.map(value => value / sumExp);
}

/**
 * Validates matrix dimensions for compatibility.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {boolean} - True if matrices can be multiplied, false otherwise.
 */
export function validateMatrixDimensions(matrixA, matrixB) {
  return matrixA[0].length === matrixB.length;
}

/**
 * Generates a random matrix.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number[][]} - Randomly generated matrix.
 */
export function generateRandomMatrix(rows, cols, min = 0, max = 1) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() * (max - min) + min)
  );
}
