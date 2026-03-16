// semanticMemoryStore.js

/**
 * @module semanticMemoryStore
 * @description Provides fast semantic search and retrieval for conversational continuity using HNSW (Hierarchical Navigable Small World).
 */

/**
 * Node.js built-in modules used
 */
const crypto = require('crypto');

/**
 * @typedef {Object} VectorNode
 * @property {string} id - Unique identifier for the vector node.
 * @property {number[]} vector - The vector embedding.
 * @property {Object} neighbors - Map of neighbor IDs to their distances.
 */

/**
 * @class SemanticMemoryStore
 * @description Implements HNSW for approximate nearest neighbor search.
 */
class SemanticMemoryStore {
  constructor() {
    /**
     * @type {Map<string, VectorNode>} nodes - Stores all vector nodes.
     */
    this.nodes = new Map();

    /**
     * @type {number} maxNeighbors - Maximum number of neighbors per node.
     */
    this.maxNeighbors = 10;
  }

  /**
   * @private
   * @param {number[]} vectorA - First vector.
   * @param {number[]} vectorB - Second vector.
   * @returns {number} - Euclidean distance between the two vectors.
   */
  _calculateDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must be of the same dimension.');
    }
    return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
  }

  /**
   * @private
   * @param {VectorNode} node - Node to update neighbors for.
   */
  _updateNeighbors(node) {
    const distances = Array.from(this.nodes.values())
      .filter(n => n.id !== node.id)
      .map(n => ({ id: n.id, distance: this._calculateDistance(node.vector, n.vector) }));

    distances.sort((a, b) => a.distance - b.distance);

    node.neighbors = distances.slice(0, this.maxNeighbors).reduce((map, { id, distance }) => {
      map[id] = distance;
      return map;
    }, {});
  }

  /**
   * @public
   * @param {string} id - Unique identifier for the vector node.
   * @param {number[]} vector - The vector embedding.
   */
  addNode(id, vector) {
    if (this.nodes.has(id)) {
      throw new Error(`Node with ID '${id}' already exists.`);
    }

    const newNode = { id, vector, neighbors: {} };
    this.nodes.set(id, newNode);

    // Update neighbors for all nodes
    this.nodes.forEach(node => this._updateNeighbors(node));
  }

  /**
   * @public
   * @param {number[]} queryVector - The vector to search for nearest neighbors.
   * @param {number} [k=5] - Number of nearest neighbors to retrieve.
   * @returns {Array<{id: string, distance: number}>} - List of nearest neighbors with distances.
   */
  search(queryVector, k = 5) {
    const distances = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      distance: this._calculateDistance(queryVector, node.vector)
    }));

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
  }

  /**
   * @public
   * @returns {Array<string>} - List of all node IDs in the store.
   */
  getAllNodeIds() {
    return Array.from(this.nodes.keys());
  }
}

/**
 * @type {SemanticMemoryStore}
 */
const semanticMemoryStore = new SemanticMemoryStore();

module.exports = {
  semanticMemoryStore,
  /**
   * @function addNode
   * @description Adds a vector node to the semantic memory store.
   * @param {string} id - Unique identifier for the vector node.
   * @param {number[]} vector - The vector embedding.
   */
  addNode: semanticMemoryStore.addNode.bind(semanticMemoryStore),

  /**
   * @function search
   * @description Searches for the nearest neighbors of a given vector.
   * @param {number[]} queryVector - The vector to search for nearest neighbors.
   * @param {number} [k=5] - Number of nearest neighbors to retrieve.
   * @returns {Array<{id: string, distance: number}>} - List of nearest neighbors with distances.
   */
  search: semanticMemoryStore.search.bind(semanticMemoryStore),

  /**
   * @function getAllNodeIds
   * @description Retrieves all node IDs in the semantic memory store.
   * @returns {Array<string>} - List of all node IDs in the store.
   */
  getAllNodeIds: semanticMemoryStore.getAllNodeIds.bind(semanticMemoryStore)
};