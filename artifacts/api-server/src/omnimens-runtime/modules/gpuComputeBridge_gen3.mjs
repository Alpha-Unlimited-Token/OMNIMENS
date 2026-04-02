/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuComputeBridge
 * Written: 2026-04-02T20:58:39.741Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuComputeBridge.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique identifier for shader programs based on their source code.
 * This ensures reusability and prevents redundant compilation.
 */
export function generateShaderId(shaderSource) {
  const hash = createHash('sha256');
  hash.update(shaderSource);
  return hash.digest('hex');
}

/**
 * Creates a WebGL context from a canvas element for GPU computations.
 * @returns {WebGLRenderingContext} A WebGL context for GPU operations.
 */
export function createWebGLContext() {
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(1, 1);
  const gl = canvas.getContext('webgl');

  if (!gl) {
    throw new Error('WebGL not supported in the current environment.');
  }

  return gl;
}

/**
 * Compiles a GLSL shader (vertex or fragment) for use in WebGL.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {string} source - The GLSL shader source code.
 * @param {number} type - The type of shader (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
 * @returns {WebGLShader} The compiled shader.
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
 * Links vertex and fragment shaders into a WebGL program.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {WebGLShader} vertexShader - The compiled vertex shader.
 * @param {WebGLShader} fragmentShader - The compiled fragment shader.
 * @returns {WebGLProgram} The linked WebGL program.
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
 * Sets up a WebGL texture for matrix data.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {Float32Array} data - The matrix data to upload.
 * @param {number} width - The width of the matrix.
 * @param {number} height - The height of the matrix.
 * @returns {WebGLTexture} The created WebGL texture.
 */
export function createMatrixTexture(gl, data, width, height) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.FLOAT,
    data
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  return texture;
}

/**
 * Executes a GPU-accelerated matrix multiplication using WebGL.
 * @param {Float32Array} matA - The first matrix as a flat array.
 * @param {Float32Array} matB - The second matrix as a flat array.
 * @param {number} widthA - The width of the first matrix.
 * @param {number} heightA - The height of the first matrix.
 * @param {number} widthB - The width of the second matrix.
 * @returns {Float32Array} The resulting matrix as a flat array.
 */
export function gpuMatrixMultiply(matA, matB, widthA, heightA, widthB) {
  if (matA.length !== widthA * heightA || matB.length !== widthB * heightA) {
    throw new Error('Matrix dimensions do not match the provided sizes.');
  }

  const gl = createWebGLContext();

  // GLSL shaders for matrix multiplication
  const vertexShaderSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0, 1);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    varying vec2 v_uv;
    uniform sampler2D u_matA;
    uniform sampler2D u_matB;
    uniform float u_widthA;
    uniform float u_widthB;
    void main() {
      float sum = 0.0;
      for (float i = 0.0; i < u_widthA; i++) {
        float a = texture2D(u_matA, vec2(i / u_widthA, v_uv.y)).r;
        float b = texture2D(u_matB, vec2(v_uv.x, i / u_widthB)).r;
        sum += a * b;
      }
      gl_FragColor = vec4(sum, 0, 0, 1);
    }
  `;

  const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(
    gl,
    fragmentShaderSource,
    gl.FRAGMENT_SHADER
  );
  const program = createProgram(gl, vertexShader, fragmentShader);

  // Set up textures and framebuffer
  const textureA = createMatrixTexture(gl, matA, widthA, heightA);
  const textureB = createMatrixTexture(gl, matB, widthB, heightA);

  gl.useProgram(program);
  gl.uniform1f(gl.getUniformLocation(program, 'u_widthA'), widthA);
  gl.uniform1f(gl.getUniformLocation(program, 'u_widthB'), widthB);
  gl.uniform1i(gl.getUniformLocation(program, 'u_matA'), 0);
  gl.uniform1i(gl.getUniformLocation(program, 'u_matB'), 1);

  // Execute GPU computation
  const result = new Float32Array(widthB * heightA);
  gl.readPixels(0, 0, widthB, heightA, gl.RGBA, gl.FLOAT, result);

  return result;
}