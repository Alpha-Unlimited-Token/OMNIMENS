/**
 * @module matrixOpsWasm
 * @description A WebAssembly-based utility module for efficient matrix operations in Node.js, leveraging optimized linear algebra routines.
 */

const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Loads a WebAssembly module from a specified file path.
 * @param {string} wasmFilePath - The relative path to the WebAssembly binary file.
 * @returns {Promise<WebAssembly.Instance>} A promise resolving to the WebAssembly instance.
 * @throws {Error} If the file cannot be read or the WebAssembly module fails to instantiate.
 */
async function loadWasmModule(wasmFilePath) {
  try {
    const wasmBuffer = readFileSync(join(__dirname, wasmFilePath));
    const wasmModule = await WebAssembly.instantiate(wasmBuffer);
    return wasmModule.instance;
  } catch (error) {
    throw new Error(`Failed to load WebAssembly module: ${error.message}`);
  }
}

/**
 * Multiplies two matrices using the WebAssembly module.
 * @param {Float64Array} matrixA - The first matrix in row-major order.
 * @param {Float64Array} matrixB - The second matrix in row-major order.
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA (and rows in matrixB).
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Float64Array} The resulting matrix in row-major order.
 * @throws {Error} If the matrices' dimensions are incompatible.
 */
async function multiplyMatrices(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match the provided sizes.');
  }

  const wasmInstance = await loadWasmModule('./matrix_ops.wasm');

  const { memory, multiply } = wasmInstance.exports;

  const matrixAOffset = 0;
  const matrixBOffset = matrixA.length * Float64Array.BYTES_PER_ELEMENT;
  const resultOffset = matrixBOffset + matrixB.length * Float64Array.BYTES_PER_ELEMENT;

  const memoryView = new Float64Array(memory.buffer);
  memoryView.set(matrixA, matrixAOffset / Float64Array.BYTES_PER_ELEMENT);
  memoryView.set(matrixB, matrixBOffset / Float64Array.BYTES_PER_ELEMENT);

  multiply(matrixAOffset, matrixBOffset, resultOffset, rowsA, colsA, colsB);

  return new Float64Array(memory.buffer, resultOffset, rowsA * colsB);
}

/**
 * Adds two matrices element-wise using the WebAssembly module.
 * @param {Float64Array} matrixA - The first matrix in row-major order.
 * @param {Float64Array} matrixB - The second matrix in row-major order.
 * @returns {Float64Array} The resulting matrix in row-major order.
 * @throws {Error} If the matrices' dimensions do not match.
 */
async function addMatrices(matrixA, matrixB) {
  if (matrixA.length !== matrixB.length) {
    throw new Error('Matrices must have the same dimensions for addition.');
  }

  const wasmInstance = await loadWasmModule('./matrix_ops.wasm');

  const { memory, add } = wasmInstance.exports;

  const matrixAOffset = 0;
  const matrixBOffset = matrixA.length * Float64Array.BYTES_PER_ELEMENT;
  const resultOffset = matrixBOffset + matrixB.length * Float64Array.BYTES_PER_ELEMENT;

  const memoryView = new Float64Array(memory.buffer);
  memoryView.set(matrixA, matrixAOffset / Float64Array.BYTES_PER_ELEMENT);
  memoryView.set(matrixB, matrixBOffset / Float64Array.BYTES_PER_ELEMENT);

  add(matrixAOffset, matrixBOffset, resultOffset, matrixA.length);

  return new Float64Array(memory.buffer, resultOffset, matrixA.length);
}

module.exports = {
  loadWasmModule,
  multiplyMatrices,
  addMatrices
};