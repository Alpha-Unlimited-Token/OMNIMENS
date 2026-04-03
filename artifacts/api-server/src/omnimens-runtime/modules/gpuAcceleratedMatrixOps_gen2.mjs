/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-03T16:10:14.181Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuAcceleratedMatrixOps.mjs

import { performance } from 'node:perf_hooks';

/**
 * Utility function to create a GPU-accelerated matrix multiplication kernel.
 * @returns {Object} GPU.js kernel instance for matrix multiplication.
 */
function createMatrixMultiplicationKernel() {
  const gpu = new GPU();

  return gpu.createKernel(function (a, b) {
    let sum = 0;
    for (let k = 0; k < this.constants.size; k++) {
      sum += a[this.thread.y][k] * b[k][this.thread.x];
    }
    return sum;
  })
    .setOutput([this.constants.size, this.constants.size])
    .setConstants({ size: a.length });
}

/**
 * Perform GPU-accelerated matrix multiplication.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} Resultant matrix after multiplication.
 */
export function gpuMatrixMultiply(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new TypeError('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not align for multiplication.');
  }

  const kernel = createMatrixMultiplicationKernel();
  const result = kernel(matrixA, matrixB);

  return result;
}

/**
 * Generate a random matrix with specified dimensions.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {number[][]} Randomly generated matrix.
 */
export function generateRandomMatrix(rows, cols) {
  if (rows <= 0 || cols <= 0) {
    throw new Error('Matrix dimensions must be positive integers.');
  }

  const matrix = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push(Math.random());
    }
    matrix.push(row);
  }

  return matrix;
}

/**
 * Measure the performance of matrix multiplication using the GPU.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {Object} Performance metrics including time taken.
 */
export function measureGpuPerformance(matrixA, matrixB) {
  const start = performance.now();
  const result = gpuMatrixMultiply(matrixA, matrixB);
  const end = performance.now();

  return {
    timeTakenMs: end - start,
    result
  };
}

/**
 * Validate if a matrix is well-formed.
 * @param {number[][]} matrix - Matrix to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return false;
  }

  const rowLength = matrix[0].length;
  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== rowLength) {
      return false;
    }
  }

  return true;
}

/**
 * Transpose a matrix.
 * @param {number[][]} matrix - Matrix to transpose.
 * @returns {number[][]} Transposed matrix.
 */
export function transposeMatrix(matrix) {
  if (!validateMatrix(matrix)) {
    throw new Error('Invalid matrix format.');
  }

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