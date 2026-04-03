/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-03T09:44:47.239Z
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

import { createHash } from 'crypto';

/**
 * Generates a unique identifier for GPU buffers to avoid conflicts.
 * @param {string} input - A string to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateBufferId(input) {
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

/**
 * Creates a WebGPU-compatible matrix buffer.
 * @param {Array<number>} data - The 1D array representing the matrix.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Object} - An object representing the buffer metadata.
 */
export function createMatrixBuffer(data, rows, cols) {
  if (data.length !== rows * cols) {
    throw new Error('Data size does not match matrix dimensions.');
  }
  return {
    id: generateBufferId(JSON.stringify(data)),
    rows,
    cols,
    data
  };
}

/**
 * Performs matrix multiplication using a pure algorithm (no GPU execution).
 * @param {Object} matrixA - First matrix buffer.
 * @param {Object} matrixB - Second matrix buffer.
 * @returns {Object} - Resultant matrix buffer.
 */
export function multiplyMatrices(matrixA, matrixB) {
  if (matrixA.cols !== matrixB.rows) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  const result = [];
  for (let i = 0; i < matrixA.rows; i++) {
    for (let j = 0; j < matrixB.cols; j++) {
      let sum = 0;
      for (let k = 0; k < matrixA.cols; k++) {
        sum += matrixA.data[i * matrixA.cols + k] * matrixB.data[k * matrixB.cols + j];
      }
      result.push(sum);
    }
  }

  return createMatrixBuffer(result, matrixA.rows, matrixB.cols);
}

/**
 * Computes the eigenvalues of a 2x2 matrix using a closed-form solution.
 * @param {Object} matrix - A 2x2 matrix buffer.
 * @returns {Array<number>} - Array of eigenvalues.
 */
export function computeEigenvalues(matrix) {
  if (matrix.rows !== 2 || matrix.cols !== 2) {
    throw new Error('Eigenvalue computation is only supported for 2x2 matrices.');
  }

  const [a, b, c, d] = matrix.data;
  const trace = a + d;
  const determinant = a * d - b * c;
  const discriminant = Math.sqrt(trace * trace - 4 * determinant);

  return [(trace + discriminant) / 2, (trace - discriminant) / 2];
}

/**
 * Applies a simple 2D convolution to a matrix using a kernel.
 * @param {Object} matrix - Input matrix buffer.
 * @param {Object} kernel - Kernel matrix buffer.
 * @returns {Object} - Resultant matrix buffer after convolution.
 */
export function applyConvolution(matrix, kernel) {
  const outputRows = matrix.rows - kernel.rows + 1;
  const outputCols = matrix.cols - kernel.cols + 1;

  if (outputRows <= 0 || outputCols <= 0) {
    throw new Error('Kernel size is larger than the input matrix.');
  }

  const result = [];
  for (let i = 0; i < outputRows; i++) {
    for (let j = 0; j < outputCols; j++) {
      let sum = 0;
      for (let ki = 0; ki < kernel.rows; ki++) {
        for (let kj = 0; kj < kernel.cols; kj++) {
          const matrixValue = matrix.data[(i + ki) * matrix.cols + (j + kj)];
          const kernelValue = kernel.data[ki * kernel.cols + kj];
          sum += matrixValue * kernelValue;
        }
      }
      result.push(sum);
    }
  }

  return createMatrixBuffer(result, outputRows, outputCols);
}

/**
 * Utility function to pretty-print a matrix buffer.
 * @param {Object} matrix - Matrix buffer to print.
 * @returns {string} - Formatted string representation of the matrix.
 */
export function printMatrix(matrix) {
  let output = '';
  for (let i = 0; i < matrix.rows; i++) {
    output += matrix.data.slice(i * matrix.cols, (i + 1) * matrix.cols).join(' ') + '\n';
  }
  return output.trim();
}