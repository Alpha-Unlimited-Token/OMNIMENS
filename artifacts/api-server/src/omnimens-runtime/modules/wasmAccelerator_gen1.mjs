/**
 * @module wasmAccelerator
 * @description Provides GPU-like acceleration for computationally intensive tasks using WebAssembly.
 * This module implements matrix operations (e.g., multiplication, eigenvalue decomposition) in WebAssembly
 * and exposes them to Node.js for high-performance computations.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Loads a WebAssembly module from a file and returns the compiled instance.
 * @param {string} filePath - The path to the WebAssembly file.
 * @returns {Promise<WebAssembly.Instance>} The compiled WebAssembly instance.
 */
async function loadWasmModule(filePath) {
  const wasmBuffer = readFileSync(filePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Multiplies two matrices using WebAssembly.
 * @param {Float64Array} matrixA - The first matrix (flattened row-major order).
 * @param {Float64Array} matrixB - The second matrix (flattened row-major order).
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA.
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Promise<Float64Array>} The resulting matrix (flattened row-major order).
 * @throws {Error} If dimensions are incompatible for matrix multiplication.
 */
export async function multiplyMatrices(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match the specified sizes.');
  }

  const wasmInstance = await loadWasmModule(join(__dirname, 'matrix_ops.wasm'));
  const { memory, multiply } = wasmInstance.exports;

  const inputOffsetA = 0;
  const inputOffsetB = inputOffsetA + matrixA.length * 8; // Float64Array -> 8 bytes per element
  const outputOffset = inputOffsetB + matrixB.length * 8;

  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(matrixA, inputOffsetA / 8);
  wasmMemory.set(matrixB, inputOffsetB / 8);

  multiply(inputOffsetA, inputOffsetB, outputOffset, rowsA, colsA, colsB);

  return wasmMemory.subarray(outputOffset / 8, outputOffset / 8 + rowsA * colsB);
}

/**
 * Computes the eigenvalues of a square matrix using WebAssembly.
 * @param {Float64Array} matrix - The square matrix (flattened row-major order).
 * @param {number} size - The number of rows/columns in the square matrix.
 * @returns {Promise<Float64Array>} The eigenvalues of the matrix.
 * @throws {Error} If the matrix is not square.
 */
export async function computeEigenvalues(matrix, size) {
  if (matrix.length !== size * size) {
    throw new Error('Matrix must be square.');
  }

  const wasmInstance = await loadWasmModule(join(__dirname, 'matrix_ops.wasm'));
  const { memory, eigenvalues } = wasmInstance.exports;

  const inputOffset = 0;
  const outputOffset = inputOffset + matrix.length * 8;

  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(matrix, inputOffset / 8);

  eigenvalues(inputOffset, outputOffset, size);

  return wasmMemory.subarray(outputOffset / 8, outputOffset / 8 + size);
}

/**
 * Initializes the WebAssembly accelerator by validating the module.
 * @returns {Promise<void>} Resolves if the WebAssembly module is valid.
 */
export async function initializeWasmAccelerator() {
  const wasmInstance = await loadWasmModule(join(__dirname, 'matrix_ops.wasm'));
  if (!wasmInstance.exports.multiply || !wasmInstance.exports.eigenvalues) {
    throw new Error('WebAssembly module is missing required exports.');
  }
}