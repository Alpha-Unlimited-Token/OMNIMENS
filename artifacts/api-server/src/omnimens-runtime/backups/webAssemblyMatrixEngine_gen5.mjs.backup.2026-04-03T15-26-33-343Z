/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webAssemblyMatrixEngine
 * Written: 2026-04-02T00:10:25.424Z
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
import { join, dirname } from 'path';

// Utility function to load and instantiate a WebAssembly module
async function loadWasmModule(wasmFilePath) {
  const wasmBuffer = await readFile(wasmFilePath);
  const wasmModule = await WebAssembly.instantiate(wasmBuffer, {});
  return wasmModule.instance.exports;
}

// Matrix multiplication using WebAssembly
export async function wasmMatrixMultiply(matrixA, matrixB, wasmFilePath) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const wasmExports = await loadWasmModule(wasmFilePath);

  // Flatten matrices for WebAssembly input
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float64Array(rowsA * colsB);

  // Allocate memory in WebAssembly
  const ptrA = wasmExports.malloc(flatA.length * Float64Array.BYTES_PER_ELEMENT);
  const ptrB = wasmExports.malloc(flatB.length * Float64Array.BYTES_PER_ELEMENT);
  const ptrResult = wasmExports.malloc(result.length * Float64Array.BYTES_PER_ELEMENT);

  // Copy data into WebAssembly memory
  const memory = new Float64Array(wasmExports.memory.buffer);
  memory.set(flatA, ptrA / Float64Array.BYTES_PER_ELEMENT);
  memory.set(flatB, ptrB / Float64Array.BYTES_PER_ELEMENT);

  // Perform matrix multiplication in WebAssembly
  wasmExports.matrixMultiply(ptrA, rowsA, colsA, ptrB, rowsB, colsB, ptrResult);

  // Copy result back to JavaScript
  result.set(memory.subarray(ptrResult / Float64Array.BYTES_PER_ELEMENT, ptrResult / Float64Array.BYTES_PER_ELEMENT + result.length));

  // Free WebAssembly memory
  wasmExports.free(ptrA);
  wasmExports.free(ptrB);
  wasmExports.free(ptrResult);

  // Reshape result into 2D array
  const outputMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    outputMatrix.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return outputMatrix;
}

// Utility function to create an identity matrix
export function createIdentityMatrix(size) {
  if (size <= 0 || !Number.isInteger(size)) {
    throw new Error('Size must be a positive integer.');
  }

  const identityMatrix = Array.from({ length: size }, (_, i) => {
    const row = new Array(size).fill(0);
    row[i] = 1;
    return row;
  });

  return identityMatrix;
}

// Utility function to validate a matrix
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new Error('Input must be a non-empty 2D array.');
  }

  const rowLength = matrix[0].length;
  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== rowLength) {
      throw new Error('All rows in the matrix must have the same length.');
    }
  }

  return true;
}
