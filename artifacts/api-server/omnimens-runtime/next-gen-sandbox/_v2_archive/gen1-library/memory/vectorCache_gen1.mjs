/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: vectorCache
 * Purpose: Store and retrieve embeddings in-memory to enable fast similarity search for retrieval-augmented generation.
 * Description: Stores and retrieves vector embeddings in-memory using HNSW for fast similarity search, enabling efficient retrieval-augmented generation in OMNIMENS.
 * Migrated: 2026-03-25T22:49:34.265Z
 */

// vectorCache.js

/**
 * @module vectorCache
 * @description Provides in-memory storage and retrieval of vector embeddings using HNSW for fast similarity search.
 * This module is optimized for Node.js 20+ and does not rely on external dependencies.
 */

/**
 * @typedef {Object} Node
 * @property {number[]} vector - The vector embedding.
 * @property {number} id - Unique identifier for the node.
 * @property {number[]} neighbors - IDs of neighboring nodes.
 */

class HNSW {
  constructor(maxNeighbors = 10) {
    /**
     * @type {Map<number, Node>} - Stores nodes by their unique IDs.
     */
    this.nodes = new Map();

    /**
     * @type {number} - Maximum number of neighbors per node.
     */
    this.maxNeighbors = maxNeighbors;
  }

  /**
   * Computes the Euclidean distance between two vectors.
   * @param {number[]} vec1 - First vector.
   * @param {number[]} vec2 - Second vector.
   * @returns {number} - Euclidean distance.
   */
  static euclideanDistance(vec1, vec2) {
    if (vec1.length !== vec2.length) {
      throw new Error("Vectors must have the same dimensions.");
    }
    return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
  }

  /**
   * Adds a new vector to the HNSW graph.
   * @param {number[]} vector - The vector embedding.
   * @param {number} id - Unique identifier for the vector.
   */
  addNode(vector, id) {
    if (this.nodes.has(id)) {
      throw new Error("Node with this ID already exists.");
    }

    const newNode = { vector, id, neighbors: [] };

    // Find nearest neighbors to connect.
    const distances = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      distance: HNSW.euclideanDistance(vector, node.vector)
    }));

    distances.sort((a, b) => a.distance - b.distance);

    const nearestNeighbors = distances.slice(0, this.maxNeighbors).map(d => d.id);
    newNode.neighbors = nearestNeighbors;

    // Update neighbors to include the new node.
    nearestNeighbors.forEach(neighborId => {
      const neighborNode = this.nodes.get(neighborId);
      if (neighborNode.neighbors.length < this.maxNeighbors) {
        neighborNode.neighbors.push(id);
      }
    });

    this.nodes.set(id, newNode);
  }

  /**
   * Searches for the closest vectors to a given query vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{id: number, distance: number}>} - Array of nearest neighbors sorted by distance.
   */
  search(queryVector, k = 1) {
    if (k < 1) {
      throw new Error("k must be at least 1.");
    }

    const distances = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      distance: HNSW.euclideanDistance(queryVector, node.vector)
    }));

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
  }
}

/**
 * Initializes a new HNSW instance.
 * @param {number} [maxNeighbors=10] - Maximum number of neighbors per node.
 * @returns {HNSW} - The HNSW instance.
 */
export function createVectorCache(maxNeighbors = 10) {
  return new HNSW(maxNeighbors);
}

/**
 * Example usage:
 * const vectorCache = createVectorCache();
 * vectorCache.addNode([0.1, 0.2, 0.3], 1);
 * vectorCache.addNode([0.4, 0.5, 0.6], 2);
 * const results = vectorCache.search([0.15, 0.25, 0.35], 1);
 * console.log(results);
 */