/**
 * @module matrixOps_emulator
 * @description Perform lightweight matrix operations for small-scale neural network tasks using pure JavaScript.
 */

/**
 * Multiplies two matrices and returns the result.
 * @param {number[][]} matrixA - The first matrix (m x n).
 * @param {number[][]} matrixB - The second matrix (n x p).
 * @returns {number[][]} The resulting matrix (m x p).
 * @throws {Error} If matrices cannot be multiplied due to dimension mismatch.
 */
export function multiplyMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix multiplication dimension mismatch: columns of A must match rows of B.');
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
 * Adds two vectors and returns the result.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number[]} The resulting vector.
 * @throws {Error} If vectors are not of the same length.
 */
export function addVectors(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vector addition dimension mismatch: both vectors must have the same length.');
  }

  return vectorA.map((val, index) => val + vectorB[index]);
}

/**
 * Computes the dot product of two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The dot product of the two vectors.
 * @throws {Error} If vectors are not of the same length.
 */
export function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Dot product dimension mismatch: both vectors must have the same length.');
  }

  return vectorA.reduce((sum, val, index) => sum + val * vectorB[index], 0);
}

/**
 * Transposes a matrix.
 * @param {number[][]} matrix - The input matrix.
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
 * Applies a scalar function to each element of a matrix.
 * @param {number[][]} matrix - The input matrix.
 * @param {function(number): number} fn - The scalar function to apply.
 * @returns {number[][]} The resulting matrix after applying the function.
 */
export function applyFunction(matrix, fn) {
  return matrix.map(row => row.map(fn));
}

/**
 * Normalizes a vector to have unit length.
 * @param {number[]} vector - The input vector.
 * @returns {number[]} The normalized vector.
 * @throws {Error} If the vector has zero magnitude.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero-magnitude vector.');
  }

  return vector.map(val => val / magnitude);
}

/**
 * Computes the element-wise addition of two matrices.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} The resulting matrix after element-wise addition.
 * @throws {Error} If matrices are not of the same dimensions.
 */
export function addMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Matrix addition dimension mismatch: both matrices must have the same dimensions.');
  }

  return matrixA.map((row, i) => row.map((val, j) => val + matrixB[i][j]));
}
