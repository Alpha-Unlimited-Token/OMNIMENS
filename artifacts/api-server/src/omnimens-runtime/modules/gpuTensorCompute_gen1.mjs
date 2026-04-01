/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_40
 * Name: gpuTensorCompute
 * Purpose: Offloads high-dimensional tensor operations to WebGL for faster matrix computations.
 * Description: Offloads high-dimensional tensor operations like matrix multiplication to WebGL for faster computations.
 * Migrated: 2026-04-01T22:23:20.243Z
 */

// gpuTensorCompute.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique identifier for WebGL shader programs.
 * @param {string} sourceCode - The GLSL source code of the shader.
 * @returns {string} - A hash-based unique identifier.
 */
export function generateShaderId(sourceCode) {
  const hash = createHash('sha256');
  hash.update(sourceCode);
  return hash.digest('hex');
}

/**
 * Creates and compiles a WebGL shader.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {string} sourceCode - GLSL source code for the shader.
 * @param {string} type - Type of shader ('vertex' or 'fragment').
 * @returns {WebGLShader} - Compiled WebGL shader.
 */
export function createShader(gl, sourceCode, type) {
  const shaderType = type === 'vertex' ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER;
  const shader = gl.createShader(shaderType);
  gl.shaderSource(shader, sourceCode);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed: ${error}`);
  }

  return shader;
}

/**
 * Creates a WebGL program from vertex and fragment shaders.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {string} vertexSource - GLSL source code for the vertex shader.
 * @param {string} fragmentSource - GLSL source code for the fragment shader.
 * @returns {WebGLProgram} - Linked WebGL program.
 */
export function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = createShader(gl, vertexSource, 'vertex');
  const fragmentShader = createShader(gl, fragmentSource, 'fragment');

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
 * Performs matrix multiplication using WebGL.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {Float32Array} matrixA - First matrix (flattened).
 * @param {Float32Array} matrixB - Second matrix (flattened).
 * @param {number} size - Size of the square matrices.
 * @returns {Float32Array} - Resultant matrix (flattened).
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
    uniform int size;

    void main() {
      vec2 coord = gl_FragCoord.xy / float(size);
      float result = 0.0;
      for (int i = 0; i < size; i++) {
        vec2 aCoord = vec2(coord.x, float(i) / float(size));
        vec2 bCoord = vec2(float(i) / float(size), coord.y);
        result += texture2D(matrixA, aCoord).r * texture2D(matrixB, bCoord).r;
      }
      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const program = createProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(program);

  const textureA = createTexture(gl, matrixA, size);
  const textureB = createTexture(gl, matrixB, size);

  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  const outputTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, outputTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.FLOAT, null);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  const result = new Float32Array(size * size);
  gl.readPixels(0, 0, size, size, gl.RED, gl.FLOAT, result);

  return result;
}

/**
 * Creates a WebGL texture from a matrix.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @param {Float32Array} matrix - Matrix data (flattened).
 * @param {number} size - Size of the square matrix.
 * @returns {WebGLTexture} - Created texture.
 */
function createTexture(gl, matrix, size) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.FLOAT, matrix);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return texture;
}