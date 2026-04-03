/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-03T18:24:16.284Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGpuMatrixEngine.mjs

import { performance } from 'perf_hooks';

/**
 * Utility function to create a 2D matrix filled with random values.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {number[][]} - A 2D matrix with random values.
 */
export function createRandomMatrix(rows, cols) {
  const matrix = Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random()));
  return matrix;
}

/**
 * Utility function to perform matrix multiplication.
 * @param {number[][]} A - First matrix.
 * @param {number[][]} B - Second matrix.
 * @returns {number[][]} - Resultant matrix after multiplication.
 */
export function multiplyMatrices(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

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
 * Utility function to compute the LU decomposition of a matrix.
 * @param {number[][]} matrix - Input square matrix.
 * @returns {{L, U}} - Lower and Upper triangular matrices.
 */
export function luDecomposition(matrix) {
  const n = matrix.length;
  const L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  const U = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < i; k++) {
        sum += L[i][k] * U[k][j];
      }
      U[i][j] = matrix[i][j] - sum;
    }

    for (let j = i + 1; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < i; k++) {
        sum += L[j][k] * U[k][i];
      }
      L[j][i] = (matrix[j][i] - sum) / U[i][i];
    }
  }

  return { L, U };
}

/**
 * Utility function to estimate eigenvalues using the power iteration method.
 * @param {number[][]} matrix - Input square matrix.
 * @param {number} iterations - Number of iterations to perform.
 * @returns {number} - Dominant eigenvalue.
 */
export function powerIteration(matrix, iterations = 1000) {
  const n = matrix.length;
  let b = Array.from({ length: n }, () => Math.random());
  let eigenvalue = 0;

  for (let iter = 0; iter < iterations; iter++) {
    const bNext = multiplyMatrixVector(matrix, b);
    const norm = Math.sqrt(bNext.reduce((sum, val) => sum + val ** 2, 0));
    b = bNext.map((val) => val / norm);
    eigenvalue = b.reduce((sum, val, i) => sum + val * multiplyMatrixVector(matrix, b)[i], 0);
  }

  return eigenvalue;
}

/**
 * Helper function to multiply a matrix by a vector.
 * @param {number[][]} matrix - Input matrix.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Resultant vector.
 */
export function multiplyMatrixVector(matrix, vector) {
  return matrix.map((row) => row.reduce((sum, val, i) => sum + val * vector[i], 0));
}

/**
 * Benchmark utility to measure execution time of a function.
 * @param {Function} func - Function to benchmark.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {number} - Execution time in milliseconds.
 */
export function benchmarkFunction(func, ...args) {
  const start = performance.now();
  func(...args);
  const end = performance.now();
  return end - start;
}
