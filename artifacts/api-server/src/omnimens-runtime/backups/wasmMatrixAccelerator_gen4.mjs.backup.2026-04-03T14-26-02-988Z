/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixAccelerator
 * Written: 2026-04-01T22:10:43.582Z
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

import { readFile } from 'fs/promises';
import { resolve } from 'path';

// Utility function to load WebAssembly binary and instantiate it
async function loadWasmModule(wasmPath) {
  const filePath = resolve(wasmPath);
  const wasmBinary = await readFile(filePath);
  const wasmModule = await WebAssembly.instantiate(wasmBinary);
  return wasmModule.instance.exports;
}

// Matrix multiplication using WebAssembly
export async function wasmMatrixMultiply(matrixA, matrixB, wasmPath) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not allow multiplication.');
  }

  const wasmExports = await loadWasmModule(wasmPath);

  const flatMatrixA = matrixA.flat();
  const flatMatrixB = matrixB.flat();
  const result = new Float64Array(rowsA * colsB);

  wasmExports.matrixMultiply(flatMatrixA, rowsA, colsA, flatMatrixB, rowsB, colsB, result);

  // Reshape result back into 2D array
  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

// Generic utility for validating matrix dimensions
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new Error('Input must be a non-empty 2D array.');
  }

  const rowLength = matrix[0].length;
  for (const row of matrix) {
    if (row.length !== rowLength) {
      throw new Error('All rows in the matrix must have the same length.');
    }
  }

  return true;
}

// Example: Generate an identity matrix of size n
export function generateIdentityMatrix(n) {
  if (n <= 0 || !Number.isInteger(n)) {
    throw new Error('Matrix size must be a positive integer.');
  }

  const identityMatrix = Array.from({ length: n }, (_, i) => {
    return Array.from({ length: n }, (_, j) => (i === j ? 1 : 0));
  });

  return identityMatrix;
}

// Example: Transpose a matrix
export function transposeMatrix(matrix) {
  validateMatrix(matrix);

  const rows = matrix.length;
  const cols = matrix[0].length;

  const transposed = Array.from({ length: cols }, (_, i) => {
    return Array.from({ length: rows }, (_, j) => matrix[j][i]);
  });

  return transposed;
}

// Example: Multiply matrices without WebAssembly (fallback)
export function matrixMultiplyFallback(matrixA, matrixB) {
  validateMatrix(matrixA);
  validateMatrix(matrixB);

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not allow multiplication.');
  }

  const resultMatrix = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        resultMatrix[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  return resultMatrix;
}
