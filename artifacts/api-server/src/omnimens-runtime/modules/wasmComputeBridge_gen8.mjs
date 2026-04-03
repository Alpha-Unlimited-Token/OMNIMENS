/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmComputeBridge
 * Written: 2026-04-03T08:04:06.886Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmComputeBridge.mjs

import { readFile } from 'fs/promises';
import { resolve } from 'path';

// Utility function to load and compile a WebAssembly module dynamically
export async function loadWasmModule(filePath) {
  const absolutePath = resolve(filePath);
  const wasmBuffer = await readFile(absolutePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

// Generic matrix multiplication function using WebAssembly
export async function wasmMatrixMultiply(wasmInstance, matrixA, matrixB) {
  const { memory, multiply_matrices } = wasmInstance.exports;

  if (!multiply_matrices || typeof multiply_matrices !== 'function') {
    throw new Error('WASM module does not export a valid multiply_matrices function.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not allow multiplication.');
  }

  const result = new Array(rowsA).fill(0).map(() => new Array(colsB).fill(0));

  const inputA = new Float64Array(rowsA * colsA);
  const inputB = new Float64Array(rowsB * colsB);
  const outputC = new Float64Array(rowsA * colsB);

  // Flatten input matrices
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsA; j++) {
      inputA[i * colsA + j] = matrixA[i][j];
    }
  }

  for (let i = 0; i < rowsB; i++) {
    for (let j = 0; j < colsB; j++) {
      inputB[i * colsB + j] = matrixB[i][j];
    }
  }

  // Allocate memory in the WASM module
  const inputAPtr = wasmInstance.exports.malloc(inputA.length * inputA.BYTES_PER_ELEMENT);
  const inputBPtr = wasmInstance.exports.malloc(inputB.length * inputB.BYTES_PER_ELEMENT);
  const outputCPtr = wasmInstance.exports.malloc(outputC.length * outputC.BYTES_PER_ELEMENT);

  const wasmMemory = new Float64Array(memory.buffer);

  // Copy data into WASM memory
  wasmMemory.set(inputA, inputAPtr / inputA.BYTES_PER_ELEMENT);
  wasmMemory.set(inputB, inputBPtr / inputB.BYTES_PER_ELEMENT);

  // Perform the matrix multiplication
  multiply_matrices(inputAPtr, rowsA, colsA, inputBPtr, rowsB, colsB, outputCPtr);

  // Copy result back from WASM memory
  outputC.set(wasmMemory.subarray(outputCPtr / outputC.BYTES_PER_ELEMENT, outputCPtr / outputC.BYTES_PER_ELEMENT + outputC.length));

  // Free WASM memory
  wasmInstance.exports.free(inputAPtr);
  wasmInstance.exports.free(inputBPtr);
  wasmInstance.exports.free(outputCPtr);

  // Reshape the output into a 2D matrix
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      result[i][j] = outputC[i * colsB + j];
    }
  }

  return result;
}

// Example utility to check WASM compatibility
export function isWasmSupported() {
  return typeof WebAssembly !== 'undefined' && WebAssembly.validate;
}