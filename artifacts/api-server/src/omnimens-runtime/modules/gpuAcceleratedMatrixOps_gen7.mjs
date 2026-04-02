/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-02T14:52:14.433Z
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
 * Utility to create a WebGL context for GPU computations.
 * @returns {WebGLRenderingContext} Initialized WebGL context.
 */
export function createWebGLContext() {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl');
  if (!gl) {
    throw new Error('WebGL not supported on this environment.');
  }
  return gl;
}

/**
 * Compiles a WebGL shader.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {string} source - GLSL shader source code.
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
    throw new Error(`Shader compilation error: ${error}`);
  }
  return shader;
}

/**
 * Creates a WebGL program from vertex and fragment shaders.
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
    throw new Error(`Program linking error: ${error}`);
  }

  return program;
}

/**
 * Performs GPU-accelerated matrix multiplication.
 * @param {Float32Array} A - First matrix in row-major order.
 * @param {Float32Array} B - Second matrix in row-major order.
 * @param {number} rowsA - Number of rows in A.
 * @param {number} colsA - Number of columns in A.
 * @param {number} colsB - Number of columns in B.
 * @returns {Float32Array} Resulting matrix in row-major order.
 */
export function gpuMatrixMultiply(A, B, rowsA, colsA, colsB) {
  if (A.length !== rowsA * colsA || B.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const gl = createWebGLContext();

  const vertexSource = `
    attribute vec2 position;
    varying vec2 uv;
    void main() {
      uv = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0, 1);
    }
  `;

  const fragmentSource = `
    precision highp float;
    uniform sampler2D textureA;
    uniform sampler2D textureB;
    uniform float colsA;
    uniform float colsB;
    varying vec2 uv;

    void main() {
      float sum = 0.0;
      for (float i = 0.0; i < colsA; i += 1.0) {
        float a = texture2D(textureA, vec2(i / colsA, uv.y)).r;
        float b = texture2D(textureB, vec2(uv.x, i / colsB)).r;
        sum += a * b;
      }
      gl_FragColor = vec4(sum, 0, 0, 1);
    }
  `;

  const program = createProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(program);

  // Create textures for A and B matrices.
  const textureA = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureA);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, colsA, rowsA, 0, gl.LUMINANCE, gl.FLOAT, A);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  const textureB = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureB);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, colsB, colsA, 0, gl.LUMINANCE, gl.FLOAT, B);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Set uniforms.
  const colsALocation = gl.getUniformLocation(program, 'colsA');
  const colsBLocation = gl.getUniformLocation(program, 'colsB');
  gl.uniform1f(colsALocation, colsA);
  gl.uniform1f(colsBLocation, colsB);

  // Create framebuffer to read output.
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  const outputTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, outputTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, colsB, rowsA, 0, gl.LUMINANCE, gl.FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0);

  // Draw and read pixels.
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  const result = new Float32Array(rowsA * colsB);
  gl.readPixels(0, 0, colsB, rowsA, gl.LUMINANCE, gl.FLOAT, result);

  return result;
}
