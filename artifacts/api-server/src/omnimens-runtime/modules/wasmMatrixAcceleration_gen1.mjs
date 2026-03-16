/**
 * @module wasmMatrixAcceleration
 * @description Simulates GPU-like matrix operations for efficient computation using WebAssembly.
 * This module provides matrix multiplication, inversion, and other linear algebra operations.
 */

const fs = require('fs');
const path = require('path');

/**
 * @function compileWasmModule
 * @description Compiles a WebAssembly module from binary data.
 * @param {Buffer} wasmBuffer - The binary data of the WebAssembly module.
 * @returns {Promise<WebAssembly.Instance>} - A promise that resolves to the WebAssembly instance.
 */
async function compileWasmModule(wasmBuffer) {
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * @function loadWasmModule
 * @description Loads and compiles the WebAssembly module from a file.
 * @param {string} filePath - The path to the WebAssembly binary file.
 * @returns {Promise<WebAssembly.Instance>} - A promise that resolves to the WebAssembly instance.
 */
async function loadWasmModule(filePath) {
  const wasmBuffer = fs.readFileSync(filePath);
  return compileWasmModule(wasmBuffer);
}

/**
 * @function matrixMultiply
 * @description Performs matrix multiplication using WebAssembly.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} - A promise that resolves to the resulting matrix.
 */
async function matrixMultiply(matrixA, matrixB) {
  // Validate input dimensions
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  // Load the WebAssembly module
  const wasmInstance = await loadWasmModule(path.resolve(__dirname, 'matrix_operations.wasm'));

  // Flatten matrices into 1D arrays for WebAssembly
  const flatMatrixA = matrixA.flat();
  const flatMatrixB = matrixB.flat();
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  // Allocate memory in WebAssembly
  const memory = wasmInstance.exports.memory;
  const buffer = new Uint32Array(memory.buffer);

  const offsetA = 0;
  const offsetB = offsetA + flatMatrixA.length;
  const offsetResult = offsetB + flatMatrixB.length;

  buffer.set(flatMatrixA, offsetA);
  buffer.set(flatMatrixB, offsetB);

  // Perform matrix multiplication
  wasmInstance.exports.matrixMultiply(offsetA, rowsA, colsA, offsetB, colsB, offsetResult);

  // Extract the result matrix
  const result = [];
  for (let i = 0; i < rowsA; i++) {
    const row = [];
    for (let j = 0; j < colsB; j++) {
      row.push(buffer[offsetResult + i * colsB + j]);
    }
    result.push(row);
  }

  return result;
}

/**
 * @function matrixInvert
 * @description Inverts a matrix using WebAssembly.
 * @param {number[][]} matrix - The matrix to invert.
 * @returns {Promise<number[][]>} - A promise that resolves to the inverted matrix.
 */
async function matrixInvert(matrix) {
  // Validate input dimensions
  if (matrix.length !== matrix[0].length) {
    throw new Error('Matrix inversion requires a square matrix.');
  }

  // Load the WebAssembly module
  const wasmInstance = await loadWasmModule(path.resolve(__dirname, 'matrix_operations.wasm'));

  // Flatten matrix into 1D array for WebAssembly
  const flatMatrix = matrix.flat();
  const size = matrix.length;

  // Allocate memory in WebAssembly
  const memory = wasmInstance.exports.memory;
  const buffer = new Uint32Array(memory.buffer);

  const offsetMatrix = 0;
  const offsetResult = offsetMatrix + flatMatrix.length;

  buffer.set(flatMatrix, offsetMatrix);

  // Perform matrix inversion
  wasmInstance.exports.matrixInvert(offsetMatrix, size, offsetResult);

  // Extract the result matrix
  const result = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      row.push(buffer[offsetResult + i * size + j]);
    }
    result.push(row);
  }

  return result;
}

module.exports = {
  compileWasmModule,
  loadWasmModule,
  matrixMultiply,
  matrixInvert
};