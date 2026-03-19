/**
 * @module semanticMemoryCache
 * @description A utility module to store and retrieve embeddings and frequently accessed data using an in-memory approximate nearest neighbor (ANN) search.
 */

/**
 * SemanticMemoryCache class to manage embeddings and perform fast semantic searches using HNSW-like graph-based ANN.
 */
class SemanticMemoryCache {
  constructor() {
    /**
     * @private
     * @type {Map<string, number[]>}
     * Stores embeddings with unique keys.
     */
    this.embeddingStore = new Map();

    /**
     * @private
     * @type {Map<string, any>}
     * Stores metadata or frequently accessed data.
     */
    this.metadataStore = new Map();

    /**
     * @private
     * @type {Map<string, Set<string>>}
     * Stores graph connections for HNSW-like ANN search.
     */
    this.graph = new Map();
  }

  /**
   * Adds an embedding and associated metadata to the cache.
   * @param {string} key - Unique identifier for the embedding.
   * @param {number[]} embedding - The embedding vector.
   * @param {any} metadata - Optional metadata associated with the embedding.
   * @throws {Error} If the key already exists or embedding is invalid.
   */
  add(key, embedding, metadata = null) {
    if (this.embeddingStore.has(key)) {
      throw new Error(`Key '${key}' already exists in the cache.`);
    }
    if (!Array.isArray(embedding) || embedding.some((v) => typeof v !== 'number')) {
      throw new Error('Embedding must be an array of numbers.');
    }

    this.embeddingStore.set(key, embedding);
    if (metadata !== null) {
      this.metadataStore.set(key, metadata);
    }

    this._updateGraph(key, embedding);
  }

  /**
   * Retrieves the metadata associated with a key.
   * @param {string} key - The key to retrieve metadata for.
   * @returns {any} The metadata associated with the key, or undefined if not found.
   */
  getMetadata(key) {
    return this.metadataStore.get(key);
  }

  /**
   * Performs a semantic search to find the nearest neighbors to a given embedding.
   * @param {number[]} queryEmbedding - The query embedding vector.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{ key: string, distance: number }>} List of nearest neighbors with their distances.
   */
  search(queryEmbedding, k = 5) {
    if (!Array.isArray(queryEmbedding) || queryEmbedding.some((v) => typeof v !== 'number')) {
      throw new Error('Query embedding must be an array of numbers.');
    }

    const distances = [];

    for (const [key, embedding] of this.embeddingStore.entries()) {
      const distance = this._euclideanDistance(queryEmbedding, embedding);
      distances.push({ key, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k);
  }

  /**
   * Updates the graph structure for HNSW-like ANN search.
   * @private
   * @param {string} key - The key of the new embedding.
   * @param {number[]} embedding - The embedding vector.
   */
  _updateGraph(key, embedding) {
    const neighbors = this.search(embedding, 10).map((n) => n.key);
    this.graph.set(key, new Set(neighbors));
    for (const neighbor of neighbors) {
      if (this.graph.has(neighbor)) {
        this.graph.get(neighbor).add(key);
      }
    }
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @private
   * @param {number[]} vec1 - First vector.
   * @param {number[]} vec2 - Second vector.
   * @returns {number} The Euclidean distance between the vectors.
   */
  _euclideanDistance(vec1, vec2) {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same length.');
    }
    return Math.sqrt(vec1.reduce((sum, v, i) => sum + (v - vec2[i]) ** 2, 0));
  }
}

/**
 * Factory function to create a new SemanticMemoryCache instance.
 * @returns {SemanticMemoryCache} A new instance of SemanticMemoryCache.
 */
export function createSemanticMemoryCache() {
  return new SemanticMemoryCache();
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v ** 2, 0));
  return vector.map((v) => v / magnitude);
}