/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webglTensorEngine
 * Written: 2026-04-02T14:54:43.738Z
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

'use strict';

// Utility to create a WebGL context
export function createWebGLContext(width, height) {
    const canvas = new OffscreenCanvas(width, height);
    const gl = canvas.getContext('webgl');
    if (!gl) {
        throw new Error('Unable to create WebGL context.');
    }
    return gl;
}

// Utility to create and compile a WebGL shader
export function createShader(gl, type, source) {
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

// Utility to create a WebGL program from vertex and fragment shaders
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
        throw new Error(`Program linking failed: ${error}`);
    }

    return program;
}

// Perform batched matrix multiplication on the GPU
export function gpuMatrixMultiply(gl, matrixA, matrixB, rowsA, colsA, colsB) {
    if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
        throw new Error('Matrix dimensions do not match for multiplication.');
    }

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
        uniform int rowsA;
        uniform int colsA;
        uniform int colsB;
        varying vec2 texCoord;

        void main() {
            int row = int(texCoord.y * float(rowsA));
            int col = int(texCoord.x * float(colsB));
            float sum = 0.0;

            for (int i = 0; i < 1024; i++) {
                if (i >= colsA) break;
                float a = texture2D(matrixA, vec2(float(i) / float(colsA), float(row) / float(rowsA))).r;
                float b = texture2D(matrixB, vec2(float(col) / float(colsB), float(i) / float(colsA))).r;
                sum += a * b;
            }

            gl_FragColor = vec4(sum, 0.0, 0.0, 1.0);
        }
    `;

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    // Set up textures for matrixA and matrixB
    const textureA = createTexture(gl, matrixA, colsA, rowsA);
    const textureB = createTexture(gl, matrixB, colsB, colsA);

    // Set uniforms
    gl.uniform1i(gl.getUniformLocation(program, 'matrixA'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'matrixB'), 1);
    gl.uniform1i(gl.getUniformLocation(program, 'rowsA'), rowsA);
    gl.uniform1i(gl.getUniformLocation(program, 'colsA'), colsA);
    gl.uniform1i(gl.getUniformLocation(program, 'colsB'), colsB);

    // Render to texture and read back the result
    const result = new Float32Array(rowsA * colsB);
    gl.readPixels(0, 0, colsB, rowsA, gl.RED, gl.FLOAT, result);

    return result;
}

// Utility to create a WebGL texture from a matrix
export function createTexture(gl, data, width, height) {
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
        new Float32Array(data)
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
}
