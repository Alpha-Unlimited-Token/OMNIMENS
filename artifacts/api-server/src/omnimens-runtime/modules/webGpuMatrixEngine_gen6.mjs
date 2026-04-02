/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-02T21:00:06.624Z
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

import { randomUUID } from 'crypto';

/**
 * Generates a 2D matrix of given dimensions filled with random numbers.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @param {number} [min=0] - Minimum value for random numbers.
 * @param {number} [max=1] - Maximum value for random numbers.
 * @returns {number[][]} - Generated matrix.
 */
export function generateRandomMatrix(rows, cols, min = 0, max = 1) {
  if (rows <= 0 || cols <= 0) throw new Error('Matrix dimensions must be positive integers.');
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() * (max - min) + min)
  );
}

/**
 * Performs matrix multiplication using pure JavaScript.
 * @param {number[][]} A - First matrix.
 * @param {number[][]} B - Second matrix.
 * @returns {number[][]} - Resultant matrix after multiplication.
 */
export function multiplyMatrices(A, B) {
  if (A[0].length !== B.length) throw new Error('Incompatible matrix dimensions for multiplication.');
  const result = Array.from({ length: A.length }, () => Array(B[0].length).fill(0));
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
 * Computes the eigenvalues of a 2x2 matrix using a closed-form solution.
 * @param {number[][]} matrix - A 2x2 matrix.
 * @returns {number[]} - Array of eigenvalues.
 */
export function computeEigenvalues(matrix) {
  if (matrix.length !== 2 || matrix[0].length !== 2) throw new Error('Only 2x2 matrices are supported.');
  const [a, b] = matrix[0];
  const [c, d] = matrix[1];
  const trace = a + d;
  const determinant = a * d - b * c;
  const discriminant = Math.sqrt(trace * trace - 4 * determinant);
  return [(trace + discriminant) / 2, (trace - discriminant) / 2];
}

/**
 * Simulates a single step of a Hopfield network update.
 * @param {number[][]} weights - Weight matrix of the Hopfield network.
 * @param {number[]} state - Current state vector.
 * @returns {number[]} - Updated state vector.
 */
export function hopfieldStep(weights, state) {
  if (weights.length !== state.length || weights.some(row => row.length !== state.length)) {
    throw new Error('Weight matrix must be square and match the size of the state vector.');
  }
  return state.map((_, i) => {
    const sum = weights[i].reduce((acc, w, j) => acc + w * state[j], 0);
    return sum >= 0 ? 1 : -1;
  });
}

/**
 * Generates a unique identifier for matrix operations (useful for tracking).
 * @returns {string} - A unique identifier.
 */
export function generateOperationID() {
  return randomUUID();
}

/**
 * Validates if a given 2D array is a matrix.
 * @param {any} matrix - The input to validate.
 * @returns {boolean} - True if the input is a valid matrix, false otherwise.
 */
export function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) return false;
  const rowLength = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === rowLength);
}

/**
 * Transposes a given matrix.
 * @param {number[][]} matrix - The matrix to transpose.
 * @returns {number[][]} - Transposed matrix.
 */
export function transposeMatrix(matrix) {
  if (!isValidMatrix(matrix)) throw new Error('Invalid matrix provided.');
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}