/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixEngine
 * Written: 2026-03-24T05:49:54.681Z
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

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Utility function to load WebAssembly binary
async function loadWasmModule(filePath) {
  const wasmPath = resolve(filePath);
  const wasmBuffer = await readFile(wasmPath);
  const { instance } = await WebAssembly.instantiate(wasmBuffer);
  return instance.exports;
}

// Generic matrix multiplication using WebAssembly
export async function wasmMatrixMultiply(a, b, wasmFilePath) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    throw new TypeError('Both matrices must be arrays.');
  }

  const rowsA = a.length;
  const colsA = a[0].length;
  const rowsB = b.length;
  const colsB = b[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const wasmModule = await loadWasmModule(wasmFilePath);

  const flatA = a.flat();
  const flatB = b.flat();
  const result = new Float64Array(rowsA * colsB);

  wasmModule.matrixMultiply(flatA, flatB, result, rowsA, colsA, colsB);

  // Convert flat result back to 2D array
  const output = [];
  for (let i = 0; i < rowsA; i++) {
    output.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return output;
}

// Generic utility for validating matrix dimensions
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new TypeError('Matrix must be a non-empty array.');
  }

  const rowLength = matrix[0].length;
  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== rowLength) {
      throw new Error('All rows in the matrix must have the same length.');
    }
  }

  return true;
}

// Example fallback for matrix multiplication without WebAssembly
export function fallbackMatrixMultiply(a, b) {
  validateMatrix(a);
  validateMatrix(b);

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

// Exported constants for utility
export const wasmMatrixEngineVersion = '1.0.0';
export const supportedOperations = ['matrixMultiply'];