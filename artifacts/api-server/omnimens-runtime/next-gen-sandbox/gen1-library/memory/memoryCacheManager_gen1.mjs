/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: memoryCacheManager
 * Purpose: Provide in-memory storage for embeddings and frequently accessed data.
 * Description: Provides an intelligent in-memory LRU cache for managing embeddings and frequently accessed data, optimizing OMNIMENS's memory usage.
 * Migrated: 2026-03-25T22:49:34.272Z
 */

/**
 * @module memoryCacheManager
 * @description Provides an in-memory storage utility for embeddings and frequently accessed data using an LRU (Least Recently Used) cache algorithm.
 * This module is designed to optimize memory usage and prioritize relevant data for OMNIMENS's self-evolution.
 */

/**
 * Class representing an LRU Cache.
 */
class LRUCache {
  /**
   * Create an LRU Cache.
   * @param {number} maxSize - The maximum number of items the cache can hold.
   */
  constructor(maxSize) {
    if (maxSize <= 0 || !Number.isInteger(maxSize)) {
      throw new Error("maxSize must be a positive integer.");
    }
    this.maxSize = maxSize;
    this.cache = new Map(); // Map to store key-value pairs in order of usage.
  }

  /**
   * Get a value from the cache.
   * @param {string} key - The key of the item to retrieve.
   * @returns {*} The value associated with the key, or undefined if not found.
   */
  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }
    // Move the accessed key to the end (most recently used).
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Set a value in the cache.
   * @param {string} key - The key of the item to store.
   * @param {*} value - The value to store.
   */
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key); // Remove the old entry if it exists.
    } else if (this.cache.size >= this.maxSize) {
      // Remove the least recently used item (first item in the Map).
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value); // Add the new item.
  }

  /**
   * Check if a key exists in the cache.
   * @param {string} key - The key to check.
   * @returns {boolean} True if the key exists, false otherwise.
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Remove a key from the cache.
   * @param {string} key - The key to remove.
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get the current size of the cache.
   * @returns {number} The number of items in the cache.
   */
  size() {
    return this.cache.size;
  }
}

/**
 * Create a new LRUCache instance.
 * @param {number} maxSize - The maximum number of items the cache can hold.
 * @returns {LRUCache} A new LRUCache instance.
 */
export function createCache(maxSize) {
  return new LRUCache(maxSize);
}

/**
 * Example usage:
 * const cache = createCache(3);
 * cache.set('a', 1);
 * cache.set('b', 2);
 * cache.set('c', 3);
 * console.log(cache.get('a')); // 1
 * cache.set('d', 4); // Removes 'b' (least recently used)
 * console.log(cache.has('b')); // false
 */