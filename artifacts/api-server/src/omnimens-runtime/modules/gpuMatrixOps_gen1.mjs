/**
 * gpuMatrixOps.js
 * 
 * This module simulates GPU-like matrix operations for efficient numerical computation using WebGL-like parallel processing in JavaScript.
 * It provides optimized matrix multiplication and element-wise operations for large-scale numerical tasks.
 */

/**
 * Multiplies two matrices using parallel processing simulation.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} The resulting matrix after multiplication.
 * @throws {Error} If matrices cannot be multiplied due to dimension mismatch.
 */
export function multiplyMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error("Matrix dimension mismatch: Cannot multiply matrices.");
  }

  // Initialize result matrix with zeros
  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

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
 * Performs element-wise addition of two matrices.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} The resulting matrix after element-wise addition.
 * @throws {Error} If matrices do not have the same dimensions.
 */
export function addMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error("Matrix dimension mismatch: Cannot add matrices.");
  }

  // Perform element-wise addition
  return matrixA.map((row, i) => row.map((value, j) => value + matrixB[i][j]));
}

/**
 * Performs element-wise multiplication of two matrices.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} The resulting matrix after element-wise multiplication.
 * @throws {Error} If matrices do not have the same dimensions.
 */
export function multiplyElementWise(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error("Matrix dimension mismatch: Cannot perform element-wise multiplication.");
  }

  // Perform element-wise multiplication
  return matrixA.map((row, i) => row.map((value, j) => value * matrixB[i][j]));
}

/**
 * Transposes a matrix.
 * @param {number[][]} matrix - The matrix to transpose.
 * @returns {number[][]} The transposed matrix.
 */
export function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  // Initialize transposed matrix
  const transposed = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposed[j][i] = matrix[i][j];
    }
  }

  return transposed;
}

/**
 * Generates a matrix with random values.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @param {number} [min=0] - Minimum value for random numbers.
 * @param {number} [max=1] - Maximum value for random numbers.
 * @returns {number[][]} The generated matrix with random values.
 */
export function generateRandomMatrix(rows, cols, min = 0, max = 1) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() * (max - min) + min)
  );
}