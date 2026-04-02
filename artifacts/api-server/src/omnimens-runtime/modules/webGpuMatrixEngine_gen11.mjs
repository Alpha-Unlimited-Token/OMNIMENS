/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-02T15:04:29.026Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { GPU } from 'gpu.js';

/**
 * Initialize GPU.js instance for WebGPU-based computations.
 */
const gpu = new GPU({ mode: 'gpu' });

/**
 * Perform GPU-accelerated matrix multiplication.
 * @param {number[][]} matrixA - First matrix (2D array).
 * @param {number[][]} matrixB - Second matrix (2D array).
 * @returns {number[][]} Resultant matrix after multiplication.
 */
export function gpuMatrixMultiply(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const kernel = gpu.createKernel(function (a, b) {
    let sum = 0;
    for (let k = 0; k < this.constants.sharedDim; k++) {
      sum += a[this.thread.y][k] * b[k][this.thread.x];
    }
    return sum;
  })
    .setOutput([matrixB[0].length, matrixA.length])
    .setConstants({ sharedDim: matrixA[0].length });

  return kernel(matrixA, matrixB);
}

/**
 * Transpose a matrix on the GPU.
 * @param {number[][]} matrix - Input matrix (2D array).
 * @returns {number[][]} Transposed matrix.
 */
export function gpuMatrixTranspose(matrix) {
  const kernel = gpu.createKernel(function (m) {
    return m[this.thread.x][this.thread.y];
  })
    .setOutput([matrix.length, matrix[0].length]);

  return kernel(matrix);
}

/**
 * Compute the element-wise addition of two matrices on the GPU.
 * @param {number[][]} matrixA - First matrix (2D array).
 * @param {number[][]} matrixB - Second matrix (2D array).
 * @returns {number[][]} Resultant matrix after addition.
 */
export function gpuMatrixAdd(matrixA, matrixB) {
  if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
    throw new Error('Matrix dimensions do not match for addition.');
  }

  const kernel = gpu.createKernel(function (a, b) {
    return a[this.thread.y][this.thread.x] + b[this.thread.y][this.thread.x];
  })
    .setOutput([matrixA[0].length, matrixA.length]);

  return kernel(matrixA, matrixB);
}

/**
 * Compute the Hadamard (element-wise) product of two matrices on the GPU.
 * @param {number[][]} matrixA - First matrix (2D array).
 * @param {number[][]} matrixB - Second matrix (2D array).
 * @returns {number[][]} Resultant matrix after Hadamard product.
 */
export function gpuMatrixHadamard(matrixA, matrixB) {
  if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
    throw new Error('Matrix dimensions do not match for Hadamard product.');
  }

  const kernel = gpu.createKernel(function (a, b) {
    return a[this.thread.y][this.thread.x] * b[this.thread.y][this.thread.x];
  })
    .setOutput([matrixA[0].length, matrixA.length]);

  return kernel(matrixA, matrixB);
}

/**
 * Compute the scalar multiplication of a matrix on the GPU.
 * @param {number[][]} matrix - Input matrix (2D array).
 * @param {number} scalar - Scalar value to multiply each element by.
 * @returns {number[][]} Resultant matrix after scalar multiplication.
 */
export function gpuMatrixScalarMultiply(matrix, scalar) {
  const kernel = gpu.createKernel(function (m, s) {
    return m[this.thread.y][this.thread.x] * s;
  })
    .setOutput([matrix[0].length, matrix.length]);

  return kernel(matrix, scalar);
}

/**
 * Compute the sum of all elements in a matrix on the GPU.
 * @param {number[][]} matrix - Input matrix (2D array).
 * @returns {number} Sum of all elements in the matrix.
 */
export function gpuMatrixSum(matrix) {
  const kernel = gpu.createKernel(function (m) {
    return m[this.thread.y][this.thread.x];
  })
    .setOutput([matrix[0].length, matrix.length]);

  const result = kernel(matrix);
  return result.reduce((sum, row) => sum + row.reduce((rowSum, val) => rowSum + val, 0), 0);
}

/**
 * Utility function to validate matrix dimensions.
 * @param {number[][]} matrix - Input matrix (2D array).
 * @returns {boolean} True if valid, throws error otherwise.
 */
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
    throw new Error('Input must be a 2D array.');
  }

  const rowLength = matrix[0].length;
  for (const row of matrix) {
    if (row.length !== rowLength) {
      throw new Error('All rows in the matrix must have the same length.');
    }
  }

  return true;
}
