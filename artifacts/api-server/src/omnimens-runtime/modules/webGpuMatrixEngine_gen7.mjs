/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-03T02:41:50.437Z
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

// Initialize GPU.js instance
const gpu = new GPU();

/**
 * Multiply two matrices using WebGPU acceleration.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resultant matrix after multiplication.
 */
export function matrixMultiply(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not align for multiplication.');
  }

  const multiplyKernel = gpu.createKernel(function (a, b) {
    let sum = 0;
    for (let i = 0; i < this.constants.sharedDim; i++) {
      sum += a[this.thread.y][i] * b[i][this.thread.x];
    }
    return sum;
  })
    .setOutput([matrixB[0].length, matrixA.length])
    .setConstants({ sharedDim: matrixA[0].length });

  return multiplyKernel(matrixA, matrixB);
}

/**
 * Compute the transpose of a matrix.
 * @param {number[][]} matrix - Input matrix.
 * @returns {number[][]} - Transposed matrix.
 */
export function matrixTranspose(matrix) {
  const transposeKernel = gpu.createKernel(function (m) {
    return m[this.thread.x][this.thread.y];
  })
    .setOutput([matrix.length, matrix[0].length]);

  return transposeKernel(matrix);
}

/**
 * Compute element-wise addition of two matrices.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resultant matrix after addition.
 */
export function matrixAdd(matrixA, matrixB) {
  if (
    matrixA.length !== matrixB.length ||
    matrixA[0].length !== matrixB[0].length
  ) {
    throw new Error('Matrix dimensions do not match for addition.');
  }

  const addKernel = gpu.createKernel(function (a, b) {
    return a[this.thread.y][this.thread.x] + b[this.thread.y][this.thread.x];
  })
    .setOutput([matrixA[0].length, matrixA.length]);

  return addKernel(matrixA, matrixB);
}

/**
 * Compute the element-wise Hadamard product of two matrices.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resultant matrix after Hadamard product.
 */
export function matrixHadamard(matrixA, matrixB) {
  if (
    matrixA.length !== matrixB.length ||
    matrixA[0].length !== matrixB[0].length
  ) {
    throw new Error('Matrix dimensions do not match for Hadamard product.');
  }

  const hadamardKernel = gpu.createKernel(function (a, b) {
    return a[this.thread.y][this.thread.x] * b[this.thread.y][this.thread.x];
  })
    .setOutput([matrixA[0].length, matrixA.length]);

  return hadamardKernel(matrixA, matrixB);
}

/**
 * Compute the trace of a square matrix.
 * @param {number[][]} matrix - Input square matrix.
 * @returns {number} - Trace of the matrix.
 */
export function matrixTrace(matrix) {
  if (matrix.length !== matrix[0].length) {
    throw new Error('Matrix is not square. Trace can only be computed for square matrices.');
  }

  let trace = 0;
  for (let i = 0; i < matrix.length; i++) {
    trace += matrix[i][i];
  }
  return trace;
}

/**
 * Compute the identity matrix of a given size.
 * @param {number} size - Size of the identity matrix.
 * @returns {number[][]} - Identity matrix.
 */
export function identityMatrix(size) {
  if (size <= 0) {
    throw new Error('Size must be a positive integer.');
  }

  const identity = Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
  );

  return identity;
}
