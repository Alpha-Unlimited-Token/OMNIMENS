/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:21:54.175Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { createHash } from 'crypto';

/**
 * Generates a hash for a given vector using locality-sensitive hashing (LSH).
 * @param {number[]} vector - Input vector.
 * @param {number} numBits - Number of hash bits.
 * @returns {string} - Hash string.
 */
export function generateLSHHash(vector, numBits) {
  const hash = createHash('sha256');
  const binaryHash = vector
    .map((val) => (val >= 0 ? '1' : '0'))
    .join('')
    .slice(0, numBits);
  hash.update(binaryHash);
  return hash.digest('hex');
}

/**
 * Computes the Euclidean distance between two vectors.
 * @param {number[]} vec1 - First vector.
 * @param {number[]} vec2 - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
}

/**
 * KD-Tree node class.
 */
class KDNode {
  constructor(point, index, left = null, right = null) {
    this.point = point;
    this.index = index;
    this.left = left;
    this.right = right;
  }
}

/**
 * Builds a KD-Tree for fast nearest neighbor search.
 * @param {number[][]} points - Array of points (vectors).
 * @param {number} depth - Current depth of the tree.
 * @returns {KDNode} - Root node of the KD-Tree.
 */
function buildKDTree(points, depth = 0) {
  if (points.length === 0) return null;

  const k = points[0].length;
  const axis = depth % k;

  points.sort((a, b) => a[axis] - b[axis]);
  const median = Math.floor(points.length / 2);

  return new KDNode(
    points[median],
    median,
    buildKDTree(points.slice(0, median), depth + 1),
    buildKDTree(points.slice(median + 1), depth + 1)
  );
}

/**
 * Searches for the nearest neighbor in a KD-Tree.
 * @param {KDNode} tree - Root node of the KD-Tree.
 * @param {number[]} target - Target vector.
 * @param {number} depth - Current depth of the tree.
 * @param {KDNode} best - Current best node.
 * @returns {KDNode} - Nearest neighbor node.
 */
function nearestNeighborSearch(tree, target, depth = 0, best = null) {
  if (tree === null) return best;

  const k = target.length;
  const axis = depth % k;

  let nextBranch = null;
  let oppositeBranch = null;

  if (target[axis] < tree.point[axis]) {
    nextBranch = tree.left;
    oppositeBranch = tree.right;
  } else {
    nextBranch = tree.right;
    oppositeBranch = tree.left;
  }

  best = nearestNeighborSearch(nextBranch, target, depth + 1, best);

  const currentDistance = euclideanDistance(tree.point, target);
  const bestDistance = best ? euclideanDistance(best.point, target) : Infinity;

  if (currentDistance < bestDistance) {
    best = tree;
  }

  if (
    Math.abs(target[axis] - tree.point[axis]) <
    (best ? euclideanDistance(best.point, target) : Infinity)
  ) {
    best = nearestNeighborSearch(oppositeBranch, target, depth + 1, best);
  }

  return best;
}

/**
 * Initializes an in-memory vector store with KD-Tree indexing.
 * @param {number[][]} vectors - Array of vectors to store.
 * @returns {object} - KD-Tree root and search function.
 */
export function initializeVectorStore(vectors) {
  const kdTree = buildKDTree(vectors);

  return {
    kdTree,
    search: (target) => {
      const nearestNode = nearestNeighborSearch(kdTree, target);
      return nearestNode ? nearestNode.point : null;
    }
  };
}

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vec1 - First vector.
 * @param {number[]} vec2 - Second vector.
 * @returns {number} - Cosine similarity.
 */
export function cosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions.');
  }

  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

  return dotProduct / (magnitude1 * magnitude2);
}
