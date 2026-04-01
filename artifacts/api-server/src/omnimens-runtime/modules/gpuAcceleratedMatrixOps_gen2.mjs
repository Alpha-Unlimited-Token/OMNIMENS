/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-01T22:08:36.825Z
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
 * Perform matrix multiplication using a naive algorithm.
 * This function is CPU-based but designed for compatibility with GPU acceleration in future iterations.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} - The resulting matrix after multiplication.
 */
export function matrixMultiply(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions do not match for multiplication.");
  }

  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

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
 * Perform element-wise convolution on a matrix using a kernel.
 * @param {number[][]} matrix - Input matrix.
 * @param {number[][]} kernel - Convolution kernel.
 * @returns {number[][]} - Convolved matrix.
 */
export function matrixConvolve(matrix, kernel) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const kernelRows = kernel.length;
  const kernelCols = kernel[0].length;

  const result = Array.from({ length: rows - kernelRows + 1 }, () => Array(cols - kernelCols + 1).fill(0));

  for (let i = 0; i <= rows - kernelRows; i++) {
    for (let j = 0; j <= cols - kernelCols; j++) {
      let sum = 0;
      for (let ki = 0; ki < kernelRows; ki++) {
        for (let kj = 0; kj < kernelCols; kj++) {
          sum += matrix[i + ki][j + kj] * kernel[ki][kj];
        }
      }
      result[i][j] = sum;
    }
  }

  return result;
}

/**
 * Simulate backpropagation by calculating gradients for a simple loss function.
 * @param {number[]} weights - Array of weights.
 * @param {number[]} inputs - Array of inputs.
 * @param {number} target - Target value.
 * @returns {number[]} - Gradients for each weight.
 */
export function backpropagate(weights, inputs, target) {
  if (weights.length !== inputs.length) {
    throw new Error("Weights and inputs must have the same length.");
  }

  const predicted = weights.reduce((sum, w, i) => sum + w * inputs[i], 0);
  const error = predicted - target;

  return weights.map((_, i) => 2 * error * inputs[i]);
}

/**
 * Measure the performance of a function execution.
 * @param {Function} func - The function to measure.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {{ result, duration}} - The result and execution time in milliseconds.
 */
export function measurePerformance(func, ...args) {
  const start = performance.now();
  const result = func(...args);
  const end = performance.now();

  return {
    result,
    duration: end - start
  };
}

/**
 * Normalize a matrix to have values between 0 and 1.
 * @param {number[][]} matrix - Input matrix.
 * @returns {number[][]} - Normalized matrix.
 */
export function normalizeMatrix(matrix) {
  const flat = matrix.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);

  return matrix.map(row => row.map(value => (value - min) / (max - min)));
}

/**
 * Utility function to generate a random matrix.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @param {number} [min=0] - Minimum value.
 * @param {number} [max=1] - Maximum value.
 * @returns {number[][]} - Randomly generated matrix.
 */
export function generateRandomMatrix(rows, cols, min = 0, max = 1) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() * (max - min) + min)
  );
}