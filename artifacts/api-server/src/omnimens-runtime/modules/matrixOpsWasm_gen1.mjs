/**
 * @module matrixOpsWasm
 * @description A WebAssembly-powered utility module for efficient matrix operations, leveraging optimized linear algebra routines.
 */

const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Loads and initializes the WebAssembly module for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
async function initializeWasm() {
  const wasmPath = join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const instance = await WebAssembly.instantiate(wasmModule, {});
  return instance;
}

/**
 * Multiplies two matrices using WebAssembly.
 * @param {number[][]} matrixA - The first matrix (2D array).
 * @param {number[][]} matrixB - The second matrix (2D array).
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If matrices are incompatible for multiplication.
 */
async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const wasmInstance = await initializeWasm();
  const { memory, multiply_matrices } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  const matrixAFlat = matrixA.flat();
  const matrixBFlat = matrixB.flat();
  const resultFlat = new Float64Array(rowsA * colsB);

  const matrixAOffset = 0;
  const matrixBOffset = matrixAFlat.length * Float64Array.BYTES_PER_ELEMENT;
  const resultOffset = matrixBOffset + matrixBFlat.length * Float64Array.BYTES_PER_ELEMENT;

  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(matrixAFlat, matrixAOffset / Float64Array.BYTES_PER_ELEMENT);
  wasmMemory.set(matrixBFlat, matrixBOffset / Float64Array.BYTES_PER_ELEMENT);

  multiply_matrices(matrixAOffset, matrixBOffset, resultOffset, rowsA, colsA, colsB);

  const result = [];
  for (let i = 0; i < rowsA; i++) {
    result.push(resultFlat.slice(i * colsB, (i + 1) * colsB));
  }

  return result;
}

module.exports = {
  initializeWasm,
  multiplyMatrices
};