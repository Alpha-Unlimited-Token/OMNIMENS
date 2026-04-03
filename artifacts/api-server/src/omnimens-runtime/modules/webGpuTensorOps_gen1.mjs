/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuTensorOps
 * Written: 2026-04-03T09:43:59.527Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGpuTensorOps.mjs

import { randomUUID } from 'crypto';

/**
 * Generates a unique identifier for tensor operations.
 * Useful for tracking operations across multiple agents.
 */
export function generateOperationId() {
  return randomUUID();
}

/**
 * Validates that input matrices are compatible for multiplication.
 * @param {Array<Array<number>>} matrixA - First matrix.
 * @param {Array<Array<number>>} matrixB - Second matrix.
 * @returns {boolean} True if matrices can be multiplied, false otherwise.
 */
export function validateMatrices(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) return false;
  if (matrixA.length === 0 || matrixB.length === 0) return false;
  return matrixA[0].length === matrixB.length;
}

/**
 * Performs matrix multiplication using a pure algorithm.
 * @param {Array<Array<number>>} matrixA - First matrix.
 * @param {Array<Array<number>>} matrixB - Second matrix.
 * @returns {Array<Array<number>>} Resulting matrix after multiplication.
 */
export function multiplyMatrices(matrixA, matrixB) {
  if (!validateMatrices(matrixA, matrixB)) {
    throw new Error('Matrices are not compatible for multiplication.');
  }

  const result = Array(matrixA.length)
    .fill(null)
    .map(() => Array(matrixB[0].length).fill(0));

  for (let i = 0; i < matrixA.length; i++) {
    for (let j = 0; j < matrixB[0].length; j++) {
      for (let k = 0; k < matrixB.length; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  return result;
}

/**
 * Initializes a tensor with random values.
 * @param {number} rows - Number of rows in the tensor.
 * @param {number} cols - Number of columns in the tensor.
 * @param {number} [min=0] - Minimum value for random initialization.
 * @param {number} [max=1] - Maximum value for random initialization.
 * @returns {Array<Array<number>>} Initialized tensor.
 */
export function initializeRandomTensor(rows, cols, min = 0, max = 1) {
  if (rows <= 0 || cols <= 0 || min >= max) {
    throw new Error('Invalid dimensions or range for tensor initialization.');
  }

  return Array(rows)
    .fill(null)
    .map(() =>
      Array(cols)
        .fill(null)
        .map(() => Math.random() * (max - min) + min)
    );
}

/**
 * Transposes a given matrix.
 * @param {Array<Array<number>>} matrix - The matrix to transpose.
 * @returns {Array<Array<number>>} Transposed matrix.
 */
export function transposeMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new Error('Invalid matrix input for transposition.');
  }

  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

/**
 * Computes the dot product of two vectors.
 * @param {Array<number>} vectorA - First vector.
 * @param {Array<number>} vectorB - Second vector.
 * @returns {number} Dot product of the two vectors.
 */
export function dotProduct(vectorA, vectorB) {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length for dot product.');
  }

  return vectorA.reduce((sum, val, index) => sum + val * vectorB[index], 0);
}

/**
 * Normalizes a tensor by scaling its values to a 0-1 range.
 * @param {Array<Array<number>>} tensor - Tensor to normalize.
 * @returns {Array<Array<number>>} Normalized tensor.
 */
export function normalizeTensor(tensor) {
  if (!Array.isArray(tensor) || tensor.length === 0) {
    throw new Error('Invalid tensor for normalization.');
  }

  const flatValues = tensor.flat();
  const min = Math.min(...flatValues);
  const max = Math.max(...flatValues);

  if (min === max) {
    throw new Error('Tensor values are uniform; normalization is not possible.');
  }

  return tensor.map(row => row.map(value => (value - min) / (max - min)));
}
