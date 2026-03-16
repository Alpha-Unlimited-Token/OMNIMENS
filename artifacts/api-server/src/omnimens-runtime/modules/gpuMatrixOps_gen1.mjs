/**
 * gpuMatrixOps - A WebAssembly-based linear algebra library optimized for Node.js.
 * This module utilizes WebAssembly to perform efficient parallel matrix operations,
 * leveraging the computational power of the GPU for high-performance linear algebra tasks.
 */

// Import the built-in Node.js WebAssembly module
const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Load and compile the WebAssembly module for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves with the WebAssembly instance.
 */
async function loadWasm() {
  const wasmPath = join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @param {number[][]} matrixA - The first matrix (2D array).
 * @param {number[][]} matrixB - The second matrix (2D array).
 * @returns {Promise<number[][]>} A promise that resolves with the resulting matrix.
 * @throws {Error} If matrices are not compatible for multiplication.
 */
async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions are not compatible for multiplication.');
  }

  const wasmInstance = await loadWasm();
  const { memory, multiply_matrices } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  // Flatten matrices into 1D arrays
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const resultSize = rowsA * colsB;
  const result = new Float64Array(resultSize);

  // Allocate memory in the WebAssembly module
  const offsetA = 0;
  const offsetB = offsetA + flatA.length * Float64Array.BYTES_PER_ELEMENT;
  const offsetResult = offsetB + flatB.length * Float64Array.BYTES_PER_ELEMENT;

  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(flatA, offsetA / Float64Array.BYTES_PER_ELEMENT);
  wasmMemory.set(flatB, offsetB / Float64Array.BYTES_PER_ELEMENT);

  // Perform the matrix multiplication
  multiply_matrices(offsetA, rowsA, colsA, offsetB, colsB, offsetResult);

  // Extract the result matrix from WebAssembly memory
  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(
      Array.from(result.subarray(i * colsB, (i + 1) * colsB))
    );
  }

  return resultMatrix;
}

module.exports = {
  multiplyMatrices
};