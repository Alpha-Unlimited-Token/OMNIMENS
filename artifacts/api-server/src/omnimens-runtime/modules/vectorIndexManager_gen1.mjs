/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorIndexManager
 * Written: 2026-04-01T21:57:27.600Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// vectorIndexManager.mjs

import { performance } from 'perf_hooks';

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vec1 - First vector.
 * @param {number[]} vec2 - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must be of the same length');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
}

/**
 * Builds an approximate nearest neighbor (ANN) index using HNSW-like principles.
 * @param {number[][]} data - Array of vectors to index.
 * @param {number} maxNeighbors - Maximum neighbors per node.
 * @returns {object} - ANN index.
 */
export function buildANNIndex(data, maxNeighbors = 10) {
  if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) {
    throw new Error('Data must be a non-empty array of vectors');
  }

  const index = [];

  data.forEach((vector, id) => {
    const neighbors = index.map((node) => ({
      id: node.id,
      distance: euclideanDistance(vector, node.vector)
    }));

    neighbors.sort((a, b) => a.distance - b.distance);
    index.push({
      id,
      vector,
      neighbors: neighbors.slice(0, maxNeighbors)
    });
  });

  return index;
}

/**
 * Searches the ANN index for the nearest neighbors of a query vector.
 * @param {object} index - ANN index.
 * @param {number[]} queryVector - Query vector.
 * @param {number} k - Number of nearest neighbors to return.
 * @returns {object[]} - Array of nearest neighbors with distances.
 */
export function searchANNIndex(index, queryVector, k = 5) {
  if (!Array.isArray(queryVector) || queryVector.length === 0) {
    throw new Error('Query vector must be a non-empty array');
  }

  const candidates = index.map((node) => ({
    id: node.id,
    distance: euclideanDistance(queryVector, node.vector)
  }));

  candidates.sort((a, b) => a.distance - b.distance);
  return candidates.slice(0, k);
}

/**
 * Measures the time taken to execute a function.
 * @param {Function} func - Function to measure.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {object} - Execution time and result of the function.
 */
export function measureExecutionTime(func, ...args) {
  const start = performance.now();
  const result = func(...args);
  const end = performance.now();
  return { time: end - start, result };
}

/**
 * Validates if a vector is numeric.
 * @param {number[]} vector - Vector to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function isNumericVector(vector) {
  return Array.isArray(vector) && vector.every((val) => typeof val === 'number');
}

/**
 * Normalizes a vector to unit length.
 * @param {number[]} vector - Vector to normalize.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }
  return vector.map((val) => val / magnitude);
}
