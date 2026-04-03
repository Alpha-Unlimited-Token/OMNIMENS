/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-03T19:12:21.437Z
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

import { createHash } from 'crypto';

/**
 * Generates a unique hash for TypedArray data to ensure matrix integrity.
 * @param {TypedArray} typedArray - The input TypedArray (e.g., Float32Array).
 * @returns {string} - A SHA-256 hash of the array data.
 */
export function hashTypedArray(typedArray) {
    if (!(typedArray instanceof TypedArray)) {
        throw new TypeError('Input must be a TypedArray.');
    }
    const hash = createHash('sha256');
    hash.update(new Uint8Array(typedArray.buffer));
    return hash.digest('hex');
}

/**
 * Performs matrix multiplication using TypedArrays.
 * @param {Float32Array} matrixA - The first matrix (m x n).
 * @param {Float32Array} matrixB - The second matrix (n x p).
 * @param {number} m - Rows in matrixA.
 * @param {number} n - Columns in matrixA and rows in matrixB.
 * @param {number} p - Columns in matrixB.
 * @returns {Float32Array} - The resulting matrix (m x p).
 */
export function matrixMultiply(matrixA, matrixB, m, n, p) {
    if (matrixA.length !== m * n || matrixB.length !== n * p) {
        throw new Error('Matrix dimensions do not match the provided sizes.');
    }

    const result = new Float32Array(m * p);

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < p; j++) {
            let sum = 0;
            for (let k = 0; k < n; k++) {
                sum += matrixA[i * n + k] * matrixB[k * p + j];
            }
            result[i * p + j] = sum;
        }
    }

    return result;
}

/**
 * Transposes a matrix represented as a TypedArray.
 * @param {Float32Array} matrix - The input matrix (m x n).
 * @param {number} m - Rows in the matrix.
 * @param {number} n - Columns in the matrix.
 * @returns {Float32Array} - The transposed matrix (n x m).
 */
export function transposeMatrix(matrix, m, n) {
    if (matrix.length !== m * n) {
        throw new Error('Matrix dimensions do not match the provided sizes.');
    }

    const transposed = new Float32Array(n * m);

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            transposed[j * m + i] = matrix[i * n + j];
        }
    }

    return transposed;
}

/**
 * Initializes a matrix with random values for testing purposes.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @returns {Float32Array} - A matrix filled with random values.
 */
export function randomMatrix(rows, cols) {
    const matrix = new Float32Array(rows * cols);
    for (let i = 0; i < matrix.length; i++) {
        matrix[i] = Math.random();
    }
    return matrix;
}

/**
 * Validates if two matrices can be multiplied.
 * @param {number} mA - Rows in the first matrix.
 * @param {number} nA - Columns in the first matrix.
 * @param {number} mB - Rows in the second matrix.
 * @param {number} nB - Columns in the second matrix.
 * @returns {boolean} - True if multiplication is valid, false otherwise.
 */
export function validateMatrixMultiplication(mA, nA, mB, nB) {
    return nA === mB;
}

const TypedArray = Object.getPrototypeOf(Float32Array);