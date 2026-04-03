/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-03T02:31:08.347Z
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

import { GPU } from 'gpu.js';

const gpu = new GPU();

/**
 * Creates a matrix with specified dimensions and fills it with random values.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {number[][]} - Randomly initialized matrix.
 */
export function createRandomMatrix(rows, cols) {
  if (rows <= 0 || cols <= 0) {
    throw new Error('Matrix dimensions must be positive integers.');
  }
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random()));
}

/**
 * Multiplies two matrices using GPU acceleration.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resulting matrix after multiplication.
 */
export function gpuMatrixMultiply(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not align for multiplication.');
  }

  const multiplyKernel = gpu.createKernel(function (a, b) {
    let sum = 0;
    for (let i = 0; i < this.constants.sharedDim; i++) {
      sum += a[this.thread.y][i] * b[i][this.thread.x];
    }
    return sum;
  })
    .setOutput([colsB, rowsA])
    .setConstants({ sharedDim: colsA });

  return multiplyKernel(matrixA, matrixB);
}

/**
 * Computes the transpose of a matrix using GPU acceleration.
 * @param {number[][]} matrix - Input matrix.
 * @returns {number[][]} - Transposed matrix.
 */
export function gpuMatrixTranspose(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  const transposeKernel = gpu.createKernel(function (m) {
    return m[this.thread.x][this.thread.y];
  })
    .setOutput([rows, cols]);

  return transposeKernel(matrix);
}

/**
 * Computes the dot product of two vectors using GPU acceleration.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Dot product result.
 */
export function gpuDotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length for dot product.');
  }

  const dotKernel = gpu.createKernel(function (a, b) {
    return a[this.thread.x] * b[this.thread.x];
  })
    .setOutput([vectorA.length]);

  const result = dotKernel(vectorA, vectorB);
  return result.reduce((sum, value) => sum + value, 0);
}

/**
 * Applies a convolution operation using GPU acceleration.
 * @param {number[][]} matrix - Input matrix.
 * @param {number[][]} kernel - Convolution kernel.
 * @returns {number[][]} - Resulting matrix after convolution.
 */
export function gpuConvolution(matrix, kernel) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const kernelSize = kernel.length;

  const convolutionKernel = gpu.createKernel(function (matrix, kernel) {
    const halfKernel = Math.floor(this.constants.kernelSize / 2);
    let sum = 0;

    for (let i = -halfKernel; i <= halfKernel; i++) {
      for (let j = -halfKernel; j <= halfKernel; j++) {
        const x = this.thread.x + i;
        const y = this.thread.y + j;

        if (x >= 0 && x < this.constants.rows && y >= 0 && y < this.constants.cols) {
          sum += matrix[y][x] * kernel[halfKernel + i][halfKernel + j];
        }
      }
    }

    return sum;
  })
    .setOutput([cols, rows])
    .setConstants({ rows, cols, kernelSize });

  return convolutionKernel(matrix, kernel);
}

/**
 * Validates matrix dimensions and ensures all rows have the same length.
 * @param {number[][]} matrix - Matrix to validate.
 * @returns {boolean} - True if valid, otherwise throws an error.
 */
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new Error('Input must be a non-empty 2D array.');
  }

  const cols = matrix[0].length;
  for (const row of matrix) {
    if (row.length !== cols) {
      throw new Error('All rows in the matrix must have the same number of columns.');
    }
  }

  return true;
}
