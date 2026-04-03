/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuMatrixAcceleration
 * Written: 2026-04-03T02:33:40.672Z
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

'use strict';

/**
 * Initialize a WebGL context for GPU computations.
 * @returns {WebGLRenderingContext} The WebGL context.
 */
export function initializeWebGLContext() {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl');
  if (!gl) {
    throw new Error('WebGL not supported');
  }
  return gl;
}

/**
 * Compile a WebGL shader.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {string} source - The GLSL source code.
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
 * Create a WebGL program from vertex and fragment shaders.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {string} vertexSource - The vertex shader source code.
 * @param {string} fragmentSource - The fragment shader source code.
 * @returns {WebGLProgram} The linked WebGL program.
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
 * Perform matrix multiplication using WebGL.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {Float32Array} matrixA - The first matrix (flattened).
 * @param {Float32Array} matrixB - The second matrix (flattened).
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A.
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Float32Array} The resulting matrix (flattened).
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
    uniform vec2 dimsA;
    uniform vec2 dimsB;

    void main() {
      vec2 coord = gl_FragCoord.xy;
      float result = 0.0;
      for (int i = 0; i < int(dimsA.y); i++) {
        float a = texture2D(matrixA, vec2(coord.x, float(i) / dimsA.y)).r;
        float b = texture2D(matrixB, vec2(float(i) / dimsB.x, coord.y)).r;
        result += a * b;
      }
      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const program = createProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(program);

  // Create textures for matrix A and B
  const textureA = gl.createTexture();
  const textureB = gl.createTexture();

  // Bind and upload matrix A
  gl.bindTexture(gl.TEXTURE_2D, textureA);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.R32F,
    colsA,
    rowsA,
    0,
    gl.RED,
    gl.FLOAT,
    matrixA
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Bind and upload matrix B
  gl.bindTexture(gl.TEXTURE_2D, textureB);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.R32F,
    colsB,
    colsA,
    0,
    gl.RED,
    gl.FLOAT,
    matrixB
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Set uniforms
  const dimsALoc = gl.getUniformLocation(program, 'dimsA');
  const dimsBLoc = gl.getUniformLocation(program, 'dimsB');
  gl.uniform2f(dimsALoc, colsA, rowsA);
  gl.uniform2f(dimsBLoc, colsB, colsA);

  // Render and read back result
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
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    outputTexture,
    0
  );

  gl.viewport(0, 0, colsB, rowsA);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  const result = new Float32Array(rowsA * colsB);
  gl.readPixels(0, 0, colsB, rowsA, gl.RED, gl.FLOAT, result);

  return result;
}
