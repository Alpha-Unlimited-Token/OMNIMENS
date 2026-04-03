/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixOps
 * Written: 2026-04-03T05:32:04.957Z
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

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Load WebAssembly binary file and instantiate
async function loadWasmModule(filePath) {
  const wasmBuffer = await readFile(filePath);
  const wasmModule = await WebAssembly.instantiate(wasmBuffer);
  return wasmModule.instance.exports;
}

// Matrix multiplication using WebAssembly
export async function wasmMatrixMultiply(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new TypeError('Both inputs must be arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const wasmExports = await loadWasmModule(join(__dirname, 'matrix_ops.wasm'));

  const resultMatrix = Array.from({ length: rowsA }, () => new Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        resultMatrix[i][j] += wasmExports.multiply(matrixA[i][k], matrixB[k][j]);
      }
    }
  }

  return resultMatrix;
}

// Transpose a matrix
export function transposeMatrix(matrix) {
  if (!Array.isArray(matrix)) {
    throw new TypeError('Input must be an array.');
  }

  const rows = matrix.length;
  const cols = matrix[0].length;

  const transposed = Array.from({ length: cols }, () => new Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposed[j][i] = matrix[i][j];
    }
  }

  return transposed;
}

// Identity matrix generator
export function generateIdentityMatrix(size) {
  if (typeof size !== 'number' || size <= 0) {
    throw new TypeError('Size must be a positive integer.');
  }

  const identityMatrix = Array.from({ length: size }, (_, i) => {
    return Array.from({ length: size }, (_, j) => (i === j ? 1 : 0));
  });

  return identityMatrix;
}

// Utility: Check if a matrix is square
export function isSquareMatrix(matrix) {
  if (!Array.isArray(matrix)) {
    throw new TypeError('Input must be an array.');
  }

  const rows = matrix.length;
  const cols = matrix[0].length;

  return rows === cols;
}

// Utility: Validate matrix structure
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix)) {
    throw new TypeError('Input must be an array.');
  }

  const rowLength = matrix[0].length;
  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== rowLength) {
      throw new Error('Invalid matrix structure: All rows must have the same length.');
    }
  }
}
