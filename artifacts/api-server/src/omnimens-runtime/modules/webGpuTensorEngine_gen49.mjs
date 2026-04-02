/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuTensorEngine
 * Written: 2026-04-02T15:16:58.962Z
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

import { randomUUID } from 'crypto';

/**
 * Simulates GPU-accelerated tensor operations using WebGPU-like parallel processing.
 * Provides matrix multiplication, convolution, and activation functions.
 */

export const createMatrix = (rows, cols, fillValue = 0) => {
  return Array.from({ length: rows }, () => Array(cols).fill(fillValue));
};

export function matrixMultiply(A, B) {
  if (A[0].length !== B.length) {
    throw new Error('Matrix dimensions do not align for multiplication.');
  }

  const result = createMatrix(A.length, B[0].length);

  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B[0].length; j++) {
      for (let k = 0; k < B.length; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return result;
}

export function applyActivation(matrix, activationFunction) {
  const activations = {
    relu: (x) => Math.max(0, x),
    sigmoid: (x) => 1 / (1 + Math.exp(-x)),
    tanh: (x) => Math.tanh(x)
  };

  if (!activations[activationFunction]) {
    throw new Error(`Unsupported activation function: ${activationFunction}`);
  }

  return matrix.map((row) => row.map((value) => activations[activationFunction](value)));
}

export function convolve2D(input, kernel, stride = 1, padding = 0) {
  const paddedInput = padMatrix(input, padding);
  const outputRows = Math.floor((paddedInput.length - kernel.length) / stride) + 1;
  const outputCols = Math.floor((paddedInput[0].length - kernel[0].length) / stride) + 1;
  const output = createMatrix(outputRows, outputCols);

  for (let i = 0; i < outputRows; i++) {
    for (let j = 0; j < outputCols; j++) {
      let sum = 0;
      for (let ki = 0; ki < kernel.length; ki++) {
        for (let kj = 0; kj < kernel[0].length; kj++) {
          sum += kernel[ki][kj] * paddedInput[i * stride + ki][j * stride + kj];
        }
      }
      output[i][j] = sum;
    }
  }

  return output;
}

export function padMatrix(matrix, padding) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const padded = createMatrix(rows + 2 * padding, cols + 2 * padding);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      padded[i + padding][j + padding] = matrix[i][j];
    }
  }

  return padded;
}

export function generateRandomMatrix(rows, cols, min = 0, max = 1) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() * (max - min) + min)
  );
}

export function uuid() {
  return randomUUID();
}

// Example utility functions for broader use
export function transposeMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}

export function normalizeMatrix(matrix) {
  const flat = matrix.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);

  return matrix.map((row) => row.map((value) => (value - min) / (max - min)));
}