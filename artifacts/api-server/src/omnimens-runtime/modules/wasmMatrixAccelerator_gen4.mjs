/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixAccelerator
 * Written: 2026-04-03T14:26:02.987Z
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

import { instantiate } from 'webassembly';

// WebAssembly binary loader utility
export async function loadWasmModule(wasmBinary) {
  const { instance } = await WebAssembly.instantiate(wasmBinary);
  return instance.exports;
}

// Accelerates matrix multiplication using WebAssembly
export async function wasmMatrixMultiply(wasmBinary, matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication');
  }

  const wasmModule = await loadWasmModule(wasmBinary);

  // Flatten matrices for WebAssembly
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float64Array(rowsA * colsB);

  // Call WebAssembly function
  wasmModule.matrixMultiply(flatA, rowsA, colsA, flatB, rowsB, colsB, result);

  // Reshape result back into 2D array
  const outputMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    outputMatrix.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return outputMatrix;
}

// Generic utility to validate matrix dimensions
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new Error('Input must be a 2D array');
  }

  const rowLength = matrix[0].length;
  for (const row of matrix) {
    if (row.length !== rowLength) {
      throw new Error('All rows in the matrix must have the same length');
    }
  }

  return true;
}

// Generic utility for matrix addition
export function matrixAdd(matrixA, matrixB) {
  validateMatrix(matrixA);
  validateMatrix(matrixB);

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Matrix dimensions must match for addition');
  }

  const result = [];
  for (let i = 0; i < rowsA; i++) {
    const row = [];
    for (let j = 0; j < colsA; j++) {
      row.push(matrixA[i][j] + matrixB[i][j]);
    }
    result.push(row);
  }

  return result;
}

// Generic utility for matrix transposition
export function transposeMatrix(matrix) {
  validateMatrix(matrix);

  const rows = matrix.length;
  const cols = matrix[0].length;

  const transposed = [];
  for (let i = 0; i < cols; i++) {
    const row = [];
    for (let j = 0; j < rows; j++) {
      row.push(matrix[j][i]);
    }
    transposed.push(row);
  }

  return transposed;
}