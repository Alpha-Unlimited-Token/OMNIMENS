/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: dynamicMemoryManager
 * Purpose: Provide an in-memory vector store for fast embeddings and context-sensitive memory retrieval.
 * Description: Provides an in-memory vector store using KD-tree for fast embeddings and nearest-neighbor search to enhance OMNIMENS's context-sensitive memory.
 * Migrated: 2026-03-25T22:49:34.164Z
 */

/**
 * @module dynamicMemoryManager
 * @description Provides an in-memory vector store for fast embeddings and context-sensitive memory retrieval using KD-tree.
 */

/**
 * Represents a KD-tree node.
 * @typedef {Object} KDTreeNode
 * @property {number[]} point - The point stored at this node.
 * @property {KDTreeNode|null} left - The left child node.
 * @property {KDTreeNode|null} right - The right child node.
 */

/**
 * Builds a KD-tree from a set of points.
 * @param {number[][]} points - Array of points where each point is an array of numbers.
 * @param {number} depth - The current depth in the tree (used for splitting dimensions).
 * @returns {KDTreeNode|null} The root of the KD-tree.
 */
function buildKDTree(points, depth = 0) {
  if (points.length === 0) return null;

  const k = points[0].length; // Dimensionality of the points
  const axis = depth % k; // Dimension to split on

  // Sort points by the current axis
  points.sort((a, b) => a[axis] - b[axis]);

  const medianIndex = Math.floor(points.length / 2);

  return {
    point: points[medianIndex],
    left: buildKDTree(points.slice(0, medianIndex), depth + 1),
    right: buildKDTree(points.slice(medianIndex + 1), depth + 1)
  };
}

/**
 * Finds the nearest neighbor to a target point in the KD-tree.
 * @param {KDTreeNode|null} node - The root of the KD-tree.
 * @param {number[]} target - The target point.
 * @param {number} depth - The current depth in the tree.
 * @param {KDTreeNode|null} best - The current best node.
 * @param {number} bestDistance - The distance to the current best node.
 * @returns {{best: KDTreeNode|null, bestDistance: number}} The nearest neighbor and its distance.
 */
function nearestNeighbor(node, target, depth = 0, best = null, bestDistance = Infinity) {
  if (node === null) return { best, bestDistance };

  const k = target.length;
  const axis = depth % k;

  const distance = euclideanDistance(node.point, target);

  let currentBest = best;
  let currentBestDistance = bestDistance;

  if (distance < bestDistance) {
    currentBest = node;
    currentBestDistance = distance;
  }

  const direction = target[axis] < node.point[axis] ? 'left' : 'right';
  const nextNode = direction === 'left' ? node.left : node.right;
  const otherNode = direction === 'left' ? node.right : node.left;

  const { best: newBest, bestDistance: newBestDistance } = nearestNeighbor(nextNode, target, depth + 1, currentBest, currentBestDistance);

  currentBest = newBest;
  currentBestDistance = newBestDistance;

  if (Math.abs(target[axis] - node.point[axis]) < currentBestDistance) {
    const { best: otherBest, bestDistance: otherBestDistance } = nearestNeighbor(otherNode, target, depth + 1, currentBest, currentBestDistance);
    if (otherBestDistance < currentBestDistance) {
      currentBest = otherBest;
      currentBestDistance = otherBestDistance;
    }
  }

  return { best: currentBest, bestDistance: currentBestDistance };
}

/**
 * Calculates the Euclidean distance between two points.
 * @param {number[]} pointA - The first point.
 * @param {number[]} pointB - The second point.
 * @returns {number} The Euclidean distance.
 */
function euclideanDistance(pointA, pointB) {
  return Math.sqrt(pointA.reduce((sum, val, i) => sum + (val - pointB[i]) ** 2, 0));
}

/**
 * Creates a KD-tree vector store and provides methods for insertion and nearest neighbor search.
 */
class VectorStore {
  constructor() {
    /** @type {KDTreeNode|null} */
    this.tree = null;
    /** @type {number[][]} */
    this.points = [];
  }

  /**
   * Inserts a new point into the vector store.
   * @param {number[]} point - The point to insert.
   */
  insert(point) {
    this.points.push(point);
    this.tree = buildKDTree(this.points);
  }

  /**
   * Finds the nearest neighbor to a given point.
   * @param {number[]} target - The target point.
   * @returns {{point: number[], distance: number}} The nearest point and its distance.
   */
  findNearest(target) {
    if (!this.tree) throw new Error('The vector store is empty.');
    const { best, bestDistance } = nearestNeighbor(this.tree, target);
    return { point: best.point, distance: bestDistance };
  }
}

export { VectorStore, buildKDTree, nearestNeighbor, euclideanDistance };