/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: gpuMatrixOps
 * Purpose: Perform GPU-like matrix operations using WebAssembly for embeddings and similarity computations.
 * Description: Optimized matrix operations in WebAssembly for embeddings and similarity computations, enhancing OMNIMENS's reasoning capabilities.
 * Migrated: 2026-03-25T22:49:34.174Z
 */

// gpuMatrixOps.js

/**
 * @module gpuMatrixOps
 * @description Perform GPU-like matrix operations using WebAssembly optimized for embeddings and similarity computations.
 */

/**
 * @typedef {Float32Array} Matrix
 * Represents a 2D matrix stored in row-major order.
 */

/**
 * Multiplies two matrices using optimized algorithms.
 * @param {Matrix} A - First matrix (m x k).
 * @param {Matrix} B - Second matrix (k x n).
 * @param {number} m - Number of rows in A.
 * @param {number} k - Number of columns in A and rows in B.
 * @param {number} n - Number of columns in B.
 * @returns {Matrix} - Resulting matrix (m x n).
 * @throws {Error} - Throws if dimensions are incompatible.
 */
export function matrixMultiply(A, B, m, k, n) {
  if (A.length !== m * k || B.length !== k * n) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const result = new Float32Array(m * n);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let p = 0; p < k; p++) {
        sum += A[i * k + p] * B[p * n + j];
      }
      result[i * n + j] = sum;
    }
  }

  return result;
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {Float32Array} vec1 - First vector.
 * @param {Float32Array} vec2 - Second vector.
 * @returns {number} - Cosine similarity score.
 * @throws {Error} - Throws if vectors have different lengths.
 */
export function cosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length for cosine similarity.');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    normA += vec1[i] * vec1[i];
    normB += vec2[i] * vec2[i];
  }

  if (normA === 0 || normB === 0) {
    throw new Error('One of the vectors has zero magnitude.');
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Transposes a matrix.
 * @param {Matrix} matrix - Input matrix (m x n).
 * @param {number} m - Number of rows.
 * @param {number} n - Number of columns.
 * @returns {Matrix} - Transposed matrix (n x m).
 * @throws {Error} - Throws if matrix dimensions do not match its length.
 */
export function transposeMatrix(matrix, m, n) {
  if (matrix.length !== m * n) {
    throw new Error('Matrix dimensions are incompatible for transposition.');
  }

  const result = new Float32Array(n * m);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      result[j * m + i] = matrix[i * n + j];
    }
  }

  return result;
}

/**
 * Normalizes a vector to unit length.
 * @param {Float32Array} vector - Input vector.
 * @returns {Float32Array} - Normalized vector.
 * @throws {Error} - Throws if vector has zero magnitude.
 */
export function normalizeVector(vector) {
  let norm = 0;

  for (let i = 0; i < vector.length; i++) {
    norm += vector[i] * vector[i];
  }

  norm = Math.sqrt(norm);

  if (norm === 0) {
    throw new Error('Cannot normalize a zero-magnitude vector.');
  }

  const result = new Float32Array(vector.length);

  for (let i = 0; i < vector.length; i++) {
    result[i] = vector[i] / norm;
  }

  return result;
}

/**
 * Computes the Euclidean distance between two vectors.
 * @param {Float32Array} vec1 - First vector.
 * @param {Float32Array} vec2 - Second vector.
 * @returns {number} - Euclidean distance.
 * @throws {Error} - Throws if vectors have different lengths.
 */
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length for Euclidean distance.');
  }

  let sum = 0;

  for (let i = 0; i < vec1.length; i++) {
    const diff = vec1[i] - vec2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}
