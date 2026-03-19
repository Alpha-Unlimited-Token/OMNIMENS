/**
 * @module vectorMemoryStore
 * @description Provides a utility for fast embedding retrieval and similarity search using HNSW (Hierarchical Navigable Small World) algorithm.
 */

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class HNSWNode {
  constructor(vector, id) {
    this.vector = vector; // The embedding vector
    this.id = id; // Unique identifier for the node
    this.neighbors = []; // List of neighboring nodes
  }
}

/**
 * A utility class for managing and querying a vector memory store using HNSW.
 * @class
 */
class VectorMemoryStore {
  constructor(maxNeighbors = 16) {
    this.nodes = []; // All nodes in the graph
    this.maxNeighbors = maxNeighbors; // Maximum neighbors per node
  }

  /**
   * Adds a new vector to the memory store.
   * @param {number[]} vector - The embedding vector to be added.
   * @param {string} id - A unique identifier for the vector.
   */
  addVector(vector, id) {
    if (!Array.isArray(vector) || vector.length === 0) {
      throw new Error("Vector must be a non-empty array of numbers.");
    }
    const newNode = new HNSWNode(vector, id);
    if (this.nodes.length === 0) {
      this.nodes.push(newNode);
      return;
    }
    this._connectNode(newNode);
    this.nodes.push(newNode);
  }

  /**
   * Finds the nearest neighbors for a given query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{id: string, distance: number}>} The nearest neighbors with their distances.
   */
  findNearestNeighbors(queryVector, k) {
    if (!Array.isArray(queryVector) || queryVector.length === 0) {
      throw new Error("Query vector must be a non-empty array of numbers.");
    }
    if (k <= 0) {
      throw new Error("Number of neighbors to retrieve must be greater than 0.");
    }
    const distances = this.nodes.map(node => ({
      id: node.id,
      distance: this._euclideanDistance(queryVector, node.vector)
    }));
    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k);
  }

  /**
   * Connects a new node to its nearest neighbors in the graph.
   * @private
   * @param {HNSWNode} newNode - The new node to connect.
   */
  _connectNode(newNode) {
    const distances = this.nodes.map(node => ({
      node,
      distance: this._euclideanDistance(newNode.vector, node.vector)
    }));
    distances.sort((a, b) => a.distance - b.distance);
    const neighbors = distances.slice(0, this.maxNeighbors).map(d => d.node);
    newNode.neighbors = neighbors;
    for (const neighbor of neighbors) {
      if (neighbor.neighbors.length < this.maxNeighbors) {
        neighbor.neighbors.push(newNode);
      }
    }
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @private
   * @param {number[]} vectorA - The first vector.
   * @param {number[]} vectorB - The second vector.
   * @returns {number} The Euclidean distance between the two vectors.
   */
  _euclideanDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error("Vectors must have the same dimensions.");
    }
    return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
  }
}

/**
 * Exports the VectorMemoryStore class for external usage.
 */
export { VectorMemoryStore };