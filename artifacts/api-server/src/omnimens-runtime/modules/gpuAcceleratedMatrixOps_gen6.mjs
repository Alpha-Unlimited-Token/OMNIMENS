/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-03T15:58:47.368Z
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
 * Generates a unique WebGL context identifier for matrix operations.
 * Ensures no conflicts across agents using GPU resources.
 */
export function generateContextID(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex').slice(0, 16);
}

/**
 * Initializes a WebGL context for GPU-accelerated computations.
 * @returns {WebGLRenderingContext | null} WebGL context or null if unavailable.
 */
export function initializeWebGLContext() {
  try {
    const canvas = new OffscreenCanvas(1, 1);
    const gl = canvas.getContext('webgl');
    if (!gl) throw new Error('WebGL not supported');
    return gl;
  } catch (error) {
    console.error('Failed to initialize WebGL context:', error);
    return null;
  }
}

/**
 * Compiles a WebGL shader.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {string} source - GLSL shader source code.
 * @param {number} type - Shader type (vertex or fragment).
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
 * Creates a WebGL program for matrix operations.
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
 * Executes a GPU-accelerated matrix multiplication.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {Float32Array} matrixA - First matrix (flattened).
 * @param {Float32Array} matrixB - Second matrix (flattened).
 * @param {number} dim - Dimension of square matrices.
 * @returns {Float32Array} Result matrix (flattened).
 */
export function gpuMatrixMultiply(gl, matrixA, matrixB, dim) {
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
    uniform float dim;

    void main() {
      vec2 coord = gl_FragCoord.xy / dim;
      float result = 0.0;
      for (float i = 0.0; i < dim; i++) {
        result += texture2D(matrixA, vec2(i / dim, coord.y)).r *
                  texture2D(matrixB, vec2(coord.x, i / dim)).r;
      }
      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const program = createProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(program);

  const textureA = gl.createTexture();
  const textureB = gl.createTexture();

  // Upload matrices as textures
  gl.bindTexture(gl.TEXTURE_2D, textureA);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, dim, dim, 0, gl.LUMINANCE, gl.FLOAT, matrixA);
  gl.bindTexture(gl.TEXTURE_2D, textureB);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, dim, dim, 0, gl.LUMINANCE, gl.FLOAT, matrixB);

  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  const outputTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, outputTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, dim, dim, 0, gl.LUMINANCE, gl.FLOAT, null);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0);

  gl.viewport(0, 0, dim, dim);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  const result = new Float32Array(dim * dim);
  gl.readPixels(0, 0, dim, dim, gl.LUMINANCE, gl.FLOAT, result);

  return result;
}

/**
 * Validates matrix dimensions and input data.
 * @param {Float32Array} matrix - Flattened matrix.
 * @param {number} dim - Expected dimension.
 * @returns {boolean} True if valid, otherwise throws an error.
 */
export function validateMatrix(matrix, dim) {
  if (matrix.length !== dim * dim) {
    throw new Error(`Matrix size mismatch: expected ${dim * dim}, got ${matrix.length}`);
  }
  return true;
}