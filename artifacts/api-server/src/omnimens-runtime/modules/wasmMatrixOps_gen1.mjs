/**
 * wasmMatrixOps - A module for efficient matrix operations and parallel computation using WebAssembly.
 * This module enables high-performance linear algebra computations by leveraging WebAssembly (WASM) for parallelized execution.
 */

const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Load and compile the WebAssembly module.
 * @returns {Promise<WebAssembly.Instance>} A promise resolving to the WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmPath = join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Multiply two matrices using WebAssembly.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If matrices are incompatible for multiplication.
 */
async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not allow multiplication. Columns of A must match rows of B.');
  }

  const wasmInstance = await loadWasmModule();
  const { multiply } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  // Flatten matrices into 1D arrays for WebAssembly compatibility
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float64Array(rowsA * colsB);

  multiply(flatA, flatB, result, rowsA, colsA, colsB);

  // Convert the result back into a 2D array
  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(Array.from(result.slice(i * colsB, (i + 1) * colsB)));
  }

  return resultMatrix;
}

/**
 * Transpose a matrix using WebAssembly.
 * @param {number[][]} matrix - The matrix to be transposed.
 * @returns {Promise<number[][]>} The transposed matrix.
 */
async function transposeMatrix(matrix) {
  const wasmInstance = await loadWasmModule();
  const { transpose } = wasmInstance.exports;

  const rows = matrix.length;
  const cols = matrix[0].length;
  const flatMatrix = matrix.flat();
  const result = new Float64Array(rows * cols);

  transpose(flatMatrix, result, rows, cols);

  // Convert the result back into a 2D array
  const transposedMatrix = [];
  for (let i = 0; i < cols; i++) {
    transposedMatrix.push(Array.from(result.slice(i * rows, (i + 1) * rows)));
  }

  return transposedMatrix;
}

/**
 * Add two matrices using WebAssembly.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The resulting matrix after addition.
 * @throws {Error} If matrices are not of the same dimensions.
 */
async function addMatrices(matrixA, matrixB) {
  if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
    throw new Error('Matrix dimensions must match for addition.');
  }

  const wasmInstance = await loadWasmModule();
  const { add } = wasmInstance.exports;

  const rows = matrixA.length;
  const cols = matrixA[0].length;
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float64Array(rows * cols);

  add(flatA, flatB, result, rows, cols);

  // Convert the result back into a 2D array
  const resultMatrix = [];
  for (let i = 0; i < rows; i++) {
    resultMatrix.push(Array.from(result.slice(i * cols, (i + 1) * cols)));
  }

  return resultMatrix;
}

module.exports = {
  multiplyMatrices,
  transposeMatrix,
  addMatrices
};