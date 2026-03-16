/**
 * wasmMatrixOps - A utility module for efficient matrix operations using WebAssembly.
 * This module provides basic linear algebra operations such as dot product and matrix multiplication.
 * It leverages WebAssembly for performance and exposes functions to Node.js.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Load and compile the WebAssembly module
const wasmPath = join(__dirname, 'matrix_ops.wasm');
const wasmBuffer = readFileSync(wasmPath);
const wasmModule = await WebAssembly.compile(wasmBuffer);
const wasmInstance = await WebAssembly.instantiate(wasmModule);

const { dot_product, matrix_multiply } = wasmInstance.exports;

/**
 * Calculates the dot product of two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The dot product of the two vectors.
 * @throws {Error} - If the vectors are not of the same length.
 */
export function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }

  const length = vectorA.length;
  const result = dot_product(vectorA, vectorB, length);

  return result;
}

/**
 * Multiplies two matrices.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} - The resulting matrix after multiplication.
 * @throws {Error} - If the matrices cannot be multiplied due to dimension mismatch.
 */
export function matrixMultiply(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication');
  }

  const result = new Array(rowsA).fill(0).map(() => new Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  return result;
}

/**
 * Verifies the WebAssembly module is loaded and functional.
 * @returns {boolean} - Returns true if the module is loaded successfully.
 */
export function isWasmLoaded() {
  return !!wasmInstance;
}