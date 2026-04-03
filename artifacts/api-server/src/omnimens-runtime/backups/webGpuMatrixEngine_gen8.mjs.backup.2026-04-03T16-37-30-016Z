/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-03T09:44:47.226Z
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
 * @returns {number[][]} The resulting matrix after multiplication.
 */
export function gpuMatrixMultiply(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not match for multiplication.');
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
 * Calculates the eigenvalues of a square matrix using the power iteration method.
 * @param {number[][]} matrix - The input square matrix.
 * @param {number} iterations - Number of iterations for convergence.
 * @returns {number[]} The dominant eigenvalue and corresponding eigenvector.
 */
export function gpuEigenvalueDecomposition(matrix, iterations = 100) {
  if (matrix.length !== matrix[0].length) {
    throw new Error('Matrix must be square for eigenvalue decomposition.');
  }

  const size = matrix.length;
  let vector = Array(size).fill(1);

  for (let iter = 0; iter < iterations; iter++) {
    const result = gpuMatrixMultiply([vector], matrix)[0];
    const norm = Math.sqrt(result.reduce((sum, val) => sum + val * val, 0));
    vector = result.map((val) => val / norm);
  }

  const eigenvalue = gpuMatrixMultiply([vector], matrix)[0].reduce((sum, val, i) => sum + val * vector[i], 0);
  return { eigenvalue, eigenvector: vector };
}

/**
 * Updates a Hopfield network pattern using GPU acceleration.
 * @param {number[][]} weights - The weight matrix of the Hopfield network.
 * @param {number[]} state - The current state vector.
 * @returns {number[]} The updated state vector.
 */
export function gpuHopfieldUpdate(weights, state) {
  if (weights.length !== weights[0].length || weights.length !== state.length) {
    throw new Error('Weight matrix must be square and match the state vector size.');
  }

  const updateKernel = gpu.createKernel(function (weights, state) {
    let sum = 0;
    for (let i = 0; i < this.constants.size; i++) {
      sum += weights[this.thread.x][i] * state[i];
    }
    return sum > 0 ? 1 : -1;
  })
    .setOutput([state.length])
    .setConstants({ size: state.length });

  return updateKernel(weights, state);
}

/**
 * Validates if a matrix is valid for GPU operations.
 * @param {number[][]} matrix - The matrix to validate.
 * @returns {boolean} True if valid, otherwise false.
 */
export function isValidMatrix(matrix) {
  return (
    Array.isArray(matrix) &&
    matrix.length > 0 &&
    matrix.every((row) => Array.isArray(row) && row.length === matrix[0].length)
  );
}