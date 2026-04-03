/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuMatrixAcceleration
 * Written: 2026-04-03T08:37:16.912Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuMatrixAcceleration.mjs

import { createHash } from 'crypto';

/**
 * Generates a WebGL shader for matrix multiplication.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @returns {WebGLProgram} A compiled and linked WebGL program for matrix multiplication.
 */
export function createMatrixMultiplicationShader(gl) {
  const vertexShaderSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    uniform sampler2D matrixA;
    uniform sampler2D matrixB;
    uniform vec2 dimensions;
    void main() {
      vec2 coords = gl_FragCoord.xy;
      float sum = 0.0;
      for (float i = 0.0; i < dimensions.x; i++) {
        sum += texture2D(matrixA, vec2(i / dimensions.x, coords.y / dimensions.y)).r *
               texture2D(matrixB, vec2(coords.x / dimensions.x, i / dimensions.y)).r;
      }
      gl_FragColor = vec4(sum, 0.0, 0.0, 1.0);
    }
  `;

  const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  const program = linkProgram(gl, vertexShader, fragmentShader);

  return program;
}

/**
 * Compiles a WebGL shader.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {string} source - The GLSL source code.
 * @param {number} type - The type of shader (VERTEX_SHADER or FRAGMENT_SHADER).
 * @returns {WebGLShader} The compiled shader.
 */
export function compileShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`Shader compilation error: ${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}

/**
 * Links a WebGL program.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {WebGLShader} vertexShader - The vertex shader.
 * @param {WebGLShader} fragmentShader - The fragment shader.
 * @returns {WebGLProgram} The linked program.
 */
export function linkProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program linking error: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

/**
 * Hashes a matrix to ensure data integrity.
 * @param {Float32Array} matrix - The matrix data.
 * @returns {string} A SHA-256 hash of the matrix data.
 */
export function hashMatrix(matrix) {
  const hash = createHash('sha256');
  hash.update(new Uint8Array(matrix.buffer));
  return hash.digest('hex');
}

/**
 * Validates matrix dimensions for multiplication.
 * @param {number[]} dimsA - Dimensions of matrix A [rows, cols].
 * @param {number[]} dimsB - Dimensions of matrix B [rows, cols].
 * @returns {boolean} True if dimensions are valid for multiplication, otherwise false.
 */
export function validateMatrixDimensions(dimsA, dimsB) {
  return dimsA[1] === dimsB[0];
}

/**
 * Creates a WebGL context for GPU computations.
 * @returns {WebGLRenderingContext} A WebGL rendering context.
 */
export function createWebGLContext() {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl');
  if (!gl) {
    throw new Error('WebGL not supported in this environment.');
  }
  return gl;
}
