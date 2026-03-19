// wasmMatrixOps.js

/**
 * wasmMatrixOps - High-performance matrix operations module using WebAssembly.
 * This module leverages WebAssembly to perform optimized matrix computations, such as matrix multiplication,
 * transposition, and similarity searches, for tasks like embeddings or AI workloads.
 *
 * @module wasmMatrixOps
 */

const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Load and compile the WebAssembly binary for matrix operations.
 * The WebAssembly module is expected to implement basic matrix operations.
 *
 * @returns {Promise<WebAssembly.Instance>} The compiled WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmPath = join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform matrix multiplication using the WebAssembly module.
 *
 * @param {Float32Array} matrixA - The first matrix (flat array).
 * @param {Float32Array} matrixB - The second matrix (flat array).
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA (must match rowsB).
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Float32Array} The resulting matrix (flat array).
 * @throws {Error} If dimensions are invalid or WebAssembly fails.
 */
async function multiplyMatrices(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Invalid matrix dimensions for multiplication.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, multiply_matrices } = wasmInstance.exports;

  // Allocate memory in WebAssembly for matrices and result
  const matrixAOffset = 0;
  const matrixBOffset = matrixA.length * 4; // Float32Array, 4 bytes per element
  const resultOffset = matrixBOffset + matrixB.length * 4;

  const wasmMemory = new Float32Array(memory.buffer);

  // Copy matrices into WebAssembly memory
  wasmMemory.set(matrixA, matrixAOffset / 4);
  wasmMemory.set(matrixB, matrixBOffset / 4);

  // Perform the matrix multiplication
  multiply_matrices(matrixAOffset, matrixBOffset, resultOffset, rowsA, colsA, colsB);

  // Extract the result matrix from WebAssembly memory
  const resultLength = rowsA * colsB;
  const resultMatrix = wasmMemory.subarray(resultOffset / 4, resultOffset / 4 + resultLength);

  return new Float32Array(resultMatrix);
}

/**
 * Transpose a matrix using the WebAssembly module.
 *
 * @param {Float32Array} matrix - The input matrix (flat array).
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Float32Array} The transposed matrix (flat array).
 * @throws {Error} If dimensions are invalid or WebAssembly fails.
 */
async function transposeMatrix(matrix, rows, cols) {
  if (matrix.length !== rows * cols) {
    throw new Error('Invalid matrix dimensions for transposition.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, transpose_matrix } = wasmInstance.exports;

  // Allocate memory in WebAssembly for matrix and result
  const matrixOffset = 0;
  const resultOffset = matrix.length * 4; // Float32Array, 4 bytes per element

  const wasmMemory = new Float32Array(memory.buffer);

  // Copy matrix into WebAssembly memory
  wasmMemory.set(matrix, matrixOffset / 4);

  // Perform the matrix transposition
  transpose_matrix(matrixOffset, resultOffset, rows, cols);

  // Extract the transposed matrix from WebAssembly memory
  const resultLength = rows * cols;
  const resultMatrix = wasmMemory.subarray(resultOffset / 4, resultOffset / 4 + resultLength);

  return new Float32Array(resultMatrix);
}

/**
 * Calculate cosine similarity between two vectors using the WebAssembly module.
 *
 * @param {Float32Array} vectorA - The first vector.
 * @param {Float32Array} vectorB - The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 * @throws {Error} If vector lengths are mismatched or WebAssembly fails.
 */
async function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length for cosine similarity.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, cosine_similarity } = wasmInstance.exports;

  // Allocate memory in WebAssembly for vectors
  const vectorAOffset = 0;
  const vectorBOffset = vectorA.length * 4; // Float32Array, 4 bytes per element

  const wasmMemory = new Float32Array(memory.buffer);

  // Copy vectors into WebAssembly memory
  wasmMemory.set(vectorA, vectorAOffset / 4);
  wasmMemory.set(vectorB, vectorBOffset / 4);

  // Calculate cosine similarity
  const similarity = cosine_similarity(vectorAOffset, vectorBOffset, vectorA.length);

  return similarity;
}

export { multiplyMatrices, transposeMatrix, cosineSimilarity };