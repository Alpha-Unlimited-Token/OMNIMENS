/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuTensorAccelerator
 * Written: 2026-04-02T14:10:05.760Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuTensorAccelerator.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique identifier for tensor operations to optimize caching and reuse.
 * @param {string} input - A string representation of tensor dimensions or operations.
 * @returns {string} - A unique hash identifier.
 */
export function generateTensorID(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Validates that input dimensions for matrix operations are compatible.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {boolean} - True if dimensions are compatible, false otherwise.
 */
export function validateMatrixDimensions(matrixA, matrixB) {
  return matrixA[0].length === matrixB.length;
}

/**
 * Performs matrix multiplication on 2D arrays.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resulting matrix after multiplication.
 */
export function multiplyMatrices(matrixA, matrixB) {
  if (!validateMatrixDimensions(matrixA, matrixB)) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
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
 * Applies a ReLU activation function element-wise to a 2D tensor.
 * @param {number[][]} tensor - Input tensor.
 * @returns {number[][]} - Tensor after ReLU activation.
 */
export function applyReLU(tensor) {
  return tensor.map(row => row.map(value => Math.max(0, value)));
}

/**
 * Normalizes a tensor by scaling its values to a range [0, 1].
 * @param {number[][]} tensor - Input tensor.
 * @returns {number[][]} - Normalized tensor.
 */
export function normalizeTensor(tensor) {
  const flatValues = tensor.flat();
  const min = Math.min(...flatValues);
  const max = Math.max(...flatValues);

  return tensor.map(row => row.map(value => (value - min) / (max - min)));
}

/**
 * Transposes a 2D matrix.
 * @param {number[][]} matrix - Input matrix.
 * @returns {number[][]} - Transposed matrix.
 */
export function transposeMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

/**
 * Utility function to create a zero-initialized tensor of given dimensions.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {number[][]} - Zero-initialized tensor.
 */
export function createZeroTensor(rows, cols) {
  return Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0));
}

/**
 * Calculates the dot product of two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Dot product result.
 */
export function calculateDotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length for dot product.');
  }

  return vectorA.reduce((sum, value, index) => sum + value * vectorB[index], 0);
}
