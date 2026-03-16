/**
 * @module matrixOpsWasm
 * @description Perform high-dimensional matrix operations efficiently using WebAssembly.
 */

const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Loads and initializes the WebAssembly module for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} A promise resolving to the WebAssembly instance.
 */
async function initializeWasm() {
  const wasmBuffer = readFileSync(join(__dirname, 'matrix_ops.wasm'));
  const wasmModule = await WebAssembly.instantiate(wasmBuffer);
  return wasmModule.instance;
}

/**
 * Performs a matrix multiplication using WebAssembly.
 * @param {Float32Array} matrixA - The first matrix (row-major order).
 * @param {Float32Array} matrixB - The second matrix (row-major order).
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA (and rows in matrixB).
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Float32Array} The resulting matrix (row-major order).
 * @throws {Error} If input dimensions are invalid.
 */
async function multiplyMatrices(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Invalid matrix dimensions.');
  }

  const wasmInstance = await initializeWasm();
  const { memory, multiply_matrices } = wasmInstance.exports;

  const memoryOffsetA = 0;
  const memoryOffsetB = matrixA.length * 4; // 4 bytes per Float32
  const memoryOffsetC = memoryOffsetB + matrixB.length * 4;

  const wasmMemory = new Float32Array(memory.buffer);
  wasmMemory.set(matrixA, memoryOffsetA / 4);
  wasmMemory.set(matrixB, memoryOffsetB / 4);

  multiply_matrices(memoryOffsetA, memoryOffsetB, memoryOffsetC, rowsA, colsA, colsB);

  return new Float32Array(memory.buffer, memoryOffsetC, rowsA * colsB);
}

/**
 * Transposes a matrix using WebAssembly.
 * @param {Float32Array} matrix - The input matrix (row-major order).
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Float32Array} The transposed matrix (row-major order).
 * @throws {Error} If input dimensions are invalid.
 */
async function transposeMatrix(matrix, rows, cols) {
  if (matrix.length !== rows * cols) {
    throw new Error('Invalid matrix dimensions.');
  }

  const wasmInstance = await initializeWasm();
  const { memory, transpose_matrix } = wasmInstance.exports;

  const memoryOffsetInput = 0;
  const memoryOffsetOutput = matrix.length * 4; // 4 bytes per Float32

  const wasmMemory = new Float32Array(memory.buffer);
  wasmMemory.set(matrix, memoryOffsetInput / 4);

  transpose_matrix(memoryOffsetInput, memoryOffsetOutput, rows, cols);

  return new Float32Array(memory.buffer, memoryOffsetOutput, rows * cols);
}

module.exports = {
  initializeWasm,
  multiplyMatrices,
  transposeMatrix
};