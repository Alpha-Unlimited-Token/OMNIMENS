/**
 * @module webAssemblyMatrixOps
 * @description A WebAssembly-powered matrix operations library for efficient AI computations in Node.js.
 */

const fs = require('fs');
const path = require('path');

/**
 * Loads and compiles the WebAssembly module for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} The compiled WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmPath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Multiplies two matrices using WebAssembly.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If the matrices cannot be multiplied due to dimension mismatch.
 */
async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not allow multiplication.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, multiply } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  const inputSizeA = rowsA * colsA;
  const inputSizeB = colsA * colsB;
  const outputSize = rowsA * colsB;

  const memoryView = new Float64Array(memory.buffer);

  // Allocate memory for input and output matrices
  const offsetA = 0;
  const offsetB = offsetA + inputSizeA;
  const offsetC = offsetB + inputSizeB;

  // Flatten and copy matrixA into memory
  matrixA.flat().forEach((value, index) => {
    memoryView[offsetA + index] = value;
  });

  // Flatten and copy matrixB into memory
  matrixB.flat().forEach((value, index) => {
    memoryView[offsetB + index] = value;
  });

  // Perform matrix multiplication
  multiply(offsetA, rowsA, colsA, offsetB, colsB, offsetC);

  // Retrieve the result matrix
  const result = [];
  for (let i = 0; i < rowsA; i++) {
    const row = [];
    for (let j = 0; j < colsB; j++) {
      row.push(memoryView[offsetC + i * colsB + j]);
    }
    result.push(row);
  }

  return result;
}

/**
 * Transposes a matrix using WebAssembly.
 * @param {number[][]} matrix - The matrix to transpose.
 * @returns {Promise<number[][]>} The transposed matrix.
 */
async function transposeMatrix(matrix) {
  const wasmInstance = await loadWasmModule();
  const { memory, transpose } = wasmInstance.exports;

  const rows = matrix.length;
  const cols = matrix[0].length;

  const inputSize = rows * cols;
  const outputSize = cols * rows;

  const memoryView = new Float64Array(memory.buffer);

  // Allocate memory for input and output matrices
  const offsetInput = 0;
  const offsetOutput = offsetInput + inputSize;

  // Flatten and copy matrix into memory
  matrix.flat().forEach((value, index) => {
    memoryView[offsetInput + index] = value;
  });

  // Perform matrix transposition
  transpose(offsetInput, rows, cols, offsetOutput);

  // Retrieve the result matrix
  const result = [];
  for (let i = 0; i < cols; i++) {
    const row = [];
    for (let j = 0; j < rows; j++) {
      row.push(memoryView[offsetOutput + i * rows + j]);
    }
    result.push(row);
  }

  return result;
}

module.exports = {
  multiplyMatrices,
  transposeMatrix
};