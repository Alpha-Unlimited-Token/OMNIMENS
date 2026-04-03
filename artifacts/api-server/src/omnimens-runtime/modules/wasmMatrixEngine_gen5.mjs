/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixEngine
 * Written: 2026-04-03T16:30:22.610Z
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

import { performance } from 'node:perf_hooks';

/**
 * Utility function to split a matrix into quadrants.
 * @param {Float64Array} matrix - The input matrix.
 * @param {number} size - The size of the matrix (assumes square matrix).
 * @returns {Object} - Quadrants: { A, B, C, D }.
 */
export function splitMatrix(matrix, size) {
  const half = size / 2;
  const A = new Float64Array(half * half);
  const B = new Float64Array(half * half);
  const C = new Float64Array(half * half);
  const D = new Float64Array(half * half);

  for (let i = 0; i < half; i++) {
    for (let j = 0; j < half; j++) {
      const idx = i * size + j;
      A[i * half + j] = matrix[idx];
      B[i * half + j] = matrix[idx + half];
      C[i * half + j] = matrix[idx + size * half];
      D[i * half + j] = matrix[idx + size * half + half];
    }
  }

  return { A, B, C, D };
}

/**
 * Utility function to combine quadrants into a single matrix.
 * @param {Object} quadrants - Quadrants: { A, B, C, D }.
 * @param {number} size - The size of the output matrix.
 * @returns {Float64Array} - Combined matrix.
 */
export function combineMatrix(quadrants, size) {
  const half = size / 2;
  const matrix = new Float64Array(size * size);

  for (let i = 0; i < half; i++) {
    for (let j = 0; j < half; j++) {
      const idx = i * size + j;
      matrix[idx] = quadrants.A[i * half + j];
      matrix[idx + half] = quadrants.B[i * half + j];
      matrix[idx + size * half] = quadrants.C[i * half + j];
      matrix[idx + size * half + half] = quadrants.D[i * half + j];
    }
  }

  return matrix;
}

/**
 * Strassen's matrix multiplication algorithm.
 * @param {Float64Array} matrix1 - First input matrix.
 * @param {Float64Array} matrix2 - Second input matrix.
 * @param {number} size - Size of the matrices (assumes square matrices).
 * @returns {Float64Array} - Resultant matrix.
 */
export function strassenMultiply(matrix1, matrix2, size) {
  if (size === 1) {
    return new Float64Array([matrix1[0] * matrix2[0]]);
  }

  const { A: A1, B: B1, C: C1, D: D1 } = splitMatrix(matrix1, size);
  const { A: A2, B: B2, C: C2, D: D2 } = splitMatrix(matrix2, size);

  const half = size / 2;

  const P1 = strassenMultiply(A1, subtractMatrix(B2, D2, half), half);
  const P2 = strassenMultiply(addMatrix(A1, B1, half), D2, half);
  const P3 = strassenMultiply(addMatrix(C1, D1, half), A2, half);
  const P4 = strassenMultiply(D1, subtractMatrix(C2, A2, half), half);
  const P5 = strassenMultiply(addMatrix(A1, D1, half), addMatrix(A2, D2, half), half);
  const P6 = strassenMultiply(subtractMatrix(B1, D1, half), addMatrix(C2, D2, half), half);
  const P7 = strassenMultiply(subtractMatrix(A1, C1, half), addMatrix(A2, B2, half), half);

  const A = addMatrix(subtractMatrix(addMatrix(P5, P4, half), P2, half), P6, half);
  const B = addMatrix(P1, P2, half);
  const C = addMatrix(P3, P4, half);
  const D = subtractMatrix(subtractMatrix(addMatrix(P5, P1, half), P3, half), P7, half);

  return combineMatrix({ A, B, C, D }, size);
}

/**
 * Utility function to add two matrices.
 * @param {Float64Array} matrix1 - First matrix.
 * @param {Float64Array} matrix2 - Second matrix.
 * @param {number} size - Size of the matrices.
 * @returns {Float64Array} - Resultant matrix.
 */
export function addMatrix(matrix1, matrix2, size) {
  const result = new Float64Array(size * size);
  for (let i = 0; i < size * size; i++) {
    result[i] = matrix1[i] + matrix2[i];
  }
  return result;
}

/**
 * Utility function to subtract two matrices.
 * @param {Float64Array} matrix1 - First matrix.
 * @param {Float64Array} matrix2 - Second matrix.
 * @param {number} size - Size of the matrices.
 * @returns {Float64Array} - Resultant matrix.
 */
export function subtractMatrix(matrix1, matrix2, size) {
  const result = new Float64Array(size * size);
  for (let i = 0; i < size * size; i++) {
    result[i] = matrix1[i] - matrix2[i];
  }
  return result;
}

/**
 * Benchmark function to measure performance of matrix multiplication.
 * @param {Function} multiplyFunction - Matrix multiplication function.
 * @param {Float64Array} matrix1 - First matrix.
 * @param {Float64Array} matrix2 - Second matrix.
 * @param {number} size - Size of the matrices.
 * @returns {Object} - Benchmark results.
 */
export function benchmarkMatrixMultiplication(multiplyFunction, matrix1, matrix2, size) {
  const start = performance.now();
  const result = multiplyFunction(matrix1, matrix2, size);
  const end = performance.now();

  return {
    result,
    timeTaken: end - start
  };
}