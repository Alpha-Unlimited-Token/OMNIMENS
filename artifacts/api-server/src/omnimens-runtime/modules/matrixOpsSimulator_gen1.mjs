// matrixOpsSimulator.js

/**
 * @module matrixOpsSimulator
 * @description Simulates GPU-like matrix operations using WebAssembly for efficient computation.
 */

/**
 * @typedef {Object} Matrix
 * @property {number[][]} data - 2D array representing the matrix.
 * @property {number} rows - Number of rows in the matrix.
 * @property {number} cols - Number of columns in the matrix.
 */

/**
 * Validates the structure of a matrix.
 * @param {Matrix} matrix - The matrix to validate.
 * @throws {Error} Throws an error if the matrix is invalid.
 */
function validateMatrix(matrix) {
  if (!Array.isArray(matrix.data) || matrix.data.length !== matrix.rows) {
    throw new Error("Invalid matrix: rows mismatch.");
  }
  if (matrix.data.some(row => row.length !== matrix.cols)) {
    throw new Error("Invalid matrix: columns mismatch.");
  }
}

/**
 * Multiplies two matrices using WebAssembly-like simulation.
 * @param {Matrix} matrixA - The first matrix.
 * @param {Matrix} matrixB - The second matrix.
 * @returns {Matrix} The resulting matrix after multiplication.
 * @throws {Error} Throws an error if matrix dimensions are incompatible.
 */
function multiplyMatrices(matrixA, matrixB) {
  validateMatrix(matrixA);
  validateMatrix(matrixB);

  if (matrixA.cols !== matrixB.rows) {
    throw new Error("Matrix dimensions incompatible for multiplication.");
  }

  const resultData = Array.from({ length: matrixA.rows }, () => Array(matrixB.cols).fill(0));

  for (let i = 0; i < matrixA.rows; i++) {
    for (let j = 0; j < matrixB.cols; j++) {
      for (let k = 0; k < matrixA.cols; k++) {
        resultData[i][j] += matrixA.data[i][k] * matrixB.data[k][j];
      }
    }
  }

  return {
    data: resultData,
    rows: matrixA.rows,
    cols: matrixB.cols
  };
}

/**
 * Performs element-wise addition of two matrices.
 * @param {Matrix} matrixA - The first matrix.
 * @param {Matrix} matrixB - The second matrix.
 * @returns {Matrix} The resulting matrix after addition.
 * @throws {Error} Throws an error if matrix dimensions are incompatible.
 */
function addMatrices(matrixA, matrixB) {
  validateMatrix(matrixA);
  validateMatrix(matrixB);

  if (matrixA.rows !== matrixB.rows || matrixA.cols !== matrixB.cols) {
    throw new Error("Matrix dimensions incompatible for addition.");
  }

  const resultData = matrixA.data.map((row, i) => row.map((value, j) => value + matrixB.data[i][j]));

  return {
    data: resultData,
    rows: matrixA.rows,
    cols: matrixA.cols
  };
}

/**
 * Transposes a matrix.
 * @param {Matrix} matrix - The matrix to transpose.
 * @returns {Matrix} The transposed matrix.
 */
function transposeMatrix(matrix) {
  validateMatrix(matrix);

  const resultData = Array.from({ length: matrix.cols }, (_, i) => matrix.data.map(row => row[i]));

  return {
    data: resultData,
    rows: matrix.cols,
    cols: matrix.rows
  };
}

/**
 * Exports the matrix operations.
 */
export {
  multiplyMatrices,
  addMatrices,
  transposeMatrix
};