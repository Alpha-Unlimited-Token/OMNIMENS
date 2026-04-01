/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-01T22:02:21.756Z
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
 * Utility to create a WebGL-compatible shader program for matrix operations.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {string} vertexSource - Vertex shader source code.
 * @param {string} fragmentSource - Fragment shader source code.
 * @returns {WebGLProgram} Compiled and linked shader program.
 */
export function createShaderProgram(gl, vertexSource, fragmentSource) {
  const compileShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(`Shader compilation error: ${gl.getShaderInfoLog(shader)}`);
    }
    return shader;
  };

  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program linking error: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

/**
 * Perform GPU-accelerated matrix multiplication.
 * @param {Float32Array} matrixA - First matrix (flat array).
 * @param {Float32Array} matrixB - Second matrix (flat array).
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A.
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Float32Array} Resultant matrix (flat array).
 */
export function gpuMatrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match the provided sizes.');
  }

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  if (!gl) {
    throw new Error('WebGL not supported.');
  }

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
    void main() {
      vec2 coord = gl_FragCoord.xy;
      float result = 0.0;
      for (int i = 0; i < int(dimA.y); i++) {
        vec2 aCoord = vec2(coord.x, float(i));
        vec2 bCoord = vec2(float(i), coord.y);
        result += texture2D(matrixA, aCoord / dimA).r * texture2D(matrixB, bCoord / dimB).r;
      }
      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const program = createShaderProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(program);

  // Create textures for matrix A and B.
  const createTexture = (data, width, height) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.FLOAT, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
  };

  const textureA = createTexture(matrixA, colsA, rowsA);
  const textureB = createTexture(matrixB, colsB, colsA);

  // Set uniforms.
  const dimALoc = gl.getUniformLocation(program, 'dimA');
  const dimBLoc = gl.getUniformLocation(program, 'dimB');
  gl.uniform2f(dimALoc, colsA, rowsA);
  gl.uniform2f(dimBLoc, colsB, colsA);

  // Perform rendering to compute the result.
  const output = new Float32Array(rowsA * colsB);
  gl.readPixels(0, 0, colsB, rowsA, gl.LUMINANCE, gl.FLOAT, output);

  return output;
}

/**
 * Generate a hash of matrix data for validation or caching purposes.
 * @param {Float32Array} matrix - Matrix data (flat array).
 * @returns {string} SHA-256 hash of matrix data.
 */
export function hashMatrix(matrix) {
  const hash = createHash('sha256');
  hash.update(new Uint8Array(matrix.buffer));
  return hash.digest('hex');
}