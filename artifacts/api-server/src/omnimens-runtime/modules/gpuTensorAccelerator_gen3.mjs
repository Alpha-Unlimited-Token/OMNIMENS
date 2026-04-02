/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuTensorAccelerator
 * Written: 2026-04-02T17:01:54.021Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuTensorAccelerator.mjs

// Utility function to initialize WebGL context
export function initializeWebGLContext(canvasWidth = 1, canvasHeight = 1) {
    const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const gl = canvas.getContext('webgl');
    if (!gl) {
        throw new Error('WebGL not supported');
    }
    return gl;
}

// Utility function to create and compile a WebGL shader
export function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Shader compilation error: ${error}`);
    }
    return shader;
}

// Utility function to create a WebGL program
export function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(`Program linking error: ${error}`);
    }

    return program;
}

// GPU-accelerated matrix multiplication using WebGL
export function gpuMatrixMultiply(gl, matrixA, matrixB, rowsA, colsA, colsB) {
    if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
        throw new Error('Matrix dimensions do not match');
    }

    const vertexShaderSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision highp float;
        uniform sampler2D matrixA;
        uniform sampler2D matrixB;
        uniform int rowsA;
        uniform int colsA;
        uniform int colsB;

        void main() {
            vec2 coords = gl_FragCoord.xy;
            int row = int(coords.y);
            int col = int(coords.x);
            float result = 0.0;

            for (int i = 0; i < colsA; i++) {
                float a = texture2D(matrixA, vec2(float(i) / float(colsA), float(row) / float(rowsA))).r;
                float b = texture2D(matrixB, vec2(float(col) / float(colsB), float(i) / float(colsA))).r;
                result += a * b;
            }

            gl_FragColor = vec4(result, 0.0, 0.0, 1.0);
        }
    `;

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    // Upload matrices as textures
    const textureA = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureA);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, colsA, rowsA, 0, gl.LUMINANCE, gl.FLOAT, new Float32Array(matrixA));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const textureB = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureB);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, colsB, colsA, 0, gl.LUMINANCE, gl.FLOAT, new Float32Array(matrixB));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Set uniforms
    const rowsALocation = gl.getUniformLocation(program, 'rowsA');
    const colsALocation = gl.getUniformLocation(program, 'colsA');
    const colsBLocation = gl.getUniformLocation(program, 'colsB');

    gl.uniform1i(rowsALocation, rowsA);
    gl.uniform1i(colsALocation, colsA);
    gl.uniform1i(colsBLocation, colsB);

    // Render to framebuffer
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    const resultTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, resultTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, colsB, rowsA, 0, gl.LUMINANCE, gl.FLOAT, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, resultTexture, 0);

    gl.viewport(0, 0, colsB, rowsA);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    const resultBuffer = new Float32Array(rowsA * colsB);
    gl.readPixels(0, 0, colsB, rowsA, gl.LUMINANCE, gl.FLOAT, resultBuffer);

    return Array.from(resultBuffer);
}

// Activation function (ReLU) applied on GPU
export function gpuReLU(gl, inputMatrix, rows, cols) {
    if (inputMatrix.length !== rows * cols) {
        throw new Error('Matrix dimensions do not match');
    }

    const vertexShaderSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision highp float;
        uniform sampler2D inputMatrix;
        uniform int rows;
        uniform int cols;

        void main() {
            vec2 coords = gl_FragCoord.xy;
            int row = int(coords.y);
            int col = int(coords.x);
            float value = texture2D(inputMatrix, vec2(float(col) / float(cols), float(row) / float(rows))).r;
            gl_FragColor = vec4(max(value, 0.0), 0.0, 0.0, 1.0);
        }
    `;

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, cols, rows, 0, gl.LUMINANCE, gl.FLOAT, new Float32Array(inputMatrix));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const rowsLocation = gl.getUniformLocation(program, 'rows');
    const colsLocation = gl.getUniformLocation(program, 'cols');

    gl.uniform1i(rowsLocation, rows);
    gl.uniform1i(colsLocation, cols);

    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    const resultTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, resultTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, cols, rows, 0, gl.LUMINANCE, gl.FLOAT, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, resultTexture, 0);

    gl.viewport(0, 0, cols, rows);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    const resultBuffer = new Float32Array(rows * cols);
    gl.readPixels(0, 0, cols, rows, gl.LUMINANCE, gl.FLOAT, resultBuffer);

    return Array.from(resultBuffer);
}
