// matrixOpsOptimization.js

/**
 * @module matrixOpsOptimization
 * @description Provides efficient matrix operations using WebAssembly for neural computations.
 * This module integrates WebAssembly-based BLAS/LAPACK libraries for optimized linear algebra processing.
 */

const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Load a WebAssembly module from a file.
 * @param {string} wasmFilePath - Path to the WebAssembly file.
 * @returns {Promise<WebAssembly.Instance>} - A promise resolving to the WebAssembly instance.
 */
async function loadWasmModule(wasmFilePath) {
  const wasmBuffer = readFileSync(wasmFilePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @param {Float64Array} matrixA - The first matrix (m x n).
 * @param {Float64Array} matrixB - The second matrix (n x p).
 * @param {number} m - Number of rows in matrixA.
 * @param {number} n - Number of columns in matrixA and rows in matrixB.
 * @param {number} p - Number of columns in matrixB.
 * @returns {Promise<Float64Array>} - The resulting matrix (m x p).
 * @throws {Error} If matrix dimensions are incompatible.
 */
async function wasmMatrixMultiply(matrixA, matrixB, m, n, p) {
  if (matrixA.length !== m * n || matrixB.length !== n * p) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const wasmInstance = await loadWasmModule(join(__dirname, 'matrix_ops.wasm'));

  const { memory, matrixMultiply } = wasmInstance.exports;

  const aOffset = 0;
  const bOffset = m * n * 8; // Each Float64 takes 8 bytes.
  const cOffset = bOffset + n * p * 8;

  const totalMemory = cOffset + m * p * 8;
  if (memory.buffer.byteLength < totalMemory) {
    throw new Error('WASM memory buffer is insufficient for the matrices.');
  }

  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(matrixA, aOffset / 8);
  wasmMemory.set(matrixB, bOffset / 8);

  matrixMultiply(aOffset, bOffset, cOffset, m, n, p);

  return new Float64Array(memory.buffer, cOffset, m * p);
}

/**
 * Compute the transpose of a matrix using WebAssembly.
 * @param {Float64Array} matrix - The matrix to transpose (m x n).
 * @param {number} m - Number of rows in the matrix.
 * @param {number} n - Number of columns in the matrix.
 * @returns {Promise<Float64Array>} - The transposed matrix (n x m).
 */
async function wasmMatrixTranspose(matrix, m, n) {
  if (matrix.length !== m * n) {
    throw new Error('Matrix dimensions do not match the provided size.');
  }

  const wasmInstance = await loadWasmModule(join(__dirname, 'matrix_ops.wasm'));

  const { memory, matrixTranspose } = wasmInstance.exports;

  const matrixOffset = 0;
  const transposedOffset = m * n * 8;

  const totalMemory = transposedOffset + n * m * 8;
  if (memory.buffer.byteLength < totalMemory) {
    throw new Error('WASM memory buffer is insufficient for the matrices.');
  }

  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(matrix, matrixOffset / 8);

  matrixTranspose(matrixOffset, transposedOffset, m, n);

  return new Float64Array(memory.buffer, transposedOffset, n * m);
}

module.exports = {
  loadWasmModule,
  wasmMatrixMultiply,
  wasmMatrixTranspose
};