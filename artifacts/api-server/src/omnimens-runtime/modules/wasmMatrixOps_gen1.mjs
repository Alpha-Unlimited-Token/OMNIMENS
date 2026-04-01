/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixOps
 * Written: 2026-04-01T21:54:38.269Z
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
import { join } from 'path';

// Utility to load and compile WebAssembly module
export async function loadWasmModule(filePath) {
  const wasmPath = join(process.cwd(), filePath);
  const wasmBuffer = await readFile(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

// Matrix multiplication using WebAssembly
export async function wasmMatrixMultiply(matrixA, matrixB, wasmFilePath = './matrix_ops.wasm') {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new TypeError('Both matrixA and matrixB must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix multiplication is not possible: columns of A must match rows of B.');
  }

  const wasmInstance = await loadWasmModule(wasmFilePath);
  const { memory, matrixMultiply } = wasmInstance.instance.exports;

  // Flatten matrices into 1D arrays for WebAssembly
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const resultSize = rowsA * colsB;
  const resultArray = new Float64Array(resultSize);

  // Allocate memory for matrices in WebAssembly
  const aPtr = matrixMultiply.alloc(flatA.length);
  const bPtr = matrixMultiply.alloc(flatB.length);
  const resultPtr = matrixMultiply.alloc(resultSize);

  // Copy matrices into WebAssembly memory
  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(flatA, aPtr / Float64Array.BYTES_PER_ELEMENT);
  wasmMemory.set(flatB, bPtr / Float64Array.BYTES_PER_ELEMENT);

  // Perform matrix multiplication
  matrixMultiply(aPtr, bPtr, resultPtr, rowsA, colsA, colsB);

  // Copy result back to JavaScript
  resultArray.set(
    wasmMemory.subarray(
      resultPtr / Float64Array.BYTES_PER_ELEMENT,
      resultPtr / Float64Array.BYTES_PER_ELEMENT + resultSize
    )
  );

  // Free allocated memory in WebAssembly
  matrixMultiply.free(aPtr);
  matrixMultiply.free(bPtr);
  matrixMultiply.free(resultPtr);

  // Convert result back to 2D array
  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(resultArray.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

// Example utility for identity matrix generation
export function createIdentityMatrix(size) {
  if (typeof size !== 'number' || size <= 0 || !Number.isInteger(size)) {
    throw new TypeError('Size must be a positive integer.');
  }

  const identityMatrix = Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
  );

  return identityMatrix;
}

// Example utility for matrix transposition
export function transposeMatrix(matrix) {
  if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
    throw new TypeError('Input must be a 2D array.');
  }

  const rows = matrix.length;
  const cols = matrix[0].length;

  const transposed = Array.from({ length: cols }, (_, i) =>
    Array.from({ length: rows }, (_, j) => matrix[j][i])
  );

  return transposed;
}