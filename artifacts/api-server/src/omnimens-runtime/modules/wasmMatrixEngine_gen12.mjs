/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixEngine
 * Written: 2026-04-01T22:11:26.928Z
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

// Utility to load and compile WebAssembly module
async function loadWasmModule(filePath) {
  const wasmBuffer = await readFile(filePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

// Initialize WebAssembly module for matrix operations
let wasmInstance;
export async function initializeWasmEngine() {
  const wasmPath = join(__dirname, 'matrix_operations.wasm');
  wasmInstance = await loadWasmModule(wasmPath);
}

// Multiply two matrices (A and B) using WebAssembly
export function multiplyMatrices(matrixA, matrixB) {
  if (!wasmInstance) {
    throw new Error('WASM Engine not initialized. Call initializeWasmEngine() first.');
  }

  const { multiply_matrices } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix multiplication not possible: Columns of A must match rows of B.');
  }

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float32Array(rowsA * colsB);

  multiply_matrices(flatA, rowsA, colsA, flatB, rowsB, colsB, result);

  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(Array.from(result.slice(i * colsB, (i + 1) * colsB)));
  }

  return resultMatrix;
}

// Transpose a matrix using WebAssembly
export function transposeMatrix(matrix) {
  if (!wasmInstance) {
    throw new Error('WASM Engine not initialized. Call initializeWasmEngine() first.');
  }

  const { transpose_matrix } = wasmInstance.exports;

  const rows = matrix.length;
  const cols = matrix[0].length;
  const flatMatrix = matrix.flat();
  const result = new Float32Array(rows * cols);

  transpose_matrix(flatMatrix, rows, cols, result);

  const resultMatrix = [];
  for (let i = 0; i < cols; i++) {
    resultMatrix.push(Array.from(result.slice(i * rows, (i + 1) * rows)));
  }

  return resultMatrix;
}

// Utility to create an identity matrix of size n
export function createIdentityMatrix(n) {
  if (n <= 0) {
    throw new Error('Matrix size must be a positive integer.');
  }

  const identityMatrix = Array.from({ length: n }, (_, i) => {
    const row = new Array(n).fill(0);
    row[i] = 1;
    return row;
  });

  return identityMatrix;
}

// Utility to validate if an input is a valid 2D matrix
export function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return false;
  }

  const rowLength = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === rowLength);
}