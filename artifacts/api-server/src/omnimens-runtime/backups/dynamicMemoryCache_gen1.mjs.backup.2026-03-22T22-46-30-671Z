/**
 * @module dynamicMemoryCache
 * @description Provides fast in-memory retrieval and embedding indexing using an LRU cache with dynamic serialization/deserialization.
 */

/**
 * @typedef {Object} CacheItem
 * @property {string} key - The unique identifier for the cached item.
 * @property {any} value - The value associated with the key.
 */

/**
 * @class LRUCache
 * @description Implements a Least Recently Used (LRU) cache with dynamic serialization/deserialization.
 */
class LRUCache {
  /**
   * @param {number} maxSize - Maximum number of items the cache can hold.
   */
  constructor(maxSize) {
    if (maxSize <= 0) {
      throw new Error("Cache size must be greater than zero.");
    }
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  /**
   * @description Retrieves a value from the cache.
   * @param {string} key - The key to retrieve.
   * @returns {any|null} - The value associated with the key, or null if not found.
   */
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value); // Move to the most recently used position.
    return value;
  }

  /**
   * @description Adds or updates a key-value pair in the cache.
   * @param {string} key - The key to store.
   * @param {any} value - The value to store.
   */
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const leastUsedKey = this.cache.keys().next().value;
      this.cache.delete(leastUsedKey);
    }
    this.cache.set(key, value);
  }

  /**
   * @description Removes a key-value pair from the cache.
   * @param {string} key - The key to remove.
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * @description Clears the entire cache.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * @description Serializes the cache to a JSON string.
   * @returns {string} - The serialized cache.
   */
  serialize() {
    return JSON.stringify(Array.from(this.cache.entries()));
  }

  /**
   * @description Deserializes a JSON string into the cache.
   * @param {string} jsonString - The JSON string to deserialize.
   */
  deserialize(jsonString) {
    try {
      const entries = JSON.parse(jsonString);
      if (!Array.isArray(entries)) {
        throw new Error("Invalid cache format.");
      }
      this.cache.clear();
      for (const [key, value] of entries) {
        this.cache.set(key, value);
      }
    } catch (error) {
      throw new Error("Failed to deserialize cache: " + error.message);
    }
  }
}

/**
 * @function createDynamicMemoryCache
 * @description Factory function to create a new LRUCache instance.
 * @param {number} maxSize - Maximum number of items the cache can hold.
 * @returns {LRUCache} - A new LRUCache instance.
 */
export function createDynamicMemoryCache(maxSize) {
  return new LRUCache(maxSize);
}

/**
 * @function serializeCache
 * @description Serializes a given LRUCache instance.
 * @param {LRUCache} cache - The cache to serialize.
 * @returns {string} - The serialized cache.
 */
export function serializeCache(cache) {
  return cache.serialize();
}

/**
 * @function deserializeCache
 * @description Deserializes a JSON string into a given LRUCache instance.
 * @param {LRUCache} cache - The cache to populate.
 * @param {string} jsonString - The JSON string to deserialize.
 */
export function deserializeCache(cache, jsonString) {
  cache.deserialize(jsonString);
}
