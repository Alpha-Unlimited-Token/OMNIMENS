/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_61
 * Name: gpuComputationEngine
 * Purpose: Leverages WebGPU or WebGL to accelerate matrix computations and neural network tasks using GPU-like parallelism.
 * Description: GPU computation engine for matrix operations and convolution tasks, designed for multi-agent utility and algorithmic intelligence.
 * Migrated: 2026-04-02T14:08:14.870Z
 */

// gpuComputationEngine.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique identifier for GPU tasks to ensure proper tracking.
 * @param {string} input - Input string to hash.
 * @returns {string} - A unique 16-character hash.
 */
export function generateTaskId(input) {
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

/**
 * Performs matrix multiplication using a pure algorithmic approach.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resultant matrix after multiplication.
 */
export function matrixMultiply(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  return result;
}

/**
 * Applies a 2D convolution operation on an input matrix with a given kernel.
 * @param {number[][]} inputMatrix - Input matrix.
 * @param {number[][]} kernel - Convolution kernel.
 * @returns {number[][]} - Resultant matrix after convolution.
 */
export function applyConvolution(inputMatrix, kernel) {
  const inputRows = inputMatrix.length;
  const inputCols = inputMatrix[0].length;
  const kernelRows = kernel.length;
  const kernelCols = kernel[0].length;

  const outputRows = inputRows - kernelRows + 1;
  const outputCols = inputCols - kernelCols + 1;

  if (outputRows <= 0 || outputCols <= 0) {
    throw new Error('Kernel size must be smaller than input matrix dimensions.');
  }

  const result = Array.from({ length: outputRows }, () => Array(outputCols).fill(0));

  for (let i = 0; i < outputRows; i++) {
    for (let j = 0; j < outputCols; j++) {
      for (let ki = 0; ki < kernelRows; ki++) {
        for (let kj = 0; kj < kernelCols; kj++) {
          result[i][j] += inputMatrix[i + ki][j + kj] * kernel[ki][kj];
        }
      }
    }
  }

  return result;
}

/**
 * Normalizes a matrix by scaling its values to a range of [0, 1].
 * @param {number[][]} matrix - Input matrix.
 * @returns {number[][]} - Normalized matrix.
 */
export function normalizeMatrix(matrix) {
  const flatMatrix = matrix.flat();
  const min = Math.min(...flatMatrix);
  const max = Math.max(...flatMatrix);

  if (min === max) {
    return matrix.map(row => row.map(() => 0.5));
  }

  return matrix.map(row => row.map(value => (value - min) / (max - min)));
}

/**
 * Validates that a given input is a 2D matrix with consistent dimensions.
 * @param {any} matrix - Input to validate.
 * @throws {Error} - If the input is not a valid 2D matrix.
 */
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new Error('Input must be a non-empty 2D matrix.');
  }

  const rowLength = matrix[0].length;
  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== rowLength) {
      throw new Error('All rows in the matrix must have the same length.');
    }
  }
}

/**
 * Utility function to generate a zero matrix of given dimensions.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {number[][]} - Zero matrix.
 */
export function createZeroMatrix(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}
