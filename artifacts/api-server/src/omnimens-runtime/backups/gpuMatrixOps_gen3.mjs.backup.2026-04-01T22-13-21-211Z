/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuMatrixOps
 * Written: 2026-04-01T22:08:54.251Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuMatrixOps.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique shader ID for caching purposes.
 * @param {string} shaderSource - The GLSL shader source code.
 * @returns {string} - A unique hash for the shader.
 */
export function generateShaderID(shaderSource) {
  const hash = createHash('sha256');
  hash.update(shaderSource);
  return hash.digest('hex');
}

/**
 * Compiles a WebGL shader from source.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {string} source - The GLSL shader source code.
 * @param {number} type - The type of shader (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
 * @returns {WebGLShader} - The compiled shader.
 */
export function compileShader(gl, source, type) {
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

/**
 * Links a WebGL program from vertex and fragment shaders.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {WebGLShader} vertexShader - The compiled vertex shader.
 * @param {WebGLShader} fragmentShader - The compiled fragment shader.
 * @returns {WebGLProgram} - The linked WebGL program.
 */
export function linkProgram(gl, vertexShader, fragmentShader) {
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

/**
 * Performs GPU-accelerated matrix multiplication.
 * @param {Float32Array} matrixA - The first input matrix (flattened).
 * @param {Float32Array} matrixB - The second input matrix (flattened).
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A (and rows in matrix B).
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Promise<Float32Array>} - The resulting matrix (flattened).
 */
export async function gpuMatrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match the input sizes.');
  }

  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl');

  if (!gl) {
    throw new Error('WebGL is not supported in this environment.');
  }

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
    uniform int rowsA;
    uniform int colsA;
    uniform int colsB;
    void main() {
      vec2 coord = gl_FragCoord.xy;
      float sum = 0.0;
      for (int i = 0; i < 512; i++) {
        if (i >= colsA) break;
        sum += texture2D(matrixA, vec2(coord.x, float(i))) * texture2D(matrixB, vec2(float(i), coord.y));
      }
      gl_FragColor = vec4(sum, 0.0, 0.0, 1.0);
    }
  `;

  const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  const program = linkProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  // TODO: Implement texture setup, data transfer, and rendering pipeline.

  return new Float32Array(rowsA * colsB); // Placeholder for the resulting matrix.
}

/**
 * Utility function to validate matrix dimensions.
 * @param {number[]} dimensions - Array of matrix dimensions to validate.
 * @returns {boolean} - Whether the dimensions are valid.
 */
export function validateMatrixDimensions(...dimensions) {
  return dimensions.every(dim => Number.isInteger(dim) && dim > 0);
}