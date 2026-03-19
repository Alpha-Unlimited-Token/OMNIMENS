// wasmMatrixOps.js

/**
 * @module wasmMatrixOps
 * @description This module provides efficient matrix operations using WebAssembly, including matrix multiplication and eigenvector computation.
 */

const fs = require('fs');
const path = require('path');

/**
 * WebAssembly binary loader for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} WebAssembly instance with exported matrix operations.
 */
async function loadWasm() {
  const wasmPath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmBinary = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBinary);
  const wasmInstance = await WebAssembly.instantiate(wasmModule);
  return wasmInstance;
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @param {Float64Array} matrixA - First matrix (m x n).
 * @param {Float64Array} matrixB - Second matrix (n x p).
 * @param {number} m - Rows in matrixA.
 * @param {number} n - Columns in matrixA / Rows in matrixB.
 * @param {number} p - Columns in matrixB.
 * @returns {Float64Array} Resulting matrix (m x p).
 */
async function wasmMatrixMultiply(matrixA, matrixB, m, n, p) {
  const wasmInstance = await loadWasm();
  const { memory, matrixMultiply } = wasmInstance.exports;

  const matrixASize = m * n * Float64Array.BYTES_PER_ELEMENT;
  const matrixBSize = n * p * Float64Array.BYTES_PER_ELEMENT;
  const resultSize = m * p * Float64Array.BYTES_PER_ELEMENT;

  const totalSize = matrixASize + matrixBSize + resultSize;

  const buffer = new ArrayBuffer(totalSize);
  const matrixAOffset = 0;
  const matrixBOffset = matrixASize;
  const resultOffset = matrixASize + matrixBSize;

  const matrixAView = new Float64Array(buffer, matrixAOffset, m * n);
  const matrixBView = new Float64Array(buffer, matrixBOffset, n * p);
  const resultView = new Float64Array(buffer, resultOffset, m * p);

  matrixAView.set(matrixA);
  matrixBView.set(matrixB);

  memory.set(buffer);

  matrixMultiply(matrixAOffset, matrixBOffset, resultOffset, m, n, p);

  return new Float64Array(memory.buffer, resultOffset, m * p);
}

/**
 * Compute eigenvectors using WebAssembly.
 * @param {Float64Array} matrix - Square matrix (n x n).
 * @param {number} n - Dimension of the square matrix.
 * @returns {Float64Array} Eigenvectors of the matrix.
 */
async function wasmEigenvectors(matrix, n) {
  const wasmInstance = await loadWasm();
  const { memory, computeEigenvectors } = wasmInstance.exports;

  const matrixSize = n * n * Float64Array.BYTES_PER_ELEMENT;
  const eigenvectorSize = n * n * Float64Array.BYTES_PER_ELEMENT;

  const totalSize = matrixSize + eigenvectorSize;

  const buffer = new ArrayBuffer(totalSize);
  const matrixOffset = 0;
  const eigenvectorOffset = matrixSize;

  const matrixView = new Float64Array(buffer, matrixOffset, n * n);
  const eigenvectorView = new Float64Array(buffer, eigenvectorOffset, n * n);

  matrixView.set(matrix);

  memory.set(buffer);

  computeEigenvectors(matrixOffset, eigenvectorOffset, n);

  return new Float64Array(memory.buffer, eigenvectorOffset, n * n);
}

module.exports = {
  wasmMatrixMultiply,
  wasmEigenvectors
};