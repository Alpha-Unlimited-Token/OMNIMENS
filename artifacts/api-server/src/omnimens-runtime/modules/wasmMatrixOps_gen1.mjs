/**
 * wasmMatrixOps - A utility module for efficient matrix operations leveraging WebAssembly (Wasm) and SIMD for high-performance computations.
 * This module is designed for tasks such as embeddings, neural computations, and other matrix-intensive operations.
 * 
 * @module wasmMatrixOps
 */

const fs = require('fs');
const path = require('path');

/**
 * Loads and initializes the WebAssembly module for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} A promise resolving to the WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmFilePath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = fs.readFileSync(wasmFilePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule, {});
}

/**
 * Multiplies two matrices using WebAssembly for performance optimization.
 * @param {number[][]} matrixA - The first matrix (2D array).
 * @param {number[][]} matrixB - The second matrix (2D array).
 * @returns {Promise<number[][]>} A promise resolving to the resulting matrix after multiplication.
 * @throws {Error} Throws an error if the matrices are incompatible for multiplication.
 */
async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, multiply_matrices } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const resultLength = rowsA * colsB;
  const result = new Float32Array(resultLength);

  const memoryBuffer = new Float32Array(memory.buffer);
  const offsetA = 0;
  const offsetB = offsetA + flatA.length;
  const offsetResult = offsetB + flatB.length;

  memoryBuffer.set(flatA, offsetA);
  memoryBuffer.set(flatB, offsetB);

  multiply_matrices(offsetA, rowsA, colsA, offsetB, colsB, offsetResult);

  for (let i = 0; i < resultLength; i++) {
    result[i] = memoryBuffer[offsetResult + i];
  }

  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

/**
 * Computes the dot product of two vectors using WebAssembly for performance optimization.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {Promise<number>} A promise resolving to the dot product of the two vectors.
 * @throws {Error} Throws an error if the vectors are of different lengths.
 */
async function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length to compute dot product.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, dot_product } = wasmInstance.exports;

  const length = vectorA.length;

  const memoryBuffer = new Float32Array(memory.buffer);
  const offsetA = 0;
  const offsetB = offsetA + length;

  memoryBuffer.set(vectorA, offsetA);
  memoryBuffer.set(vectorB, offsetB);

  const result = dot_product(offsetA, offsetB, length);

  return result;
}

module.exports = {
  multiplyMatrices,
  dotProduct
};