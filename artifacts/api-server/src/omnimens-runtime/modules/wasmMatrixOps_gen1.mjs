/**
 * wasmMatrixOps Module
 * Purpose: Enable GPU-accelerated matrix operations in Node.js using WebAssembly for computational tasks.
 * This module provides efficient matrix multiplication and basic matrix operations leveraging WebAssembly.
 * The implementation avoids external dependencies and uses Node.js's built-in capabilities to load and execute WebAssembly.
 */

const fs = require('fs');
const path = require('path');

/**
 * Load a WebAssembly binary file and compile it.
 * @param {string} filePath - Path to the WebAssembly binary file.
 * @returns {Promise<WebAssembly.Instance>} - A promise that resolves to the WebAssembly instance.
 */
async function loadWasm(filePath) {
  const wasmBuffer = fs.readFileSync(filePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule, {});
}

/**
 * Multiply two matrices using WebAssembly.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {Promise<number[][]>} - A promise that resolves to the resulting matrix product.
 * @throws {Error} - Throws an error if matrices cannot be multiplied due to dimension mismatch.
 */
async function multiplyMatrices(matrixA, matrixB) {
  // Validate matrices dimensions
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix multiplication not possible: Columns of A must match rows of B.');
  }

  // Load WebAssembly module
  const wasmPath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmInstance = await loadWasm(wasmPath);

  const { matrixMultiply } = wasmInstance.exports;

  // Flatten matrices into 1D arrays for WebAssembly
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const resultSize = rowsA * colsB;
  const result = new Float64Array(resultSize);

  // Call the WebAssembly function
  matrixMultiply(flatA, rowsA, colsA, flatB, rowsB, colsB, result);

  // Convert the result back to 2D array
  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

/**
 * Add two matrices element-wise.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - The resulting matrix after addition.
 * @throws {Error} - Throws an error if matrices dimensions do not match.
 */
function addMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Matrix addition not possible: Matrices must have the same dimensions.');
  }

  const result = [];
  for (let i = 0; i < rowsA; i++) {
    const row = [];
    for (let j = 0; j < colsA; j++) {
      row.push(matrixA[i][j] + matrixB[i][j]);
    }
    result.push(row);
  }

  return result;
}

/**
 * Subtract two matrices element-wise.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - The resulting matrix after subtraction.
 * @throws {Error} - Throws an error if matrices dimensions do not match.
 */
function subtractMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Matrix subtraction not possible: Matrices must have the same dimensions.');
  }

  const result = [];
  for (let i = 0; i < rowsA; i++) {
    const row = [];
    for (let j = 0; j < colsA; j++) {
      row.push(matrixA[i][j] - matrixB[i][j]);
    }
    result.push(row);
  }

  return result;
}

module.exports = {
  multiplyMatrices,
  addMatrices,
  subtractMatrices
};