/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuTensorEngine
 * Written: 2026-04-03T04:59:05.440Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuTensorEngine.mjs

import { GPU } from 'gpu.js';

const gpu = new GPU();

/**
 * Performs GPU-accelerated matrix multiplication.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} Resultant matrix after multiplication.
 */
export function gpuMatrixMultiply(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not align for multiplication.');
  }

  const multiplyKernel = gpu.createKernel(function (a, b) {
    let sum = 0;
    for (let i = 0; i < this.constants.size; i++) {
      sum += a[this.thread.y][i] * b[i][this.thread.x];
    }
    return sum;
  })
    .setOutput([matrixB[0].length, matrixA.length])
    .setConstants({ size: matrixB.length });

  return multiplyKernel(matrixA, matrixB);
}

/**
 * Performs GPU-accelerated 2D convolution.
 * @param {number[][]} input - Input matrix.
 * @param {number[][]} kernel - Convolution kernel.
 * @returns {number[][]} Resultant matrix after convolution.
 */
export function gpuConvolve(input, kernel) {
  const kernelHeight = kernel.length;
  const kernelWidth = kernel[0].length;
  const inputHeight = input.length;
  const inputWidth = input[0].length;

  const convolveKernel = gpu.createKernel(function (input, kernel) {
    let sum = 0;
    for (let i = 0; i < this.constants.kernelHeight; i++) {
      for (let j = 0; j < this.constants.kernelWidth; j++) {
        const x = this.thread.x + j - Math.floor(this.constants.kernelWidth / 2);
        const y = this.thread.y + i - Math.floor(this.constants.kernelHeight / 2);
        if (x >= 0 && x < this.constants.inputWidth && y >= 0 && y < this.constants.inputHeight) {
          sum += input[y][x] * kernel[i][j];
        }
      }
    }
    return sum;
  })
    .setOutput([inputWidth, inputHeight])
    .setConstants({
      kernelHeight,
      kernelWidth,
      inputHeight,
      inputWidth
    });

  return convolveKernel(input, kernel);
}

/**
 * Applies GPU-accelerated activation functions element-wise.
 * @param {number[][]} matrix - Input matrix.
 * @param {string} activation - Activation type ('relu', 'sigmoid', 'tanh').
 * @returns {number[][]} Matrix after activation.
 */
export function gpuActivate(matrix, activation) {
  let activationFunction;

  switch (activation) {
    case 'relu':
      activationFunction = function (x) {
        return Math.max(0, x);
      };
      break;
    case 'sigmoid':
      activationFunction = function (x) {
        return 1 / (1 + Math.exp(-x));
      };
      break;
    case 'tanh':
      activationFunction = function (x) {
        return Math.tanh(x);
      };
      break;
    default:
      throw new Error(`Unsupported activation function: ${activation}`);
  }

  const activateKernel = gpu.createKernel(function (matrix) {
    return this.constants.activationFunction(matrix[this.thread.y][this.thread.x]);
  })
    .setOutput([matrix[0].length, matrix.length])
    .setConstants({ activationFunction });

  return activateKernel(matrix);
}

/**
 * Utility function to validate matrix dimensions.
 * @param {number[][]} matrix - Matrix to validate.
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

/**
 * Utility function to generate a random matrix.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number[][]} Randomly generated matrix.
 */
export function generateRandomMatrix(rows, cols, min = 0, max = 1) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() * (max - min) + min)
  );
}
