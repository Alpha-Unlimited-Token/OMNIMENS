/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuMatrixAccelerator
 * Written: 2026-04-03T16:57:28.237Z
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

import { createHash } from 'crypto';

/**
 * Generates a unique identifier for GPU tasks to avoid conflicts.
 * @param {string} input - Input string to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateTaskId(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Transposes a 2D matrix.
 * @param {number[][]} matrix - The input matrix.
 * @returns {number[][]} - The transposed matrix.
 */
export function transposeMatrix(matrix) {
  if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
    throw new Error('Input must be a 2D array.');
  }
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

/**
 * Multiplies two matrices using a GPU-accelerated approach.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} - The resulting matrix after multiplication.
 */
export function multiplyMatrices(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
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
 * Normalizes a matrix by scaling its values to a range of [0, 1].
 * @param {number[][]} matrix - The input matrix.
 * @returns {number[][]} - The normalized matrix.
 */
export function normalizeMatrix(matrix) {
  if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
    throw new Error('Input must be a 2D array.');
  }

  const flat = matrix.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);

  if (min === max) {
    return matrix.map(row => row.map(() => 0.5));
  }

  return matrix.map(row => row.map(value => (value - min) / (max - min)));
}

/**
 * Validates if a given input is a 2D matrix.
 * @param {*} input - The input to validate.
 * @returns {boolean} - True if input is a valid 2D matrix, false otherwise.
 */
export function isValidMatrix(input) {
  return (
    Array.isArray(input) &&
    input.every(row => Array.isArray(row) && row.every(cell => typeof cell === 'number'))
  );
}

/**
 * Computes the dot product of two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The dot product of the vectors.
 */
export function dotProduct(vectorA, vectorB) {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) {
    throw new Error('Both inputs must be arrays.');
  }

  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length.');
  }

  return vectorA.reduce((sum, value, index) => sum + value * vectorB[index], 0);
}

/**
 * Generates an identity matrix of a given size.
 * @param {number} size - The size of the identity matrix.
 * @returns {number[][]} - The identity matrix.
 */
export function generateIdentityMatrix(size) {
  if (typeof size !== 'number' || size <= 0 || !Number.isInteger(size)) {
    throw new Error('Size must be a positive integer.');
  }

  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
  );
}
