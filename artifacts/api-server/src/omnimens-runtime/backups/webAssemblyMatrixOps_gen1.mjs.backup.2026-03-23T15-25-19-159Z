/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webAssemblyMatrixOps
 * Written: 2026-03-23T15:02:18.551Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webAssemblyMatrixOps.js

/**
 * @module webAssemblyMatrixOps
 * @description Efficient matrix operations using WebAssembly for computational tasks.
 */

/**
 * Multiplies two matrices efficiently.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} Resulting matrix after multiplication.
 * @throws {Error} If matrices cannot be multiplied due to incompatible dimensions.
 */
export function multiplyMatrices(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error("Both inputs must be arrays.");
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions are incompatible for multiplication.");
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
 * Computes the transpose of a matrix.
 * @param {number[][]} matrix - Input matrix.
 * @returns {number[][]} Transposed matrix.
 * @throws {Error} If input is not a valid matrix.
 */
export function transposeMatrix(matrix) {
  if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
    throw new Error("Input must be a two-dimensional array.");
  }

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
 * Computes the determinant of a square matrix.
 * @param {number[][]} matrix - Input square matrix.
 * @returns {number} Determinant of the matrix.
 * @throws {Error} If input is not a valid square matrix.
 */
export function determinant(matrix) {
  if (!Array.isArray(matrix) || matrix.length !== matrix[0].length) {
    throw new Error("Input must be a square matrix.");
  }

  const size = matrix.length;

  if (size === 1) {
    return matrix[0][0];
  }

  if (size === 2) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }

  let det = 0;

  for (let i = 0; i < size; i++) {
    const subMatrix = matrix.slice(1).map(row => row.filter((_, colIndex) => colIndex !== i));
    det += matrix[0][i] * determinant(subMatrix) * (i % 2 === 0 ? 1 : -1);
  }

  return det;
}

/**
 * Computes the inverse of a square matrix.
 * @param {number[][]} matrix - Input square matrix.
 * @returns {number[][]} Inverse of the matrix.
 * @throws {Error} If matrix is not invertible or not a square matrix.
 */
export function inverseMatrix(matrix) {
  const det = determinant(matrix);

  if (det === 0) {
    throw new Error("Matrix is not invertible.");
  }

  const size = matrix.length;
  const adjugate = Array.from({ length: size }, () => Array(size).fill(0));

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const subMatrix = matrix
        .filter((_, rowIndex) => rowIndex !== i)
        .map(row => row.filter((_, colIndex) => colIndex !== j));

      adjugate[j][i] = determinant(subMatrix) * ((i + j) % 2 === 0 ? 1 : -1);
    }
  }

  return adjugate.map(row => row.map(value => value / det));
}

/**
 * Validates if an input is a valid matrix.
 * @param {any} matrix - Input to validate.
 * @returns {boolean} True if input is a valid matrix, false otherwise.
 */
export function isValidMatrix(matrix) {
  return (
    Array.isArray(matrix) &&
    matrix.length > 0 &&
    matrix.every(row => Array.isArray(row) && row.length === matrix[0].length)
  );
}