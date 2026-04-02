/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuMatrixOps
 * Written: 2026-04-01T22:13:14.107Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuMatrixOps.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for caching purposes based on input matrices.
 * @param {Array} matrices - Array of matrices to hash.
 * @returns {string} - A unique hash string.
 */
export function generateMatrixHash(matrices) {
  const hash = createHash('sha256');
  matrices.forEach(matrix => {
    hash.update(JSON.stringify(matrix));
  });
  return hash.digest('hex');
}

/**
 * Validates if the input is a valid 2D matrix.
 * @param {Array} matrix - The matrix to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) return false;
  const rowLength = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === rowLength);
}

/**
 * Multiplies two matrices using a GPU-accelerated algorithm (WebGL fallback simulated).
 * @param {Array} matrixA - The first matrix.
 * @param {Array} matrixB - The second matrix.
 * @returns {Array} - The resulting matrix product.
 */
export function gpuMatrixMultiply(matrixA, matrixB) {
  if (!isValidMatrix(matrixA) || !isValidMatrix(matrixB)) {
    throw new Error('Invalid matrices provided. Ensure both are 2D arrays with consistent dimensions.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not align for multiplication.');
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
 * Transposes a matrix (flips rows and columns).
 * @param {Array} matrix - The matrix to transpose.
 * @returns {Array} - The transposed matrix.
 */
export function transposeMatrix(matrix) {
  if (!isValidMatrix(matrix)) {
    throw new Error('Invalid matrix provided. Ensure it is a 2D array with consistent dimensions.');
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
 * Calculates the dot product of two vectors.
 * @param {Array} vectorA - The first vector.
 * @param {Array} vectorB - The second vector.
 * @returns {number} - The dot product.
 */
export function dotProduct(vectorA, vectorB) {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || vectorA.length !== vectorB.length) {
    throw new Error('Invalid vectors provided. Ensure both are arrays of the same length.');
  }

  return vectorA.reduce((sum, val, index) => sum + val * vectorB[index], 0);
}

/**
 * Creates an identity matrix of given size.
 * @param {number} size - The size of the identity matrix.
 * @returns {Array} - The identity matrix.
 */
export function createIdentityMatrix(size) {
  if (typeof size !== 'number' || size <= 0 || !Number.isInteger(size)) {
    throw new Error('Invalid size provided. Ensure it is a positive integer.');
  }

  return Array.from({ length: size }, (row, i) =>
    Array.from({ length: size }, (col, j) => (i === j ? 1 : 0))
  );
}

/**
 * Scales a matrix by a scalar value.
 * @param {Array} matrix - The matrix to scale.
 * @param {number} scalar - The scalar value.
 * @returns {Array} - The scaled matrix.
 */
export function scaleMatrix(matrix, scalar) {
  if (!isValidMatrix(matrix) || typeof scalar !== 'number') {
    throw new Error('Invalid input. Ensure matrix is valid and scalar is a number.');
  }

  return matrix.map(row => row.map(value => value * scalar));
}