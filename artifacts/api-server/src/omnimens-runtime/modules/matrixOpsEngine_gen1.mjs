/**
 * matrixOpsEngine - A module for efficient matrix operations using WebAssembly.
 * 
 * This module provides fast matrix multiplication and vector operations leveraging WebAssembly's SIMD capabilities.
 * It is designed to be used in Node.js 20+ environments.
 * 
 * @module matrixOpsEngine
 */

const fs = require('fs');
const path = require('path');

/**
 * Load the WebAssembly binary file and initialize the module.
 * @async
 * @returns {Promise<WebAssembly.Instance>} The initialized WebAssembly instance.
 */
async function initializeWasm() {
  const wasmPath = path.resolve(__dirname, 'matrix_ops_engine.wasm');
  const wasmBinary = await fs.promises.readFile(wasmPath);
  const wasmModule = await WebAssembly.instantiate(wasmBinary);
  return wasmModule.instance;
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @async
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
  const { multiply_matrices } = wasmInstance.exports;

  // Flatten matrices for WebAssembly input
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  const flatMatrixA = matrixA.flat();
  const flatMatrixB = matrixB.flat();

  // Allocate memory in WebAssembly
  const memory = wasmInstance.exports.memory;
  const matrixAOffset = wasmInstance.exports.allocate(rowsA * colsA);
  const matrixBOffset = wasmInstance.exports.allocate(rowsB * colsB);
  const resultOffset = wasmInstance.exports.allocate(rowsA * colsB);

  const wasmMemory = new Float64Array(memory.buffer);

  // Copy matrices to WebAssembly memory
  wasmMemory.set(flatMatrixA, matrixAOffset / 8);
  wasmMemory.set(flatMatrixB, matrixBOffset / 8);

  // Perform multiplication
  multiply_matrices(matrixAOffset, matrixBOffset, resultOffset, rowsA, colsA, colsB);

  // Retrieve result from WebAssembly memory
  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    const row = wasmMemory.slice(resultOffset / 8 + i * colsB, resultOffset / 8 + (i + 1) * colsB);
    resultMatrix.push(Array.from(row));
  }

  // Free allocated memory
  wasmInstance.exports.free(matrixAOffset);
  wasmInstance.exports.free(matrixBOffset);
  wasmInstance.exports.free(resultOffset);

  return resultMatrix;
}

/**
 * Perform vector addition using WebAssembly.
 * @async
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {Promise<number[]>} The resulting vector after addition.
 * @throws {Error} If vectors are of different lengths.
 */
async function addVectors(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  const wasmInstance = await initializeWasm();
  const { add_vectors } = wasmInstance.exports;

  // Allocate memory in WebAssembly
  const memory = wasmInstance.exports.memory;
  const vectorAOffset = wasmInstance.exports.allocate(vectorA.length);
  const vectorBOffset = wasmInstance.exports.allocate(vectorB.length);
  const resultOffset = wasmInstance.exports.allocate(vectorA.length);

  const wasmMemory = new Float64Array(memory.buffer);

  // Copy vectors to WebAssembly memory
  wasmMemory.set(vectorA, vectorAOffset / 8);
  wasmMemory.set(vectorB, vectorBOffset / 8);

  // Perform addition
  add_vectors(vectorAOffset, vectorBOffset, resultOffset, vectorA.length);

  // Retrieve result from WebAssembly memory
  const resultVector = Array.from(wasmMemory.slice(resultOffset / 8, resultOffset / 8 + vectorA.length));

  // Free allocated memory
  wasmInstance.exports.free(vectorAOffset);
  wasmInstance.exports.free(vectorBOffset);
  wasmInstance.exports.free(resultOffset);

  return resultVector;
}

module.exports = {
  multiplyMatrices,
  addVectors
};