/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-02T15:18:12.441Z
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
 * Utility function to initialize a WebGL context
 * @returns {WebGLRenderingContext} WebGL context for GPU computations
 */
export function initializeWebGLContext() {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl');
  if (!gl) throw new Error('WebGL not supported on this environment.');
  return gl;
}

/**
 * Compile a WebGL shader program
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {string} vertexShaderSource - GLSL source for vertex shader
 * @param {string} fragmentShaderSource - GLSL source for fragment shader
 * @returns {WebGLProgram} Compiled shader program
 */
export function compileShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    throw new Error(`Vertex shader compilation failed: ${gl.getShaderInfoLog(vertexShader)}`);
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    throw new Error(`Fragment shader compilation failed: ${gl.getShaderInfoLog(fragmentShader)}`);
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Shader program linking failed: ${gl.getProgramInfoLog(program)}`);
  }

  return program;
}

/**
 * Perform GPU-accelerated matrix multiplication
 * @param {Float32Array} matrixA - First matrix (flat row-major array)
 * @param {Float32Array} matrixB - Second matrix (flat row-major array)
 * @param {number} rowsA - Number of rows in matrix A
 * @param {number} colsA - Number of columns in matrix A
 * @param {number} colsB - Number of columns in matrix B
 * @returns {Float32Array} Resulting matrix (flat row-major array)
 */
export function gpuMatrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  const gl = initializeWebGLContext();

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
        result += texture2D(matrixA, vec2(coord.x, float(i))).r *
                  texture2D(matrixB, vec2(float(i), coord.y)).r;
      }
      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const program = compileShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

  // Prepare textures and uniforms for matrix data
  const textureA = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureA);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, colsA, rowsA, 0, gl.RED, gl.FLOAT, matrixA);

  const textureB = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureB);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, colsB, colsA, 0, gl.RED, gl.FLOAT, matrixB);

  gl.useProgram(program);

  const dimALocation = gl.getUniformLocation(program, 'dimA');
  const dimBLocation = gl.getUniformLocation(program, 'dimB');
  gl.uniform2f(dimALocation, rowsA, colsA);
  gl.uniform2f(dimBLocation, colsA, colsB);

  // Execute the shader program and read back the results
  const resultTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, resultTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, colsB, rowsA, 0, gl.RED, gl.FLOAT, null);

  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, resultTexture, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  const result = new Float32Array(rowsA * colsB);
  gl.readPixels(0, 0, colsB, rowsA, gl.RED, gl.FLOAT, result);

  return result;
}

/**
 * Compute cosine similarity between two vectors
 * @param {Float32Array} vectorA - First vector
 * @param {Float32Array} vectorB - Second vector
 * @returns {number} Cosine similarity score
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] ** 2;
    magnitudeB += vectorB[i] ** 2;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

/**
 * Generate a hash for a matrix to ensure integrity
 * @param {Float32Array} matrix - Matrix data
 * @returns {string} SHA256 hash of the matrix
 */
export function hashMatrix(matrix) {
  const hash = createHash('sha256');
  hash.update(new Uint8Array(matrix.buffer));
  return hash.digest('hex');
}