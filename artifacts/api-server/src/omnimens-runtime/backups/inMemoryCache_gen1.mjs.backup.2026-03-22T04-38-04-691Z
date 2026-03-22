/**
 * @module inMemoryCache
 * @description A lightweight in-memory cache with LRU (Least Recently Used) eviction strategy for storing embeddings and frequently accessed data.
 */

/**
 * CacheEntry represents a single entry in the cache.
 * @typedef {Object} CacheEntry
 * @property {any} value - The value stored in the cache.
 * @property {number} timestamp - The timestamp of the last access.
 */

class InMemoryCache {
  /**
   * Creates an instance of InMemoryCache.
   * @param {number} maxSize - Maximum number of items the cache can hold.
   */
  constructor(maxSize = 100) {
    if (maxSize <= 0) throw new Error('Cache size must be greater than 0.');
    this.maxSize = maxSize;
    this.cache = new Map(); // Map to store cache entries.
  }

  /**
   * Retrieves an item from the cache.
   * @param {string} key - The key of the item to retrieve.
   * @returns {any|null} - The cached value, or null if not found.
   */
  get(key) {
    if (!this.cache.has(key)) return null;
    const entry = this.cache.get(key);
    entry.timestamp = Date.now(); // Update access timestamp.
    this.cache.delete(key); // Remove and re-add to maintain LRU order.
    this.cache.set(key, entry);
    return entry.value;
  }

  /**
   * Adds an item to the cache.
   * @param {string} key - The key of the item to add.
   * @param {any} value - The value to store in the cache.
   */
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key); // Remove existing entry to update it.
    } else if (this.cache.size >= this.maxSize) {
      // Evict the least recently used item.
      const leastUsedKey = this._findLeastRecentlyUsedKey();
      this.cache.delete(leastUsedKey);
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  /**
   * Removes an item from the cache.
   * @param {string} key - The key of the item to remove.
   * @returns {boolean} - True if the item was removed, false if not found.
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clears all items from the cache.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Returns the current size of the cache.
   * @returns {number} - The number of items in the cache.
   */
  size() {
    return this.cache.size;
  }

  /**
   * Finds the key of the least recently used item in the cache.
   * @private
   * @returns {string} - The key of the least recently used item.
   */
  _findLeastRecentlyUsedKey() {
    let oldestKey = null;
    let oldestTimestamp = Infinity;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestKey = key;
        oldestTimestamp = entry.timestamp;
      }
    }
    return oldestKey;
  }
}

/**
 * Creates a new in-memory cache instance.
 * @param {number} maxSize - Maximum number of items the cache can hold.
 * @returns {InMemoryCache} - A new cache instance.
 */
export function createCache(maxSize = 100) {
  return new InMemoryCache(maxSize);
}

/**
 * Example usage:
 * const cache = createCache(50);
 * cache.set('key1', 'value1');
 * console.log(cache.get('key1')); // Outputs: 'value1'
 */