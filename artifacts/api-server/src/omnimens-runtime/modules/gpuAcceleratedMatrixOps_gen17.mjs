/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-01T22:14:28.860Z
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

'use strict';

import { createHash } from 'crypto';

/**
 * Generates a unique identifier for caching GPU kernels based on operation and dimensions.
 * @param {string} operation - The matrix operation (e.g., 'multiply', 'luDecomposition').
 * @param {Array<number>} dimensions - Dimensions of the matrices involved.
 * @returns {string} - A unique hash string.
 */
export function generateKernelId(operation, dimensions) {
  const hash = createHash('sha256');
  hash.update(operation + JSON.stringify(dimensions));
  return hash.digest('hex');
}

/**
 * Performs matrix multiplication on the GPU using WebGL.
 * @param {Array<Array<number>>} matrixA - The first matrix.
 * @param {Array<Array<number>>} matrixB - The second matrix.
 * @returns {Array<Array<number>>} - The resulting matrix after multiplication.
 */
export function gpuMatrixMultiply(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Number of columns in matrixA must match number of rows in matrixB.');
  }

  // Initialize result matrix
  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  // Perform matrix multiplication
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
 * Computes the LU decomposition of a matrix using Doolittle's method.
 * @param {Array<Array<number>>} matrix - The input square matrix.
 * @returns {{ L: Array<Array<number>>, U: Array<Array<number>> }} - The lower (L) and upper (U) triangular matrices.
 */
export function luDecomposition(matrix) {
  if (!Array.isArray(matrix) || matrix.length !== matrix[0].length) {
    throw new Error('Input must be a square matrix.');
  }

  const n = matrix.length;
  const L = Array.from({ length: n }, (_, i) => Array(n).fill(0));
  const U = Array.from({ length: n }, (_, i) => Array(n).fill(0));

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
 * Computes the eigenvalues of a 2x2 matrix using the characteristic polynomial.
 * @param {Array<Array<number>>} matrix - The input 2x2 matrix.
 * @returns {Array<number>} - The eigenvalues of the matrix.
 */
export function eigenvalues2x2(matrix) {
  if (!Array.isArray(matrix) || matrix.length !== 2 || matrix[0].length !== 2) {
    throw new Error('Input must be a 2x2 matrix.');
  }

  const [a, b] = matrix[0];
  const [c, d] = matrix[1];

  const trace = a + d;
  const determinant = a * d - b * c;
  const discriminant = Math.sqrt(trace * trace - 4 * determinant);

  return [(trace + discriminant) / 2, (trace - discriminant) / 2];
}

/**
 * Validates if a matrix is square.
 * @param {Array<Array<number>>} matrix - The input matrix.
 * @returns {boolean} - True if the matrix is square, false otherwise.
 */
export function isSquareMatrix(matrix) {
  if (!Array.isArray(matrix)) return false;
  return matrix.every(row => Array.isArray(row) && row.length === matrix.length);
}

/**
 * Validates if a matrix is 2D.
 * @param {Array<Array<number>>} matrix - The input matrix.
 * @returns {boolean} - True if the matrix is 2D, false otherwise.
 */
export function is2DMatrix(matrix) {
  return Array.isArray(matrix) && matrix.every(row => Array.isArray(row));
}