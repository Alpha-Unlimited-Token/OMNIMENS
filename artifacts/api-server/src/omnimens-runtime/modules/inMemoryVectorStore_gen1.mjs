/**
 * @module inMemoryVectorStore
 * @description A module for storing and retrieving high-dimensional embeddings using a k-d tree for fast similarity searches.
 */

/**
 * Represents a node in the k-d tree.
 * @class
 */
class KDTreeNode {
  /**
   * @param {number[]} point - The vector point stored at this node.
   * @param {KDTreeNode|null} left - Left child node.
   * @param {KDTreeNode|null} right - Right child node.
   */
  constructor(point, left = null, right = null) {
    this.point = point;
    this.left = left;
    this.right = right;
  }
}

/**
 * Builds a k-d tree from a set of points.
 * @param {number[][]} points - Array of points (embeddings) to build the tree.
 * @param {number} depth - Current depth in the tree (used to determine splitting axis).
 * @returns {KDTreeNode|null} - Root node of the k-d tree.
 */
function buildKDTree(points, depth = 0) {
  if (points.length === 0) return null;

  const k = points[0].length; // Dimensionality of the points
  const axis = depth % k; // Determine axis to split on

  // Sort points by the current axis and choose median as pivot
  points.sort((a, b) => a[axis] - b[axis]);
  const medianIndex = Math.floor(points.length / 2);

  // Recursively build left and right subtrees
  return new KDTreeNode(
    points[medianIndex],
    buildKDTree(points.slice(0, medianIndex), depth + 1),
    buildKDTree(points.slice(medianIndex + 1), depth + 1)
  );
}

/**
 * Finds the nearest neighbor to a target point in the k-d tree.
 * @param {KDTreeNode|null} node - Current node in the tree.
 * @param {number[]} target - Target point to find the nearest neighbor for.
 * @param {number} depth - Current depth in the tree (used to determine splitting axis).
 * @param {object} best - Best match found so far (contains point and distance).
 * @returns {object} - Nearest neighbor point and its distance.
 */
function nearestNeighbor(node, target, depth = 0, best = { point: null, distance: Infinity }) {
  if (node === null) return best;

  const k = target.length;
  const axis = depth % k;

  // Calculate distance from target to current node
  const distance = euclideanDistance(node.point, target);
  if (distance < best.distance) {
    best = { point: node.point, distance };
  }

  // Determine which subtree to search first
  const direction = target[axis] < node.point[axis] ? 'left' : 'right';
  const nextNode = direction === 'left' ? node.left : node.right;
  const otherNode = direction === 'left' ? node.right : node.left;

  // Search the chosen subtree
  best = nearestNeighbor(nextNode, target, depth + 1, best);

  // Check if we need to search the other subtree
  if (Math.abs(target[axis] - node.point[axis]) < best.distance) {
    best = nearestNeighbor(otherNode, target, depth + 1, best);
  }

  return best;
}

/**
 * Calculates the Euclidean distance between two points.
 * @param {number[]} a - First point.
 * @param {number[]} b - Second point.
 * @returns {number} - Euclidean distance between the points.
 */
function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

/**
 * Class representing an in-memory vector store using a k-d tree.
 */
class InMemoryVectorStore {
  constructor() {
    this.tree = null; // Root node of the k-d tree
  }

  /**
   * Adds embeddings to the vector store and rebuilds the k-d tree.
   * @param {number[][]} embeddings - Array of embeddings to add.
   */
  addEmbeddings(embeddings) {
    this.tree = buildKDTree(embeddings);
  }

  /**
   * Finds the nearest neighbor to a given embedding.
   * @param {number[]} embedding - Target embedding to search for.
   * @returns {object} - Nearest neighbor point and its distance.
   */
  findNearestNeighbor(embedding) {
    if (!this.tree) {
      throw new Error('Vector store is empty. Add embeddings first.');
    }
    return nearestNeighbor(this.tree, embedding);
  }
}

export { InMemoryVectorStore };