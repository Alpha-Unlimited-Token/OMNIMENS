/**
 * @module inMemoryVectorCache
 * @description A lightweight in-memory LRU cache for embeddings and semantic data, designed for fast retrieval and reasoning.
 */

/**
 * Class representing an in-memory LRU cache.
 */
class InMemoryVectorCache {
  /**
   * Creates an instance of InMemoryVectorCache.
   * @param {number} maxSize - The maximum number of items the cache can hold.
   */
  constructor(maxSize = 100) {
    if (maxSize <= 0) {
      throw new Error('Cache size must be greater than 0.');
    }
    this.maxSize = maxSize;
    this.cache = new Map(); // Using Map to maintain insertion order for LRU logic
  }

  /**
   * Adds or updates an item in the cache.
   * @param {string} key - The unique key for the item.
   * @param {Array<number>} embedding - The embedding vector to cache.
   */
  set(key, embedding) {
    if (typeof key !== 'string') {
      throw new TypeError('Key must be a string.');
    }
    if (!Array.isArray(embedding) || !embedding.every((val) => typeof val === 'number')) {
      throw new TypeError('Embedding must be an array of numbers.');
    }

    // If the key already exists, delete it to update its position in the LRU order
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    this.cache.set(key, embedding);

    // If the cache exceeds the maximum size, remove the least recently used item
    if (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Retrieves an item from the cache.
   * @param {string} key - The unique key for the item.
   * @returns {Array<number>|undefined} The cached embedding or undefined if not found.
   */
  get(key) {
    if (typeof key !== 'string') {
      throw new TypeError('Key must be a string.');
    }

    if (!this.cache.has(key)) {
      return undefined;
    }

    // Move the accessed item to the end to mark it as recently used
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  /**
   * Checks if a key exists in the cache.
   * @param {string} key - The unique key for the item.
   * @returns {boolean} True if the key exists, false otherwise.
   */
  has(key) {
    if (typeof key !== 'string') {
      throw new TypeError('Key must be a string.');
    }
    return this.cache.has(key);
  }

  /**
   * Clears all items from the cache.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Gets the current size of the cache.
   * @returns {number} The number of items in the cache.
   */
  size() {
    return this.cache.size;
  }
}

export default InMemoryVectorCache;