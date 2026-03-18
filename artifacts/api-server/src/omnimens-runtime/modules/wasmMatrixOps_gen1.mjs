/**
 * wasmMatrixOps: A WebAssembly-powered utility for high-performance matrix operations in Node.js.
 * This module accelerates numerical computations using WebAssembly bindings for BLAS (Basic Linear Algebra Subprograms).
 * It provides efficient implementations for matrix multiplication and other linear algebra operations.
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Load and instantiate the WebAssembly module.
 * @returns {Promise<WebAssembly.Instance>} The instantiated WebAssembly instance.
 */
async function loadWasm() {
  const wasmPath = join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = await readFile(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @param {Float64Array} matrixA - The first matrix (row-major order).
 * @param {Float64Array} matrixB - The second matrix (row-major order).
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA (must match rowsB).
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Float64Array} The resulting matrix (row-major order).
 * @throws {Error} If the dimensions are invalid.
 */
export async function matrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Invalid matrix dimensions for multiplication.');
  }

  const wasmInstance = await loadWasm();
  const { memory, multiply_matrices } = wasmInstance.exports;

  // Allocate memory in WebAssembly for input and output matrices.
  const offsetA = 0;
  const offsetB = offsetA + matrixA.length * Float64Array.BYTES_PER_ELEMENT;
  const offsetC = offsetB + matrixB.length * Float64Array.BYTES_PER_ELEMENT;
  const resultLength = rowsA * colsB;

  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(matrixA, offsetA / Float64Array.BYTES_PER_ELEMENT);
  wasmMemory.set(matrixB, offsetB / Float64Array.BYTES_PER_ELEMENT);

  // Perform the matrix multiplication in WebAssembly.
  multiply_matrices(offsetA, offsetB, offsetC, rowsA, colsA, colsB);

  // Extract the result from WebAssembly memory.
  const result = wasmMemory.slice(offsetC / Float64Array.BYTES_PER_ELEMENT, (offsetC / Float64Array.BYTES_PER_ELEMENT) + resultLength);
  return result;
}

/**
 * Example usage of the wasmMatrixOps module.
 * Demonstrates matrix multiplication.
 */
async function exampleUsage() {
  const matrixA = new Float64Array([
    1, 2, 3,
    4, 5, 6
  ]); // 2x3 matrix

  const matrixB = new Float64Array([
    7, 8,
    9, 10,
    11, 12
  ]); // 3x2 matrix

  const rowsA = 2;
  const colsA = 3;
  const colsB = 2;

  const result = await matrixMultiply(matrixA, matrixB, rowsA, colsA, colsB);
  console.log('Resulting Matrix:', result);
}

// Uncomment the following line to run the example.
// exampleUsage();