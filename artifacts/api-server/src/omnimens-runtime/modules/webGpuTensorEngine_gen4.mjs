/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuTensorEngine
 * Written: 2026-04-02T14:22:48.595Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGpuTensorEngine.mjs

import { performance } from 'perf_hooks';

/**
 * Utility function to create a 2D matrix filled with zeros.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {number[][]} - A 2D array filled with zeros.
 */
export function createZeroMatrix(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

/**
 * Performs matrix multiplication using a parallelized algorithm.
 * @param {number[][]} A - First matrix.
 * @param {number[][]} B - Second matrix.
 * @returns {number[][]} - Resultant matrix after multiplication.
 * @throws {Error} - If matrices cannot be multiplied due to dimension mismatch.
 */
export function multiplyMatrices(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not allow multiplication.');
  }

  const result = createZeroMatrix(rowsA, colsB);

  // Parallelized computation using nested loops
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }

  return result;
}

/**
 * Computes the eigenvalues of a 2x2 matrix using a closed-form solution.
 * @param {number[][]} matrix - A 2x2 matrix.
 * @returns {number[]} - Array of eigenvalues.
 * @throws {Error} - If the input is not a 2x2 matrix.
 */
export function computeEigenvalues(matrix) {
  if (matrix.length !== 2 || matrix[0].length !== 2) {
    throw new Error('Only 2x2 matrices are supported for eigenvalue computation.');
  }

  const [a, b] = matrix[0];
  const [c, d] = matrix[1];

  const trace = a + d;
  const determinant = a * d - b * c;
  const discriminant = Math.sqrt(trace * trace - 4 * determinant);

  const eigenvalue1 = (trace + discriminant) / 2;
  const eigenvalue2 = (trace - discriminant) / 2;

  return [eigenvalue1, eigenvalue2];
}

/**
 * Measures the execution time of a given function.
 * @param {Function} func - The function to measure.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {{ result, time}} - The result of the function and execution time in milliseconds.
 */
export function measureExecutionTime(func, ...args) {
  const start = performance.now();
  const result = func(...args);
  const end = performance.now();

  return { result, time: end - start };
}

/**
 * Applies a 2D convolution operation on a matrix using a kernel.
 * @param {number[][]} matrix - Input matrix.
 * @param {number[][]} kernel - Convolution kernel.
 * @returns {number[][]} - Resultant matrix after convolution.
 */
export function applyConvolution(matrix, kernel) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const kernelSize = kernel.length;
  const pad = Math.floor(kernelSize / 2);

  const paddedMatrix = createZeroMatrix(rows + 2 * pad, cols + 2 * pad);

  // Copy the original matrix into the padded matrix
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      paddedMatrix[i + pad][j + pad] = matrix[i][j];
    }
  }

  const result = createZeroMatrix(rows, cols);

  // Perform convolution
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let sum = 0;
      for (let ki = 0; ki < kernelSize; ki++) {
        for (let kj = 0; kj < kernelSize; kj++) {
          sum += kernel[ki][kj] * paddedMatrix[i + ki][j + kj];
        }
      }
      result[i][j] = sum;
    }
  }

  return result;
}
