/**
 * wasmMatrixOps - A utility module for efficient matrix operations leveraging WebAssembly.
 * This module provides high-performance matrix operations by integrating WebAssembly (WASM) 
 * for parallel computation and numerical linear algebra tasks.
 *
 * @module wasmMatrixOps
 * @version 1.0.0
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Loads a WebAssembly module from a given file path.
 * @param {string} wasmFilePath - The relative path to the WebAssembly binary file.
 * @returns {Promise<WebAssembly.Instance>} A promise resolving to the WebAssembly instance.
 * @throws {Error} If the file cannot be read or the module fails to instantiate.
 */
async function loadWasmModule(wasmFilePath) {
  const absolutePath = join(process.cwd(), wasmFilePath);
  const wasmBuffer = await readFile(absolutePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule, {});
}

/**
 * Multiplies two matrices using WebAssembly for high performance.
 *
 * @param {number[][]} matrixA - The first matrix (2D array).
 * @param {number[][]} matrixB - The second matrix (2D array).
 * @param {string} wasmFilePath - The path to the WebAssembly binary implementing matrix multiplication.
 * @returns {Promise<number[][]>} A promise resolving to the resulting matrix.
 * @throws {Error} If the matrices are incompatible for multiplication.
 */
export async function multiplyMatrices(matrixA, matrixB, wasmFilePath) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix multiplication is not defined for these dimensions.');
  }

  const wasmInstance = await loadWasmModule(wasmFilePath);
  const { memory, multiply_matrices } = wasmInstance.exports;

  // Flatten matrices into 1D arrays for WASM memory.
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const resultLength = rowsA * colsB;

  // Allocate memory for matrices in WASM.
  const aPtr = wasmInstance.exports.malloc(flatA.length * 4);
  const bPtr = wasmInstance.exports.malloc(flatB.length * 4);
  const resultPtr = wasmInstance.exports.malloc(resultLength * 4);

  // Write matrices into WASM memory.
  const wasmMemory = new Float32Array(memory.buffer);
  wasmMemory.set(flatA, aPtr / 4);
  wasmMemory.set(flatB, bPtr / 4);

  // Perform the matrix multiplication.
  multiply_matrices(aPtr, bPtr, resultPtr, rowsA, colsA, colsB);

  // Read the result from WASM memory.
  const result = [];
  for (let i = 0; i < rowsA; i++) {
    result.push(wasmMemory.slice(resultPtr / 4 + i * colsB, resultPtr / 4 + (i + 1) * colsB));
  }

  // Free WASM memory.
  wasmInstance.exports.free(aPtr);
  wasmInstance.exports.free(bPtr);
  wasmInstance.exports.free(resultPtr);

  return result;
}

/**
 * Validates if a given 2D array is a valid matrix.
 *
 * @param {number[][]} matrix - The matrix to validate.
 * @returns {boolean} True if the input is a valid matrix, false otherwise.
 */
export function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) return false;
  const rowLength = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === rowLength);
}

/**
 * Example usage of the wasmMatrixOps module.
 *
 * @example
 * import { multiplyMatrices, isValidMatrix } from './wasmMatrixOps.js';
 *
 * const matrixA = [
 *   [1, 2],
 *   [3, 4]
 * ];
 *
 * const matrixB = [
 *   [5, 6],
 *   [7, 8]
 * ];
 *
 * const wasmFilePath = './matrix_multiply.wasm';
 *
 * (async () => {
 *   if (isValidMatrix(matrixA) && isValidMatrix(matrixB)) {
 *     const result = await multiplyMatrices(matrixA, matrixB, wasmFilePath);
 *     console.log(result);
 *   } else {
 *     console.error('Invalid matrices provided.');
 *   }
 * })();
 */
