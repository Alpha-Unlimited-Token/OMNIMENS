/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGlMatrixEngine
 * Written: 2026-04-02T15:14:50.374Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGlMatrixEngine.mjs

'use strict';

/**
 * Initialize a WebGL context for GPU-based computation.
 * @returns {WebGLRenderingContext} WebGL context
 */
export function initializeWebGLContext() {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl');
  if (!gl) {
    throw new Error('Failed to initialize WebGL context');
  }
  return gl;
}

/**
 * Compile a GLSL shader.
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {string} source - GLSL shader source code
 * @param {number} type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
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
 * Create a WebGL program from vertex and fragment shaders.
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {string} vertexSource - Vertex shader source code
 * @param {string} fragmentSource - Fragment shader source code
 * @returns {WebGLProgram} Linked WebGL program
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
 * @param {Float32Array} matrixA - First matrix (flattened)
 * @param {Float32Array} matrixB - Second matrix (flattened)
 * @param {number} size - Size of the square matrices
 * @returns {Float32Array} Resulting matrix (flattened)
 */
export function gpuMatrixMultiply(matrixA, matrixB, size) {
  const gl = initializeWebGLContext();

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
    uniform int size;
    
    vec4 getMatrixValue(sampler2D matrix, int row, int col) {
      float x = (float(col) + 0.5) / float(size);
      float y = (float(row) + 0.5) / float(size);
      return texture2D(matrix, vec2(x, y));
    }

    void main() {
      int row = int(gl_FragCoord.y);
      int col = int(gl_FragCoord.x);

      vec4 result = vec4(0.0);
      for (int k = 0; k < size; k++) {
        result += getMatrixValue(matrixA, row, k) * getMatrixValue(matrixB, k, col);
      }

      gl_FragColor = result;
    }
  `;

  const program = createProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(program);

  // Create textures for matrixA and matrixB
  const textureA = gl.createTexture();
  const textureB = gl.createTexture();

  // Upload matrices to textures
  gl.bindTexture(gl.TEXTURE_2D, textureA);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.FLOAT, matrixA);
  gl.bindTexture(gl.TEXTURE_2D, textureB);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.FLOAT, matrixB);

  // Set uniforms
  const sizeLocation = gl.getUniformLocation(program, 'size');
  gl.uniform1i(sizeLocation, size);

  // Render to a framebuffer
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  const outputTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, outputTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.FLOAT, null);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0);

  gl.viewport(0, 0, size, size);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Read the result
  const result = new Float32Array(size * size * 4);
  gl.readPixels(0, 0, size, size, gl.RGBA, gl.FLOAT, result);

  return result;
}
