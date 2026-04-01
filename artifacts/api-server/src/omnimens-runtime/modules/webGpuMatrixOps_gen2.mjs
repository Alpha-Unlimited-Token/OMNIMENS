/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixOps
 * Written: 2026-04-01T22:02:05.315Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGpuMatrixOps.mjs

import { GPU } from 'gpu.js';

const gpu = new GPU();

/**
 * Multiplies two matrices using WebGPU for acceleration.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resultant matrix after multiplication.
 */
export function gpuMatrixMultiply(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication');
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
 * Adds two matrices element-wise using WebGPU for acceleration.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resultant matrix after addition.
 */
export function gpuMatrixAdd(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Matrix dimensions do not match for addition');
  }

  const addKernel = gpu.createKernel(function (a, b) {
    return a[this.thread.y][this.thread.x] + b[this.thread.y][this.thread.x];
  })
    .setOutput([colsA, rowsA]);

  return addKernel(matrixA, matrixB);
}

/**
 * Transposes a matrix using WebGPU for acceleration.
 * @param {number[][]} matrix - Matrix to transpose.
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
 * Computes the Hadamard product (element-wise multiplication) of two matrices using WebGPU.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resultant matrix after element-wise multiplication.
 */
export function gpuMatrixHadamard(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Matrix dimensions do not match for Hadamard product');
  }

  const hadamardKernel = gpu.createKernel(function (a, b) {
    return a[this.thread.y][this.thread.x] * b[this.thread.y][this.thread.x];
  })
    .setOutput([colsA, rowsA]);

  return hadamardKernel(matrixA, matrixB);
}

/**
 * Validates a matrix for structural integrity.
 * @param {number[][]} matrix - Matrix to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return false;
  }
  const rowLength = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === rowLength);
}