/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuMatrixEngine
 * Written: 2026-04-02T14:11:03.184Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuMatrixEngine.mjs

import { performance } from 'perf_hooks';

// Utility to create a Float64Array-backed matrix
export function createMatrix(rows, cols, initialValue = 0) {
    if (rows <= 0 || cols <= 0) {
        throw new Error('Matrix dimensions must be positive integers.');
    }
    const buffer = new Float64Array(rows * cols).fill(initialValue);
    return { rows, cols, buffer };
}

// Utility to get a value from a matrix
export function getMatrixValue(matrix, row, col) {
    if (row < 0 || row >= matrix.rows || col < 0 || col >= matrix.cols) {
        throw new Error('Index out of bounds.');
    }
    return matrix.buffer[row * matrix.cols + col];
}

// Utility to set a value in a matrix
export function setMatrixValue(matrix, row, col, value) {
    if (row < 0 || row >= matrix.rows || col < 0 || col >= matrix.cols) {
        throw new Error('Index out of bounds.');
    }
    matrix.buffer[row * matrix.cols + col] = value;
}

// Matrix multiplication with cache-aware blocking
export function multiplyMatrices(A, B) {
    if (A.cols !== B.rows) {
        throw new Error('Incompatible matrix dimensions for multiplication.');
    }

    const blockSize = 64; // Cache-aware block size
    const C = createMatrix(A.rows, B.cols);

    for (let iBlock = 0; iBlock < A.rows; iBlock += blockSize) {
        for (let jBlock = 0; jBlock < B.cols; jBlock += blockSize) {
            for (let kBlock = 0; kBlock < A.cols; kBlock += blockSize) {
                for (let i = iBlock; i < Math.min(iBlock + blockSize, A.rows); i++) {
                    for (let j = jBlock; j < Math.min(jBlock + blockSize, B.cols); j++) {
                        let sum = getMatrixValue(C, i, j);
                        for (let k = kBlock; k < Math.min(kBlock + blockSize, A.cols); k++) {
                            sum += getMatrixValue(A, i, k) * getMatrixValue(B, k, j);
                        }
                        setMatrixValue(C, i, j, sum);
                    }
                }
            }
        }
    }

    return C;
}

// Benchmarking utility
export function benchmarkMatrixMultiplication(A, B) {
    const start = performance.now();
    const C = multiplyMatrices(A, B);
    const end = performance.now();
    return { result: C, timeMs: end - start };
}

// Example identity matrix generator
export function createIdentityMatrix(size) {
    if (size <= 0) {
        throw new Error('Matrix size must be a positive integer.');
    }
    const matrix = createMatrix(size, size);
    for (let i = 0; i < size; i++) {
        setMatrixValue(matrix, i, i, 1);
    }
    return matrix;
}

// Transpose a matrix
export function transposeMatrix(matrix) {
    const transposed = createMatrix(matrix.cols, matrix.rows);
    for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.cols; j++) {
            setMatrixValue(transposed, j, i, getMatrixValue(matrix, i, j));
        }
    }
    return transposed;
}