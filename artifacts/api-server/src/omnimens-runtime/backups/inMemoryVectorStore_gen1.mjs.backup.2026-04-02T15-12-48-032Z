/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:18:26.885Z
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
 * Calculates Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Distance between vectors.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * Builds a k-d tree from a list of embeddings.
 * @param {Array<{ id, embedding}>} data - Array of objects with id and embedding.
 * @param {number} depth - Current depth in the tree (used internally).
 * @returns {object} - Root node of the k-d tree.
 */
export function buildKdTree(data, depth = 0) {
  if (data.length === 0) return null;

  const k = data[0].embedding.length; // Dimensionality of embeddings.
  const axis = depth % k;

  data.sort((a, b) => a.embedding[axis] - b.embedding[axis]);
  const medianIndex = Math.floor(data.length / 2);

  return {
    point: data[medianIndex],
    left: buildKdTree(data.slice(0, medianIndex), depth + 1),
    right: buildKdTree(data.slice(medianIndex + 1), depth + 1)
  };
}

/**
 * Searches the k-d tree for the nearest neighbor to a given target embedding.
 * @param {object} node - Root node of the k-d tree.
 * @param {number[]} target - Target embedding.
 * @param {number} depth - Current depth in the tree (used internally).
 * @param {object} best - Current best match (used internally).
 * @returns {object} - Nearest neighbor.
 */
export function nearestNeighborSearch(node, target, depth = 0, best = { point, distance}) {
  if (!node) return best;

  const k = target.length;
  const axis = depth % k;

  const distance = euclideanDistance(node.point.embedding, target);
  if (distance < best.distance) {
    best = { point: node.point, distance };
  }

  const nextBranch = target[axis] < node.point.embedding[axis] ? node.left : node.right;
  const otherBranch = target[axis] < node.point.embedding[axis] ? node.right : node.left;

  best = nearestNeighborSearch(nextBranch, target, depth + 1, best);

  if (Math.abs(target[axis] - node.point.embedding[axis]) < best.distance) {
    best = nearestNeighborSearch(otherBranch, target, depth + 1, best);
  }

  return best;
}

/**
 * Adds a new embedding to the k-d tree.
 * @param {object} node - Root node of the k-d tree.
 * @param {object} newPoint - New point to add (with id and embedding).
 * @param {number} depth - Current depth in the tree (used internally).
 * @returns {object} - Updated k-d tree.
 */
export function addToKdTree(node, newPoint, depth = 0) {
  if (!node) return { point: newPoint, left, right};

  const k = newPoint.embedding.length;
  const axis = depth % k;

  if (newPoint.embedding[axis] < node.point.embedding[axis]) {
    node.left = addToKdTree(node.left, newPoint, depth + 1);
  } else {
    node.right = addToKdTree(node.right, newPoint, depth + 1);
  }

  return node;
}

/**
 * Generates a unique ID for a new embedding.
 * @param {number[]} embedding - Embedding vector.
 * @returns {string} - Unique ID.
 */
export function generateId(embedding) {
  const hash = createHash('sha256');
  hash.update(embedding.join(','));
  return hash.digest('hex');
}

/**
 * Wrapper function to insert and search embeddings.
 */
export const inMemoryVectorStore = {
  tree,

  add(embedding) {
    const id = generateId(embedding);
    const newPoint = { id, embedding };
    this.tree = addToKdTree(this.tree, newPoint);
    return id;
  },

  search(target) {
    if (!this.tree) throw new Error('Tree is empty.');
    return nearestNeighborSearch(this.tree, target).point;
  }
};