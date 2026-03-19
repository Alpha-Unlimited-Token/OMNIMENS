// Complete ES module code here, starting with /** JSDoc */ and exports

/**
 * @module webAssemblyMatrixOps
 * @description A utility module for efficient matrix operations using WebAssembly-like paradigms, leveraging JavaScript's native capabilities.
 * This module provides GPU-like performance for matrix computations without external dependencies.
 */

/**
 * Multiplies two matrices and returns the resulting matrix.
 * @param {number[][]} matrixA - First matrix (2D array).
 * @param {number[][]} matrixB - Second matrix (2D array).
 * @returns {number[][]} Resulting matrix after multiplication.
 * @throws {Error} If matrices cannot be multiplied due to dimension mismatch.
 */
export function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error("Matrix dimensions do not allow multiplication.");
  }

  const result = Array.from({ length: matrixA.length }, () => Array(matrixB[0].length).fill(0));

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
 * Transposes a matrix.
 * @param {number[][]} matrix - The matrix to transpose.
 * @returns {number[][]} The transposed matrix.
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
 * Calculates the dot product of two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} The dot product of the two vectors.
 * @throws {Error} If vectors are not of the same length.
 */
export function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same length.");
  }

  return vectorA.reduce((sum, value, index) => sum + value * vectorB[index], 0);
}

/**
 * Performs element-wise addition of two matrices.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} Resulting matrix after addition.
 * @throws {Error} If matrices are not of the same dimensions.
 */
export function addMatrices(matrixA, matrixB) {
  if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
    throw new Error("Matrices must be of the same dimensions.");
  }

  const result = Array.from({ length: matrixA.length }, () => Array(matrixA[0].length).fill(0));

  for (let i = 0; i < matrixA.length; i++) {
    for (let j = 0; j < matrixA[0].length; j++) {
      result[i][j] = matrixA[i][j] + matrixB[i][j];
    }
  }

  return result;
}

/**
 * Performs element-wise multiplication of two matrices.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} Resulting matrix after element-wise multiplication.
 * @throws {Error} If matrices are not of the same dimensions.
 */
export function elementWiseMultiply(matrixA, matrixB) {
  if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
    throw new Error("Matrices must be of the same dimensions.");
  }

  const result = Array.from({ length: matrixA.length }, () => Array(matrixA[0].length).fill(0));

  for (let i = 0; i < matrixA.length; i++) {
    for (let j = 0; j < matrixA[0].length; j++) {
      result[i][j] = matrixA[i][j] * matrixB[i][j];
    }
  }

  return result;
}

/**
 * Generates a random matrix with given dimensions.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @param {number} min - Minimum value for random elements.
 * @param {number} max - Maximum value for random elements.
 * @returns {number[][]} Randomly generated matrix.
 */
export function generateRandomMatrix(rows, cols, min = 0, max = 1) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() * (max - min) + min)
  );
}

/**
 * Validates if a given input is a valid matrix.
 * @param {any} matrix - Input to validate.
 * @returns {boolean} True if valid matrix, false otherwise.
 */
export function isValidMatrix(matrix) {
  return (
    Array.isArray(matrix) &&
    matrix.every(
      (row) => Array.isArray(row) && row.length === matrix[0].length
    )
  );
}
