/**
 * @module vectorSearchEngine
 * @description A JavaScript ES module for efficient approximate nearest-neighbor searches using the HNSW (Hierarchical Navigable Small World) algorithm.
 */

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class HNSWNode {
  /**
   * @param {number[]} vector - The embedding vector for this node.
   * @param {number} id - A unique identifier for the node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.connections = new Map(); // Level -> Array of connected nodes
  }
}

/**
 * HNSW Graph implementation for approximate nearest-neighbor search.
 * @class
 */
class HNSW {
  /**
   * @param {number} maxNeighbors - Maximum number of neighbors per level.
   * @param {number} efConstruction - Controls the quality of the graph during construction.
   */
  constructor(maxNeighbors = 16, efConstruction = 200) {
    this.maxNeighbors = maxNeighbors;
    this.efConstruction = efConstruction;
    this.nodes = []; // Array of all nodes in the graph
    this.entryPoint = null; // Entry point for search
  }

  /**
   * Adds a new vector to the graph.
   * @param {number[]} vector - The embedding vector to add.
   * @returns {number} The ID of the newly added vector.
   */
  add(vector) {
    const id = this.nodes.length;
    const newNode = new HNSWNode(vector, id);
    this.nodes.push(newNode);

    if (this.entryPoint === null) {
      this.entryPoint = newNode;
      return id;
    }

    let current = this.entryPoint;

    // Greedy search to find the closest node to the new vector
    while (true) {
      const neighbors = current.connections.get(0) || [];
      let closest = current;
      let closestDistance = this._distance(vector, current.vector);

      for (const neighbor of neighbors) {
        const dist = this._distance(vector, neighbor.vector);
        if (dist < closestDistance) {
          closest = neighbor;
          closestDistance = dist;
        }
      }

      if (closest === current) break;
      current = closest;
    }

    // Connect the new node to the graph
    this._connect(newNode, current);
    return id;
  }

  /**
   * Searches for the nearest neighbors to a given vector.
   * @param {number[]} vector - The query vector.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {Array<{id: number, distance: number}>} The nearest neighbors and their distances.
   */
  search(vector, k) {
    if (this.entryPoint === null) return [];

    const visited = new Set();
    const candidates = [{ node: this.entryPoint, distance: this._distance(vector, this.entryPoint.vector) }];
    const results = [];

    while (candidates.length > 0) {
      candidates.sort((a, b) => a.distance - b.distance);
      const { node, distance } = candidates.shift();

      if (visited.has(node.id)) continue;
      visited.add(node.id);

      results.push({ id: node.id, distance });
      if (results.length > k) results.pop();

      const neighbors = node.connections.get(0) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          candidates.push({ node: neighbor, distance: this._distance(vector, neighbor.vector) });
        }
      }
    }

    return results;
  }

  /**
   * Computes the Euclidean distance between two vectors.
   * @private
   * @param {number[]} a - The first vector.
   * @param {number[]} b - The second vector.
   * @returns {number} The Euclidean distance.
   */
  _distance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
  }

  /**
   * Connects a new node to the graph.
   * @private
   * @param {HNSWNode} newNode - The new node to connect.
   * @param {HNSWNode} entryNode - The entry node to start connections from.
   */
  _connect(newNode, entryNode) {
    const neighbors = entryNode.connections.get(0) || [];
    neighbors.push(newNode);
    neighbors.sort((a, b) => this._distance(newNode.vector, a.vector) - this._distance(newNode.vector, b.vector));

    if (neighbors.length > this.maxNeighbors) {
      neighbors.pop();
    }

    entryNode.connections.set(0, neighbors);
    newNode.connections.set(0, [entryNode]);
  }
}

/**
 * Creates a new HNSW graph instance.
 * @param {number} maxNeighbors - Maximum neighbors per level.
 * @param {number} efConstruction - Graph construction quality parameter.
 * @returns {HNSW} A new HNSW graph instance.
 */
export function createHNSW(maxNeighbors = 16, efConstruction = 200) {
  return new HNSW(maxNeighbors, efConstruction);
}