/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: inMemoryVectorCache
 * Purpose: Store and retrieve embeddings in memory for faster semantic search and context retrieval.
 * Description: An in-memory LRU cache for embeddings, enabling faster semantic search and context retrieval for OMNIMENS's evolving intelligence.
 * Migrated: 2026-03-25T22:49:34.246Z
 */

/**
 * @module inMemoryVectorCache
 * @description A high-performance in-memory cache for storing and retrieving embeddings with an LRU eviction policy.
 */

/**
 * Node.js built-in modules
 */
const crypto = require('crypto');

/**
 * @typedef {Object} CacheEntry
 * @property {string} key - The unique key for the embedding.
 * @property {Float32Array} embedding - The embedding vector.
 * @property {number} timestamp - The last access time for LRU eviction.
 */

class InMemoryVectorCache {
  /**
   * @param {number} maxSize - Maximum number of entries the cache can hold.
   */
  constructor(maxSize = 1000) {
    if (maxSize <= 0) {
      throw new Error('maxSize must be a positive integer.');
    }

    this.maxSize = maxSize;
    this.cache = new Map(); // Key-value store for embeddings.
  }

  /**
   * Generates a unique hash for a given key.
   * @private
   * @param {string} key - The key to hash.
   * @returns {string} - A hashed representation of the key.
   */
  _hashKey(key) {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Adds or updates an embedding in the cache.
   * @param {string} key - The unique identifier for the embedding.
   * @param {Float32Array} embedding - The embedding vector to store.
   */
  set(key, embedding) {
    if (!(embedding instanceof Float32Array)) {
      throw new Error('Embedding must be a Float32Array.');
    }

    const hashedKey = this._hashKey(key);

    // If the key already exists, update its timestamp and value.
    if (this.cache.has(hashedKey)) {
      this.cache.get(hashedKey).timestamp = Date.now();
      this.cache.get(hashedKey).embedding = embedding;
    } else {
      // If the cache exceeds maxSize, evict the least recently used entry.
      if (this.cache.size >= this.maxSize) {
        this._evictLRU();
      }

      // Add the new entry.
      this.cache.set(hashedKey, {
        key,
        embedding,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Retrieves an embedding from the cache.
   * @param {string} key - The unique identifier for the embedding.
   * @returns {Float32Array|null} - The embedding vector, or null if not found.
   */
  get(key) {
    const hashedKey = this._hashKey(key);

    if (this.cache.has(hashedKey)) {
      const entry = this.cache.get(hashedKey);
      entry.timestamp = Date.now(); // Update access time for LRU.
      return entry.embedding;
    }

    return null; // Key not found.
  }

  /**
   * Evicts the least recently used (LRU) entry from the cache.
   * @private
   */
  _evictLRU() {
    let oldestKey = null;
    let oldestTimestamp = Infinity;

    // Find the LRU entry.
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey !== null) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clears all entries from the cache.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Returns the current size of the cache.
   * @returns {number} - The number of entries in the cache.
   */
  size() {
    return this.cache.size;
  }
}

/**
 * Exports an instance of the InMemoryVectorCache class.
 */
module.exports = { InMemoryVectorCache };