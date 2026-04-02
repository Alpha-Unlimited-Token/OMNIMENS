/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuAccelerationEngine
 * Written: 2026-04-02T15:13:41.184Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuAccelerationEngine.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given input string (used for caching GPU computations).
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash string.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Performs matrix multiplication on two 2D arrays.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {number[][]} - The resulting matrix after multiplication.
 */
export function matrixMultiply(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not allow multiplication.');
  }

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

/**
 * Approximates the eigenvalues of a square matrix using the power iteration method.
 * @param {number[][]} matrix - The square matrix to analyze.
 * @param {number} [iterations=100] - The number of iterations to perform.
 * @returns {number[]} - An array of approximated eigenvalues.
 */
export function computeEigenvalues(matrix, iterations = 100) {
  if (matrix.length !== matrix[0].length) {
    throw new Error('Matrix must be square to compute eigenvalues.');
  }

  const size = matrix.length;
  let vector = Array(size).fill(1);

  for (let iter = 0; iter < iterations; iter++) {
    const nextVector = matrixMultiply([vector], matrix)[0];
    const norm = Math.sqrt(nextVector.reduce((sum, val) => sum + val ** 2, 0));
    vector = nextVector.map((val) => val / norm);
  }

  const eigenvalue = matrixMultiply([vector], matrix)[0].reduce((sum, val, idx) => sum + val * vector[idx], 0);
  return [eigenvalue];
}

/**
 * Updates a Hopfield network's state based on the input pattern and weight matrix.
 * @param {number[]} pattern - The input pattern (binary values: 1 or -1).
 * @param {number[][]} weights - The weight matrix of the Hopfield network.
 * @returns {number[]} - The updated pattern after applying the Hopfield update rule.
 */
export function updateHopfieldPattern(pattern, weights) {
  if (weights.length !== weights[0].length || weights.length !== pattern.length) {
    throw new Error('Weight matrix must be square and match the length of the pattern.');
  }

  const updatedPattern = pattern.map((_, i) => {
    const sum = weights[i].reduce((acc, weight, j) => acc + weight * pattern[j], 0);
    return sum >= 0 ? 1 : -1;
  });

  return updatedPattern;
}

/**
 * Validates if a matrix is suitable for GPU acceleration tasks.
 * @param {number[][]} matrix - The matrix to validate.
 * @returns {boolean} - True if the matrix is valid, false otherwise.
 */
export function isValidMatrix(matrix) {
  if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
    return false;
  }
  const rowLength = matrix[0].length;
  return matrix.every((row) => Array.isArray(row) && row.length === rowLength);
}

/**
 * Normalizes a matrix to have values between 0 and 1.
 * @param {number[][]} matrix - The matrix to normalize.
 * @returns {number[][]} - The normalized matrix.
 */
export function normalizeMatrix(matrix) {
  const flat = matrix.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);

  return matrix.map((row) => row.map((val) => (val - min) / (max - min)));
}

/**
 * Caches results of expensive computations using a simple in-memory store.
 * @param {Function} computeFunction - The function to cache results for.
 * @returns {Function} - A wrapped function with caching.
 */
export function cacheResults(computeFunction) {
  const cache = new Map();

  return (...args) => {
    const key = generateHash(JSON.stringify(args));
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = computeFunction(...args);
    cache.set(key, result);
    return result;
  };
}
