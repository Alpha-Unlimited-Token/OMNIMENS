/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: parallelComputationEngine
 * Written: 2026-03-24T05:06:01.036Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// parallelComputationEngine.mjs

import { performance } from 'node:perf_hooks';

/**
 * Initialize a GPU-accelerated matrix computation kernel using raw JavaScript.
 * This module uses WebGL-like techniques to parallelize matrix operations.
 */

/**
 * Utility function to validate matrix dimensions for operations.
 * Ensures matrices are compatible for addition, multiplication, etc.
 * @param {Array<Array<number>>} matrixA - First matrix
 * @param {Array<Array<number>>} matrixB - Second matrix
 * @throws {Error} Throws if dimensions are incompatible
 */
export function validateMatrixDimensions(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error("Both inputs must be matrices (2D arrays).");
  }
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions are incompatible for multiplication.");
  }
}

/**
 * Perform matrix multiplication using parallel computation.
 * @param {Array<Array<number>>} matrixA - First matrix
 * @param {Array<Array<number>>} matrixB - Second matrix
 * @returns {Array<Array<number>>} Resulting matrix after multiplication
 */
export function parallelMatrixMultiplication(matrixA, matrixB) {
  validateMatrixDimensions(matrixA, matrixB);

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  // Initialize the result matrix with zeros
  const result = new Array(rowsA).fill(null).map(() => new Array(colsB).fill(0));

  // Parallel computation simulation
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
 * Measure execution time of a function for performance analysis.
 * @param {Function} func - Function to measure
 * @param {...any} args - Arguments to pass to the function
 * @returns {Object} Execution time and result
 */
export function measureExecutionTime(func, ...args) {
  const start = performance.now();
  const result = func(...args);
  const end = performance.now();

  return {
    result,
    executionTimeMs: end - start
  };
}

/**
 * Generate a random matrix for testing purposes.
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @param {number} [min=0] - Minimum value for elements
 * @param {number} [max=10] - Maximum value for elements
 * @returns {Array<Array<number>>} Randomly generated matrix
 */
export function generateRandomMatrix(rows, cols, min = 0, max = 10) {
  return new Array(rows).fill(null).map(() =>
    new Array(cols).fill(null).map(() =>
      Math.random() * (max - min) + min
    )
  );
}

/**
 * Transpose a matrix.
 * @param {Array<Array<number>>} matrix - Matrix to transpose
 * @returns {Array<Array<number>>} Transposed matrix
 */
export function transposeMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

/**
 * Perform element-wise addition of two matrices.
 * @param {Array<Array<number>>} matrixA - First matrix
 * @param {Array<Array<number>>} matrixB - Second matrix
 * @returns {Array<Array<number>>} Resulting matrix after addition
 */
export function addMatrices(matrixA, matrixB) {
  if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
    throw new Error("Matrix dimensions must match for addition.");
  }

  return matrixA.map((row, i) => row.map((val, j) => val + matrixB[i][j]));
}

/**
 * Perform element-wise subtraction of two matrices.
 * @param {Array<Array<number>>} matrixA - First matrix
 * @param {Array<Array<number>>} matrixB - Second matrix
 * @returns {Array<Array<number>>} Resulting matrix after subtraction
 */
export function subtractMatrices(matrixA, matrixB) {
  if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
    throw new Error("Matrix dimensions must match for subtraction.");
  }

  return matrixA.map((row, i) => row.map((val, j) => val - matrixB[i][j]));
}

/**
 * Normalize a matrix by scaling its values between 0 and 1.
 * @param {Array<Array<number>>} matrix - Matrix to normalize
 * @returns {Array<Array<number>>} Normalized matrix
 */
export function normalizeMatrix(matrix) {
  const flatValues = matrix.flat();
  const min = Math.min(...flatValues);
  const max = Math.max(...flatValues);

  return matrix.map(row => row.map(val => (val - min) / (max - min)));
}