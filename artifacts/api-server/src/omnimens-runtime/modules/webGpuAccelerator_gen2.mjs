/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuAccelerator
 * Written: 2026-04-03T03:17:21.469Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGpuAccelerator.mjs

import { randomBytes } from 'crypto';

/**
 * Utility function to generate a random matrix with specified dimensions.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Float32Array} - Flattened matrix.
 */
export function generateRandomMatrix(rows, cols) {
  const matrix = new Float32Array(rows * cols);
  for (let i = 0; i < matrix.length; i++) {
    matrix[i] = (randomBytes(4).readUInt32BE(0) / 0xffffffff) * 2 - 1; // Random values between -1 and 1
  }
  return matrix;
}

/**
 * Utility function to perform matrix multiplication.
 * @param {Float32Array} A - Flattened matrix A.
 * @param {Float32Array} B - Flattened matrix B.
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A.
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Float32Array} - Resulting flattened matrix.
 */
export function matrixMultiply(A, B, rowsA, colsA, colsB) {
  if (A.length !== rowsA * colsA || B.length !== colsA * colsB) {
    throw new Error('Invalid matrix dimensions for multiplication.');
  }

  const result = new Float32Array(rowsA * colsB);
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i * colsA + k] * B[k * colsB + j];
      }
      result[i * colsB + j] = sum;
    }
  }
  return result;
}

/**
 * Applies an activation function element-wise to a matrix.
 * @param {Float32Array} matrix - Flattened matrix.
 * @param {string} activation - Activation function ('relu', 'sigmoid', 'tanh').
 * @returns {Float32Array} - Matrix after activation.
 */
export function applyActivation(matrix, activation) {
  const result = new Float32Array(matrix.length);
  for (let i = 0; i < matrix.length; i++) {
    switch (activation) {
      case 'relu':
        result[i] = Math.max(0, matrix[i]);
        break;
      case 'sigmoid':
        result[i] = 1 / (1 + Math.exp(-matrix[i]));
        break;
      case 'tanh':
        result[i] = Math.tanh(matrix[i]);
        break;
      default:
        throw new Error('Unsupported activation function.');
    }
  }
  return result;
}

/**
 * Performs backpropagation for a single layer.
 * @param {Float32Array} dLoss - Gradient of loss with respect to output.
 * @param {Float32Array} input - Input matrix.
 * @param {Float32Array} weights - Weight matrix.
 * @param {number} rowsInput - Rows in input matrix.
 * @param {number} colsInput - Columns in input matrix.
 * @param {number} colsWeights - Columns in weight matrix.
 * @returns {Object} - Gradients for weights and input.
 */
export function backpropagate(dLoss, input, weights, rowsInput, colsInput, colsWeights) {
  if (dLoss.length !== rowsInput * colsWeights || input.length !== rowsInput * colsInput || weights.length !== colsInput * colsWeights) {
    throw new Error('Invalid matrix dimensions for backpropagation.');
  }

  // Gradient with respect to weights
  const dWeights = matrixMultiply(input, dLoss, rowsInput, colsInput, colsWeights);

  // Gradient with respect to input
  const transposedWeights = transposeMatrix(weights, colsInput, colsWeights);
  const dInput = matrixMultiply(dLoss, transposedWeights, rowsInput, colsWeights, colsInput);

  return { dWeights, dInput };
}

/**
 * Transposes a matrix.
 * @param {Float32Array} matrix - Flattened matrix.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {Float32Array} - Transposed matrix.
 */
export function transposeMatrix(matrix, rows, cols) {
  const result = new Float32Array(matrix.length);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j * rows + i] = matrix[i * cols + j];
    }
  }
  return result;
}