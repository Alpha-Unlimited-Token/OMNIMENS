/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-02T13:29:53.213Z
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

import { createKernel } from 'gpu.js';

/**
 * Multiplies two matrices using GPU acceleration.
 * @param {number[][]} matrixA - The first matrix (m x n).
 * @param {number[][]} matrixB - The second matrix (n x p).
 * @returns {number[][]} The resulting matrix (m x p).
 */
export function gpuMatrixMultiply(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new TypeError('Both Array.from(/* args */{}) must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0]?.length || 0;
  const rowsB = matrixB.length;
  const colsB = matrixB[0]?.length || 0;

  if (colsA !== rowsB) {
    throw new Error('Number of columns in matrixA must equal number of rows in matrixB.');
  }

  const gpu = new createKernel(function (a, b, colsA, colsB) {
    let sum = 0;
    for (let k = 0; k < colsA; k++) {
      sum += a[this.thread.y][k] * b[k][this.thread.x];
    }
    return sum;
  })
    .setOutput([colsB, rowsA])
    .setPipeline(true);

  const result = gpu(matrixA, matrixB, colsA, colsB);
  return Array.from(result).map(row => Array.from(row));
}

/**
 * Performs LU decomposition on a matrix using GPU acceleration.
 * Decomposes matrix A into L (lower triangular) and U (upper triangular).
 * @param {number[][]} matrix - The input square matrix (n x n).
 * @returns {{ L, U}} The decomposed matrices L and U.
 */
export function gpuLUDecomposition(matrix) {
  if (!Array.isArray(matrix)) {
    throw new TypeError('Input must be a 2D array.');
  }

  const n = matrix.length;
  if (!matrix.every(row => row.length === n)) {
    throw new Error('Input must be a square matrix.');
  }

  const L = Array.from({ length: n }, () => Array(n).fill(0));
  const U = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < i; k++) {
        sum += L[i][k] * U[k][j];
      }
      U[i][j] = matrix[i][j] - sum;
    }

    for (let j = i; j < n; j++) {
      if (i === j) {
        L[i][i] = 1;
      } else {
        let sum = 0;
        for (let k = 0; k < i; k++) {
          sum += L[j][k] * U[k][i];
        }
        L[j][i] = (matrix[j][i] - sum) / U[i][i];
      }
    }
  }

  return { L, U };
}

/**
 * Validates if a matrix is a valid 2D array.
 * @param {any} matrix - The input to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
export function isValidMatrix(matrix) {
  return (
    Array.isArray(matrix) &&
    matrix.every(row => Array.isArray(row) && row.every(Number.isFinite))
  );
}

/**
 * Generates an identity matrix of size n x n.
 * @param {number} n - The size of the identity matrix.
 * @returns {number[][]} The identity matrix.
 */
export function generateIdentityMatrix(n) {
  if (!Number.isInteger(n) || n <= 0) {
    throw new TypeError('Input must be a positive integer.');
  }

  const identity = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );

  return identity;
}
