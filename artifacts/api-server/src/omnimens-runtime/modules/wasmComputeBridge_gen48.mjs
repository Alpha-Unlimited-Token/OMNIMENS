/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmComputeBridge
 * Written: 2026-04-02T15:18:12.407Z
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

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';

let wasmInstance;

async function initializeWasm() {
  const wasmPath = join(__dirname, 'wasmComputeBridge.wasm');
  const wasmBuffer = await readFile(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const wasmExports = await WebAssembly.instantiate(wasmModule);
  wasmInstance = wasmExports.instance;
}

export async function loadWasm(basePath) {
  if (!wasmInstance) {
    const wasmPath = join(basePath, 'wasmComputeBridge.wasm');
    const wasmBuffer = await readFile(wasmPath);
    const wasmModule = await WebAssembly.compile(wasmBuffer);
    const wasmExports = await WebAssembly.instantiate(wasmModule);
    wasmInstance = wasmExports.instance;
  }
}

export function matrixMultiply(a, b) {
  if (!wasmInstance) {
    throw new Error('WASM module not initialized. Call loadWasm() first.');
  }

  const { matrix_multiply } = wasmInstance.exports;

  const rowsA = a.length;
  const colsA = a[0].length;
  const rowsB = b.length;
  const colsB = b[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const flatA = a.flat();
  const flatB = b.flat();
  const result = new Float64Array(rowsA * colsB);

  matrix_multiply(flatA, rowsA, colsA, flatB, rowsB, colsB, result);

  const output = [];
  for (let i = 0; i < rowsA; i++) {
    output.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return output;
}

export function tensorAdd(tensorA, tensorB) {
  if (!wasmInstance) {
    throw new Error('WASM module not initialized. Call loadWasm() first.');
  }

  const { tensor_add } = wasmInstance.exports;

  if (tensorA.length !== tensorB.length) {
    throw new Error('Tensor dimensions do not match for addition.');
  }

  const flatA = tensorA.flat();
  const flatB = tensorB.flat();
  const result = new Float64Array(flatA.length);

  tensor_add(flatA, flatB, result);

  return Array.from(result);
}

export function tensorScale(tensor, scalar) {
  if (!wasmInstance) {
    throw new Error('WASM module not initialized. Call loadWasm() first.');
  }

  const { tensor_scale } = wasmInstance.exports;

  const flatTensor = tensor.flat();
  const result = new Float64Array(flatTensor.length);

  tensor_scale(flatTensor, scalar, result);

  return Array.from(result);
}

export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new Error('Invalid matrix format. Must be a 2D array.');
  }
  const cols = matrix[0].length;
  for (const row of matrix) {
    if (row.length !== cols) {
      throw new Error('All rows in the matrix must have the same number of columns.');
    }
  }
}

export function validateTensor(tensor) {
  if (!Array.isArray(tensor) || tensor.length === 0) {
    throw new Error('Invalid tensor format. Must be a 1D or multi-dimensional array.');
  }
}