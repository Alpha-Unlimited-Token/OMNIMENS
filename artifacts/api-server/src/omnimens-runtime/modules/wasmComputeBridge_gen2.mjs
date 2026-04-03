/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmComputeBridge
 * Written: 2026-04-03T19:00:54.424Z
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
import { join } from 'path';

// Load WebAssembly module
async function loadWasmModule(filePath) {
  const wasmBuffer = await readFile(filePath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return await WebAssembly.instantiate(wasmModule);
}

// Matrix multiplication using WebAssembly
export async function wasmMatrixMultiply(matrixA, matrixB, wasmFilePath) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error("Both inputs must be 2D arrays.");
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions do not match for multiplication.");
  }

  const wasmInstance = await loadWasmModule(wasmFilePath);
  const { matrixMultiply } = wasmInstance.exports;

  const flatMatrixA = matrixA.flat();
  const flatMatrixB = matrixB.flat();
  const result = new Float32Array(rowsA * colsB);

  matrixMultiply(
    flatMatrixA,
    flatMatrixB,
    result,
    rowsA,
    colsA,
    colsB
  );

  // Convert flat result back to 2D array
  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(result.slice(i * colsB, (i + 1) * colsB));
  }

  return resultMatrix;
}

// Generic utility for WebAssembly-based vector addition
export async function wasmVectorAdd(vectorA, vectorB, wasmFilePath) {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) {
    throw new Error("Both inputs must be arrays.");
  }

  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same length.");
  }

  const wasmInstance = await loadWasmModule(wasmFilePath);
  const { vectorAdd } = wasmInstance.exports;

  const result = new Float32Array(vectorA.length);
  vectorAdd(new Float32Array(vectorA), new Float32Array(vectorB), result);

  return Array.from(result);
}

// Neural network computation (forward pass for dense layer)
export async function wasmDenseLayer(inputVector, weightsMatrix, biasVector, wasmFilePath) {
  if (!Array.isArray(inputVector) || !Array.isArray(weightsMatrix) || !Array.isArray(biasVector)) {
    throw new Error("Inputs must be arrays.");
  }

  const rowsWeights = weightsMatrix.length;
  const colsWeights = weightsMatrix[0].length;

  if (inputVector.length !== colsWeights || biasVector.length !== rowsWeights) {
    throw new Error("Dimensions do not match for dense layer computation.");
  }

  const wasmInstance = await loadWasmModule(wasmFilePath);
  const { denseLayer } = wasmInstance.exports;

  const flatWeights = weightsMatrix.flat();
  const result = new Float32Array(rowsWeights);

  denseLayer(
    new Float32Array(inputVector),
    flatWeights,
    new Float32Array(biasVector),
    result,
    rowsWeights,
    colsWeights
  );

  return Array.from(result);
}

// Example utility to validate matrices
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new Error("Input must be a non-empty 2D array.");
  }

  const cols = matrix[0].length;
  for (const row of matrix) {
    if (row.length !== cols) {
      throw new Error("All rows in the matrix must have the same number of columns.");
    }
  }

  return true;
}

// Example utility to validate vectors
export function validateVector(vector) {
  if (!Array.isArray(vector) || vector.length === 0) {
    throw new Error("Input must be a non-empty array.");
  }

  return true;
}
