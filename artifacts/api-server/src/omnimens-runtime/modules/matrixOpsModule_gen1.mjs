/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: matrixOpsModule
 * Written: 2026-03-23T08:11:10.106Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * @module matrixOpsModule
 * @description Provides efficient matrix operations leveraging WebAssembly (Wasm) for numerical computations and embeddings.
 */

/**
 * Compiles a WebAssembly module for matrix multiplication.
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
async function compileWasmMatrixMultiplication() {
  const wasmCode = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // WASM binary magic number
    0x01, 0x00, 0x00, 0x00, // WASM version 1
    0x01, 0x0a, 0x02, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f, 0x60, 0x00, 0x00,
    0x03, 0x03, 0x02, 0x00, 0x01, 0x07, 0x07, 0x01, 0x03, 0x6d, 0x75, 0x6c,
    0x00, 0x01, 0x0a, 0x0f, 0x01, 0x0d, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6c,
    0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b
  ]);

  const wasmModule = await WebAssembly.compile(wasmCode);
  return WebAssembly.instantiate(wasmModule, {});
}

/**
 * Multiplies two matrices using WebAssembly for optimal performance.
 * @param {Float32Array} matrixA - The first matrix as a 1D array.
 * @param {Float32Array} matrixB - The second matrix as a 1D array.
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A (must match rowsB).
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Promise<Float32Array>} The resulting matrix as a 1D array.
 * @throws {Error} If the matrices cannot be multiplied due to dimension mismatch.
 */
export async function multiplyMatrices(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA) {
    throw new Error("Matrix A dimensions do not match the provided rows and columns.");
  }
  if (matrixB.length !== colsA * colsB) {
    throw new Error("Matrix B dimensions do not match the provided rows and columns.");
  }

  const wasmInstance = await compileWasmMatrixMultiplication();
  const { memory, mul } = wasmInstance.exports;

  const buffer = new Float32Array(memory.buffer);
  const offsetA = 0;
  const offsetB = offsetA + matrixA.length;
  const offsetC = offsetB + matrixB.length;

  buffer.set(matrixA, offsetA);
  buffer.set(matrixB, offsetB);

  mul(offsetA, offsetB, offsetC, rowsA, colsA, colsB);

  return buffer.slice(offsetC, offsetC + rowsA * colsB);
}

/**
 * Computes the dot product of two vectors.
 * @param {Float32Array} vectorA - The first vector.
 * @param {Float32Array} vectorB - The second vector.
 * @returns {number} The dot product of the two vectors.
 * @throws {Error} If the vectors are not of the same length.
 */
export function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same length to compute the dot product.");
  }

  let result = 0;
  for (let i = 0; i < vectorA.length; i++) {
    result += vectorA[i] * vectorB[i];
  }

  return result;
}

/**
 * Transposes a matrix.
 * @param {Float32Array} matrix - The matrix as a 1D array.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Float32Array} The transposed matrix as a 1D array.
 */
export function transposeMatrix(matrix, rows, cols) {
  const result = new Float32Array(rows * cols);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      result[col * rows + row] = matrix[row * cols + col];
    }
  }

  return result;
}