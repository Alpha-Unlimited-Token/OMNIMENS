/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: strassenMatrixEngine
 * Written: 2026-04-02T14:55:17.296Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// strassenMatrixEngine.mjs

// Utility function to add two matrices
export function addMatrices(A, B) {
    const n = A.length;
    const result = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            result[i][j] = A[i][j] + B[i][j];
        }
    }
    return result;
}

// Utility function to subtract two matrices
export function subtractMatrices(A, B) {
    const n = A.length;
    const result = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            result[i][j] = A[i][j] - B[i][j];
        }
    }
    return result;
}

// Utility function to split a matrix into quadrants
function splitMatrix(matrix) {
    const n = matrix.length;
    const mid = Math.floor(n / 2);
    const A11 = matrix.slice(0, mid).map(row => row.slice(0, mid));
    const A12 = matrix.slice(0, mid).map(row => row.slice(mid));
    const A21 = matrix.slice(mid).map(row => row.slice(0, mid));
    const A22 = matrix.slice(mid).map(row => row.slice(mid));
    return [A11, A12, A21, A22];
}

// Utility function to combine quadrants into a single matrix
function combineMatrices(A11, A12, A21, A22) {
    const n = A11.length;
    const result = Array.from({ length: n * 2 }, () => Array(n * 2).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            result[i][j] = A11[i][j];
            result[i][j + n] = A12[i][j];
            result[i + n][j] = A21[i][j];
            result[i + n][j + n] = A22[i][j];
        }
    }
    return result;
}

// Strassen's algorithm for matrix multiplication
export function strassenMultiply(A, B, threshold = 64) {
    const n = A.length;

    // Fallback to standard multiplication for small matrices
    if (n <= threshold) {
        const result = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                for (let k = 0; k < n; k++) {
                    result[i][j] += A[i][k] * B[k][j];
                }
            }
        }
        return result;
    }

    // Split matrices into quadrants
    const [A11, A12, A21, A22] = splitMatrix(A);
    const [B11, B12, B21, B22] = splitMatrix(B);

    // Compute the 7 products using Strassen's method
    const M1 = strassenMultiply(addMatrices(A11, A22), addMatrices(B11, B22), threshold);
    const M2 = strassenMultiply(addMatrices(A21, A22), B11, threshold);
    const M3 = strassenMultiply(A11, subtractMatrices(B12, B22), threshold);
    const M4 = strassenMultiply(A22, subtractMatrices(B21, B11), threshold);
    const M5 = strassenMultiply(addMatrices(A11, A12), B22, threshold);
    const M6 = strassenMultiply(subtractMatrices(A21, A11), addMatrices(B11, B12), threshold);
    const M7 = strassenMultiply(subtractMatrices(A12, A22), addMatrices(B21, B22), threshold);

    // Combine the results into the final matrix
    const C11 = addMatrices(subtractMatrices(addMatrices(M1, M4), M5), M7);
    const C12 = addMatrices(M3, M5);
    const C21 = addMatrices(M2, M4);
    const C22 = addMatrices(subtractMatrices(addMatrices(M1, M3), M2), M6);

    return combineMatrices(C11, C12, C21, C22);
}

// Utility function to check if a matrix is square and has dimensions of power of 2
export function isPowerOfTwoMatrix(matrix) {
    const n = matrix.length;
    if (n === 0 || (n & (n - 1)) !== 0) return false; // Not a power of 2
    return matrix.every(row => row.length === n);
}

// Example sparse matrix optimization (checks for zero rows/columns)
export function isSparseMatrix(matrix, sparsityThreshold = 0.5) {
    const n = matrix.length;
    let zeroCount = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (matrix[i][j] === 0) zeroCount++;
        }
    }
    const totalElements = n * n;
    return (zeroCount / totalElements) >= sparsityThreshold;
}