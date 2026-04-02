/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webAssemblyMatrixEngine
 * Written: 2026-04-02T15:06:09.430Z
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

import { readFileSync } from 'fs';
import { join } from 'path';

// Utility function to compile WebAssembly code
export async function compileWasm(wasmFilePath) {
  const wasmBuffer = readFileSync(wasmFilePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

// Function to initialize the matrix engine
export async function initializeMatrixEngine() {
  const wasmFilePath = join(__dirname, 'matrix_operations.wasm');
  const { instance } = await compileWasm(wasmFilePath);
  return instance.exports;
}

// Function to perform matrix multiplication
export function matrixMultiply(wasmExports, matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Invalid matrix dimensions');
  }

  const resultMatrix = new Float32Array(rowsA * colsB);
  const ptrA = wasmExports.allocate(matrixA.length);
  const ptrB = wasmExports.allocate(matrixB.length);
  const ptrResult = wasmExports.allocate(resultMatrix.length);

  wasmExports.memory.set(matrixA, ptrA);
  wasmExports.memory.set(matrixB, ptrB);

  wasmExports.multiply(ptrA, ptrB, ptrResult, rowsA, colsA, colsB);

  resultMatrix.set(wasmExports.memory.subarray(ptrResult, ptrResult + resultMatrix.length));

  wasmExports.deallocate(ptrA);
  wasmExports.deallocate(ptrB);
  wasmExports.deallocate(ptrResult);

  return resultMatrix;
}

// Function to perform matrix addition
export function matrixAdd(wasmExports, matrixA, matrixB) {
  if (matrixA.length !== matrixB.length) {
    throw new Error('Matrices must have the same dimensions');
  }

  const resultMatrix = new Float32Array(matrixA.length);
  const ptrA = wasmExports.allocate(matrixA.length);
  const ptrB = wasmExports.allocate(matrixB.length);
  const ptrResult = wasmExports.allocate(resultMatrix.length);

  wasmExports.memory.set(matrixA, ptrA);
  wasmExports.memory.set(matrixB, ptrB);

  wasmExports.add(ptrA, ptrB, ptrResult, matrixA.length);

  resultMatrix.set(wasmExports.memory.subarray(ptrResult, ptrResult + resultMatrix.length));

  wasmExports.deallocate(ptrA);
  wasmExports.deallocate(ptrB);
  wasmExports.deallocate(ptrResult);

  return resultMatrix;
}

// Function to transpose a matrix
export function matrixTranspose(wasmExports, matrix, rows, cols) {
  if (matrix.length !== rows * cols) {
    throw new Error('Invalid matrix dimensions');
  }

  const resultMatrix = new Float32Array(rows * cols);
  const ptrMatrix = wasmExports.allocate(matrix.length);
  const ptrResult = wasmExports.allocate(resultMatrix.length);

  wasmExports.memory.set(matrix, ptrMatrix);

  wasmExports.transpose(ptrMatrix, ptrResult, rows, cols);

  resultMatrix.set(wasmExports.memory.subarray(ptrResult, ptrResult + resultMatrix.length));

  wasmExports.deallocate(ptrMatrix);
  wasmExports.deallocate(ptrResult);

  return resultMatrix;
}

// General utility function to free memory
export function freeMemory(wasmExports, ptr) {
  wasmExports.deallocate(ptr);
}