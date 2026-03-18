/**
 * @module webAssemblyMatrixOps
 * @description This module provides high-performance matrix operations using WebAssembly
 *              by integrating BLAS (Basic Linear Algebra Subprograms) or LAPACK (Linear Algebra PACKage)
 *              libraries compiled to WebAssembly. It is designed for numerical tasks requiring fast
 *              and efficient linear algebra computations.
 */

const fs = require('fs');
const path = require('path');

/**
 * Loads a WebAssembly module from a file.
 * @param {string} filePath - The path to the WebAssembly binary file.
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
async function loadWasm(filePath) {
  const wasmBuffer = fs.readFileSync(filePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const wasmInstance = await WebAssembly.instantiate(wasmModule);
  return wasmInstance;
}

/**
 * Performs matrix multiplication using WebAssembly.
 * @param {Float64Array} matrixA - The first matrix (m x n) in row-major order.
 * @param {Float64Array} matrixB - The second matrix (n x p) in row-major order.
 * @param {number} m - The number of rows in matrixA.
 * @param {number} n - The number of columns in matrixA and rows in matrixB.
 * @param {number} p - The number of columns in matrixB.
 * @returns {Float64Array} The resulting matrix (m x p) in row-major order.
 * @throws {Error} If the matrices' dimensions are incompatible for multiplication.
 */
async function multiplyMatrices(matrixA, matrixB, m, n, p) {
  if (matrixA.length !== m * n || matrixB.length !== n * p) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  // Load the WebAssembly module
  const wasmInstance = await loadWasm(path.resolve(__dirname, 'blas_lapack.wasm'));

  // Allocate memory for the matrices and result
  const memory = wasmInstance.exports.memory;
  const matrixASize = matrixA.length * Float64Array.BYTES_PER_ELEMENT;
  const matrixBSize = matrixB.length * Float64Array.BYTES_PER_ELEMENT;
  const resultSize = m * p * Float64Array.BYTES_PER_ELEMENT;
  const totalSize = matrixASize + matrixBSize + resultSize;

  const memoryBuffer = new Uint8Array(memory.buffer);
  const matrixAOffset = 0;
  const matrixBOffset = matrixASize;
  const resultOffset = matrixASize + matrixBSize;

  // Copy matrices into the WebAssembly memory
  memoryBuffer.set(new Uint8Array(matrixA.buffer), matrixAOffset);
  memoryBuffer.set(new Uint8Array(matrixB.buffer), matrixBOffset);

  // Perform the matrix multiplication
  wasmInstance.exports.multiply(matrixAOffset, matrixBOffset, resultOffset, m, n, p);

  // Extract the result from WebAssembly memory
  const resultBuffer = memoryBuffer.slice(resultOffset, resultOffset + resultSize);
  return new Float64Array(resultBuffer.buffer);
}

/**
 * Example usage of the WebAssembly matrix multiplication module.
 * @returns {Promise<void>} A promise that resolves when the example completes.
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

  const m = 2, n = 3, p = 2;

  try {
    const result = await multiplyMatrices(matrixA, matrixB, m, n, p);
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to run the example
// exampleUsage();

module.exports = {
  loadWasm,
  multiplyMatrices,
  exampleUsage
};