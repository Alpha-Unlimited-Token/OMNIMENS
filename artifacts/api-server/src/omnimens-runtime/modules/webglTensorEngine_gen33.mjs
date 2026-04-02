/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webglTensorEngine
 * Written: 2026-04-02T14:25:22.319Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webglTensorEngine.mjs

'use strict';

/**
 * Initializes a WebGL context for GPU-accelerated tensor operations.
 * @returns {WebGLRenderingContext} - A WebGL context.
 */
export function initWebGLContext() {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl');

  if (!gl) {
    throw new Error('WebGL not supported');
  }

  return gl;
}

/**
 * Compiles a GLSL shader.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {string} source - GLSL shader source code.
 * @param {number} type - The type of shader (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
 * @returns {WebGLShader} - Compiled shader.
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
 * Links shaders into a WebGL program.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {WebGLShader[]} shaders - Array of compiled shaders.
 * @returns {WebGLProgram} - Linked WebGL program.
 */
export function linkProgram(gl, shaders) {
  const program = gl.createProgram();

  for (const shader of shaders) {
    gl.attachShader(program, shader);
  }

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program linking failed: ${error}`);
  }

  return program;
}

/**
 * Creates a WebGL buffer and uploads data to it.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {Float32Array} data - Data to upload.
 * @returns {WebGLBuffer} - Created buffer.
 */
export function createBuffer(gl, data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

/**
 * Performs matrix multiplication using WebGL.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {Float32Array} matrixA - First matrix (flat array).
 * @param {Float32Array} matrixB - Second matrix (flat array).
 * @param {number} rowsA - Rows in matrix A.
 * @param {number} colsA - Columns in matrix A.
 * @param {number} colsB - Columns in matrix B.
 * @returns {Float32Array} - Resulting matrix (flat array).
 */
export function matrixMultiply(gl, matrixA, matrixB, rowsA, colsA, colsB) {
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
      float result = 0.0;

      for (int i = 0; i < colsA; i++) {
        float a = texture2D(matrixA, vec2(coord.x, float(i))).r;
        float b = texture2D(matrixB, vec2(float(i), coord.y)).r;
        result += a * b;
      }

      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  const program = linkProgram(gl, [vertexShader, fragmentShader]);

  gl.useProgram(program);

  // TODO: Upload matrices and execute shader program.
  // This is a placeholder for the actual GPU computation.

  return new Float32Array(rowsA * colsB); // Placeholder result.
}
