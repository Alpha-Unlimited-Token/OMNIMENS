/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixEngine
 * Written: 2026-04-02T15:05:36.711Z
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

import { createHash } from 'crypto';

// Utility: Generate a unique hash for WASM cache keys
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

// Utility: Validate matrix dimensions for operations
export function validateMatrixDimensions(matrixA, matrixB, operation) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0]?.length || 0;
  const rowsB = matrixB.length;
  const colsB = matrixB[0]?.length || 0;

  if (operation === 'multiply' && colsA !== rowsB) {
    throw new Error(`Matrix multiplication requires colsA (${colsA}) to equal rowsB (${rowsB}).`);
  }
  if (operation === 'add' || operation === 'subtract') {
    if (rowsA !== rowsB || colsA !== colsB) {
      throw new Error(`Matrix addition/subtraction requires matrices of the same dimensions.`);
    }
  }
}

// Core: Perform matrix multiplication
export function multiplyMatrices(matrixA, matrixB) {
  validateMatrixDimensions(matrixA, matrixB, 'multiply');

  const result = Array(matrixA.length)
    .fill(null)
    .map(() => Array(matrixB[0].length).fill(0));

  for (let i = 0; i < matrixA.length; i++) {
    for (let j = 0; j < matrixB[0].length; j++) {
      for (let k = 0; k < matrixA[0].length; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  return result;
}

// Core: Perform matrix addition
export function addMatrices(matrixA, matrixB) {
  validateMatrixDimensions(matrixA, matrixB, 'add');

  return matrixA.map((row, i) => row.map((value, j) => value + matrixB[i][j]));
}

// Core: Perform matrix subtraction
export function subtractMatrices(matrixA, matrixB) {
  validateMatrixDimensions(matrixA, matrixB, 'subtract');

  return matrixA.map((row, i) => row.map((value, j) => value - matrixB[i][j]));
}

// Core: Transpose a matrix
export function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;

  const result = Array(cols)
    .fill(null)
    .map(() => Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }

  return result;
}

// Utility: Generate an identity matrix
export function generateIdentityMatrix(size) {
  if (size <= 0) {
    throw new Error('Size must be a positive integer.');
  }

  const result = Array(size)
    .fill(null)
    .map((_, i) => Array(size).fill(0).map((_, j) => (i === j ? 1 : 0)));

  return result;
}

// Utility: Check if a matrix is square
export function isSquareMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;
  return rows === cols;
}

// Utility: Compute the determinant of a square matrix (recursive for small matrices)
export function computeDeterminant(matrix) {
  if (!isSquareMatrix(matrix)) {
    throw new Error('Determinant can only be computed for square matrices.');
  }

  const size = matrix.length;

  if (size === 1) return matrix[0][0];
  if (size === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

  let determinant = 0;
  for (let i = 0; i < size; i++) {
    const minor = matrix.slice(1).map(row => row.filter((_, j) => j !== i));
    determinant += matrix[0][i] * computeDeterminant(minor) * (i % 2 === 0 ? 1 : -1);
  }

  return determinant;
}

// Placeholder: WASM integration (to be implemented)
export function wasmAcceleratedOperation(operation, matrixA, matrixB) {
  // Future implementation: Compile and load WASM modules for optimized computation
  throw new Error('WASM acceleration not yet implemented.');
}
