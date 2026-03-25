/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webAssemblyMatrixEngine
 * Written: 2026-03-24T11:23:40.239Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webAssemblyMatrixEngine.mjs

import { readFile } from 'fs/promises';
import { join } from 'path';

// Load WebAssembly binary
async function loadWebAssembly(filePath) {
  const wasmBuffer = await readFile(filePath);
  const wasmModule = await WebAssembly.instantiate(wasmBuffer);
  return wasmModule.instance.exports;
}

// Matrix multiplication using WebAssembly
export async function matrixMultiply(wasmFilePath, matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error("Both inputs must be 2D arrays.");
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions do not match for multiplication.");
  }

  const wasmExports = await loadWebAssembly(wasmFilePath);

  // Prepare flat arrays for WebAssembly
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float64Array(rowsA * colsB);

  wasmExports.matrixMultiply(flatA, rowsA, colsA, flatB, rowsB, colsB, result);

  // Convert flat result back to 2D array
  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

// Generic utility for creating identity matrices
export function createIdentityMatrix(size) {
  if (size <= 0 || !Number.isInteger(size)) {
    throw new Error("Size must be a positive integer.");
  }

  const matrix = Array.from({ length: size }, (_, i) => {
    return Array.from({ length: size }, (_, j) => (i === j ? 1 : 0));
  });

  return matrix;
}

// Generic utility for transposing matrices
export function transposeMatrix(matrix) {
  if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
    throw new Error("Input must be a 2D array.");
  }

  const rows = matrix.length;
  const cols = matrix[0].length;

  const transposed = Array.from({ length: cols }, (_, i) => {
    return Array.from({ length: rows }, (_, j) => matrix[j][i]);
  });

  return transposed;
}

// Example usage (uncomment to test):
// const wasmFilePath = join(__dirname, 'matrixEngine.wasm');
// const matrixA = [[1, 2], [3, 4]];
// const matrixB = [[5, 6], [7, 8]];
// matrixMultiply(wasmFilePath, matrixA, matrixB).then(console.log);