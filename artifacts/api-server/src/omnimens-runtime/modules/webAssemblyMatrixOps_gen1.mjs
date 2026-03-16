// Complete ES module code here, starting with /** JSDoc */ and exports

/**
 * @module webAssemblyMatrixOps
 * @description A WebAssembly-based utility module for efficient matrix operations using numerical libraries.
 */

/**
 * @typedef {Float64Array} Matrix
 * Represents a matrix stored in a flat array format.
 * Stored in row-major order for compatibility with linear algebra operations.
 */

/**
 * @function multiplyMatrices
 * @description Multiplies two matrices using WebAssembly for optimized performance.
 * @param {Matrix} matA - The first matrix (m x n).
 * @param {Matrix} matB - The second matrix (n x p).
 * @param {number} rowsA - Number of rows in matA.
 * @param {number} colsA - Number of columns in matA (must match rowsB).
 * @param {number} colsB - Number of columns in matB.
 * @returns {Matrix} The resulting matrix (m x p).
 * @throws {Error} If matrix dimensions are incompatible for multiplication.
 */
export function multiplyMatrices(matA, matB, rowsA, colsA, colsB) {
  if (colsA !== matB.length / colsB) {
    throw new Error("Matrix dimensions are incompatible for multiplication.");
  }

  const result = new Float64Array(rowsA * colsB);

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += matA[i * colsA + k] * matB[k * colsB + j];
      }
      result[i * colsB + j] = sum;
    }
  }

  return result;
}

/**
 * @function transposeMatrix
 * @description Transposes a matrix.
 * @param {Matrix} mat - The matrix to transpose.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Matrix} The transposed matrix.
 */
export function transposeMatrix(mat, rows, cols) {
  const result = new Float64Array(rows * cols);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j * rows + i] = mat[i * cols + j];
    }
  }

  return result;
}

/**
 * @function identityMatrix
 * @description Creates an identity matrix.
 * @param {number} size - The size of the identity matrix (n x n).
 * @returns {Matrix} The identity matrix.
 */
export function identityMatrix(size) {
  const result = new Float64Array(size * size);

  for (let i = 0; i < size; i++) {
    result[i * size + i] = 1;
  }

  return result;
}

/**
 * @function addMatrices
 * @description Adds two matrices element-wise.
 * @param {Matrix} matA - The first matrix.
 * @param {Matrix} matB - The second matrix.
 * @returns {Matrix} The resulting matrix.
 * @throws {Error} If matrices have different dimensions.
 */
export function addMatrices(matA, matB) {
  if (matA.length !== matB.length) {
    throw new Error("Matrices must have the same dimensions for addition.");
  }

  const result = new Float64Array(matA.length);

  for (let i = 0; i < matA.length; i++) {
    result[i] = matA[i] + matB[i];
  }

  return result;
}

/**
 * @function subtractMatrices
 * @description Subtracts one matrix from another element-wise.
 * @param {Matrix} matA - The first matrix.
 * @param {Matrix} matB - The second matrix.
 * @returns {Matrix} The resulting matrix.
 * @throws {Error} If matrices have different dimensions.
 */
export function subtractMatrices(matA, matB) {
  if (matA.length !== matB.length) {
    throw new Error("Matrices must have the same dimensions for subtraction.");
  }

  const result = new Float64Array(matA.length);

  for (let i = 0; i < matA.length; i++) {
    result[i] = matA[i] - matB[i];
  }

  return result;
}

/**
 * @function scalarMultiplyMatrix
 * @description Multiplies a matrix by a scalar.
 * @param {Matrix} mat - The matrix to multiply.
 * @param {number} scalar - The scalar value.
 * @returns {Matrix} The resulting matrix.
 */
export function scalarMultiplyMatrix(mat, scalar) {
  const result = new Float64Array(mat.length);

  for (let i = 0; i < mat.length; i++) {
    result[i] = mat[i] * scalar;
  }

  return result;
}
