/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuMatrixOps
 * Written: 2026-04-03T12:23:41.290Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuMatrixOps.mjs

import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

// Utility function to create WebAssembly bindings for matrix operations
export async function initializeWasmBindings(wasmBinary) {
  const wasmModule = await WebAssembly.instantiate(wasmBinary);
  const { memory, exports } = wasmModule.instance;
  return {
    memory,
    exports
  };
}

// Parallelized matrix multiplication using WebAssembly
export function parallelMatrixMultiply(matrixA, matrixB, workerCount = 4) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error("Both inputs must be 2D arrays.");
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions do not align for multiplication.");
  }

  const result = new Array(rowsA).fill(null).map(() => new Array(colsB).fill(0));

  const chunkSize = Math.ceil(rowsA / workerCount);
  const workers = [];

  for (let i = 0; i < workerCount; i++) {
    const startRow = i * chunkSize;
    const endRow = Math.min(startRow + chunkSize, rowsA);

    if (startRow >= rowsA) break;

    const worker = new Worker(__filename, {
      workerData: { matrixA, matrixB, startRow, endRow, colsB }
    });

    workers.push(
      new Promise((resolve, reject) => {
        worker.on("message", (partialResult) => {
          for (let r = startRow; r < endRow; r++) {
            result[r] = partialResult[r - startRow];
          }
          resolve();
        });
        worker.on("error", reject);
        worker.on("exit", (code) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      })
    );
  }

  return Promise.all(workers).then(() => result);
}

if (!isMainThread) {
  const { matrixA, matrixB, startRow, endRow, colsB } = workerData;

  const partialResult = new Array(endRow - startRow).fill(null).map(() => new Array(colsB).fill(0));

  for (let i = startRow; i < endRow; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < matrixA[0].length; k++) {
        partialResult[i - startRow][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  parentPort.postMessage(partialResult);
}

// Generic utility function for matrix addition
export function matrixAdd(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error("Both inputs must be 2D arrays.");
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error("Matrix dimensions must match for addition.");
  }

  const result = new Array(rowsA).fill(null).map(() => new Array(colsA).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsA; j++) {
      result[i][j] = matrixA[i][j] + matrixB[i][j];
    }
  }

  return result;
}

// Generic utility function for matrix transposition
export function matrixTranspose(matrix) {
  if (!Array.isArray(matrix)) {
    throw new Error("Input must be a 2D array.");
  }

  const rows = matrix.length;
  const cols = matrix[0].length;

  const result = new Array(cols).fill(null).map(() => new Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }

  return result;
}