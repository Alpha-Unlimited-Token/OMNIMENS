/**
 * wasmMatrixOps: A utility module for efficient matrix operations and neural computations using WebAssembly.
 * This module implements BLAS-like operations such as matrix multiplication and eigen decomposition, exposing them to Node.js environments.
 * It leverages WebAssembly for performance-critical computations and handles edge cases gracefully.
 */

/**
 * @module wasmMatrixOps
 */

const fs = require('fs');
const path = require('path');

/**
 * Loads the WebAssembly module for matrix operations.
 * @async
 * @returns {Promise<WebAssembly.Instance>} The WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmPath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmBinary = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.instantiate(wasmBinary);
  return wasmModule.instance;
}

/**
 * Multiplies two matrices using WebAssembly.
 * @async
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If matrices are incompatible for multiplication.
 */
async function wasmMatrixMultiply(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix multiplication error: Columns of matrixA must match rows of matrixB.');
  }

  const wasm = await loadWasmModule();
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float64Array(rowsA * colsB);

  const memory = wasm.exports.memory;
  const buffer = new Uint8Array(memory.buffer);

  const offsetA = 0;
  const offsetB = offsetA + flatA.length * 8;
  const offsetResult = offsetB + flatB.length * 8;

  buffer.set(new Uint8Array(new Float64Array(flatA).buffer), offsetA);
  buffer.set(new Uint8Array(new Float64Array(flatB).buffer), offsetB);

  wasm.exports.matrixMultiply(offsetA, rowsA, colsA, offsetB, colsB, offsetResult);

  return Array.from({ length: rowsA }, (_, i) => 
    Array.from(result.slice(i * colsB, (i + 1) * colsB))
  );
}

/**
 * Computes the eigenvalues of a square matrix using WebAssembly.
 * @async
 * @param {number[][]} matrix - The square matrix.
 * @returns {Promise<number[]>} The eigenvalues of the matrix.
 * @throws {Error} If the matrix is not square.
 */
async function wasmEigenDecomposition(matrix) {
  if (matrix.length !== matrix[0].length) {
    throw new Error('Eigen decomposition error: Matrix must be square.');
  }

  const wasm = await loadWasmModule();
  const size = matrix.length;
  const flatMatrix = matrix.flat();
  const eigenvalues = new Float64Array(size);

  const memory = wasm.exports.memory;
  const buffer = new Uint8Array(memory.buffer);

  const offsetMatrix = 0;
  const offsetEigenvalues = offsetMatrix + flatMatrix.length * 8;

  buffer.set(new Uint8Array(new Float64Array(flatMatrix).buffer), offsetMatrix);

  wasm.exports.eigenDecomposition(offsetMatrix, size, offsetEigenvalues);

  return Array.from(eigenvalues);
}

module.exports = {
  wasmMatrixMultiply,
  wasmEigenDecomposition
};