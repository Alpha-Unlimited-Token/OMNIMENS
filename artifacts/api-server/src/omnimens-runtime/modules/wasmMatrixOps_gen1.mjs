// wasmMatrixOps.js

/**
 * @module wasmMatrixOps
 * @description This module enables GPU-like acceleration for matrix operations in Node.js using WebAssembly-based SIMD parallelization.
 */

const fs = require('fs');
const path = require('path');

/**
 * @function compileWasmModule
 * @description Compiles the WebAssembly module from binary.
 * @returns {Promise<WebAssembly.Instance>} The compiled WebAssembly instance.
 */
async function compileWasmModule() {
  const wasmPath = path.join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * @function multiplyMatrices
 * @description Multiplies two matrices using SIMD acceleration.
 * @param {Float32Array} matrixA - The first matrix in row-major order.
 * @param {Float32Array} matrixB - The second matrix in row-major order.
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A.
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Float32Array} The resulting matrix in row-major order.
 * @throws {Error} If matrices are incompatible for multiplication.
 */
async function multiplyMatrices(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const wasmInstance = await compileWasmModule();
  const { memory, multiply } = wasmInstance.exports;

  const resultBuffer = new Float32Array(rowsA * colsB);

  // Allocate memory in the WebAssembly module
  const matrixAOffset = memory.allocate(matrixA.length * 4);
  const matrixBOffset = memory.allocate(matrixB.length * 4);
  const resultOffset = memory.allocate(resultBuffer.length * 4);

  // Copy matrices into WebAssembly memory
  new Float32Array(memory.buffer, matrixAOffset, matrixA.length).set(matrixA);
  new Float32Array(memory.buffer, matrixBOffset, matrixB.length).set(matrixB);

  // Perform multiplication
  multiply(matrixAOffset, matrixBOffset, resultOffset, rowsA, colsA, colsB);

  // Retrieve the result
  resultBuffer.set(new Float32Array(memory.buffer, resultOffset, resultBuffer.length));

  // Free allocated memory
  memory.free(matrixAOffset);
  memory.free(matrixBOffset);
  memory.free(resultOffset);

  return resultBuffer;
}

/**
 * @function addMatrices
 * @description Adds two matrices element-wise using SIMD acceleration.
 * @param {Float32Array} matrixA - The first matrix in row-major order.
 * @param {Float32Array} matrixB - The second matrix in row-major order.
 * @returns {Float32Array} The resulting matrix in row-major order.
 * @throws {Error} If matrices are of different sizes.
 */
async function addMatrices(matrixA, matrixB) {
  if (matrixA.length !== matrixB.length) {
    throw new Error('Matrices must be of the same size for addition.');
  }

  const wasmInstance = await compileWasmModule();
  const { memory, add } = wasmInstance.exports;

  const resultBuffer = new Float32Array(matrixA.length);

  // Allocate memory in the WebAssembly module
  const matrixAOffset = memory.allocate(matrixA.length * 4);
  const matrixBOffset = memory.allocate(matrixB.length * 4);
  const resultOffset = memory.allocate(resultBuffer.length * 4);

  // Copy matrices into WebAssembly memory
  new Float32Array(memory.buffer, matrixAOffset, matrixA.length).set(matrixA);
  new Float32Array(memory.buffer, matrixBOffset, matrixB.length).set(matrixB);

  // Perform addition
  add(matrixAOffset, matrixBOffset, resultOffset, matrixA.length);

  // Retrieve the result
  resultBuffer.set(new Float32Array(memory.buffer, resultOffset, resultBuffer.length));

  // Free allocated memory
  memory.free(matrixAOffset);
  memory.free(matrixBOffset);
  memory.free(resultOffset);

  return resultBuffer;
}

module.exports = {
  multiplyMatrices,
  addMatrices
};