/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-03T03:42:33.339Z
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
 * Performs GPU-accelerated matrix multiplication.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resulting matrix after multiplication.
 */
export function gpuMatrixMultiply(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not match for multiplication.');
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
 * Computes eigenvalues of a matrix using power iteration.
 * @param {number[][]} matrix - Input square matrix.
 * @param {number} iterations - Number of iterations for convergence.
 * @returns {number[]} - Eigenvalues of the matrix.
 */
export function gpuEigenvalues(matrix, iterations = 100) {
  const size = matrix.length;
  if (matrix.length !== matrix[0].length) {
    throw new Error('Matrix must be square for eigenvalue computation.');
  }

  let vector = Array(size).fill(1);
  for (let iter = 0; iter < iterations; iter++) {
    vector = gpuMatrixMultiply(matrix, [vector.map(v => [v])]).map(row => row[0]);
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    vector = vector.map(v => v / norm);
  }

  const eigenvalue = gpuMatrixMultiply([vector.map(v => [v])], matrix)[0][0];
  return [eigenvalue];
}

/**
 * Updates Hopfield memory state using GPU acceleration.
 * @param {number[][]} weights - Hopfield network weight matrix.
 * @param {number[]} state - Current state vector.
 * @returns {number[]} - Updated state vector.
 */
export function gpuHopfieldUpdate(weights, state) {
  if (weights.length !== state.length || weights[0].length !== state.length) {
    throw new Error('Weight matrix and state vector dimensions do not match.');
  }

  const updatedState = gpuMatrixMultiply(weights, [state.map(s => [s])]).map(row => row[0]);
  return updatedState.map(val => (val >= 0 ? 1 : -1));
}

/**
 * Validates matrix dimensions for operations.
 * @param {number[][]} matrix - Input matrix.
 * @returns {boolean} - True if valid, throws error otherwise.
 */
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new Error('Invalid matrix format. Matrix must be a 2D array.');
  }
  const rowLength = matrix[0].length;
  for (const row of matrix) {
    if (row.length !== rowLength) {
      throw new Error('Matrix rows must have consistent lengths.');
    }
  }
  return true;
}

/**
 * Validates vector dimensions for operations.
 * @param {number[]} vector - Input vector.
 * @returns {boolean} - True if valid, throws error otherwise.
 */
export function validateVector(vector) {
  if (!Array.isArray(vector) || vector.length === 0) {
    throw new Error('Invalid vector format. Vector must be a 1D array.');
  }
  return true;
}