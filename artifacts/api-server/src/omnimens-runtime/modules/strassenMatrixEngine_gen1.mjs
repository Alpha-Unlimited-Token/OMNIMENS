/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: strassenMatrixEngine
 * Written: 2026-03-24T10:22:03.544Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// strassenMatrixEngine.mjs

// Strassen's algorithm implementation for efficient matrix multiplication
export function multiplyMatrices(A, B) {
  if (!Array.isArray(A) || !Array.isArray(B)) {
    throw new TypeError('Both inputs must be 2D arrays.');
  }
  const n = A.length;
  if (n === 0 || A[0].length !== n || B.length !== n || B[0].length !== n) {
    throw new Error('Matrices must be square and non-empty.');
  }
  if (n === 1) {
    return [[A[0][0] * B[0][0]]];
  }

  const mid = Math.floor(n / 2);

  const [A11, A12, A21, A22] = splitMatrix(A, mid);
  const [B11, B12, B21, B22] = splitMatrix(B, mid);

  const M1 = multiplyMatrices(addMatrices(A11, A22), addMatrices(B11, B22));
  const M2 = multiplyMatrices(addMatrices(A21, A22), B11);
  const M3 = multiplyMatrices(A11, subtractMatrices(B12, B22));
  const M4 = multiplyMatrices(A22, subtractMatrices(B21, B11));
  const M5 = multiplyMatrices(addMatrices(A11, A12), B22);
  const M6 = multiplyMatrices(subtractMatrices(A21, A11), addMatrices(B11, B12));
  const M7 = multiplyMatrices(subtractMatrices(A12, A22), addMatrices(B21, B22));

  const C11 = addMatrices(subtractMatrices(addMatrices(M1, M4), M5), M7);
  const C12 = addMatrices(M3, M5);
  const C21 = addMatrices(M2, M4);
  const C22 = addMatrices(subtractMatrices(addMatrices(M1, M3), M2), M6);

  return combineMatrices(C11, C12, C21, C22);
}

function splitMatrix(matrix, mid) {
  const A11 = matrix.slice(0, mid).map(row => row.slice(0, mid));
  const A12 = matrix.slice(0, mid).map(row => row.slice(mid));
  const A21 = matrix.slice(mid).map(row => row.slice(0, mid));
  const A22 = matrix.slice(mid).map(row => row.slice(mid));
  return [A11, A12, A21, A22];
}

function combineMatrices(C11, C12, C21, C22) {
  const n = C11.length;
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push([...C11[i], ...C12[i]]);
  }
  for (let i = 0; i < n; i++) {
    result.push([...C21[i], ...C22[i]]);
  }
  return result;
}

function addMatrices(A, B) {
  return A.map((row, i) => row.map((val, j) => val + B[i][j]));
}

function subtractMatrices(A, B) {
  return A.map((row, i) => row.map((val, j) => val - B[i][j]));
}

export function isSquareMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return false;
  }
  const n = matrix.length;
  return matrix.every(row => Array.isArray(row) && row.length === n);
}

export function generateRandomMatrix(size, min = 0, max = 10) {
  if (size <= 0 || !Number.isInteger(size)) {
    throw new Error('Size must be a positive integer.');
  }
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min)
  );
}
