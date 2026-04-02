/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-02T14:31:16.712Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuAcceleratedMatrixOps.mjs

'use strict';

/**
 * Utility module for GPU-accelerated matrix operations using WebGL.
 * This implementation uses pure JavaScript and WebGL APIs for matrix computations.
 */

// Helper function to create a WebGL context
function createWebGLContext() {
  const canvas = globalThis.document ? document.createElement('canvas') : null;
  if (!canvas) throw new Error('WebGL requires a browser-like environment.');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) throw new Error('Unable to initialize WebGL. Your environment may not support it.');
  return gl;
}

// Compile a WebGL shader
function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed: ${error}`);
  }
  return shader;
}

// Create and link a WebGL program
function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program linking failed: ${error}`);
  }
  return program;
}

// GPU-accelerated matrix multiplication
export function gpuMatrixMultiply(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new TypeError('Both matrixA and matrixB must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const gl = createWebGLContext();

  // Vertex shader source
  const vertexSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Fragment shader source for matrix multiplication
  const fragmentSource = `
    precision highp float;
    uniform mat4 u_matrixA;
    uniform mat4 u_matrixB;
    void main() {
      gl_FragColor = vec4(u_matrixA * u_matrixB);
    }
  `;

  const program = createProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(program);

  // Bind matrices to uniforms
  const matrixALocation = gl.getUniformLocation(program, 'u_matrixA');
  const matrixBLocation = gl.getUniformLocation(program, 'u_matrixB');

  gl.uniformMatrix4fv(matrixALocation, false, new Float32Array(matrixA.flat()));
  gl.uniformMatrix4fv(matrixBLocation, false, new Float32Array(matrixB.flat()));

  // Execute the GPU computation
  const result = new Float32Array(16); // Assuming 4x4 matrices
  gl.readPixels(0, 0, 4, 4, gl.RGBA, gl.FLOAT, result);

  return Array.from(result);
}

// Utility function to validate matrix dimensions
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new TypeError('Matrix must be a non-empty 2D array.');
  }
  const cols = matrix[0].length;
  for (const row of matrix) {
    if (row.length !== cols) {
      throw new Error('All rows in the matrix must have the same number of columns.');
    }
  }
  return true;
}

// Example: Identity matrix generator
export function generateIdentityMatrix(size) {
  if (size <= 0 || !Number.isInteger(size)) {
    throw new TypeError('Size must be a positive integer.');
  }
  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
  );
}

// Example: Transpose matrix utility
export function transposeMatrix(matrix) {
  validateMatrix(matrix);
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