/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-02T15:07:50.847Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { GPU } from 'gpu.js';

const gpu = new GPU();

/**
 * Parallelized matrix multiplication using WebGPU compute shaders.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resultant matrix after multiplication.
 */
export function multiplyMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication');
  }

  const kernel = gpu.createKernel(function (a, b) {
    let sum = 0;
    for (let k = 0; k < this.constants.colsA; k++) {
      sum += a[this.thread.y][k] * b[k][this.thread.x];
    }
    return sum;
  })
    .setOutput([colsB, rowsA])
    .setConstants({ colsA });

  return kernel(matrixA, matrixB);
}

/**
 * Computes the transpose of a matrix.
 * @param {number[][]} matrix - Input matrix.
 * @returns {number[][]} - Transposed matrix.
 */
export function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  const kernel = gpu.createKernel(function (m) {
    return m[this.thread.x][this.thread.y];
  })
    .setOutput([rows, cols]);

  return kernel(matrix);
}

/**
 * Computes the determinant of a square matrix using recursive expansion.
 * @param {number[][]} matrix - Input square matrix.
 * @returns {number} - Determinant of the matrix.
 */
export function determinantMatrix(matrix) {
  const size = matrix.length;

  if (size !== matrix[0].length) {
    throw new Error('Matrix must be square to compute determinant');
  }

  if (size === 2) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }

  let det = 0;
  for (let i = 0; i < size; i++) {
    const subMatrix = matrix.slice(1).map(row => row.filter((_, colIndex) => colIndex !== i));
    det += matrix[0][i] * determinantMatrix(subMatrix) * (i % 2 === 0 ? 1 : -1);
  }

  return det;
}

/**
 * Computes the inverse of a square matrix using adjugate method.
 * @param {number[][]} matrix - Input square matrix.
 * @returns {number[][]} - Inverse of the matrix.
 */
export function inverseMatrix(matrix) {
  const size = matrix.length;

  if (size !== matrix[0].length) {
    throw new Error('Matrix must be square to compute inverse');
  }

  const det = determinantMatrix(matrix);
  if (det === 0) {
    throw new Error('Matrix is singular and cannot be inverted');
  }

  const adjugate = matrix.map((row, i) =>
    row.map((_, j) => {
      const subMatrix = matrix
        .filter((_, rowIndex) => rowIndex !== i)
        .map(row => row.filter((_, colIndex) => colIndex !== j));
      return determinantMatrix(subMatrix) * ((i + j) % 2 === 0 ? 1 : -1);
    })
  );

  const transposeAdjugate = transposeMatrix(adjugate);

  return transposeAdjugate.map(row => row.map(value => value / det));
}

/**
 * Utility function to validate matrix dimensions.
 * @param {number[][]} matrix - Input matrix.
 * @returns {boolean} - True if matrix is valid, otherwise false.
 */
export function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    return false;
  }
  const cols = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === cols);
}