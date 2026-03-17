/**
 * wasmMatrixOps - A WebAssembly-powered module for efficient high-dimensional matrix operations.
 * This module provides core linear algebra routines such as matrix multiplication and singular value decomposition (SVD).
 * It is designed for high performance and seamless integration with Node.js.
 */

const fs = require('fs');
const path = require('path');

/**
 * Load WebAssembly binary and compile it.
 * @returns {Promise<WebAssembly.Instance>} - The compiled WebAssembly instance.
 */
async function loadWasm() {
  const wasmPath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resultant matrix after multiplication.
 * @throws {Error} - If matrices are incompatible for multiplication.
 */
async function matrixMultiply(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const wasmInstance = await loadWasm();
  const { multiply } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();

  const resultBuffer = new Float64Array(rowsA * colsB);

  multiply(flatA, rowsA, colsA, flatB, colsB, resultBuffer);

  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(resultBuffer.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

/**
 * Perform Singular Value Decomposition (SVD) using WebAssembly.
 * @param {number[][]} matrix - Matrix to decompose.
 * @returns {Object} - Object containing U, S, and V matrices.
 * @throws {Error} - If matrix is not valid for SVD.
 */
async function singularValueDecomposition(matrix) {
  const wasmInstance = await loadWasm();
  const { svd } = wasmInstance.exports;

  const rows = matrix.length;
  const cols = matrix[0].length;

  const flatMatrix = matrix.flat();

  const uBuffer = new Float64Array(rows * rows);
  const sBuffer = new Float64Array(Math.min(rows, cols));
  const vBuffer = new Float64Array(cols * cols);

  svd(flatMatrix, rows, cols, uBuffer, sBuffer, vBuffer);

  const U = [];
  const S = Array.from(sBuffer);
  const V = [];

  for (let i = 0; i < rows; i++) {
    U.push(uBuffer.slice(i * rows, (i + 1) * rows));
  }

  for (let i = 0; i < cols; i++) {
    V.push(vBuffer.slice(i * cols, (i + 1) * cols));
  }

  return { U, S, V };
}

module.exports = {
  matrixMultiply,
  singularValueDecomposition
};