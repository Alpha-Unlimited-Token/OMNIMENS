/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-02T14:24:01.666Z
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

import { performance } from 'perf_hooks';

/**
 * Block-wise matrix multiplication optimized for parallelism.
 * @param {Float32Array} A - First matrix (flattened).
 * @param {Float32Array} B - Second matrix (flattened).
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A.
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Float32Array} - Result matrix (flattened).
 */
export function matrixMultiplyBlockWise(A, B, rowsA, colsA, colsB) {
  if (A.length !== rowsA * colsA || B.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match their data lengths.');
  }

  const blockSize = 64; // Size of blocks for decomposition
  const result = new Float32Array(rowsA * colsB);

  for (let rowBlock = 0; rowBlock < rowsA; rowBlock += blockSize) {
    for (let colBlock = 0; colBlock < colsB; colBlock += blockSize) {
      for (let kBlock = 0; kBlock < colsA; kBlock += blockSize) {
        for (let i = rowBlock; i < Math.min(rowBlock + blockSize, rowsA); i++) {
          for (let j = colBlock; j < Math.min(colBlock + blockSize, colsB); j++) {
            let sum = 0;
            for (let k = kBlock; k < Math.min(kBlock + blockSize, colsA); k++) {
              sum += A[i * colsA + k] * B[k * colsB + j];
            }
            result[i * colsB + j] += sum;
          }
        }
      }
    }
  }

  return result;
}

/**
 * Transposes a matrix for optimized memory access.
 * @param {Float32Array} matrix - Input matrix (flattened).
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Float32Array} - Transposed matrix (flattened).
 */
export function transposeMatrix(matrix, rows, cols) {
  if (matrix.length !== rows * cols) {
    throw new Error('Matrix dimensions do not match its data length.');
  }

  const transposed = new Float32Array(rows * cols);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposed[j * rows + i] = matrix[i * cols + j];
    }
  }

  return transposed;
}

/**
 * Measures the execution time of a function for performance benchmarking.
 * @param {Function} func - The function to measure.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {Object} - Execution time in milliseconds and function result.
 */
export function measureExecutionTime(func, ...args) {
  const start = performance.now();
  const result = func(...args);
  const end = performance.now();

  return {
    executionTimeMs: end - start,
    result
  };
}

/**
 * Validates matrix dimensions for compatibility in operations.
 * @param {number} rowsA - Rows in matrix A.
 * @param {number} colsA - Columns in matrix A.
 * @param {number} rowsB - Rows in matrix B.
 * @param {number} colsB - Columns in matrix B.
 * @returns {boolean} - Whether the dimensions are compatible.
 */
export function validateMatrixDimensions(rowsA, colsA, rowsB, colsB) {
  return colsA === rowsB;
}

/**
 * Generates a random matrix for testing purposes.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {Float32Array} - Random matrix (flattened).
 */
export function generateRandomMatrix(rows, cols) {
  const matrix = new Float32Array(rows * cols);
  for (let i = 0; i < matrix.length; i++) {
    matrix[i] = Math.random();
  }
  return matrix;
}