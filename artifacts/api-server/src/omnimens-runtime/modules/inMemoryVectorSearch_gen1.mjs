// inMemoryVectorSearch.js

/**
 * @module inMemoryVectorSearch
 * @description This module provides an in-memory vector similarity search using the HNSW (Hierarchical Navigable Small World) graph algorithm.
 * It enables fast approximate nearest neighbor search for embeddings, designed to be efficient and scalable for AI-related tasks.
 */

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class HNSWNode {
  /**
   * @param {number[]} vector - The embedding vector associated with this node.
   * @param {number} id - A unique identifier for the node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = new Map(); // Stores neighbors and their distances
  }
}

/**
 * HNSW Graph implementation for approximate nearest neighbor search.
 * @class
 */
class HNSWGraph {
  /**
   * @param {number} maxNeighbors - Maximum number of neighbors per node.
   */
  constructor(maxNeighbors = 10) {
    this.nodes = new Map(); // Stores nodes by their IDs
    this.maxNeighbors = maxNeighbors;
  }

  /**
   * Adds a vector to the graph.
   * @param {number[]} vector - The embedding vector to add.
   * @param {number} id - Unique identifier for the vector.
   */
  addVector(vector, id) {
    const newNode = new HNSWNode(vector, id);
    this.nodes.set(id, newNode);

    // Connect to nearest neighbors
    const nearestNeighbors = this.findNearestNeighbors(vector, this.maxNeighbors);
    for (const neighbor of nearestNeighbors) {
      const distance = this.calculateDistance(vector, neighbor.vector);
      newNode.neighbors.set(neighbor.id, distance);
      neighbor.neighbors.set(id, distance);
    }
  }

  /**
   * Finds the nearest neighbors for a given vector.
   * @param {number[]} vector - The vector to search for.
   * @param {number} k - Number of nearest neighbors to find.
   * @returns {HNSWNode[]} Array of nearest neighbor nodes.
   */
  findNearestNeighbors(vector, k) {
    const distances = [];

    for (const node of this.nodes.values()) {
      const distance = this.calculateDistance(vector, node.vector);
      distances.push({ node, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k).map(entry => entry.node);
  }

  /**
   * Searches for the nearest neighbors of a query vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{ id: number, distance: number }>} Array of nearest neighbors with their IDs and distances.
   */
  search(queryVector, k) {
    const nearestNeighbors = this.findNearestNeighbors(queryVector, k);
    return nearestNeighbors.map(neighbor => ({
      id: neighbor.id,
      distance: this.calculateDistance(queryVector, neighbor.vector)
    }));
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @param {number[]} vectorA - The first vector.
   * @param {number[]} vectorB - The second vector.
   * @returns {number} The Euclidean distance.
   */
  calculateDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error("Vectors must be of the same dimension.");
    }

    return Math.sqrt(vectorA.reduce((sum, value, index) => {
      const diff = value - vectorB[index];
      return sum + diff * diff;
    }, 0));
  }
}

/**
 * Exports the HNSWGraph class.
 * @type {HNSWGraph}
 */
export { HNSWGraph };