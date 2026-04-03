/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmRuntimeBridge
 * Written: 2026-04-03T16:37:30.005Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmRuntimeBridge.mjs

import { readFile } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';

// Utility function to load and compile a WebAssembly module
export async function loadWasmModule(filePath) {
  const absolutePath = join(process.cwd(), filePath);
  const wasmBuffer = await readFile(absolutePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

// Generic matrix multiplication utility using WebAssembly
export async function wasmMatrixMultiply(wasmInstance, matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both matrixA and matrixB must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Number of columns in matrixA must match number of rows in matrixB.');
  }

  const flattenedA = matrixA.flat();
  const flattenedB = matrixB.flat();
  const result = new Float64Array(rowsA * colsB);

  const memory = wasmInstance.exports.memory;
  const wasmMatrixMultiply = wasmInstance.exports.matrixMultiply;

  const aOffset = 0;
  const bOffset = flattenedA.length * Float64Array.BYTES_PER_ELEMENT;
  const resultOffset = bOffset + flattenedB.length * Float64Array.BYTES_PER_ELEMENT;

  const totalMemory = resultOffset + result.length * Float64Array.BYTES_PER_ELEMENT;
  if (memory.buffer.byteLength < totalMemory) {
    throw new Error('WASM memory is insufficient for the operation.');
  }

  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(flattenedA, aOffset / Float64Array.BYTES_PER_ELEMENT);
  wasmMemory.set(flattenedB, bOffset / Float64Array.BYTES_PER_ELEMENT);

  wasmMatrixMultiply(
    aOffset,
    bOffset,
    resultOffset,
    rowsA,
    colsA,
    colsB
  );

  return Array.from(result);
}

// Utility for hashing data (useful for caching or deduplication)
export function hashData(data) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex');
}

// Example Hopfield Network update function (to be implemented in WASM)
export async function wasmHopfieldUpdate(wasmInstance, stateVector, weightMatrix) {
  if (!Array.isArray(stateVector) || !Array.isArray(weightMatrix)) {
    throw new Error('Both stateVector and weightMatrix must be arrays.');
  }

  const vectorLength = stateVector.length;
  const matrixRows = weightMatrix.length;
  const matrixCols = weightMatrix[0].length;

  if (vectorLength !== matrixRows || matrixRows !== matrixCols) {
    throw new Error('Weight matrix must be square and match the length of the state vector.');
  }

  const flattenedWeights = weightMatrix.flat();
  const result = new Float64Array(vectorLength);

  const memory = wasmInstance.exports.memory;
  const wasmHopfieldUpdate = wasmInstance.exports.hopfieldUpdate;

  const stateOffset = 0;
  const weightsOffset = stateVector.length * Float64Array.BYTES_PER_ELEMENT;
  const resultOffset = weightsOffset + flattenedWeights.length * Float64Array.BYTES_PER_ELEMENT;

  const totalMemory = resultOffset + result.length * Float64Array.BYTES_PER_ELEMENT;
  if (memory.buffer.byteLength < totalMemory) {
    throw new Error('WASM memory is insufficient for the operation.');
  }

  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(stateVector, stateOffset / Float64Array.BYTES_PER_ELEMENT);
  wasmMemory.set(flattenedWeights, weightsOffset / Float64Array.BYTES_PER_ELEMENT);

  wasmHopfieldUpdate(
    stateOffset,
    weightsOffset,
    resultOffset,
    vectorLength
  );

  return Array.from(result);
}

// Utility to validate 2D matrices
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new Error('Input must be a non-empty 2D array.');
  }

  const rowLength = matrix[0].length;
  for (const row of matrix) {
    if (row.length !== rowLength) {
      throw new Error('All rows in the matrix must have the same length.');
    }
  }

  return true;
}
