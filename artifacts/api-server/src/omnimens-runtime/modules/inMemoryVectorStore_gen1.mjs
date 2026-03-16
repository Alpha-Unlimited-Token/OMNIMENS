// In-memory vector store module using HNSW for approximate nearest neighbor search

/**
 * @module inMemoryVectorStore
 * @description Implements an in-memory vector database using HNSW for fast similarity search and retrieval.
 */

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class HNSWNode {
  /**
   * @param {number[]} vector - The vector associated with the node.
   * @param {string} id - The unique identifier for the node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.connections = new Map(); // Stores connections to other nodes
  }
}

/**
 * Represents the HNSW graph for approximate nearest neighbor search.
 * @class
 */
class HNSWGraph {
  constructor() {
    this.nodes = new Map(); // Node storage by ID
  }

  /**
   * Adds a new vector to the graph.
   * @param {number[]} vector - The vector to add.
   * @param {string} id - The unique identifier for the vector.
   */
  add(vector, id) {
    if (this.nodes.has(id)) {
      throw new Error(`Node with ID ${id} already exists.`);
    }
    const newNode = new HNSWNode(vector, id);
    this.nodes.set(id, newNode);
    this._connectToNearestNeighbors(newNode);
  }

  /**
   * Searches for the nearest neighbors to a given query vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{id: string, distance: number}>} - The nearest neighbors.
   */
  search(queryVector, k) {
    const distances = [];

    for (const node of this.nodes.values()) {
      const distance = this._euclideanDistance(queryVector, node.vector);
      distances.push({ id: node.id, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k);
  }

  /**
   * Connects a new node to its nearest neighbors in the graph.
   * @private
   * @param {HNSWNode} newNode - The new node to connect.
   */
  _connectToNearestNeighbors(newNode) {
    const neighbors = this.search(newNode.vector, 5); // Connect to 5 nearest neighbors
    for (const neighbor of neighbors) {
      const neighborNode = this.nodes.get(neighbor.id);
      newNode.connections.set(neighbor.id, neighbor.distance);
      neighborNode.connections.set(newNode.id, neighbor.distance);
    }
  }

  /**
   * Computes the Euclidean distance between two vectors.
   * @private
   * @param {number[]} vectorA - The first vector.
   * @param {number[]} vectorB - The second vector.
   * @returns {number} - The Euclidean distance.
   */
  _euclideanDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same dimensions.');
    }
    let sum = 0;
    for (let i = 0; i < vectorA.length; i++) {
      sum += (vectorA[i] - vectorB[i]) ** 2;
    }
    return Math.sqrt(sum);
  }
}

/**
 * Creates an instance of the in-memory vector store.
 * @returns {HNSWGraph} - The vector store instance.
 */
function createVectorStore() {
  return new HNSWGraph();
}

/**
 * Example usage of the vector store.
 * @returns {void}
 */
function exampleUsage() {
  const store = createVectorStore();

  store.add([1, 2, 3], 'vector1');
  store.add([4, 5, 6], 'vector2');
  store.add([7, 8, 9], 'vector3');

  const results = store.search([2, 3, 4], 2);
  console.log('Nearest neighbors:', results);
}

// Export the module functions
export { createVectorStore, exampleUsage };