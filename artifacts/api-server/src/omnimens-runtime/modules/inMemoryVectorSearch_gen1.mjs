/**
 * @module inMemoryVectorSearch
 * @description Provides fast in-memory semantic search for high-dimensional vector embeddings using the HNSW algorithm.
 */

/**
 * Node representing a point in the HNSW graph.
 * @class
 */
class HNSWNode {
  constructor(id, vector) {
    this.id = id;
    this.vector = vector;
    this.neighbors = []; // Neighbors in the graph
  }
}

/**
 * HNSW Graph for approximate nearest neighbor search.
 * @class
 */
class HNSW {
  constructor(maxNeighbors = 16, efSearch = 10) {
    this.nodes = []; // All nodes in the graph
    this.maxNeighbors = maxNeighbors; // Maximum neighbors per node
    this.efSearch = efSearch; // Search parameter controlling recall vs. speed
  }

  /**
   * Adds a vector to the graph.
   * @param {string} id - Unique identifier for the vector.
   * @param {number[]} vector - High-dimensional vector to add.
   */
  addVector(id, vector) {
    const newNode = new HNSWNode(id, vector);
    if (this.nodes.length === 0) {
      this.nodes.push(newNode);
      return;
    }

    // Find nearest neighbors for the new node
    const neighbors = this._search(vector, this.efSearch);

    // Connect the new node to its neighbors
    neighbors.forEach((neighbor) => {
      neighbor.neighbors.push(newNode);
      newNode.neighbors.push(neighbor);
    });

    // Trim neighbors to maxNeighbors
    newNode.neighbors = this._selectClosest(newNode, newNode.neighbors, this.maxNeighbors);
    this.nodes.push(newNode);
  }

  /**
   * Searches for the nearest neighbors to a query vector.
   * @param {number[]} queryVector - The query vector to search for.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{id: string, distance: number}>} - List of nearest neighbors with distances.
   */
  search(queryVector, k) {
    const candidates = this._search(queryVector, Math.max(k, this.efSearch));
    const closest = this._selectClosest({ vector: queryVector }, candidates, k);
    return closest.map((node) => ({ id: node.id, distance: this._euclideanDistance(queryVector, node.vector) }));
  }

  /**
   * Internal search function using a greedy algorithm.
   * @private
   * @param {number[]} queryVector - The query vector.
   * @param {number} ef - Search parameter controlling recall vs. speed.
   * @returns {HNSWNode[]} - List of candidate nodes.
   */
  _search(queryVector, ef) {
    const visited = new Set();
    const candidates = [this.nodes[0]]; // Start search from the first node
    const results = [];

    while (candidates.length > 0 && results.length < ef) {
      const current = candidates.shift();
      if (visited.has(current)) continue;
      visited.add(current);
      results.push(current);

      // Add neighbors to candidates
      current.neighbors.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          candidates.push(neighbor);
        }
      });

      // Sort candidates by distance to query
      candidates.sort((a, b) => this._euclideanDistance(queryVector, a.vector) - this._euclideanDistance(queryVector, b.vector));
    }

    return results;
  }

  /**
   * Selects the closest nodes to a target vector.
   * @private
   * @param {HNSWNode} target - Target node.
   * @param {HNSWNode[]} candidates - Candidate nodes.
   * @param {number} max - Maximum number of nodes to select.
   * @returns {HNSWNode[]} - Closest nodes.
   */
  _selectClosest(target, candidates, max) {
    return candidates
      .sort((a, b) => this._euclideanDistance(target.vector, a.vector) - this._euclideanDistance(target.vector, b.vector))
      .slice(0, max);
  }

  /**
   * Computes the Euclidean distance between two vectors.
   * @private
   * @param {number[]} a - First vector.
   * @param {number[]} b - Second vector.
   * @returns {number} - Euclidean distance.
   */
  _euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, ai, i) => sum + (ai - b[i]) ** 2, 0));
  }
}

/**
 * Initializes a new HNSW graph.
 * @param {number} maxNeighbors - Maximum neighbors per node.
 * @param {number} efSearch - Search parameter controlling recall vs. speed.
 * @returns {HNSW} - New HNSW graph instance.
 */
export function createHNSW(maxNeighbors = 16, efSearch = 10) {
  return new HNSW(maxNeighbors, efSearch);
}

/**
 * Example usage:
 * const hnsw = createHNSW();
 * hnsw.addVector('point1', [1, 2, 3]);
 * hnsw.addVector('point2', [4, 5, 6]);
 * const results = hnsw.search([2, 3, 4], 1);
 * console.log(results);
 */