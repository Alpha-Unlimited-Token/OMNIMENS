/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: redisMemoryCache
 * Purpose: Provide fast in-memory storage and retrieval of embeddings and context data.
 * Description: Simulates a Redis-like in-memory cache with TTL-based memory management for embeddings and context storage/retrieval in OMNIMENS.
 * Migrated: 2026-03-25T22:49:34.199Z
 */

// redisMemoryCache.js

/**
 * @module redisMemoryCache
 * @description Provides fast in-memory storage and retrieval of embeddings and context data using a simulated Redis-like caching layer.
 * @author OMNIMENS
 */

/**
 * @typedef {Object} CacheEntry
 * @property {any} value - The stored data.
 * @property {number} expiry - The timestamp (in milliseconds) when the entry expires.
 */

/**
 * A class implementing an in-memory Redis-like cache with TTL-based memory management.
 */
class RedisMemoryCache {
  constructor() {
    /**
     * @private
     * @type {Map<string, CacheEntry>}
     */
    this.cache = new Map();

    /**
     * @private
     * @type {NodeJS.Timeout}
     */
    this.cleanupInterval = setInterval(() => this.cleanupExpiredEntries(), 1000);
  }

  /**
   * Stores a value in the cache with a specified TTL.
   * @param {string} key - The key under which the value is stored.
   * @param {any} value - The value to store.
   * @param {number} ttl - Time-to-live in milliseconds.
   */
  set(key, value, ttl) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Retrieves a value from the cache.
   * @param {string} key - The key of the value to retrieve.
   * @returns {any|null} - The value if found and not expired, otherwise null.
   */
  get(key) {
    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) {
      return entry.value;
    }
    this.cache.delete(key); // Remove expired entry
    return null;
  }

  /**
   * Deletes a value from the cache.
   * @param {string} key - The key of the value to delete.
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clears all entries from the cache.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Cleans up expired entries from the cache.
   * @private
   */
  cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry <= now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Stops the cleanup interval to prevent memory leaks.
   */
  stopCleanup() {
    clearInterval(this.cleanupInterval);
  }
}

/**
 * Creates a new instance of RedisMemoryCache.
 * @returns {RedisMemoryCache} - A new RedisMemoryCache instance.
 */
function createRedisMemoryCache() {
  return new RedisMemoryCache();
}

export { createRedisMemoryCache };