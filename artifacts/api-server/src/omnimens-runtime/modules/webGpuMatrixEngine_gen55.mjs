/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-02T14:14:28.235Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGpuMatrixEngine.mjs

import { performance } from 'node:perf_hooks';

/**
 * Utility function to create a 2D matrix filled with zeros.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Array<Array<number>>} - A 2D array filled with zeros.
 */
export function createZeroMatrix(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

/**
 * Performs matrix multiplication using a pure algorithmic approach.
 * @param {Array<Array<number>>} A - First matrix.
 * @param {Array<Array<number>>} B - Second matrix.
 * @returns {Array<Array<number>>} - Resultant matrix after multiplication.
 */
export function multiplyMatrices(A, B) {
  if (A[0].length !== B.length) {
    throw new Error('Matrix dimensions do not align for multiplication.');
  }

  const result = createZeroMatrix(A.length, B[0].length);

  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B[0].length; j++) {
      for (let k = 0; k < B.length; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return result;
}

/**
 * Calculates eigenvalues of a 2x2 matrix using the characteristic polynomial.
 * @param {Array<Array<number>>} matrix - A 2x2 matrix.
 * @returns {Array<number>} - Array containing the eigenvalues.
 */
export function calculateEigenvalues(matrix) {
  if (matrix.length !== 2 || matrix[0].length !== 2) {
    throw new Error('Eigenvalue calculation is only supported for 2x2 matrices.');
  }

  const [a, b] = matrix[0];
  const [c, d] = matrix[1];

  const trace = a + d;
  const determinant = a * d - b * c;
  const discriminant = Math.sqrt(trace * trace - 4 * determinant);

  const eigenvalue1 = (trace + discriminant) / 2;
  const eigenvalue2 = (trace - discriminant) / 2;

  return [eigenvalue1, eigenvalue2];
}

/**
 * Updates a Hopfield network pattern using synchronous updates.
 * @param {Array<number>} pattern - Initial pattern vector.
 * @param {Array<Array<number>>} weightMatrix - Weight matrix of the Hopfield network.
 * @returns {Array<number>} - Updated pattern vector.
 */
export function updateHopfieldPattern(pattern, weightMatrix) {
  if (pattern.length !== weightMatrix.length || weightMatrix.length !== weightMatrix[0].length) {
    throw new Error('Pattern and weight matrix dimensions must align.');
  }

  const updatedPattern = Array(pattern.length).fill(0);

  for (let i = 0; i < weightMatrix.length; i++) {
    let sum = 0;
    for (let j = 0; j < weightMatrix[i].length; j++) {
      sum += weightMatrix[i][j] * pattern[j];
    }
    updatedPattern[i] = sum >= 0 ? 1 : -1;
  }

  return updatedPattern;
}

/**
 * Measures the execution time of a given function.
 * @param {Function} func - The function to measure.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {Object} - Execution time in milliseconds and result of the function.
 */
export function measureExecutionTime(func, ...args) {
  const start = performance.now();
  const result = func(...args);
  const end = performance.now();

  return {
    executionTimeMs: end - start,
    result
  };
}

/**
 * Validates a matrix to ensure it is a 2D array of numbers.
 * @param {Array<Array<number>>} matrix - Matrix to validate.
 * @throws {Error} - If the matrix is invalid.
 */
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
    throw new Error('Input must be a 2D array.');
  }

  for (const row of matrix) {
    if (!Array.isArray(row) || !row.every(Number.isFinite)) {
      throw new Error('Matrix must contain only numbers.');
    }
  }
}
