/**
 * wasmMatrixOperations: Perform efficient matrix operations using WebAssembly for computationally intensive tasks.
 * This module implements BLAS-like routines in WebAssembly and exposes them as a JavaScript API.
 * It is designed for high-performance numerical computations, optimized for Node.js environments.
 */

// Import the WebAssembly module loader from Node.js
import fs from "fs";
import path from "path";

/**
 * Load and initialize the WebAssembly module.
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmPath = path.resolve(__dirname, 'matrix_operations.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform matrix multiplication (C = A * B).
 * @param {Float64Array} A - The first matrix (m x k) in row-major order.
 * @param {Float64Array} B - The second matrix (k x n) in row-major order.
 * @param {number} m - Number of rows in matrix A.
 * @param {number} k - Number of columns in matrix A and rows in matrix B.
 * @param {number} n - Number of columns in matrix B.
 * @returns {Promise<Float64Array>} The resulting matrix C (m x n) in row-major order.
 */
export async function matrixMultiply(A, B, m, k, n) {
  if (A.length !== m * k || B.length !== k * n) {
    throw new Error('Matrix dimensions do not match the input sizes.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, matrix_multiply } = wasmInstance.exports;

  const memoryBuffer = new Float64Array(memory.buffer);
  const offsetA = 0;
  const offsetB = offsetA + A.length;
  const offsetC = offsetB + B.length;

  // Copy matrices A and B into WebAssembly memory
  memoryBuffer.set(A, offsetA);
  memoryBuffer.set(B, offsetB);

  // Perform the matrix multiplication in WebAssembly
  matrix_multiply(offsetA, offsetB, offsetC, m, k, n);

  // Extract the result matrix C from WebAssembly memory
  const C = new Float64Array(m * n);
  C.set(memoryBuffer.subarray(offsetC, offsetC + m * n));

  return C;
}

/**
 * Perform matrix addition (C = A + B).
 * @param {Float64Array} A - The first matrix (m x n) in row-major order.
 * @param {Float64Array} B - The second matrix (m x n) in row-major order.
 * @param {number} m - Number of rows in the matrices.
 * @param {number} n - Number of columns in the matrices.
 * @returns {Promise<Float64Array>} The resulting matrix C (m x n) in row-major order.
 */
export async function matrixAdd(A, B, m, n) {
  if (A.length !== m * n || B.length !== m * n) {
    throw new Error('Matrix dimensions do not match the input sizes.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, matrix_add } = wasmInstance.exports;

  const memoryBuffer = new Float64Array(memory.buffer);
  const offsetA = 0;
  const offsetB = offsetA + A.length;
  const offsetC = offsetB + B.length;

  // Copy matrices A and B into WebAssembly memory
  memoryBuffer.set(A, offsetA);
  memoryBuffer.set(B, offsetB);

  // Perform the matrix addition in WebAssembly
  matrix_add(offsetA, offsetB, offsetC, m, n);

  // Extract the result matrix C from WebAssembly memory
  const C = new Float64Array(m * n);
  C.set(memoryBuffer.subarray(offsetC, offsetC + m * n));

  return C;
}

