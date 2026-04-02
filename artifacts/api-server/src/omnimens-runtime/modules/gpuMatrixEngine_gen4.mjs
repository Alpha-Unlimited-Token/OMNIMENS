/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuMatrixEngine
 * Written: 2026-04-02T15:03:56.444Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuMatrixEngine.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique identifier for a given matrix to optimize caching.
 * @param {Array<Array<number>>} matrix - The input matrix.
 * @returns {string} - A unique hash for the matrix.
 */
export function generateMatrixHash(matrix) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(matrix));
  return hash.digest('hex');
}

/**
 * Validates if the input is a 2D matrix and ensures all rows have the same length.
 * @param {Array<Array<number>>} matrix - The input matrix.
 * @returns {boolean} - True if valid, otherwise false.
 */
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) return false;
  const rowLength = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === rowLength);
}

/**
 * Multiplies two matrices using a parallelizable algorithm.
 * @param {Array<Array<number>>} matrixA - The first matrix.
 * @param {Array<Array<number>>} matrixB - The second matrix.
 * @returns {Array<Array<number>>} - The resulting matrix product.
 * @throws {Error} - If matrices are invalid or incompatible for multiplication.
 */
export function multiplyMatrices(matrixA, matrixB) {
  if (!validateMatrix(matrixA) || !validateMatrix(matrixB)) {
    throw new Error('Invalid matrices: Ensure both inputs are 2D arrays with consistent row lengths.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions mismatch: Columns of A must match rows of B.');
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
 * Decomposes a matrix into its transpose.
 * @param {Array<Array<number>>} matrix - The input matrix.
 * @returns {Array<Array<number>>} - The transposed matrix.
 * @throws {Error} - If the input is not a valid matrix.
 */
export function transposeMatrix(matrix) {
  if (!validateMatrix(matrix)) {
    throw new Error('Invalid matrix: Ensure input is a 2D array with consistent row lengths.');
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

/**
 * Utility function to create an identity matrix of a given size.
 * @param {number} size - The size of the identity matrix.
 * @returns {Array<Array<number>>} - The identity matrix.
 * @throws {Error} - If size is not a positive integer.
 */
export function createIdentityMatrix(size) {
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error('Invalid size: Size must be a positive integer.');
  }

  const identity = Array.from({ length: size }, (_, i) => {
    return Array.from({ length: size }, (_, j) => (i === j ? 1 : 0));
  });

  return identity;
}

/**
 * Computes the Frobenius norm of a matrix.
 * @param {Array<Array<number>>} matrix - The input matrix.
 * @returns {number} - The Frobenius norm.
 * @throws {Error} - If the input is not a valid matrix.
 */
export function computeFrobeniusNorm(matrix) {
  if (!validateMatrix(matrix)) {
    throw new Error('Invalid matrix: Ensure input is a 2D array with consistent row lengths.');
  }

  return Math.sqrt(matrix.flat().reduce((sum, value) => sum + value ** 2, 0));
}
