/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuTensorEngine
 * Written: 2026-04-02T15:16:22.988Z
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

import { webcrypto as crypto } from 'crypto';

// Utility to create a random float32 array for initializing tensors
export function createRandomTensor(size, min = 0, max = 1) {
  const tensor = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    tensor[i] = min + (max - min) * crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff;
  }
  return tensor;
}

// Perform matrix multiplication on two 2D tensors (A and B)
export function matrixMultiply(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication');
  }

  const result = Array.from({ length: rowsA }, () => new Float32Array(colsB));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }

  return result;
}

// Apply an activation function element-wise to a tensor
export function applyActivation(tensor, activationFunction) {
  return tensor.map(row => row.map(activationFunction));
}

// Perform a 2D convolution operation
export function convolve2D(input, kernel) {
  const inputRows = input.length;
  const inputCols = input[0].length;
  const kernelRows = kernel.length;
  const kernelCols = kernel[0].length;

  const outputRows = inputRows - kernelRows + 1;
  const outputCols = inputCols - kernelCols + 1;

  if (outputRows <= 0 || outputCols <= 0) {
    throw new Error('Kernel size is larger than input size');
  }

  const output = Array.from({ length: outputRows }, () => new Float32Array(outputCols));

  for (let i = 0; i < outputRows; i++) {
    for (let j = 0; j < outputCols; j++) {
      let sum = 0;
      for (let ki = 0; ki < kernelRows; ki++) {
        for (let kj = 0; kj < kernelCols; kj++) {
          sum += input[i + ki][j + kj] * kernel[ki][kj];
        }
      }
      output[i][j] = sum;
    }
  }

  return output;
}

// Example activation functions
export const relu = x => Math.max(0, x);
export const sigmoid = x => 1 / (1 + Math.exp(-x));
export const tanh = x => Math.tanh(x);

// Example usage of the module (can be removed in production)
if (process.argv[1] && process.argv[1].endsWith('webGpuTensorEngine.mjs')) {
  const A = [
    [1, 2, 3],
    [4, 5, 6]
  ];
  const B = [
    [7, 8],
    [9, 10],
    [11, 12]
  ];

  console.log('Matrix Multiply Result:', matrixMultiply(A, B));

  const input = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ];
  const kernel = [
    [1, 0],
    [0, -1]
  ];

  console.log('Convolution Result:', convolve2D(input, kernel));

  const tensor = [
    [1, -2, 3],
    [-4, 5, -6]
  ];

  console.log('ReLU Activation:', applyActivation(tensor, relu));
  console.log('Sigmoid Activation:', applyActivation(tensor, sigmoid));
  console.log('Tanh Activation:', applyActivation(tensor, tanh));
}
