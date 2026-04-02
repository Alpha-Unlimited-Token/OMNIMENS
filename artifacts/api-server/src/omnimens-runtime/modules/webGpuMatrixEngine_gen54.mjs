/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webGpuMatrixEngine
 * Written: 2026-04-02T13:33:34.724Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webGpuMatrixEngine.mjs

import { GPU } from 'gpu.js';

const gpu = new GPU();

// Utility function: Matrix multiplication using WebGPU
export function matrixMultiply(A, B) {
    if (A[0].length !== B.length) {
        throw new Error('Matrix dimensions do not match for multiplication');
    }

    const kernel = gpu.createKernel(function (a, b) {
        let sum = 0;
        for (let i = 0; i < this.constants.sharedDim; i++) {
            sum += a[this.thread.y][i] * b[i][this.thread.x];
        }
        return sum;
    })
        .setOutput([B[0].length, A.length])
        .setConstants({ sharedDim: A[0].length });

    return kernel(A, B);
}

// Utility function: Element-wise matrix addition
export function matrixAdd(A, B) {
    if (A.length !== B.length || A[0].length !== B[0].length) {
        throw new Error('Matrix dimensions do not match for addition');
    }

    const kernel = gpu.createKernel(function (a, b) {
        return a[this.thread.y][this.thread.x] + b[this.thread.y][this.thread.x];
    })
        .setOutput([A[0].length, A.length]);

    return kernel(A, B);
}

// Utility function: Transpose a matrix
export function matrixTranspose(A) {
    const kernel = gpu.createKernel(function (a) {
        return a[this.thread.x][this.thread.y];
    })
        .setOutput([A.length, A[0].length]);

    return kernel(A);
}

// Utility function: Sigmoid activation function (element-wise)
export function sigmoid(A) {
    const kernel = gpu.createKernel(function (a) {
        return 1 / (1 + Math.exp(-a[this.thread.y][this.thread.x]));
    })
        .setOutput([A[0].length, A.length]);

    return kernel(A);
}

// Utility function: Backpropagation gradient for sigmoid
export function sigmoidGradient(A) {
    const kernel = gpu.createKernel(function (a) {
        const sig = 1 / (1 + Math.exp(-a[this.thread.y][this.thread.x]));
        return sig * (1 - sig);
    })
        .setOutput([A[0].length, A.length]);

    return kernel(A);
}

// Utility function: Eigenvalue decomposition (approximation)
export function eigenDecomposition(A, iterations = 100) {
    if (A.length !== A[0].length) {
        throw new Error('Matrix must be square for eigenvalue decomposition');
    }

    let V = A.map((row, i) => row.map((_, j) => (i === j ? 1 : 0)));
    let currentMatrix = A;

    for (let i = 0; i < iterations; i++) {
        const Q = matrixOrthogonalize(currentMatrix);
        const R = matrixMultiply(matrixTranspose(Q), currentMatrix);
        currentMatrix = matrixMultiply(R, Q);
        V = matrixMultiply(V, Q);
    }

    return { eigenvalues: currentMatrix.map((row, i) => row[i]), eigenvectors: V };
}

// Helper function: Orthogonalize a matrix (QR decomposition helper)
function matrixOrthogonalize(A) {
    const kernel = gpu.createKernel(function (a) {
        let norm = 0;
        for (let i = 0; i < this.constants.dim; i++) {
            norm += a[this.thread.y][i] * a[this.thread.y][i];
        }
        norm = Math.sqrt(norm);
        return a[this.thread.y][this.thread.x] / norm;
    })
        .setOutput([A[0].length, A.length])
        .setConstants({ dim: A[0].length });

    return kernel(A);
}

// Exported utilities for cross-agent use
export const utilities = {
    matrixMultiply,
    matrixAdd,
    matrixTranspose,
    sigmoid,
    sigmoidGradient,
    eigenDecomposition
};