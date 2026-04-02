/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: strassenOptimizedMatrixEngine
 * Written: 2026-04-02T14:46:03.262Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// strassenOptimizedMatrixEngine.mjs

// Function to add two matrices
export function addMatrices(matrixA, matrixB) {
  const rows = matrixA.length;
  const cols = matrixA[0].length;
  const result = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i][j] = matrixA[i][j] + matrixB[i][j];
    }
  }

  return result;
}

// Function to subtract two matrices
export function subtractMatrices(matrixA, matrixB) {
  const rows = matrixA.length;
  const cols = matrixA[0].length;
  const result = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i][j] = matrixA[i][j] - matrixB[i][j];
    }
  }

  return result;
}

// Function to split a matrix into quadrants
export function splitMatrix(matrix) {
  const n = matrix.length;
  const mid = Math.floor(n / 2);

  const topLeft = matrix.slice(0, mid).map(row => row.slice(0, mid));
  const topRight = matrix.slice(0, mid).map(row => row.slice(mid));
  const bottomLeft = matrix.slice(mid).map(row => row.slice(0, mid));
  const bottomRight = matrix.slice(mid).map(row => row.slice(mid));

  return { topLeft, topRight, bottomLeft, bottomRight };
}

// Function to combine quadrants into a single matrix
export function combineMatrices(topLeft, topRight, bottomLeft, bottomRight) {
  const n = topLeft.length;
  const result = Array.from({ length: n * 2 }, () => Array(n * 2).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[i][j] = topLeft[i][j];
      result[i][j + n] = topRight[i][j];
      result[i + n][j] = bottomLeft[i][j];
      result[i + n][j + n] = bottomRight[i][j];
    }
  }

  return result;
}

// Strassen's algorithm for matrix multiplication
export function strassenMultiply(matrixA, matrixB) {
  const n = matrixA.length;

  // Base case: 1x1 matrix
  if (n === 1) {
    return [[matrixA[0][0] * matrixB[0][0]]];
  }

  // Split matrices into quadrants
  const { topLeft: A11, topRight: A12, bottomLeft: A21, bottomRight: A22 } = splitMatrix(matrixA);
  const { topLeft: B11, topRight: B12, bottomLeft: B21, bottomRight: B22 } = splitMatrix(matrixB);

  // Compute the 7 products using Strassen's formula
  const M1 = strassenMultiply(addMatrices(A11, A22), addMatrices(B11, B22));
  const M2 = strassenMultiply(addMatrices(A21, A22), B11);
  const M3 = strassenMultiply(A11, subtractMatrices(B12, B22));
  const M4 = strassenMultiply(A22, subtractMatrices(B21, B11));
  const M5 = strassenMultiply(addMatrices(A11, A12), B22);
  const M6 = strassenMultiply(subtractMatrices(A21, A11), addMatrices(B11, B12));
  const M7 = strassenMultiply(subtractMatrices(A12, A22), addMatrices(B21, B22));

  // Combine results into final quadrants
  const C11 = addMatrices(subtractMatrices(addMatrices(M1, M4), M5), M7);
  const C12 = addMatrices(M3, M5);
  const C21 = addMatrices(M2, M4);
  const C22 = addMatrices(subtractMatrices(addMatrices(M1, M3), M2), M6);

  // Combine quadrants into a single result matrix
  return combineMatrices(C11, C12, C21, C22);
}

// Utility function to pad matrices to the next power of 2
export function padMatrix(matrix) {
  const n = matrix.length;
  const m = matrix[0].length;
  const size = Math.pow(2, Math.ceil(Math.log2(Math.max(n, m))));

  const padded = Array.from({ length: size }, () => Array(size).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      padded[i][j] = matrix[i][j];
    }
  }

  return padded;
}

// Wrapper function to handle non-square or non-power-of-2 matrices
export function multiplyMatrices(matrixA, matrixB) {
  const paddedA = padMatrix(matrixA);
  const paddedB = padMatrix(matrixB);

  const result = strassenMultiply(paddedA, paddedB);

  // Trim the result back to the original size
  const rows = matrixA.length;
  const cols = matrixB[0].length;
  return result.slice(0, rows).map(row => row.slice(0, cols));
}