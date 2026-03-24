/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixEngine
 * Written: 2026-03-24T22:22:05.849Z
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

import { readFileSync } from 'fs';
import { join } from 'path';

// Utility function to load and compile WebAssembly module
export async function loadWasmModule(filePath) {
  const wasmBuffer = readFileSync(filePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const wasmInstance = await WebAssembly.instantiate(wasmModule);
  return wasmInstance.exports;
}

// Function to perform matrix multiplication using WebAssembly
export async function wasmMatrixMultiply(wasmFilePath, matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not align for multiplication.');
  }

  const wasmExports = await loadWasmModule(wasmFilePath);

  const flatMatrixA = matrixA.flat();
  const flatMatrixB = matrixB.flat();

  const resultPointer = wasmExports.matrixMultiply(
    flatMatrixA,
    rowsA,
    colsA,
    flatMatrixB,
    rowsB,
    colsB
  );

  const resultArray = new Float32Array(
    wasmExports.memory.buffer,
    resultPointer,
    rowsA * colsB
  );

  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(resultArray.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

// Generic utility for validating matrix dimensions
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new Error('Matrix must be a non-empty 2D array.');
  }
  const rowLength = matrix[0].length;
  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== rowLength) {
      throw new Error('All rows in the matrix must have the same length.');
    }
  }
}

// Example utility for creating a random matrix
export function generateRandomMatrix(rows, cols, min = 0, max = 1) {
  if (rows <= 0 || cols <= 0) {
    throw new Error('Rows and columns must be positive integers.');
  }
  const matrix = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push(Math.random() * (max - min) + min);
    }
    matrix.push(row);
  }
  return matrix;
}

// Example utility for matrix transposition
export function transposeMatrix(matrix) {
  validateMatrix(matrix);
  const rows = matrix.length;
  const cols = matrix[0].length;
  const transposed = [];
  for (let i = 0; i < cols; i++) {
    const row = [];
    for (let j = 0; j < rows; j++) {
      row.push(matrix[j][i]);
    }
    transposed.push(row);
  }
  return transposed;
}