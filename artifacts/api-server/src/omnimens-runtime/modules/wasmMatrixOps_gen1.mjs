// wasmMatrixOps.js

/**
 * @module wasmMatrixOps
 * @description Perform high-dimensional matrix operations efficiently using WebAssembly in Node.js.
 */

const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Load and compile the WebAssembly binary for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} - The compiled WebAssembly instance.
 */
async function loadWasm() {
  const wasmPath = join(__dirname, 'matrix_ops.wasm');
  const wasmBinary = readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBinary);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Multiply two matrices using WebAssembly.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} - The resulting matrix after multiplication.
 * @throws {Error} - If matrices are incompatible for multiplication.
 */
async function multiplyMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const wasmInstance = await loadWasm();
  const { memory, multiply } = wasmInstance.exports;

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();

  const bufferA = new Float64Array(memory.buffer, 0, flatA.length);
  const bufferB = new Float64Array(memory.buffer, flatA.length * 8, flatB.length);
  const bufferC = new Float64Array(memory.buffer, flatA.length * 8 + flatB.length * 8, rowsA * colsB);

  bufferA.set(flatA);
  bufferB.set(flatB);

  multiply(rowsA, colsA, colsB);

  const result = [];
  for (let i = 0; i < rowsA; i++) {
    result.push(bufferC.slice(i * colsB, (i + 1) * colsB));
  }

  return result;
}

/**
 * Compute the eigenvalues of a square matrix using WebAssembly.
 * @param {number[][]} matrix - The square matrix.
 * @returns {Promise<number[]>} - The eigenvalues of the matrix.
 * @throws {Error} - If the matrix is not square.
 */
async function computeEigenvalues(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  if (rows !== cols) {
    throw new Error('Matrix must be square to compute eigenvalues.');
  }

  const wasmInstance = await loadWasm();
  const { memory, eigenvalues } = wasmInstance.exports;

  const flatMatrix = matrix.flat();
  const bufferMatrix = new Float64Array(memory.buffer, 0, flatMatrix.length);
  const bufferEigenvalues = new Float64Array(memory.buffer, flatMatrix.length * 8, rows);

  bufferMatrix.set(flatMatrix);

  eigenvalues(rows);

  return Array.from(bufferEigenvalues);
}

export { multiplyMatrices, computeEigenvalues };