/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webglTensorEngine
 * Written: 2026-04-02T14:26:01.717Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webglTensorEngine.mjs

import { createHash } from 'crypto';

// Utility function to create a WebGL context
export function createWebGLContext(width = 1, height = 1) {
  const canvas = new OffscreenCanvas(width, height);
  const gl = canvas.getContext('webgl');
  if (!gl) throw new Error('Failed to create WebGL context');
  return gl;
}

// Compile a GLSL shader
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

// Utility to create a texture from a tensor (array)
export function createTexture(gl, data, width, height) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.R32F,
    width,
    height,
    0,
    gl.RED,
    gl.FLOAT,
    new Float32Array(data)
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

// Perform a GPU-accelerated matrix multiplication
export function gpuMatrixMultiply(gl, matrixA, matrixB, widthA, heightA, widthB) {
  if (heightA !== widthB) throw new Error('Matrix dimensions are incompatible for multiplication');

  const vertexSource = `
    attribute vec2 position;
    varying vec2 uv;
    void main() {
      uv = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision highp float;
    uniform sampler2D matrixA;
    uniform sampler2D matrixB;
    uniform float widthA;
    uniform float heightA;
    uniform float widthB;
    varying vec2 uv;

    void main() {
      float sum = 0.0;
      for (float i = 0.0; i < widthA; i++) {
        float a = texture2D(matrixA, vec2(i / widthA, uv.y)).r;
        float b = texture2D(matrixB, vec2(uv.x, i / widthB)).r;
        sum += a * b;
      }
      gl_FragColor = vec4(sum, 0.0, 0.0, 1.0);
    }
  `;

  const program = createProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const textureA = createTexture(gl, matrixA, widthA, heightA);
  const textureB = createTexture(gl, matrixB, widthB, heightA);

  const matrixALocation = gl.getUniformLocation(program, 'matrixA');
  const matrixBLocation = gl.getUniformLocation(program, 'matrixB');
  const widthALocation = gl.getUniformLocation(program, 'widthA');
  const heightALocation = gl.getUniformLocation(program, 'heightA');
  const widthBLocation = gl.getUniformLocation(program, 'widthB');

  gl.uniform1i(matrixALocation, 0);
  gl.uniform1i(matrixBLocation, 1);
  gl.uniform1f(widthALocation, widthA);
  gl.uniform1f(heightALocation, heightA);
  gl.uniform1f(widthBLocation, widthB);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textureA);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textureB);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  const output = new Float32Array(widthA * widthB);
  gl.readPixels(0, 0, widthA, widthB, gl.RED, gl.FLOAT, output);

  return output;
}

export const version = '1.0.0';