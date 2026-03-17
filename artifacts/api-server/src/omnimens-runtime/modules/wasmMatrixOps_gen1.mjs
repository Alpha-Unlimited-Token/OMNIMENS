/**
 * wasmMatrixOps: Perform efficient matrix operations using WebAssembly for neural computations.
 * This module leverages WebAssembly for fast, GPU-like matrix operations, enabling advanced neural computations.
 */

const fs = require('fs');
const path = require('path');

/**
 * Loads a WebAssembly binary file and initializes the WebAssembly instance.
 * @param {string} filePath - Path to the WebAssembly binary file.
 * @returns {Promise<WebAssembly.Instance>} - A promise that resolves to the WebAssembly instance.
 */
async function loadWasmModule(filePath) {
  const wasmBuffer = await fs.promises.readFile(filePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const wasmInstance = await WebAssembly.instantiate(wasmModule);
  return wasmInstance;
}

/**
 * Performs matrix multiplication using WebAssembly.
 * @param {Float32Array} matrixA - The first matrix as a flat Float32Array.
 * @param {Float32Array} matrixB - The second matrix as a flat Float32Array.
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A.
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Float32Array} - The result matrix as a flat Float32Array.
 * @throws {Error} - Throws if matrix dimensions are incompatible.
 */
async function wasmMatrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const wasmInstance = await loadWasmModule(path.join(__dirname, 'matrix_ops.wasm'));

  const { memory, multiplyMatrices } = wasmInstance.exports;

  const resultSize = rowsA * colsB;
  const resultOffset = multiplyMatrices(
    matrixA.byteOffset,
    matrixB.byteOffset,
    rowsA,
    colsA,
    colsB
  );

  return new Float32Array(memory.buffer, resultOffset, resultSize);
}

/**
 * Validates input matrices and prepares them for WebAssembly operations.
 * @param {Array<Array<number>>} matrix - 2D array representation of a matrix.
 * @returns {Float32Array} - Flat Float32Array representation of the matrix.
 */
function prepareMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  for (let i = 1; i < rows; i++) {
    if (matrix[i].length !== cols) {
      throw new Error('All rows in the matrix must have the same number of columns.');
    }
  }

  const flatMatrix = new Float32Array(rows * cols);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      flatMatrix[i * cols + j] = matrix[i][j];
    }
  }

  return flatMatrix;
}

module.exports = {
  loadWasmModule,
  wasmMatrixMultiply,
  prepareMatrix
};