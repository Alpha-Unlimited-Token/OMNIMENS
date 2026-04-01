/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-01T22:14:30.356Z
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

'use strict';

// Utility function to create a WebGL context
export function createWebGLContext(canvasWidth = 1, canvasHeight = 1) {
  const { createCanvas } = require('canvas'); // Node.js-compatible canvas
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) {
    throw new Error('WebGL is not supported in this environment.');
  }

  return gl;
}

// Compile a WebGL shader
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

// Create a WebGL program from vertex and fragment shaders
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

// Perform matrix multiplication using WebGL
export function gpuMatrixMultiply(gl, matrixA, matrixB, rowsA, colsA, colsB) {
  if (colsA !== matrixB.length / colsB) {
    throw new Error('Matrix dimensions do not align for multiplication.');
  }

  const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    uniform sampler2D u_matrixA;
    uniform sampler2D u_matrixB;
    uniform vec2 u_dimensions;

    void main() {
      float sum = 0.0;
      for (int i = 0; i < 256; i++) { // Assuming max size for simplicity
        if (i >= int(u_dimensions.x)) break;
        vec4 a = texture2D(u_matrixA, vec2(float(i) / u_dimensions.x, gl_FragCoord.y / u_dimensions.y));
        vec4 b = texture2D(u_matrixB, vec2(gl_FragCoord.x / u_dimensions.z, float(i) / u_dimensions.x));
        sum += a.r * b.r;
      }
      gl_FragColor = vec4(sum, 0.0, 0.0, 1.0);
    }
  `;

  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(program);

  // Setup WebGL textures for matrixA and matrixB
  const textureA = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureA);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, colsA, rowsA, 0, gl.RGBA, gl.FLOAT, new Float32Array(matrixA));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  const textureB = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureB);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, colsB, colsA, 0, gl.RGBA, gl.FLOAT, new Float32Array(matrixB));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Set uniforms
  const dimensionsLocation = gl.getUniformLocation(program, 'u_dimensions');
  gl.uniform2f(dimensionsLocation, colsA, rowsA);

  // Render to a framebuffer and read back the results
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  const resultTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, resultTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, colsB, rowsA, 0, gl.RGBA, gl.FLOAT, null);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, resultTexture, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  const result = new Float32Array(rowsA * colsB * 4);
  gl.readPixels(0, 0, colsB, rowsA, gl.RGBA, gl.FLOAT, result);

  return result;
}

// Exported utility functions
export const gpuAcceleratedMatrixOps = {
  createWebGLContext,
  compileShader,
  createProgram,
  gpuMatrixMultiply
};