/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedTensorOps
 * Written: 2026-04-02T19:25:00.262Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuAcceleratedTensorOps.mjs

import { createHash } from 'crypto';

/**
 * Utility function to create a WebGL context for GPU computations.
 * @returns {WebGLRenderingContext} - A WebGL rendering context.
 */
export function createWebGLContext() {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl');
  if (!gl) throw new Error('WebGL not supported');
  return gl;
}

/**
 * Compiles a WebGL shader.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {string} source - Shader source code.
 * @param {GLenum} type - Shader type (vertex/fragment).
 * @returns {WebGLShader} - Compiled shader.
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
 * Creates a WebGL program from vertex and fragment shaders.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {string} vertexSource - Vertex shader source code.
 * @param {string} fragmentSource - Fragment shader source code.
 * @returns {WebGLProgram} - Linked WebGL program.
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
 * Performs GPU-accelerated tensor multiplication.
 * @param {Float32Array} tensorA - Flattened tensor A.
 * @param {Float32Array} tensorB - Flattened tensor B.
 * @param {number} rowsA - Rows in tensor A.
 * @param {number} colsA - Columns in tensor A.
 * @param {number} colsB - Columns in tensor B.
 * @returns {Float32Array} - Resulting tensor.
 */
export function gpuMatrixMultiply(tensorA, tensorB, rowsA, colsA, colsB) {
  const gl = createWebGLContext();

  const vertexSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision highp float;
    uniform sampler2D tensorA;
    uniform sampler2D tensorB;
    uniform vec2 dimA;
    uniform vec2 dimB;

    void main() {
      vec2 coord = gl_FragCoord.xy;
      float result = 0.0;
      for (int i = 0; i < int(dimA.y); i++) {
        result += texture2D(tensorA, vec2(coord.x, float(i) / dimA.y)).r *
                  texture2D(tensorB, vec2(float(i) / dimB.x, coord.y)).r;
      }
      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const program = createProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(program);

  // Create textures for tensors
  const textureA = gl.createTexture();
  const textureB = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, textureA);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, colsA, rowsA, 0, gl.RED, gl.FLOAT, tensorA);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.bindTexture(gl.TEXTURE_2D, textureB);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, colsB, colsA, 0, gl.RED, gl.FLOAT, tensorB);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Set up framebuffer
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  const outputTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, outputTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, colsB, rowsA, 0, gl.RED, gl.FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0);

  // Execute shader program
  gl.viewport(0, 0, colsB, rowsA);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Read back result
  const result = new Float32Array(rowsA * colsB);
  gl.readPixels(0, 0, colsB, rowsA, gl.RED, gl.FLOAT, result);

  return result;
}

/**
 * Hashes tensor data for integrity checks.
 * @param {Float32Array} tensor - Tensor data.
 * @returns {string} - SHA256 hash of the tensor.
 */
export function hashTensor(tensor) {
  const hash = createHash('sha256');
  hash.update(Buffer.from(tensor.buffer));
  return hash.digest('hex');
}