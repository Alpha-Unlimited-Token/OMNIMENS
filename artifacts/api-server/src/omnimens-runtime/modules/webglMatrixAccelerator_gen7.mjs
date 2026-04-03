/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webglMatrixAccelerator
 * Written: 2026-04-03T07:00:52.991Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webglMatrixAccelerator.mjs

'use strict';

/**
 * Initializes a WebGL context for matrix operations.
 * @returns {WebGLRenderingContext} WebGL context
 */
export function initializeWebGLContext() {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl');
  if (!gl) throw new Error('WebGL not supported');
  return gl;
}

/**
 * Compiles a WebGL shader.
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {string} source - GLSL shader source code
 * @param {GLenum} type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
 * @returns {WebGLShader} Compiled shader
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
 * Links shaders into a WebGL program.
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {WebGLShader} vertexShader - Vertex shader
 * @param {WebGLShader} fragmentShader - Fragment shader
 * @returns {WebGLProgram} Linked program
 */
export function linkProgram(gl, vertexShader, fragmentShader) {
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
 * Creates a WebGL program for matrix multiplication.
 * @param {WebGLRenderingContext} gl - WebGL context
 * @returns {WebGLProgram} WebGL program
 */
export function createMatrixMultiplicationProgram(gl) {
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
    uniform vec2 dimensionsA;
    uniform vec2 dimensionsB;

    void main() {
      vec2 coord = gl_FragCoord.xy;
      float result = 0.0;
      for (int i = 0; i < int(dimensionsA.y); i++) {
        vec2 aCoord = vec2(coord.x, float(i));
        vec2 bCoord = vec2(float(i), coord.y);
        result += texture2D(matrixA, aCoord / dimensionsA).r * texture2D(matrixB, bCoord / dimensionsB).r;
      }
      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  return linkProgram(gl, vertexShader, fragmentShader);
}

/**
 * Performs matrix multiplication using WebGL.
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {Float32Array} matrixA - Flattened matrix A
 * @param {Float32Array} matrixB - Flattened matrix B
 * @param {number} rowsA - Number of rows in matrix A
 * @param {number} colsA - Number of columns in matrix A
 * @param {number} colsB - Number of columns in matrix B
 * @returns {Float32Array} Resulting flattened matrix
 */
export function multiplyMatrices(gl, matrixA, matrixB, rowsA, colsA, colsB) {
  const program = createMatrixMultiplicationProgram(gl);
  gl.useProgram(program);

  // Create textures for matrix A and B
  const textureA = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureA);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, colsA, rowsA, 0, gl.LUMINANCE, gl.FLOAT, matrixA);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  const textureB = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureB);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, colsB, colsA, 0, gl.LUMINANCE, gl.FLOAT, matrixB);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Set uniforms
  const dimensionsALoc = gl.getUniformLocation(program, 'dimensionsA');
  const dimensionsBLoc = gl.getUniformLocation(program, 'dimensionsB');
  gl.uniform2f(dimensionsALoc, colsA, rowsA);
  gl.uniform2f(dimensionsBLoc, colsB, colsA);

  // Draw to framebuffer
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  const outputTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, outputTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, colsB, rowsA, 0, gl.LUMINANCE, gl.FLOAT, null);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0);

  gl.viewport(0, 0, colsB, rowsA);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Read pixels
  const result = new Float32Array(rowsA * colsB);
  gl.readPixels(0, 0, colsB, rowsA, gl.LUMINANCE, gl.FLOAT, result);

  return result;
}