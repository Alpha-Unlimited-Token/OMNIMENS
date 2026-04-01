/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixEngine
 * Written: 2026-04-01T22:22:56.475Z
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

// Utility to load WebAssembly binary and compile it
async function loadWasmModule(filePath) {
  const wasmBuffer = await readFile(filePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

// Generic matrix multiplication function using WebAssembly
export async function wasmMatrixMultiply(matrixA, matrixB, wasmFilePath) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays representing matrices.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not align for multiplication.');
  }

  const wasmInstance = await loadWasmModule(wasmFilePath);
  const { memory, multiply_matrices } = wasmInstance.instance.exports;

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float64Array(rowsA * colsB);

  const bufferA = new Float64Array(memory.buffer, 0, flatA.length);
  const bufferB = new Float64Array(memory.buffer, flatA.length * 8, flatB.length);
  const bufferResult = new Float64Array(memory.buffer, (flatA.length + flatB.length) * 8, result.length);

  bufferA.set(flatA);
  bufferB.set(flatB);

  multiply_matrices(rowsA, colsA, colsB);

  result.set(bufferResult);

  // Reshape result into 2D array
  const reshapedResult = [];
  for (let i = 0; i < rowsA; i++) {
    reshapedResult.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return reshapedResult;
}

// Utility to perform matrix addition
export function matrixAdd(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays representing matrices.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Matrix dimensions must match for addition.');
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

// Utility to perform matrix transposition
export function matrixTranspose(matrix) {
  if (!Array.isArray(matrix)) {
    throw new Error('Input must be a 2D array representing a matrix.');
  }

  const rows = matrix.length;
  const cols = matrix[0].length;

  const result = [];
  for (let i = 0; i < cols; i++) {
    const row = [];
    for (let j = 0; j < rows; j++) {
      row.push(matrix[j][i]);
    }
    result.push(row);
  }

  return result;
}

// Exported utilities
export const utilities = {
  wasmMatrixMultiply,
  matrixAdd,
  matrixTranspose
};