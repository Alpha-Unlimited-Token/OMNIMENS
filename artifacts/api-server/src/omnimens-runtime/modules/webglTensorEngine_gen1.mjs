/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_57
 * Name: webglTensorEngine
 * Purpose: Accelerates tensor operations using WebGL for GPU-based parallel computation.
 * Description: Accelerates tensor operations using WebGL for GPU-based parallel computation, including matrix multiplication and hashing for reproducibility.
 * Migrated: 2026-04-02T14:08:14.870Z
 */

// webglTensorEngine.mjs
import { createHash } from 'crypto';

// Utility to create WebGL context
export function createWebGLContext(canvasWidth = 1, canvasHeight = 1) {
  const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
  const gl = canvas.getContext('webgl');
  if (!gl) throw new Error('WebGL not supported');
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

// Create a WebGL program
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

// Initialize a GPU buffer
export function initBuffer(gl, data, usage = gl.STATIC_DRAW) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), usage);
  return buffer;
}

// Perform matrix multiplication using WebGL
export function gpuMatrixMultiply(gl, matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match for multiplication');
  }

  const vertexSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision highp float;
    uniform sampler2D textureA;
    uniform sampler2D textureB;
    uniform int rowsA;
    uniform int colsA;
    uniform int colsB;
    void main() {
      vec2 coord = gl_FragCoord.xy;
      float sum = 0.0;
      for (int i = 0; i < 1024; i++) {
        if (i >= colsA) break;
        vec2 texCoordA = vec2(coord.x / float(colsB), float(i) / float(colsA));
        vec2 texCoordB = vec2(float(i) / float(colsA), coord.y / float(rowsA));
        sum += texture2D(textureA, texCoordA).r * texture2D(textureB, texCoordB).r;
      }
      gl_FragColor = vec4(sum, 0.0, 0.0, 1.0);
    }
  `;

  const program = createProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(program);

  // Setup textures for matrices
  const textureA = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureA);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.LUMINANCE,
    colsA,
    rowsA,
    0,
    gl.LUMINANCE,
    gl.FLOAT,
    new Float32Array(matrixA)
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  const textureB = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureB);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.LUMINANCE,
    colsB,
    colsA,
    0,
    gl.LUMINANCE,
    gl.FLOAT,
    new Float32Array(matrixB)
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Set uniforms
  const uRowsA = gl.getUniformLocation(program, 'rowsA');
  const uColsA = gl.getUniformLocation(program, 'colsA');
  const uColsB = gl.getUniformLocation(program, 'colsB');
  gl.uniform1i(uRowsA, rowsA);
  gl.uniform1i(uColsA, colsA);
  gl.uniform1i(uColsB, colsB);

  // Execute program
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  const outputTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, outputTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    colsB,
    rowsA,
    0,
    gl.RGBA,
    gl.FLOAT,
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

  const result = new Float32Array(rowsA * colsB * 4);
  gl.readPixels(0, 0, colsB, rowsA, gl.RGBA, gl.FLOAT, result);

  return Array.from(result).filter((_, i) => i % 4 === 0); // Extract red channel
}

// Hash utility for reproducibility
export function hashData(data) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex');
}