/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: parallelMatrixEngine
 * Written: 2026-04-02T15:12:24.773Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// parallelMatrixEngine.mjs

import { Worker, isMainThread, parentPort } from 'worker_threads';
import { resolve } from 'path';

// Utility function to divide a matrix into smaller chunks
export function divideMatrix(matrix, numChunks) {
  const chunkSize = Math.ceil(matrix.length / numChunks);
  const chunks = [];
  for (let i = 0; i < numChunks; i++) {
    chunks.push(matrix.slice(i * chunkSize, (i + 1) * chunkSize));
  }
  return chunks;
}

// Utility function to multiply two matrices
export function multiplyMatrices(matrixA, matrixB) {
  const result = Array(matrixA.length)
    .fill(null)
    .map(() => Array(matrixB[0].length).fill(0));

  for (let i = 0; i < matrixA.length; i++) {
    for (let j = 0; j < matrixB[0].length; j++) {
      for (let k = 0; k < matrixB.length; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }
  return result;
}

// Function to perform matrix multiplication using Web Workers
export async function parallelMatrixMultiplication(matrixA, matrixB, numWorkers = 4) {
  if (!isMainThread) {
    throw new Error("This function must be called from the main thread.");
  }

  const workers = [];
  const chunks = divideMatrix(matrixA, numWorkers);
  const results = [];

  const workerPath = resolve(__dirname, 'worker.js');

  for (let i = 0; i < numWorkers; i++) {
    workers.push(
      new Promise((resolve, reject) => {
        const worker = new Worker(workerPath);
        worker.on("message", (message) => resolve(message));
        worker.on("error", reject);
        worker.postMessage({ chunk: chunks[i], matrixB });
      })
    );
  }

  const workerResults = await Promise.all(workers);

  for (const partialResult of workerResults) {
    results.push(...partialResult);
  }

  return results;
}

// Worker thread logic (to be saved in a separate file named worker.js)
if (!isMainThread) {
  parentPort.on("message", ({ chunk, matrixB }) => {
    const result = multiplyMatrices(chunk, matrixB);
    parentPort.postMessage(result);
  });
}
