/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmComputeEngine
 * Written: 2026-03-22T03:15:21.784Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * wasmComputeEngine: A WebAssembly-powered utility for efficient matrix operations and numerical computations.
 * This module integrates WebAssembly with Node.js to perform high-performance linear algebra tasks.
 */

// Import necessary built-in modules
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Asynchronously loads a WebAssembly module from a specified file.
 * @param {string} filePath - The relative path to the WebAssembly binary file.
 * @returns {Promise<WebAssembly.Instance>} - A promise resolving to the WebAssembly instance.
 */
async function loadWasmModule(filePath) {
  const wasmPath = join(import.meta.url.replace('file://', ''), filePath);
  const wasmBuffer = await readFile(wasmPath);
  const wasmModule = await WebAssembly.instantiate(wasmBuffer);
  return wasmModule.instance;
}

/**
 * Multiplies two matrices using WebAssembly for performance.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} - A promise resolving to the resulting matrix.
 * @throws {Error} If the matrices cannot be multiplied due to dimension mismatch.
 */
export async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const wasmInstance = await loadWasmModule('./matrix_multiply.wasm');

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float64Array(rowsA * colsB);

  const memory = new WebAssembly.Memory({ initial: 256 });
  const wasmMemory = new Float64Array(memory.buffer);

  wasmMemory.set(flatA, 0);
  wasmMemory.set(flatB, flatA.length);

  wasmInstance.exports.multiply(
    rowsA,
    colsA,
    colsB,
    0, // Offset for matrix A
    flatA.length, // Offset for matrix B
    flatA.length + flatB.length // Offset for result
  );

  for (let i = 0; i < result.length; i++) {
    result[i] = wasmMemory[flatA.length + flatB.length + i];
  }

  // Reshape result into 2D array
  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

/**
 * Adds two matrices element-wise.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} - The resulting matrix after addition.
 * @throws {Error} If the matrices are not of the same dimensions.
 */
export function addMatrices(matrixA, matrixB) {
  if (
    matrixA.length !== matrixB.length ||
    matrixA[0].length !== matrixB[0].length
  ) {
    throw new Error('Matrix dimensions do not match for addition.');
  }

  return matrixA.map((row, i) => row.map((value, j) => value + matrixB[i][j]));
}

/**
 * Transposes a matrix.
 * @param {number[][]} matrix - The matrix to transpose.
 * @returns {number[][]} - The transposed matrix.
 */
export function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }

  return result;
}

/**
 * Computes the dot product of two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The dot product of the two vectors.
 * @throws {Error} If the vectors are not of the same length.
 */
export function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vector dimensions do not match for dot product.');
  }

  return vectorA.reduce((sum, value, index) => sum + value * vectorB[index], 0);
}
