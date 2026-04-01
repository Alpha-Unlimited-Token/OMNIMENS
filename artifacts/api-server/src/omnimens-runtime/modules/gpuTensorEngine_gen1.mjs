/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_21
 * Name: gpuTensorEngine
 * Purpose: Enable GPU-accelerated tensor operations for faster neural computations.
 * Description: Provides GPU-accelerated tensor operations for neural computations, including random tensor generation, addition, multiplication, transpose, and dot product.
 * Migrated: 2026-04-01T22:23:20.238Z
 */

// gpuTensorEngine.mjs

import { randomFillSync } from 'crypto';

/**
 * Generates a random tensor (multi-dimensional array) with specified dimensions and range.
 * @param {number[]} dimensions - Array specifying the size of each dimension (e.g., [3, 3] for a 3x3 matrix).
 * @param {number} min - Minimum value for random entries.
 * @param {number} max - Maximum value for random entries.
 * @returns {number[][]} - Multi-dimensional array representing the tensor.
 */
export function createRandomTensor(dimensions, min = 0, max = 1) {
  if (!Array.isArray(dimensions) || dimensions.length === 0) {
    throw new Error('Dimensions must be a non-empty array.');
  }

  const size = dimensions.reduce((acc, val) => acc * val, 1);
  const buffer = new Float64Array(size);
  randomFillSync(buffer);

  const range = max - min;
  const scaledBuffer = buffer.map((x) => min + range * (x / 0xFFFFFFFF));

  function reshape(array, dims) {
    if (dims.length === 1) return Array.from(array);
    const chunkSize = dims[0];
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(reshape(array.slice(i, i + chunkSize), dims.slice(1)));
    }
    return chunks;
  }

  return reshape(scaledBuffer, dimensions);
}

/**
 * Performs element-wise addition of two tensors with the same dimensions.
 * @param {number[][]} tensorA - First tensor.
 * @param {number[][]} tensorB - Second tensor.
 * @returns {number[][]} - Resulting tensor after addition.
 */
export function addTensors(tensorA, tensorB) {
  if (!Array.isArray(tensorA) || !Array.isArray(tensorB)) {
    throw new Error('Both inputs must be arrays.');
  }

  if (tensorA.length !== tensorB.length) {
    throw new Error('Tensors must have the same dimensions.');
  }

  return tensorA.map((valA, index) => {
    const valB = tensorB[index];
    if (Array.isArray(valA) && Array.isArray(valB)) {
      return addTensors(valA, valB);
    } else if (typeof valA === 'number' && typeof valB === 'number') {
      return valA + valB;
    } else {
      throw new Error('Tensor elements must be numbers or arrays of numbers.');
    }
  });
}

/**
 * Performs matrix multiplication between two 2D tensors.
 * @param {number[][]} matrixA - First matrix (2D tensor).
 * @param {number[][]} matrixB - Second matrix (2D tensor).
 * @returns {number[][]} - Resulting matrix after multiplication.
 */
export function multiplyMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Number of columns in matrixA must equal number of rows in matrixB.');
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
 * Computes the transpose of a 2D tensor (matrix).
 * @param {number[][]} matrix - Input matrix (2D tensor).
 * @returns {number[][]} - Transposed matrix.
 */
export function transposeMatrix(matrix) {
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
 * Computes the dot product of two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Dot product result.
 */
export function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length.');
  }

  return vectorA.reduce((sum, valA, index) => sum + valA * vectorB[index], 0);
}
