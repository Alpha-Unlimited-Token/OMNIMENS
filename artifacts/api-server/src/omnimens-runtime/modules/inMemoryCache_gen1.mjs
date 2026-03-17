/**
 * @module inMemoryCache
 * @description Implements an LRU cache with a Redis-like fallback for persistence across restarts.
 * This module is designed for fast storage and retrieval of embeddings, user preferences, or conversation summaries.
 */

const { createServer } = require('net');
const { writeFileSync, readFileSync, existsSync } = require('fs');

/**
 * @typedef {Object} CacheEntry
 * @property {any} value - The value stored in the cache.
 * @property {number} timestamp - The last access timestamp for LRU eviction.
 */

class InMemoryCache {
  /**
   * @param {number} maxSize - Maximum number of items the cache can hold in memory.
   * @param {string} persistenceFile - File path for persistent storage.
   */
  constructor(maxSize = 100, persistenceFile = 'cache.json') {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.persistenceFile = persistenceFile;

    // Load cache from persistence file if it exists
    if (existsSync(this.persistenceFile)) {
      try {
        const persistedData = JSON.parse(readFileSync(this.persistenceFile, 'utf8'));
        this.cache = new Map(Object.entries(persistedData));
      } catch (error) {
        console.error('Failed to load cache from persistence file:', error);
      }
    }
  }

  /**
   * Get a value from the cache.
   * @param {string} key - The key to retrieve.
   * @returns {any|null} - The value if found, or null if not.
   */
  get(key) {
    if (!this.cache.has(key)) return null;

    const entry = this.cache.get(key);
    entry.timestamp = Date.now(); // Update access time for LRU
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Set a value in the cache.
   * @param {string} key - The key to store the value under.
   * @param {any} value - The value to store.
   */
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      this.evict();
    }

    this.cache.set(key, { value, timestamp: Date.now() });
    this.persist();
  }

  /**
   * Evict the least recently used item from the cache.
   */
  evict() {
    let oldestKey = null;
    let oldestTimestamp = Infinity;

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
   * Persist the cache to the persistence file.
   */
  persist() {
    try {
      const dataToPersist = Object.fromEntries(this.cache);
      writeFileSync(this.persistenceFile, JSON.stringify(dataToPersist), 'utf8');
    } catch (error) {
      console.error('Failed to persist cache:', error);
    }
  }

  /**
   * Clear the cache completely.
   */
  clear() {
    this.cache.clear();
    this.persist();
  }
}

/**
 * Create a new in-memory cache instance.
 * @param {number} maxSize - Maximum size of the cache.
 * @param {string} persistenceFile - File path for persistence.
 * @returns {InMemoryCache} - A new cache instance.
 */
function createCache(maxSize = 100, persistenceFile = 'cache.json') {
  return new InMemoryCache(maxSize, persistenceFile);
}

module.exports = {
  createCache
};