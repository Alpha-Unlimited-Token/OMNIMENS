/**
 * @module wasmMatrixOps
 * @description Accelerates matrix operations using WebAssembly for efficient computations.
 * This module implements a subset of BLAS (Basic Linear Algebra Subprograms) in WebAssembly
 * and exposes its functionality via JavaScript bindings.
 */

const fs = require('fs');
const path = require('path');

/**
 * Load and compile the WebAssembly module for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmFilePath = path.join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = fs.readFileSync(wasmFilePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @param {Float64Array} matrixA - The first matrix (flattened row-major order).
 * @param {Float64Array} matrixB - The second matrix (flattened row-major order).
 * @param {number} rowsA - Number of rows in the first matrix.
 * @param {number} colsA - Number of columns in the first matrix.
 * @param {number} colsB - Number of columns in the second matrix.
 * @returns {Float64Array} The resulting matrix (flattened row-major order).
 * @throws {Error} If the dimensions are incompatible for multiplication.
 */
async function wasmMatrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Invalid matrix dimensions for multiplication.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, matrix_multiply } = wasmInstance.exports;

  const inputOffsetA = 0;
  const inputOffsetB = matrixA.length * Float64Array.BYTES_PER_ELEMENT;
  const outputOffset = inputOffsetB + matrixB.length * Float64Array.BYTES_PER_ELEMENT;

  const memoryBuffer = new Float64Array(memory.buffer);

  memoryBuffer.set(matrixA, inputOffsetA / Float64Array.BYTES_PER_ELEMENT);
  memoryBuffer.set(matrixB, inputOffsetB / Float64Array.BYTES_PER_ELEMENT);

  matrix_multiply(inputOffsetA, inputOffsetB, outputOffset, rowsA, colsA, colsB);

  const result = new Float64Array(memory.buffer, outputOffset, rowsA * colsB);
  return new Float64Array(result);
}

/**
 * Exports the matrix multiplication function for use in other modules.
 */
module.exports = {
  wasmMatrixMultiply
};