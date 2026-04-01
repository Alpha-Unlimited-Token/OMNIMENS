/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:16:40.519Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// inMemoryVectorStore.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a vector to ensure uniqueness in indexing.
 * @param {number[]} vector - The input vector.
 * @returns {string} - A unique hash string.
 */
export function generateVectorHash(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(
    vectorA.reduce((sum, value, index) => sum + Math.pow(value - vectorB[index], 2), 0)
  );
}

/**
 * KD-tree node structure.
 * @typedef {Object} KDTreeNode
 * @property {number[]} point - The vector stored at this node.
 * @property {KDTreeNode|null} left - Left child node.
 * @property {KDTreeNode|null} right - Right child node.
 */

/**
 * Builds a KD-tree for efficient nearest neighbor search.
 * @param {number[][]} points - Array of vectors.
 * @param {number} depth - Current depth in the tree.
 * @returns {KDTreeNode|null} - Root node of the KD-tree.
 */
export function buildKDTree(points, depth = 0) {
  if (points.length === 0) return null;

  const axis = depth % points[0].length;
  points.sort((a, b) => a[axis] - b[axis]);

  const medianIndex = Math.floor(points.length / 2);

  return {
    point: points[medianIndex],
    left: buildKDTree(points.slice(0, medianIndex), depth + 1),
    right: buildKDTree(points.slice(medianIndex + 1), depth + 1)
  };
}

/**
 * Searches for the nearest neighbor in a KD-tree.
 * @param {KDTreeNode|null} node - Current KD-tree node.
 * @param {number[]} target - Target vector.
 * @param {number} depth - Current depth in the tree.
 * @param {Object} best - Best match found so far.
 * @returns {Object} - Best match with point and distance.
 */
export function nearestNeighborSearch(node, target, depth = 0, best = { point: null, distance: Infinity }) {
  if (!node) return best;

  const axis = depth % target.length;
  const distance = euclideanDistance(target, node.point);

  if (distance < best.distance) {
    best = { point: node.point, distance };
  }

  const nextBranch = target[axis] < node.point[axis] ? node.left : node.right;
  const otherBranch = target[axis] < node.point[axis] ? node.right : node.left;

  best = nearestNeighborSearch(nextBranch, target, depth + 1, best);

  if (Math.abs(target[axis] - node.point[axis]) < best.distance) {
    best = nearestNeighborSearch(otherBranch, target, depth + 1, best);
  }

  return best;
}

/**
 * Stores vectors in memory and provides KD-tree-based search capabilities.
 */
export class InMemoryVectorStore {
  constructor() {
    this.vectors = [];
    this.tree = null;
  }

  /**
   * Adds a vector to the store and rebuilds the KD-tree.
   * @param {number[]} vector - The vector to add.
   */
  addVector(vector) {
    this.vectors.push(vector);
    this.tree = buildKDTree(this.vectors);
  }

  /**
   * Finds the nearest neighbor to a given vector.
   * @param {number[]} queryVector - The vector to search for.
   * @returns {Object} - Nearest neighbor with point and distance.
   */
  findNearestNeighbor(queryVector) {
    if (!this.tree) {
      throw new Error('No vectors stored. Add vectors before searching.');
    }
    return nearestNeighborSearch(this.tree, queryVector);
  }
}

// Example utility function for multiple agents
/**
 * Normalizes a vector to unit length.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return vector.map(value => value / magnitude);
}