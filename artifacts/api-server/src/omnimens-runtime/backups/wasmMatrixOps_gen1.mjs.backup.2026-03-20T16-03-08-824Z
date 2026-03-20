/**
 * wasmMatrixOps - A utility module for efficient matrix operations using WebAssembly.
 *
 * This module provides functions for matrix multiplication and cosine similarity computation
 * leveraging WebAssembly for optimized performance.
 *
 * @module wasmMatrixOps
 */

/**
 * Initializes a WebAssembly instance with matrix operation capabilities.
 *
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
async function initializeWasm() {
  const wasmCode = new Uint8Array([
    // WebAssembly binary code for matrix multiplication and cosine similarity
    // This is placeholder binary data; replace with actual compiled WASM code.
    0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00
  ]);

  const wasmModule = await WebAssembly.compile(wasmCode);
  const wasmInstance = await WebAssembly.instantiate(wasmModule);

  return wasmInstance;
}

/**
 * Multiplies two matrices using WebAssembly.
 *
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 */
async function wasmMatrixMultiply(matrixA, matrixB) {
  const wasmInstance = await initializeWasm();

  // Validate input matrices
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  // Flatten matrices for WASM input
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();

  // Allocate memory and pass data to WASM
  const memory = wasmInstance.exports.memory;
  const buffer = new Uint8Array(memory.buffer);

  const offsetA = 0;
  const offsetB = flatA.length;
  buffer.set(flatA, offsetA);
  buffer.set(flatB, offsetB);

  // Perform matrix multiplication in WASM
  const resultOffset = wasmInstance.exports.matrixMultiply(offsetA, offsetB, matrixA.length, matrixB[0].length);

  // Extract result from WASM memory
  const resultSize = matrixA.length * matrixB[0].length;
  const result = buffer.slice(resultOffset, resultOffset + resultSize);

  // Reshape result into 2D array
  const outputMatrix = [];
  for (let i = 0; i < matrixA.length; i++) {
    outputMatrix.push(result.slice(i * matrixB[0].length, (i + 1) * matrixB[0].length));
  }

  return outputMatrix;
}

/**
 * Computes cosine similarity between two vectors using WebAssembly.
 *
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {Promise<number>} The cosine similarity between the two vectors.
 */
async function wasmCosineSimilarity(vectorA, vectorB) {
  const wasmInstance = await initializeWasm();

  // Validate input vectors
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length for cosine similarity.');
  }

  // Flatten vectors for WASM input
  const flatA = Float32Array.from(vectorA);
  const flatB = Float32Array.from(vectorB);

  // Allocate memory and pass data to WASM
  const memory = wasmInstance.exports.memory;
  const buffer = new Float32Array(memory.buffer);

  const offsetA = 0;
  const offsetB = flatA.length;
  buffer.set(flatA, offsetA);
  buffer.set(flatB, offsetB);

  // Perform cosine similarity computation in WASM
  const similarity = wasmInstance.exports.cosineSimilarity(offsetA, offsetB, vectorA.length);

  return similarity;
}

export { wasmMatrixMultiply, wasmCosineSimilarity };