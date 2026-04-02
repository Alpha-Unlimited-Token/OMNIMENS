/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webAssemblyMatrixEngine
 * Written: 2026-04-02T15:05:51.599Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webAssemblyMatrixEngine.mjs

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { TextDecoder } from 'node:util';

const decoder = new TextDecoder('utf-8');

// Load WebAssembly binary and compile it
async function loadWasmModule(filePath) {
  const wasmBuffer = await readFile(filePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const wasmInstance = await WebAssembly.instantiate(wasmModule);
  return wasmInstance;
}

// Initialize the WebAssembly module
export async function initializeMatrixEngine() {
  const wasmPath = join(__dirname, 'matrix_operations.wasm');
  const wasmInstance = await loadWasmModule(wasmPath);

  const { memory, addMatrices, multiplyMatrices } = wasmInstance.exports;

  return {
    addMatrices: (matrixA, matrixB, rows, cols) => {
      const result = new Float32Array(rows * cols);
      const buffer = new Float32Array(memory.buffer);

      const offsetA = 0;
      const offsetB = rows * cols;
      const offsetResult = 2 * rows * cols;

      buffer.set(matrixA, offsetA);
      buffer.set(matrixB, offsetB);

      addMatrices(offsetA, offsetB, offsetResult, rows, cols);

      result.set(buffer.subarray(offsetResult, offsetResult + rows * cols));
      return result;
    },

    multiplyMatrices: (matrixA, matrixB, rowsA, colsA, colsB) => {
      const result = new Float32Array(rowsA * colsB);
      const buffer = new Float32Array(memory.buffer);

      const offsetA = 0;
      const offsetB = rowsA * colsA;
      const offsetResult = rowsA * colsA + rowsA * colsB;

      buffer.set(matrixA, offsetA);
      buffer.set(matrixB, offsetB);

      multiplyMatrices(offsetA, offsetB, offsetResult, rowsA, colsA, colsB);

      result.set(buffer.subarray(offsetResult, offsetResult + rowsA * colsB));
      return result;
    }
  };
}

export const matrixUtils = {
  transpose: (matrix, rows, cols) => {
    const result = new Float32Array(rows * cols);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        result[col * rows + row] = matrix[row * cols + col];
      }
    }
    return result;
  },

  identityMatrix: (size) => {
    const matrix = new Float32Array(size * size);
    for (let i = 0; i < size; i++) {
      matrix[i * size + i] = 1;
    }
    return matrix;
  }
};

export async function testMatrixEngine() {
  const engine = await initializeMatrixEngine();

  const matrixA = new Float32Array([1, 2, 3, 4]);
  const matrixB = new Float32Array([5, 6, 7, 8]);

  const added = engine.addMatrices(matrixA, matrixB, 2, 2);
  const multiplied = engine.multiplyMatrices(matrixA, matrixB, 2, 2, 2);

  return { added, multiplied };
}