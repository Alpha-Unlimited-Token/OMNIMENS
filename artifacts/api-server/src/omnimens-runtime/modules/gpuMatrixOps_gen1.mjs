/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuMatrixOps
 * Written: 2026-04-03T16:10:18.764Z
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
 * Generates a unique identifier for a matrix operation to enable caching or debugging.
 * @param {string} operation - The name of the operation (e.g., 'multiply', 'transpose').
 * @param {Array} dimensions - The dimensions of the matrices involved.
 * @returns {string} - A unique hash identifier.
 */
export function generateOperationId(operation, dimensions) {
  const hash = createHash('sha256');
  hash.update(operation + JSON.stringify(dimensions));
  return hash.digest('hex');
}

/**
 * Validates a matrix to ensure it is a 2D array of numbers.
 * @param {Array} matrix - The matrix to validate.
 * @returns {boolean} - True if the matrix is valid, otherwise false.
 */
export function isValidMatrix(matrix) {
  return (
    Array.isArray(matrix) &&
    matrix.every(
      (row) => Array.isArray(row) && row.every((value) => typeof value === 'number')
    )
  );
}

/**
 * Performs matrix multiplication using a pure algorithm.
 * @param {Array} matrixA - The first matrix (m x n).
 * @param {Array} matrixB - The second matrix (n x p).
 * @returns {Array} - The resulting matrix (m x p).
 * @throws {Error} - If the matrices cannot be multiplied.
 */
export function multiplyMatrices(matrixA, matrixB) {
  if (!isValidMatrix(matrixA) || !isValidMatrix(matrixB)) {
    throw new Error('Invalid matrices: Both inputs must be 2D arrays of numbers.');
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
 * @throws {Error} - If the input is not a valid matrix.
 */
export function transposeMatrix(matrix) {
  if (!isValidMatrix(matrix)) {
    throw new Error('Invalid matrix: Input must be a 2D array of numbers.');
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
 * Generates an identity matrix of a given size.
 * @param {number} size - The size of the identity matrix (n x n).
 * @returns {Array} - The identity matrix.
 * @throws {Error} - If the size is not a positive integer.
 */
export function generateIdentityMatrix(size) {
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error('Invalid size: Size must be a positive integer.');
  }

  const identity = Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
  );

  return identity;
}

/**
 * Computes the element-wise addition of two matrices.
 * @param {Array} matrixA - The first matrix.
 * @param {Array} matrixB - The second matrix.
 * @returns {Array} - The resulting matrix after addition.
 * @throws {Error} - If the matrices do not have the same dimensions.
 */
export function addMatrices(matrixA, matrixB) {
  if (!isValidMatrix(matrixA) || !isValidMatrix(matrixB)) {
    throw new Error('Invalid matrices: Both inputs must be 2D arrays of numbers.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Matrix dimensions do not match for addition.');
  }

  const result = Array.from({ length: rowsA }, (_, i) =>
    Array.from({ length: colsA }, (_, j) => matrixA[i][j] + matrixB[i][j])
  );

  return result;
}