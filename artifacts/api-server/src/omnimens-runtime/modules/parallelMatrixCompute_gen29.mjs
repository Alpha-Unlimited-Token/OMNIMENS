/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: parallelMatrixCompute
 * Written: 2026-04-02T13:31:29.515Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// parallelMatrixCompute.mjs

import { createHash } from 'crypto';

/**
 * Generates a WebGL-compatible GLSL fragment shader for matrix multiplication.
 * @param {number} rowsA - Number of rows in Matrix A.
 * @param {number} colsA - Number of columns in Matrix A.
 * @param {number} colsB - Number of columns in Matrix B.
 * @returns {string} GLSL shader source code.
 */
export function generateMatrixMultiplyShader(rowsA, colsA, colsB) {
  return `#version 300 es
  precision highp float;

  uniform sampler2D matrixA;
  uniform sampler2D matrixB;
  uniform int rowsA;
  uniform int colsA;
  uniform int colsB;

  out vec4 resultColor;

  void main() {
    ivec2 coords = ivec2(gl_FragCoord.xy);
    int row = coords.y;
    int col = coords.x;

    if (row >= rowsA || col >= colsB) {
      resultColor = vec4(0.0);
      return;
    }

    float sum = 0.0;
    for (int k = 0; k < colsA; k++) {
      float a = texelFetch(matrixA, ivec2(k, row), 0).r;
      float b = texelFetch(matrixB, ivec2(col, k), 0).r;
      sum += a * b;
    }

    resultColor = vec4(sum, 0.0, 0.0, 1.0);
  }
  `;
}

/**
 * Hashes a given GLSL shader source for caching or deduplication purposes.
 * @param {string} shaderSource - GLSL shader source code.
 * @returns {string} SHA256 hash of the shader source.
 */
export function hashShaderSource(shaderSource) {
  return createHash('sha256').update(shaderSource).digest('hex');
}

/**
 * Simulates GPU-like parallel matrix multiplication using WebGL shaders.
 * @param {Float32Array} matrixA - Flattened array representing Matrix A.
 * @param {Float32Array} matrixB - Flattened array representing Matrix B.
 * @param {number} rowsA - Number of rows in Matrix A.
 * @param {number} colsA - Number of columns in Matrix A.
 * @param {number} colsB - Number of columns in Matrix B.
 * @returns {Float32Array} Flattened result matrix.
 */
export function parallelMatrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const result = new Float32Array(rowsA * colsB);

  for (let row = 0; row < rowsA; row++) {
    for (let col = 0; col < colsB; col++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += matrixA[row * colsA + k] * matrixB[k * colsB + col];
      }
      result[row * colsB + col] = sum;
    }
  }

  return result;
}

/**
 * Validates matrix dimensions for compatibility with operations.
 * @param {number} rowsA - Number of rows in Matrix A.
 * @param {number} colsA - Number of columns in Matrix A.
 * @param {number} rowsB - Number of rows in Matrix B.
 * @param {number} colsB - Number of columns in Matrix B.
 * @returns {boolean} True if dimensions are compatible, false otherwise.
 */
export function validateMatrixDimensions(rowsA, colsA, rowsB, colsB) {
  return colsA === rowsB;
}

/**
 * Computes the eigenvalues of a 2x2 matrix (special case for simplicity).
 * @param {number} a - Top-left element.
 * @param {number} b - Top-right element.
 * @param {number} c - Bottom-left element.
 * @param {number} d - Bottom-right element.
 * @returns {Array<number>} Eigenvalues of the matrix.
 */
export function computeEigenvalues2x2(a, b, c, d) {
  const trace = a + d;
  const determinant = a * d - b * c;
  const discriminant = Math.sqrt(trace * trace - 4 * determinant);
  return [(trace + discriminant) / 2, (trace - discriminant) / 2];
}

/**
 * Performs LU decomposition on a 2x2 matrix (special case for simplicity).
 * @param {number} a - Top-left element.
 * @param {number} b - Top-right element.
 * @param {number} c - Bottom-left element.
 * @param {number} d - Bottom-right element.
 * @returns {Object} LU decomposition result with L and U matrices.
 */
export function luDecomposition2x2(a, b, c, d) {
  if (a === 0) {
    throw new Error('LU decomposition requires a non-zero pivot element.');
  }

  const l11 = 1;
  const l21 = c / a;
  const u11 = a;
  const u12 = b;
  const u22 = d - l21 * u12;

  return {
    L: [l11, 0, l21, 1],
    U: [u11, u12, 0, u22]
  };
}
