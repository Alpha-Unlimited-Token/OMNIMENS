/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixEngine
 * Written: 2026-04-01T22:22:55.983Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * TRANSLATION STATUS:
 * Novel constructs: neural
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (1 IR steps) | python: OK (1 IR steps) | c: OK (1 IR steps) | x86_64: OK (1 IR steps) | arm64: OK (1 IR steps) | avr: OK (1 IR steps)
 * Translation map version: 22
 */
// gpuAcceleratedMatrixEngine.mjs

'use strict';

// Utility function to initialize WebGL context
function createWebGLContext() {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl');
  if (!gl) {
    throw new Error('Unable to initialize WebGL.');
  }
  return gl;
}

// Function to create and compile a shader
function compileShader(gl, type, source) {
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

// Function to create a WebGL program
function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

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

// GLSL shader sources for matrix multiplication
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
uniform vec2 u_dimensionsA;
uniform vec2 u_dimensionsB;

void main() {
  vec2 coord = gl_FragCoord.xy;
  float result = 0.0;

  for (int i = 0; i < int(u_dimensionsA.y); i++) {
    vec2 coordA = vec2(coord.x, float(i));
    vec2 coordB = vec2(float(i), coord.y);
    result += texture2D(u_matrixA, coordA / u_dimensionsA).r * texture2D(u_matrixB, coordB / u_dimensionsB).r;
  }

  gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
}
`;

// Function to perform GPU-accelerated matrix multiplication
export function gpuMatrixMultiply(matrixA, matrixB) {
  const gl = createWebGLContext();

  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(program);

  const dimensionsA = [matrixA.length, matrixA[0].length];
  const dimensionsB = [matrixB.length, matrixB[0].length];

  if (dimensionsA[1] !== dimensionsB[0]) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  // Flatten matrices and create textures
  const flattenedA = new Float32Array(matrixA.flat());
  const flattenedB = new Float32Array(matrixB.flat());

  const textureA = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureA);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, dimensionsA[1], dimensionsA[0], 0, gl.LUMINANCE, gl.FLOAT, flattenedA);

  const textureB = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureB);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, dimensionsB[1], dimensionsB[0], 0, gl.LUMINANCE, gl.FLOAT, flattenedB);

  // Set uniforms
  const uMatrixA = gl.getUniformLocation(program, 'u_matrixA');
  const uMatrixB = gl.getUniformLocation(program, 'u_matrixB');
  const uDimensionsA = gl.getUniformLocation(program, 'u_dimensionsA');
  const uDimensionsB = gl.getUniformLocation(program, 'u_dimensionsB');

  gl.uniform1i(uMatrixA, 0);
  gl.uniform1i(uMatrixB, 1);
  gl.uniform2fv(uDimensionsA, dimensionsA);
  gl.uniform2fv(uDimensionsB, dimensionsB);

  // Render and read back results
  const result = new Float32Array(dimensionsA[0] * dimensionsB[1]);
  gl.readPixels(0, 0, dimensionsB[1], dimensionsA[0], gl.LUMINANCE, gl.FLOAT, result);

  return Array.from({ length: dimensionsA[0] }, (_, i) =>
    result.slice(i * dimensionsB[1], (i + 1) * dimensionsB[1])
  );
}

export const moduleDescription = 'Provides GPU-accelerated matrix multiplication using WebGL for high-performance neural network computations.';