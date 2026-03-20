/**
 * @module semanticCacheManager
 * @description Provides in-memory caching for semantic embeddings and implements approximate nearest neighbor search.
 */

const { Worker, isMainThread, parentPort } = require('worker_threads');

/**
 * @typedef {Object} Embedding
 * @property {string} id - Unique identifier for the embedding.
 * @property {number[]} vector - The embedding vector.
 */

/**
 * @typedef {Object} CacheEntry
 * @property {Embedding} embedding - The embedding data.
 * @property {number} timestamp - Timestamp when the embedding was added.
 */

/**
 * @class SemanticCacheManager
 * @description Manages in-memory caching of semantic embeddings and provides approximate nearest neighbor search.
 */
class SemanticCacheManager {
  constructor() {
    /** @type {Map<string, CacheEntry>} */
    this.cache = new Map();
    this.cacheLimit = 10000; // Maximum number of embeddings to store.
  }

  /**
   * @param {Embedding} embedding - The embedding to add to the cache.
   * @description Adds a new embedding to the cache.
   */
  addEmbedding(embedding) {
    if (this.cache.size >= this.cacheLimit) {
      this.evictOldest();
    }
    this.cache.set(embedding.id, { embedding, timestamp: Date.now() });
  }

  /**
   * @param {string} id - The ID of the embedding to retrieve.
   * @returns {Embedding|null} - The embedding if found, otherwise null.
   * @description Retrieves an embedding from the cache by its ID.
   */
  getEmbedding(id) {
    const entry = this.cache.get(id);
    return entry ? entry.embedding : null;
  }

  /**
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {Embedding[]} - The k nearest embeddings.
   * @description Finds the k nearest embeddings to the query vector using approximate nearest neighbor search.
   */
  findNearestNeighbors(queryVector, k = 5) {
    const distances = [];

    for (const { embedding } of this.cache.values()) {
      const distance = this.calculateDistance(queryVector, embedding.vector);
      distances.push({ embedding, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k).map(entry => entry.embedding);
  }

  /**
   * @private
   * @description Removes the oldest entry from the cache.
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTimestamp = Infinity;

    for (const [key, { timestamp }] of this.cache.entries()) {
      if (timestamp < oldestTimestamp) {
        oldestTimestamp = timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * @param {number[]} vectorA - The first vector.
   * @param {number[]} vectorB - The second vector.
   * @returns {number} - The Euclidean distance between the two vectors.
   * @description Calculates the Euclidean distance between two vectors.
   */
  calculateDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must be of the same length');
    }

    return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
  }
}

/**
 * @function createSemanticCacheManager
 * @returns {SemanticCacheManager} - A new instance of SemanticCacheManager.
 * @description Factory function to create a new SemanticCacheManager instance.
 */
function createSemanticCacheManager() {
  return new SemanticCacheManager();
}

module.exports = {
  createSemanticCacheManager
};