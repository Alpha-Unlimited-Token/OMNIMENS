/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-01T22:02:27.021Z
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
 * Initialize WebGL context for GPU computations.
 * @returns {WebGLRenderingContext} - WebGL context.
 */
export function initializeWebGLContext() {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl');

  if (!gl) {
    throw new Error('WebGL is not supported on this environment.');
  }

  return gl;
}

/**
 * Create a WebGL shader.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {number} type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
 * @param {string} source - GLSL source code for the shader.
 * @returns {WebGLShader} - Compiled WebGL shader.
 */
export function createShader(gl, type, source) {
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
 * Create a WebGL program.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {WebGLShader} vertexShader - Compiled vertex shader.
 * @param {WebGLShader} fragmentShader - Compiled fragment shader.
 * @returns {WebGLProgram} - Linked WebGL program.
 */
export function createProgram(gl, vertexShader, fragmentShader) {
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
 * Perform GPU-accelerated matrix multiplication.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {Float32Array} matrixA - Flattened matrix A.
 * @param {Float32Array} matrixB - Flattened matrix B.
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A.
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Float32Array} - Resulting flattened matrix.
 */
export function gpuMatrixMultiply(gl, matrixA, matrixB, rowsA, colsA, colsB) {
  // Vertex shader source code.
  const vertexShaderSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // Fragment shader source code.
  const fragmentShaderSource = `
    precision highp float;
    uniform sampler2D matrixA;
    uniform sampler2D matrixB;
    uniform vec2 dimensionsA;
    uniform vec2 dimensionsB;

    void main() {
      vec2 coord = gl_FragCoord.xy;
      float result = 0.0;

      for (int i = 0; i < int(dimensionsA.y); i++) {
        float a = texture2D(matrixA, vec2(coord.x, float(i) / dimensionsA.y)).r;
        float b = texture2D(matrixB, vec2(float(i) / dimensionsB.x, coord.y)).r;
        result += a * b;
      }

      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  // Create textures and upload matrices.
  const textureA = gl.createTexture();
  const textureB = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, textureA);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, colsA, rowsA, 0, gl.RED, gl.FLOAT, matrixA);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.bindTexture(gl.TEXTURE_2D, textureB);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, colsB, colsA, 0, gl.RED, gl.FLOAT, matrixB);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Set uniforms.
  const dimensionsALoc = gl.getUniformLocation(program, 'dimensionsA');
  const dimensionsBLoc = gl.getUniformLocation(program, 'dimensionsB');

  gl.uniform2f(dimensionsALoc, colsA, rowsA);
  gl.uniform2f(dimensionsBLoc, colsB, colsA);

  // Render to texture.
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  const outputTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, outputTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, colsB, rowsA, 0, gl.RED, gl.FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0);

  gl.viewport(0, 0, colsB, rowsA);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Read results back.
  const result = new Float32Array(rowsA * colsB);
  gl.readPixels(0, 0, colsB, rowsA, gl.RED, gl.FLOAT, result);

  return result;
}

/**
 * Generate a deterministic hash for matrix data.
 * @param {Float32Array} matrix - Flattened matrix data.
 * @returns {string} - SHA256 hash of the matrix.
 */
export function hashMatrix(matrix) {
  const hash = createHash('sha256');
  hash.update(Buffer.from(matrix.buffer));
  return hash.digest('hex');
}