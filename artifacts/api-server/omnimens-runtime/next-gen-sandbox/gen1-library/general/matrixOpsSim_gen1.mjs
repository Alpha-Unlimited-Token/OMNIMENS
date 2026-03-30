/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: matrixOpsSim
 * Purpose: Simulates basic matrix operations for small-scale tasks without GPU acceleration.
 * Description: Simulates basic matrix operations (addition, multiplication, inversion) for OMNIMENS's cognitive tasks without GPU acceleration.
 * Migrated: 2026-03-25T22:49:34.273Z
 */

/**
 * @module matrixOpsSim
 * @description Simulates basic matrix operations (addition, multiplication, inversion) using JavaScript arrays.
 */

/**
 * Adds two matrices.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} The resulting matrix after addition.
 * @throws {Error} If matrices have mismatched dimensions.
 */
export function addMatrices(matrixA, matrixB) {
  if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
    throw new Error('Matrices must have the same dimensions for addition.');
  }

  return matrixA.map((row, i) => row.map((value, j) => value + matrixB[i][j]));
}

/**
 * Multiplies two matrices.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} The resulting matrix after multiplication.
 * @throws {Error} If matrices cannot be multiplied due to mismatched dimensions.
 */
export function multiplyMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Number of columns in Matrix A must match number of rows in Matrix B for multiplication.');
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
 * Inverts a square matrix using Gaussian elimination.
 * @param {number[][]} matrix - The matrix to invert.
 * @returns {number[][]} The inverted matrix.
 * @throws {Error} If the matrix is not square or is singular (non-invertible).
 */
export function invertMatrix(matrix) {
  const n = matrix.length;
  if (!matrix.every(row => row.length === n)) {
    throw new Error('Matrix must be square for inversion.');
  }

  const augmented = matrix.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }

    if (augmented[maxRow][i] === 0) {
      throw new Error('Matrix is singular and cannot be inverted.');
    }

    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    const divisor = augmented[i][i];
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= divisor;
    }

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }

  return augmented.map(row => row.slice(n));
}

/**
 * Validates a matrix.
 * @param {number[][]} matrix - The matrix to validate.
 * @returns {boolean} True if the matrix is valid, otherwise false.
 */
export function isValidMatrix(matrix) {
  return Array.isArray(matrix) && matrix.every(row => Array.isArray(row) && row.every(value => typeof value === 'number'));
}

/**
 * Example usage.
 * Uncomment the following lines to test the module.
 */
// const matrixA = [[1, 2], [3, 4]];
// const matrixB = [[5, 6], [7, 8]];
// console.log(addMatrices(matrixA, matrixB));
// console.log(multiplyMatrices(matrixA, matrixB));
// console.log(invertMatrix(matrixA));