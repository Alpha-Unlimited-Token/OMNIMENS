// wasmAcceleratedMatrixOps.js

/**
 * @module wasmAcceleratedMatrixOps
 * @description This module provides high-performance matrix operations using WebAssembly (Wasm) for tasks such as embedding similarity and neural computations.
 */

const { readFile } = require('fs/promises');
const path = require('path');

/**
 * Loads the WebAssembly binary and initializes the Wasm module.
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the initialized WebAssembly instance.
 */
async function initializeWasm() {
  const wasmPath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = await readFile(wasmPath);
  const wasmModule = await WebAssembly.instantiate(wasmBuffer);
  return wasmModule.instance;
}

/**
 * Multiplies two matrices using Wasm for high performance.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @param {WebAssembly.Instance} wasmInstance - The initialized Wasm instance.
 * @returns {number[][]} The resulting matrix after multiplication.
 * @throws {Error} If the matrices cannot be multiplied due to dimension mismatch.
 */
function multiplyMatrices(matrixA, matrixB, wasmInstance) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float64Array(rowsA * colsB);

  const { memory, multiply_matrices } = wasmInstance.exports;

  const aPtr = wasmInstance.exports.malloc(flatA.length * 8);
  const bPtr = wasmInstance.exports.malloc(flatB.length * 8);
  const resultPtr = wasmInstance.exports.malloc(result.length * 8);

  const memoryView = new Float64Array(memory.buffer);
  memoryView.set(flatA, aPtr / 8);
  memoryView.set(flatB, bPtr / 8);

  multiply_matrices(aPtr, bPtr, resultPtr, rowsA, colsA, colsB);

  result.set(memoryView.subarray(resultPtr / 8, resultPtr / 8 + result.length));

  wasmInstance.exports.free(aPtr);
  wasmInstance.exports.free(bPtr);
  wasmInstance.exports.free(resultPtr);

  const outputMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    outputMatrix.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return outputMatrix;
}

/**
 * Computes the dot product of two vectors using Wasm for high performance.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @param {WebAssembly.Instance} wasmInstance - The initialized Wasm instance.
 * @returns {number} The dot product of the two vectors.
 * @throws {Error} If the vectors have different lengths.
 */
function dotProduct(vectorA, vectorB, wasmInstance) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length for dot product.');
  }

  const flatA = new Float64Array(vectorA);
  const flatB = new Float64Array(vectorB);

  const { memory, dot_product } = wasmInstance.exports;

  const aPtr = wasmInstance.exports.malloc(flatA.length * 8);
  const bPtr = wasmInstance.exports.malloc(flatB.length * 8);

  const memoryView = new Float64Array(memory.buffer);
  memoryView.set(flatA, aPtr / 8);
  memoryView.set(flatB, bPtr / 8);

  const result = dot_product(aPtr, bPtr, flatA.length);

  wasmInstance.exports.free(aPtr);
  wasmInstance.exports.free(bPtr);

  return result;
}

module.exports = {
  initializeWasm,
  multiplyMatrices,
  dotProduct
};