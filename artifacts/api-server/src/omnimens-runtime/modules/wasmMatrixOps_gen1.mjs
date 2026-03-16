/**
 * wasmMatrixOps - A utility module for efficient matrix operations using WebAssembly.
 *
 * This module provides high-performance linear algebra functions, such as dot product
 * and matrix multiplication, implemented in WebAssembly for numerical computations.
 *
 * @module wasmMatrixOps
 */

const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Load and compile WebAssembly module for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} - Compiled WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmFilePath = join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = readFileSync(wasmFilePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform dot product of two vectors.
 * @param {Float64Array} vecA - First vector.
 * @param {Float64Array} vecB - Second vector.
 * @returns {Promise<number>} - Dot product result.
 * @throws {Error} - If vectors have different lengths.
 */
async function dotProduct(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length for dot product.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, dot_product } = wasmInstance.exports;

  const offsetA = 0;
  const offsetB = vecA.length * Float64Array.BYTES_PER_ELEMENT;

  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(vecA, offsetA / Float64Array.BYTES_PER_ELEMENT);
  wasmMemory.set(vecB, offsetB / Float64Array.BYTES_PER_ELEMENT);

  return dot_product(offsetA, offsetB, vecA.length);
}

/**
 * Perform matrix multiplication.
 * @param {Float64Array} matA - First matrix (flattened row-major).
 * @param {Float64Array} matB - Second matrix (flattened row-major).
 * @param {number} rowsA - Number of rows in matA.
 * @param {number} colsA - Number of columns in matA.
 * @param {number} colsB - Number of columns in matB.
 * @returns {Promise<Float64Array>} - Result matrix (flattened row-major).
 * @throws {Error} - If dimensions are incompatible for multiplication.
 */
async function matrixMultiply(matA, matB, rowsA, colsA, colsB) {
  if (matA.length !== rowsA * colsA || matB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, matrix_multiply } = wasmInstance.exports;

  const offsetA = 0;
  const offsetB = matA.length * Float64Array.BYTES_PER_ELEMENT;
  const offsetC = offsetB + matB.length * Float64Array.BYTES_PER_ELEMENT;

  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(matA, offsetA / Float64Array.BYTES_PER_ELEMENT);
  wasmMemory.set(matB, offsetB / Float64Array.BYTES_PER_ELEMENT);

  matrix_multiply(offsetA, offsetB, offsetC, rowsA, colsA, colsB);

  return wasmMemory.slice(offsetC / Float64Array.BYTES_PER_ELEMENT, (offsetC + rowsA * colsB * Float64Array.BYTES_PER_ELEMENT) / Float64Array.BYTES_PER_ELEMENT);
}

module.exports = {
  dotProduct,
  matrixMultiply
};