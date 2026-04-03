/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixEngine
 * Written: 2026-04-03T04:59:05.629Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuAcceleratedMatrixEngine.mjs

import { createHash } from 'crypto';

/**
 * Initializes a WebGL context for GPU computations.
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
 * Compiles a WebGL shader.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {string} source - Shader source code.
 * @param {number} type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
 * @returns {WebGLShader} - Compiled shader.
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
 * Creates a WebGL program using vertex and fragment shaders.
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
    throw new Error(`Program linking error: ${error}`);
  }
  return program;
}

/**
 * Performs matrix multiplication using WebGL.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {Float32Array} matrixA - First matrix (flattened).
 * @param {Float32Array} matrixB - Second matrix (flattened).
 * @param {number} size - Size of the matrices (assumes square matrices).
 * @returns {Float32Array} - Resulting matrix (flattened).
 */
export function gpuMatrixMultiply(gl, matrixA, matrixB, size) {
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
    uniform float size;
    void main() {
      vec2 coord = gl_FragCoord.xy / size;
      float result = 0.0;
      for (float i = 0.0; i < size; i++) {
        result += texture2D(matrixA, vec2(i / size, coord.y)).r *
                  texture2D(matrixB, vec2(coord.x, i / size)).r;
      }
      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const program = createProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(program);

  const textureA = createMatrixTexture(gl, matrixA, size);
  const textureB = createMatrixTexture(gl, matrixB, size);

  const output = new Float32Array(size * size);
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  const outputTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, outputTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.FLOAT, null);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  gl.readPixels(0, 0, size, size, gl.RGBA, gl.FLOAT, output);

  return output;
}

/**
 * Creates a WebGL texture from a matrix.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {Float32Array} matrix - Matrix data (flattened).
 * @param {number} size - Size of the matrix (assumes square matrices).
 * @returns {WebGLTexture} - WebGL texture.
 */
export function createMatrixTexture(gl, matrix, size) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.FLOAT, matrix);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  return texture;
}
