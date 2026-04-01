/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:09:09.806Z
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
 * Generates a hash for a vector to ensure unique identification.
 * @param {Array<number>} vector - The input vector.
 * @returns {string} - A unique hash for the vector.
 */
export function generateVectorHash(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {Array<number>} vectorA - The first vector.
 * @param {Array<number>} vectorB - The second vector.
 * @returns {number} - The Euclidean distance.
 */
export function calculateEuclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same dimension.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * KD-Tree Node structure.
 * @typedef {Object} KDNode
 * @property {Array<number>} point - The vector stored at this node.
 * @property {KDNode|null} left - Left child node.
 * @property {KDNode|null} right - Right child node.
 */

/**
 * Builds a KD-Tree from a set of vectors.
 * @param {Array<Array<number>>} points - The input vectors.
 * @param {number} depth - The current depth in the tree (default is 0).
 * @returns {KDNode|null} - The root node of the KD-Tree.
 */
export function buildKDTree(points, depth = 0) {
  if (points.length === 0) return null;

  const k = points[0].length;
  const axis = depth % k;

  points.sort((a, b) => a[axis] - b[axis]);
  const median = Math.floor(points.length / 2);

  return {
    point: points[median],
    left: buildKDTree(points.slice(0, median), depth + 1),
    right: buildKDTree(points.slice(median + 1), depth + 1)
  };
}

/**
 * Searches for the nearest neighbors in a KD-Tree.
 * @param {KDNode|null} node - The current KD-Tree node.
 * @param {Array<number>} target - The target vector.
 * @param {number} depth - The current depth in the tree (default is 0).
 * @param {number} bestDistance - The best distance found so far (default is Infinity).
 * @param {KDNode|null} bestNode - The best node found so far (default is null).
 * @returns {{ bestNode: KDNode|null, bestDistance}} - The nearest neighbor and its distance.
 */
export function searchKDTree(node, target, depth = 0, bestDistance = Infinity, bestNode = null) {
  if (node === null) return { bestNode, bestDistance };

  const k = target.length;
  const axis = depth % k;
  const distance = calculateEuclideanDistance(node.point, target);

  let nextBestNode = bestNode;
  let nextBestDistance = bestDistance;

  if (distance < bestDistance) {
    nextBestNode = node;
    nextBestDistance = distance;
  }

  const direction = target[axis] < node.point[axis] ? 'left' : 'right';
  const nextNode = direction === 'left' ? node.left : node.right;
  const otherNode = direction === 'left' ? node.right : node.left;

  const result = searchKDTree(nextNode, target, depth + 1, nextBestDistance, nextBestNode);

  nextBestNode = result.bestNode;
  nextBestDistance = result.bestDistance;

  if (Math.abs(target[axis] - node.point[axis]) < nextBestDistance) {
    const otherResult = searchKDTree(otherNode, target, depth + 1, nextBestDistance, nextBestNode);
    if (otherResult.bestDistance < nextBestDistance) {
      nextBestNode = otherResult.bestNode;
      nextBestDistance = otherResult.bestDistance;
    }
  }

  return { bestNode: nextBestNode, bestDistance: nextBestDistance };
}

/**
 * Inserts a new vector into an existing KD-Tree.
 * @param {KDNode|null} node - The current KD-Tree node.
 * @param {Array<number>} point - The vector to insert.
 * @param {number} depth - The current depth in the tree (default is 0).
 * @returns {KDNode} - The updated KD-Tree root node.
 */
export function insertIntoKDTree(node, point, depth = 0) {
  if (node === null) {
    return { point, left, right};
  }

  const k = point.length;
  const axis = depth % k;

  if (point[axis] < node.point[axis]) {
    node.left = insertIntoKDTree(node.left, point, depth + 1);
  } else {
    node.right = insertIntoKDTree(node.right, point, depth + 1);
  }

  return node;
}

/**
 * Exports a utility to initialize a KD-Tree and perform nearest neighbor search.
 */
export const inMemoryVectorStore = {
  buildKDTree,
  searchKDTree,
  insertIntoKDTree,
  calculateEuclideanDistance,
  generateVectorHash
};