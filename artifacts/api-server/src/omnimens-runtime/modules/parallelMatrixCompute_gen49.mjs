/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: parallelMatrixCompute
 * Written: 2026-04-02T14:26:46.130Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// parallelMatrixCompute.mjs

import { createHash } from 'crypto';

/**
 * Initialize a WebGL context on a canvas for GPU-like matrix computations.
 * @returns {WebGLRenderingContext} WebGL context
 */
export function initializeWebGLContext() {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl');

  if (!gl) {
    throw new Error('Failed to initialize WebGL context.');
  }

  return gl;
}

/**
 * Create a WebGL shader program.
 * @param {WebGLRenderingContext} gl WebGL context
 * @param {string} vertexShaderSource Vertex shader source code
 * @param {string} fragmentShaderSource Fragment shader source code
 * @returns {WebGLProgram} Compiled WebGL program
 */
export function createShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    throw new Error(`Failed to link WebGL program: ${info}`);
  }

  return program;
}

/**
 * Compile a WebGL shader.
 * @param {WebGLRenderingContext} gl WebGL context
 * @param {number} type Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
 * @param {string} source Shader source code
 * @returns {WebGLShader} Compiled shader
 */
export function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    throw new Error(`Failed to compile shader: ${info}`);
  }

  return shader;
}

/**
 * Perform matrix multiplication using WebGL.
 * @param {WebGLRenderingContext} gl WebGL context
 * @param {Float32Array} matrixA Flattened matrix A
 * @param {Float32Array} matrixB Flattened matrix B
 * @param {number} rowsA Number of rows in matrix A
 * @param {number} colsA Number of columns in matrix A
 * @param {number} colsB Number of columns in matrix B
 * @returns {Float32Array} Resulting matrix after multiplication
 */
export function gpuMatrixMultiply(gl, matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
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
    uniform vec2 dimA;
    uniform vec2 dimB;

    void main() {
      vec2 coord = gl_FragCoord.xy;
      float result = 0.0;

      for (int i = 0; i < int(dimA.y); i++) {
        vec2 aCoord = vec2(coord.x, float(i)) / dimA;
        vec2 bCoord = vec2(float(i), coord.y) / dimB;
        result += texture2D(matrixA, aCoord).r * texture2D(matrixB, bCoord).r;
      }

      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const program = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(program);

  // Upload matrices and dimensions to GPU
  const textureA = createTexture(gl, matrixA, rowsA, colsA);
  const textureB = createTexture(gl, matrixB, colsA, colsB);

  const dimALoc = gl.getUniformLocation(program, 'dimA');
  const dimBLoc = gl.getUniformLocation(program, 'dimB');
  gl.uniform2f(dimALoc, rowsA, colsA);
  gl.uniform2f(dimBLoc, colsA, colsB);

  // Perform computation and read back result
  const result = new Float32Array(rowsA * colsB);
  gl.readPixels(0, 0, rowsA, colsB, gl.RED, gl.FLOAT, result);

  return result;
}

/**
 * Create a WebGL texture from a matrix.
 * @param {WebGLRenderingContext} gl WebGL context
 * @param {Float32Array} matrix Flattened matrix
 * @param {number} rows Number of rows
 * @param {number} cols Number of columns
 * @returns {WebGLTexture} WebGL texture
 */
export function createTexture(gl, matrix, rows, cols) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, cols, rows, 0, gl.LUMINANCE, gl.FLOAT, matrix);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return texture;
}
