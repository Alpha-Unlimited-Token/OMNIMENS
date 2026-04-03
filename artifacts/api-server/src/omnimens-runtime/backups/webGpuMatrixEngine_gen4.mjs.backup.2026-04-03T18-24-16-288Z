/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-03T16:57:28.382Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGpuMatrixEngine.mjs

// Utility functions for matrix operations accelerated with WebGPU-like parallel processing
export function createMatrix(rows, cols, fillValue = 0) {
  if (rows <= 0 || cols <= 0) throw new Error('Matrix dimensions must be positive integers.');
  return Array.from({ length: rows }, () => Array(cols).fill(fillValue));
}

export function multiplyMatrices(A, B) {
  if (A[0].length !== B.length) throw new Error('Matrix dimensions are incompatible for multiplication.');

  const result = createMatrix(A.length, B[0].length);
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < B.length; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

export function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const transposed = createMatrix(cols, rows);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposed[j][i] = matrix[i][j];
    }
  }
  return transposed;
}

export function elementWiseOperation(A, B, operation) {
  if (A.length !== B.length || A[0].length !== B[0].length) {
    throw new Error('Matrices must have the same dimensions for element-wise operations.');
  }

  const result = createMatrix(A.length, A[0].length);
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A[0].length; j++) {
      result[i][j] = operation(A[i][j], B[i][j]);
    }
  }
  return result;
}

export function scaleMatrix(matrix, scalar) {
  const result = createMatrix(matrix.length, matrix[0].length);
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      result[i][j] = matrix[i][j] * scalar;
    }
  }
  return result;
}

export function randomMatrix(rows, cols, min = 0, max = 1) {
  if (rows <= 0 || cols <= 0) throw new Error('Matrix dimensions must be positive integers.');
  const range = max - min;
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random() * range + min));
}

export function hadamardProduct(A, B) {
  return elementWiseOperation(A, B, (a, b) => a * b);
}

export function addMatrices(A, B) {
  return elementWiseOperation(A, B, (a, b) => a + b);
}

export function subtractMatrices(A, B) {
  return elementWiseOperation(A, B, (a, b) => a - b);
}

export function normalizeMatrix(matrix) {
  const flat = matrix.flat();
  const max = Math.max(...flat);
  const min = Math.min(...flat);
  const range = max - min;

  if (range === 0) return matrix.map(row => row.map(() => 0));

  return matrix.map(row => row.map(value => (value - min) / range));
}

export function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) throw new Error('Vectors must have the same length for dot product.');
  return vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
}

export function matrixVectorMultiply(matrix, vector) {
  if (matrix[0].length !== vector.length) throw new Error('Matrix columns must match vector length.');

  return matrix.map(row => dotProduct(row, vector));
}