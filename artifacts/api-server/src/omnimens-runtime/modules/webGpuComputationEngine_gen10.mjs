/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuComputationEngine
 * Written: 2026-04-03T06:07:05.883Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGpuComputationEngine.mjs

import { randomUUID } from 'crypto';

/**
 * Generates a WebGPU-compatible shader code for matrix multiplication.
 * @returns {string} The shader code as a string.
 */
export function generateMatrixMultiplicationShader() {
  return `
    [[block]] struct Matrix {
      size : vec2<u32>;
      values : array<f32>;
    };

    [[group(0), binding(0)]] var<storage, read> A : Matrix;
    [[group(0), binding(1)]] var<storage, read> B : Matrix;
    [[group(0), binding(2)]] var<storage, write> C : Matrix;

    [[stage(compute), workgroup_size(16, 16)]]
    fn main([[builtin(global_invocation_id)]] global_id : vec3<u32>) {
      let row = global_id.x;
      let col = global_id.y;

      if (row >= A.size.x || col >= B.size.y) {
        return;
      }

      var sum : f32 = 0.0;
      for (var k : u32 = 0; k < A.size.y; k = k + 1) {
        let aIndex = row * A.size.y + k;
        let bIndex = k * B.size.y + col;
        sum = sum + A.values[aIndex] * B.values[bIndex];
      }

      let cIndex = row * B.size.y + col;
      C.values[cIndex] = sum;
    }
  `;
}

/**
 * Validates matrix dimensions for compatibility in multiplication.
 * @param {number[]} dimensionsA - Dimensions of matrix A [rows, cols].
 * @param {number[]} dimensionsB - Dimensions of matrix B [rows, cols].
 * @returns {boolean} True if dimensions are valid, false otherwise.
 */
export function validateMatrixDimensions(dimensionsA, dimensionsB) {
  return dimensionsA[1] === dimensionsB[0];
}

/**
 * Flattens a 2D matrix into a 1D array for WebGPU processing.
 * @param {number[][]} matrix - The input 2D matrix.
 * @returns {Float32Array} Flattened matrix as a Float32Array.
 */
export function flattenMatrix(matrix) {
  return new Float32Array(matrix.flat());
}

/**
 * Generates a unique identifier for compute pipelines.
 * @returns {string} A UUID string.
 */
export function generatePipelineId() {
  return randomUUID();
}

/**
 * Calculates the dimensions of the resulting matrix from multiplication.
 * @param {number[]} dimensionsA - Dimensions of matrix A [rows, cols].
 * @param {number[]} dimensionsB - Dimensions of matrix B [rows, cols].
 * @returns {number[]} Dimensions of the resulting matrix [rows, cols].
 */
export function calculateResultDimensions(dimensionsA, dimensionsB) {
  if (!validateMatrixDimensions(dimensionsA, dimensionsB)) {
    throw new Error('Incompatible matrix dimensions for multiplication.');
  }
  return [dimensionsA[0], dimensionsB[1]];
}

/**
 * Simulates a GPU computation pipeline for matrix multiplication.
 * @param {number[][]} matrixA - First input matrix.
 * @param {number[][]} matrixB - Second input matrix.
 * @returns {number[][]} Resulting matrix after multiplication.
 */
export function simulateGpuMatrixMultiplication(matrixA, matrixB) {
  const dimensionsA = [matrixA.length, matrixA[0].length];
  const dimensionsB = [matrixB.length, matrixB[0].length];

  if (!validateMatrixDimensions(dimensionsA, dimensionsB)) {
    throw new Error('Matrix dimensions do not allow multiplication.');
  }

  const resultDimensions = calculateResultDimensions(dimensionsA, dimensionsB);
  const result = Array.from({ length: resultDimensions[0] }, () => Array(resultDimensions[1]).fill(0));

  for (let i = 0; i < resultDimensions[0]; i++) {
    for (let j = 0; j < resultDimensions[1]; j++) {
      for (let k = 0; k < dimensionsA[1]; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  return result;
}

/**
 * Converts a flat Float32Array back into a 2D matrix.
 * @param {Float32Array} flatArray - The flattened array.
 * @param {number[]} dimensions - Dimensions of the matrix [rows, cols].
 * @returns {number[][]} The reconstructed 2D matrix.
 */
export function unflattenMatrix(flatArray, dimensions) {
  const [rows, cols] = dimensions;
  const matrix = [];
  for (let i = 0; i < rows; i++) {
    matrix.push(Array.from(flatArray.slice(i * cols, (i + 1) * cols)));
  }
  return matrix;
}
