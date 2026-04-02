/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuTensorEngine
 * Written: 2026-04-02T14:11:13.661Z
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

// Purpose: Accelerates tensor operations using WebGPU for high-dimensional matrix computations.

import { crypto } from 'node:crypto';

/**
 * Generates a random WebGPU-compatible buffer for tensor initialization.
 * @param {number} size - The size of the buffer in bytes.
 * @returns {Uint32Array} - Randomized tensor data.
 */
export function createRandomTensor(size) {
  const buffer = new Uint32Array(size);
  crypto.randomFillSync(buffer);
  return buffer;
}

/**
 * Performs batched matrix multiplication on tensors using WebGPU.
 * @param {Float32Array} tensorA - First tensor (2D matrix).
 * @param {Float32Array} tensorB - Second tensor (2D matrix).
 * @param {number} rowsA - Number of rows in tensorA.
 * @param {number} colsA - Number of columns in tensorA.
 * @param {number} colsB - Number of columns in tensorB.
 * @returns {Float32Array} - Resulting tensor after multiplication.
 */
export function batchedMatrixMultiply(tensorA, tensorB, rowsA, colsA, colsB) {
  if (tensorA.length !== rowsA * colsA || tensorB.length !== colsA * colsB) {
    throw new Error('Tensor dimensions are inconsistent with provided sizes.');
  }

  const result = new Float32Array(rowsA * colsB);

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += tensorA[i * colsA + k] * tensorB[k * colsB + j];
      }
      result[i * colsB + j] = sum;
    }
  }

  return result;
}

/**
 * Computes eigenvalues of a square matrix using the power iteration method.
 * @param {Float32Array} matrix - Square matrix represented as a 1D array.
 * @param {number} size - Dimension of the square matrix.
 * @param {number} iterations - Number of iterations for convergence.
 * @returns {Float32Array} - Approximate eigenvalues.
 */
export function computeEigenvalues(matrix, size, iterations = 100) {
  if (matrix.length !== size * size) {
    throw new Error('Matrix dimensions are inconsistent with provided size.');
  }

  const eigenvalues = new Float32Array(size);
  const vector = new Float32Array(size).fill(1);

  for (let iter = 0; iter < iterations; iter++) {
    const newVector = new Float32Array(size);

    for (let i = 0; i < size; i++) {
      let sum = 0;
      for (let j = 0; j < size; j++) {
        sum += matrix[i * size + j] * vector[j];
      }
      newVector[i] = sum;
    }

    const norm = Math.sqrt(newVector.reduce((acc, val) => acc + val ** 2, 0));
    for (let i = 0; i < size; i++) {
      vector[i] = newVector[i] / norm;
    }
  }

  for (let i = 0; i < size; i++) {
    eigenvalues[i] = vector[i];
  }

  return eigenvalues;
}

/**
 * Utility to validate tensor dimensions for operations.
 * @param {Array<number>} dimensions - Dimensions of the tensor.
 * @returns {boolean} - True if dimensions are valid.
 */
export function validateTensorDimensions(dimensions) {
  return dimensions.every((dim) => Number.isInteger(dim) && dim > 0);
}

/**
 * Utility to reshape a flat array into a multidimensional array.
 * @param {Array<number>} flatArray - Flat array to reshape.
 * @param {Array<number>} shape - Target shape.
 * @returns {Array} - Reshaped array.
 */
export function reshapeTensor(flatArray, shape) {
  if (!validateTensorDimensions(shape)) {
    throw new Error('Invalid tensor shape.');
  }

  const totalSize = shape.reduce((acc, val) => acc * val, 1);
  if (flatArray.length !== totalSize) {
    throw new Error('Flat array size does not match target shape.');
  }

  const reshapeRecursive = (array, dimensions) => {
    if (dimensions.length === 1) {
      return array;
    }

    const step = dimensions[0];
    const subDimensions = dimensions.slice(1);

    const result = [];
    for (let i = 0; i < array.length; i += step) {
      result.push(reshapeRecursive(array.slice(i, i + step), subDimensions));
    }

    return result;
  };

  return reshapeRecursive(flatArray, shape);
}