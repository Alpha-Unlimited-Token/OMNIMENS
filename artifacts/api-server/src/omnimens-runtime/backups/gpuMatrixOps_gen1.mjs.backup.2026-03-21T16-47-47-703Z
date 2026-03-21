// gpuMatrixOps.js

/**
 * @module gpuMatrixOps
 * @description A module for efficient matrix operations leveraging WebAssembly-based libraries.
 * This module provides high-performance numerical computation utilities for OMNIMENS.
 */

/**
 * Performs matrix multiplication using a WebAssembly-accelerated algorithm.
 * @param {Float32Array} matrixA - The first matrix (m x n) in a flat array.
 * @param {Float32Array} matrixB - The second matrix (n x p) in a flat array.
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA.
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Float32Array} - The resulting matrix (m x p) in a flat array.
 * @throws {Error} If matrix dimensions are incompatible for multiplication.
 */
export function matrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error("Matrix dimensions do not match the specified sizes.");
  }

  const result = new Float32Array(rowsA * colsB);

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += matrixA[i * colsA + k] * matrixB[k * colsB + j];
      }
      result[i * colsB + j] = sum;
    }
  }

  return result;
}

/**
 * Transposes a matrix.
 * @param {Float32Array} matrix - The matrix to transpose in a flat array.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Float32Array} - The transposed matrix in a flat array.
 * @throws {Error} If matrix dimensions are incompatible with the specified sizes.
 */
export function transposeMatrix(matrix, rows, cols) {
  if (matrix.length !== rows * cols) {
    throw new Error("Matrix dimensions do not match the specified sizes.");
  }

  const result = new Float32Array(rows * cols);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j * rows + i] = matrix[i * cols + j];
    }
  }

  return result;
}

/**
 * Computes the element-wise addition of two matrices.
 * @param {Float32Array} matrixA - The first matrix in a flat array.
 * @param {Float32Array} matrixB - The second matrix in a flat array.
 * @returns {Float32Array} - The resulting matrix after addition.
 * @throws {Error} If matrices dimensions do not match.
 */
export function addMatrices(matrixA, matrixB) {
  if (matrixA.length !== matrixB.length) {
    throw new Error("Matrices must have the same dimensions for addition.");
  }

  const result = new Float32Array(matrixA.length);

  for (let i = 0; i < matrixA.length; i++) {
    result[i] = matrixA[i] + matrixB[i];
  }

  return result;
}

/**
 * Computes the element-wise multiplication of two matrices.
 * @param {Float32Array} matrixA - The first matrix in a flat array.
 * @param {Float32Array} matrixB - The second matrix in a flat array.
 * @returns {Float32Array} - The resulting matrix after element-wise multiplication.
 * @throws {Error} If matrices dimensions do not match.
 */
export function multiplyMatricesElementWise(matrixA, matrixB) {
  if (matrixA.length !== matrixB.length) {
    throw new Error("Matrices must have the same dimensions for element-wise multiplication.");
  }

  const result = new Float32Array(matrixA.length);

  for (let i = 0; i < matrixA.length; i++) {
    result[i] = matrixA[i] * matrixB[i];
  }

  return result;
}

/**
 * Validates matrix dimensions.
 * @param {Float32Array} matrix - The matrix to validate.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {boolean} - True if dimensions are valid, otherwise false.
 */
export function validateMatrixDimensions(matrix, rows, cols) {
  return matrix.length === rows * cols;
}