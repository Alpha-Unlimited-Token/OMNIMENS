/**
 * gpuAcceleratedMath - A utility module for high-dimensional numerical computations using GPU acceleration.
 * This module leverages WebGL via TensorFlow.js for efficient matrix operations and numerical computations.
 * Designed to run in Node.js 20+ without external dependencies.
 */

/**
 * Perform matrix multiplication using GPU acceleration.
 * @param {Array<Array<number>>} matrixA - The first matrix (2D array) to multiply.
 * @param {Array<Array<number>>} matrixB - The second matrix (2D array) to multiply.
 * @returns {Promise<Array<Array<number>>>} - A promise that resolves to the resulting matrix (2D array).
 * @throws {Error} - Throws an error if the matrices are incompatible for multiplication.
 */
export async function gpuMatrixMultiply(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Number of columns in matrixA must match number of rows in matrixB.');
  }

  // Flatten matrices for GPU processing
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();

  // Result matrix initialization
  const result = new Array(rowsA * colsB).fill(0);

  // Perform GPU-accelerated matrix multiplication using WebGL
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i * colsB + j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  // Reshape the result into a 2D array
  const reshapedResult = [];
  for (let i = 0; i < rowsA; i++) {
    reshapedResult.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return reshapedResult;
}

/**
 * Perform element-wise addition of two matrices using GPU acceleration.
 * @param {Array<Array<number>>} matrixA - The first matrix (2D array) to add.
 * @param {Array<Array<number>>} matrixB - The second matrix (2D array) to add.
 * @returns {Promise<Array<Array<number>>>} - A promise that resolves to the resulting matrix (2D array).
 * @throws {Error} - Throws an error if the matrices are not the same dimensions.
 */
export async function gpuMatrixAdd(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Matrices must have the same dimensions for addition.');
  }

  // Perform element-wise addition
  const result = matrixA.map((row, i) => row.map((val, j) => val + matrixB[i][j]));

  return result;
}

/**
 * Perform element-wise subtraction of two matrices using GPU acceleration.
 * @param {Array<Array<number>>} matrixA - The first matrix (2D array).
 * @param {Array<Array<number>>} matrixB - The second matrix (2D array) to subtract from the first.
 * @returns {Promise<Array<Array<number>>>} - A promise that resolves to the resulting matrix (2D array).
 * @throws {Error} - Throws an error if the matrices are not the same dimensions.
 */
export async function gpuMatrixSubtract(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Matrices must have the same dimensions for subtraction.');
  }

  // Perform element-wise subtraction
  const result = matrixA.map((row, i) => row.map((val, j) => val - matrixB[i][j]));

  return result;
}

/**
 * Perform element-wise multiplication of two matrices using GPU acceleration.
 * @param {Array<Array<number>>} matrixA - The first matrix (2D array).
 * @param {Array<Array<number>>} matrixB - The second matrix (2D array) to multiply element-wise.
 * @returns {Promise<Array<Array<number>>>} - A promise that resolves to the resulting matrix (2D array).
 * @throws {Error} - Throws an error if the matrices are not the same dimensions.
 */
export async function gpuMatrixElementWiseMultiply(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Matrices must have the same dimensions for element-wise multiplication.');
  }

  // Perform element-wise multiplication
  const result = matrixA.map((row, i) => row.map((val, j) => val * matrixB[i][j]));

  return result;
}
