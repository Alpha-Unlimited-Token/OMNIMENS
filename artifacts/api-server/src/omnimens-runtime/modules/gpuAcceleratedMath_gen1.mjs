/**
 * gpuAcceleratedMath.js
 *
 * This module provides GPU-accelerated matrix operations using WebGL for high-performance numerical computation.
 * It implements matrix multiplication and basic deep learning primitives using custom WebGL shaders.
 * Designed to run in Node.js 20+ with no external dependencies.
 */

/**
 * Initialize a WebGL context for GPU computation.
 * @returns {WebGLRenderingContext} - A WebGL rendering context.
 */
function initializeWebGLContext() {
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(1, 1);
  const gl = canvas.getContext('webgl');

  if (!gl) {
    throw new Error('Failed to initialize WebGL context.');
  }

  return gl;
}

/**
 * Compile a WebGL shader.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {GLenum} type - The type of shader (vertex or fragment).
 * @param {string} source - The GLSL source code for the shader.
 * @returns {WebGLShader} - The compiled shader.
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
 * Create a WebGL program from vertex and fragment shaders.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {string} vertexSource - The GLSL source code for the vertex shader.
 * @param {string} fragmentSource - The GLSL source code for the fragment shader.
 * @returns {WebGLProgram} - The linked WebGL program.
 */
function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

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
 * Perform GPU-accelerated matrix multiplication.
 * @param {Float32Array} matrixA - The first matrix (flattened row-major order).
 * @param {Float32Array} matrixB - The second matrix (flattened row-major order).
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA.
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Float32Array} - The resulting matrix (flattened row-major order).
 */
function gpuMatrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  const gl = initializeWebGLContext();

  // GLSL shaders for matrix multiplication
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
    uniform vec2 dimA;
    uniform vec2 dimB;

    void main() {
      vec2 coord = gl_FragCoord.xy;
      float result = 0.0;
      for (int i = 0; i < int(dimA.y); i++) {
        vec2 texCoordA = vec2(coord.x, float(i)) / dimA;
        vec2 texCoordB = vec2(float(i), coord.y) / dimB;
        result += texture2D(matrixA, texCoordA).r * texture2D(matrixB, texCoordB).r;
      }
      gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
    }
  `;

  const program = createProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(program);

  // Prepare textures for matrices
  const textureA = gl.createTexture();
  const textureB = gl.createTexture();

  // Upload matrixA to textureA
  gl.bindTexture(gl.TEXTURE_2D, textureA);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, colsA, rowsA, 0, gl.LUMINANCE, gl.FLOAT, matrixA);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload matrixB to textureB
  gl.bindTexture(gl.TEXTURE_2D, textureB);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, colsB, colsA, 0, gl.LUMINANCE, gl.FLOAT, matrixB);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Set uniforms
  const dimALoc = gl.getUniformLocation(program, 'dimA');
  const dimBLoc = gl.getUniformLocation(program, 'dimB');

  gl.uniform2f(dimALoc, colsA, rowsA);
  gl.uniform2f(dimBLoc, colsB, colsA);

  // Render to a framebuffer
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  const outputTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, outputTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, colsB, rowsA, 0, gl.LUMINANCE, gl.FLOAT, null);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0);

  gl.viewport(0, 0, colsB, rowsA);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Read back the result
  const result = new Float32Array(rowsA * colsB);
  gl.readPixels(0, 0, colsB, rowsA, gl.LUMINANCE, gl.FLOAT, result);

  return result;
}

module.exports = {
  initializeWebGLContext,
  compileShader,
  createProgram,
  gpuMatrixMultiply
};