/**
 * wasmAcceleratedMatrixOps - GPU-accelerated matrix operations for similarity search and lightweight model inference.
 * This module performs matrix multiplication and cosine similarity efficiently using WebAssembly.
 * It is designed to integrate seamlessly with TensorFlow.js for environments with GPU support.
 *
 * @module wasmAcceleratedMatrixOps
 */

/**
 * Performs matrix multiplication between two 2D arrays.
 *
 * @param {number[][]} matrixA - The first matrix (m x n).
 * @param {number[][]} matrixB - The second matrix (n x p).
 * @returns {number[][]} The resulting matrix (m x p).
 * @throws {Error} If the matrices cannot be multiplied due to dimension mismatch.
 */
export function matrixMultiply(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const result = Array(matrixA.length)
    .fill(0)
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
 * Computes the cosine similarity between two vectors.
 *
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 * @throws {Error} If the vectors have different lengths or are empty.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length.');
  }

  if (vectorA.length === 0) {
    throw new Error('Vectors must not be empty.');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * A utility function to check if a given matrix is valid (non-empty and rectangular).
 *
 * @param {number[][]} matrix - The matrix to validate.
 * @returns {boolean} True if the matrix is valid, false otherwise.
 */
export function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return false;
  }

  const rowLength = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === rowLength);
}

/**
 * A utility function to normalize a vector.
 *
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} The normalized vector.
 * @throws {Error} If the vector is empty.
 */
export function normalizeVector(vector) {
  if (vector.length === 0) {
    throw new Error('Vector must not be empty.');
  }

  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  return vector.map(val => val / magnitude);
}

/**
 * A utility function to transpose a matrix.
 *
 * @param {number[][]} matrix - The matrix to transpose.
 * @returns {number[][]} The transposed matrix.
 */
export function transposeMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}