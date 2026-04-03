/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixEngine
 * Written: 2026-04-03T15:45:41.344Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmMatrixEngine.mjs

import { readFile } from 'fs/promises';
import { join } from 'path';

// Utility to load and compile WebAssembly module
export async function loadWasmModule(filePath) {
  const wasmPath = join(process.cwd(), filePath);
  const wasmBuffer = await readFile(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

// Strassen's algorithm for matrix multiplication (JavaScript fallback)
export function strassenMultiply(A, B) {
  const n = A.length;
  if (n === 1) {
    return [[A[0][0] * B[0][0]]];
  }

  const half = Math.floor(n / 2);

  // Divide matrices into quadrants
  const [A11, A12, A21, A22] = splitMatrix(A, half);
  const [B11, B12, B21, B22] = splitMatrix(B, half);

  // Compute the 7 products using Strassen's formulas
  const M1 = strassenMultiply(addMatrices(A11, A22), addMatrices(B11, B22));
  const M2 = strassenMultiply(addMatrices(A21, A22), B11);
  const M3 = strassenMultiply(A11, subtractMatrices(B12, B22));
  const M4 = strassenMultiply(A22, subtractMatrices(B21, B11));
  const M5 = strassenMultiply(addMatrices(A11, A12), B22);
  const M6 = strassenMultiply(subtractMatrices(A21, A11), addMatrices(B11, B12));
  const M7 = strassenMultiply(subtractMatrices(A12, A22), addMatrices(B21, B22));

  // Combine results into the result matrix
  const C11 = addMatrices(subtractMatrices(addMatrices(M1, M4), M5), M7);
  const C12 = addMatrices(M3, M5);
  const C21 = addMatrices(M2, M4);
  const C22 = addMatrices(subtractMatrices(addMatrices(M1, M3), M2), M6);

  return combineQuadrants(C11, C12, C21, C22);
}

// Splits a matrix into four quadrants
export function splitMatrix(matrix, size) {
  const A11 = matrix.slice(0, size).map(row => row.slice(0, size));
  const A12 = matrix.slice(0, size).map(row => row.slice(size));
  const A21 = matrix.slice(size).map(row => row.slice(0, size));
  const A22 = matrix.slice(size).map(row => row.slice(size));
  return [A11, A12, A21, A22];
}

// Combines four quadrants into a single matrix
export function combineQuadrants(C11, C12, C21, C22) {
  const top = C11.map((row, i) => row.concat(C12[i]));
  const bottom = C21.map((row, i) => row.concat(C22[i]));
  return top.concat(bottom);
}

// Adds two matrices
export function addMatrices(A, B) {
  return A.map((row, i) => row.map((val, j) => val + B[i][j]));
}

// Subtracts matrix B from matrix A
export function subtractMatrices(A, B) {
  return A.map((row, i) => row.map((val, j) => val - B[i][j]));
}

// WebAssembly-accelerated matrix multiplication wrapper
export async function wasmMultiply(A, B, wasmFilePath) {
  const { instance } = await loadWasmModule(wasmFilePath);
  const { multiply } = instance.exports;

  // Flatten matrices into 1D arrays for WASM
  const size = A.length;
  const flatA = A.flat();
  const flatB = B.flat();
  const flatC = new Float32Array(size * size);

  // Perform multiplication in WASM
  multiply(flatA, flatB, flatC, size);

  // Convert result back into 2D matrix
  const C = [];
  for (let i = 0; i < size; i++) {
    C.push(flatC.slice(i * size, (i + 1) * size));
  }
  return C;
}

// Example utility to check if a matrix is square
export function isSquareMatrix(matrix) {
  return matrix.length > 0 && matrix.every(row => row.length === matrix.length);
}

// Example utility to generate an identity matrix
export function identityMatrix(size) {
  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
  );
}