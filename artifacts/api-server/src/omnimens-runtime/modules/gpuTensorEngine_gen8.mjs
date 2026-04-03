/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuTensorEngine
 * Written: 2026-04-03T06:06:36.057Z
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

import { webcrypto as crypto } from 'node:crypto';

/**
 * Performs matrix multiplication on two 2D tensors.
 * @param {number[][]} A - First matrix.
 * @param {number[][]} B - Second matrix.
 * @returns {number[][]} - Resultant matrix after multiplication.
 */
export function matrixMultiply(A, B) {
  if (A[0].length !== B.length) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const result = Array.from({ length: A.length }, () => Array(B[0].length).fill(0));

  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B[0].length; j++) {
      for (let k = 0; k < B.length; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return result;
}

/**
 * Performs 2D convolution on an input matrix with a kernel.
 * @param {number[][]} input - Input matrix.
 * @param {number[][]} kernel - Convolution kernel.
 * @returns {number[][]} - Resultant matrix after convolution.
 */
export function convolution2D(input, kernel) {
  const kernelHeight = kernel.length;
  const kernelWidth = kernel[0].length;
  const outputHeight = input.length - kernelHeight + 1;
  const outputWidth = input[0].length - kernelWidth + 1;

  const output = Array.from({ length: outputHeight }, () => Array(outputWidth).fill(0));

  for (let i = 0; i < outputHeight; i++) {
    for (let j = 0; j < outputWidth; j++) {
      for (let ki = 0; ki < kernelHeight; ki++) {
        for (let kj = 0; kj < kernelWidth; kj++) {
          output[i][j] += input[i + ki][j + kj] * kernel[ki][kj];
        }
      }
    }
  }

  return output;
}

/**
 * Updates Hopfield memory state using asynchronous updates.
 * @param {number[][]} weights - Weight matrix.
 * @param {number[]} state - Current state vector.
 * @returns {number[]} - Updated state vector.
 */
export function hopfieldUpdate(weights, state) {
  const newState = [...state];

  for (let i = 0; i < state.length; i++) {
    let sum = 0;
    for (let j = 0; j < weights[i].length; j++) {
      sum += weights[i][j] * state[j];
    }
    newState[i] = sum >= 0 ? 1 : -1; // Binary threshold activation
  }

  return newState;
}

/**
 * Generates a random tensor of specified dimensions.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {number[][]} - Randomly generated tensor.
 */
export function generateRandomTensor(rows, cols) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random()));
}

/**
 * Normalizes a tensor to have values between 0 and 1.
 * @param {number[][]} tensor - Input tensor.
 * @returns {number[][]} - Normalized tensor.
 */
export function normalizeTensor(tensor) {
  const flatTensor = tensor.flat();
  const min = Math.min(...flatTensor);
  const max = Math.max(...flatTensor);

  return tensor.map(row => row.map(value => (value - min) / (max - min)));
}

/**
 * Computes the dot product of two vectors.
 * @param {number[]} vec1 - First vector.
 * @param {number[]} vec2 - Second vector.
 * @returns {number} - Dot product.
 */
export function dotProduct(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vector dimensions do not match for dot product.');
  }

  return vec1.reduce((sum, val, idx) => sum + val * vec2[idx], 0);
}

/**
 * Generates a random binary vector.
 * @param {number} length - Length of the vector.
 * @returns {number[]} - Random binary vector.
 */
export function generateRandomBinaryVector(length) {
  return Array.from({ length }, () => (Math.random() > 0.5 ? 1 : -1));
}