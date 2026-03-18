/**
 * @module inMemoryVectorCache
 * @description Provides a fast in-memory caching mechanism for embeddings and vectorized data
 *              using an LRU cache and efficient vector similarity search.
 */

/**
 * LRUCache class to manage least-recently-used caching.
 * Stores embeddings and provides efficient similarity search.
 */
class LRUCache {
  /**
   * @param {number} capacity - Maximum number of items the cache can hold.
   */
  constructor(capacity) {
    if (capacity <= 0) {
      throw new Error('Cache capacity must be greater than zero.');
    }
    this.capacity = capacity;
    this.cache = new Map(); // Stores key-value pairs
    this.keys = new Set(); // Maintains the order of keys for LRU
  }

  /**
   * Adds a vector to the cache.
   * @param {string} key - Unique identifier for the vector.
   * @param {Array<number>} vector - The vector to cache.
   */
  set(key, vector) {
    if (!Array.isArray(vector) || vector.some(isNaN)) {
      throw new Error('Vector must be an array of numbers.');
    }

    if (this.cache.has(key)) {
      this.keys.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.keys.values().next().value;
      this.keys.delete(oldestKey);
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, vector);
    this.keys.add(key);
  }

  /**
   * Retrieves a vector from the cache.
   * @param {string} key - Unique identifier for the vector.
   * @returns {Array<number>|undefined} - The cached vector or undefined if not found.
   */
  get(key) {
    if (!this.cache.has(key)) return undefined;

    // Update LRU order
    this.keys.delete(key);
    this.keys.add(key);

    return this.cache.get(key);
  }

  /**
   * Finds the most similar vector in the cache based on cosine similarity.
   * @param {Array<number>} queryVector - The query vector.
   * @returns {{ key: string, similarity: number }|null} - The most similar vector's key and similarity score, or null if cache is empty.
   */
  findMostSimilar(queryVector) {
    if (!Array.isArray(queryVector) || queryVector.some(isNaN)) {
      throw new Error('Query vector must be an array of numbers.');
    }

    let bestMatch = null;
    let highestSimilarity = -Infinity;

    for (const [key, vector] of this.cache.entries()) {
      const similarity = this._cosineSimilarity(queryVector, vector);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = { key, similarity };
      }
    }

    return bestMatch;
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @private
   * @param {Array<number>} vecA - First vector.
   * @param {Array<number>} vecB - Second vector.
   * @returns {number} - Cosine similarity score.
   */
  _cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length.');
    }

    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }
}

/**
 * Creates a new LRUCache instance.
 * @param {number} capacity - Maximum number of items the cache can hold.
 * @returns {LRUCache} - A new LRUCache instance.
 */
export function createCache(capacity) {
  return new LRUCache(capacity);
}

/**
 * Example usage:
 * const cache = createCache(100);
 * cache.set('vector1', [0.1, 0.2, 0.3]);
 * cache.set('vector2', [0.4, 0.5, 0.6]);
 * const mostSimilar = cache.findMostSimilar([0.1, 0.2, 0.3]);
 * console.log(mostSimilar);
 */