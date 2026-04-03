/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryEmbeddingStore
 * Written: 2026-04-03T02:41:12.637Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// inMemoryEmbeddingStore.mjs

import { createHash } from 'crypto';

/**
 * Calculate Euclidean distance between two vectors.
 * @param {number[]} vec1 - First vector.
 * @param {number[]} vec2 - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vec1.reduce((sum, val, idx) => sum + Math.pow(val - vec2[idx], 2), 0));
}

/**
 * KD-tree node structure.
 * @class KDTreeNode
 */
class KDTreeNode {
  constructor(point, index, dimension) {
    this.point = point;
    this.index = index;
    this.dimension = dimension;
    this.left = null;
    this.right = null;
  }
}

/**
 * Build a KD-tree from a list of points.
 * @param {Array<{point, index}>} points - Array of points with indices.
 * @param {number} depth - Current depth in the tree.
 * @returns {KDTreeNode|null} - Root node of the KD-tree.
 */
export function buildKDTree(points, depth = 0) {
  if (points.length === 0) return null;

  const dimension = depth % points[0].point.length;
  points.sort((a, b) => a.point[dimension] - b.point[dimension]);

  const medianIndex = Math.floor(points.length / 2);
  const medianPoint = points[medianIndex];

  const node = new KDTreeNode(medianPoint.point, medianPoint.index, dimension);
  node.left = buildKDTree(points.slice(0, medianIndex), depth + 1);
  node.right = buildKDTree(points.slice(medianIndex + 1), depth + 1);

  return node;
}

/**
 * Search the KD-tree for the nearest neighbor.
 * @param {KDTreeNode} node - KD-tree root node.
 * @param {number[]} targetPoint - Target point to search for.
 * @param {KDTreeNode|null} bestNode - Current best node.
 * @param {number} bestDistance - Current best distance.
 * @returns {{node, distance}} - Nearest neighbor and its distance.
 */
export function searchKDTree(node, targetPoint, bestNode = null, bestDistance = Infinity) {
  if (!node) return { node: bestNode, distance: bestDistance };

  const distance = euclideanDistance(targetPoint, node.point);
  let newBestNode = bestNode;
  let newBestDistance = bestDistance;

  if (distance < bestDistance) {
    newBestNode = node;
    newBestDistance = distance;
  }

  const dimension = node.dimension;
  const nextBranch = targetPoint[dimension] < node.point[dimension] ? node.left : node.right;
  const oppositeBranch = targetPoint[dimension] < node.point[dimension] ? node.right : node.left;

  const bestFromNextBranch = searchKDTree(nextBranch, targetPoint, newBestNode, newBestDistance);
  newBestNode = bestFromNextBranch.node;
  newBestDistance = bestFromNextBranch.distance;

  if (Math.abs(targetPoint[dimension] - node.point[dimension]) < newBestDistance) {
    const bestFromOppositeBranch = searchKDTree(oppositeBranch, targetPoint, newBestNode, newBestDistance);
    newBestNode = bestFromOppositeBranch.node;
    newBestDistance = bestFromOppositeBranch.distance;
  }

  return { node: newBestNode, distance: newBestDistance };
}

/**
 * Hash a vector for efficient storage.
 * @param {number[]} vector - Input vector.
 * @returns {string} - Hash of the vector.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * In-memory embedding store.
 * @class InMemoryEmbeddingStore
 */
export class InMemoryEmbeddingStore {
  constructor() {
    this.embeddings = [];
    this.kdTree = null;
  }

  /**
   * Add a new embedding to the store.
   * @param {number[]} embedding - Embedding vector.
   */
  addEmbedding(embedding) {
    const index = this.embeddings.length;
    this.embeddings.push({ point: embedding, index });
    this.kdTree = buildKDTree(this.embeddings);
  }

  /**
   * Find the nearest embedding to a given query vector.
   * @param {number[]} queryVector - Query vector.
   * @returns {{embedding, distance}} - Nearest embedding and its distance.
   */
  findNearest(queryVector) {
    const result = searchKDTree(this.kdTree, queryVector);
    return {
      embedding: this.embeddings[result.node.index].point,
      distance: result.distance
    };
  }
}

// Example usage:
// const store = new InMemoryEmbeddingStore();
// store.addEmbedding([1, 2, 3, ..., 512]);
// const nearest = store.findNearest([1.1, 2.1, 3.1, ..., 512]);