/**
 * wasmMatrixOps: Perform efficient matrix operations and lightweight neural network inference using WebAssembly.
 * This module provides optimized matrix multiplication and basic linear algebra operations leveraging WebAssembly for CPU parallelism.
 * It is designed to enhance AI inference capabilities by enabling high-performance computations within Node.js environments.
 */

// Import WebAssembly utilities from Node.js
const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Load and compile the WebAssembly module for matrix operations.
 * The WASM binary is precompiled and stored as 'matrix_ops.wasm' in the same directory.
 * @returns {Promise<WebAssembly.Instance>} Compiled WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmPath = join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @param {number[][]} matrixA - The first matrix (2D array).
 * @param {number[][]} matrixB - The second matrix (2D array).
 * @returns {Promise<number[][]>} The result of the matrix multiplication.
 * @throws {Error} If input matrices are invalid or dimensions are incompatible.
 */
async function multiplyMatrices(matrixA, matrixB) {
  // Validate input matrices
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  // Flatten matrices for WASM input
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  // Load and execute the WASM module
  const wasmInstance = await loadWasmModule();
  const { memory, multiply } = wasmInstance.exports;

  // Allocate memory for input and output
  const offsetA = 0;
  const offsetB = offsetA + flatA.length * 4; // 4 bytes per float32
  const offsetC = offsetB + flatB.length * 4;
  const resultLength = rowsA * colsB;

  // Write data into WASM memory
  const wasmMemory = new Float32Array(memory.buffer);
  wasmMemory.set(flatA, offsetA / 4);
  wasmMemory.set(flatB, offsetB / 4);

  // Perform multiplication
  multiply(offsetA, offsetB, offsetC, rowsA, colsA, colsB);

  // Read the result from WASM memory
  const result = wasmMemory.slice(offsetC / 4, offsetC / 4 + resultLength);

  // Convert the flat result back to a 2D array
  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

/**
 * Example usage of the wasmMatrixOps module.
 * Demonstrates matrix multiplication.
 */
async function exampleUsage() {
  const matrixA = [
    [1, 2, 3],
    [4, 5, 6]
  ];
  const matrixB = [
    [7, 8],
    [9, 10],
    [11, 12]
  ];

  try {
    const result = await multiplyMatrices(matrixA, matrixB);
    console.log('Matrix Multiplication Result:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Uncomment to run the example
// exampleUsage();

module.exports = {
  loadWasmModule,
  multiplyMatrices
};