/**
 * @module matrixOpsWasm
 * @description Efficiently performs matrix operations using WebAssembly for numerical computation.
 * This module provides a WebAssembly-based implementation of common linear algebra operations, such as matrix multiplication,
 * leveraging WebAssembly's performance benefits. Designed for Node.js 20+ environments.
 */

import { readFile } from "fs/promises";
import path from "path";

/**
 * Loads and initializes the WebAssembly module for matrix operations.
 * @async
 * @returns {Promise<WebAssembly.Instance>} The initialized WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmPath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = await readFile(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const wasmInstance = await WebAssembly.instantiate(wasmModule);
  return wasmInstance;
}

/**
 * Multiplies two matrices using WebAssembly.
 * @async
 * @param {number[][]} matrixA - The first matrix (2D array).
 * @param {number[][]} matrixB - The second matrix (2D array).
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If the matrices cannot be multiplied due to dimension mismatch.
 */
async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not allow multiplication.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, multiply_matrices } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  // Flatten matrices into 1D arrays for WebAssembly.
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const resultSize = rowsA * colsB;
  const resultArray = new Float64Array(resultSize);

  // Allocate memory in WebAssembly.
  const offsetA = 0;
  const offsetB = offsetA + flatA.length * 8;
  const offsetResult = offsetB + flatB.length * 8;

  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(flatA, offsetA / 8);
  wasmMemory.set(flatB, offsetB / 8);

  multiply_matrices(offsetA, rowsA, colsA, offsetB, colsB, offsetResult);

  // Extract the result matrix from WebAssembly memory.
  const result = [];
  for (let i = 0; i < rowsA; i++) {
    result.push(Array.from(wasmMemory.slice(offsetResult / 8 + i * colsB, offsetResult / 8 + (i + 1) * colsB)));
  }

  return result;
}

export { multiplyMatrices };