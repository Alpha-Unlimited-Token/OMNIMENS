/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-03T04:12:09.904Z
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
 * Compiled targets: javascript: OK (17 IR steps) | python: OK (17 IR steps) | c: OK (17 IR steps) | x86_64: OK (17 IR steps) | arm64: OK (17 IR steps) | avr: OK (17 IR steps)
 * Translation map version: 22
 */
// webGpuMatrixEngine.mjs

import { performance } from 'node:perf_hooks';

/**
 * Utility function to create a 2D matrix filled with zeros.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {number[][]} - A 2D array initialized with zeros.
 */
export function createZeroMatrix(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

/**
 * Performs matrix multiplication on two 2D matrices.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resulting matrix after multiplication.
 * @throws {Error} - If matrices are incompatible for multiplication.
 */
export function multiplyMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const result = createZeroMatrix(rowsA, colsB);

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  return result;
}

/**
 * Applies a softmax function to a 1D array.
 * @param {number[]} array - Input array.
 * @returns {number[]} - Softmax-transformed array.
 */
export function softmax(array) {
  const maxVal = Math.max(...array);
  const expArray = array.map(x => Math.exp(x - maxVal));
  const sumExp = expArray.reduce((sum, val) => sum + val, 0);
  return expArray.map(val => val / sumExp);
}

/**
 * Simulates an attention mechanism using scaled dot-product attention.
 * @param {number[][]} queries - Query matrix.
 * @param {number[][]} keys - Key matrix.
 * @param {number[][]} values - Value matrix.
 * @returns {number[][]} - Attention output matrix.
 */
export function scaledDotProductAttention(queries, keys, values) {
  const keyTranspose = transposeMatrix(keys);
  const dotProduct = multiplyMatrices(queries, keyTranspose);

  const scaleFactor = Math.sqrt(keys[0].length);
  const scaledDotProduct = dotProduct.map(row => row.map(val => val / scaleFactor));

  const attentionWeights = scaledDotProduct.map(softmax);
  return multiplyMatrices(attentionWeights, values);
}

/**
 * Transposes a 2D matrix.
 * @param {number[][]} matrix - Input matrix.
 * @returns {number[][]} - Transposed matrix.
 */
export function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const transposed = createZeroMatrix(cols, rows);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposed[j][i] = matrix[i][j];
    }
  }

  return transposed;
}

/**
 * Benchmarks a given function by measuring execution time.
 * @param {Function} func - Function to benchmark.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {{ result, time}} - Result and execution time in milliseconds.
 */
export function benchmarkFunction(func, ...args) {
  const start = performance.now();
  const result = func(...args);
  const end = performance.now();
  return { result, time: end - start };
}

/**
 * Generates a random 2D matrix with values between 0 and 1.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {number[][]} - Randomly generated matrix.
 */
export function generateRandomMatrix(rows, cols) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random()));
}