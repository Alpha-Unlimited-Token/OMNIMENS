/**
 * @module inMemoryVectorStore
 * @description A utility module for storing and retrieving high-dimensional embeddings efficiently in memory using k-d tree for fast similarity lookups.
 */

/**
 * Represents a node in the k-d tree.
 * @typedef {Object} KDTreeNode
 * @property {number[]} point - The high-dimensional point (embedding).
 * @property {KDTreeNode|null} left - Left child node.
 * @property {KDTreeNode|null} right - Right child node.
 */

/**
 * Builds a k-d tree from a list of high-dimensional points.
 * @param {number[][]} points - Array of high-dimensional points.
 * @param {number} depth - Current depth of the tree.
 * @returns {KDTreeNode|null} Root node of the k-d tree.
 */
function buildKDTree(points, depth = 0) {
  if (points.length === 0) return null;

  const k = points[0].length; // Dimensionality of the points.
  const axis = depth % k; // Determine splitting axis.

  // Sort points along the current axis.
  points.sort((a, b) => a[axis] - b[axis]);

  const medianIndex = Math.floor(points.length / 2);

  return {
    point: points[medianIndex],
    left: buildKDTree(points.slice(0, medianIndex), depth + 1),
    right: buildKDTree(points.slice(medianIndex + 1), depth + 1)
  };
}

/**
 * Searches for the nearest neighbor to a given point in the k-d tree.
 * @param {KDTreeNode|null} node - Root node of the k-d tree.
 * @param {number[]} target - Target point to search for.
 * @param {number} depth - Current depth in the tree.
 * @param {Object} best - Best match found so far.
 * @returns {Object} Nearest neighbor and its distance.
 */
function nearestNeighborSearch(node, target, depth = 0, best = { point: null, distance: Infinity }) {
  if (node === null) return best;

  const k = target.length;
  const axis = depth % k;

  // Calculate distance to current node.
  const dist = euclideanDistance(node.point, target);
  if (dist < best.distance) {
    best = { point: node.point, distance: dist };
  }

  // Determine which side to explore first.
  const nextBranch = target[axis] < node.point[axis] ? node.left : node.right;
  const otherBranch = target[axis] < node.point[axis] ? node.right : node.left;

  // Recursively search.
  best = nearestNeighborSearch(nextBranch, target, depth + 1, best);

  // Check if we need to explore the other branch.
  if (Math.abs(target[axis] - node.point[axis]) < best.distance) {
    best = nearestNeighborSearch(otherBranch, target, depth + 1, best);
  }

  return best;
}

/**
 * Calculates the Euclidean distance between two points.
 * @param {number[]} a - First point.
 * @param {number[]} b - Second point.
 * @returns {number} Euclidean distance.
 */
function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

/**
 * Stores high-dimensional embeddings and provides efficient similarity lookup.
 */
class InMemoryVectorStore {
  constructor() {
    this.tree = null;
  }

  /**
   * Builds the vector store from a list of embeddings.
   * @param {number[][]} embeddings - Array of high-dimensional embeddings.
   */
  build(embeddings) {
    this.tree = buildKDTree(embeddings);
  }

  /**
   * Finds the nearest neighbor to a given embedding.
   * @param {number[]} embedding - Target embedding.
   * @returns {Object} Nearest neighbor and its distance.
   */
  findNearest(embedding) {
    if (!this.tree) {
      throw new Error("Vector store is empty. Build the store first.");
    }
    return nearestNeighborSearch(this.tree, embedding);
  }
}

module.exports = {
  InMemoryVectorStore
};