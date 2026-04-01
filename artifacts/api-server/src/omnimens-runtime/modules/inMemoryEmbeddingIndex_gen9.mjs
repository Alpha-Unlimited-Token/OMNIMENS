/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryEmbeddingIndex
 * Written: 2026-04-01T22:02:43.872Z
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
 * Utility module for managing and querying high-dimensional embeddings using a K-D Tree structure.
 * Provides efficient nearest-neighbor search and embedding management.
 */

// Helper function to calculate Euclidean distance between two vectors
export function euclideanDistance(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimensionality');
  }
  return Math.sqrt(vecA.reduce((sum, val, i) => sum + Math.pow(val - vecB[i], 2), 0));
}

// K-D Tree Node class
class KDTreeNode {
  constructor(point, index, left = null, right = null) {
    this.point = point; // The embedding vector
    this.index = index; // The index of the embedding
    this.left = left; // Left subtree
    this.right = right; // Right subtree
  }
}

// Recursive function to build a K-D Tree
function buildKDTree(points, depth = 0) {
  if (points.length === 0) return null;

  const k = points[0].vector.length; // Dimensionality of the embeddings
  const axis = depth % k;

  // Sort points by the current axis and select the median
  points.sort((a, b) => a.vector[axis] - b.vector[axis]);
  const medianIndex = Math.floor(points.length / 2);

  return new KDTreeNode(
    points[medianIndex].vector,
    points[medianIndex].index,
    buildKDTree(points.slice(0, medianIndex), depth + 1),
    buildKDTree(points.slice(medianIndex + 1), depth + 1)
  );
}

// Recursive nearest-neighbor search in a K-D Tree
function nearestNeighborSearch(node, target, depth = 0, best = { node: null, distance: Infinity }) {
  if (!node) return best;

  const k = target.length;
  const axis = depth % k;

  // Calculate distance to the current node
  const distance = euclideanDistance(target, node.point);
  if (distance < best.distance) {
    best = { node, distance };
  }

  // Determine which subtree to search first
  const nextBranch = target[axis] < node.point[axis] ? node.left : node.right;
  const otherBranch = target[axis] < node.point[axis] ? node.right : node.left;

  // Search the next branch
  best = nearestNeighborSearch(nextBranch, target, depth + 1, best);

  // Check if we need to search the other branch
  if (Math.abs(target[axis] - node.point[axis]) < best.distance) {
    best = nearestNeighborSearch(otherBranch, target, depth + 1, best);
  }

  return best;
}

// Main class for the in-memory embedding index
export class InMemoryEmbeddingIndex {
  constructor() {
    this.embeddings = []; // Array to store embeddings
    this.tree = null; // Root of the K-D Tree
  }

  // Add a new embedding to the index
  addEmbedding(vector) {
    if (!Array.isArray(vector) || vector.some(isNaN)) {
      throw new Error('Embedding must be a valid array of numbers');
    }

    const index = createHash('sha256').update(vector.join(',')).digest('hex');
    this.embeddings.push({ vector, index });
    this.tree = buildKDTree(this.embeddings); // Rebuild the tree after insertion
    return index;
  }

  // Find the nearest neighbor for a given embedding
  findNearest(vector) {
    if (!Array.isArray(vector) || vector.some(isNaN)) {
      throw new Error('Query vector must be a valid array of numbers');
    }

    if (!this.tree) {
      throw new Error('The index is empty');
    }

    const result = nearestNeighborSearch(this.tree, vector);
    return { index: result.node.index, distance: result.distance };
  }

  // Get the total number of embeddings in the index
  getSize() {
    return this.embeddings.length;
  }
}

export const createEmbeddingIndex = () => new InMemoryEmbeddingIndex();