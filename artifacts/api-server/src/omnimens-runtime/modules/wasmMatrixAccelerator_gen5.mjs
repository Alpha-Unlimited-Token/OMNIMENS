/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixAccelerator
 * Written: 2026-04-03T02:41:31.948Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmMatrixAccelerator.mjs

import { Buffer } from 'buffer';

/**
 * Compiles a WebAssembly module from raw binary data.
 * @param {Uint8Array} wasmBinary - The binary data of the WebAssembly module.
 * @returns {Promise<WebAssembly.Instance>} - A promise resolving to the WebAssembly instance.
 */
export async function compileWasmModule(wasmBinary) {
  const wasmModule = await WebAssembly.compile(wasmBinary);
  return WebAssembly.instantiate(wasmModule, {});
}

/**
 * Performs high-dimensional matrix multiplication using WebAssembly.
 * @param {Uint8Array} wasmBinary - The binary data of the WebAssembly module.
 * @param {Float32Array} matrixA - The first matrix (flattened row-major order).
 * @param {Float32Array} matrixB - The second matrix (flattened row-major order).
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA (and rows in matrixB).
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Promise<Float32Array>} - A promise resolving to the result matrix (flattened row-major order).
 */
export async function wasmMatrixMultiply(wasmBinary, matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match the provided sizes.');
  }

  const wasmInstance = await compileWasmModule(wasmBinary);
  const { memory, multiply_matrices } = wasmInstance.exports;

  const memoryBuffer = new Float32Array(memory.buffer);

  const offsetA = 0;
  const offsetB = offsetA + matrixA.length;
  const offsetC = offsetB + matrixB.length;

  memoryBuffer.set(matrixA, offsetA);
  memoryBuffer.set(matrixB, offsetB);

  multiply_matrices(offsetA, offsetB, offsetC, rowsA, colsA, colsB);

  return memoryBuffer.slice(offsetC, offsetC + rowsA * colsB);
}

/**
 * A utility function to generate a random matrix (flattened row-major order).
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Float32Array} - A randomly generated matrix.
 */
export function generateRandomMatrix(rows, cols) {
  const size = rows * cols;
  const matrix = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    matrix[i] = Math.random();
  }
  return matrix;
}

/**
 * Validates if a matrix is in the correct dimensions (flattened row-major order).
 * @param {Float32Array} matrix - The matrix to validate.
 * @param {number} rows - Expected number of rows.
 * @param {number} cols - Expected number of columns.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateMatrixDimensions(matrix, rows, cols) {
  return matrix.length === rows * cols;
}

/**
 * Converts a 2D matrix to a flattened row-major order array.
 * @param {number[][]} matrix2D - The 2D matrix to flatten.
 * @returns {Float32Array} - The flattened matrix.
 */
export function flattenMatrix(matrix2D) {
  const rows = matrix2D.length;
  const cols = matrix2D[0].length;
  const flatMatrix = new Float32Array(rows * cols);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      flatMatrix[i * cols + j] = matrix2D[i][j];
    }
  }
  return flatMatrix;
}

/**
 * Converts a flattened row-major order array to a 2D matrix.
 * @param {Float32Array} flatMatrix - The flattened matrix.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {number[][]} - The 2D matrix.
 */
export function unflattenMatrix(flatMatrix, rows, cols) {
  if (flatMatrix.length !== rows * cols) {
    throw new Error('Flattened matrix size does not match the provided dimensions.');
  }
  const matrix2D = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push(flatMatrix[i * cols + j]);
    }
    matrix2D.push(row);
  }
  return matrix2D;
}