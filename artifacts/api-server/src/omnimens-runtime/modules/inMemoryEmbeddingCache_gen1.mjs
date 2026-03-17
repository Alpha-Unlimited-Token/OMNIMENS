/**
 * @module inMemoryEmbeddingCache
 * @description A high-performance in-memory embedding cache for storing, retrieving, and performing similarity searches on vector embeddings.
 * Implements a simplified HNSW (Hierarchical Navigable Small World) graph for fast nearest-neighbor search.
 */

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class HNSWNode {
  /**
   * @param {number[]} vector - The vector embedding for this node.
   * @param {any} data - The associated data for this node.
   */
  constructor(vector, data) {
    this.vector = vector;
    this.data = data;
    this.neighbors = []; // List of neighboring nodes
  }
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The Euclidean distance.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + (val - vectorB[i]) ** 2, 0));
}

/**
 * HNSW-based in-memory embedding cache.
 * @class
 */
class InMemoryEmbeddingCache {
  constructor() {
    this.nodes = []; // All nodes in the graph
  }

  /**
   * Adds a new embedding to the cache.
   * @param {number[]} vector - The vector embedding to add.
   * @param {any} data - Associated data for the embedding.
   */
  add(vector, data) {
    const newNode = new HNSWNode(vector, data);

    // Connect to nearest neighbors
    if (this.nodes.length > 0) {
      const neighbors = this._findNearestNeighbors(vector, 5); // Find up to 5 nearest neighbors
      newNode.neighbors = neighbors;
      neighbors.forEach((neighbor) => neighbor.neighbors.push(newNode));
    }

    this.nodes.push(newNode);
  }

  /**
   * Finds the most similar embeddings to a given query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {Array<{vector: number[], data: any, distance: number}>} - The k nearest neighbors.
   */
  search(queryVector, k) {
    const visited = new Set();
    const candidates = [...this.nodes];
    const results = [];

    while (candidates.length > 0) {
      const node = candidates.pop();
      if (visited.has(node)) continue;
      visited.add(node);

      const distance = euclideanDistance(queryVector, node.vector);
      results.push({ vector: node.vector, data: node.data, distance });
      results.sort((a, b) => a.distance - b.distance);

      if (results.length > k) {
        results.pop(); // Keep only the top k results
      }

      candidates.push(...node.neighbors);
    }

    return results;
  }

  /**
   * Finds the nearest neighbors to a given vector.
   * @private
   * @param {number[]} vector - The vector to search for.
   * @param {number} k - The number of neighbors to find.
   * @returns {HNSWNode[]} - The k nearest neighbors.
   */
  _findNearestNeighbors(vector, k) {
    return this.nodes
      .map((node) => ({ node, distance: euclideanDistance(vector, node.vector) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k)
      .map((entry) => entry.node);
  }
}

/**
 * Exports a factory function to create an instance of the embedding cache.
 * @returns {InMemoryEmbeddingCache} - A new instance of the embedding cache.
 */
export function createEmbeddingCache() {
  return new InMemoryEmbeddingCache();
}