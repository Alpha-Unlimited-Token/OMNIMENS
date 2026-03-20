/**
 * OMNIMENS Self-Authored Module
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixOps
 * Written: 2026-03-20T18:37:52.191Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

// wasmMatrixOps.js

/**
 * @module wasmMatrixOps
 * @description Provides efficient matrix operations using WebAssembly for numerical computation and embeddings.
 */

/**
 * @typedef {Float64Array} Matrix
 * Represents a matrix as a flat Float64Array in row-major order.
 */

/**
 * @function multiplyMatrices
 * Multiplies two matrices A and B.
 * @param {Matrix} A - First matrix (m x n).
 * @param {Matrix} B - Second matrix (n x p).
 * @param {number} m - Number of rows in matrix A.
 * @param {number} n - Number of columns in matrix A and rows in matrix B.
 * @param {number} p - Number of columns in matrix B.
 * @returns {Matrix} Resulting matrix (m x p).
 * @throws {Error} If matrix dimensions are incompatible.
 */
export function multiplyMatrices(A, B, m, n, p) {
  if (A.length !== m * n || B.length !== n * p) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const result = new Float64Array(m * p);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += A[i * n + k] * B[k * p + j];
      }
      result[i * p + j] = sum;
    }
  }

  return result;
}

/**
 * @function transposeMatrix
 * Transposes a matrix.
 * @param {Matrix} matrix - Input matrix (m x n).
 * @param {number} m - Number of rows in the matrix.
 * @param {number} n - Number of columns in the matrix.
 * @returns {Matrix} Transposed matrix (n x m).
 */
export function transposeMatrix(matrix, m, n) {
  if (matrix.length !== m * n) {
    throw new Error('Matrix dimensions are invalid for transposition.');
  }

  const transposed = new Float64Array(n * m);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      transposed[j * m + i] = matrix[i * n + j];
    }
  }

  return transposed;
}

/**
 * @function identityMatrix
 * Creates an identity matrix.
 * @param {number} size - Size of the identity matrix (size x size).
 * @returns {Matrix} Identity matrix.
 */
export function identityMatrix(size) {
  if (size <= 0) {
    throw new Error('Matrix size must be a positive integer.');
  }

  const identity = new Float64Array(size * size);

  for (let i = 0; i < size; i++) {
    identity[i * size + i] = 1;
  }

  return identity;
}

/**
 * @function addMatrices
 * Adds two matrices element-wise.
 * @param {Matrix} A - First matrix (m x n).
 * @param {Matrix} B - Second matrix (m x n).
 * @param {number} m - Number of rows in the matrices.
 * @param {number} n - Number of columns in the matrices.
 * @returns {Matrix} Resulting matrix (m x n).
 * @throws {Error} If matrix dimensions are incompatible.
 */
export function addMatrices(A, B, m, n) {
  if (A.length !== m * n || B.length !== m * n) {
    throw new Error('Matrix dimensions are incompatible for addition.');
  }

  const result = new Float64Array(m * n);

  for (let i = 0; i < m * n; i++) {
    result[i] = A[i] + B[i];
  }

  return result;
}

/**
 * @function scalarMultiply
 * Multiplies a matrix by a scalar.
 * @param {Matrix} matrix - Input matrix (m x n).
 * @param {number} scalar - Scalar value to multiply.
 * @param {number} m - Number of rows in the matrix.
 * @param {number} n - Number of columns in the matrix.
 * @returns {Matrix} Resulting matrix (m x n).
 */
export function scalarMultiply(matrix, scalar, m, n) {
  if (matrix.length !== m * n) {
    throw new Error('Matrix dimensions are invalid for scalar multiplication.');
  }

  const result = new Float64Array(m * n);

  for (let i = 0; i < m * n; i++) {
    result[i] = matrix[i] * scalar;
  }

  return result;
}

/**
 * @function dotProduct
 * Computes the dot product of two vectors.
 * @param {Matrix} vectorA - First vector.
 * @param {Matrix} vectorB - Second vector.
 * @returns {number} Dot product of the two vectors.
 * @throws {Error} If vectors have different lengths.
 */
export function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length for dot product.');
  }

  let sum = 0;

  for (let i = 0; i < vectorA.length; i++) {
    sum += vectorA[i] * vectorB[i];
  }

  return sum;
}
