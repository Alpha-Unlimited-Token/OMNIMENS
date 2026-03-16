/**
 * wasmMatrixOps - A WebAssembly-powered utility module for high-performance matrix operations.
 * 
 * This module provides matrix multiplication, vector similarity, and other linear algebra operations
 * implemented using WebAssembly for speed and efficiency. It is designed to work in Node.js 20+ environments
 * without external dependencies.
 */

const fs = require('fs');
const path = require('path');

/**
 * Load and compile the WebAssembly module.
 * @returns {Promise<WebAssembly.Instance>} The compiled WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmFilePath = path.join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = fs.readFileSync(wasmFilePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 */
async function matrixMultiply(matrixA, matrixB) {
  const wasmInstance = await loadWasmModule();
  const { multiplyMatrices } = wasmInstance.exports;

  // Flatten matrices into 1D arrays for WASM compatibility
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  // Allocate memory in WASM module
  const aPtr = multiplyMatrices.allocate(flatA.length);
  const bPtr = multiplyMatrices.allocate(flatB.length);
  const resultPtr = multiplyMatrices.allocate(rowsA * colsB);

  // Copy data to WASM memory
  multiplyMatrices.setMemory(aPtr, flatA);
  multiplyMatrices.setMemory(bPtr, flatB);

  // Perform multiplication
  multiplyMatrices.execute(aPtr, bPtr, resultPtr, rowsA, colsA, colsB);

  // Retrieve result from WASM memory
  const resultFlat = multiplyMatrices.getMemory(resultPtr, rowsA * colsB);

  // Free allocated memory
  multiplyMatrices.free(aPtr);
  multiplyMatrices.free(bPtr);
  multiplyMatrices.free(resultPtr);

  // Convert flat result back into 2D array
  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(resultFlat.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

/**
 * Compute cosine similarity between two vectors using WebAssembly.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {Promise<number>} The cosine similarity between the two vectors.
 */
async function cosineSimilarity(vectorA, vectorB) {
  const wasmInstance = await loadWasmModule();
  const { computeCosineSimilarity } = wasmInstance.exports;

  // Allocate memory in WASM module
  const aPtr = computeCosineSimilarity.allocate(vectorA.length);
  const bPtr = computeCosineSimilarity.allocate(vectorB.length);

  // Copy data to WASM memory
  computeCosineSimilarity.setMemory(aPtr, vectorA);
  computeCosineSimilarity.setMemory(bPtr, vectorB);

  // Compute cosine similarity
  const similarity = computeCosineSimilarity.execute(aPtr, bPtr, vectorA.length);

  // Free allocated memory
  computeCosineSimilarity.free(aPtr);
  computeCosineSimilarity.free(bPtr);

  return similarity;
}

module.exports = {
  matrixMultiply,
  cosineSimilarity
};