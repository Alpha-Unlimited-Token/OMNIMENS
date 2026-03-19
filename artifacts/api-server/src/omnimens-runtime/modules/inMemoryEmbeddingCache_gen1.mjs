/**
 * @module inMemoryEmbeddingCache
 * @description A utility module for caching embeddings in memory using an LRU strategy for fast similarity searches.
 */

/**
 * A class representing an in-memory embedding cache with LRU eviction policy.
 */
class InMemoryEmbeddingCache {
  /**
   * Creates an instance of InMemoryEmbeddingCache.
   * @param {number} maxSize - The maximum number of items the cache can hold.
   */
  constructor(maxSize = 100) {
    if (typeof maxSize !== 'number' || maxSize <= 0) {
      throw new Error('maxSize must be a positive number.');
    }

    /**
     * @private
     * @type {Map<string, { embedding: number[], timestamp: number }>}
     */
    this.cache = new Map();

    /**
     * @private
     * @type {number}
     */
    this.maxSize = maxSize;
  }

  /**
   * Adds an embedding to the cache.
   * @param {string} key - The unique key for the embedding.
   * @param {number[]} embedding - The embedding vector to cache.
   */
  set(key, embedding) {
    if (!Array.isArray(embedding) || embedding.some(isNaN)) {
      throw new Error('Embedding must be an array of numbers.');
    }

    if (this.cache.has(key)) {
      this.cache.delete(key); // Remove the key to refresh its position.
    }

    this.cache.set(key, { embedding, timestamp: Date.now() });

    if (this.cache.size > this.maxSize) {
      // Evict the least recently used item.
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Retrieves an embedding from the cache.
   * @param {string} key - The unique key for the embedding.
   * @returns {number[] | null} The embedding vector if found, or null if not.
   */
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const value = this.cache.get(key);
    this.cache.delete(key); // Refresh the key's position.
    this.cache.set(key, value);

    return value.embedding;
  }

  /**
   * Removes an embedding from the cache.
   * @param {string} key - The unique key for the embedding.
   * @returns {boolean} True if the key was found and removed, false otherwise.
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clears all embeddings from the cache.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Returns the current size of the cache.
   * @returns {number} The number of items in the cache.
   */
  size() {
    return this.cache.size;
  }
}

/**
 * Factory function to create a new in-memory embedding cache.
 * @param {number} [maxSize=100] - The maximum number of items the cache can hold.
 * @returns {InMemoryEmbeddingCache} A new instance of InMemoryEmbeddingCache.
 */
export function createEmbeddingCache(maxSize = 100) {
  return new InMemoryEmbeddingCache(maxSize);
}

/**
 * Utility function to check similarity between two embeddings using cosine similarity.
 * @param {number[]} embedding1 - The first embedding vector.
 * @param {number[]} embedding2 - The second embedding vector.
 * @returns {number} The cosine similarity between the two embeddings (range: -1 to 1).
 */
export function cosineSimilarity(embedding1, embedding2) {
  if (!Array.isArray(embedding1) || !Array.isArray(embedding2)) {
    throw new Error('Both embeddings must be arrays of numbers.');
  }

  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same length.');
  }

  const dotProduct = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0);
  const magnitude1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val ** 2, 0));
  const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitude1 === 0 || magnitude2 === 0) {
    throw new Error('Embeddings must not be zero vectors.');
  }

  return dotProduct / (magnitude1 * magnitude2);
}

export default { createEmbeddingCache, cosineSimilarity };