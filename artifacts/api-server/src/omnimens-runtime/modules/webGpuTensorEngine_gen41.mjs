/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuTensorEngine
 * Written: 2026-04-02T13:32:14.498Z
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

import { createHash } from 'crypto';

/**
 * Generates a unique identifier for tensors to optimize caching.
 * @param {Array} tensor - The tensor data (multi-dimensional array).
 * @returns {string} - A unique hash for the tensor.
 */
export function generateTensorHash(tensor) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(tensor));
  return hash.digest('hex');
}

/**
 * Transposes a 2D matrix.
 * @param {Array<Array<number>>} matrix - The input 2D matrix.
 * @returns {Array<Array<number>>} - The transposed matrix.
 */
export function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const transposed = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposed[j][i] = matrix[i][j];
    }
  }

  return transposed;
}

/**
 * Performs parallel matrix multiplication using a simulated GPU-like approach.
 * @param {Array<Array<number>>} matrixA - The first matrix.
 * @param {Array<Array<number>>} matrixB - The second matrix.
 * @returns {Array<Array<number>>} - The resulting matrix after multiplication.
 */
export function parallelMatrixMultiply(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  if (colsA !== matrixB.length) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += matrixA[i][k] * matrixB[k][j];
      }
      result[i][j] = sum;
    }
  }

  return result;
}

/**
 * Applies an element-wise operation to a tensor.
 * @param {Array} tensor - The input tensor (multi-dimensional array).
 * @param {Function} operation - The operation to apply to each element.
 * @returns {Array} - The resulting tensor after applying the operation.
 */
export function applyElementWiseOperation(tensor, operation) {
  if (!Array.isArray(tensor)) {
    throw new Error('Input tensor must be an array.');
  }

  return tensor.map(element => {
    if (Array.isArray(element)) {
      return applyElementWiseOperation(element, operation);
    }
    return operation(element);
  });
}

/**
 * Normalizes a tensor to have values between 0 and 1.
 * @param {Array} tensor - The input tensor (multi-dimensional array).
 * @returns {Array} - The normalized tensor.
 */
export function normalizeTensor(tensor) {
  const flatTensor = tensor.flat(Infinity);
  const min = Math.min(...flatTensor);
  const max = Math.max(...flatTensor);

  return applyElementWiseOperation(tensor, value => (value - min) / (max - min));
}

/**
 * Flattens a multi-dimensional tensor into a 1D array.
 * @param {Array} tensor - The input tensor (multi-dimensional array).
 * @returns {Array<number>} - The flattened tensor.
 */
export function flattenTensor(tensor) {
  return tensor.flat(Infinity);
}

/**
 * Reshapes a 1D array into a multi-dimensional tensor.
 * @param {Array<number>} array - The input 1D array.
 * @param {Array<number>} shape - The desired shape (e.g., [2, 3]).
 * @returns {Array} - The reshaped tensor.
 */
export function reshapeTensor(array, shape) {
  const totalSize = shape.reduce((a, b) => a * b, 1);
  if (array.length !== totalSize) {
    throw new Error('Array size does not match the desired shape.');
  }

  const reshape = (arr, dims) => {
    if (dims.length === 1) {
      return arr.splice(0, dims[0]);
    }
    const [firstDim, ...restDims] = dims;
    return Array.from({ length: firstDim }, () => reshape(arr, restDims));
  };

  return reshape([...array], shape);
}
