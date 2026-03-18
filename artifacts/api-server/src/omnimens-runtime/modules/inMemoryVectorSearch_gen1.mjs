/**
 * @module inMemoryVectorSearch
 * @description A utility module for fast similarity search using in-memory vector store with HNSW graph implementation.
 */

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class HNSWNode {
  /**
   * @constructor
   * @param {number[]} vector - The embedding vector for the node.
   * @param {number} id - Unique identifier for the node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.connections = new Map(); // Stores connections by layer
  }
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimensions.");
  }
  return Math.sqrt(vectorA.reduce((sum, value, index) => sum + Math.pow(value - vectorB[index], 2), 0));
}

/**
 * HNSW Graph for approximate nearest neighbor search.
 * @class
 */
class HNSWGraph {
  /**
   * @constructor
   * @param {number} maxConnections - Maximum connections per node per layer.
   * @param {number} maxLayers - Maximum number of layers in the graph.
   */
  constructor(maxConnections = 16, maxLayers = 5) {
    this.maxConnections = maxConnections;
    this.maxLayers = maxLayers;
    this.nodes = new Map(); // Store all nodes by ID
    this.entryNode = null; // Entry point for search
  }

  /**
   * Adds a new vector to the graph.
   * @param {number[]} vector - The embedding vector.
   * @param {number} id - Unique identifier for the vector.
   */
  addNode(vector, id) {
    const newNode = new HNSWNode(vector, id);
    this.nodes.set(id, newNode);

    if (!this.entryNode) {
      this.entryNode = newNode; // First node becomes the entry point
      return;
    }

    this._linkNode(newNode);
  }

  /**
   * Links a new node to existing nodes in the graph.
   * @private
   * @param {HNSWNode} newNode - The node to link.
   */
  _linkNode(newNode) {
    let currentNode = this.entryNode;

    for (let layer = this.maxLayers - 1; layer >= 0; layer--) {
      const nearestNeighbors = this._searchLayer(newNode.vector, currentNode, layer, this.maxConnections);

      for (const neighbor of nearestNeighbors) {
        this._connectNodes(newNode, neighbor, layer);
      }

      currentNode = nearestNeighbors[0]; // Move to the closest neighbor
    }
  }

  /**
   * Connects two nodes in the graph at a specific layer.
   * @private
   * @param {HNSWNode} nodeA - First node.
   * @param {HNSWNode} nodeB - Second node.
   * @param {number} layer - Layer index.
   */
  _connectNodes(nodeA, nodeB, layer) {
    if (!nodeA.connections.has(layer)) {
      nodeA.connections.set(layer, []);
    }
    if (!nodeB.connections.has(layer)) {
      nodeB.connections.set(layer, []);
    }

    nodeA.connections.get(layer).push(nodeB);
    nodeB.connections.get(layer).push(nodeA);
  }

  /**
   * Searches for nearest neighbors in a specific layer.
   * @private
   * @param {number[]} targetVector - The vector to search for.
   * @param {HNSWNode} entryNode - Entry point for the search.
   * @param {number} layer - Layer index.
   * @param {number} k - Number of neighbors to return.
   * @returns {HNSWNode[]} - Nearest neighbors.
   */
  _searchLayer(targetVector, entryNode, layer, k) {
    const visited = new Set();
    const candidates = [{ node: entryNode, distance: euclideanDistance(targetVector, entryNode.vector) }];

    while (candidates.length > 0) {
      const candidate = candidates.pop();
      visited.add(candidate.node.id);

      const neighbors = candidate.node.connections.get(layer) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          const distance = euclideanDistance(targetVector, neighbor.vector);
          candidates.push({ node: neighbor, distance });
        }
      }

      candidates.sort((a, b) => a.distance - b.distance);
    }

    return candidates.slice(0, k).map(candidate => candidate.node);
  }

  /**
   * Searches for the nearest neighbors to a given vector.
   * @param {number[]} vector - The vector to search for.
   * @param {number} k - Number of neighbors to return.
   * @returns {HNSWNode[]} - Nearest neighbors.
   */
  search(vector, k = 1) {
    if (!this.entryNode) {
      throw new Error("Graph is empty.");
    }
    return this._searchLayer(vector, this.entryNode, this.maxLayers - 1, k);
  }
}

/**
 * Exports the HNSWGraph class and utility functions.
 */
export { HNSWGraph, euclideanDistance };