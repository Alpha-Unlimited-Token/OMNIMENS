/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixAccelerator
 * Written: 2026-04-02T15:18:12.428Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGpuMatrixAccelerator.mjs

import { GPU } from 'gpu.js';

const gpu = new GPU();

/**
 * Performs GPU-accelerated matrix multiplication.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} Resultant matrix after multiplication.
 */
export function gpuMatrixMultiply(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new TypeError('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not allow multiplication.');
  }

  const kernel = gpu.createKernel(function (a, b) {
    let sum = 0;
    for (let i = 0; i < this.constants.sharedDim; i++) {
      sum += a[this.thread.y][i] * b[i][this.thread.x];
    }
    return sum;
  }, {
    output: [colsB, rowsA],
    constants: { sharedDim: colsA }
  });

  return kernel(matrixA, matrixB);
}

/**
 * Performs LU decomposition using Doolittle's method.
 * @param {number[][]} matrix - Input square matrix.
 * @returns {{ L, U}} L and U matrices.
 */
export function gpuLUDecomposition(matrix) {
  if (!Array.isArray(matrix) || matrix.length !== matrix[0].length) {
    throw new TypeError('Input must be a square matrix.');
  }

  const n = matrix.length;
  const L = Array.from({ length: n }, () => Array(n).fill(0));
  const U = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let k = i; k < n; k++) {
      let sum = 0;
      for (let j = 0; j < i; j++) {
        sum += L[i][j] * U[j][k];
      }
      U[i][k] = matrix[i][k] - sum;
    }

    for (let k = i; k < n; k++) {
      if (i === k) {
        L[i][i] = 1;
      } else {
        let sum = 0;
        for (let j = 0; j < i; j++) {
          sum += L[k][j] * U[j][i];
        }
        L[k][i] = (matrix[k][i] - sum) / U[i][i];
      }
    }
  }

  return { L, U };
}

/**
 * Updates Hopfield network memory using Hebbian learning.
 * @param {number[][]} patterns - Array of binary patterns.
 * @returns {number[][]} Weight matrix.
 */
export function gpuHopfieldUpdate(patterns) {
  if (!Array.isArray(patterns) || patterns.some(p => !Array.isArray(p))) {
    throw new TypeError('Input must be an array of binary patterns.');
  }

  const n = patterns[0].length;
  const weights = Array.from({ length: n }, () => Array(n).fill(0));

  for (const pattern of patterns) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          weights[i][j] += pattern[i] * pattern[j];
        }
      }
    }
  }

  return weights;
}

/**
 * Validates if a matrix is square.
 * @param {number[][]} matrix - Input matrix.
 * @returns {boolean} True if square, false otherwise.
 */
export function isSquareMatrix(matrix) {
  return Array.isArray(matrix) && matrix.length > 0 && matrix.every(row => row.length === matrix.length);
}

/**
 * Transposes a given matrix.
 * @param {number[][]} matrix - Input matrix.
 * @returns {number[][]} Transposed matrix.
 */
export function transposeMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new TypeError('Input must be a non-empty 2D array.');
  }

  const rows = matrix.length;
  const cols = matrix[0].length;
  const transposed = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposed[j][i] = matrix[i][j];
    }
  }

  return transposed;
}