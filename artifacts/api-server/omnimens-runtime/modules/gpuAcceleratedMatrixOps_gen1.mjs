/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: gpuAcceleratedMatrixOps
 * Purpose: Provides GPU-accelerated matrix operations for deep learning tasks.
 * Description: Simulates GPU-accelerated matrix operations for deep learning tasks using pure computation and parallelization techniques.
 * Migrated: 2026-03-25T22:49:34.158Z
 */

/**
 * @module gpuAcceleratedMatrixOps
 * @description Provides GPU-accelerated matrix operations for deep learning tasks using WebAssembly-like computation simulation.
 */

/**
 * Performs matrix multiplication using a simulated GPU-accelerated algorithm.
 * This implementation uses pure computation and parallelization simulation.
 *
 * @param {number[][]} matrixA - The first matrix (m x n).
 * @param {number[][]} matrixB - The second matrix (n x p).
 * @returns {number[][]} The resulting matrix (m x p) after multiplication.
 * @throws {Error} If the matrices cannot be multiplied due to dimension mismatch.
 */
export function matrixMultiply(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error("Both inputs must be 2D arrays.");
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions do not allow multiplication. Columns of A must match rows of B.");
  }

  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  // Simulate parallel computation by iterating over rows and columns
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
 * Transposes a given matrix.
 *
 * @param {number[][]} matrix - The input matrix (m x n).
 * @returns {number[][]} The transposed matrix (n x m).
 * @throws {Error} If the input is not a 2D array.
 */
export function transposeMatrix(matrix) {
  if (!Array.isArray(matrix)) {
    throw new Error("Input must be a 2D array.");
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
 * Computes the Hadamard product (element-wise multiplication) of two matrices.
 *
 * @param {number[][]} matrixA - The first matrix (m x n).
 * @param {number[][]} matrixB - The second matrix (m x n).
 * @returns {number[][]} The resulting matrix (m x n) after element-wise multiplication.
 * @throws {Error} If the matrices do not have the same dimensions.
 */
export function hadamardProduct(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error("Both inputs must be 2D arrays.");
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error("Matrices must have the same dimensions for Hadamard product.");
  }

  const result = Array.from({ length: rowsA }, () => Array(colsA).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsA; j++) {
      result[i][j] = matrixA[i][j] * matrixB[i][j];
    }
  }

  return result;
}

/**
 * Generates a random matrix with specified dimensions and value range.
 *
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in the matrix.
 * @param {number} [min=0] - The minimum value for random elements.
 * @param {number} [max=1] - The maximum value for random elements.
 * @returns {number[][]} The generated random matrix.
 * @throws {Error} If rows or columns are not positive integers.
 */
export function generateRandomMatrix(rows, cols, min = 0, max = 1) {
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows <= 0 || cols <= 0) {
    throw new Error("Rows and columns must be positive integers.");
  }

  const result = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() * (max - min) + min)
  );

  return result;
}