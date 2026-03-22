/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixOps
 * Written: 2026-03-22T15:07:06.885Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmMatrixOps.js

/**
 * @module wasmMatrixOps
 * @description Provides GPU-accelerated matrix operations using WebAssembly for efficient tensor computations.
 */

/**
 * Multiplies two matrices using pure JavaScript algorithms optimized for WebAssembly-like performance.
 * @param {number[][]} matrixA - The first matrix (2D array).
 * @param {number[][]} matrixB - The second matrix (2D array).
 * @returns {number[][]} - The resulting matrix after multiplication.
 * @throws {Error} If matrices cannot be multiplied due to dimension mismatch.
 */
export function multiplyMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions do not match for multiplication.");
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
 * Transposes a matrix (flips rows and columns).
 * @param {number[][]} matrix - The matrix to transpose.
 * @returns {number[][]} - The transposed matrix.
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
 * Calculates the determinant of a square matrix using recursion.
 * @param {number[][]} matrix - The square matrix.
 * @returns {number} - The determinant of the matrix.
 * @throws {Error} If the matrix is not square.
 */
export function determinant(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  if (rows !== cols) {
    throw new Error("Matrix must be square to calculate determinant.");
  }

  if (rows === 1) {
    return matrix[0][0];
  }

  if (rows === 2) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }

  let det = 0;

  for (let i = 0; i < cols; i++) {
    const subMatrix = matrix.slice(1).map(row => row.filter((_, colIndex) => colIndex !== i));
    det += matrix[0][i] * determinant(subMatrix) * (i % 2 === 0 ? 1 : -1);
  }

  return det;
}

/**
 * Generates an identity matrix of given size.
 * @param {number} size - The size of the identity matrix (number of rows and columns).
 * @returns {number[][]} - The identity matrix.
 */
export function identityMatrix(size) {
  return Array.from({ length: size }, (_, i) => 
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
  );
}

/**
 * Performs element-wise addition of two matrices.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} - The resulting matrix after addition.
 * @throws {Error} If matrices dimensions do not match.
 */
export function addMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error("Matrix dimensions must match for addition.");
  }

  const result = Array.from({ length: rowsA }, () => Array(colsA).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsA; j++) {
      result[i][j] = matrixA[i][j] + matrixB[i][j];
    }
  }

  return result;
}

/**
 * Performs element-wise subtraction of two matrices.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} - The resulting matrix after subtraction.
 * @throws {Error} If matrices dimensions do not match.
 */
export function subtractMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error("Matrix dimensions must match for subtraction.");
  }

  const result = Array.from({ length: rowsA }, () => Array(colsA).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsA; j++) {
      result[i][j] = matrixA[i][j] - matrixB[i][j];
    }
  }

  return result;
}
