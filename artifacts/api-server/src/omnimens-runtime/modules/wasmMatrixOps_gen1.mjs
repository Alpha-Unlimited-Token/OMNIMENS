/**
 * wasmMatrixOps - A utility module for efficient matrix operations using WebAssembly.
 * This module provides linear algebra operations (e.g., matrix multiplication) implemented in WebAssembly,
 * exposed to JavaScript for high-performance computation.
 */

// Import necessary built-in modules
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Load and compile the WebAssembly module for matrix operations.
 * @returns {Promise<WebAssembly.WebAssemblyInstantiatedSource>} A promise resolving to the compiled WebAssembly module.
 */
async function loadWasmModule() {
  const wasmPath = join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = await readFile(wasmPath);
  return WebAssembly.instantiate(wasmBuffer);
}

/**
 * Multiply two matrices using WebAssembly.
 * @param {number[][]} matrixA - The first matrix (2D array of numbers).
 * @param {number[][]} matrixB - The second matrix (2D array of numbers).
 * @returns {Promise<number[][]>} A promise resolving to the resulting matrix (2D array of numbers).
 * @throws {Error} If the matrices are incompatible for multiplication.
 */
export async function multiplyMatrices(matrixA, matrixB) {
  // Validate input matrices
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  // Flatten matrices into 1D arrays for WebAssembly
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();

  // Load and instantiate the WebAssembly module
  const { instance } = await loadWasmModule();
  const { memory, multiply_matrices } = instance.exports;

  // Allocate memory for input and output matrices
  const inputOffsetA = 0;
  const inputOffsetB = flatA.length * 4; // Each float is 4 bytes
  const outputOffset = inputOffsetB + flatB.length * 4;

  const wasmMemory = new Float32Array(memory.buffer);
  wasmMemory.set(flatA, inputOffsetA / 4);
  wasmMemory.set(flatB, inputOffsetB / 4);

  // Perform matrix multiplication in WebAssembly
  multiply_matrices(inputOffsetA, rowsA, colsA, inputOffsetB, rowsB, colsB, outputOffset);

  // Extract the result from WebAssembly memory
  const result = [];
  for (let i = 0; i < rowsA; i++) {
    result.push(Array.from(wasmMemory.subarray(outputOffset / 4 + i * colsB, outputOffset / 4 + (i + 1) * colsB)));
  }

  return result;
}

/**
 * Example usage of the module.
 * Uncomment the following lines to test the module in Node.js.
 */
// (async () => {
//   const matrixA = [
//     [1, 2, 3],
//     [4, 5, 6]
//   ];
//   const matrixB = [
//     [7, 8],
//     [9, 10],
//     [11, 12]
//   ];

//   try {
//     const result = await multiplyMatrices(matrixA, matrixB);
//     console.log('Result:', result);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// })();