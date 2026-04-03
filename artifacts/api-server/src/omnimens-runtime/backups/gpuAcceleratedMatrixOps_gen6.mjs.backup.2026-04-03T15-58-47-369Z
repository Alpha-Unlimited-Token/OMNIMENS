/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-03T14:28:17.988Z
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

import { createHash } from 'crypto';

/**
 * Initializes a WebGL context for GPU-accelerated computations.
 * @returns {WebGLRenderingContext} A WebGL context for rendering.
 */
export function initializeWebGLContext() {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl');
  if (!gl) throw new Error('WebGL not supported');
  return gl;
}

/**
 * Compiles a WebGL shader.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {string} source - GLSL source code.
 * @param {number} type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
 * @returns {WebGLShader} Compiled shader.
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
 * Creates a WebGL program.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {string} vertexSource - Vertex shader source code.
 * @param {string} fragmentSource - Fragment shader source code.
 * @returns {WebGLProgram} Linked WebGL program.
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
 * Performs matrix multiplication on the GPU.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {Float32Array} matrixA - First matrix.
 * @param {Float32Array} matrixB - Second matrix.
 * @param {number} rowsA - Rows in matrix A.
 * @param {number} colsA - Columns in matrix A.
 * @param {number} colsB - Columns in matrix B.
 * @returns {Float32Array} Resulting matrix.
 */
export function gpuMatrixMultiply(gl, matrixA, matrixB, rowsA, colsA, colsB) {
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
    uniform vec2 dimensions;
    void main() {
      vec2 coords = gl_FragCoord.xy / dimensions;
      float result = 0.0;
      for (int i = 0; i < ${colsA}; ++i) {
        result += texture2D(matrixA, vec2(coords.x, float(i))) * 
                  texture2D(matrixB, vec2(float(i), coords.y));
      }
      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const program = createProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(program);

  // Create textures for matrices
  const textureA = gl.createTexture();
  const textureB = gl.createTexture();

  // Upload matrices to textures
  gl.bindTexture(gl.TEXTURE_2D, textureA);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, colsA, rowsA, 0, gl.RGBA, gl.FLOAT, matrixA);
  gl.bindTexture(gl.TEXTURE_2D, textureB);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, colsB, colsA, 0, gl.RGBA, gl.FLOAT, matrixB);

  // Set uniforms
  const dimensionsLocation = gl.getUniformLocation(program, 'dimensions');
  gl.uniform2f(dimensionsLocation, colsB, rowsA);

  // Perform draw call
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  const resultTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, resultTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, colsB, rowsA, 0, gl.RGBA, gl.FLOAT, null);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, resultTexture, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Read pixels back
  const result = new Float32Array(rowsA * colsB);
  gl.readPixels(0, 0, colsB, rowsA, gl.RGBA, gl.FLOAT, result);

  return result;
}

/**
 * Hashes a matrix for integrity checks.
 * @param {Float32Array} matrix - Matrix data.
 * @returns {string} SHA256 hash of the matrix.
 */
export function hashMatrix(matrix) {
  const hash = createHash('sha256');
  hash.update(Buffer.from(matrix.buffer));
  return hash.digest('hex');
}