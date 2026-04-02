/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmPerformanceBridge
 * Written: 2026-04-02T15:23:49.172Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmPerformanceBridge.mjs

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Compiles and initializes WebAssembly modules for high-performance linear algebra.
 * @param {string} wasmFilePath - Path to the WebAssembly binary file.
 * @returns {Promise<Object>} - An object containing callable WebAssembly functions.
 */
export async function initializeWasmModules(wasmFilePath) {
  if (typeof wasmFilePath !== 'string' || !wasmFilePath.endsWith('.wasm')) {
    throw new Error('Invalid WebAssembly file path. Must be a string ending with .wasm');
  }

  const wasmBinary = await readFile(wasmFilePath);
  const wasmModule = await WebAssembly.compile(wasmBinary);
  const wasmInstance = await WebAssembly.instantiate(wasmModule);

  return {
    multiplyMatrices: wasmInstance.exports.multiplyMatrices,
    transposeMatrix: wasmInstance.exports.transposeMatrix,
    allocateMemory: wasmInstance.exports.allocateMemory,
    freeMemory: wasmInstance.exports.freeMemory
  };
}

/**
 * Validates matrix dimensions for operations.
 * @param {Array<Array<number>>} matrixA - First matrix.
 * @param {Array<Array<number>>} matrixB - Second matrix.
 * @returns {boolean} - True if dimensions are compatible, false otherwise.
 */
export function validateMatrixDimensions(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) return false;
  const rowsA = matrixA.length;
  const colsA = matrixA[0]?.length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0]?.length;

  return colsA === rowsB;
}

/**
 * Converts a 2D JavaScript matrix to a flat Float32Array for WebAssembly.
 * @param {Array<Array<number>>} matrix - 2D matrix.
 * @returns {Float32Array} - Flattened matrix.
 */
export function flattenMatrix(matrix) {
  if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
    throw new Error('Invalid matrix format. Expected a 2D array.');
  }

  const rows = matrix.length;
  const cols = matrix[0].length;
  const flatArray = new Float32Array(rows * cols);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      flatArray[i * cols + j] = matrix[i][j];
    }
  }

  return flatArray;
}

/**
 * Converts a flat Float32Array back to a 2D JavaScript matrix.
 * @param {Float32Array} flatArray - Flattened matrix.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {Array<Array<number>>} - 2D matrix.
 */
export function unflattenMatrix(flatArray, rows, cols) {
  if (!(flatArray instanceof Float32Array)) {
    throw new Error('Invalid array format. Expected a Float32Array.');
  }

  const matrix = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push(flatArray[i * cols + j]);
    }
    matrix.push(row);
  }

  return matrix;
}

/**
 * Generates a zero matrix of specified dimensions.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {Array<Array<number>>} - Zero matrix.
 */
export function generateZeroMatrix(rows, cols) {
  if (rows <= 0 || cols <= 0) {
    throw new Error('Matrix dimensions must be positive integers.');
  }

  const matrix = [];
  for (let i = 0; i < rows; i++) {
    const row = new Array(cols).fill(0);
    matrix.push(row);
  }

  return matrix;
}

/**
 * Generates a random matrix with values between min and max.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {Array<Array<number>>} - Random matrix.
 */
export function generateRandomMatrix(rows, cols, min = 0, max = 1) {
  if (rows <= 0 || cols <= 0 || min >= max) {
    throw new Error('Invalid matrix dimensions or range.');
  }

  const matrix = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push(Math.random() * (max - min) + min);
    }
    matrix.push(row);
  }

  return matrix;
}
