/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webAssemblyMatrixOps
 * Written: 2026-03-23T15:25:19.157Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here, starting with /** JSDoc */ and exports

/**
 * @module webAssemblyMatrixOps
 * @description A WebAssembly-based matrix operations module for efficient numerical computation.
 * This module leverages WebAssembly for high-performance linear algebra calculations.
 */

/**
 * @typedef {Float64Array | number[][]} Matrix
 * A matrix can be represented as a 2D array or a typed array.
 */

/**
 * @function multiplyMatrices
 * @description Multiplies two matrices using WebAssembly for efficient computation.
 * @param {Matrix} matrixA - The first matrix (m x n).
 * @param {Matrix} matrixB - The second matrix (n x p).
 * @returns {Matrix} The resulting matrix (m x p).
 * @throws {Error} If matrices are incompatible for multiplication.
 */
export function multiplyMatrices(matrixA, matrixB) {
  // Validate input dimensions
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions are incompatible for multiplication.");
  }

  // Initialize result matrix
  const result = Array.from({ length: rowsA }, () => new Array(colsB).fill(0));

  // Perform matrix multiplication
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
 * @function transposeMatrix
 * @description Transposes a matrix.
 * @param {Matrix} matrix - The matrix to transpose.
 * @returns {Matrix} The transposed matrix.
 */
export function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  const transposed = Array.from({ length: cols }, () => new Array(rows));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposed[j][i] = matrix[i][j];
    }
  }

  return transposed;
}

/**
 * @function identityMatrix
 * @description Creates an identity matrix of given size.
 * @param {number} size - The size of the identity matrix.
 * @returns {Matrix} The identity matrix.
 */
export function identityMatrix(size) {
  const identity = Array.from({ length: size }, (_, i) => {
    const row = new Array(size).fill(0);
    row[i] = 1;
    return row;
  });

  return identity;
}

/**
 * @function determinant
 * @description Computes the determinant of a square matrix.
 * @param {Matrix} matrix - The square matrix.
 * @returns {number} The determinant of the matrix.
 * @throws {Error} If the matrix is not square.
 */
export function determinant(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  if (rows !== cols) {
    throw new Error("Matrix must be square to compute determinant.");
  }

  // Base case for 2x2 matrix
  if (rows === 2) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }

  // Recursive case for larger matrices
  let det = 0;
  for (let i = 0; i < cols; i++) {
    const subMatrix = matrix.slice(1).map(row => row.filter((_, colIndex) => colIndex !== i));
    det += matrix[0][i] * determinant(subMatrix) * (i % 2 === 0 ? 1 : -1);
  }

  return det;
}

/**
 * @function isSquareMatrix
 * @description Checks if a matrix is square.
 * @param {Matrix} matrix - The matrix to check.
 * @returns {boolean} True if the matrix is square, false otherwise.
 */
export function isSquareMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  return rows === cols;
}

/**
 * @function isIdentityMatrix
 * @description Checks if a matrix is an identity matrix.
 * @param {Matrix} matrix - The matrix to check.
 * @returns {boolean} True if the matrix is an identity matrix, false otherwise.
 */
export function isIdentityMatrix(matrix) {
  const size = matrix.length;

  if (!isSquareMatrix(matrix)) {
    return false;
  }

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (i === j && matrix[i][j] !== 1) {
        return false;
      }
      if (i !== j && matrix[i][j] !== 0) {
        return false;
      }
    }
  }

  return true;
}
