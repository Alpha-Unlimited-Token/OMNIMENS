/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAcceleratedMatrixOps
 * Written: 2026-04-03T16:15:46.513Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuAcceleratedMatrixOps.mjs

import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { resolve } from 'path';

/**
 * Utility function to perform GPU-accelerated matrix multiplication using parallel computation via Worker Threads.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {Promise<number[][]>} - Resulting matrix after multiplication.
 */
export function gpuMatrixMultiply(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new TypeError('Inputs must be 2D arrays (matrices).');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions do not align for multiplication.');
  }

  return new Promise((resolve, reject) => {
    const workerPath = resolve(__dirname, './gpuAcceleratedMatrixOpsWorker.mjs');
    const worker = new Worker(workerPath, {
      workerData: { matrixA, matrixB, rowsA, colsB, colsA }
    });

    worker.on('message', (result) => resolve(result));
    worker.on('error', (err) => reject(err));
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

/**
 * Utility function to compute the dot product of two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Dot product of the two vectors.
 */
export function gpuVectorDotProduct(vectorA, vectorB) {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) {
    throw new TypeError('Inputs must be arrays (vectors).');
  }

  if (vectorA.length !== vectorB.length) {
    throw new Error('Vector lengths must match for dot product computation.');
  }

  return vectorA.reduce((sum, val, index) => sum + val * vectorB[index], 0);
}

/**
 * Utility function to compute the similarity between two vectors using cosine similarity.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity between the two vectors.
 */
export function gpuVectorCosineSimilarity(vectorA, vectorB) {
  const dotProduct = gpuVectorDotProduct(vectorA, vectorB);
  const magnitudeA = Math.sqrt(gpuVectorDotProduct(vectorA, vectorA));
  const magnitudeB = Math.sqrt(gpuVectorDotProduct(vectorB, vectorB));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Vector magnitude cannot be zero for cosine similarity computation.');
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Utility function to create a zero-filled matrix of specified dimensions.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {number[][]} - Zero-filled matrix.
 */
export function createZeroMatrix(rows, cols) {
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows <= 0 || cols <= 0) {
    throw new TypeError('Rows and columns must be positive integers.');
  }

  return new Array(rows).fill(null).map(() => new Array(cols).fill(0));
}

/**
 * Utility function to transpose a matrix.
 * @param {number[][]} matrix - Matrix to transpose.
 * @returns {number[][]} - Transposed matrix.
 */
export function transposeMatrix(matrix) {
  if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
    throw new TypeError('Input must be a 2D array (matrix).');
  }

  const rows = matrix.length;
  const cols = matrix[0].length;

  const transposed = createZeroMatrix(cols, rows);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposed[j][i] = matrix[i][j];
    }
  }

  return transposed;
}