// wasmMatrixOps.js

/**
 * @module wasmMatrixOps
 * @description Perform efficient matrix operations using WebAssembly for tasks requiring parallel computation.
 * This module provides basic linear algebra operations such as dot product and matrix multiplication implemented in WebAssembly.
 */

const fs = require('fs');
const path = require('path');

/**
 * @function compileWasm
 * @description Compiles the WebAssembly binary file to a usable module.
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
async function compileWasm() {
  const wasmPath = path.join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const { instance } = await WebAssembly.instantiate(wasmBuffer);
  return instance;
}

/**
 * @function dotProduct
 * @description Computes the dot product of two vectors using WebAssembly.
 * @param {Float32Array} vectorA - The first vector.
 * @param {Float32Array} vectorB - The second vector.
 * @returns {number} The dot product of the two vectors.
 * @throws {Error} If the vectors are not of the same length.
 */
async function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }

  const wasm = await compileWasm();
  const { memory, dot_product } = wasm.exports;

  const vectorLength = vectorA.length;
  const offsetA = 0;
  const offsetB = vectorLength * 4;

  const wasmMemory = new Float32Array(memory.buffer);
  wasmMemory.set(vectorA, offsetA / 4);
  wasmMemory.set(vectorB, offsetB / 4);

  return dot_product(offsetA, offsetB, vectorLength);
}

/**
 * @function matrixMultiply
 * @description Computes the multiplication of two matrices using WebAssembly.
 * @param {Float32Array} matrixA - The first matrix (flattened).
 * @param {Float32Array} matrixB - The second matrix (flattened).
 * @param {number} rowsA - The number of rows in matrixA.
 * @param {number} colsA - The number of columns in matrixA.
 * @param {number} colsB - The number of columns in matrixB.
 * @returns {Float32Array} The resulting matrix (flattened).
 * @throws {Error} If matrix dimensions are incompatible for multiplication.
 */
async function matrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions are incompatible');
  }

  const wasm = await compileWasm();
  const { memory, matrix_multiply } = wasm.exports;

  const resultMatrix = new Float32Array(rowsA * colsB);
  const offsetA = 0;
  const offsetB = matrixA.length * 4;
  const offsetResult = offsetB + matrixB.length * 4;

  const wasmMemory = new Float32Array(memory.buffer);
  wasmMemory.set(matrixA, offsetA / 4);
  wasmMemory.set(matrixB, offsetB / 4);

  matrix_multiply(offsetA, offsetB, offsetResult, rowsA, colsA, colsB);

  resultMatrix.set(wasmMemory.subarray(offsetResult / 4, offsetResult / 4 + resultMatrix.length));

  return resultMatrix;
}

module.exports = {
  dotProduct,
  matrixMultiply
};