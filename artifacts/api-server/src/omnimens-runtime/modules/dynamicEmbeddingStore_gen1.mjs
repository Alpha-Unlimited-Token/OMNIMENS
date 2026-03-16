/**
 * @module dynamicEmbeddingStore
 * @description Implements an in-memory vector similarity search using HNSW for fast nearest-neighbor searches.
 */

/**
 * Node.js built-in modules (if needed)
 */

/**
 * @class HNSWGraph
 * @description Hierarchical Navigable Small World (HNSW) graph implementation for fast vector similarity search.
 */
class HNSWGraph {
  constructor(maxNodes = 1000, maxEdges = 16, distanceFunction = HNSWGraph.euclideanDistance) {
    this.maxNodes = maxNodes; // Maximum number of nodes in the graph
    this.maxEdges = maxEdges; // Maximum number of edges per node
    this.distanceFunction = distanceFunction; // Distance function for similarity
    this.nodes = []; // Array to store nodes (embeddings)
    this.edges = new Map(); // Map to store edges between nodes
  }

  /**
   * @typedef {number[]} Vector
   * @description A vector representing an embedding.
   */

  /**
   * @method addNode
   * @description Adds a new node (embedding) to the graph.
   * @param {Vector} embedding - The embedding vector to add.
   * @throws {Error} If the graph exceeds the maximum node limit.
   */
  addNode(embedding) {
    if (this.nodes.length >= this.maxNodes) {
      throw new Error('Maximum node limit reached');
    }

    const nodeIndex = this.nodes.length;
    this.nodes.push(embedding);
    this.edges.set(nodeIndex, []);

    if (this.nodes.length > 1) {
      this._connectNode(nodeIndex);
    }
  }

  /**
   * @method _connectNode
   * @description Connects a new node to existing nodes based on similarity.
   * @private
   * @param {number} nodeIndex - Index of the new node.
   */
  _connectNode(nodeIndex) {
    const distances = this.nodes.map((node, index) => {
      if (index === nodeIndex) return Infinity;
      return { index, distance: this.distanceFunction(this.nodes[nodeIndex], node) };
    });

    distances.sort((a, b) => a.distance - b.distance);

    const neighbors = distances.slice(0, this.maxEdges);
    this.edges.set(nodeIndex, neighbors.map(n => n.index));

    for (const neighbor of neighbors) {
      const neighborEdges = this.edges.get(neighbor.index);
      if (neighborEdges.length < this.maxEdges) {
        neighborEdges.push(nodeIndex);
      }
    }
  }

  /**
   * @method search
   * @description Searches for the nearest neighbors to a given embedding.
   * @param {Vector} query - The query embedding.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{index: number, distance: number}>} - List of nearest neighbors.
   */
  search(query, k = 1) {
    const distances = this.nodes.map((node, index) => {
      return { index, distance: this.distanceFunction(query, node) };
    });

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
  }

  /**
   * @method euclideanDistance
   * @description Calculates the Euclidean distance between two vectors.
   * @param {Vector} a - First vector.
   * @param {Vector} b - Second vector.
   * @returns {number} - Euclidean distance.
   */
  static euclideanDistance(a, b) {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimensions');
    }

    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }
}

/**
 * @function createHNSWGraph
 * @description Factory function to create a new HNSWGraph instance.
 * @param {number} [maxNodes=1000] - Maximum number of nodes.
 * @param {number} [maxEdges=16] - Maximum number of edges per node.
 * @param {Function} [distanceFunction=HNSWGraph.euclideanDistance] - Distance function for similarity.
 * @returns {HNSWGraph} - New HNSWGraph instance.
 */
export function createHNSWGraph(maxNodes = 1000, maxEdges = 16, distanceFunction = HNSWGraph.euclideanDistance) {
  return new HNSWGraph(maxNodes, maxEdges, distanceFunction);
}

/**
 * @function testModule
 * @description Example usage of the dynamicEmbeddingStore module.
 */
export function testModule() {
  const graph = createHNSWGraph(100, 5);

  graph.addNode([1, 2, 3]);
  graph.addNode([4, 5, 6]);
  graph.addNode([7, 8, 9]);

  const neighbors = graph.search([2, 3, 4], 2);
  console.log('Nearest neighbors:', neighbors);
}