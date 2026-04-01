/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorStoreEngine
 * Written: 2026-04-01T22:00:28.524Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// vectorStoreEngine.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for caching purposes.
 * @param {string} key - The key to hash.
 * @returns {string} - A SHA-256 hash of the key.
 */
export function generateCacheKey(key) {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vec1 - The first vector.
 * @param {number[]} vec2 - The second vector.
 * @returns {number} - The Euclidean distance.
 */
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
}

/**
 * Builds a k-d tree from a set of high-dimensional vectors.
 * @param {Array<{ vector, id}>} data - Array of objects with vectors and unique IDs.
 * @param {number} depth - Current depth in the tree (default is 0).
 * @returns {Object} - The root node of the k-d tree.
 */
export function buildKdTree(data, depth = 0) {
  if (data.length === 0) return null;

  const k = data[0].vector.length;
  const axis = depth % k;

  data.sort((a, b) => a.vector[axis] - b.vector[axis]);
  const median = Math.floor(data.length / 2);

  return {
    point: data[median],
    left: buildKdTree(data.slice(0, median), depth + 1),
    right: buildKdTree(data.slice(median + 1), depth + 1)
  };
}

/**
 * Performs a nearest-neighbor search in a k-d tree.
 * @param {Object} tree - The k-d tree.
 * @param {number[]} target - The target vector.
 * @param {number} depth - Current depth in the tree (default is 0).
 * @param {Object} best - The current best match (default is null).
 * @returns {Object} - The nearest neighbor.
 */
export function nearestNeighborSearch(tree, target, depth = 0, best = null) {
  if (tree === null) return best;

  const k = target.length;
  const axis = depth % k;

  let nextBranch = null;
  let oppositeBranch = null;

  if (target[axis] < tree.point.vector[axis]) {
    nextBranch = tree.left;
    oppositeBranch = tree.right;
  } else {
    nextBranch = tree.right;
    oppositeBranch = tree.left;
  }

  best = nearestNeighborSearch(nextBranch, target, depth + 1, best);

  const currentDistance = euclideanDistance(target, tree.point.vector);
  const bestDistance = best ? euclideanDistance(target, best.vector) : Infinity;

  if (currentDistance < bestDistance) {
    best = tree.point;
  }

  if (Math.abs(target[axis] - tree.point.vector[axis]) < bestDistance) {
    best = nearestNeighborSearch(oppositeBranch, target, depth + 1, best);
  }

  return best;
}

/**
 * Caches results of nearest-neighbor searches.
 * @param {Map<string, Object>} cache - The cache map.
 * @param {string} key - The cache key.
 * @param {Object} value - The value to cache.
 */
export function cacheResult(cache, key, value) {
  cache.set(key, value);
}

/**
 * Retrieves cached results.
 * @param {Map<string, Object>} cache - The cache map.
 * @param {string} key - The cache key.
 * @returns {Object|null} - The cached value or null if not found.
 */
export function getCachedResult(cache, key) {
  return cache.get(key) || null;
}

/**
 * Example usage of the module.
 */
export const exampleUsage = () => {
  const data = [
    { vector: [2, 3], id: 'A' },
    { vector: [5, 4], id: 'B' },
    { vector: [9, 6], id: 'C' },
    { vector: [4, 7], id: 'D' },
    { vector: [8, 1], id: 'E' },
    { vector: [7, 2], id: 'F' }
  ];

  const tree = buildKdTree(data);
  const target = [7, 3];

  const cache = new Map();
  const cacheKey = generateCacheKey(JSON.stringify(target));

  let result = getCachedResult(cache, cacheKey);
  if (!result) {
    result = nearestNeighborSearch(tree, target);
    cacheResult(cache, cacheKey, result);
  }

  console.log('Nearest neighbor:', result);
};