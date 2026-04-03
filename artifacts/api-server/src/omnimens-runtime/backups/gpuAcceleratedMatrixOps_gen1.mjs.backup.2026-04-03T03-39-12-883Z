/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-03T03:17:21.490Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuAcceleratedMatrixOps.mjs

import { performance } from 'perf_hooks';

/**
 * Utility function to create a 2D matrix filled with zeros.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {number[][]} A 2D array filled with zeros.
 */
export function createZeroMatrix(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

/**
 * Performs matrix multiplication using GPU acceleration (simulated with parallel CPU logic).
 * @param {number[][]} A - First matrix.
 * @param {number[][]} B - Second matrix.
 * @returns {number[][]} Resultant matrix after multiplication.
 * @throws Will throw an error if matrices cannot be multiplied.
 */
export function gpuAcceleratedMatrixMultiply(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not allow multiplication.');
  }

  const result = createZeroMatrix(rowsA, colsB);

  // Parallelized computation (simulated with map for simplicity)
  result.forEach((row, i) => {
    result[i] = Array.from({ length: colsB }, (_, j) => {
      return A[i].reduce((sum, aVal, k) => sum + aVal * B[k][j], 0);
    });
  });

  return result;
}

/**
 * Performs element-wise addition of two matrices.
 * @param {number[][]} A - First matrix.
 * @param {number[][]} B - Second matrix.
 * @returns {number[][]} Resultant matrix after addition.
 * @throws Will throw an error if matrices dimensions do not match.
 */
export function gpuAcceleratedMatrixAdd(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Matrix dimensions do not match for addition.');
  }

  return A.map((row, i) => row.map((val, j) => val + B[i][j]));
}

/**
 * Measures execution time of a given function.
 * @param {Function} func - Function to execute.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {{ result, time}} Result of the function and execution time in milliseconds.
 */
export function measureExecutionTime(func, ...args) {
  const start = performance.now();
  const result = func(...args);
  const end = performance.now();
  return { result, time: end - start };
}

/**
 * Generates a random matrix with specified dimensions and value range.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @param {number} [min=0] - Minimum value for random numbers.
 * @param {number} [max=1] - Maximum value for random numbers.
 * @returns {number[][]} A 2D array with random values.
 */
export function generateRandomMatrix(rows, cols, min = 0, max = 1) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() * (max - min) + min)
  );
}

/**
 * Transposes a given matrix.
 * @param {number[][]} matrix - Matrix to transpose.
 * @returns {number[][]} Transposed matrix.
 */
export function transposeMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}
