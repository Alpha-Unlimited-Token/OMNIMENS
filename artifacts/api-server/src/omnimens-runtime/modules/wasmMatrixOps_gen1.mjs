/**
 * wasmMatrixOps - A WebAssembly-powered module for efficient matrix operations.
 * @module wasmMatrixOps
 * @description Provides GPU-like performance for linear algebra operations in Node.js.
 */

const fs = require('fs');
const path = require('path');

/**
 * Load and compile WebAssembly binary.
 * @async
 * @returns {WebAssembly.Instance} The compiled WebAssembly instance.
 */
async function loadWasm() {
  const wasmPath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return new WebAssembly.Instance(wasmModule);
}

/**
 * Perform matrix multiplication.
 * @async
 * @param {number[][]} matrixA - First matrix (2D array).
 * @param {number[][]} matrixB - Second matrix (2D array).
 * @returns {number[][]} Resultant matrix after multiplication.
 * @throws {Error} If matrices cannot be multiplied due to dimension mismatch.
 */
async function matrixMultiply(matrixA, matrixB) {
  const wasmInstance = await loadWasm();

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not allow multiplication.');
  }

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();

  const resultBuffer = new Float64Array(rowsA * colsB);

  wasmInstance.exports.matrixMultiply(
    flatA, rowsA, colsA,
    flatB, rowsB, colsB,
    resultBuffer
  );

  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(resultBuffer.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

/**
 * Compute eigenvalues and eigenvectors of a matrix.
 * @async
 * @param {number[][]} matrix - Input square matrix (2D array).
 * @returns {{eigenvalues: number[], eigenvectors: number[][]}} Eigenvalues and eigenvectors of the matrix.
 * @throws {Error} If the matrix is not square.
 */
async function eigenDecomposition(matrix) {
  const wasmInstance = await loadWasm();

  const rows = matrix.length;
  const cols = matrix[0].length;

  if (rows !== cols) {
    throw new Error('Matrix must be square for eigenvalue decomposition.');
  }

  const flatMatrix = matrix.flat();

  const eigenvaluesBuffer = new Float64Array(rows);
  const eigenvectorsBuffer = new Float64Array(rows * rows);

  wasmInstance.exports.eigenDecomposition(
    flatMatrix, rows, cols,
    eigenvaluesBuffer,
    eigenvectorsBuffer
  );

  const eigenvectorsMatrix = [];
  for (let i = 0; i < rows; i++) {
    eigenvectorsMatrix.push(eigenvectorsBuffer.slice(i * rows, (i + 1) * rows));
  }

  return {
    eigenvalues: Array.from(eigenvaluesBuffer),
    eigenvectors: eigenvectorsMatrix
  };
}

module.exports = {
  matrixMultiply,
  eigenDecomposition
};