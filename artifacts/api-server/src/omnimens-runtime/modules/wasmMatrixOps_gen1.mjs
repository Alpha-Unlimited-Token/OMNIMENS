/**
 * wasmMatrixOps - GPU-accelerated matrix operations using WebAssembly.
 * This module leverages WebAssembly to perform high-performance matrix operations
 * by interfacing with optimized linear algebra libraries.
 *
 * @module wasmMatrixOps
 */

const fs = require('fs');
const path = require('path');

/**
 * Load and instantiate a WebAssembly module from a .wasm file.
 *
 * @param {string} wasmFilePath - Path to the WebAssembly file.
 * @returns {Promise<WebAssembly.Instance>} - A promise that resolves to the WebAssembly instance.
 */
async function loadWasmModule(wasmFilePath) {
  const absolutePath = path.resolve(wasmFilePath);
  const wasmBuffer = fs.readFileSync(absolutePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule, {});
}

/**
 * Perform matrix multiplication using the WebAssembly module.
 *
 * @param {WebAssembly.Instance} wasmInstance - The WebAssembly instance loaded with matrix operations.
 * @param {Float32Array} matrixA - The first matrix (flattened, row-major order).
 * @param {Float32Array} matrixB - The second matrix (flattened, row-major order).
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A.
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Float32Array} - The resulting matrix (flattened, row-major order).
 */
function multiplyMatrices(wasmInstance, matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA) {
    throw new Error("Matrix A dimensions do not match the provided size.");
  }
  if (matrixB.length !== colsA * colsB) {
    throw new Error("Matrix B dimensions do not match the provided size.");
  }

  // Allocate memory in the WebAssembly instance
  const memory = wasmInstance.exports.memory;
  const matrixASize = matrixA.length * Float32Array.BYTES_PER_ELEMENT;
  const matrixBSize = matrixB.length * Float32Array.BYTES_PER_ELEMENT;
  const resultSize = rowsA * colsB * Float32Array.BYTES_PER_ELEMENT;

  const matrixAPtr = wasmInstance.exports.malloc(matrixASize);
  const matrixBPtr = wasmInstance.exports.malloc(matrixBSize);
  const resultPtr = wasmInstance.exports.malloc(resultSize);

  const wasmMemory = new Float32Array(memory.buffer);

  // Copy matrices into WebAssembly memory
  wasmMemory.set(matrixA, matrixAPtr / Float32Array.BYTES_PER_ELEMENT);
  wasmMemory.set(matrixB, matrixBPtr / Float32Array.BYTES_PER_ELEMENT);

  // Perform the matrix multiplication
  wasmInstance.exports.multiply(matrixAPtr, matrixBPtr, resultPtr, rowsA, colsA, colsB);

  // Retrieve the result
  const result = new Float32Array(memory.buffer, resultPtr, rowsA * colsB);

  // Free allocated memory
  wasmInstance.exports.free(matrixAPtr);
  wasmInstance.exports.free(matrixBPtr);
  wasmInstance.exports.free(resultPtr);

  return new Float32Array(result);
}

/**
 * Initialize the wasmMatrixOps module and provide matrix operation utilities.
 *
 * @param {string} wasmFilePath - Path to the WebAssembly file.
 * @returns {Promise<{
 *   multiply: (matrixA: Float32Array, matrixB: Float32Array, rowsA: number, colsA: number, colsB: number) => Float32Array
 * }>} - An object containing matrix operation functions.
 */
async function initializeWasmMatrixOps(wasmFilePath) {
  const wasmInstance = await loadWasmModule(wasmFilePath);
  return {
    multiply: (matrixA, matrixB, rowsA, colsA, colsB) => multiplyMatrices(wasmInstance, matrixA, matrixB, rowsA, colsA, colsB)
  };
}

module.exports = {
  loadWasmModule,
  multiplyMatrices,
  initializeWasmMatrixOps
};