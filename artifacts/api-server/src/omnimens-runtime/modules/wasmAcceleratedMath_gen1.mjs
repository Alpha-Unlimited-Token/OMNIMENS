/**
 * wasmAcceleratedMath - A module for GPU-like acceleration of matrix operations and neural computations using WebAssembly.
 * This module provides efficient implementations of BLAS (Basic Linear Algebra Subprograms) and neural network primitives.
 * @module wasmAcceleratedMath
 */

const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Load and compile a WebAssembly module from a file.
 * @param {string} filePath - The path to the WebAssembly binary file.
 * @returns {Promise<WebAssembly.Instance>} - The compiled WebAssembly instance.
 */
async function loadWasm(filePath) {
  const wasmBuffer = readFileSync(filePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule, {});
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @param {Float32Array} matrixA - The first matrix (flattened, row-major order).
 * @param {Float32Array} matrixB - The second matrix (flattened, row-major order).
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA (and rows in matrixB).
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Float32Array} - The resulting matrix (flattened, row-major order).
 */
async function matrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  const wasmInstance = await loadWasm(join(__dirname, 'matrix_multiply.wasm'));
  const { memory, multiply_matrices } = wasmInstance.exports;

  const resultMatrix = new Float32Array(rowsA * colsB);
  const memoryView = new Float32Array(memory.buffer);

  const offsetA = 0;
  const offsetB = offsetA + matrixA.length;
  const offsetC = offsetB + matrixB.length;

  memoryView.set(matrixA, offsetA);
  memoryView.set(matrixB, offsetB);

  multiply_matrices(offsetA, offsetB, offsetC, rowsA, colsA, colsB);

  resultMatrix.set(memoryView.subarray(offsetC, offsetC + rowsA * colsB));

  return resultMatrix;
}

/**
 * Perform a ReLU (Rectified Linear Unit) activation function on a vector using WebAssembly.
 * @param {Float32Array} inputVector - The input vector.
 * @returns {Float32Array} - The resulting vector after applying ReLU.
 */
async function relu(inputVector) {
  const wasmInstance = await loadWasm(join(__dirname, 'relu.wasm'));
  const { memory, apply_relu } = wasmInstance.exports;

  const resultVector = new Float32Array(inputVector.length);
  const memoryView = new Float32Array(memory.buffer);

  const offsetInput = 0;
  const offsetOutput = offsetInput + inputVector.length;

  memoryView.set(inputVector, offsetInput);

  apply_relu(offsetInput, offsetOutput, inputVector.length);

  resultVector.set(memoryView.subarray(offsetOutput, offsetOutput + inputVector.length));

  return resultVector;
}

/**
 * Perform a dot product operation using WebAssembly.
 * @param {Float32Array} vectorA - The first vector.
 * @param {Float32Array} vectorB - The second vector.
 * @returns {number} - The resulting dot product.
 */
async function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length for dot product.');
  }

  const wasmInstance = await loadWasm(join(__dirname, 'dot_product.wasm'));
  const { memory, compute_dot_product } = wasmInstance.exports;

  const memoryView = new Float32Array(memory.buffer);

  const offsetA = 0;
  const offsetB = offsetA + vectorA.length;

  memoryView.set(vectorA, offsetA);
  memoryView.set(vectorB, offsetB);

  return compute_dot_product(offsetA, offsetB, vectorA.length);
}

module.exports = {
  matrixMultiply,
  relu,
  dotProduct
};