/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixOps
 * Written: 2026-04-01T22:02:36.192Z
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

import { readFile } from 'fs/promises';
import { resolve } from 'path';

// Utility to load WebAssembly binary
async function loadWasm(filePath) {
  const wasmBuffer = await readFile(filePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const instance = await WebAssembly.instantiate(wasmModule);
  return instance;
}

// Initialize WebAssembly module
const wasmFilePath = resolve('./matrix_ops.wasm');
const wasmInstancePromise = loadWasm(wasmFilePath);

// Matrix multiplication using WebAssembly
export async function matrixMultiply(a, b, rowsA, colsA, colsB) {
  const wasmInstance = await wasmInstancePromise;
  const { memory, matrix_multiply } = wasmInstance.exports;

  if (a.length !== rowsA * colsA || b.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match for multiplication');
  }

  const result = new Float32Array(rowsA * colsB);
  const aOffset = 0;
  const bOffset = a.length * Float32Array.BYTES_PER_ELEMENT;
  const resultOffset = bOffset + b.length * Float32Array.BYTES_PER_ELEMENT;

  const memoryView = new Float32Array(memory.buffer);
  memoryView.set(a, aOffset / Float32Array.BYTES_PER_ELEMENT);
  memoryView.set(b, bOffset / Float32Array.BYTES_PER_ELEMENT);

  matrix_multiply(aOffset, bOffset, resultOffset, rowsA, colsA, colsB);

  result.set(
    new Float32Array(
      memory.buffer,
      resultOffset,
      rowsA * colsB
    )
  );

  return result;
}

// Matrix addition using WebAssembly
export async function matrixAdd(a, b, rows, cols) {
  const wasmInstance = await wasmInstancePromise;
  const { memory, matrix_add } = wasmInstance.exports;

  if (a.length !== rows * cols || b.length !== rows * cols) {
    throw new Error('Matrix dimensions do not match for addition');
  }

  const result = new Float32Array(rows * cols);
  const aOffset = 0;
  const bOffset = a.length * Float32Array.BYTES_PER_ELEMENT;
  const resultOffset = bOffset + b.length * Float32Array.BYTES_PER_ELEMENT;

  const memoryView = new Float32Array(memory.buffer);
  memoryView.set(a, aOffset / Float32Array.BYTES_PER_ELEMENT);
  memoryView.set(b, bOffset / Float32Array.BYTES_PER_ELEMENT);

  matrix_add(aOffset, bOffset, resultOffset, rows, cols);

  result.set(
    new Float32Array(
      memory.buffer,
      resultOffset,
      rows * cols
    )
  );

  return result;
}

// Matrix transpose using WebAssembly
export async function matrixTranspose(a, rows, cols) {
  const wasmInstance = await wasmInstancePromise;
  const { memory, matrix_transpose } = wasmInstance.exports;

  if (a.length !== rows * cols) {
    throw new Error('Matrix dimensions do not match for transpose');
  }

  const result = new Float32Array(rows * cols);
  const aOffset = 0;
  const resultOffset = a.length * Float32Array.BYTES_PER_ELEMENT;

  const memoryView = new Float32Array(memory.buffer);
  memoryView.set(a, aOffset / Float32Array.BYTES_PER_ELEMENT);

  matrix_transpose(aOffset, resultOffset, rows, cols);

  result.set(
    new Float32Array(
      memory.buffer,
      resultOffset,
      rows * cols
    )
  );

  return result;
}

// Export WebAssembly loader for testing or extension
export const wasmLoader = wasmInstancePromise;