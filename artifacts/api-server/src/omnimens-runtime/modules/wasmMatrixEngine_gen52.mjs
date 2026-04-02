/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixEngine
 * Written: 2026-04-02T15:17:33.737Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmMatrixEngine.mjs

import { readFile } from 'fs/promises';
import { join } from 'path';

// Utility function to load and compile WebAssembly module
async function loadWasmModule(filePath) {
  const wasmBuffer = await readFile(filePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

// Function to initialize the WebAssembly matrix engine
export async function initializeMatrixEngine() {
  const wasmPath = join(__dirname, 'matrix_engine.wasm');
  const wasmInstance = await loadWasmModule(wasmPath);

  // Expose WebAssembly functions for matrix operations
  const { addMatrices, multiplyMatrices, transposeMatrix } = wasmInstance.exports;

  return {
    addMatrices: (matrixA, matrixB, rows, cols) => {
      const result = new Float64Array(rows * cols);
      addMatrices(matrixA, matrixB, result, rows, cols);
      return result;
    },
    multiplyMatrices: (matrixA, matrixB, rowsA, colsA, colsB) => {
      const result = new Float64Array(rowsA * colsB);
      multiplyMatrices(matrixA, matrixB, result, rowsA, colsA, colsB);
      return result;
    },
    transposeMatrix: (matrix, rows, cols) => {
      const result = new Float64Array(rows * cols);
      transposeMatrix(matrix, result, rows, cols);
      return result;
    }
  };
}

// Utility function to validate matrix dimensions
export function validateMatrixDimensions(matrixA, matrixB, operation) {
  if (operation === 'add' || operation === 'subtract') {
    if (matrixA.length !== matrixB.length) {
      throw new Error('Matrix dimensions must match for addition or subtraction.');
    }
  } else if (operation === 'multiply') {
    const colsA = matrixA.length / matrixA[0].length;
    const rowsB = matrixB.length / matrixB[0].length;
    if (colsA !== rowsB) {
      throw new Error('Number of columns in Matrix A must match number of rows in Matrix B for multiplication.');
    }
  }
}

// Generic utility for creating a zero matrix
export function createZeroMatrix(rows, cols) {
  return new Float64Array(rows * cols);
}

// Generic utility for flattening a 2D array to 1D
export function flattenMatrix(matrix) {
  return matrix.reduce((acc, row) => acc.concat(row), []);
}

// Generic utility for reshaping a 1D array to 2D
export function reshapeMatrix(flatArray, rows, cols) {
  if (flatArray.length !== rows * cols) {
    throw new Error('Flat array size does not match the specified dimensions.');
  }
  const reshaped = [];
  for (let i = 0; i < rows; i++) {
    reshaped.push(flatArray.slice(i * cols, (i + 1) * cols));
  }
  return reshaped;
}