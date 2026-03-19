/**
 * wasmMatrixOps - Efficient matrix operations using WebAssembly.
 *
 * This module compiles BLAS (Basic Linear Algebra Subprograms) into WebAssembly
 * and exposes JavaScript bindings for matrix multiplications, decompositions,
 * and other linear algebra operations.
 *
 * The goal is to provide high-performance matrix computations for advanced AI
 * tasks, leveraging WebAssembly's speed and portability.
 */

// Import Node.js built-in modules
const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Load and initialize the WebAssembly module.
 * @returns {Promise<WebAssembly.Instance>} - The initialized WebAssembly instance.
 */
async function initializeWasm() {
  const wasmFilePath = join(__dirname, 'blas.wasm');
  const wasmBinary = readFileSync(wasmFilePath);

  const wasmModule = await WebAssembly.compile(wasmBinary);
  const wasmInstance = await WebAssembly.instantiate(wasmModule);

  return wasmInstance;
}

/**
 * Perform matrix multiplication.
 * @param {Float64Array} A - The first matrix (flattened, row-major order).
 * @param {Float64Array} B - The second matrix (flattened, row-major order).
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A.
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Float64Array} - Resultant matrix (flattened, row-major order).
 */
async function matrixMultiply(A, B, rowsA, colsA, colsB) {
  const wasmInstance = await initializeWasm();
  const { memory, matrixMultiply } = wasmInstance.exports;

  // Allocate memory for input and output matrices
  const inputOffsetA = 0;
  const inputOffsetB = A.length * 8; // Float64Array uses 8 bytes per element
  const outputOffset = inputOffsetB + B.length * 8;

  const totalMemory = outputOffset + rowsA * colsB * 8;
  const wasmMemory = new Float64Array(memory.buffer, 0, totalMemory / 8);

  // Copy input matrices into WebAssembly memory
  wasmMemory.set(A, inputOffsetA / 8);
  wasmMemory.set(B, inputOffsetB / 8);

  // Perform matrix multiplication
  matrixMultiply(inputOffsetA, inputOffsetB, outputOffset, rowsA, colsA, colsB);

  // Extract and return the result matrix
  const result = new Float64Array(memory.buffer, outputOffset, rowsA * colsB);
  return result;
}

/**
 * Perform LU decomposition.
 * @param {Float64Array} matrix - The input matrix (flattened, row-major order).
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Object} - An object containing `L` (lower triangular matrix) and `U` (upper triangular matrix).
 */
async function luDecomposition(matrix, rows, cols) {
  const wasmInstance = await initializeWasm();
  const { memory, luDecomposition } = wasmInstance.exports;

  // Allocate memory for input and output matrices
  const inputOffset = 0;
  const outputOffsetL = matrix.length * 8;
  const outputOffsetU = outputOffsetL + rows * cols * 8;

  const totalMemory = outputOffsetU + rows * cols * 8;
  const wasmMemory = new Float64Array(memory.buffer, 0, totalMemory / 8);

  // Copy input matrix into WebAssembly memory
  wasmMemory.set(matrix, inputOffset / 8);

  // Perform LU decomposition
  luDecomposition(inputOffset, outputOffsetL, outputOffsetU, rows, cols);

  // Extract and return the result matrices
  const L = new Float64Array(memory.buffer, outputOffsetL, rows * cols);
  const U = new Float64Array(memory.buffer, outputOffsetU, rows * cols);

  return { L, U };
}

module.exports = {
  matrixMultiply,
  luDecomposition
};