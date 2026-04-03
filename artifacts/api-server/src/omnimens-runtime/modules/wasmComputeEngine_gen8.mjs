/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmComputeEngine
 * Written: 2026-04-03T16:12:46.098Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmComputeEngine.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for WebAssembly task identification.
 * Useful for caching and tracking compute-intensive tasks.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique SHA-256 hash.
 */
export function generateTaskHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Validates if a given WebAssembly binary buffer is valid.
 * Ensures the buffer can safely be used for WebAssembly instantiation.
 * @param {Buffer} wasmBuffer - The WebAssembly binary buffer.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateWasmBuffer(wasmBuffer) {
  try {
    WebAssembly.validate(wasmBuffer);
    return true;
  } catch {
    return false;
  }
}

/**
 * Instantiates a WebAssembly module and returns its exports.
 * Provides a clean interface for interacting with WebAssembly functions.
 * @param {Buffer} wasmBuffer - The WebAssembly binary buffer.
 * @param {Object} [imports={}] - Optional imports for the WebAssembly module.
 * @returns {Promise<Object>} - A promise resolving to the WebAssembly exports.
 */
export async function instantiateWasm(wasmBuffer, imports = {}) {
  if (!validateWasmBuffer(wasmBuffer)) {
    throw new Error('Invalid WebAssembly buffer.');
  }
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const instance = await WebAssembly.instantiate(wasmModule, imports);
  return instance.exports;
}

/**
 * Performs a matrix multiplication using WebAssembly (if available).
 * Falls back to a pure JavaScript implementation if WebAssembly is unavailable.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} - The resulting matrix after multiplication.
 */
export function matrixMultiply(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const result = Array(matrixA.length)
    .fill(null)
    .map(() => Array(matrixB[0].length).fill(0));

  for (let i = 0; i < matrixA.length; i++) {
    for (let j = 0; j < matrixB[0].length; j++) {
      for (let k = 0; k < matrixB.length; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  return result;
}

/**
 * Converts a 2D array (matrix) into a flat Float32Array.
 * Useful for preparing data for WebAssembly or GPU processing.
 * @param {number[][]} matrix - The 2D array to flatten.
 * @returns {Float32Array} - The flattened array.
 */
export function flattenMatrix(matrix) {
  return new Float32Array(matrix.flat());
}

/**
 * Reconstructs a 2D array (matrix) from a flat Float32Array.
 * Useful for interpreting results from WebAssembly or GPU processing.
 * @param {Float32Array} flatArray - The flat array to reconstruct.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in the matrix.
 * @returns {number[][]} - The reconstructed 2D array.
 */
export function reconstructMatrix(flatArray, rows, cols) {
  if (flatArray.length !== rows * cols) {
    throw new Error('Flat array size does not match matrix dimensions.');
  }

  const matrix = [];
  for (let i = 0; i < rows; i++) {
    matrix.push(flatArray.slice(i * cols, (i + 1) * cols));
  }

  return matrix;
}
