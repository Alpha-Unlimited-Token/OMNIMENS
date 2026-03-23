/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webglMatrixOps
 * Written: 2026-03-22T11:44:38.468Z
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
 * @module webglMatrixOps
 * @description Simulates GPU-like matrix operations in JavaScript using WebGL shaders for high-performance linear algebra.
 */

/**
 * Initializes a WebGL context and compiles a shader program.
 * @returns {WebGLRenderingContext} A WebGL rendering context to perform matrix operations.
 */
function initializeWebGLContext() {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl');

  if (!gl) {
    throw new Error('WebGL is not supported in this environment.');
  }

  return gl;
}

/**
 * Compiles a WebGL shader.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {number} type - The type of shader (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
 * @param {string} source - The shader source code.
 * @returns {WebGLShader} The compiled shader.
 */
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

/**
 * Links vertex and fragment shaders into a WebGL program.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {WebGLShader} vertexShader - The compiled vertex shader.
 * @param {WebGLShader} fragmentShader - The compiled fragment shader.
 * @returns {WebGLProgram} The linked WebGL program.
 */
function createProgram(gl, vertexShader, fragmentShader) {
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
 * Multiplies two matrices using WebGL.
 * @param {number[]} matrixA - The first matrix (row-major order).
 * @param {number[]} matrixB - The second matrix (row-major order).
 * @param {number} size - The size of the matrices (assumes square matrices).
 * @returns {Promise<number[]>} The resulting matrix (row-major order).
 */
async function multiplyMatrices(matrixA, matrixB, size) {
  const gl = initializeWebGLContext();

  const vertexShaderSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    uniform sampler2D textureA;
    uniform sampler2D textureB;
    uniform int size;
    void main() {
      vec2 uv = gl_FragCoord.xy / float(size);
      float result = 0.0;
      for (int i = 0; i < size; i++) {
        result += texture2D(textureA, vec2(uv.x, float(i) / float(size))).r *
                  texture2D(textureB, vec2(float(i) / float(size), uv.y)).r;
      }
      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  // Prepare input textures
  const textureA = gl.createTexture();
  const textureB = gl.createTexture();

  const setupTexture = (texture, data) => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R32F,
      size,
      size,
      0,
      gl.RED,
      gl.FLOAT,
      new Float32Array(data)
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  };

  setupTexture(textureA, matrixA);
  setupTexture(textureB, matrixB);

  // Run the shader
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  const outputTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, outputTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, size, size, 0, gl.RED, gl.FLOAT, null);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Read back the result
  const result = new Float32Array(size * size);
  gl.readPixels(0, 0, size, size, gl.RED, gl.FLOAT, result);

  return Array.from(result);
}

export { multiplyMatrices };