/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: matrixOps_wasm
 * Purpose: Enable efficient matrix operations and lightweight ML inference in JavaScript using WebAssembly.
 * Description: This module enables efficient in-memory matrix operations and lightweight ML inference for OMNIMENS using pure JavaScript and WebAssembly principles.
 * Migrated: 2026-03-25T22:49:34.190Z
 */

/**
 * @module matrixOps_wasm
 * @description Provides efficient matrix operations and lightweight ML inference using WebAssembly in a Node.js environment.
 */

/**
 * Multiplies two matrices and returns the resulting matrix.
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
 * Applies a basic inference operation for a single-layer neural network.
 * @param {number[][]} inputMatrix - The input matrix (e.g., features).
 * @param {number[][]} weightMatrix - The weight matrix of the neural network layer.
 * @param {number[]} biasVector - The bias vector of the neural network layer.
 * @returns {number[][]} The resulting matrix after applying the layer.
 * @throws {Error} If dimensions of matrices and bias vector are inconsistent.
 */
export function singleLayerInference(inputMatrix, weightMatrix, biasVector) {
  const result = multiplyMatrices(inputMatrix, weightMatrix);

  if (result[0].length !== biasVector.length) {
    throw new Error("Bias vector length must match the number of columns in the resulting matrix.");
  }

  return result.map(row => row.map((value, index) => value + biasVector[index]));
}

/**
 * Normalizes a matrix using min-max scaling.
 * @param {number[][]} matrix - The matrix to normalize.
 * @returns {number[][]} The normalized matrix with values scaled between 0 and 1.
 */
export function normalizeMatrix(matrix) {
  const flatValues = matrix.flat();
  const min = Math.min(...flatValues);
  const max = Math.max(...flatValues);

  if (min === max) {
    return matrix.map(row => row.map(() => 0.5)); // All values are the same, return uniform matrix.
  }

  return matrix.map(row => row.map(value => (value - min) / (max - min)));
}

/**
 * Computes the softmax of a vector.
 * @param {number[]} vector - The input vector.
 * @returns {number[]} The softmax-transformed vector.
 */
export function softmax(vector) {
  const maxVal = Math.max(...vector); // To improve numerical stability.
  const expValues = vector.map(value => Math.exp(value - maxVal));
  const sumExp = expValues.reduce((sum, value) => sum + value, 0);

  return expValues.map(value => value / sumExp);
}

/**
 * Transposes a matrix (rows become columns and vice versa).
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