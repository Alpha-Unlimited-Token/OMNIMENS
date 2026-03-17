/**
 * @module embeddingCacheManager
 * @description This module implements an embedding cache manager using the HNSW (Hierarchical Navigable Small World) algorithm
 *              for efficient approximate nearest neighbor search. It is designed to store and retrieve high-dimensional
 *              embeddings for semantic similarity tasks in a performant manner.
 * @author OMNIMENS
 */

/**
 * Node.js built-in module imports (none required for this implementation).
 */

/**
 * Class representing a node in the HNSW graph.
 */
class HNSWNode {
  /**
   * @param {Array<number>} vector - The high-dimensional embedding vector.
   * @param {string} id - Unique identifier for the node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.connections = new Map(); // Maps layer index to connected nodes
  }
}

/**
 * Class implementing the HNSW algorithm for approximate nearest neighbor search.
 */
class HNSW {
  /**
   * @param {number} maxConnections - Maximum number of connections per layer.
   * @param {number} efConstruction - Controls the trade-off between accuracy and speed during construction.
   */
  constructor(maxConnections = 16, efConstruction = 200) {
    this.maxConnections = maxConnections;
    this.efConstruction = efConstruction;
    this.nodes = []; // All nodes in the graph
    this.entryPoint = null; // Entry point for the graph traversal
  }

  /**
   * Computes the Euclidean distance between two vectors.
   * @param {Array<number>} vec1 - First vector.
   * @param {Array<number>} vec2 - Second vector.
   * @returns {number} - The Euclidean distance.
   */
  static euclideanDistance(vec1, vec2) {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same dimensions');
    }
    return Math.sqrt(vec1.reduce((sum, val, i) => sum + (val - vec2[i]) ** 2, 0));
  }

  /**
   * Adds a new node to the HNSW graph.
   * @param {Array<number>} vector - The high-dimensional embedding vector.
   * @param {string} id - Unique identifier for the node.
   */
  addNode(vector, id) {
    const newNode = new HNSWNode(vector, id);

    if (this.nodes.length === 0) {
      this.entryPoint = newNode;
    } else {
      this._connectNode(newNode);
    }

    this.nodes.push(newNode);
  }

  /**
   * Connects a new node to the graph using the HNSW algorithm.
   * @param {HNSWNode} newNode - The new node to connect.
   * @private
   */
  _connectNode(newNode) {
    const neighbors = this._searchLayer(newNode.vector, this.entryPoint, this.efConstruction);

    neighbors.forEach((neighbor) => {
      this._linkNodes(newNode, neighbor);
    });
  }

  /**
   * Links two nodes together.
   * @param {HNSWNode} node1 - First node.
   * @param {HNSWNode} node2 - Second node.
   * @private
   */
  _linkNodes(node1, node2) {
    const layer = 0; // Single-layer implementation for simplicity

    if (!node1.connections.has(layer)) {
      node1.connections.set(layer, []);
    }
    if (!node2.connections.has(layer)) {
      node2.connections.set(layer, []);
    }

    node1.connections.get(layer).push(node2);
    node2.connections.get(layer).push(node1);

    // Ensure max connections per node
    this._pruneConnections(node1, layer);
    this._pruneConnections(node2, layer);
  }

  /**
   * Prunes connections to maintain the maximum number of connections.
   * @param {HNSWNode} node - The node whose connections are pruned.
   * @param {number} layer - The layer index.
   * @private
   */
  _pruneConnections(node, layer) {
    const connections = node.connections.get(layer);
    if (connections.length > this.maxConnections) {
      connections.sort((a, b) => HNSW.euclideanDistance(node.vector, a.vector) - HNSW.euclideanDistance(node.vector, b.vector));
      node.connections.set(layer, connections.slice(0, this.maxConnections));
    }
  }

  /**
   * Searches the graph layer for nearest neighbors.
   * @param {Array<number>} queryVector - The query vector.
   * @param {HNSWNode} entryPoint - The starting point for the search.
   * @param {number} ef - The size of the candidate list.
   * @returns {Array<HNSWNode>} - The nearest neighbors.
   * @private
   */
  _searchLayer(queryVector, entryPoint, ef) {
    const visited = new Set();
    const candidates = [entryPoint];
    const results = [];

    while (candidates.length > 0) {
      const current = candidates.pop();
      if (visited.has(current)) continue;
      visited.add(current);

      results.push(current);
      results.sort((a, b) => HNSW.euclideanDistance(queryVector, a.vector) - HNSW.euclideanDistance(queryVector, b.vector));

      if (results.length > ef) {
        results.pop();
      }

      const neighbors = current.connections.get(0) || [];
      neighbors.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          candidates.push(neighbor);
        }
      });
    }

    return results;
  }

  /**
   * Searches for the nearest neighbors of a query vector.
   * @param {Array<number>} queryVector - The query vector.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {Array<{id: string, distance: number}>} - The nearest neighbors with their distances.
   */
  search(queryVector, k) {
    if (!this.entryPoint) {
      throw new Error('Graph is empty');
    }

    const neighbors = this._searchLayer(queryVector, this.entryPoint, this.efConstruction);
    return neighbors
      .slice(0, k)
      .map((neighbor) => ({ id: neighbor.id, distance: HNSW.euclideanDistance(queryVector, neighbor.vector) }));
  }
}

/**
 * Exports the HNSW class for external use.
 */
export { HNSW };