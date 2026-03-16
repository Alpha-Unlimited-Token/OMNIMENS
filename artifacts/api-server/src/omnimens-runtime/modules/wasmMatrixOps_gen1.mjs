/**
 * wasmMatrixOps - A utility module for GPU-like matrix operations using WebAssembly.
 * This module provides parallelized matrix multiplication and basic linear algebra routines.
 * It is designed to simulate GPU-like efficiency for small-scale tasks.
 */

const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Loads and compiles the WebAssembly binary for matrix operations.
 * @returns {Promise<WebAssembly.Instance>} The compiled WebAssembly instance.
 */
async function loadWasm() {
  const wasmPath = join(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Multiplies two matrices using WebAssembly for parallelized computation.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If the matrices cannot be multiplied due to dimension mismatch.
 */
async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimension mismatch: Cannot multiply these matrices.');
  }

  const wasmInstance = await loadWasm();
  const { memory, multiply } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  // Flatten matrices and allocate memory in the WebAssembly linear memory.
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const resultSize = rowsA * colsB;
  const result = new Float64Array(resultSize);

  const offsetA = 0;
  const offsetB = flatA.length * Float64Array.BYTES_PER_ELEMENT;
  const offsetResult = offsetB + flatB.length * Float64Array.BYTES_PER_ELEMENT;

  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(flatA, offsetA / Float64Array.BYTES_PER_ELEMENT);
  wasmMemory.set(flatB, offsetB / Float64Array.BYTES_PER_ELEMENT);

  multiply(offsetA, offsetB, offsetResult, rowsA, colsA, colsB);

  result.set(
    wasmMemory.slice(
      offsetResult / Float64Array.BYTES_PER_ELEMENT,
      (offsetResult + resultSize * Float64Array.BYTES_PER_ELEMENT) / Float64Array.BYTES_PER_ELEMENT
    )
  );

  // Convert the flat result back into a 2D array.
  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

/**
 * Adds two matrices element-wise.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} The resulting matrix after addition.
 * @throws {Error} If the matrices are not of the same dimensions.
 */
function addMatrices(matrixA, matrixB) {
  if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
    throw new Error('Matrix dimension mismatch: Cannot add these matrices.');
  }

  return matrixA.map((row, i) => row.map((val, j) => val + matrixB[i][j]));
}

/**
 * Transposes a matrix.
 * @param {number[][]} matrix - The matrix to transpose.
 * @returns {number[][]} The transposed matrix.
 */
function transposeMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

module.exports = {
  multiplyMatrices,
  addMatrices,
  transposeMatrix
};