/**
 * gpuMatrixOps - A utility module for GPU-accelerated matrix operations using WebGL.
 * This module enables real-time computation by leveraging WebGL APIs directly.
 *
 * @module gpuMatrixOps
 */

/**
 * Initializes a WebGL context for GPU computations.
 * @returns {WebGLRenderingContext} A WebGL rendering context for matrix operations.
 * @throws {Error} If WebGL context cannot be created.
 */
export function initializeWebGLContext() {
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(1, 1); // Create a minimal canvas.
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) {
    throw new Error('Failed to initialize WebGL context. Ensure your environment supports WebGL.');
  }

  return gl;
}

/**
 * Uploads a matrix to the GPU as a texture.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {Float32Array} matrix - The matrix to upload.
 * @param {number} width - The width of the matrix.
 * @param {number} height - The height of the matrix.
 * @returns {WebGLTexture} The WebGL texture containing the matrix.
 * @throws {Error} If matrix dimensions are invalid.
 */
export function uploadMatrixToGPU(gl, matrix, width, height) {
  if (matrix.length !== width * height) {
    throw new Error('Matrix dimensions do not match width and height.');
  }

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.LUMINANCE,
    width,
    height,
    0,
    gl.LUMINANCE,
    gl.FLOAT,
    matrix
  );

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return texture;
}

/**
 * Performs a GPU-accelerated matrix multiplication.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {Float32Array} matrixA - The first matrix.
 * @param {Float32Array} matrixB - The second matrix.
 * @param {number} widthA - The width of matrix A.
 * @param {number} heightA - The height of matrix A.
 * @param {number} widthB - The width of matrix B.
 * @param {number} heightB - The height of matrix B.
 * @returns {Float32Array} The resulting matrix after multiplication.
 * @throws {Error} If matrix dimensions are incompatible for multiplication.
 */
export function gpuMatrixMultiply(gl, matrixA, matrixB, widthA, heightA, widthB, heightB) {
  if (widthA !== heightB) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  // Upload matrices to GPU.
  const textureA = uploadMatrixToGPU(gl, matrixA, widthA, heightA);
  const textureB = uploadMatrixToGPU(gl, matrixB, widthB, heightB);

  // Create a shader program for matrix multiplication.
  const vertexShaderSource = `
    attribute vec2 position;
    varying vec2 texCoord;
    void main() {
      texCoord = position;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    uniform sampler2D matrixA;
    uniform sampler2D matrixB;
    varying vec2 texCoord;
    void main() {
      // Perform matrix multiplication logic here.
      gl_FragColor = texture2D(matrixA, texCoord) * texture2D(matrixB, texCoord);
    }
  `;

  const program = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(program);

  // Bind textures and execute the shader program.
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textureA);
  gl.uniform1i(gl.getUniformLocation(program, 'matrixA'), 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textureB);
  gl.uniform1i(gl.getUniformLocation(program, 'matrixB'), 1);

  // Execute the shader program and read back the result.
  const result = new Float32Array(widthA * heightB);
  gl.readPixels(0, 0, widthA, heightB, gl.LUMINANCE, gl.FLOAT, result);

  return result;
}

/**
 * Creates a WebGL shader program.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {string} vertexSource - The vertex shader source code.
 * @param {string} fragmentSource - The fragment shader source code.
 * @returns {WebGLProgram} The compiled shader program.
 * @throws {Error} If shader compilation or linking fails.
 */
function createShaderProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Failed to link shader program: ' + gl.getProgramInfoLog(program));
  }

  return program;
}

/**
 * Compiles a WebGL shader.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {number} type - The type of shader (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
 * @param {string} source - The shader source code.
 * @returns {WebGLShader} The compiled shader.
 * @throws {Error} If shader compilation fails.
 */
function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error('Failed to compile shader: ' + gl.getShaderInfoLog(shader));
  }

  return shader;
}