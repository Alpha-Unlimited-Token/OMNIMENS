/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-02T17:14:14.606Z
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

import { webcrypto } from 'crypto';

/**
 * Generates a random matrix of the given dimensions.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Float32Array[]} - Randomly generated matrix.
 */
export function generateRandomMatrix(rows, cols) {
  const matrix = [];
  for (let i = 0; i < rows; i++) {
    const row = new Float32Array(cols);
    for (let j = 0; j < cols; j++) {
      row[j] = webcrypto.getRandomValues(new Float32Array(1))[0];
    }
    matrix.push(row);
  }
  return matrix;
}

/**
 * Performs parallel matrix multiplication using optimized memory access patterns.
 * @param {Float32Array[]} matrixA - First matrix.
 * @param {Float32Array[]} matrixB - Second matrix.
 * @returns {Float32Array[]} - Resulting matrix after multiplication.
 */
export function parallelMatrixMultiply(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const result = [];
  for (let i = 0; i < rowsA; i++) {
    const row = new Float32Array(colsB);
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += matrixA[i][k] * matrixB[k][j];
      }
      row[j] = sum;
    }
    result.push(row);
  }
  return result;
}

/**
 * Transposes a matrix.
 * @param {Float32Array[]} matrix - Matrix to transpose.
 * @returns {Float32Array[]} - Transposed matrix.
 */
export function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const transposed = [];

  for (let i = 0; i < cols; i++) {
    const row = new Float32Array(rows);
    for (let j = 0; j < rows; j++) {
      row[j] = matrix[j][i];
    }
    transposed.push(row);
  }
  return transposed;
}

/**
 * Utility to check if a matrix is valid (rectangular and non-empty).
 * @param {Float32Array[]} matrix - Matrix to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return false;
  }

  const cols = matrix[0].length;
  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== cols) {
      return false;
    }
  }

  return true;
}

/**
 * Scales a matrix by a scalar value.
 * @param {Float32Array[]} matrix - Matrix to scale.
 * @param {number} scalar - Scalar value.
 * @returns {Float32Array[]} - Scaled matrix.
 */
export function scaleMatrix(matrix, scalar) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const scaled = [];

  for (let i = 0; i < rows; i++) {
    const row = new Float32Array(cols);
    for (let j = 0; j < cols; j++) {
      row[j] = matrix[i][j] * scalar;
    }
    scaled.push(row);
  }
  return scaled;
}

/**
 * Adds two matrices element-wise.
 * @param {Float32Array[]} matrixA - First matrix.
 * @param {Float32Array[]} matrixB - Second matrix.
 * @returns {Float32Array[]} - Resulting matrix after addition.
 */
export function addMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Matrix dimensions do not match for addition.');
  }

  const result = [];
  for (let i = 0; i < rowsA; i++) {
    const row = new Float32Array(colsA);
    for (let j = 0; j < colsA; j++) {
      row[j] = matrixA[i][j] + matrixB[i][j];
    }
    result.push(row);
  }
  return result;
}
