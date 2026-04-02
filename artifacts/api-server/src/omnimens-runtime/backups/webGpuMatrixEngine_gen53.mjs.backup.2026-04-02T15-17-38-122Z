/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-02T13:33:34.750Z
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
 * Multiplies two matrices using GPU acceleration.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} - The resulting matrix after multiplication.
 */
export function gpuMatrixMultiply(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('The number of columns in matrixA must match the number of rows in matrixB.');
  }

  const kernel = gpu.createKernel(function (a, b) {
    let sum = 0;
    for (let i = 0; i < this.constants.sharedDim; i++) {
      sum += a[this.thread.y][i] * b[i][this.thread.x];
    }
    return sum;
  })
    .setOutput([colsB, rowsA])
    .setConstants({ sharedDim: colsA });

  return kernel(matrixA, matrixB);
}

/**
 * Transposes a matrix using GPU acceleration.
 * @param {number[][]} matrix - The matrix to transpose.
 * @returns {number[][]} - The transposed matrix.
 */
export function gpuMatrixTranspose(matrix) {
  if (!Array.isArray(matrix)) {
    throw new Error('Input must be a 2D array.');
  }

  const rows = matrix.length;
  const cols = matrix[0].length;

  const kernel = gpu.createKernel(function (m) {
    return m[this.thread.x][this.thread.y];
  })
    .setOutput([rows, cols]);

  return kernel(matrix);
}

/**
 * Performs element-wise addition of two matrices using GPU acceleration.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} - The resulting matrix after addition.
 */
export function gpuMatrixAdd(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Both matrices must have the same dimensions.');
  }

  const kernel = gpu.createKernel(function (a, b) {
    return a[this.thread.y][this.thread.x] + b[this.thread.y][this.thread.x];
  })
    .setOutput([colsA, rowsA]);

  return kernel(matrixA, matrixB);
}

/**
 * Performs element-wise subtraction of two matrices using GPU acceleration.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} - The resulting matrix after subtraction.
 */
export function gpuMatrixSubtract(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Both matrices must have the same dimensions.');
  }

  const kernel = gpu.createKernel(function (a, b) {
    return a[this.thread.y][this.thread.x] - b[this.thread.y][this.thread.x];
  })
    .setOutput([colsA, rowsA]);

  return kernel(matrixA, matrixB);
}

/**
 * Generates an identity matrix of a given size.
 * @param {number} size - The size of the identity matrix.
 * @returns {number[][]} - The identity matrix.
 */
export function generateIdentityMatrix(size) {
  if (typeof size !== 'number' || size <= 0 || !Number.isInteger(size)) {
    throw new Error('Size must be a positive integer.');
  }

  const identityMatrix = Array.from({ length: size }, (_, i) => {
    return Array.from({ length: size }, (_, j) => (i === j ? 1 : 0));
  });

  return identityMatrix;
}
