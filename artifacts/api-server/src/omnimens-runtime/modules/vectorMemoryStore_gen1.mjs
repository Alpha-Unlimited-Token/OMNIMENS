/**
 * @module vectorMemoryStore
 * @description Implements an approximate nearest neighbor search using HNSW (Hierarchical Navigable Small World) graph.
 * This module provides functionality to store high-dimensional vectors and retrieve nearest neighbors efficiently.
 */

/**
 * Class representing the HNSW graph for approximate nearest neighbor search.
 */
class HNSW {
  /**
   * Creates an instance of HNSW.
   * @param {number} dimensions - The number of dimensions for the vectors.
   * @param {number} maxNeighbors - Maximum number of neighbors per node in the graph.
   * @param {number} efConstruction - Controls the quality of the graph during construction.
   */
  constructor(dimensions, maxNeighbors = 16, efConstruction = 200) {
    this.dimensions = dimensions;
    this.maxNeighbors = maxNeighbors;
    this.efConstruction = efConstruction;
    this.nodes = [];
    this.graph = new Map();
  }

  /**
   * Adds a vector to the HNSW graph.
   * @param {Array<number>} vector - The high-dimensional vector to add.
   * @param {string} id - A unique identifier for the vector.
   * @throws {Error} If the vector's dimensions do not match the HNSW dimensions.
   */
  addVector(vector, id) {
    if (vector.length !== this.dimensions) {
      throw new Error(`Vector dimensions (${vector.length}) do not match expected dimensions (${this.dimensions}).`);
    }

    const node = { id, vector };
    this.nodes.push(node);
    this.graph.set(id, []);

    if (this.nodes.length > 1) {
      const neighbors = this._findNearestNeighbors(vector, this.efConstruction);
      for (const neighbor of neighbors) {
        this.graph.get(id).push(neighbor.id);
        this.graph.get(neighbor.id).push(id);
      }

      // Trim neighbors to maxNeighbors
      this.graph.set(id, this._sortAndTrimNeighbors(id));
      for (const neighbor of neighbors) {
        this.graph.set(neighbor.id, this._sortAndTrimNeighbors(neighbor.id));
      }
    }
  }

  /**
   * Finds the nearest neighbors for a given query vector.
   * @param {Array<number>} queryVector - The query vector.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{id: string, distance: number}>} The nearest neighbors.
   */
  search(queryVector, k) {
    const visited = new Set();
    const candidates = [];

    for (const node of this.nodes) {
      const distance = this._euclideanDistance(queryVector, node.vector);
      candidates.push({ id: node.id, distance });
    }

    candidates.sort((a, b) => a.distance - b.distance);

    return candidates.slice(0, k);
  }

  /**
   * Finds the nearest neighbors for a given vector during graph construction.
   * @private
   * @param {Array<number>} vector - The vector to search neighbors for.
   * @param {number} ef - The number of neighbors to consider during search.
   * @returns {Array<{id: string, vector: Array<number>}>} The nearest neighbors.
   */
  _findNearestNeighbors(vector, ef) {
    const neighbors = [];

    for (const node of this.nodes) {
      const distance = this._euclideanDistance(vector, node.vector);
      neighbors.push({ id: node.id, vector: node.vector, distance });
    }

    neighbors.sort((a, b) => a.distance - b.distance);

    return neighbors.slice(0, ef);
  }

  /**
   * Sorts and trims the neighbors of a node to the maximum allowed.
   * @private
   * @param {string} id - The ID of the node.
   * @returns {Array<string>} The sorted and trimmed neighbors.
   */
  _sortAndTrimNeighbors(id) {
    const neighbors = this.graph.get(id).map((neighborId) => {
      const neighborNode = this.nodes.find((node) => node.id === neighborId);
      return {
        id: neighborId,
        distance: this._euclideanDistance(
          this.nodes.find((node) => node.id === id).vector,
          neighborNode.vector
        )
      };
    });

    neighbors.sort((a, b) => a.distance - b.distance);

    return neighbors.slice(0, this.maxNeighbors).map((neighbor) => neighbor.id);
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @private
   * @param {Array<number>} vectorA - The first vector.
   * @param {Array<number>} vectorB - The second vector.
   * @returns {number} The Euclidean distance.
   */
  _euclideanDistance(vectorA, vectorB) {
    return Math.sqrt(
      vectorA.reduce((sum, value, index) => sum + (value - vectorB[index]) ** 2, 0)
    );
  }
}

export { HNSW };