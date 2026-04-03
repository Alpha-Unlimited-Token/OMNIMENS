/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuMatrixEngine
 * Written: 2026-04-03T12:43:50.086Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuMatrixEngine.mjs

import { createHash } from 'crypto';

/**
 * Initialize a WebGL context for GPU-accelerated computations.
 * @returns {WebGLRenderingContext} - A WebGL rendering context.
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
 * Compile a WebGL shader.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {string} source - The GLSL source code for the shader.
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
 * Create a WebGL program from vertex and fragment shaders.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {string} vertexSource - The GLSL source code for the vertex shader.
 * @param {string} fragmentSource - The GLSL source code for the fragment shader.
 * @returns {WebGLProgram} - The linked WebGL program.
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
 * Perform GPU-accelerated matrix multiplication.
 * @param {Float32Array} matrixA - The first matrix in row-major order.
 * @param {Float32Array} matrixB - The second matrix in row-major order.
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA.
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Float32Array} - The resulting matrix in row-major order.
 */
export function gpuMatrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const gl = initializeWebGLContext();

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
    uniform sampler2D u_matrixA;
    uniform sampler2D u_matrixB;
    uniform vec2 u_dimensionsA;
    uniform vec2 u_dimensionsB;
    void main() {
      vec2 coord = gl_FragCoord.xy;
      float result = 0.0;
      for (int i = 0; i < 256; i++) { // Limit to 256 for safety
        if (i >= int(u_dimensionsA.y)) break;
        vec2 aCoord = vec2(float(i) / u_dimensionsA.y, coord.y / u_dimensionsA.x);
        vec2 bCoord = vec2(coord.x / u_dimensionsB.x, float(i) / u_dimensionsB.y);
        result += texture2D(u_matrixA, aCoord).r * texture2D(u_matrixB, bCoord).r;
      }
      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const program = createProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(program);

  // Prepare data textures for matrixA and matrixB
  const textureA = createTexture(gl, matrixA, colsA, rowsA);
  const textureB = createTexture(gl, matrixB, colsB, colsA);

  // Set uniforms and attributes
  const dimensionsALoc = gl.getUniformLocation(program, 'u_dimensionsA');
  const dimensionsBLoc = gl.getUniformLocation(program, 'u_dimensionsB');
  gl.uniform2f(dimensionsALoc, colsA, rowsA);
  gl.uniform2f(dimensionsBLoc, colsB, colsA);

  // Execute the shader and read back the result
  const result = readFramebuffer(gl, colsB, rowsA);

  // Cleanup
  gl.deleteTexture(textureA);
  gl.deleteTexture(textureB);
  gl.deleteProgram(program);

  return result;
}

/**
 * Create a WebGL texture from a matrix.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {Float32Array} data - The matrix data in row-major order.
 * @param {number} width - The number of columns in the matrix.
 * @param {number} height - The number of rows in the matrix.
 * @returns {WebGLTexture} - The created texture.
 */
function createTexture(gl, data, width, height) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.LUMINANCE,
    width,
    height,
    0,
    gl.LUMINANCE,
    gl.FLOAT,
    data
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return texture;
}

/**
 * Read the framebuffer data into a Float32Array.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {number} width - The width of the framebuffer.
 * @param {number} height - The height of the framebuffer.
 * @returns {Float32Array} - The framebuffer data.
 */
function readFramebuffer(gl, width, height) {
  const result = new Float32Array(width * height);
  gl.readPixels(0, 0, width, height, gl.RED, gl.FLOAT, result);
  return result;
}