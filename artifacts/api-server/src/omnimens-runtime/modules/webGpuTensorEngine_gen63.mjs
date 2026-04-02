/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuTensorEngine
 * Written: 2026-04-02T13:35:34.124Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGpuTensorEngine.mjs

import { GPU } from 'gpu.js';

const gpu = new GPU();

/**
 * Performs parallelized matrix multiplication using WebGPU.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} Resultant matrix after multiplication.
 */
export function matrixMultiply(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not match for multiplication');
  }

  const multiplyKernel = gpu.createKernel(function (a, b) {
    let sum = 0;
    for (let i = 0; i < this.constants.size; i++) {
      sum += a[this.thread.y][i] * b[i][this.thread.x];
    }
    return sum;
  })
    .setOutput([matrixB[0].length, matrixA.length])
    .setConstants({ size: matrixA[0].length });

  return multiplyKernel(matrixA, matrixB);
}

/**
 * Performs a 2D convolution operation on an input matrix with a given kernel.
 * @param {number[][]} inputMatrix - The input matrix.
 * @param {number[][]} kernel - The convolution kernel.
 * @returns {number[][]} Convolved matrix.
 */
export function convolve2D(inputMatrix, kernel) {
  const kernelSize = kernel.length;
  const halfKernel = Math.floor(kernelSize / 2);

  const convolveKernel = gpu.createKernel(function (input, kernel) {
    let sum = 0;
    for (let i = -this.constants.halfKernel; i <= this.constants.halfKernel; i++) {
      for (let j = -this.constants.halfKernel; j <= this.constants.halfKernel; j++) {
        const x = this.thread.x + j;
        const y = this.thread.y + i;
        if (x >= 0 && x < this.constants.width && y >= 0 && y < this.constants.height) {
          sum += input[y][x] * kernel[i + this.constants.halfKernel][j + this.constants.halfKernel];
        }
      }
    }
    return sum;
  })
    .setOutput([inputMatrix[0].length, inputMatrix.length])
    .setConstants({
      halfKernel: halfKernel,
      width: inputMatrix[0].length,
      height: inputMatrix.length
    });

  return convolveKernel(inputMatrix, kernel);
}

/**
 * Approximates eigenvalues of a square matrix using the power iteration method.
 * @param {number[][]} matrix - The square matrix.
 * @param {number} iterations - Number of iterations for approximation.
 * @returns {number[]} Approximated eigenvalues.
 */
export function eigenvalues(matrix, iterations = 100) {
  if (matrix.length !== matrix[0].length) {
    throw new Error('Matrix must be square to compute eigenvalues');
  }

  const size = matrix.length;
  let vector = Array(size).fill(1);

  for (let iter = 0; iter < iterations; iter++) {
    const newVector = matrixMultiply([vector], matrix)[0];
    const norm = Math.sqrt(newVector.reduce((sum, val) => sum + val * val, 0));
    vector = newVector.map(val => val / norm);
  }

  const eigenvalue = matrixMultiply([vector], matrix)[0].reduce((sum, val, i) => sum + val * vector[i], 0);
  return [eigenvalue];
}

/**
 * Utility function to validate matrix dimensions.
 * @param {number[][]} matrix - The matrix to validate.
 * @returns {boolean} True if valid, otherwise false.
 */
export function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
    return false;
  }
  const rowLength = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === rowLength);
}
