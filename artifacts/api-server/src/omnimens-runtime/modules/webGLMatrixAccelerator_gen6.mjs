/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGLMatrixAccelerator
 * Written: 2026-04-03T04:17:18.042Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGLMatrixAccelerator.mjs

import { createHash } from 'crypto';

/**
 * Generates a GLSL-compatible shader source for matrix multiplication.
 * @param {number} size - The size of the matrices.
 * @returns {string} GLSL shader code for matrix multiplication.
 */
export function generateMatrixMultiplicationShader(size) {
  return `
    precision highp float;

    uniform float matrixA[${size * size}];
    uniform float matrixB[${size * size}];
    varying vec2 vUV;

    void main() {
      int row = int(vUV.y * ${size}.0);
      int col = int(vUV.x * ${size}.0);
      float result = 0.0;

      for (int k = 0; k < ${size}; k++) {
        result += matrixA[row * ${size} + k] * matrixB[k * ${size} + col];
      }

      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;
}

/**
 * Hashes a GLSL shader for caching purposes.
 * @param {string} shaderCode - GLSL shader code.
 * @returns {string} A SHA256 hash of the shader code.
 */
export function hashShader(shaderCode) {
  const hash = createHash('sha256');
  hash.update(shaderCode);
  return hash.digest('hex');
}

/**
 * Validates matrix dimensions for compatibility.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {boolean} True if matrices are compatible for multiplication, false otherwise.
 */
export function validateMatrixDimensions(matrixA, matrixB) {
  return matrixA[0].length === matrixB.length;
}

/**
 * Flattens a 2D matrix into a 1D array for GLSL uniform compatibility.
 * @param {number[][]} matrix - A 2D matrix.
 * @returns {number[]} Flattened 1D array.
 */
export function flattenMatrix(matrix) {
  return matrix.reduce((acc, row) => acc.concat(row), []);
}

/**
 * Performs CPU-based matrix multiplication as a fallback.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} Resulting matrix.
 */
export function cpuMatrixMultiply(matrixA, matrixB) {
  const result = Array(matrixA.length)
    .fill(0)
    .map(() => Array(matrixB[0].length).fill(0));

  for (let i = 0; i < matrixA.length; i++) {
    for (let j = 0; j < matrixB[0].length; j++) {
      for (let k = 0; k < matrixB.length; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  return result;
}

/**
 * Generates a random matrix for testing purposes.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {number[][]} Randomly generated matrix.
 */
export function generateRandomMatrix(rows, cols) {
  return Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(0).map(() => Math.random()));
}

/**
 * Utility function to transpose a matrix.
 * @param {number[][]} matrix - Input matrix.
 * @returns {number[][]} Transposed matrix.
 */
export function transposeMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}
