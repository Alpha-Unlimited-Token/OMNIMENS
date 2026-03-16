/**
 * @module matrixOpsWasm
 * @description A utility module for efficient matrix operations using WebAssembly bindings for neural network computations.
 */

const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Loads and initializes the WebAssembly module for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmPath = join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Performs matrix multiplication efficiently using WebAssembly.
 * @param {number[][]} matrixA - The first matrix (2D array).
 * @param {number[][]} matrixB - The second matrix (2D array).
 * @returns {Promise<number[][]>} The result of the matrix multiplication.
 * @throws {Error} If the matrices are not compatible for multiplication.
 */
async function matrixMultiply(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, multiply_matrices } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  const inputBufferA = new Float64Array(memory.buffer, 0, rowsA * colsA);
  const inputBufferB = new Float64Array(memory.buffer, rowsA * colsA * 8, colsA * colsB);
  const outputBuffer = new Float64Array(memory.buffer, rowsA * colsA * 16, rowsA * colsB);

  // Flatten matrixA and matrixB into the WASM memory buffer
  matrixA.flat().forEach((value, index) => {
    inputBufferA[index] = value;
  });
  matrixB.flat().forEach((value, index) => {
    inputBufferB[index] = value;
  });

  // Perform the matrix multiplication in WASM
  multiply_matrices(rowsA, colsA, colsB);

  // Extract the result from the WASM memory buffer
  const result = [];
  for (let i = 0; i < rowsA; i++) {
    result.push(Array.from(outputBuffer.slice(i * colsB, (i + 1) * colsB)));
  }

  return result;
}

/**
 * Transposes a matrix efficiently using WebAssembly.
 * @param {number[][]} matrix - The input matrix (2D array).
 * @returns {Promise<number[][]>} The transposed matrix.
 */
async function matrixTranspose(matrix) {
  const wasmInstance = await loadWasmModule();
  const { memory, transpose_matrix } = wasmInstance.exports;

  const rows = matrix.length;
  const cols = matrix[0].length;

  const inputBuffer = new Float64Array(memory.buffer, 0, rows * cols);
  const outputBuffer = new Float64Array(memory.buffer, rows * cols * 8, rows * cols);

  // Flatten the matrix into the WASM memory buffer
  matrix.flat().forEach((value, index) => {
    inputBuffer[index] = value;
  });

  // Perform the transpose in WASM
  transpose_matrix(rows, cols);

  // Extract the result from the WASM memory buffer
  const result = [];
  for (let i = 0; i < cols; i++) {
    result.push(Array.from(outputBuffer.slice(i * rows, (i + 1) * rows)));
  }

  return result;
}

module.exports = {
  matrixMultiply,
  matrixTranspose
};