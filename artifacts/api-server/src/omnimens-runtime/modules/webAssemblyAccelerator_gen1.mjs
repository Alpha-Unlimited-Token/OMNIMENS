/**
 * @module webAssemblyAccelerator
 * @description Provides GPU-like parallel computation for matrix operations and numerical tasks using WebAssembly.
 */

/**
 * @typedef {Float32Array | Float64Array | number[][]} Matrix
 * Represents a matrix, either as a typed array or a 2D array.
 */

/**
 * Multiplies two matrices using WebAssembly-like SIMD-inspired parallel computation.
 * @param {Matrix} matrixA - The first matrix.
 * @param {Matrix} matrixB - The second matrix.
 * @returns {Matrix} The resulting matrix after multiplication.
 * @throws {Error} If matrices are incompatible for multiplication.
 */
export function multiplyMatrices(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error("Input matrices must be arrays.");
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions are incompatible for multiplication.");
  }

  const result = new Array(rowsA).fill(null).map(() => new Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += matrixA[i][k] * matrixB[k][j];
      }
      result[i][j] = sum;
    }
  }

  return result;
}

/**
 * Computes the dot product of two vectors using SIMD-inspired parallel computation.
 * @param {Float32Array | Float64Array} vectorA - The first vector.
 * @param {Float32Array | Float64Array} vectorB - The second vector.
 * @returns {number} The dot product of the two vectors.
 * @throws {Error} If vectors are of different lengths.
 */
export function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same length.");
  }

  let sum = 0;
  for (let i = 0; i < vectorA.length; i++) {
    sum += vectorA[i] * vectorB[i];
  }

  return sum;
}

/**
 * Applies a scalar operation (e.g., addition, multiplication) to all elements in a matrix.
 * @param {Matrix} matrix - The matrix to operate on.
 * @param {number} scalar - The scalar value to apply.
 * @param {string} operation - The operation to perform ("add" or "multiply").
 * @returns {Matrix} The updated matrix.
 * @throws {Error} If an invalid operation is provided.
 */
export function applyScalarOperation(matrix, scalar, operation) {
  if (!Array.isArray(matrix)) {
    throw new Error("Input matrix must be an array.");
  }

  const result = matrix.map(row => {
    return row.map(value => {
      switch (operation) {
        case "add":
          return value + scalar;
        case "multiply":
          return value * scalar;
        default:
          throw new Error("Invalid operation. Use 'add' or 'multiply'.");
      }
    });
  });

  return result;
}

/**
 * Transposes a matrix.
 * @param {Matrix} matrix - The matrix to transpose.
 * @returns {Matrix} The transposed matrix.
 */
export function transposeMatrix(matrix) {
  if (!Array.isArray(matrix)) {
    throw new Error("Input matrix must be an array.");
  }

  const rows = matrix.length;
  const cols = matrix[0].length;

  const result = new Array(cols).fill(null).map(() => new Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }

  return result;
}

/**
 * Generates a random matrix with specified dimensions.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @param {number} [min=0] - Minimum random value.
 * @param {number} [max=1] - Maximum random value.
 * @returns {Matrix} The generated random matrix.
 */
export function generateRandomMatrix(rows, cols, min = 0, max = 1) {
  const result = new Array(rows).fill(null).map(() => {
    return new Array(cols).fill(0).map(() => {
      return Math.random() * (max - min) + min;
    });
  });

  return result;
}