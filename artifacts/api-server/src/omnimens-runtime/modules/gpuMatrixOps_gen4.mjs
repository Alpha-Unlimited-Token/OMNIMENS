/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuMatrixOps
 * Written: 2026-04-01T21:57:28.817Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuMatrixOps.mjs

import { createHash } from 'crypto';

/**
 * Generate a unique identifier for caching purposes (e.g., matrix operations).
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Initialize a WebAssembly instance for GPU-accelerated matrix operations.
 * @param {Uint8Array} wasmBinary - The WebAssembly binary code.
 * @returns {Promise<WebAssembly.Instance>} - The initialized WebAssembly instance.
 */
export async function initWasmInstance(wasmBinary) {
  const wasmModule = await WebAssembly.compile(wasmBinary);
  const wasmInstance = await WebAssembly.instantiate(wasmModule, {});
  return wasmInstance;
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @param {WebAssembly.Instance} wasmInstance - The initialized WebAssembly instance.
 * @param {Float32Array} matrixA - The first matrix (flat array).
 * @param {Float32Array} matrixB - The second matrix (flat array).
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A (and rows in matrix B).
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Float32Array} - The resulting matrix (flat array).
 */
export function multiplyMatrices(wasmInstance, matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const { memory, multiply } = wasmInstance.exports;

  // Allocate memory for matrices in the WebAssembly instance
  const aOffset = 0;
  const bOffset = aOffset + matrixA.length * 4; // Float32 = 4 bytes
  const cOffset = bOffset + matrixB.length * 4;

  const wasmMemory = new Float32Array(memory.buffer);
  wasmMemory.set(matrixA, aOffset / 4);
  wasmMemory.set(matrixB, bOffset / 4);

  // Perform the multiplication
  multiply(aOffset, bOffset, cOffset, rowsA, colsA, colsB);

  // Extract the result
  const result = new Float32Array(rowsA * colsB);
  result.set(wasmMemory.subarray(cOffset / 4, cOffset / 4 + result.length));

  return result;
}

/**
 * Validate matrix dimensions for operations.
 * @param {number[]} dimensions - Array of matrix dimensions [rows, cols].
 * @returns {boolean} - True if dimensions are valid, false otherwise.
 */
export function validateMatrixDimensions(dimensions) {
  return dimensions.every(dim => Number.isInteger(dim) && dim > 0);
}

/**
 * Utility function to create a zero-initialized matrix.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {Float32Array} - A flat array representing the matrix.
 */
export function createZeroMatrix(rows, cols) {
  if (!validateMatrixDimensions([rows, cols])) {
    throw new Error('Invalid matrix dimensions.');
  }
  return new Float32Array(rows * cols);
}

/**
 * Transpose a matrix.
 * @param {Float32Array} matrix - The input matrix (flat array).
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Float32Array} - The transposed matrix (flat array).
 */
export function transposeMatrix(matrix, rows, cols) {
  if (matrix.length !== rows * cols) {
    throw new Error('Matrix dimensions do not match the input array length.');
  }

  const result = new Float32Array(rows * cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c * rows + r] = matrix[r * cols + c];
    }
  }

  return result;
}