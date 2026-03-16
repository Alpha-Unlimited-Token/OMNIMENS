// matrixOpsWasmModule.js

/**
 * @module matrixOpsWasmModule
 * @description Provides efficient matrix operations using WebAssembly for fast linear algebra computations.
 */

const { readFile } = require('fs/promises');
const path = require('path');

/**
 * Load and compile WebAssembly module for matrix operations.
 * @async
 * @returns {Promise<WebAssembly.Instance>} Compiled WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmFilePath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = await readFile(wasmFilePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const instance = await WebAssembly.instantiate(wasmModule);
  return instance;
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @async
 * @param {Float64Array} matrixA - First matrix (row-major order).
 * @param {Float64Array} matrixB - Second matrix (row-major order).
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA.
 * @param {number} rowsB - Number of rows in matrixB.
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Promise<Float64Array>} Resulting matrix (row-major order).
 * @throws {Error} If matrix dimensions are incompatible for multiplication.
 */
async function multiplyMatrices(matrixA, matrixB, rowsA, colsA, rowsB, colsB) {
  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, multiply } = wasmInstance.exports;

  const resultRows = rowsA;
  const resultCols = colsB;

  const resultMatrix = new Float64Array(resultRows * resultCols);

  const matrixAOffset = 0;
  const matrixBOffset = matrixA.length * Float64Array.BYTES_PER_ELEMENT;
  const resultOffset = matrixBOffset + matrixB.length * Float64Array.BYTES_PER_ELEMENT;

  const memoryView = new Float64Array(memory.buffer);
  memoryView.set(matrixA, matrixAOffset / Float64Array.BYTES_PER_ELEMENT);
  memoryView.set(matrixB, matrixBOffset / Float64Array.BYTES_PER_ELEMENT);

  multiply(matrixAOffset, matrixBOffset, resultOffset, rowsA, colsA, colsB);

  resultMatrix.set(
    memoryView.subarray(
      resultOffset / Float64Array.BYTES_PER_ELEMENT,
      resultOffset / Float64Array.BYTES_PER_ELEMENT + resultMatrix.length
    )
  );

  return resultMatrix;
}

/**
 * Validate matrix dimensions and return a formatted matrix.
 * @param {Array<Array<number>>} matrix - 2D array representing the matrix.
 * @returns {Float64Array} Flattened matrix in row-major order.
 * @throws {Error} If matrix is not rectangular.
 */
function formatMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  for (let i = 1; i < rows; i++) {
    if (matrix[i].length !== cols) {
      throw new Error('Matrix is not rectangular.');
    }
  }

  const flattenedMatrix = new Float64Array(rows * cols);
  let index = 0;

  for (const row of matrix) {
    for (const value of row) {
      flattenedMatrix[index++] = value;
    }
  }

  return flattenedMatrix;
}

/**
 * Exported functions.
 */
module.exports = {
  loadWasmModule,
  multiplyMatrices,
  formatMatrix
};