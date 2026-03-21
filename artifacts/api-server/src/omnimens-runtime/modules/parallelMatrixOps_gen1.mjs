/**
 * @module parallelMatrixOps
 * @description This module provides efficient matrix operations using WebAssembly (WASM) and SIMD for high-performance tasks like vector similarity and embedding transformations.
 */

import fs from "fs";
import path from "path";

/**
 * Loads and initializes the WebAssembly module for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
async function initializeWasm() {
  const wasmPath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule, {});
}

/**
 * Multiplies two matrices in parallel using WebAssembly.
 * @param {number[][]} matrixA - The first matrix (2D array).
 * @param {number[][]} matrixB - The second matrix (2D array).
 * @returns {Promise<number[][]>} A promise that resolves to the resulting matrix after multiplication.
 * @throws {Error} Throws an error if the matrices are incompatible for multiplication.
 */
export async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not allow multiplication.');
  }

  const wasmInstance = await initializeWasm();
  const { memory, multiply_matrices } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  const flatMatrixA = matrixA.flat();
  const flatMatrixB = matrixB.flat();
  const resultMatrix = new Float32Array(rowsA * colsB);

  const matrixAPtr = allocateArray(memory, flatMatrixA);
  const matrixBPtr = allocateArray(memory, flatMatrixB);
  const resultPtr = allocateArray(memory, resultMatrix);

  multiply_matrices(matrixAPtr, matrixBPtr, resultPtr, rowsA, colsA, colsB);

  const resultArray = new Float32Array(memory.buffer, resultPtr, rowsA * colsB);
  const result = Array.from({ length: rowsA }, (_, i) =>
    Array.from(resultArray.slice(i * colsB, (i + 1) * colsB))
  );

  return result;
}

/**
 * Allocates a typed array in WebAssembly memory and copies data into it.
 * @param {WebAssembly.Memory} memory - The WebAssembly memory instance.
 * @param {Float32Array} array - The array to copy into memory.
 * @returns {number} The pointer to the allocated memory.
 */
function allocateArray(memory, array) {
  const memoryView = new Float32Array(memory.buffer);
  const ptr = memoryView.length;
  memoryView.set(array, ptr);
  return ptr;
}

