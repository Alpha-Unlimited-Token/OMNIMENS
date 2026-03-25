/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webAssemblyMatrixEngine
 * Written: 2026-03-25T00:07:00.909Z
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

import { WASI } from 'wasi';
import { readFile } from 'fs/promises';
import path from 'path';

const wasi = new WASI();
let wasmInstance;

async function initializeWasm() {
  const wasmPath = path.resolve('./matrix_engine.wasm');
  const wasmBuffer = await readFile(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const instance = await WebAssembly.instantiate(wasmModule, {
    wasi_snapshot_preview1: wasi.wasiImport
  });
  wasi.initialize(instance);
  wasmInstance = instance.exports;
}

export async function multiplyMatrices(matrixA, matrixB) {
  if (!wasmInstance) await initializeWasm();

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not match for multiplication');
  }

  const flatA = matrixA.flat();
  const flatB = matrixB.flat();
  const result = new Float64Array(rowsA * colsB);

  wasmInstance.multiply(flatA, flatB, result, rowsA, colsA, colsB);

  const output = [];
  for (let i = 0; i < rowsA; i++) {
    output.push(Array.from(result.slice(i * colsB, (i + 1) * colsB)));
  }

  return output;
}

export async function computeEigenvalues(matrix) {
  if (!wasmInstance) await initializeWasm();

  const rows = matrix.length;
  const cols = matrix[0].length;

  if (rows !== cols) {
    throw new Error('Matrix must be square to compute eigenvalues');
  }

  const flatMatrix = matrix.flat();
  const eigenvalues = new Float64Array(rows);

  wasmInstance.eigenvalues(flatMatrix, eigenvalues, rows);

  return Array.from(eigenvalues);
}

export async function performLUDecomposition(matrix) {
  if (!wasmInstance) await initializeWasm();

  const rows = matrix.length;
  const cols = matrix[0].length;

  if (rows !== cols) {
    throw new Error('Matrix must be square for LU decomposition');
  }

  const flatMatrix = matrix.flat();
  const lower = new Float64Array(rows * cols);
  const upper = new Float64Array(rows * cols);

  wasmInstance.luDecomposition(flatMatrix, lower, upper, rows);

  const lowerMatrix = [];
  const upperMatrix = [];

  for (let i = 0; i < rows; i++) {
    lowerMatrix.push(Array.from(lower.slice(i * cols, (i + 1) * cols)));
    upperMatrix.push(Array.from(upper.slice(i * cols, (i + 1) * cols)));
  }

  return { lower: lowerMatrix, upper: upperMatrix };
}

export async function initialize() {
  await initializeWasm();
}