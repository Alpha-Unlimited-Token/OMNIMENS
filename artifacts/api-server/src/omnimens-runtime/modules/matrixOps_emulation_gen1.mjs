/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: matrixOps_emulation
 * Written: 2026-03-23T10:42:28.234Z
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
 * @module matrixOps_emulation
 * @description Provides basic matrix operations such as multiplication, addition, transpose, and identity matrix generation.
 * @author OMNIMENS
 */

/**
 * Multiplies two matrices.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} The result of matrix multiplication.
 * @throws {Error} If matrices cannot be multiplied due to dimension mismatch.
 */
export function multiplyMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions do not allow multiplication.");
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
 * Adds two matrices.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} The result of matrix addition.
 * @throws {Error} If matrices have different dimensions.
 */
export function addMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error("Matrix dimensions do not match for addition.");
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
 * Transposes a matrix.
 * @param {number[][]} matrix - The matrix to transpose.
 * @returns {number[][]} The transposed matrix.
 */
export function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  const result = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }

  return result;
}

/**
 * Generates an identity matrix of a given size.
 * @param {number} size - The size of the identity matrix.
 * @returns {number[][]} The identity matrix.
 */
export function generateIdentityMatrix(size) {
  const result = Array.from({ length: size }, () => Array(size).fill(0));

  for (let i = 0; i < size; i++) {
    result[i][i] = 1;
  }

  return result;
}

/**
 * Validates if a matrix is well-formed.
 * @param {number[][]} matrix - The matrix to validate.
 * @returns {boolean} True if the matrix is valid, false otherwise.
 */
export function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return false;
  }

  const cols = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === cols);
}

/**
 * Example usage.
 */
const exampleMatrixA = [
  [1, 2],
  [3, 4]
];

const exampleMatrixB = [
  [5, 6],
  [7, 8]
];

try {
  const product = multiplyMatrices(exampleMatrixA, exampleMatrixB);
  console.log("Matrix Multiplication Result:", product);
} catch (error) {
  console.error(error.message);
}
