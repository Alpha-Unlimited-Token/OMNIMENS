/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixOps
 * Written: 2026-04-01T22:08:52.309Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGpuMatrixOps.mjs

import { GPU } from 'gpu.js';

const gpu = new GPU();

/**
 * Multiplies two matrices using GPU acceleration.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resultant matrix after multiplication.
 */
export function gpuMatrixMultiply(matrixA, matrixB) {
    if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
        throw new Error('Both inputs must be 2D arrays.');
    }

    const rowsA = matrixA.length;
    const colsA = matrixA[0].length;
    const rowsB = matrixB.length;
    const colsB = matrixB[0].length;

    if (colsA !== rowsB) {
        throw new Error('Matrix dimensions do not match for multiplication.');
    }

    const kernel = gpu.createKernel(function (matrixA, matrixB) {
        let sum = 0;
        for (let i = 0; i < this.constants.colsA; i++) {
            sum += matrixA[this.thread.y][i] * matrixB[i][this.thread.x];
        }
        return sum;
    })
    .setOutput([colsB, rowsA])
    .setConstants({ colsA });

    return kernel(matrixA, matrixB);
}

/**
 * Optimizes a matrix by normalizing its values to a range [0, 1].
 * @param {number[][]} matrix - Input matrix.
 * @returns {number[][]} - Normalized matrix.
 */
export function normalizeMatrix(matrix) {
    if (!Array.isArray(matrix)) {
        throw new Error('Input must be a 2D array.');
    }

    const flatMatrix = matrix.flat();
    const min = Math.min(...flatMatrix);
    const max = Math.max(...flatMatrix);

    if (min === max) {
        throw new Error('Matrix cannot be normalized as all elements are identical.');
    }

    return matrix.map(row => row.map(value => (value - min) / (max - min)));
}

/**
 * Transposes a matrix.
 * @param {number[][]} matrix - Input matrix.
 * @returns {number[][]} - Transposed matrix.
 */
export function transposeMatrix(matrix) {
    if (!Array.isArray(matrix)) {
        throw new Error('Input must be a 2D array.');
    }

    const rows = matrix.length;
    const cols = matrix[0].length;

    const transposed = Array.from({ length: cols }, () => Array(rows).fill(0));

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            transposed[j][i] = matrix[i][j];
        }
    }

    return transposed;
}

/**
 * Checks if a matrix is square.
 * @param {number[][]} matrix - Input matrix.
 * @returns {boolean} - True if the matrix is square, false otherwise.
 */
export function isSquareMatrix(matrix) {
    if (!Array.isArray(matrix)) {
        throw new Error('Input must be a 2D array.');
    }

    const rows = matrix.length;
    const cols = matrix[0].length;

    return rows === cols;
}

/**
 * Generates an identity matrix of given size.
 * @param {number} size - Size of the identity matrix.
 * @returns {number[][]} - Identity matrix.
 */
export function generateIdentityMatrix(size) {
    if (typeof size !== 'number' || size <= 0) {
        throw new Error('Size must be a positive integer.');
    }

    const identity = Array.from({ length: size }, (_, i) => {
        return Array.from({ length: size }, (_, j) => (i === j ? 1 : 0));
    });

    return identity;
}
