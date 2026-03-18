/**
 * @module inMemoryVectorSearch
 * @description This module provides an in-memory vector search utility using a KD-tree algorithm for fast semantic search and retrieval of embeddings.
 */

/**
 * Represents a node in the KD-tree.
 * @class
 */
class KDTreeNode {
  constructor(point, index, axis) {
    this.point = point; // The vector (embedding) stored at this node
    this.index = index; // The index of the vector in the original dataset
    this.axis = axis; // The axis (dimension) used to split at this node
    this.left = null; // Left subtree
    this.right = null; // Right subtree
  }
}

/**
 * KDTree class for indexing and searching embeddings.
 */
class KDTree {
  /**
   * Constructs a KDTree from a dataset of embeddings.
   * @param {number[][]} points - Array of vectors (embeddings) to index.
   */
  constructor(points) {
    this.root = this._buildTree(points, 0, 0, points.length - 1);
  }

  /**
   * Recursively builds the KD-tree.
   * @private
   * @param {number[][]} points - Array of vectors (embeddings).
   * @param {number} depth - Current depth in the tree.
   * @param {number} start - Start index of the subset of points.
   * @param {number} end - End index of the subset of points.
   * @returns {KDTreeNode} - The root node of the subtree.
   */
  _buildTree(points, depth, start, end) {
    if (start > end) return null;

    const axis = depth % points[0].length; // Cycle through dimensions
    const medianIndex = Math.floor((start + end) / 2);

    // Sort points by the current axis
    points.sort((a, b) => a[axis] - b[axis]);

    const node = new KDTreeNode(points[medianIndex], medianIndex, axis);
    node.left = this._buildTree(points, depth + 1, start, medianIndex - 1);
    node.right = this._buildTree(points, depth + 1, medianIndex + 1, end);

    return node;
  }

  /**
   * Searches for the k nearest neighbors of a query vector.
   * @param {number[]} query - The query vector.
   * @param {number} k - The number of nearest neighbors to find.
   * @returns {Array<{index: number, distance: number}>} - Array of nearest neighbors with their indices and distances.
   */
  search(query, k) {
    const neighbors = [];

    /**
     * Recursively searches the KD-tree for the nearest neighbors.
     * @private
     * @param {KDTreeNode} node - The current node.
     * @param {number[]} query - The query vector.
     */
    const searchTree = (node) => {
      if (!node) return;

      const distance = this._euclideanDistance(query, node.point);
      const axis = node.axis;

      // Add current node to the neighbors list if it's closer than the farthest neighbor
      if (neighbors.length < k || distance < neighbors[neighbors.length - 1].distance) {
        neighbors.push({ index: node.index, distance });
        neighbors.sort((a, b) => a.distance - b.distance);
        if (neighbors.length > k) neighbors.pop();
      }

      // Determine which subtree to search first
      const diff = query[axis] - node.point[axis];
      const first = diff <= 0 ? node.left : node.right;
      const second = diff <= 0 ? node.right : node.left;

      // Search the closer subtree first
      searchTree(first);

      // Check if we need to search the other subtree
      if (neighbors.length < k || Math.abs(diff) < neighbors[neighbors.length - 1].distance) {
        searchTree(second);
      }
    };

    searchTree(this.root);
    return neighbors;
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @private
   * @param {number[]} a - The first vector.
   * @param {number[]} b - The second vector.
   * @returns {number} - The Euclidean distance.
   */
  _euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
  }
}

/**
 * Creates a KDTree instance from a dataset.
 * @param {number[][]} embeddings - Array of vectors (embeddings) to index.
 * @returns {KDTree} - A KDTree instance for fast semantic search.
 */
export function createKDTree(embeddings) {
  return new KDTree(embeddings);
}

/**
 * Searches for the k nearest neighbors of a query vector in a KDTree.
 * @param {KDTree} tree - The KDTree instance.
 * @param {number[]} query - The query vector.
 * @param {number} k - The number of nearest neighbors to find.
 * @returns {Array<{index: number, distance: number}>} - Array of nearest neighbors with their indices and distances.
 */
export function searchKDTree(tree, query, k) {
  return tree.search(query, k);
}