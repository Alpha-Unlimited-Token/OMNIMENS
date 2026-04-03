/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webAssemblyMatrixEngine
 * Written: 2026-04-03T15:26:33.342Z
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

// Utility function to load and compile WebAssembly module
export async function loadWasmModule(filePath) {
  const wasmPath = join(process.cwd(), filePath);
  const wasmBuffer = await readFile(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
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
    throw new Error('Number of columns in matrixA must equal number of rows in matrixB.');
  }

  const wasmInstance = await loadWasmModule(wasmFilePath);
  const { memory, multiplyMatrices } = wasmInstance.instance.exports;

  const inputOffsetA = 0;
  const inputOffsetB = rowsA * colsA * 4;
  const outputOffset = inputOffsetB + rowsB * colsB * 4;

  const memoryView = new Float32Array(memory.buffer);

  // Flatten and copy matrixA to memory
  matrixA.flat().forEach((val, idx) => {
    memoryView[inputOffsetA / 4 + idx] = val;
  });

  // Flatten and copy matrixB to memory
  matrixB.flat().forEach((val, idx) => {
    memoryView[inputOffsetB / 4 + idx] = val;
  });

  // Call the WebAssembly function
  multiplyMatrices(inputOffsetA, rowsA, colsA, inputOffsetB, rowsB, colsB, outputOffset);

  // Extract the result matrix from memory
  const result = [];
  for (let i = 0; i < rowsA; i++) {
    result.push(
      Array.from(memoryView.subarray(
        outputOffset / 4 + i * colsB,
        outputOffset / 4 + (i + 1) * colsB
      ))
    );
  }

  return result;
}

// Function to validate matrices for general-purpose use
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new Error('Matrix must be a non-empty 2D array.');
  }
  const rowLength = matrix[0].length;
  if (!matrix.every(row => Array.isArray(row) && row.length === rowLength)) {
    throw new Error('All rows in the matrix must have the same length.');
  }
}

// Example generic utility for transposing a matrix
export function transposeMatrix(matrix) {
  validateMatrix(matrix);
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

// Example generic utility for creating an identity matrix
export function createIdentityMatrix(size) {
  if (size <= 0 || !Number.isInteger(size)) {
    throw new Error('Size must be a positive integer.');
  }
  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
  );
}