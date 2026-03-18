/**
 * wasmMatrixOps - A WebAssembly-based module for high-performance matrix operations.
 * This module leverages WebAssembly to perform GPU-like matrix computations in Node.js.
 * It provides basic linear algebra operations such as matrix multiplication and transposition.
 *
 * @module wasmMatrixOps
 */

// Import Node.js built-in module for working with WebAssembly
const fs = require('fs');
const path = require('path');

/**
 * Load and initialize the WebAssembly module.
 *
 * @returns {Promise<WebAssembly.Instance>} - A promise that resolves to the WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmPath = path.join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform matrix multiplication using WebAssembly.
 *
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} - A promise that resolves to the resulting matrix.
 * @throws {Error} - Throws an error if matrices are incompatible for multiplication.
 */
async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, multiply } = wasmInstance.exports;

  // Flatten matrices into 1D arrays for WebAssembly
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  // Allocate memory for input matrices and result matrix
  const offsetA = 0;
  const offsetB = offsetA + flatA.length * 4;
  const offsetC = offsetB + flatB.length * 4;
  const resultSize = rowsA * colsB;

  const memoryBuffer = new Float32Array(memory.buffer);
  memoryBuffer.set(flatA, offsetA / 4);
  memoryBuffer.set(flatB, offsetB / 4);

  // Call the WebAssembly multiply function
  multiply(offsetA, rowsA, colsA, offsetB, colsB, offsetC);

  // Extract the result matrix from memory
  const result = [];
  for (let i = 0; i < rowsA; i++) {
    result.push(Array.from(memoryBuffer.slice(offsetC / 4 + i * colsB, offsetC / 4 + (i + 1) * colsB)));
  }

  return result;
}

/**
 * Transpose a matrix using WebAssembly.
 *
 * @param {number[][]} matrix - The input matrix.
 * @returns {Promise<number[][]>} - A promise that resolves to the transposed matrix.
 */
async function transposeMatrix(matrix) {
  const wasmInstance = await loadWasmModule();
  const { memory, transpose } = wasmInstance.exports;

  const rows = matrix.length;
  const cols = matrix[0].length;
  const flatMatrix = matrix.flat();

  // Allocate memory for input matrix and result matrix
  const offsetInput = 0;
  const offsetOutput = offsetInput + flatMatrix.length * 4;

  const memoryBuffer = new Float32Array(memory.buffer);
  memoryBuffer.set(flatMatrix, offsetInput / 4);

  // Call the WebAssembly transpose function
  transpose(offsetInput, rows, cols, offsetOutput);

  // Extract the result matrix from memory
  const result = [];
  for (let i = 0; i < cols; i++) {
    result.push(Array.from(memoryBuffer.slice(offsetOutput / 4 + i * rows, offsetOutput / 4 + (i + 1) * rows)));
  }

  return result;
}

// Export the module functions
module.exports = {
  multiplyMatrices,
  transposeMatrix
};