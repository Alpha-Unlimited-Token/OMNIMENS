/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixEngine
 * Written: 2026-04-02T15:18:37.584Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuAcceleratedMatrixEngine.mjs

import { performance } from 'perf_hooks';

/**
 * Initializes a 2D matrix with given dimensions and fills it with a value.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @param {number} fillValue - Value to fill the matrix with.
 * @returns {Array<Array<number>>} A 2D matrix filled with the specified value.
 */
export function createMatrix(rows, cols, fillValue = 0) {
  return Array.from({ length: rows }, () => Array(cols).fill(fillValue));
}

/**
 * Performs batched matrix multiplication on the CPU (fallback if GPU unavailable).
 * @param {Array<Array<number>>} A - First matrix.
 * @param {Array<Array<number>>} B - Second matrix.
 * @returns {Array<Array<number>>} Result of A * B.
 */
export function multiplyMatrices(A, B) {
  if (A[0].length !== B.length) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const result = createMatrix(A.length, B[0].length);

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
 * Optimized sparse matrix multiplication for large sparse tensors.
 * @param {Object} sparseA - Sparse representation of matrix A { rows, cols, values }.
 * @param {Object} sparseB - Sparse representation of matrix B { rows, cols, values }.
 * @returns {Object} Sparse representation of the result matrix.
 */
export function sparseMatrixMultiply(sparseA, sparseB) {
  if (sparseA.cols !== sparseB.rows) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const result = { rows: sparseA.rows, cols: sparseB.cols, values: {} };

  for (const [keyA, valueA] of Object.entries(sparseA.values)) {
    const [rowA, colA] = keyA.split(',').map(Number);

    for (let colB = 0; colB < sparseB.cols; colB++) {
      const keyB = `${colA},${colB}`;
      if (sparseB.values[keyB] !== undefined) {
        const resultKey = `${rowA},${colB}`;
        result.values[resultKey] = (result.values[resultKey] || 0) + valueA * sparseB.values[keyB];
      }
    }
  }

  return result;
}

/**
 * Simulates GPU-accelerated batched matrix multiplication.
 * @param {Array<Array<number>>} matrices - Array of matrices to multiply in sequence.
 * @returns {Array<Array<number>>} Final result after sequential multiplication.
 */
export function gpuSimulatedBatchMultiply(matrices) {
  if (matrices.length < 2) {
    throw new Error('At least two matrices are required for batch multiplication.');
  }

  let result = matrices[0];

  for (let i = 1; i < matrices.length; i++) {
    result = multiplyMatrices(result, matrices[i]);
  }

  return result;
}

/**
 * Measures the execution time of a matrix operation.
 * @param {Function} operation - The matrix operation to measure.
 * @param {...any} args - Arguments to pass to the operation.
 * @returns {Object} Execution time and result of the operation.
 */
export function measureExecutionTime(operation, ...args) {
  const start = performance.now();
  const result = operation(...args);
  const end = performance.now();

  return {
    executionTimeMs: end - start,
    result
  };
}

/**
 * Converts a dense matrix to a sparse representation.
 * @param {Array<Array<number>>} matrix - Dense matrix.
 * @returns {Object} Sparse representation of the matrix.
 */
export function denseToSparse(matrix) {
  const sparse = { rows: matrix.length, cols: matrix[0].length, values: {} };

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] !== 0) {
        sparse.values[`${i},${j}`] = matrix[i][j];
      }
    }
  }

  return sparse;
}

/**
 * Converts a sparse matrix to a dense representation.
 * @param {Object} sparse - Sparse representation of a matrix.
 * @returns {Array<Array<number>>} Dense matrix.
 */
export function sparseToDense(sparse) {
  const dense = createMatrix(sparse.rows, sparse.cols);

  for (const [key, value] of Object.entries(sparse.values)) {
    const [row, col] = key.split(',').map(Number);
    dense[row][col] = value;
  }

  return dense;
}