/**
 * @module webAssemblyMatrixOps
 * @description Provides efficient matrix and numerical operations using WebAssembly for optimized performance in JavaScript.
 */

const fs = require('fs');
const path = require('path');

/**
 * Compiles and initializes the WebAssembly module for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} A promise resolving to the WebAssembly instance.
 */
async function initializeWasm() {
  const wasmPath = path.join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const wasmInstance = await WebAssembly.instantiate(wasmModule, {});
  return wasmInstance;
}

/**
 * Multiplies two matrices using WebAssembly for optimized performance.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} A promise resolving to the resulting matrix.
 * @throws {Error} Throws if matrices are incompatible for multiplication.
 */
async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const wasmInstance = await initializeWasm();
  const { memory, multiply_matrices } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  const buffer = new Float64Array(memory.buffer);
  const offsetA = 0;
  const offsetB = rowsA * colsA;
  const offsetC = offsetB + colsA * colsB;

  let index = 0;
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsA; j++) {
      buffer[offsetA + index++] = matrixA[i][j];
    }
  }

  index = 0;
  for (let i = 0; i < colsA; i++) {
    for (let j = 0; j < colsB; j++) {
      buffer[offsetB + index++] = matrixB[i][j];
    }
  }

  multiply_matrices(offsetA, offsetB, offsetC, rowsA, colsA, colsB);

  const result = [];
  index = 0;
  for (let i = 0; i < rowsA; i++) {
    const row = [];
    for (let j = 0; j < colsB; j++) {
      row.push(buffer[offsetC + index++]);
    }
    result.push(row);
  }

  return result;
}

/**
 * Inverts a square matrix using WebAssembly for optimized performance.
 * @param {number[][]} matrix - The matrix to invert.
 * @returns {Promise<number[][]>} A promise resolving to the inverted matrix.
 * @throws {Error} Throws if the matrix is not square or inversion fails.
 */
async function invertMatrix(matrix) {
  if (matrix.length !== matrix[0].length) {
    throw new Error('Matrix must be square to invert.');
  }

  const wasmInstance = await initializeWasm();
  const { memory, invert_matrix } = wasmInstance.exports;

  const size = matrix.length;
  const buffer = new Float64Array(memory.buffer);
  const offsetMatrix = 0;
  const offsetResult = size * size;

  let index = 0;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      buffer[offsetMatrix + index++] = matrix[i][j];
    }
  }

  const success = invert_matrix(offsetMatrix, offsetResult, size);
  if (!success) {
    throw new Error('Matrix inversion failed (likely singular matrix).');
  }

  const result = [];
  index = 0;
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      row.push(buffer[offsetResult + index++]);
    }
    result.push(row);
  }

  return result;
}

module.exports = {
  multiplyMatrices,
  invertMatrix
};