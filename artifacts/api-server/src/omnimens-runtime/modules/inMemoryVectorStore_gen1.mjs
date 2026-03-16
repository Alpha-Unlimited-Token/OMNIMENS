/**
 * @module inMemoryVectorStore
 * @description A utility module implementing an in-memory vector store with HNSW (Hierarchical Navigable Small World) for approximate nearest neighbor search.
 */

/**
 * A class representing a node in the HNSW graph.
 * @class
 */
class HNSWNode {
  /**
   * @param {number[]} vector - The vector embedding for this node.
   * @param {number} id - Unique identifier for this node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = new Map(); // Level -> Array of neighbor node IDs
  }
}

/**
 * A class implementing the HNSW algorithm for approximate nearest neighbor search.
 * @class
 */
class HNSW {
  /**
   * @param {number} dimensions - The dimensionality of the vector space.
   * @param {number} maxNeighbors - Maximum number of neighbors per node per level.
   * @param {number} efConstruction - Number of candidates to consider during construction.
   */
  constructor(dimensions, maxNeighbors = 16, efConstruction = 200) {
    this.dimensions = dimensions;
    this.maxNeighbors = maxNeighbors;
    this.efConstruction = efConstruction;
    this.nodes = new Map(); // ID -> HNSWNode
    this.entryPoint = null; // Entry point to the graph
    this.levels = new Map(); // Level -> Set of Node IDs
  }

  /**
   * Adds a vector to the HNSW graph.
   * @param {number[]} vector - The vector to add.
   * @param {number} id - Unique identifier for the vector.
   * @throws {Error} If the vector dimensionality does not match.
   */
  add(vector, id) {
    if (vector.length !== this.dimensions) {
      throw new Error('Vector dimensionality does not match the graph.');
    }

    const newNode = new HNSWNode(vector, id);
    this.nodes.set(id, newNode);

    // Assign level to the new node
    const level = this._randomLevel();
    for (let i = 0; i <= level; i++) {
      if (!this.levels.has(i)) {
        this.levels.set(i, new Set());
      }
      this.levels.get(i).add(id);
    }

    if (!this.entryPoint) {
      this.entryPoint = id;
      return;
    }

    // Find neighbors and connect
    for (let l = level; l >= 0; l--) {
      const candidates = this._searchLayer(vector, this.entryPoint, this.efConstruction, l);
      this._connectNeighbors(newNode, candidates, l);
    }
  }

  /**
   * Searches for the nearest neighbors to a given vector.
   * @param {number[]} vector - The query vector.
   * @param {number} k - Number of neighbors to retrieve.
   * @returns {Array<{id: number, distance: number}>} The nearest neighbors with distances.
   */
  search(vector, k) {
    if (vector.length !== this.dimensions) {
      throw new Error('Vector dimensionality does not match the graph.');
    }

    let candidates = [this.entryPoint];
    for (let l = Math.max(...this.levels.keys()); l >= 0; l--) {
      candidates = this._searchLayer(vector, candidates[0], 1, l);
    }

    const resultSet = this._searchLayer(vector, candidates[0], k, 0);
    return resultSet.map(id => ({ id, distance: this._distance(vector, this.nodes.get(id).vector) }));
  }

  /**
   * Computes the Euclidean distance between two vectors.
   * @private
   * @param {number[]} a - The first vector.
   * @param {number[]} b - The second vector.
   * @returns {number} The Euclidean distance.
   */
  _distance(a, b) {
    return Math.sqrt(a.reduce((sum, val, idx) => sum + (val - b[idx]) ** 2, 0));
  }

  /**
   * Searches for neighbors within a specific layer.
   * @private
   * @param {number[]} vector - The query vector.
   * @param {number} entryPoint - The starting node ID.
   * @param {number} ef - The number of candidates to consider.
   * @param {number} level - The graph level to search.
   * @returns {number[]} The IDs of the nearest neighbors.
   */
  _searchLayer(vector, entryPoint, ef, level) {
    const visited = new Set();
    const candidates = new Set([entryPoint]);
    const results = new Set();

    while (candidates.size > 0) {
      const current = [...candidates].shift();
      candidates.delete(current);
      visited.add(current);

      const neighbors = this.nodes.get(current).neighbors.get(level) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          candidates.add(neighbor);
          visited.add(neighbor);
          results.add(neighbor);
        }
      }
    }

    return [...results].sort((a, b) => this._distance(vector, this.nodes.get(a).vector) - this._distance(vector, this.nodes.get(b).vector)).slice(0, ef);
  }

  /**
   * Connects a node to its nearest neighbors at a specific level.
   * @private
   * @param {HNSWNode} node - The node to connect.
   * @param {number[]} neighbors - The IDs of the neighbors.
   * @param {number} level - The graph level.
   */
  _connectNeighbors(node, neighbors, level) {
    const sortedNeighbors = neighbors.sort((a, b) => this._distance(node.vector, this.nodes.get(a).vector) - this._distance(node.vector, this.nodes.get(b).vector));
    node.neighbors.set(level, sortedNeighbors.slice(0, this.maxNeighbors));
    for (const neighbor of node.neighbors.get(level)) {
      const neighborNode = this.nodes.get(neighbor);
      if (!neighborNode.neighbors.has(level)) {
        neighborNode.neighbors.set(level, []);
      }
      neighborNode.neighbors.get(level).push(node.id);
    }
  }

  /**
   * Generates a random level for a new node.
   * @private
   * @returns {number} The random level.
   */
  _randomLevel() {
    let level = 0;
    while (Math.random() < 0.5 && level < 10) {
      level++;
    }
    return level;
  }
}

export { HNSW };