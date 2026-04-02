/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-01T21:59:50.433Z
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
import { randomUUID } from 'crypto';

/**
 * Generates a 2D matrix with specified dimensions, filled with random values.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Float32Array[]} - A 2D array representing the matrix.
 */
export function generateRandomMatrix(rows, cols) {
  if (rows <= 0 || cols <= 0) {
    throw new Error('Rows and columns must be positive integers.');
  }
  return Array.from({ length: rows }, () => new Float32Array(cols).map(() => Math.random()));
}

/**
 * Performs matrix multiplication on two 2D matrices.
 * @param {Float32Array[]} matA - The first matrix.
 * @param {Float32Array[]} matB - The second matrix.
 * @returns {Float32Array[]} - The resulting matrix after multiplication.
 */
export function multiplyMatrices(matA, matB) {
  const rowsA = matA.length;
  const colsA = matA[0].length;
  const rowsB = matB.length;
  const colsB = matB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not align for multiplication.');
  }

  const result = Array.from({ length: rowsA }, () => new Float32Array(colsB));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += matA[i][k] * matB[k][j];
      }
      result[i][j] = sum;
    }
  }

  return result;
}

/**
 * Normalizes a 2D matrix by scaling its values to a range of [0, 1].
 * @param {Float32Array[]} matrix - The input matrix.
 * @returns {Float32Array[]} - The normalized matrix.
 */
export function normalizeMatrix(matrix) {
  const flatMatrix = matrix.flat();
  const max = Math.max(...flatMatrix);
  const min = Math.min(...flatMatrix);

  if (max === min) {
    throw new Error('Cannot normalize a matrix with all identical values.');
  }

  return matrix.map(row => row.map(value => (value - min) / (max - min)));
}

/**
 * Generates a unique identifier for a computation session.
 * @returns {string} - A UUID string.
 */
export function generateSessionId() {
  return randomUUID();
}

/**
 * Transposes a 2D matrix (flips rows and columns).
 * @param {Float32Array[]} matrix - The input matrix.
 * @returns {Float32Array[]} - The transposed matrix.
 */
export function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  const transposed = Array.from({ length: cols }, () => new Float32Array(rows));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposed[j][i] = matrix[i][j];
    }
  }

  return transposed;
}

/**
 * Applies an activation function element-wise to a matrix.
 * @param {Float32Array[]} matrix - The input matrix.
 * @param {Function} activationFunction - The activation function to apply.
 * @returns {Float32Array[]} - The matrix after applying the activation function.
 */
export function applyActivationFunction(matrix, activationFunction) {
  if (typeof activationFunction !== 'function') {
    throw new Error('Activation function must be a valid function.');
  }

  return matrix.map(row => row.map(value => activationFunction(value)));
}

/**
 * Example activation function: ReLU (Rectified Linear Unit).
 * @param {number} x - Input value.
 * @returns {number} - Output value after applying ReLU.
 */
export function relu(x) {
  return Math.max(0, x);
}
