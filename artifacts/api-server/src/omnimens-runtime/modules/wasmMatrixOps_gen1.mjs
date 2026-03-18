/**
 * wasmMatrixOps - A WebAssembly-powered module for efficient matrix operations.
 * This module provides basic linear algebra operations such as matrix multiplication
 * and eigen decomposition using WebAssembly for high performance.
 *
 * @module wasmMatrixOps
 */

// Import built-in Node.js module to work with WebAssembly
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Load and compile the WebAssembly module.
 * @returns {Promise<WebAssembly.Instance>} - A promise resolving to the WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmBuffer = readFileSync(join(__dirname, 'matrix_ops.wasm'));
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @async
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} - The resulting matrix after multiplication.
 * @throws {Error} - Throws an error if matrices cannot be multiplied.
 */
export async function multiplyMatrices(matrixA, matrixB) {
  const instance = await loadWasmModule();

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not allow multiplication.');
  }

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();

  const resultPointer = instance.exports.matrixMultiply(
    flatA,
    rowsA,
    colsA,
    flatB,
    rowsB,
    colsB
  );

  const result = new Float64Array(instance.exports.memory.buffer, resultPointer, rowsA * colsB);

  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

/**
 * Compute eigenvalues and eigenvectors of a matrix using WebAssembly.
 * @async
 * @param {number[][]} matrix - The square matrix.
 * @returns {Promise<{ eigenvalues: number[], eigenvectors: number[][] }>} - Eigenvalues and eigenvectors.
 * @throws {Error} - Throws an error if the matrix is not square.
 */
export async function eigenDecomposition(matrix) {
  const instance = await loadWasmModule();

  const rows = matrix.length;
  const cols = matrix[0].length;

  if (rows !== cols) {
    throw new Error('Matrix must be square for eigen decomposition.');
  }

  const flatMatrix = matrix.flat();

  const eigenPointer = instance.exports.eigenDecompose(flatMatrix, rows);

  const eigenvaluesPointer = instance.exports.getEigenvalues();
  const eigenvectorsPointer = instance.exports.getEigenvectors();

  const eigenvalues = new Float64Array(instance.exports.memory.buffer, eigenvaluesPointer, rows);
  const eigenvectors = new Float64Array(instance.exports.memory.buffer, eigenvectorsPointer, rows * rows);

  const eigenvectorMatrix = [];
  for (let i = 0; i < rows; i++) {
    eigenvectorMatrix.push(eigenvectors.slice(i * rows, (i + 1) * rows));
  }

  return {
    eigenvalues: Array.from(eigenvalues),
    eigenvectors: eigenvectorMatrix
  };
}

/**
 * WebAssembly module loader and utility functions for matrix operations.
 * @module wasmMatrixOps
 */