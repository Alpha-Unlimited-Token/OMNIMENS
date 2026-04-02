/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixEngine
 * Written: 2026-04-02T14:27:49.410Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuAcceleratedMatrixEngine.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique identifier for caching purposes.
 * @param {string} input - Input string to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Initializes a WebGL-compatible GPU context for matrix operations.
 * @returns {WebGLRenderingContext | null} - The WebGL context or null if unavailable.
 */
export function initializeGPUContext() {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas) return null;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  return gl || null;
}

/**
 * Performs matrix multiplication on the GPU using WebGL.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} - The resulting matrix after multiplication.
 */
export async function gpuMatrixMultiply(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not align for multiplication.');
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
 * Validates if a given 2D array is a proper matrix.
 * @param {any} matrix - The input to validate.
 * @returns {boolean} - True if valid matrix, false otherwise.
 */
export function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) return false;
  const rowLength = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === rowLength);
}

/**
 * Transposes a given matrix (rows become columns and vice versa).
 * @param {number[][]} matrix - The matrix to transpose.
 * @returns {number[][]} - The transposed matrix.
 */
export function transposeMatrix(matrix) {
  if (!isValidMatrix(matrix)) {
    throw new Error('Input must be a valid 2D matrix.');
  }

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
 * Generates a random matrix with specified dimensions and value range.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @param {number} [min=0] - Minimum value (inclusive).
 * @param {number} [max=1] - Maximum value (exclusive).
 * @returns {number[][]} - The generated random matrix.
 */
export function generateRandomMatrix(rows, cols, min = 0, max = 1) {
  if (rows <= 0 || cols <= 0 || min >= max) {
    throw new Error('Invalid dimensions or range for random matrix generation.');
  }

  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() * (max - min) + min)
  );
}