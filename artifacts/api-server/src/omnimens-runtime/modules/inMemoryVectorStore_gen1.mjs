/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-02T20:58:24.520Z
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
 * Generates a hash for a given string using SHA-256.
 * Useful for consistent key generation in vector storage.
 * @param {string} input - The input string to hash.
 * @returns {string} - The resulting hash.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - The Euclidean distance.
 */
export function calculateDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * KD-Tree Node structure.
 * @param {number[]} point - The vector stored at this node.
 * @param {number} axis - The axis of partition.
 * @param {object|null} left - Left child node.
 * @param {object|null} right - Right child node.
 */
class KDNode {
  constructor(point, axis) {
    this.point = point;
    this.axis = axis;
    this.left = null;
    this.right = null;
  }
}

/**
 * Builds a KD-tree from a list of vectors.
 * @param {number[][]} points - Array of vectors.
 * @param {number} depth - Current depth in the tree.
 * @returns {KDNode|null} - Root node of the KD-tree.
 */
export function buildKDTree(points, depth = 0) {
  if (points.length === 0) return null;

  const axis = depth % points[0].length;
  points.sort((a, b) => a[axis] - b[axis]);
  const medianIndex = Math.floor(points.length / 2);

  const node = new KDNode(points[medianIndex], axis);
  node.left = buildKDTree(points.slice(0, medianIndex), depth + 1);
  node.right = buildKDTree(points.slice(medianIndex + 1), depth + 1);

  return node;
}

/**
 * Searches the KD-tree for the nearest neighbor to a target vector.
 * @param {KDNode|null} node - Current node in the KD-tree.
 * @param {number[]} target - Target vector to search for.
 * @param {object} best - Closest point and distance found so far.
 * @returns {object} - The nearest neighbor and its distance.
 */
export function nearestNeighborSearch(node, target, best = { point: null, distance: Infinity }) {
  if (node === null) return best;

  const distance = calculateDistance(node.point, target);
  if (distance < best.distance) {
    best = { point: node.point, distance };
  }

  const axis = node.axis;
  const nextBranch = target[axis] < node.point[axis] ? node.left : node.right;
  const otherBranch = target[axis] < node.point[axis] ? node.right : node.left;

  best = nearestNeighborSearch(nextBranch, target, best);

  if (Math.abs(target[axis] - node.point[axis]) < best.distance) {
    best = nearestNeighborSearch(otherBranch, target, best);
  }

  return best;
}

/**
 * Inserts a new vector into the KD-tree.
 * @param {KDNode|null} node - Current node in the KD-tree.
 * @param {number[]} point - Vector to insert.
 * @param {number} depth - Current depth in the tree.
 * @returns {KDNode} - Updated KD-tree node.
 */
export function insertKDTree(node, point, depth = 0) {
  if (node === null) return new KDNode(point, depth % point.length);

  const axis = node.axis;
  if (point[axis] < node.point[axis]) {
    node.left = insertKDTree(node.left, point, depth + 1);
  } else {
    node.right = insertKDTree(node.right, point, depth + 1);
  }

  return node;
}

/**
 * Example utility function to normalize a vector.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) throw new Error('Cannot normalize a zero vector.');
  return vector.map(val => val / magnitude);
}

/**
 * Example utility function to batch search for multiple nearest neighbors.
 * @param {KDNode|null} tree - Root node of the KD-tree.
 * @param {number[][]} targets - Array of target vectors.
 * @returns {object[]} - Array of nearest neighbors and distances.
 */
export function batchNearestNeighborSearch(tree, targets) {
  return targets.map(target => nearestNeighborSearch(tree, target));
}
