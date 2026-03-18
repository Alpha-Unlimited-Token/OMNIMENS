/**
 * @module matrixOpsEngine
 * @description A WebAssembly-based custom matrix multiplication engine optimized for JavaScript runtime.
 */

const fs = require('fs');
const path = require('path');

/**
 * Load and compile the WebAssembly module for matrix operations.
 * @async
 * @returns {Promise<WebAssembly.Instance>} The compiled WebAssembly instance.
 */
async function loadWasm() {
  const wasmPath = path.resolve(__dirname, 'matrixOps.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @async
 * @param {number[][]} matrixA - The first matrix (2D array).
 * @param {number[][]} matrixB - The second matrix (2D array).
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If the matrices are incompatible for multiplication.
 */
async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const wasmInstance = await loadWasm();
  const { memory, multiply } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  const inputBuffer = new Float64Array(memory.buffer);
  const outputBuffer = new Float64Array(memory.buffer, rowsA * colsB * 8);

  let offset = 0;

  // Flatten and write matrixA to the WASM memory
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsA; j++) {
      inputBuffer[offset++] = matrixA[i][j];
    }
  }

  // Flatten and write matrixB to the WASM memory
  for (let i = 0; i < colsA; i++) {
    for (let j = 0; j < colsB; j++) {
      inputBuffer[offset++] = matrixB[i][j];
    }
  }

  // Perform multiplication in WASM
  multiply(rowsA, colsA, colsB);

  // Read and reconstruct the result matrix
  const result = [];
  for (let i = 0; i < rowsA; i++) {
    const row = [];
    for (let j = 0; j < colsB; j++) {
      row.push(outputBuffer[i * colsB + j]);
    }
    result.push(row);
  }

  return result;
}

/**
 * Validate a 2D matrix.
 * @param {number[][]} matrix - The matrix to validate.
 * @throws {Error} If the matrix is not a valid 2D array.
 */
function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || !matrix.every(row => Array.isArray(row) && row.every(Number.isFinite))) {
    throw new Error('Invalid matrix: Must be a 2D array of numbers.');
  }
}

module.exports = {
  multiplyMatrices,
  validateMatrix
};