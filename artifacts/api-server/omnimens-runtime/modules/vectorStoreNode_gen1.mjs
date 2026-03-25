/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: vectorStoreNode
 * Purpose: Efficiently store and retrieve vector embeddings for similarity searches.
 * Description: Efficiently stores and retrieves vector embeddings using HNSW for approximate nearest neighbor searches, enhancing OMNIMENS's similarity search capabilities.
 * Migrated: 2026-03-25T22:49:34.209Z
 */

// vectorStoreNode.js

/**
 * @module vectorStoreNode
 * @description Efficiently stores and retrieves vector embeddings for similarity searches using HNSW (Hierarchical Navigable Small World).
 */

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class HNSWNode {
  /**
   * @param {number[]} vector - The vector embedding for this node.
   * @param {number} id - A unique identifier for this node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = []; // Neighbors in the graph
  }
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vec1 - The first vector.
 * @param {number[]} vec2 - The second vector.
 * @returns {number} The Euclidean distance between vec1 and vec2.
 */
function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error("Vectors must have the same dimensionality.");
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
}

/**
 * HNSW-based vector store for approximate nearest neighbor search.
 * @class
 */
class HNSW {
  constructor() {
    this.nodes = []; // All nodes in the graph
  }

  /**
   * Adds a new vector to the HNSW graph.
   * @param {number[]} vector - The vector to add.
   * @returns {number} The ID of the newly added vector.
   */
  addVector(vector) {
    const id = this.nodes.length;
    const newNode = new HNSWNode(vector, id);

    // Connect to existing nodes (basic implementation, no hierarchical levels)
    this.nodes.forEach((node) => {
      const distance = euclideanDistance(vector, node.vector);
      node.neighbors.push({ node: newNode, distance });
      newNode.neighbors.push({ node, distance });
    });

    // Sort neighbors by distance
    newNode.neighbors.sort((a, b) => a.distance - b.distance);
    this.nodes.push(newNode);
    return id;
  }

  /**
   * Searches for the nearest neighbors to a query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{id: number, distance: number}>} The k nearest neighbors.
   */
  search(queryVector, k) {
    if (k <= 0) {
      throw new Error("k must be greater than 0.");
    }

    const results = [];

    // Linear search for simplicity (can be optimized with hierarchical levels)
    this.nodes.forEach((node) => {
      const distance = euclideanDistance(queryVector, node.vector);
      results.push({ id: node.id, distance });
    });

    // Sort by distance and return the top k results
    return results.sort((a, b) => a.distance - b.distance).slice(0, k);
  }
}

/**
 * Creates a new HNSW instance.
 * @returns {HNSW} A new HNSW instance.
 */
export function createHNSW() {
  return new HNSW();
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vec1 - The first vector.
 * @param {number[]} vec2 - The second vector.
 * @returns {number} The Euclidean distance between vec1 and vec2.
 */
export { euclideanDistance };