/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:18:37.517Z
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

import { performance } from 'node:perf_hooks';

/**
 * Utility module for in-memory storage and retrieval of high-dimensional embeddings
 * using a KD-tree data structure.
 */

// Helper function to calculate Euclidean distance between two vectors
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensionality');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + (val - vectorB[idx]) ** 2, 0));
}

// KD-Tree Node class
class KDTreeNode {
  constructor(point, index, axis) {
    this.point = point; // The vector/point stored at this node
    this.index = index; // The index of the point in the original dataset
    this.axis = axis; // The axis/dimension this node splits on
    this.left = null; // Left child node
    this.right = null; // Right child node
  }
}

// KD-Tree class for building and querying the tree
export class KDTree {
  constructor(points) {
    if (!Array.isArray(points) || points.length === 0) {
      throw new Error('Points array must be non-empty');
    }
    this.root = this._buildTree(points, 0);
  }

  // Recursive function to build the KD-tree
  _buildTree(points, depth) {
    if (points.length === 0) return null;

    const axis = depth % points[0].length; // Cycle through dimensions
    points.sort((a, b) => a[0][axis] - b[0][axis]); // Sort by current axis

    const medianIndex = Math.floor(points.length / 2);
    const medianPoint = points[medianIndex];

    const node = new KDTreeNode(medianPoint[0], medianPoint[1], axis);
    node.left = this._buildTree(points.slice(0, medianIndex), depth + 1);
    node.right = this._buildTree(points.slice(medianIndex + 1), depth + 1);

    return node;
  }

  // Recursive nearest neighbor search
  _nearest(node, target, depth, best) {
    if (node === null) return best;

    const axis = depth % target.length;
    const dist = euclideanDistance(node.point, target);

    if (!best || dist < best.distance) {
      best = { node, distance: dist };
    }

    const nextBranch = target[axis] < node.point[axis] ? node.left : node.right;
    const otherBranch = target[axis] < node.point[axis] ? node.right : node.left;

    best = this._nearest(nextBranch, target, depth + 1, best);

    if (Math.abs(target[axis] - node.point[axis]) < best.distance) {
      best = this._nearest(otherBranch, target, depth + 1, best);
    }

    return best;
  }

  // Public method to find the nearest neighbor
  findNearest(target) {
    if (!Array.isArray(target) || target.length === 0) {
      throw new Error('Target must be a non-empty array');
    }
    return this._nearest(this.root, target, 0, null);
  }
}

// Utility function to build a KD-tree from a dataset
export function buildKDTree(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array of points');
  }
  const points = data.map((point, index) => [point, index]);
  return new KDTree(points);
}

// Example utility to time nearest neighbor search
export function timeNearestNeighborSearch(tree, target) {
  const start = performance.now();
  const result = tree.findNearest(target);
  const end = performance.now();
  return { result, timeMs: end - start };
}

// Example utility to calculate distances between multiple points
export function calculateDistances(points, target) {
  return points.map((point, index) => ({
    index,
    distance: euclideanDistance(point, target)
  })).sort((a, b) => a.distance - b.distance);
}
