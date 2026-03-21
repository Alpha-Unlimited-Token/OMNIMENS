/**
 * @module efficientMatrixOps
 * @description This module provides efficient matrix operations using WebAssembly (WASM) for high-performance numerical computations in Node.js.
 */

import fs from "fs";
import path from "path";

/**
 * Compiles and initializes the WebAssembly module.
 * @async
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
async function initializeWASM() {
  const wasmPath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const wasmInstance = await WebAssembly.instantiate(wasmModule, {});
  return wasmInstance;
}

/**
 * Multiplies two matrices using WebAssembly.
 * @async
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If matrices are incompatible for multiplication.
 */
export async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Incompatible matrix dimensions for multiplication.');
  }

  const wasmInstance = await initializeWASM();
  const { memory, multiply_matrices } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  const matrixAFlat = matrixA.flat();
  const matrixBFlat = matrixB.flat();
  const resultSize = rowsA * colsB;

  const memorySize = (matrixAFlat.length + matrixBFlat.length + resultSize) * Float64Array.BYTES_PER_ELEMENT;
  const memoryBuffer = new Float64Array(memory.buffer, 0, memorySize / Float64Array.BYTES_PER_ELEMENT);

  memoryBuffer.set(matrixAFlat, 0);
  memoryBuffer.set(matrixBFlat, matrixAFlat.length);

  multiply_matrices(rowsA, colsA, colsB);

  const result = memoryBuffer.slice(matrixAFlat.length + matrixBFlat.length, matrixAFlat.length + matrixBFlat.length + resultSize);

  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

/**
 * Computes the eigenvalues of a matrix using WebAssembly.
 * @async
 * @param {number[][]} matrix - The input square matrix.
 * @returns {Promise<number[]>} The eigenvalues of the matrix.
 * @throws {Error} If the matrix is not square.
 */
export async function computeEigenvalues(matrix) {
  if (matrix.length !== matrix[0].length) {
    throw new Error('Matrix must be square to compute eigenvalues.');
  }

  const wasmInstance = await initializeWASM();
  const { memory, compute_eigenvalues } = wasmInstance.exports;

  const size = matrix.length;
  const matrixFlat = matrix.flat();

  const memorySize = matrixFlat.length * Float64Array.BYTES_PER_ELEMENT;
  const memoryBuffer = new Float64Array(memory.buffer, 0, memorySize / Float64Array.BYTES_PER_ELEMENT);

  memoryBuffer.set(matrixFlat, 0);

  compute_eigenvalues(size);

  const eigenvalues = memoryBuffer.slice(0, size);

  return Array.from(eigenvalues);
}

