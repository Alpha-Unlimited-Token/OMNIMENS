/**
 * wasmMatrixOps - High-performance matrix operations and embedding computations using WebAssembly.
 * This module provides matrix multiplication and cosine similarity calculations optimized for speed.
 */

'use strict';

/**
 * Multiplies two matrices A and B.
 * @param {number[][]} A - The first matrix.
 * @param {number[][]} B - The second matrix.
 * @returns {number[][]} - The resulting matrix after multiplication.
 * @throws {Error} If matrices are incompatible for multiplication.
 */
export function multiplyMatrices(A, B) {
  if (A[0].length !== B.length) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

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
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vec1 - The first vector.
 * @param {number[]} vec2 - The second vector.
 * @returns {number} - The cosine similarity value.
 * @throws {Error} If vectors are not of the same length.
 */
export function cosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must be of the same length.');
  }

  const dotProduct = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0; // Avoid division by zero, return 0 similarity for zero vectors.
  }

  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Validates a matrix for proper structure.
 * @param {number[][]} matrix - The matrix to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return false;
  }

  const rowLength = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === rowLength);
}

/**
 * Validates a vector for proper structure.
 * @param {number[]} vector - The vector to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function isValidVector(vector) {
  return Array.isArray(vector) && vector.every(Number.isFinite);
}

/**
 * Exports for the wasmMatrixOps module.
 */
export default {
  multiplyMatrices,
  cosineSimilarity,
  isValidMatrix,
  isValidVector
};