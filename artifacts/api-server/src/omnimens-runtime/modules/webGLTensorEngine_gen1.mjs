/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGLTensorEngine
 * Written: 2026-04-03T17:49:54.004Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGLTensorEngine.mjs

import { createHash } from 'crypto';

/**
 * Converts a 2D array into a flat Float32Array for WebGL processing.
 * @param {number[][]} matrix - 2D array of numbers.
 * @returns {Float32Array} Flattened array for GPU processing.
 */
export function flattenMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const flatArray = new Float32Array(rows * cols);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      flatArray[i * cols + j] = matrix[i][j];
    }
  }
  return flatArray;
}

/**
 * Generates a unique hash for shader caching or identification.
 * @param {string} shaderCode - GLSL shader code as a string.
 * @returns {string} Unique hash of the shader code.
 */
export function generateShaderHash(shaderCode) {
  return createHash('sha256').update(shaderCode).digest('hex');
}

/**
 * Performs matrix multiplication on two 2D arrays.
 * @param {number[][]} a - First matrix.
 * @param {number[][]} b - Second matrix.
 * @returns {number[][]} Resultant matrix after multiplication.
 */
export function matrixMultiply(a, b) {
  const rowsA = a.length;
  const colsA = a[0].length;
  const rowsB = b.length;
  const colsB = b[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const result = Array.from({ length: rowsA }, () => new Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }

  return result;
}

/**
 * Applies a convolution operation on a 2D matrix with a given kernel.
 * @param {number[][]} matrix - Input 2D array.
 * @param {number[][]} kernel - Convolution kernel (usually smaller than the matrix).
 * @returns {number[][]} Resultant matrix after convolution.
 */
export function applyConvolution(matrix, kernel) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const kernelRows = kernel.length;
  const kernelCols = kernel[0].length;

  const outputRows = rows - kernelRows + 1;
  const outputCols = cols - kernelCols + 1;
  const result = Array.from({ length: outputRows }, () => new Array(outputCols).fill(0));

  for (let i = 0; i < outputRows; i++) {
    for (let j = 0; j < outputCols; j++) {
      let sum = 0;
      for (let ki = 0; ki < kernelRows; ki++) {
        for (let kj = 0; kj < kernelCols; kj++) {
          sum += matrix[i + ki][j + kj] * kernel[ki][kj];
        }
      }
      result[i][j] = sum;
    }
  }

  return result;
}

/**
 * Validates if a given 2D array is rectangular.
 * @param {number[][]} matrix - 2D array to validate.
 * @returns {boolean} True if the matrix is rectangular, false otherwise.
 */
export function isRectangularMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) return false;
  const rowLength = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === rowLength);
}

/**
 * Normalizes a 2D matrix to have values between 0 and 1.
 * @param {number[][]} matrix - Input 2D array.
 * @returns {number[][]} Normalized matrix.
 */
export function normalizeMatrix(matrix) {
  const flat = matrix.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  const range = max - min;

  return matrix.map(row => row.map(value => (value - min) / range));
}
