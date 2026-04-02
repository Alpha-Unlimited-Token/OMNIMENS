/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuTensorEngine
 * Written: 2026-04-02T14:10:49.506Z
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
 * Utility function to create a 2D tensor (matrix) with specified dimensions and fill value.
 * @param {number} rows - Number of rows in the tensor.
 * @param {number} cols - Number of columns in the tensor.
 * @param {number} fillValue - Initial value to fill the tensor.
 * @returns {Array<Array<number>>} - A 2D array representing the tensor.
 */
export function createTensor(rows, cols, fillValue = 0) {
  return Array.from({ length: rows }, () => Array(cols).fill(fillValue));
}

/**
 * Utility function to perform matrix multiplication on two 2D tensors.
 * @param {Array<Array<number>>} A - First tensor (matrix).
 * @param {Array<Array<number>>} B - Second tensor (matrix).
 * @returns {Array<Array<number>>} - Resultant tensor after multiplication.
 * @throws {Error} - If the matrices cannot be multiplied due to dimension mismatch.
 */
export function multiplyTensors(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const result = createTensor(rowsA, colsB);

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
 * Optimized batch tensor multiplication for multiple tensor pairs.
 * @param {Array<{A>, B>}>} tensorPairs - Array of tensor pairs to multiply.
 * @returns {Array<Array<Array<number>>>} - Array of resultant tensors after multiplication.
 */
export function batchMultiplyTensors(tensorPairs) {
  return tensorPairs.map(({ A, B }) => multiplyTensors(A, B));
}

/**
 * Measures the execution time of a tensor operation for performance analysis.
 * @param {Function} operation - The tensor operation to measure.
 * @param {...any} args - Arguments to pass to the operation.
 * @returns {{ result, timeMs}} - Result of the operation and execution time in milliseconds.
 */
export function measureExecutionTime(operation, ...args) {
  const start = performance.now();
  const result = operation(...args);
  const end = performance.now();

  return { result, timeMs: end - start };
}

/**
 * Transposes a 2D tensor (matrix).
 * @param {Array<Array<number>>} tensor - The tensor to transpose.
 * @returns {Array<Array<number>>} - Transposed tensor.
 */
export function transposeTensor(tensor) {
  const rows = tensor.length;
  const cols = tensor[0].length;
  const transposed = createTensor(cols, rows);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposed[j][i] = tensor[i][j];
    }
  }

  return transposed;
}

/**
 * Performs element-wise addition of two tensors.
 * @param {Array<Array<number>>} A - First tensor.
 * @param {Array<Array<number>>} B - Second tensor.
 * @returns {Array<Array<number>>} - Resultant tensor after addition.
 * @throws {Error} - If the dimensions of the tensors do not match.
 */
export function addTensors(A, B) {
  const rows = A.length;
  const cols = A[0].length;

  if (rows !== B.length || cols !== B[0].length) {
    throw new Error('Tensor dimensions do not match for addition.');
  }

  const result = createTensor(rows, cols);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i][j] = A[i][j] + B[i][j];
    }
  }

  return result;
}

/**
 * Performs element-wise scaling of a tensor by a scalar value.
 * @param {Array<Array<number>>} tensor - The tensor to scale.
 * @param {number} scalar - The scalar value to multiply each element by.
 * @returns {Array<Array<number>>} - Scaled tensor.
 */
export function scaleTensor(tensor, scalar) {
  const rows = tensor.length;
  const cols = tensor[0].length;
  const result = createTensor(rows, cols);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i][j] = tensor[i][j] * scalar;
    }
  }

  return result;
}