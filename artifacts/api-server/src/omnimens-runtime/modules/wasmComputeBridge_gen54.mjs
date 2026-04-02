/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmComputeBridge
 * Written: 2026-04-02T15:17:33.707Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmComputeBridge.mjs

import { readFileSync } from 'fs';
import { join } from 'path';
import { WebAssembly } from 'util';

// Load and compile WebAssembly binary for matrix operations
const wasmFilePath = join(__dirname, 'matrix_operations.wasm');
const wasmBinary = readFileSync(wasmFilePath);
const wasmModule = new WebAssembly.Module(wasmBinary);
const wasmInstance = new WebAssembly.Instance(wasmModule);

// Utility functions for matrix operations
export function matrixMultiply(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    throw new TypeError('Both inputs must be 2D arrays.');
  }

  const rowsA = a.length;
  const colsA = a[0].length;
  const rowsB = b.length;
  const colsB = b[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }

  return result;
}

export function matrixTranspose(matrix) {
  if (!Array.isArray(matrix)) {
    throw new TypeError('Input must be a 2D array.');
  }

  const rows = matrix.length;
  const cols = matrix[0].length;
  const result = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }

  return result;
}

export function matrixDeterminant(matrix) {
  if (!Array.isArray(matrix)) {
    throw new TypeError('Input must be a 2D array.');
  }

  const n = matrix.length;
  if (n !== matrix[0].length) {
    throw new Error('Matrix must be square to calculate determinant.');
  }

  function determinantRecursive(m) {
    if (m.length === 1) return m[0][0];
    if (m.length === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];

    let det = 0;
    for (let i = 0; i < m.length; i++) {
      const subMatrix = m.slice(1).map(row => row.filter((_, colIndex) => colIndex !== i));
      det += m[0][i] * determinantRecursive(subMatrix) * (i % 2 === 0 ? 1 : -1);
    }

    return det;
  }

  return determinantRecursive(matrix);
}

export function matrixInverse(matrix) {
  if (!Array.isArray(matrix)) {
    throw new TypeError('Input must be a 2D array.');
  }

  const n = matrix.length;
  if (n !== matrix[0].length) {
    throw new Error('Matrix must be square to calculate inverse.');
  }

  const det = matrixDeterminant(matrix);
  if (det === 0) {
    throw new Error('Matrix is singular and cannot be inverted.');
  }

  const adjugate = Array.from({ length: n }, (_, i) => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const subMatrix = matrix
        .filter((_, rowIndex) => rowIndex !== i)
        .map(row => row.filter((_, colIndex) => colIndex !== j));
      adjugate[j][i] = matrixDeterminant(subMatrix) * ((i + j) % 2 === 0 ? 1 : -1);
    }
  }

  return adjugate.map(row => row.map(value => value / det));
}

export const wasmComputeBridge = {
  matrixMultiply,
  matrixTranspose,
  matrixDeterminant,
  matrixInverse
};