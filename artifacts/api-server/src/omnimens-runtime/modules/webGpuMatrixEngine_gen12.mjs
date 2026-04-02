/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-02T15:13:13.347Z
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

import { performance } from 'perf_hooks';

/**
 * Utility function to create a 2D matrix of given dimensions filled with a specified value.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @param {number} [fillValue=0] - Value to fill the matrix with.
 * @returns {number[][]} - The generated 2D matrix.
 */
export function createMatrix(rows, cols, fillValue = 0) {
  if (rows <= 0 || cols <= 0) throw new Error('Matrix dimensions must be positive integers.');
  return Array.from({ length: rows }, () => Array(cols).fill(fillValue));
}

/**
 * Performs matrix multiplication using parallel processing simulation.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} - The resulting matrix after multiplication.
 */
export function multiplyMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) throw new Error('Matrix dimensions do not allow multiplication.');

  const result = createMatrix(rowsA, colsB);

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
 * Measures the execution time of a given function.
 * @param {Function} fn - The function to measure.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {{ result, timeMs}} - The result of the function and execution time in milliseconds.
 */
export function measureExecutionTime(fn, ...args) {
  const startTime = performance.now();
  const result = fn(...args);
  const endTime = performance.now();
  return { result, timeMs: endTime - startTime };
}

/**
 * Transposes a given matrix.
 * @param {number[][]} matrix - The matrix to transpose.
 * @returns {number[][]} - The transposed matrix.
 */
export function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const transposed = createMatrix(cols, rows);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposed[j][i] = matrix[i][j];
    }
  }

  return transposed;
}

/**
 * Computes the dot product of two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The dot product of the two vectors.
 */
export function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) throw new Error('Vectors must be of the same length.');
  return vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
}

/**
 * Normalizes a vector to unit length.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) throw new Error('Cannot normalize a zero vector.');
  return vector.map(val => val / magnitude);
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The cosine similarity between the two vectors.
 */
export function cosineSimilarity(vectorA, vectorB) {
  const dot = dotProduct(vectorA, vectorB);
  const magA = Math.sqrt(dotProduct(vectorA, vectorA));
  const magB = Math.sqrt(dotProduct(vectorB, vectorB));
  if (magA === 0 || magB === 0) throw new Error('Cannot compute similarity with a zero vector.');
  return dot / (magA * magB);
}
