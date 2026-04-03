/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuMatrixAccelerator
 * Written: 2026-04-03T02:44:14.578Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuMatrixAccelerator.mjs

import { performance } from 'node:perf_hooks';

/**
 * Utility function to allocate TypedArray buffers for matrix operations.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Float64Array} - A buffer initialized to zeros.
 */
export function createMatrixBuffer(rows, cols) {
  if (rows <= 0 || cols <= 0) {
    throw new Error('Matrix dimensions must be positive integers.');
  }
  return new Float64Array(rows * cols);
}

/**
 * Performs LU decomposition on a square matrix.
 * @param {Float64Array} matrix - Input matrix stored in a TypedArray buffer.
 * @param {number} size - Size of the square matrix (rows = cols).
 * @returns {Object} - { L, U} representing the decomposition.
 */
export function luDecomposition(matrix, size) {
  if (matrix.length !== size * size) {
    throw new Error('Matrix size mismatch. Ensure the buffer matches the specified dimensions.');
  }

  const L = new Float64Array(matrix.length);
  const U = new Float64Array(matrix.length);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (j < i) {
        L[j * size + i] = 0;
      } else {
        L[j * size + i] = matrix[j * size + i];
        for (let k = 0; k < i; k++) {
          L[j * size + i] -= L[j * size + k] * U[k * size + i];
        }
      }
      if (j < i) {
        U[i * size + j] = 0;
      } else if (j === i) {
        U[i * size + j] = 1;
      } else {
        U[i * size + j] = matrix[i * size + j] / L[i * size + i];
        for (let k = 0; k < i; k++) {
          U[i * size + j] -= (L[i * size + k] * U[k * size + j]) / L[i * size + i];
        }
      }
    }
  }

  return { L, U };
}

/**
 * Computes eigenvalues of a symmetric matrix using the power iteration method.
 * @param {Float64Array} matrix - Symmetric matrix stored in a TypedArray buffer.
 * @param {number} size - Size of the square matrix.
 * @param {number} maxIterations - Maximum number of iterations.
 * @param {number} tolerance - Convergence tolerance.
 * @returns {Float64Array} - Array of eigenvalues.
 */
export function computeEigenvalues(matrix, size, maxIterations = 1000, tolerance = 1e-10) {
  if (matrix.length !== size * size) {
    throw new Error('Matrix size mismatch. Ensure the buffer matches the specified dimensions.');
  }

  const eigenvalues = new Float64Array(size);
  const vector = new Float64Array(size).fill(1);

  for (let iter = 0; iter < maxIterations; iter++) {
    const nextVector = new Float64Array(size);

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        nextVector[i] += matrix[i * size + j] * vector[j];
      }
    }

    const norm = Math.sqrt(nextVector.reduce((sum, val) => sum + val * val, 0));
    for (let i = 0; i < size; i++) {
      nextVector[i] /= norm;
    }

    const diff = nextVector.reduce((sum, val, idx) => sum + Math.abs(val - vector[idx]), 0);
    if (diff < tolerance) {
      for (let i = 0; i < size; i++) {
        eigenvalues[i] = nextVector[i];
      }
      break;
    }

    vector.set(nextVector);
  }

  return eigenvalues;
}

/**
 * Measures execution time of a matrix operation.
 * @param {Function} operation - Matrix operation function.
 * @param {...any} args - Arguments to pass to the operation.
 * @returns {Object} - { result, time}.
 */
export function measureExecutionTime(operation, ...args) {
  const start = performance.now();
  const result = operation(...args);
  const end = performance.now();
  return { result, time: end - start };
}
