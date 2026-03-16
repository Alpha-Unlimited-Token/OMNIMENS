/**
 * @module inMemoryVectorCache
 * @description Provides fast in-memory storage and retrieval of vector embeddings with LRU cache eviction.
 * This module supports both pure JavaScript hashmap-based storage and optional Redis-backed persistence.
 */

const crypto = require('crypto');

/**
 * @typedef {Object} VectorCacheOptions
 * @property {number} maxSize - Maximum number of vectors to store in memory.
 * @property {boolean} useRedis - Whether to use Redis for persistence (default: false).
 * @property {string} [redisHost] - Redis host address (required if useRedis is true).
 * @property {number} [redisPort] - Redis port (default: 6379).
 */

/**
 * LRU Cache Node structure.
 * @private
 * @class
 */
class LRUNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

/**
 * LRU Cache implementation for in-memory storage.
 * @private
 * @class
 */
class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.size = 0;
    this.map = new Map();
    this.head = null;
    this.tail = null;
  }

  /**
   * Get a value from the cache.
   * @param {string} key - The key of the item to retrieve.
   * @returns {any|null} - The value if found, or null if not found.
   */
  get(key) {
    if (!this.map.has(key)) return null;
    const node = this.map.get(key);
    this._moveToHead(node);
    return node.value;
  }

  /**
   * Put a value into the cache.
   * @param {string} key - The key of the item to store.
   * @param {any} value - The value to store.
   */
  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.value = value;
      this._moveToHead(node);
    } else {
      const newNode = new LRUNode(key, value);
      if (this.size >= this.maxSize) {
        this._evict();
      }
      this._addNode(newNode);
      this.map.set(key, newNode);
      this.size++;
    }
  }

  /**
   * Evict the least recently used item from the cache.
   * @private
   */
  _evict() {
    if (!this.tail) return;
    this.map.delete(this.tail.key);
    this._removeNode(this.tail);
    this.size--;
  }

  /**
   * Move a node to the head of the cache.
   * @private
   * @param {LRUNode} node - The node to move.
   */
  _moveToHead(node) {
    this._removeNode(node);
    this._addNode(node);
  }

  /**
   * Add a node to the head of the cache.
   * @private
   * @param {LRUNode} node - The node to add.
   */
  _addNode(node) {
    node.next = this.head;
    node.prev = null;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
  }

  /**
   * Remove a node from the cache.
   * @private
   * @param {LRUNode} node - The node to remove.
   */
  _removeNode(node) {
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.head) this.head = node.next;
    if (node === this.tail) this.tail = node.prev;
    node.next = null;
    node.prev = null;
  }
}

/**
 * In-memory vector cache with optional Redis persistence.
 * @class
 */
class InMemoryVectorCache {
  /**
   * @param {VectorCacheOptions} options - Configuration options for the cache.
   */
  constructor({ maxSize = 1000, useRedis = false, redisHost, redisPort = 6379 }) {
    this.cache = new LRUCache(maxSize);
    this.useRedis = useRedis;
    if (useRedis) {
      const { createClient } = require('redis');
      this.redisClient = createClient({ host: redisHost, port: redisPort });
      this.redisClient.connect();
    }
  }

  /**
   * Store a vector in the cache.
   * @param {string} key - Unique key for the vector.
   * @param {number[]} vector - The vector to store.
   */
  async store(key, vector) {
    const vectorString = JSON.stringify(vector);
    this.cache.put(key, vector);
    if (this.useRedis) {
      await this.redisClient.set(key, vectorString);
    }
  }

  /**
   * Retrieve a vector from the cache.
   * @param {string} key - Unique key for the vector.
   * @returns {Promise<number[]|null>} - The vector if found, or null if not found.
   */
  async retrieve(key) {
    const inMemory = this.cache.get(key);
    if (inMemory) return inMemory;
    if (this.useRedis) {
      const redisValue = await this.redisClient.get(key);
      if (redisValue) {
        const vector = JSON.parse(redisValue);
        this.cache.put(key, vector);
        return vector;
      }
    }
    return null;
  }

  /**
   * Close the Redis connection (if applicable).
   */
  async close() {
    if (this.useRedis && this.redisClient) {
      await this.redisClient.quit();
    }
  }
}

module.exports = InMemoryVectorCache;