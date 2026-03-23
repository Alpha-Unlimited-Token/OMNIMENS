/**
 * @module inMemoryEmbeddingStore
 * @description Provides an in-memory store for embeddings with efficient similarity search using a k-d tree algorithm.
 */

/**
 * Represents a node in the k-d tree.
 * @class KDTreeNode
 */
class KDTreeNode {
  /**
   * @param {Array<number>} point - The embedding vector.
   * @param {number} index - The index of the embedding in the original dataset.
   * @param {number} depth - The depth of the node in the tree.
   */
  constructor(point, index, depth) {
    this.point = point;
    this.index = index;
    this.left = null;
    this.right = null;
    this.depth = depth;
  }
}

/**
 * Represents a k-d tree for storing and searching embeddings.
 * @class KDTree
 */
class KDTree {
  /**
   * @param {Array<Array<number>>} embeddings - Array of embedding vectors.
   */
  constructor(embeddings) {
    this.root = this.buildTree(embeddings.map((point, index) => ({ point, index })), 0);
  }

  /**
   * Builds the k-d tree recursively.
   * @private
   * @param {Array<{point: Array<number>, index: number}>} points - Array of points with their indices.
   * @param {number} depth - Current depth in the tree.
   * @returns {KDTreeNode|null} - The root node of the subtree.
   */
  buildTree(points, depth) {
    if (points.length === 0) return null;

    const axis = depth % points[0].point.length;
    points.sort((a, b) => a.point[axis] - b.point[axis]);
    const median = Math.floor(points.length / 2);

    const node = new KDTreeNode(points[median].point, points[median].index, depth);
    node.left = this.buildTree(points.slice(0, median), depth + 1);
    node.right = this.buildTree(points.slice(median + 1), depth + 1);

    return node;
  }

  /**
   * Finds the k nearest neighbors to a given query point.
   * @param {Array<number>} queryPoint - The query embedding vector.
   * @param {number} k - The number of nearest neighbors to find.
   * @returns {Array<{index: number, distance: number}>} - Array of nearest neighbors with their indices and distances.
   */
  findKNearestNeighbors(queryPoint, k) {
    const neighbors = [];

    const searchTree = (node) => {
      if (!node) return;

      const axis = node.depth % queryPoint.length;
      const distance = this.euclideanDistance(queryPoint, node.point);

      if (neighbors.length < k) {
        neighbors.push({ index: node.index, distance });
        neighbors.sort((a, b) => a.distance - b.distance);
      } else if (distance < neighbors[neighbors.length - 1].distance) {
        neighbors[neighbors.length - 1] = { index: node.index, distance };
        neighbors.sort((a, b) => a.distance - b.distance);
      }

      const diff = queryPoint[axis] - node.point[axis];
      const primary = diff < 0 ? node.left : node.right;
      const secondary = diff < 0 ? node.right : node.left;

      searchTree(primary);
      if (neighbors.length < k || Math.abs(diff) < neighbors[neighbors.length - 1].distance) {
        searchTree(secondary);
      }
    };

    searchTree(this.root);
    return neighbors;
  }

  /**
   * Calculates the Euclidean distance between two points.
   * @private
   * @param {Array<number>} pointA - The first point.
   * @param {Array<number>} pointB - The second point.
   * @returns {number} - The Euclidean distance.
   */
  euclideanDistance(pointA, pointB) {
    return Math.sqrt(pointA.reduce((sum, val, i) => sum + (val - pointB[i]) ** 2, 0));
  }
}

/**
 * Creates a new in-memory embedding store.
 * @param {Array<Array<number>>} embeddings - Array of embedding vectors.
 * @returns {KDTree} - A k-d tree instance for similarity search.
 */
export function createEmbeddingStore(embeddings) {
  return new KDTree(embeddings);
}

/**
 * Searches for the k nearest neighbors to a query embedding.
 * @param {KDTree} embeddingStore - The in-memory embedding store.
 * @param {Array<number>} queryEmbedding - The query embedding vector.
 * @param {number} k - The number of nearest neighbors to find.
 * @returns {Array<{index: number, distance: number}>} - Array of nearest neighbors with their indices and distances.
 */
export function searchKNearestNeighbors(embeddingStore, queryEmbedding, k) {
  return embeddingStore.findKNearestNeighbors(queryEmbedding, k);
}