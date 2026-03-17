// wasmComputeEngine.js

/**
 * wasmComputeEngine - A WebAssembly-powered computational engine for Node.js.
 * This module leverages WebAssembly to execute high-performance matrix operations
 * and computationally intensive tasks using linear algebra libraries.
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Load a WebAssembly module from a file.
 * @param {string} filePath - The relative path to the WebAssembly (.wasm) file.
 * @returns {Promise<WebAssembly.Instance>} - A promise that resolves to the WebAssembly instance.
 */
export async function loadWasmModule(filePath) {
  const absolutePath = join(process.cwd(), filePath);
  const wasmBuffer = await readFile(absolutePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const instance = await WebAssembly.instantiate(wasmModule);
  return instance;
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @param {WebAssembly.Instance} wasmInstance - The loaded WebAssembly instance.
 * @param {Float32Array} matrixA - The first matrix (flattened, row-major order).
 * @param {Float32Array} matrixB - The second matrix (flattened, row-major order).
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA (and rows in matrixB).
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Float32Array} - The resulting matrix (flattened, row-major order).
 */
export function wasmMatrixMultiply(wasmInstance, matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match the provided sizes.');
  }

  const { memory, multiply_matrices } = wasmInstance.exports;

  // Allocate memory for the matrices and result
  const memoryView = new Float32Array(memory.buffer);
  const offsetA = 0;
  const offsetB = offsetA + matrixA.length;
  const offsetC = offsetB + matrixB.length;

  memoryView.set(matrixA, offsetA);
  memoryView.set(matrixB, offsetB);

  // Call the WebAssembly function
  multiply_matrices(offsetA, offsetB, offsetC, rowsA, colsA, colsB);

  // Extract the result matrix
  return new Float32Array(memory.buffer, offsetC * Float32Array.BYTES_PER_ELEMENT, rowsA * colsB);
}

/**
 * Example usage of the wasmComputeEngine.
 * @returns {Promise<void>} - Resolves when the example completes.
 */
export async function exampleUsage() {
  const wasmInstance = await loadWasmModule('./matrix_operations.wasm');

  const matrixA = new Float32Array([
    1, 2, 3,
    4, 5, 6
  ]); // 2x3 matrix

  const matrixB = new Float32Array([
    7, 8,
    9, 10,
    11, 12
  ]); // 3x2 matrix

  const rowsA = 2;
  const colsA = 3;
  const colsB = 2;

  const result = wasmMatrixMultiply(wasmInstance, matrixA, matrixB, rowsA, colsA, colsB);

  console.log('Resulting Matrix:', result);
}

// Uncomment the following line to run the example when the module is executed directly.
// exampleUsage();