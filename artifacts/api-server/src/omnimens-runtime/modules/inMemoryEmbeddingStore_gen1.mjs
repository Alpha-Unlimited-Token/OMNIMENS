/**
 * @module inMemoryEmbeddingStore
 * @description A pure JavaScript module for storing and retrieving high-dimensional embeddings using HNSW (Hierarchical Navigable Small World) for approximate nearest neighbor search.
 * @version 1.0.0
 */

/**
 * Class representing an in-memory embedding store with HNSW-based ANN search.
 */
export class InMemoryEmbeddingStore {
  /**
   * Initializes the embedding store.
   * @param {number} dimensions - The dimensionality of the embeddings.
   * @param {number} maxNeighbors - Maximum number of neighbors to consider in the graph.
   * @param {number} efConstruction - Construction parameter controlling graph quality.
   */
  constructor(dimensions, maxNeighbors = 16, efConstruction = 200) {
    if (!Number.isInteger(dimensions) || dimensions <= 0) {
      throw new Error("Dimensions must be a positive integer.");
    }
    this.dimensions = dimensions;
    this.maxNeighbors = maxNeighbors;
    this.efConstruction = efConstruction;
    this.nodes = []; // Array to store embeddings and metadata
    this.graph = []; // Adjacency list representing the HNSW graph
  }

  /**
   * Adds an embedding to the store.
   * @param {number[]} embedding - The high-dimensional vector to store.
   * @param {string} id - A unique identifier for the embedding.
   * @throws Will throw an error if the embedding is not of the correct dimensionality.
   */
  addEmbedding(embedding, id) {
    if (!Array.isArray(embedding) || embedding.length !== this.dimensions) {
      throw new Error("Embedding must be an array of length " + this.dimensions);
    }

    if (this.nodes.some(node => node.id === id)) {
      throw new Error("An embedding with the given ID already exists.");
    }

    const newNode = { id, embedding };
    this.nodes.push(newNode);
    const newIndex = this.nodes.length - 1;

    // Update the graph with the new node
    const neighbors = this._findNearestNeighbors(embedding, this.maxNeighbors);
    this.graph[newIndex] = neighbors;
    for (const neighbor of neighbors) {
      this.graph[neighbor].push(newIndex);
    }
  }

  /**
   * Searches for the nearest neighbors of a given query embedding.
   * @param {number[]} query - The query embedding.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{id: string, distance: number}>} - The nearest neighbors and their distances.
   */
  search(query, k = 5) {
    if (!Array.isArray(query) || query.length !== this.dimensions) {
      throw new Error("Query must be an array of length " + this.dimensions);
    }

    const visited = new Set();
    const candidates = [];
    const results = [];

    // Start search from a random node
    const entryPoint = Math.floor(Math.random() * this.nodes.length);
    candidates.push({ index: entryPoint, distance: this._euclideanDistance(query, this.nodes[entryPoint].embedding) });

    while (candidates.length > 0) {
      candidates.sort((a, b) => a.distance - b.distance);
      const current = candidates.shift();

      if (visited.has(current.index)) continue;
      visited.add(current.index);

      results.push({ id: this.nodes[current.index].id, distance: current.distance });
      if (results.length > k) results.pop();

      for (const neighbor of this.graph[current.index] || []) {
        if (!visited.has(neighbor)) {
          const distance = this._euclideanDistance(query, this.nodes[neighbor].embedding);
          candidates.push({ index: neighbor, distance });
        }
      }
    }

    return results.sort((a, b) => a.distance - b.distance).slice(0, k);
  }

  /**
   * Finds the nearest neighbors of a given embedding within the current graph.
   * @private
   * @param {number[]} embedding - The embedding to find neighbors for.
   * @param {number} maxNeighbors - Maximum number of neighbors to return.
   * @returns {number[]} - Indices of the nearest neighbors.
   */
  _findNearestNeighbors(embedding, maxNeighbors) {
    const distances = this.nodes.map((node, index) => ({
      index,
      distance: this._euclideanDistance(embedding, node.embedding)
    }));

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, maxNeighbors).map(d => d.index);
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @private
   * @param {number[]} a - The first vector.
   * @param {number[]} b - The second vector.
   * @returns {number} - The Euclidean distance.
   */
  _euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
  }
}

/**
 * Factory function to create a new embedding store.
 * @param {number} dimensions - The dimensionality of the embeddings.
 * @param {number} [maxNeighbors=16] - Maximum number of neighbors to consider in the graph.
 * @param {number} [efConstruction=200] - Construction parameter controlling graph quality.
 * @returns {InMemoryEmbeddingStore} - A new instance of the embedding store.
 */
export function createEmbeddingStore(dimensions, maxNeighbors = 16, efConstruction = 200) {
  return new InMemoryEmbeddingStore(dimensions, maxNeighbors, efConstruction);
}