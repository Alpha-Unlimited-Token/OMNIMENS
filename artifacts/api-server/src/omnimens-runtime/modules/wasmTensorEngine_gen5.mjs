/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmTensorEngine
 * Written: 2026-04-03T06:06:36.051Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmTensorEngine.mjs

import { readFile } from 'fs/promises';
import { join } from 'path';

let wasmInstance;

/**
 * Initializes the WebAssembly module.
 * This function must be called before using any other exported functions.
 */
export async function initializeWasm() {
  const wasmPath = join(process.cwd(), 'wasmTensorEngine.wasm');
  const wasmModule = await WebAssembly.compile(await readFile(wasmPath));
  wasmInstance = await WebAssembly.instantiate(wasmModule, {});
}

/**
 * Multiplies two matrices using WebAssembly (SIMD-accelerated).
 * @param {number[][]} matrixA - First matrix (2D array).
 * @param {number[][]} matrixB - Second matrix (2D array).
 * @returns {number[][]} Resulting matrix after multiplication.
 */
export function multiplyMatrices(matrixA, matrixB) {
  if (!wasmInstance) {
    throw new Error('WebAssembly module not initialized. Call initializeWasm() first.');
  }

  const { matrixMultiply } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float32Array(rowsA * colsB);

  matrixMultiply(flatA, flatB, result, rowsA, colsA, colsB);

  // Convert flat result back to 2D array
  const output = [];
  for (let i = 0; i < rowsA; i++) {
    output.push(Array.from(result.slice(i * colsB, (i + 1) * colsB)));
  }
  return output;
}

/**
 * Adds two vectors element-wise using WebAssembly (SIMD-accelerated).
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number[]} Resulting vector after addition.
 */
export function addVectors(vectorA, vectorB) {
  if (!wasmInstance) {
    throw new Error('WebAssembly module not initialized. Call initializeWasm() first.');
  }

  const { vectorAdd } = wasmInstance.exports;

  if (vectorA.length !== vectorB.length) {
    throw new Error('Vector lengths do not match for addition.');
  }

  const result = new Float32Array(vectorA.length);
  vectorAdd(vectorA, vectorB, result, vectorA.length);
  return Array.from(result);
}

/**
 * Computes the dot product of two vectors using WebAssembly (SIMD-accelerated).
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} Dot product result.
 */
export function dotProduct(vectorA, vectorB) {
  if (!wasmInstance) {
    throw new Error('WebAssembly module not initialized. Call initializeWasm() first.');
  }

  const { vectorDot } = wasmInstance.exports;

  if (vectorA.length !== vectorB.length) {
    throw new Error('Vector lengths do not match for dot product.');
  }

  return vectorDot(vectorA, vectorB, vectorA.length);
}

/**
 * Utility function to validate a 2D matrix.
 * @param {number[][]} matrix - Matrix to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
export function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) return false;
  const rowLength = matrix[0].length;
  return matrix.every(row => Array.isArray(row) && row.length === rowLength);
}

/**
 * Utility function to validate a vector.
 * @param {number[]} vector - Vector to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
export function isValidVector(vector) {
  return Array.isArray(vector) && vector.every(Number.isFinite);
}
