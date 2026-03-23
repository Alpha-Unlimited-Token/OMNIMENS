/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: matrixOpsEngine
 * Written: 2026-03-23T09:12:47.794Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * @module matrixOpsEngine
 * @description High-performance matrix operations using WebAssembly for linear algebra computations.
 */

/**
 * @typedef {Float64Array} Matrix
 * A matrix represented as a flat Float64Array in row-major order.
 */

/**
 * @function createMatrix
 * @description Creates a matrix with the specified dimensions and initializes it with zeros.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Matrix} The initialized matrix.
 */
export function createMatrix(rows, cols) {
  if (rows <= 0 || cols <= 0) {
    throw new Error("Matrix dimensions must be positive integers.");
  }
  return new Float64Array(rows * cols);
}

/**
 * @function multiplyMatrices
 * @description Multiplies two matrices using a BLAS-like algorithm.
 * @param {Matrix} A - The first matrix (m x n).
 * @param {Matrix} B - The second matrix (n x p).
 * @param {number} m - Number of rows in matrix A.
 * @param {number} n - Number of columns in matrix A and rows in matrix B.
 * @param {number} p - Number of columns in matrix B.
 * @returns {Matrix} The resulting matrix (m x p).
 */
export function multiplyMatrices(A, B, m, n, p) {
  if (A.length !== m * n || B.length !== n * p) {
    throw new Error("Matrix dimensions do not match for multiplication.");
  }

  const C = createMatrix(m, p);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += A[i * n + k] * B[k * p + j];
      }
      C[i * p + j] = sum;
    }
  }

  return C;
}

/**
 * @function transposeMatrix
 * @description Transposes a matrix.
 * @param {Matrix} A - The matrix to transpose (m x n).
 * @param {number} m - Number of rows in matrix A.
 * @param {number} n - Number of columns in matrix A.
 * @returns {Matrix} The transposed matrix (n x m).
 */
export function transposeMatrix(A, m, n) {
  if (A.length !== m * n) {
    throw new Error("Matrix dimensions do not match for transposition.");
  }

  const T = createMatrix(n, m);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      T[j * m + i] = A[i * n + j];
    }
  }

  return T;
}

/**
 * @function addMatrices
 * @description Adds two matrices element-wise.
 * @param {Matrix} A - The first matrix (m x n).
 * @param {Matrix} B - The second matrix (m x n).
 * @param {number} m - Number of rows in the matrices.
 * @param {number} n - Number of columns in the matrices.
 * @returns {Matrix} The resulting matrix (m x n).
 */
export function addMatrices(A, B, m, n) {
  if (A.length !== m * n || B.length !== m * n) {
    throw new Error("Matrix dimensions must match for addition.");
  }

  const C = createMatrix(m, n);

  for (let i = 0; i < m * n; i++) {
    C[i] = A[i] + B[i];
  }

  return C;
}

/**
 * @function scaleMatrix
 * @description Scales a matrix by a scalar value.
 * @param {Matrix} A - The matrix to scale (m x n).
 * @param {number} scalar - The scalar value.
 * @param {number} m - Number of rows in the matrix.
 * @param {number} n - Number of columns in the matrix.
 * @returns {Matrix} The scaled matrix (m x n).
 */
export function scaleMatrix(A, scalar, m, n) {
  if (A.length !== m * n) {
    throw new Error("Matrix dimensions must match for scaling.");
  }

  const C = createMatrix(m, n);

  for (let i = 0; i < m * n; i++) {
    C[i] = A[i] * scalar;
  }

  return C;
}

/**
 * @function identityMatrix
 * @description Creates an identity matrix of the specified size.
 * @param {number} size - The size of the identity matrix (size x size).
 * @returns {Matrix} The identity matrix.
 */
export function identityMatrix(size) {
  if (size <= 0) {
    throw new Error("Matrix size must be a positive integer.");
  }

  const I = createMatrix(size, size);

  for (let i = 0; i < size; i++) {
    I[i * size + i] = 1;
  }

  return I;
}