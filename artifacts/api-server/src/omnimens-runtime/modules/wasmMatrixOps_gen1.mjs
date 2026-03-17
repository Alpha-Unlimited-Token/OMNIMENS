/**
 * wasmMatrixOps - A WebAssembly-powered module for efficient matrix operations.
 * This module leverages WebAssembly SIMD for GPU-like parallelism in matrix operations, 
 * enabling high-performance embedding manipulation and similarity search.
 * 
 * @module wasmMatrixOps
 */

const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Load and compile the WebAssembly module for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmFilePath = join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = readFileSync(wasmFilePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform a matrix multiplication using WebAssembly.
 * @param {Float32Array} matrixA - The first matrix (flattened, row-major order).
 * @param {Float32Array} matrixB - The second matrix (flattened, row-major order).
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA.
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Float32Array} The resulting matrix (flattened, row-major order).
 * @throws {Error} If dimensions are incompatible for multiplication.
 */
async function multiplyMatrices(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match the specified sizes.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, multiply_matrices } = wasmInstance.exports;

  const matrixAOffset = 0;
  const matrixBOffset = matrixAOffset + matrixA.length * 4;
  const resultOffset = matrixBOffset + matrixB.length * 4;

  const wasmMemory = new Float32Array(memory.buffer);
  wasmMemory.set(matrixA, matrixAOffset / 4);
  wasmMemory.set(matrixB, matrixBOffset / 4);

  multiply_matrices(matrixAOffset, matrixBOffset, resultOffset, rowsA, colsA, colsB);

  return new Float32Array(memory.buffer, resultOffset, rowsA * colsB);
}

/**
 * Compute cosine similarity between two vectors.
 * @param {Float32Array} vectorA - The first vector.
 * @param {Float32Array} vectorB - The second vector.
 * @returns {number} The cosine similarity between vectorA and vectorB.
 * @throws {Error} If vectors are of different lengths.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] ** 2;
    normB += vectorB[i] ** 2;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
  multiplyMatrices,
  cosineSimilarity
};