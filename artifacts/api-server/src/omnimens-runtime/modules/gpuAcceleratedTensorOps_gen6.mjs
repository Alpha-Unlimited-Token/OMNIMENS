/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedTensorOps
 * Written: 2026-04-02T14:52:19.453Z
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

'use strict';

/**
 * Utility to perform GPU-accelerated tensor operations using WebGL for high-dimensional computations.
 */

// Helper function to create a WebGL context
export function createWebGLContext(canvasWidth = 1, canvasHeight = 1) {
  const canvas = typeof OffscreenCanvas !== 'undefined' 
    ? new OffscreenCanvas(canvasWidth, canvasHeight) 
    : document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    throw new Error('WebGL is not supported in this environment.');
  }
  return gl;
}

// Helper function to compile a WebGL shader
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

// Helper function to create a WebGL program
export function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
  const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

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

// Function to perform matrix multiplication on the GPU
export function gpuMatrixMultiply(gl, matrixA, matrixB, size) {
  const vertexShaderSource = `
    attribute vec2 position;
    varying vec2 texCoord;
    void main() {
      texCoord = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    uniform sampler2D matrixA;
    uniform sampler2D matrixB;
    uniform float size;
    varying vec2 texCoord;

    void main() {
      float result = 0.0;
      for (float i = 0.0; i < size; i += 1.0) {
        result += texture2D(matrixA, vec2(i / size, texCoord.y)).r *
                  texture2D(matrixB, vec2(texCoord.x, i / size)).r;
      }
      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(program);

  // Create textures for input matrices
  const textureA = createTexture(gl, matrixA, size);
  const textureB = createTexture(gl, matrixB, size);

  // Set up uniforms
  const sizeLocation = gl.getUniformLocation(program, 'size');
  gl.uniform1f(sizeLocation, size);

  // Perform computation and return result
  return renderToTexture(gl, program, size);
}

// Helper function to create a texture from a matrix
export function createTexture(gl, matrix, size) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.LUMINANCE,
    size,
    size,
    0,
    gl.LUMINANCE,
    gl.FLOAT,
    new Float32Array(matrix)
  );

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return texture;
}

// Helper function to render the result to a texture
export function renderToTexture(gl, program, size) {
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  const outputTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, outputTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    size,
    size,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );

  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    outputTexture,
    0
  );

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  const result = new Float32Array(size * size * 4);
  gl.readPixels(0, 0, size, size, gl.RGBA, gl.FLOAT, result);

  return result;
}