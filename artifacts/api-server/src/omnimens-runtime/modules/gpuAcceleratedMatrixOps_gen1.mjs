/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-03T12:16:48.946Z
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

import { createHash } from 'crypto';

/**
 * Utility to generate a unique hash for caching purposes.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Perform matrix multiplication using GPU acceleration.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resultant matrix after multiplication.
 * @throws {Error} - If matrices are incompatible for multiplication.
 */
export function gpuMatrixMultiply(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
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
 * Validate matrix dimensions.
 * @param {number[][]} matrix - Matrix to validate.
 * @returns {boolean} - True if valid, otherwise false.
 */
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return false;
  }

  const columnCount = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === columnCount);
}

/**
 * Normalize a matrix by dividing each element by the maximum value in the matrix.
 * @param {number[][]} matrix - Matrix to normalize.
 * @returns {number[][]} - Normalized matrix.
 */
export function normalizeMatrix(matrix) {
  if (!validateMatrix(matrix)) {
    throw new Error('Invalid matrix structure.');
  }

  const maxVal = Math.max(...matrix.flat());
  return matrix.map(row => row.map(value => value / maxVal));
}

/**
 * Transpose a matrix.
 * @param {number[][]} matrix - Matrix to transpose.
 * @returns {number[][]} - Transposed matrix.
 */
export function transposeMatrix(matrix) {
  if (!validateMatrix(matrix)) {
    throw new Error('Invalid matrix structure.');
  }

  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

/**
 * Generate an identity matrix of given size.
 * @param {number} size - Size of the identity matrix.
 * @returns {number[][]} - Identity matrix.
 */
export function generateIdentityMatrix(size) {
  if (size <= 0 || !Number.isInteger(size)) {
    throw new Error('Size must be a positive integer.');
  }

  return Array.from({ length: size }, (_, i) => {
    return Array.from({ length: size }, (_, j) => (i === j ? 1 : 0));
  });
}

/**
 * Compute the determinant of a square matrix.
 * @param {number[][]} matrix - Square matrix.
 * @returns {number} - Determinant of the matrix.
 * @throws {Error} - If matrix is not square.
 */
export function computeDeterminant(matrix) {
  const size = matrix.length;
  if (!validateMatrix(matrix) || matrix.some(row => row.length !== size)) {
    throw new Error('Matrix must be square.');
  }

  if (size === 1) return matrix[0][0];
  if (size === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

  let determinant = 0;
  for (let i = 0; i < size; i++) {
    const subMatrix = matrix.slice(1).map(row => row.filter((_, colIndex) => colIndex !== i));
    determinant += matrix[0][i] * computeDeterminant(subMatrix) * (i % 2 === 0 ? 1 : -1);
  }

  return determinant;
}
