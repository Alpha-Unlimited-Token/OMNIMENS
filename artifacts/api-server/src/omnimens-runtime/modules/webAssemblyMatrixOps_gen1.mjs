/**
 * @module webAssemblyMatrixOps
 * @description This module enables efficient matrix operations using WebAssembly, designed for numerical computation tasks in Node.js.
 */

const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Loads and initializes the WebAssembly module for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
async function initializeWasm() {
  const wasmPath = join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Adds two matrices using WebAssembly.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The resulting matrix after addition.
 * @throws {Error} If matrices are not of the same dimensions.
 */
async function addMatrices(matrixA, matrixB) {
  if (!validateMatrices(matrixA, matrixB)) {
    throw new Error('Matrices must have the same dimensions for addition.');
  }

  const wasmInstance = await initializeWasm();
  const { add_matrices } = wasmInstance.exports;

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float64Array(flatA.length);

  add_matrices(flatA, flatB, result, matrixA.length, matrixA[0].length);

  return reshapeMatrix(result, matrixA.length, matrixA[0].length);
}

/**
 * Multiplies two matrices using WebAssembly.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If the number of columns in matrixA does not match the number of rows in matrixB.
 */
async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Number of columns in matrixA must match the number of rows in matrixB for multiplication.');
  }

  const wasmInstance = await initializeWasm();
  const { multiply_matrices } = wasmInstance.exports;

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float64Array(matrixA.length * matrixB[0].length);

  multiply_matrices(flatA, flatB, result, matrixA.length, matrixA[0].length, matrixB[0].length);

  return reshapeMatrix(result, matrixA.length, matrixB[0].length);
}

/**
 * Validates that two matrices have the same dimensions.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {boolean} True if the matrices have the same dimensions, false otherwise.
 */
function validateMatrices(matrixA, matrixB) {
  return (
    matrixA.length === matrixB.length &&
    matrixA[0].length === matrixB[0].length
  );
}

/**
 * Reshapes a flat array into a 2D matrix.
 * @param {Float64Array} flatArray - The flat array to reshape.
 * @param {number} rows - The number of rows in the resulting matrix.
 * @param {number} cols - The number of columns in the resulting matrix.
 * @returns {number[][]} The reshaped 2D matrix.
 */
function reshapeMatrix(flatArray, rows, cols) {
  const matrix = [];
  for (let i = 0; i < rows; i++) {
    matrix.push(Array.from(flatArray.slice(i * cols, (i + 1) * cols)));
  }
  return matrix;
}

module.exports = {
  addMatrices,
  multiplyMatrices
};