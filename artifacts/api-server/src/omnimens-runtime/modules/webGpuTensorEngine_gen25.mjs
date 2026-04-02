/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuTensorEngine
 * Written: 2026-04-02T15:14:57.031Z
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
 * Utility function to create a 2D tensor (matrix) with specified dimensions and initial value.
 * @param {number} rows - Number of rows in the tensor.
 * @param {number} cols - Number of columns in the tensor.
 * @param {number} initialValue - Initial value for all elements.
 * @returns {number[][]} - 2D tensor.
 */
export function createTensor(rows, cols, initialValue = 0) {
  return Array.from({ length: rows }, () => Array(cols).fill(initialValue));
}

/**
 * Perform matrix multiplication using a naive algorithm.
 * @param {number[][]} A - First matrix.
 * @param {number[][]} B - Second matrix.
 * @returns {number[][]} - Resulting matrix after multiplication.
 */
export function matrixMultiply(A, B) {
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
 * Perform element-wise addition of two tensors.
 * @param {number[][]} A - First tensor.
 * @param {number[][]} B - Second tensor.
 * @returns {number[][]} - Resulting tensor after addition.
 */
export function tensorAdd(A, B) {
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
 * Perform batched matrix multiplication for a list of matrix pairs.
 * @param {Array<[number[][], number[][]]>} batch - Array of matrix pairs to multiply.
 * @returns {number[][][]} - Array of resulting matrices after multiplication.
 */
export function batchedMatrixMultiply(batch) {
  return batch.map(([A, B]) => matrixMultiply(A, B));
}

/**
 * Measure the execution time of a tensor operation.
 * @param {Function} operation - The tensor operation to measure.
 * @param {...any} args - Arguments to pass to the operation.
 * @returns {{ result, time}} - Result of the operation and execution time in milliseconds.
 */
export function measureExecutionTime(operation, ...args) {
  const start = performance.now();
  const result = operation(...args);
  const end = performance.now();
  return { result, time: end - start };
}

/**
 * Generate a random tensor with specified dimensions and value range.
 * @param {number} rows - Number of rows in the tensor.
 * @param {number} cols - Number of columns in the tensor.
 * @param {number} min - Minimum value for random elements.
 * @param {number} max - Maximum value for random elements.
 * @returns {number[][]} - Randomly generated tensor.
 */
export function randomTensor(rows, cols, min = 0, max = 1) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() * (max - min) + min)
  );
}

/**
 * Apply an activation function element-wise to a tensor.
 * @param {number[][]} tensor - Input tensor.
 * @param {Function} activationFunction - Activation function to apply.
 * @returns {number[][]} - Tensor after applying the activation function.
 */
export function applyActivation(tensor, activationFunction) {
  return tensor.map(row => row.map(value => activationFunction(value)));
}

/**
 * Example activation functions.
 */
export const activationFunctions = {
  relu: x => Math.max(0, x),
  sigmoid: x => 1 / (1 + Math.exp(-x)),
  tanh: x => Math.tanh(x)
};