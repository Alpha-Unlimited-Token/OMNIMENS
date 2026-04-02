/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-02T13:40:37.142Z
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
 * Generates a unique identifier for GPU resources.
 * @returns {string} A unique identifier.
 */
export function generateResourceId() {
  return randomUUID();
}

/**
 * Creates a WebGPU-compatible matrix in row-major order.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @param {function} initializer - Function to initialize matrix values.
 * @returns {Float32Array} The initialized matrix.
 */
export function createMatrix(rows, cols, initializer = () => Math.random()) {
  const matrix = new Float32Array(rows * cols);
  for (let i = 0; i < rows * cols; i++) {
    matrix[i] = initializer();
  }
  return matrix;
}

/**
 * Transposes a matrix stored in row-major order.
 * @param {Float32Array} matrix - The input matrix.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Float32Array} The transposed matrix.
 */
export function transposeMatrix(matrix, rows, cols) {
  const transposed = new Float32Array(rows * cols);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      transposed[col * rows + row] = matrix[row * cols + col];
    }
  }
  return transposed;
}

/**
 * Multiplies two matrices using CPU as a fallback for environments without WebGPU.
 * @param {Float32Array} A - First matrix (rowsA x colsA).
 * @param {Float32Array} B - Second matrix (colsA x colsB).
 * @param {number} rowsA - Number of rows in A.
 * @param {number} colsA - Number of columns in A (and rows in B).
 * @param {number} colsB - Number of columns in B.
 * @returns {Float32Array} Resulting matrix (rowsA x colsB).
 */
export function multiplyMatrices(A, B, rowsA, colsA, colsB) {
  const result = new Float32Array(rowsA * colsB);
  for (let row = 0; row < rowsA; row++) {
    for (let col = 0; col < colsB; col++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[row * colsA + k] * B[k * colsB + col];
      }
      result[row * colsB + col] = sum;
    }
  }
  return result;
}

/**
 * Computes the dot product of two vectors.
 * @param {Float32Array} vectorA - First vector.
 * @param {Float32Array} vectorB - Second vector.
 * @returns {number} The dot product of the two vectors.
 */
export function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length.');
  }
  return vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
}

/**
 * Normalizes a vector to unit length.
 * @param {Float32Array} vector - The input vector.
 * @returns {Float32Array} The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return new Float32Array(vector.map(val => val / magnitude));
}

/**
 * Computes the eigenvalues of a 2x2 matrix using the quadratic formula.
 * @param {Float32Array} matrix - A 2x2 matrix in row-major order.
 * @returns {Array<number>} The eigenvalues of the matrix.
 */
export function computeEigenvalues2x2(matrix) {
  if (matrix.length !== 4) {
    throw new Error('Input must be a 2x2 matrix.');
  }
  const [a, b, c, d] = matrix;
  const trace = a + d;
  const determinant = a * d - b * c;
  const discriminant = Math.sqrt(trace * trace - 4 * determinant);
  return [(trace + discriminant) / 2, (trace - discriminant) / 2];
}

/**
 * Validates that a matrix has the correct dimensions.
 * @param {Float32Array} matrix - The matrix to validate.
 * @param {number} rows - Expected number of rows.
 * @param {number} cols - Expected number of columns.
 */
export function validateMatrixDimensions(matrix, rows, cols) {
  if (matrix.length !== rows * cols) {
    throw new Error(`Matrix dimensions do not match. Expected ${rows}x${cols}, got ${matrix.length / cols}x${cols}.`);
  }
}
