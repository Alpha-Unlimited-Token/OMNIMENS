/**
 * @module webAssemblyMatrixOps
 * @description Provides GPU-like matrix operations using WebAssembly for computational tasks.
 */

const fs = require('fs');
const path = require('path');

/**
 * @typedef {number[][]} Matrix
 * Represents a 2D matrix.
 */

/**
 * @function compileWebAssembly
 * @description Compiles the WebAssembly module from binary.
 * @returns {Promise<WebAssembly.Instance>} Compiled WebAssembly instance.
 */
async function compileWebAssembly() {
  const wasmPath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmBinary = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBinary);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * @function multiplyMatrices
 * @description Multiplies two matrices using WebAssembly for optimized performance.
 * @param {Matrix} matrixA - The first matrix.
 * @param {Matrix} matrixB - The second matrix.
 * @returns {Promise<Matrix>} The resulting matrix after multiplication.
 * @throws {Error} If matrices are incompatible for multiplication.
 */
async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const wasmInstance = await compileWebAssembly();
  const { memory, multiply } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();

  const bufferA = new Float64Array(memory.buffer, 0, flatA.length);
  const bufferB = new Float64Array(memory.buffer, flatA.length * 8, flatB.length);
  const bufferResult = new Float64Array(memory.buffer, (flatA.length + flatB.length) * 8, rowsA * colsB);

  bufferA.set(flatA);
  bufferB.set(flatB);

  multiply(rowsA, colsA, colsB);

  const result = [];
  for (let i = 0; i < rowsA; i++) {
    result.push(bufferResult.slice(i * colsB, (i + 1) * colsB));
  }

  return result;
}

/**
 * @function createIdentityMatrix
 * @description Creates an identity matrix of given size.
 * @param {number} size - The size of the identity matrix.
 * @returns {Matrix} The identity matrix.
 */
function createIdentityMatrix(size) {
  const matrix = Array.from({ length: size }, (_, i) => {
    return Array.from({ length: size }, (_, j) => (i === j ? 1 : 0));
  });
  return matrix;
}

/**
 * @function transposeMatrix
 * @description Transposes a given matrix.
 * @param {Matrix} matrix - The matrix to transpose.
 * @returns {Matrix} The transposed matrix.
 */
function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const transposed = Array.from({ length: cols }, (_, i) => {
    return Array.from({ length: rows }, (_, j) => matrix[j][i]);
  });
  return transposed;
}

module.exports = {
  multiplyMatrices,
  createIdentityMatrix,
  transposeMatrix
};