/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webglMatrixAcceleration
 * Written: 2026-04-02T15:18:37.598Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { createHash } from 'crypto';

/**
 * Initializes a WebGL context for GPU-based computation.
 * This function is used internally to set up shaders and manage GPU resources.
 */
export function initializeWebGLContext(canvasWidth = 1, canvasHeight = 1) {
  const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
  const gl = canvas.getContext('webgl');

  if (!gl) {
    throw new Error('WebGL is not supported on this environment.');
  }

  return gl;
}

/**
 * Compiles a GLSL shader program.
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
 * Links a vertex and fragment shader into a WebGL program.
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
 * Accelerates matrix multiplication using WebGL.
 * @param {Float32Array} matrixA - The first matrix (flattened row-major order).
 * @param {Float32Array} matrixB - The second matrix (flattened row-major order).
 * @param {number} size - The size of the square matrices (NxN).
 * @returns {Float32Array} The resulting matrix (flattened row-major order).
 */
export function gpuMatrixMultiply(matrixA, matrixB, size) {
  const gl = initializeWebGLContext(size, size);

  const vertexShaderSource = `
    attribute vec2 a_position;
    varying vec2 v_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_position = a_position * 0.5 + 0.5;
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    uniform sampler2D u_matrixA;
    uniform sampler2D u_matrixB;
    varying vec2 v_position;
    uniform float u_size;

    void main() {
      float result = 0.0;
      for (float i = 0.0; i < u_size; i += 1.0) {
        float a = texture2D(u_matrixA, vec2(i / u_size, v_position.y)).r;
        float b = texture2D(u_matrixB, vec2(v_position.x, i / u_size)).r;
        result += a * b;
      }
      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  const program = createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  // Set up input textures for matrixA and matrixB
  const textureA = gl.createTexture();
  const textureB = gl.createTexture();

  // Configure and upload matrixA
  gl.bindTexture(gl.TEXTURE_2D, textureA);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, size, size, 0, gl.LUMINANCE, gl.FLOAT, matrixA);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Configure and upload matrixB
  gl.bindTexture(gl.TEXTURE_2D, textureB);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, size, size, 0, gl.LUMINANCE, gl.FLOAT, matrixB);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Set uniforms
  const sizeLocation = gl.getUniformLocation(program, 'u_size');
  gl.uniform1f(sizeLocation, size);

  const matrixALocation = gl.getUniformLocation(program, 'u_matrixA');
  const matrixBLocation = gl.getUniformLocation(program, 'u_matrixB');
  gl.uniform1i(matrixALocation, 0);
  gl.uniform1i(matrixBLocation, 1);

  // Perform rendering to compute the result
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  const resultTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, resultTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, resultTexture, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  const result = new Float32Array(size * size);
  gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, result);

  return result;
}
