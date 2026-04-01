/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixOps
 * Written: 2026-04-01T21:56:00.405Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmMatrixOps.mjs

import { readFileSync } from 'fs';
import { join } from 'path';

// Load and compile WebAssembly module
const wasmBuffer = readFileSync(join(__dirname, 'matrix_ops.wasm'));
const wasmModule = new WebAssembly.Module(wasmBuffer);
const wasmInstance = new WebAssembly.Instance(wasmModule);

// WebAssembly exports
const { multiplyMatrices, eigenDecompose } = wasmInstance.exports;

/**
 * Multiplies two matrices using WebAssembly.
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

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float64Array(rowsA * colsB);

  multiplyMatrices(flatA, rowsA, colsA, flatB, rowsB, colsB, result);

  // Convert flat result array back to 2D matrix
  const outputMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    outputMatrix.push(Array.from(result.slice(i * colsB, (i + 1) * colsB)));
  }

  return outputMatrix;
}

/**
 * Computes eigenvalues and eigenvectors of a square matrix using WebAssembly.
 * @param {number[][]} matrix - Square matrix.
 * @returns {{ eigenvalues, eigenvectors}} - Eigenvalues and eigenvectors.
 */
export function matrixEigenDecompose(matrix) {
  const size = matrix.length;

  if (!matrix.every(row => row.length === size)) {
    throw new Error('Matrix must be square for eigen decomposition.');
  }

  const flatMatrix = matrix.flat();
  const eigenvalues = new Float64Array(size);
  const eigenvectors = new Float64Array(size * size);

  eigenDecompose(flatMatrix, size, eigenvalues, eigenvectors);

  // Convert flat eigenvectors array back to 2D matrix
  const outputEigenvectors = [];
  for (let i = 0; i < size; i++) {
    outputEigenvectors.push(Array.from(eigenvectors.slice(i * size, (i + 1) * size)));
  }

  return {
    eigenvalues: Array.from(eigenvalues),
    eigenvectors: outputEigenvectors
  };
}

/**
 * Validates if a matrix is well-formed.
 * @param {number[][]} matrix - Matrix to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return false;
  }
  const rowLength = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === rowLength);
}

/**
 * Generates a random matrix.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {number[][]} - Randomly generated matrix.
 */
export function generateRandomMatrix(rows, cols) {
  if (rows <= 0 || cols <= 0) {
    throw new Error('Matrix dimensions must be positive integers.');
  }
  const matrix = [];
  for (let i = 0; i < rows; i++) {
    matrix.push(Array.from({ length: cols }, () => Math.random()));
  }
  return matrix;
}
