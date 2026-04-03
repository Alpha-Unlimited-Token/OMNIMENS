/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixOps
 * Written: 2026-04-03T16:11:12.870Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmMatrixOps.mjs

import { readFile } from 'fs/promises';
import { join } from 'path';

const wasmFilePath = join(__dirname, 'blas-lapack.wasm');

let wasmInstance;

// Load and instantiate WebAssembly module
async function initializeWasm() {
  const wasmBuffer = await readFile(wasmFilePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  wasmInstance = await WebAssembly.instantiate(wasmModule);
}

// Helper function to create a Float64Array from a matrix
function flattenMatrix(matrix) {
  return new Float64Array(matrix.flat());
}

// Helper function to reshape a flat array back into a matrix
function reshapeArray(array, rows, cols) {
  const matrix = [];
  for (let i = 0; i < rows; i++) {
    matrix.push(array.slice(i * cols, (i + 1) * cols));
  }
  return matrix;
}

// Matrix multiplication
export function multiplyMatrices(matrixA, matrixB) {
  if (!wasmInstance) {
    throw new Error('WASM module not initialized. Call initializeWasm() first.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const flatA = flattenMatrix(matrixA);
  const flatB = flattenMatrix(matrixB);
  const resultFlat = new Float64Array(rowsA * colsB);

  wasmInstance.exports.multiply(flatA, rowsA, colsA, flatB, rowsB, colsB, resultFlat);

  return reshapeArray(resultFlat, rowsA, colsB);
}

// Matrix inversion
export function invertMatrix(matrix) {
  if (!wasmInstance) {
    throw new Error('WASM module not initialized. Call initializeWasm() first.');
  }

  const rows = matrix.length;
  const cols = matrix[0].length;

  if (rows !== cols) {
    throw new Error('Matrix inversion requires a square matrix.');
  }

  const flatMatrix = flattenMatrix(matrix);
  const resultFlat = new Float64Array(rows * cols);

  const success = wasmInstance.exports.invert(flatMatrix, rows, resultFlat);

  if (!success) {
    throw new Error('Matrix inversion failed. Matrix may be singular.');
  }

  return reshapeArray(resultFlat, rows, cols);
}

// Eigenvalue decomposition
export function eigenDecomposition(matrix) {
  if (!wasmInstance) {
    throw new Error('WASM module not initialized. Call initializeWasm() first.');
  }

  const rows = matrix.length;
  const cols = matrix[0].length;

  if (rows !== cols) {
    throw new Error('Eigenvalue decomposition requires a square matrix.');
  }

  const flatMatrix = flattenMatrix(matrix);
  const eigenValues = new Float64Array(rows);
  const eigenVectors = new Float64Array(rows * cols);

  const success = wasmInstance.exports.eigen(flatMatrix, rows, eigenValues, eigenVectors);

  if (!success) {
    throw new Error('Eigenvalue decomposition failed.');
  }

  return {
    eigenValues: Array.from(eigenValues),
    eigenVectors: reshapeArray(eigenVectors, rows, cols)
  };
}

// Initialize WASM module before use
export async function initialize() {
  await initializeWasm();
}

export const description = 'High-performance matrix operations using WebAssembly for multiplication, inversion, and eigenvalue decomposition.';