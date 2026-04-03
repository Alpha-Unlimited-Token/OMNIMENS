/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webAssemblyMatrixEngine
 * Written: 2026-04-03T05:00:46.075Z
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

// Utility to compile WebAssembly module
export async function compileWasm(filePath) {
  const wasmPath = join(process.cwd(), filePath);
  const wasmBuffer = await readFile(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return wasmModule;
}

// Utility to initialize WebAssembly instance with imports
export async function initWasmInstance(wasmModule, imports = {}) {
  const instance = await WebAssembly.instantiate(wasmModule, imports);
  return instance;
}

// Function to perform matrix multiplication using WebAssembly
export async function wasmMatrixMultiply(matrixA, matrixB, wasmFilePath) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not align for multiplication.');
  }

  const wasmModule = await compileWasm(wasmFilePath);
  const instance = await initWasmInstance(wasmModule);
  const { memory, multiply_matrices } = instance.exports;

  const memoryView = new Float64Array(memory.buffer);

  // Flatten matrices and copy into memory
  const offsetA = 0;
  const offsetB = rowsA * colsA;
  const offsetC = offsetB + rowsB * colsB;

  let index = offsetA;
  for (const row of matrixA) {
    for (const value of row) {
      memoryView[index++] = value;
    }
  }

  index = offsetB;
  for (const row of matrixB) {
    for (const value of row) {
      memoryView[index++] = value;
    }
  }

  multiply_matrices(offsetA, rowsA, colsA, offsetB, rowsB, colsB, offsetC);

  // Extract result matrix
  const result = [];
  for (let i = 0; i < rowsA; i++) {
    const row = [];
    for (let j = 0; j < colsB; j++) {
      row.push(memoryView[offsetC + i * colsB + j]);
    }
    result.push(row);
  }

  return result;
}

// Example utility to validate matrix dimensions
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new Error('Input must be a non-empty 2D array.');
  }

  const cols = matrix[0].length;
  for (const row of matrix) {
    if (row.length !== cols) {
      throw new Error('All rows in the matrix must have the same number of columns.');
    }
  }

  return true;
}