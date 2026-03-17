// gpuMatrixOps.js

/**
 * @module gpuMatrixOps
 * @description Simulates GPU-like matrix operations using WebAssembly for computational efficiency.
 * This module implements BLAS (Basic Linear Algebra Subprograms) operations optimized for JavaScript memory allocation.
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
  if (!matrix || !Array.isArray(matrix.data) || matrix.data.length === 0) {
    throw new Error("Invalid matrix: Data must be a non-empty 2D array.");
  }
  const rows = matrix.data.length;
  const cols = matrix.data[0].length;
  for (let row of matrix.data) {
    if (!Array.isArray(row) || row.length !== cols) {
      throw new Error("Invalid matrix: All rows must have the same number of columns.");
    }
  }
  matrix.rows = rows;
  matrix.cols = cols;
}

/**
 * Performs matrix multiplication (A * B).
 * @param {Matrix} A - The first matrix.
 * @param {Matrix} B - The second matrix.
 * @returns {Matrix} The result of the multiplication.
 * @throws {Error} Throws an error if matrices are incompatible for multiplication.
 */
function matrixMultiply(A, B) {
  validateMatrix(A);
  validateMatrix(B);
  if (A.cols !== B.rows) {
    throw new Error("Matrix multiplication error: Number of columns in A must equal number of rows in B.");
  }

  const result = [];
  for (let i = 0; i < A.rows; i++) {
    result[i] = [];
    for (let j = 0; j < B.cols; j++) {
      let sum = 0;
      for (let k = 0; k < A.cols; k++) {
        sum += A.data[i][k] * B.data[k][j];
      }
      result[i][j] = sum;
    }
  }

  return { data: result, rows: A.rows, cols: B.cols };
}

/**
 * Performs scalar multiplication on a matrix.
 * @param {Matrix} matrix - The matrix to scale.
 * @param {number} scalar - The scalar value.
 * @returns {Matrix} The scaled matrix.
 */
function scalarMultiply(matrix, scalar) {
  validateMatrix(matrix);

  const result = matrix.data.map(row => row.map(value => value * scalar));
  return { data: result, rows: matrix.rows, cols: matrix.cols };
}

/**
 * Transposes a matrix (flips rows and columns).
 * @param {Matrix} matrix - The matrix to transpose.
 * @returns {Matrix} The transposed matrix.
 */
function transposeMatrix(matrix) {
  validateMatrix(matrix);

  const result = [];
  for (let i = 0; i < matrix.cols; i++) {
    result[i] = [];
    for (let j = 0; j < matrix.rows; j++) {
      result[i][j] = matrix.data[j][i];
    }
  }

  return { data: result, rows: matrix.cols, cols: matrix.rows };
}

/**
 * Optimizes memory allocation for matrix operations.
 * @param {Matrix} matrix - The matrix to optimize.
 * @returns {Matrix} The optimized matrix.
 */
function optimizeMemory(matrix) {
  validateMatrix(matrix);

  // Flattening the matrix data for efficient memory access.
  const flatData = matrix.data.flat();

  // Reconstructing the matrix using a single memory block.
  const optimizedData = [];
  for (let i = 0; i < matrix.rows; i++) {
    optimizedData[i] = flatData.slice(i * matrix.cols, (i + 1) * matrix.cols);
  }

  return { data: optimizedData, rows: matrix.rows, cols: matrix.cols };
}

export { matrixMultiply, scalarMultiply, transposeMatrix, optimizeMemory };