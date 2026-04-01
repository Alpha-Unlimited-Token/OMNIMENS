/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: embeddingVectorStore
 * Written: 2026-04-01T22:11:17.421Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// embeddingVectorStore.mjs

import { createHash } from 'crypto';

/**
 * Generate a hash-based unique ID for a vector.
 * @param {Float64Array} vector - The input vector.
 * @returns {string} - Unique ID for the vector.
 */
export function generateVectorId(vector) {
  const hash = createHash('sha256');
  hash.update(new Uint8Array(vector.buffer));
  return hash.digest('hex');
}

/**
 * Compute the Euclidean distance between two vectors.
 * @param {Float64Array} vectorA - First vector.
 * @param {Float64Array} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  let sum = 0;
  for (let i = 0; i < vectorA.length; i++) {
    const diff = vectorA[i] - vectorB[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * KD-Tree Node class.
 * @class
 */
class KDTreeNode {
  constructor(vector, id, axis) {
    this.vector = vector;
    this.id = id;
    this.axis = axis;
    this.left = null;
    this.right = null;
  }
}

/**
 * Build a KD-Tree from a set of vectors.
 * @param {Array<{vector, id}>} points - Array of vectors with IDs.
 * @param {number} depth - Current depth in the tree.
 * @returns {KDTreeNode} - Root node of the KD-Tree.
 */
function buildKDTree(points, depth = 0) {
  if (points.length === 0) return null;

  const axis = depth % points[0].vector.length;
  points.sort((a, b) => a.vector[axis] - b.vector[axis]);
  const medianIndex = Math.floor(points.length / 2);

  const node = new KDTreeNode(
    points[medianIndex].vector,
    points[medianIndex].id,
    axis
  );
  node.left = buildKDTree(points.slice(0, medianIndex), depth + 1);
  node.right = buildKDTree(points.slice(medianIndex + 1), depth + 1);

  return node;
}

/**
 * Search the KD-Tree for the nearest neighbors of a target vector.
 * @param {KDTreeNode} node - Root node of the KD-Tree.
 * @param {Float64Array} target - Target vector.
 * @param {number} k - Number of neighbors to find.
 * @param {Array<{id, distance}>} results - Accumulated nearest neighbors.
 * @param {number} depth - Current depth in the tree.
 * @returns {Array<{id, distance}>} - Nearest neighbors.
 */
function searchKDTree(node, target, k, results = [], depth = 0) {
  if (!node) return results;

  const axis = node.axis;
  const distance = euclideanDistance(node.vector, target);

  if (results.length < k || distance < results[results.length - 1].distance) {
    results.push({ id: node.id, distance });
    results.sort((a, b) => a.distance - b.distance);
    if (results.length > k) results.pop();
  }

  const diff = target[axis] - node.vector[axis];
  const [nearBranch, farBranch] = diff < 0 ? [node.left, node.right] : [node.right, node.left];

  searchKDTree(nearBranch, target, k, results, depth + 1);

  if (results.length < k || Math.abs(diff) < results[results.length - 1].distance) {
    searchKDTree(farBranch, target, k, results, depth + 1);
  }

  return results;
}

/**
 * KD-Tree-based in-memory vector store class.
 * @class
 */
export class EmbeddingVectorStore {
  constructor() {
    this.vectors = [];
    this.tree = null;
  }

  /**
   * Add a vector to the store.
   * @param {Float64Array} vector - The vector to add.
   */
  addVector(vector) {
    const id = generateVectorId(vector);
    this.vectors.push({ vector, id });
    this.tree = buildKDTree(this.vectors);
  }

  /**
   * Find the k-nearest neighbors of a target vector.
   * @param {Float64Array} target - Target vector.
   * @param {number} k - Number of neighbors to find.
   * @returns {Array<{id, distance}>} - Nearest neighbors.
   */
  findNearestNeighbors(target, k) {
    if (!this.tree) {
      throw new Error('The vector store is empty.');
    }
    return searchKDTree(this.tree, target, k);
  }
}
