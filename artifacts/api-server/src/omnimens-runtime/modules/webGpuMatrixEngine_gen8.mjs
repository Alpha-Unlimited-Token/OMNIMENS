/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-03T16:37:30.014Z
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

import { createHash } from 'crypto';

/**
 * Generates a unique identifier for GPU tasks to ensure reproducibility.
 * @param {string} input - Input string to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateTaskId(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Validates matrix dimensions for operations like multiplication and convolution.
 * @param {Array<Array<number>>} matrixA - First matrix.
 * @param {Array<Array<number>>} matrixB - Second matrix.
 * @returns {boolean} - True if dimensions are valid, otherwise false.
 */
export function validateMatrixDimensions(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) return false;
  if (matrixA.length === 0 || matrixB.length === 0) return false;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  return colsA === rowsB;
}

/**
 * Performs matrix multiplication using pure JavaScript (CPU fallback).
 * @param {Array<Array<number>>} matrixA - First matrix.
 * @param {Array<Array<number>>} matrixB - Second matrix.
 * @returns {Array<Array<number>>} - Resultant matrix after multiplication.
 */
export function multiplyMatrices(matrixA, matrixB) {
  if (!validateMatrixDimensions(matrixA, matrixB)) {
    throw new Error('Invalid matrix dimensions for multiplication.');
  }

  const result = Array(matrixA.length).fill(null).map(() => Array(matrixB[0].length).fill(0));

  for (let i = 0; i < matrixA.length; i++) {
    for (let j = 0; j < matrixB[0].length; j++) {
      for (let k = 0; k < matrixB.length; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  return result;
}

/**
 * Applies an activation function element-wise to a matrix.
 * @param {Array<Array<number>>} matrix - Input matrix.
 * @param {Function} activationFunction - Activation function to apply.
 * @returns {Array<Array<number>>} - Matrix after applying the activation function.
 */
export function applyActivationFunction(matrix, activationFunction) {
  if (typeof activationFunction !== 'function') {
    throw new Error('Activation function must be a valid function.');
  }

  return matrix.map(row => row.map(value => activationFunction(value)));
}

/**
 * ReLU activation function.
 * @param {number} x - Input value.
 * @returns {number} - Output value after applying ReLU.
 */
export function relu(x) {
  return Math.max(0, x);
}

/**
 * Sigmoid activation function.
 * @param {number} x - Input value.
 * @returns {number} - Output value after applying Sigmoid.
 */
export function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Softmax activation function for a vector.
 * @param {Array<number>} vector - Input vector.
 * @returns {Array<number>} - Output vector after applying Softmax.
 */
export function softmax(vector) {
  const expValues = vector.map(value => Math.exp(value));
  const sumExp = expValues.reduce((acc, val) => acc + val, 0);
  return expValues.map(value => value / sumExp);
}

/**
 * Transposes a matrix.
 * @param {Array<Array<number>>} matrix - Input matrix.
 * @returns {Array<Array<number>>} - Transposed matrix.
 */
export function transposeMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

/**
 * Normalizes a matrix to have values between 0 and 1.
 * @param {Array<Array<number>>} matrix - Input matrix.
 * @returns {Array<Array<number>>} - Normalized matrix.
 */
export function normalizeMatrix(matrix) {
  const flat = matrix.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);

  return matrix.map(row => row.map(value => (value - min) / (max - min)));
}