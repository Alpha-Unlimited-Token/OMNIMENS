/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixAccelerator
 * Written: 2026-04-02T00:10:20.045Z
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
import { join } from 'path';

let wasmInstance;

// Helper function to resolve the path to the WebAssembly file
function resolveWasmPath() {
  return join(process.cwd(), 'blas.wasm');
}

// Load and compile the WebAssembly module
async function loadWasmModule() {
  const wasmPath = resolveWasmPath();
  const wasmBuffer = await readFile(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const wasmInstance = await WebAssembly.instantiate(wasmModule);
  return wasmInstance;
}

// Initialize the WebAssembly instance
async function initialize() {
  if (!wasmInstance) {
    wasmInstance = await loadWasmModule();
  }
}

// Matrix multiplication utility
export async function matrixMultiply(a, b, rowsA, colsA, colsB) {
  await initialize();

  const { memory, matrix_multiply } = wasmInstance.exports;
  const buffer = new Float64Array(memory.buffer);

  const offsetA = 0;
  const offsetB = rowsA * colsA;
  const offsetC = offsetB + colsA * colsB;

  buffer.set(a, offsetA);
  buffer.set(b, offsetB);

  matrix_multiply(offsetA, offsetB, offsetC, rowsA, colsA, colsB);

  return buffer.slice(offsetC, offsetC + rowsA * colsB);
}

// Matrix inversion utility
export async function matrixInvert(matrix, size) {
  await initialize();

  const { memory, matrix_invert } = wasmInstance.exports;
  const buffer = new Float64Array(memory.buffer);

  const offsetMatrix = 0;
  const offsetResult = size * size;

  buffer.set(matrix, offsetMatrix);

  const success = matrix_invert(offsetMatrix, offsetResult, size);
  if (!success) {
    throw new Error('Matrix inversion failed: Matrix may be singular.');
  }

  return buffer.slice(offsetResult, offsetResult + size * size);
}

// Eigenvalue computation utility
export async function computeEigenvalues(matrix, size) {
  await initialize();

  const { memory, compute_eigenvalues } = wasmInstance.exports;
  const buffer = new Float64Array(memory.buffer);

  const offsetMatrix = 0;
  const offsetEigenvalues = size * size;

  buffer.set(matrix, offsetMatrix);

  compute_eigenvalues(offsetMatrix, offsetEigenvalues, size);

  return buffer.slice(offsetEigenvalues, offsetEigenvalues + size);
}

// Export initialization for preloading
export const preloadWasm = initialize;