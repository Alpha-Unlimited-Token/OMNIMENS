/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmComputeEngine
 * Written: 2026-04-03T13:57:39.608Z
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
import { join } from 'path';

// Utility to load and compile a WebAssembly module
export async function loadWasmModule(filePath) {
  const wasmBuffer = await readFile(filePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule, {});
}

// Perform matrix multiplication using WebAssembly
export async function wasmMatrixMultiply(wasmFilePath, matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const wasmInstance = await loadWasmModule(wasmFilePath);
  const { memory, multiplyMatrices } = wasmInstance.instance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float64Array(rowsA * colsB);

  const memoryView = new Float64Array(memory.buffer);

  // Copy matrices into WASM memory
  const offsetA = 0;
  const offsetB = offsetA + flatA.length;
  const offsetResult = offsetB + flatB.length;

  memoryView.set(flatA, offsetA);
  memoryView.set(flatB, offsetB);

  // Perform multiplication
  multiplyMatrices(offsetA, rowsA, colsA, offsetB, colsB, offsetResult);

  // Extract result matrix
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      result[i * colsB + j] = memoryView[offsetResult + i * colsB + j];
    }
  }

  // Convert flat result back to 2D array
  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

// Generic utility to validate matrix structure
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new Error('Matrix must be a non-empty 2D array.');
  }

  const rowLength = matrix[0].length;
  if (!matrix.every(row => Array.isArray(row) && row.length === rowLength)) {
    throw new Error('All rows in the matrix must have the same length.');
  }

  return true;
}

// Example utility to generate an identity matrix
export function generateIdentityMatrix(size) {
  if (size <= 0 || !Number.isInteger(size)) {
    throw new Error('Size must be a positive integer.');
  }

  const identityMatrix = Array.from({ length: size }, (_, i) => {
    return Array.from({ length: size }, (_, j) => (i === j ? 1 : 0));
  });

  return identityMatrix;
}