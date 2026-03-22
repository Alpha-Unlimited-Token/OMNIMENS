// dynamicMemoryStore.js

/**
 * @module dynamicMemoryStore
 * @description Enables in-memory vector storage and fast retrieval using HNSW (Hierarchical Navigable Small World) graph for approximate nearest neighbor search.
 */

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class Node {
  constructor(id, vector) {
    /**
     * @type {string} Unique identifier for the node.
     */
    this.id = id;

    /**
     * @type {number[]} Vector data associated with this node.
     */
    this.vector = vector;

    /**
     * @type {Set<Node>} Connections to other nodes.
     */
    this.connections = new Set();
  }

  /**
   * Calculates the Euclidean distance between this node's vector and another vector.
   * @param {number[]} otherVector - The vector to compare against.
   * @returns {number} The Euclidean distance.
   */
  distanceTo(otherVector) {
    if (this.vector.length !== otherVector.length) {
      throw new Error("Vector dimensions must match.");
    }
    return Math.sqrt(this.vector.reduce((sum, val, i) => sum + Math.pow(val - otherVector[i], 2), 0));
  }
}

/**
 * Represents the HNSW graph for approximate nearest neighbor search.
 * @class
 */
class HNSWGraph {
  constructor() {
    /**
     * @type {Map<string, Node>} Stores all nodes in the graph by their unique IDs.
     */
    this.nodes = new Map();
  }

  /**
   * Adds a new node to the graph.
   * @param {string} id - Unique identifier for the node.
   * @param {number[]} vector - Vector data associated with the node.
   */
  addNode(id, vector) {
    if (this.nodes.has(id)) {
      throw new Error(`Node with id ${id} already exists.`);
    }
    const newNode = new Node(id, vector);
    this.nodes.set(id, newNode);

    // Connect to existing nodes based on proximity (simplified for demonstration).
    for (const existingNode of this.nodes.values()) {
      if (existingNode !== newNode) {
        const distance = newNode.distanceTo(existingNode.vector);
        if (distance < 1.0) { // Example threshold for connection.
          newNode.connections.add(existingNode);
          existingNode.connections.add(newNode);
        }
      }
    }
  }

  /**
   * Searches for the nearest neighbors to a given vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{id: string, distance: number}>} The k nearest neighbors.
   */
  search(queryVector, k) {
    if (k <= 0) {
      throw new Error("k must be greater than 0.");
    }
    const distances = [];

    for (const node of this.nodes.values()) {
      const distance = node.distanceTo(queryVector);
      distances.push({ id: node.id, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k);
  }
}

/**
 * Creates a new HNSW graph instance.
 * @returns {HNSWGraph} A new instance of the HNSW graph.
 */
function createGraph() {
  return new HNSWGraph();
}

/**
 * Example usage function to demonstrate the module's functionality.
 */
function exampleUsage() {
  const graph = createGraph();

  graph.addNode("node1", [1.0, 2.0, 3.0]);
  graph.addNode("node2", [1.1, 2.1, 3.1]);
  graph.addNode("node3", [5.0, 5.0, 5.0]);

  const neighbors = graph.search([1.0, 2.0, 3.0], 2);
  console.log("Nearest neighbors:", neighbors);
}

// Uncomment the following line to run the example.
// exampleUsage();

export { createGraph, HNSWGraph, Node };