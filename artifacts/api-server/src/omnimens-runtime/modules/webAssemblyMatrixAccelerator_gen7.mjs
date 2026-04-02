/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webAssemblyMatrixAccelerator
 * Written: 2026-04-02T15:04:22.749Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webAssemblyMatrixAccelerator.mjs

import { readFile } from 'fs/promises';
import { join } from 'path';

// Utility to load and compile WebAssembly module
async function loadWasmModule(filePath) {
  const wasmPath = join(process.cwd(), filePath);
  const wasmBuffer = await readFile(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

// Utility to create a TypedArray from a flat JavaScript array
export function createTypedArray(array, type = Float64Array) {
  if (!Array.isArray(array)) {
    throw new TypeError('Input must be an array');
  }
  return new type(array);
}

// Function to multiply two matrices using WebAssembly
export async function wasmMatrixMultiply(matrixA, matrixB, wasmFile = 'matrix_multiply.wasm') {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new TypeError('Both inputs must be arrays');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not align for multiplication');
  }

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();

  const wasmInstance = await loadWasmModule(wasmFile);
  const { memory, multiply } = wasmInstance.instance.exports;

  const aOffset = 0;
  const bOffset = flatA.length * Float64Array.BYTES_PER_ELEMENT;
  const resultOffset = bOffset + flatB.length * Float64Array.BYTES_PER_ELEMENT;

  const memoryView = new Float64Array(memory.buffer);
  memoryView.set(flatA, aOffset / Float64Array.BYTES_PER_ELEMENT);
  memoryView.set(flatB, bOffset / Float64Array.BYTES_PER_ELEMENT);

  multiply(aOffset, bOffset, resultOffset, rowsA, colsA, colsB);

  const result = [];
  for (let i = 0; i < rowsA; i++) {
    result.push(
      Array.from(
        memoryView.subarray(
          resultOffset / Float64Array.BYTES_PER_ELEMENT + i * colsB,
          resultOffset / Float64Array.BYTES_PER_ELEMENT + (i + 1) * colsB
        )
      )
    );
  }

  return result;
}

// Utility to validate matrix dimensions
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new TypeError('Input must be a 2D array');
  }
  const colCount = matrix[0].length;
  for (const row of matrix) {
    if (row.length !== colCount) {
      throw new Error('All rows in the matrix must have the same number of columns');
    }
  }
  return true;
}

// Example usage function
export async function exampleUsage() {
  const matrixA = [
    [1, 2, 3],
    [4, 5, 6]
  ];

  const matrixB = [
    [7, 8],
    [9, 10],
    [11, 12]
  ];

  validateMatrix(matrixA);
  validateMatrix(matrixB);

  const result = await wasmMatrixMultiply(matrixA, matrixB);
  console.log('Result:', result);
  return result;
}