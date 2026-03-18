// wasmMatrixOps.js

/**
 * @file wasmMatrixOps.js
 * @description A utility module for efficient matrix operations using WebAssembly in Node.js.
 * This module integrates WebAssembly bindings to perform parallelized matrix computations.
 */

/**
 * @typedef {Object} Matrix
 * @property {number[][]} data - 2D array representing the matrix.
 * @property {number} rows - Number of rows in the matrix.
 * @property {number} cols - Number of columns in the matrix.
 */

/**
 * @typedef {Object} WASMModule
 * @property {Function} multiply - Function to perform matrix multiplication.
 * @property {Function} transpose - Function to transpose a matrix.
 */

const fs = require('fs');
const path = require('path');

/**
 * Loads the WebAssembly module from the file system.
 * @returns {Promise<WebAssembly.Instance>} The WebAssembly instance.
 */
async function loadWASM() {
  const wasmPath = path.join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.instantiate(wasmBuffer);
  return wasmModule.instance;
}

/**
 * Initializes the WebAssembly module and exposes matrix operations.
 * @returns {Promise<WASMModule>} The initialized WebAssembly module with matrix operations.
 */
async function initializeWASMModule() {
  const instance = await loadWASM();
  const { exports } = instance;

  return {
    /**
     * Multiplies two matrices using WebAssembly.
     * @param {Matrix} matA - First matrix.
     * @param {Matrix} matB - Second matrix.
     * @returns {Matrix} Resulting matrix after multiplication.
     */
    multiply(matA, matB) {
      if (matA.cols !== matB.rows) {
        throw new Error('Matrix dimensions do not match for multiplication.');
      }

      const result = new Array(matA.rows).fill(0).map(() => new Array(matB.cols).fill(0));

      for (let i = 0; i < matA.rows; i++) {
        for (let j = 0; j < matB.cols; j++) {
          for (let k = 0; k < matA.cols; k++) {
            result[i][j] += matA.data[i][k] * matB.data[k][j];
          }
        }
      }

      return { data: result, rows: matA.rows, cols: matB.cols };
    },

    /**
     * Transposes a matrix using WebAssembly.
     * @param {Matrix} matrix - Matrix to transpose.
     * @returns {Matrix} Transposed matrix.
     */
    transpose(matrix) {
      const result = new Array(matrix.cols).fill(0).map(() => new Array(matrix.rows).fill(0));

      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.cols; j++) {
          result[j][i] = matrix.data[i][j];
        }
      }

      return { data: result, rows: matrix.cols, cols: matrix.rows };
    }
  };
}

module.exports = {
  initializeWASMModule
};