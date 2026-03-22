/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-03-22T03:52:54.224Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * @module inMemoryVectorStore
 * @description A module for storing and retrieving vector embeddings using KD-trees and cosine similarity for fast and efficient searches.
 */

/**
 * Represents a node in the KD-tree.
 * @typedef {Object} KDTreeNode
 * @property {number[]} point - The vector stored at this node.
 * @property {any} value - The associated value for the vector.
 * @property {KDTreeNode|null} left - The left child node.
 * @property {KDTreeNode|null} right - The right child node.
 */

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} a - The first vector.
 * @param {number[]} b - The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 */
function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Builds a KD-tree from a list of vectors and their associated values.
 * @param {Array<{point: number[], value: any}>} data - The data to build the tree from.
 * @param {number} depth - The current depth in the tree (used to determine splitting dimension).
 * @returns {KDTreeNode|null} The root node of the KD-tree.
 */
function buildKDTree(data, depth = 0) {
  if (data.length === 0) return null;

  const k = data[0].point.length;
  const axis = depth % k;

  data.sort((a, b) => a.point[axis] - b.point[axis]);
  const median = Math.floor(data.length / 2);

  return {
    point: data[median].point,
    value: data[median].value,
    left: buildKDTree(data.slice(0, median), depth + 1),
    right: buildKDTree(data.slice(median + 1), depth + 1)
  };
}

/**
 * Searches the KD-tree for the nearest neighbors to a given vector using cosine similarity.
 * @param {KDTreeNode|null} node - The root node of the KD-tree.
 * @param {number[]} target - The target vector to search for.
 * @param {number} k - The number of nearest neighbors to retrieve.
 * @param {number} depth - The current depth in the tree (used to determine splitting dimension).
 * @param {Array<{point: number[], value: any, similarity: number}>} best - The current best neighbors.
 * @returns {Array<{point: number[], value: any, similarity: number}>} The k nearest neighbors.
 */
function searchKDTree(node, target, k, depth = 0, best = []) {
  if (!node) return best;

  const axis = depth % target.length;
  const distance = cosineSimilarity(node.point, target);

  // Add the current node to the best list if it's among the top k
  if (best.length < k || distance > best[best.length - 1].similarity) {
    best.push({ point: node.point, value: node.value, similarity: distance });
    best.sort((a, b) => b.similarity - a.similarity);
    if (best.length > k) best.pop();
  }

  const nextBranch = target[axis] < node.point[axis] ? node.left : node.right;
  const otherBranch = nextBranch === node.left ? node.right : node.left;

  // Search the next branch
  best = searchKDTree(nextBranch, target, k, depth + 1, best);

  // Check if we need to search the other branch
  if (
    best.length < k ||
    Math.abs(target[axis] - node.point[axis]) > best[best.length - 1].similarity
  ) {
    best = searchKDTree(otherBranch, target, k, depth + 1, best);
  }

  return best;
}

/**
 * Class representing an in-memory vector store.
 */
class InMemoryVectorStore {
  constructor() {
    /** @type {KDTreeNode|null} */
    this.tree = null;
    /** @type {Array<{point: number[], value: any}>} */
    this.data = [];
  }

  /**
   * Adds a vector and its associated value to the store.
   * @param {number[]} vector - The vector to add.
   * @param {any} value - The value associated with the vector.
   */
  add(vector, value) {
    this.data.push({ point: vector, value });
    this.tree = buildKDTree(this.data);
  }

  /**
   * Searches for the k nearest neighbors to a given vector.
   * @param {number[]} vector - The vector to search for.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{point: number[], value: any, similarity: number}>} The k nearest neighbors.
   */
  search(vector, k) {
    return searchKDTree(this.tree, vector, k);
  }
}

export { InMemoryVectorStore, cosineSimilarity };