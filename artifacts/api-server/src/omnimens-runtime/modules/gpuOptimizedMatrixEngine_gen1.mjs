/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_26
 * Name: gpuOptimizedMatrixEngine
 * Purpose: Accelerate matrix operations using advanced algorithms optimized for CPU-based execution.
 * Description: Accelerates matrix operations with Strassen's algorithm and sparse matrix optimization for multi-agent utility.
 * Migrated: 2026-04-01T22:23:20.245Z
 */

// gpuOptimizedMatrixEngine.mjs

import { performance } from 'perf_hooks';

/**
 * Splits a matrix into four submatrices for Strassen's algorithm.
 * @param {number[][]} matrix - The input matrix.
 * @returns {Array} - An array of four submatrices [A11, A12, A21, A22].
 */
export function splitMatrix(matrix) {
  const n = matrix.length;
  const mid = Math.floor(n / 2);
  const A11 = [], A12 = [], A21 = [], A22 = [];

  for (let i = 0; i < mid; i++) {
    A11.push(matrix[i].slice(0, mid));
    A12.push(matrix[i].slice(mid));
  }
  for (let i = mid; i < n; i++) {
    A21.push(matrix[i].slice(0, mid));
    A22.push(matrix[i].slice(mid));
  }

  return [A11, A12, A21, A22];
}

/**
 * Adds two matrices.
 * @param {number[][]} A - First matrix.
 * @param {number[][]} B - Second matrix.
 * @returns {number[][]} - The resulting matrix after addition.
 */
export function addMatrices(A, B) {
  return A.map((row, i) => row.map((val, j) => val + B[i][j]));
}

/**
 * Subtracts one matrix from another.
 * @param {number[][]} A - First matrix.
 * @param {number[][]} B - Second matrix.
 * @returns {number[][]} - The resulting matrix after subtraction.
 */
export function subtractMatrices(A, B) {
  return A.map((row, i) => row.map((val, j) => val - B[i][j]));
}

/**
 * Multiplies two matrices using Strassen's algorithm.
 * @param {number[][]} A - First matrix.
 * @param {number[][]} B - Second matrix.
 * @returns {number[][]} - The resulting matrix after multiplication.
 */
export function strassenMultiply(A, B) {
  const n = A.length;

  if (n === 1) {
    return [[A[0][0] * B[0][0]]];
  }

  const [A11, A12, A21, A22] = splitMatrix(A);
  const [B11, B12, B21, B22] = splitMatrix(B);

  const M1 = strassenMultiply(addMatrices(A11, A22), addMatrices(B11, B22));
  const M2 = strassenMultiply(addMatrices(A21, A22), B11);
  const M3 = strassenMultiply(A11, subtractMatrices(B12, B22));
  const M4 = strassenMultiply(A22, subtractMatrices(B21, B11));
  const M5 = strassenMultiply(addMatrices(A11, A12), B22);
  const M6 = strassenMultiply(subtractMatrices(A21, A11), addMatrices(B11, B12));
  const M7 = strassenMultiply(subtractMatrices(A12, A22), addMatrices(B21, B22));

  const C11 = addMatrices(subtractMatrices(addMatrices(M1, M4), M5), M7);
  const C12 = addMatrices(M3, M5);
  const C21 = addMatrices(M2, M4);
  const C22 = addMatrices(subtractMatrices(addMatrices(M1, M3), M2), M6);

  const result = [];
  for (let i = 0; i < n / 2; i++) {
    result.push([...C11[i], ...C12[i]]);
  }
  for (let i = 0; i < n / 2; i++) {
    result.push([...C21[i], ...C22[i]]);
  }

  return result;
}

/**
 * Optimized sparse matrix multiplication.
 * @param {Object} sparseA - Sparse representation of matrix A.
 * @param {Object} sparseB - Sparse representation of matrix B.
 * @param {number} size - Size of the matrices (assumed square).
 * @returns {Object} - Sparse representation of the result matrix.
 */
export function sparseMultiply(sparseA, sparseB, size) {
  const result = {};

  for (const [i, row] of Object.entries(sparseA)) {
    for (const [j, valA] of Object.entries(row)) {
      if (sparseB[j]) {
        for (const [k, valB] of Object.entries(sparseB[j])) {
          result[i] = result[i] || {};
          result[i][k] = (result[i][k] || 0) + valA * valB;
        }
      }
    }
  }

  return result;
}

/**
 * Measures execution time of a matrix operation.
 * @param {Function} operation - The matrix operation function.
 * @param {...any} args - Arguments for the operation.
 * @returns {Object} - Result and execution time in milliseconds.
 */
export function measureExecutionTime(operation, ...args) {
  const start = performance.now();
  const result = operation(...args);
  const end = performance.now();
  return { result, time: end - start };
}