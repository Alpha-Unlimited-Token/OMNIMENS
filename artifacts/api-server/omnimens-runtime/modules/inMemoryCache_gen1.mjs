/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: inMemoryCache
 * Purpose: Store embeddings and other frequently accessed data in memory for faster retrieval.
 * Description: An in-memory key-value cache with LRU eviction for fast data access, enabling OMNIMENS to store embeddings and frequently used data efficiently.
 * Migrated: 2026-03-25T22:49:34.190Z
 */

/**
 * @module inMemoryCache
 * @description A key-value in-memory cache with a Least Recently Used (LRU) eviction policy for efficient data retrieval.
 */

/**
 * A class representing an in-memory cache with an LRU eviction policy.
 */
export class InMemoryCache {
  /**
   * @param {number} maxSize - The maximum number of items the cache can hold.
   */
  constructor(maxSize) {
    if (maxSize <= 0 || !Number.isInteger(maxSize)) {
      throw new Error("maxSize must be a positive integer.");
    }
    this.maxSize = maxSize;
    this.cache = new Map(); // Stores the key-value pairs
  }

  /**
   * Retrieves a value from the cache.
   * @param {string} key - The key of the value to retrieve.
   * @returns {*} The value associated with the key, or undefined if the key is not found.
   */
  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }
    // Move the accessed key to the end to mark it as recently used
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Adds a key-value pair to the cache. If the cache exceeds the maximum size, the least recently used item is evicted.
   * @param {string} key - The key to add.
   * @param {*} value - The value to associate with the key.
   */
  set(key, value) {
    if (this.cache.has(key)) {
      // Remove the existing key to update its position
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Evict the least recently used item (the first item in the Map)
      const lruKey = this.cache.keys().next().value;
      this.cache.delete(lruKey);
    }
    this.cache.set(key, value);
  }

  /**
   * Checks if a key exists in the cache.
   * @param {string} key - The key to check.
   * @returns {boolean} True if the key exists, false otherwise.
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Removes a key-value pair from the cache.
   * @param {string} key - The key to remove.
   * @returns {boolean} True if the key was removed, false if the key was not found.
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clears all key-value pairs from the cache.
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

  /**
   * Returns an array of all keys in the cache, ordered from least recently used to most recently used.
   * @returns {string[]} An array of keys.
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Returns an array of all values in the cache, ordered from least recently used to most recently used.
   * @returns {Array} An array of values.
   */
  values() {
    return Array.from(this.cache.values());
  }
}

/**
 * Creates a new in-memory cache instance.
 * @param {number} maxSize - The maximum number of items the cache can hold.
 * @returns {InMemoryCache} The in-memory cache instance.
 */
export function createCache(maxSize) {
  return new InMemoryCache(maxSize);
}