/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmComputeEngine
 * Written: 2026-04-02T14:10:01.019Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmComputeEngine.mjs

import { readFile } from 'fs/promises';
import { resolve } from 'path';

// Utility to load and compile WebAssembly modules
export async function loadWasmModule(filePath) {
  const absolutePath = resolve(filePath);
  const wasmBuffer = await readFile(absolutePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

// Matrix multiplication using WebAssembly
export async function wasmMatrixMultiply(wasmInstance, matrixA, matrixB) {
  const { memory, multiplyMatrices } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not allow multiplication');
  }

  const resultRows = rowsA;
  const resultCols = colsB;

  // Flatten matrices into 1D arrays
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float64Array(resultRows * resultCols);

  // Allocate memory in WASM
  const offsetA = 0;
  const offsetB = offsetA + flatA.length * Float64Array.BYTES_PER_ELEMENT;
  const offsetResult = offsetB + flatB.length * Float64Array.BYTES_PER_ELEMENT;

  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(flatA, offsetA / Float64Array.BYTES_PER_ELEMENT);
  wasmMemory.set(flatB, offsetB / Float64Array.BYTES_PER_ELEMENT);

  // Call WASM function
  multiplyMatrices(
    offsetA,
    rowsA,
    colsA,
    offsetB,
    rowsB,
    colsB,
    offsetResult
  );

  // Extract result from WASM memory
  for (let i = 0; i < result.length; i++) {
    result[i] = wasmMemory[offsetResult / Float64Array.BYTES_PER_ELEMENT + i];
  }

  // Convert result back to 2D array
  const resultMatrix = [];
  for (let i = 0; i < resultRows; i++) {
    resultMatrix.push(result.slice(i * resultCols, (i + 1) * resultCols));
  }

  return resultMatrix;
}

// Example utility to validate matrix dimensions
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new Error('Invalid matrix format');
  }
  const cols = matrix[0].length;
  for (const row of matrix) {
    if (row.length !== cols) {
      throw new Error('Matrix rows must have the same number of columns');
    }
  }
}

// Example: Load WASM and perform matrix multiplication
export async function exampleUsage() {
  const wasmPath = './linear_algebra.wasm'; // Replace with actual file path
  const wasmInstance = await loadWasmModule(wasmPath);

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

  const result = await wasmMatrixMultiply(wasmInstance, matrixA, matrixB);
  console.log('Matrix Multiplication Result:', result);
}
