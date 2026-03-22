/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryCache
 * Written: 2026-03-22T04:38:04.690Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * @module inMemoryCache
 * @description Provides a configurable LRU (Least Recently Used) cache with expiration and size limits for rapid access to frequently used data.
 */

/**
 * LRUCache class implementing an in-memory cache with configurable size and expiration time.
 */
class LRUCache {
  /**
   * @param {number} maxSize - Maximum number of items the cache can hold.
   * @param {number} ttl - Time-to-live for cache entries in milliseconds.
   */
  constructor(maxSize, ttl) {
    if (maxSize <= 0 || ttl <= 0) {
      throw new Error("maxSize and ttl must be positive numbers.");
    }

    this.maxSize = maxSize;
    this.ttl = ttl;
    this.cache = new Map(); // Stores cache entries in insertion order.
  }

  /**
   * Sets a key-value pair in the cache.
   * @param {string} key - The key to identify the cache entry.
   * @param {*} value - The value to store in the cache.
   */
  set(key, value) {
    const now = Date.now();

    // Remove the key if it already exists to refresh its position in the LRU order.
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add the new key-value pair.
    this.cache.set(key, { value, expiresAt: now + this.ttl });

    // Evict the least recently used entry if the cache exceeds its max size.
    if (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Retrieves a value from the cache.
   * @param {string} key - The key of the cache entry to retrieve.
   * @returns {*} The cached value, or undefined if the key does not exist or has expired.
   */
  get(key) {
    const now = Date.now();
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined; // Key does not exist.
    }

    if (entry.expiresAt < now) {
      this.cache.delete(key); // Remove expired entry.
      return undefined;
    }

    // Refresh the key's position in the LRU order.
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Deletes a key-value pair from the cache.
   * @param {string} key - The key to delete from the cache.
   * @returns {boolean} True if the key was deleted, false if it was not found.
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clears all entries from the cache.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Returns the current size of the cache.
   * @returns {number} The number of entries in the cache.
   */
  size() {
    return this.cache.size;
  }
}

/**
 * Factory function to create a new LRUCache instance.
 * @param {number} maxSize - Maximum number of items the cache can hold.
 * @param {number} ttl - Time-to-live for cache entries in milliseconds.
 * @returns {LRUCache} A new LRUCache instance.
 */
export function createCache(maxSize, ttl) {
  return new LRUCache(maxSize, ttl);
}

export default { createCache };