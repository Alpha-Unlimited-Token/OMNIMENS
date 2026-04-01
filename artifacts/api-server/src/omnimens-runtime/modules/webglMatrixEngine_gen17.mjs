/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webglMatrixEngine
 * Written: 2026-04-01T22:03:13.890Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webglMatrixEngine.mjs

import { createHash } from 'crypto';

/**
 * Utility function to create a WebGL context on a hidden canvas.
 * @returns {WebGLRenderingContext} WebGL context for GPU operations.
 */
export function createWebGLContext() {
  const canvas = Object.assign(document.createElement('canvas'), { width: 1, height: 1 });
  const gl = canvas.getContext('webgl');
  if (!gl) throw new Error('WebGL not supported');
  return gl;
}

/**
 * Compiles a WebGL shader.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {string} source GLSL source code.
 * @param {number} type Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
 * @returns {WebGLShader} Compiled shader.
 */
export function compileShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error('Shader compilation failed: ' + gl.getShaderInfoLog(shader));
  }
  return shader;
}

/**
 * Links shaders into a WebGL program.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {WebGLShader[]} shaders Array of compiled shaders.
 * @returns {WebGLProgram} Linked program.
 */
export function linkProgram(gl, shaders) {
  const program = gl.createProgram();
  shaders.forEach(shader => gl.attachShader(program, shader));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Program linking failed: ' + gl.getProgramInfoLog(program));
  }
  return program;
}

/**
 * Performs matrix multiplication using WebGL.
 * @param {Float32Array} matrixA First matrix (flattened).
 * @param {Float32Array} matrixB Second matrix (flattened).
 * @param {number} size Size of the square matrices.
 * @returns {Float32Array} Resulting matrix (flattened).
 */
export function multiplyMatricesWebGL(matrixA, matrixB, size) {
  const gl = createWebGLContext();

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
    uniform int size;
    void main() {
      vec2 coords = gl_FragCoord.xy / float(size);
      float result = 0.0;
      for (int i = 0; i < size; i++) {
        result += texture2D(matrixA, vec2(coords.x, float(i) / float(size))).r *
                  texture2D(matrixB, vec2(float(i) / float(size), coords.y)).r;
      }
      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  const program = linkProgram(gl, [vertexShader, fragmentShader]);

  gl.useProgram(program);

  const textureA = gl.createTexture();
  const textureB = gl.createTexture();

  const createTexture = (texture, data) => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, size, size, 0, gl.LUMINANCE, gl.FLOAT, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  };

  createTexture(textureA, matrixA);
  createTexture(textureB, matrixB);

  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  const outputTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, outputTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, size, size, 0, gl.LUMINANCE, gl.FLOAT, null);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  const result = new Float32Array(size * size);
  gl.readPixels(0, 0, size, size, gl.LUMINANCE, gl.FLOAT, result);

  return result;
}

/**
 * Hashes a matrix for integrity checks.
 * @param {Float32Array} matrix Flattened matrix.
 * @returns {string} SHA256 hash of the matrix.
 */
export function hashMatrix(matrix) {
  return createHash('sha256').update(new Uint8Array(matrix.buffer)).digest('hex');
}