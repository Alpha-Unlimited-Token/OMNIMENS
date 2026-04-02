/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuMatrixOps
 * Written: 2026-04-02T20:34:54.071Z
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
 * Initializes a WebGL context for GPU-accelerated computations.
 * @returns {WebGLRenderingContext} - A WebGL context.
 */
export function initializeWebGLContext() {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl');
  if (!gl) {
    throw new Error('WebGL not supported on this environment.');
  }
  return gl;
}

/**
 * Compiles a WebGL shader.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {string} source - GLSL source code for the shader.
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
 * Creates a WebGL program from vertex and fragment shaders.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {string} vertexSource - GLSL source code for the vertex shader.
 * @param {string} fragmentSource - GLSL source code for the fragment shader.
 * @returns {WebGLProgram} - Linked WebGL program.
 */
export function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
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
 * @param {Float32Array} matrixA - Flattened 2D array (row-major) of matrix A.
 * @param {Float32Array} matrixB - Flattened 2D array (row-major) of matrix B.
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A.
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Float32Array} - Flattened 2D array (row-major) of the resulting matrix.
 */
export function gpuMatrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match the input sizes.');
  }

  const gl = initializeWebGLContext();

  const vertexSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision highp float;
    uniform sampler2D matrixA;
    uniform sampler2D matrixB;
    uniform vec2 dimA;
    uniform vec2 dimB;

    vec4 fetchMatrix(sampler2D matrix, vec2 dim, int row, int col) {
      return texture2D(matrix, vec2((col + 0.5) / dim.x, (row + 0.5) / dim.y));
    }

    void main() {
      int row = int(gl_FragCoord.y);
      int col = int(gl_FragCoord.x);
      float sum = 0.0;
      for (int k = 0; k < int(dimA.y); ++k) {
        sum += fetchMatrix(matrixA, dimA, row, k).r * fetchMatrix(matrixB, dimB, k, col).r;
      }
      gl_FragColor = vec4(sum, 0.0, 0.0, 1.0);
    }
  `;

  const program = createProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(program);

  // Create textures for matrix A and B
  const textureA = gl.createTexture();
  const textureB = gl.createTexture();

  // Configure textures and upload data
  const uploadMatrixToTexture = (texture, matrix, width, height) => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R32F,
      width,
      height,
      0,
      gl.RED,
      gl.FLOAT,
      matrix
    );
  };

  uploadMatrixToTexture(textureA, matrixA, colsA, rowsA);
  uploadMatrixToTexture(textureB, matrixB, colsB, colsA);

  // Set uniforms and attributes
  const dimALoc = gl.getUniformLocation(program, 'dimA');
  const dimBLoc = gl.getUniformLocation(program, 'dimB');
  gl.uniform2f(dimALoc, colsA, rowsA);
  gl.uniform2f(dimBLoc, colsB, colsA);

  // Render to framebuffer
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  const outputTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, outputTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.R32F,
    colsB,
    rowsA,
    0,
    gl.RED,
    gl.FLOAT,
    null
  );
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    outputTexture,
    0
  );

  gl.viewport(0, 0, colsB, rowsA);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Read back the result
  const result = new Float32Array(rowsA * colsB);
  gl.readPixels(0, 0, colsB, rowsA, gl.RED, gl.FLOAT, result);

  return result;
}

/**
 * Generates a hash for a matrix operation (useful for caching).
 * @param {Float32Array} matrixA - Matrix A.
 * @param {Float32Array} matrixB - Matrix B.
 * @returns {string} - SHA-256 hash of the input matrices.
 */
export function generateMatrixHash(matrixA, matrixB) {
  const hash = createHash('sha256');
  hash.update(matrixA.buffer);
  hash.update(matrixB.buffer);
  return hash.digest('hex');
}