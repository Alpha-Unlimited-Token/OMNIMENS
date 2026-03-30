/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: vectorStoreRedis
 * Purpose: Simulate an in-memory vector store for embeddings.
 * Description: Simulates an in-memory vector store for embeddings using Redis, enabling OMNIMENS to efficiently store and retrieve knowledge representations.
 * Migrated: 2026-03-25T22:49:34.266Z
 */

/**
 * @module vectorStoreRedis
 * @description A module to simulate an in-memory vector store for embeddings using Redis for fast key-based access.
 * @requires Node.js 20+ with no external dependencies.
 */

const { createClient } = require('redis');

/**
 * Creates and manages a Redis-backed vector store.
 * @class
 */
class VectorStoreRedis {
  /**
   * Initializes the Redis client and connects to the Redis server.
   * @param {Object} [options] - Configuration options for the Redis client.
   * @param {string} [options.url="redis://localhost:6379"] - Redis connection URL.
   */
  constructor(options = {}) {
    const { url = 'redis://localhost:6379' } = options;
    this.client = createClient({ url });
    this.connected = false;
  }

  /**
   * Connects to the Redis server.
   * @returns {Promise<void>} Resolves when the connection is established.
   */
  async connect() {
    if (!this.connected) {
      await this.client.connect();
      this.connected = true;
    }
  }

  /**
   * Disconnects from the Redis server.
   * @returns {Promise<void>} Resolves when the connection is closed.
   */
  async disconnect() {
    if (this.connected) {
      await this.client.disconnect();
      this.connected = false;
    }
  }

  /**
   * Stores a vector (embedding) in the Redis store.
   * @param {string} key - The key to associate with the vector.
   * @param {number[]} vector - The embedding vector to store.
   * @returns {Promise<void>} Resolves when the vector is successfully stored.
   * @throws {Error} If the key or vector is invalid.
   */
  async storeVector(key, vector) {
    if (typeof key !== 'string' || !Array.isArray(vector) || vector.some(isNaN)) {
      throw new Error('Invalid key or vector format. Key must be a string and vector must be an array of numbers.');
    }
    const vectorString = JSON.stringify(vector);
    await this.client.set(key, vectorString);
  }

  /**
   * Retrieves a vector (embedding) from the Redis store.
   * @param {string} key - The key associated with the vector.
   * @returns {Promise<number[]|null>} Resolves with the retrieved vector, or null if the key does not exist.
   */
  async getVector(key) {
    if (typeof key !== 'string') {
      throw new Error('Key must be a string.');
    }
    const vectorString = await this.client.get(key);
    return vectorString ? JSON.parse(vectorString) : null;
  }

  /**
   * Deletes a vector (embedding) from the Redis store.
   * @param {string} key - The key associated with the vector.
   * @returns {Promise<boolean>} Resolves with true if the key was deleted, false otherwise.
   */
  async deleteVector(key) {
    if (typeof key !== 'string') {
      throw new Error('Key must be a string.');
    }
    const result = await this.client.del(key);
    return result > 0;
  }

  /**
   * Retrieves all keys currently stored in the Redis store.
   * @returns {Promise<string[]>} Resolves with an array of all keys.
   */
  async listKeys() {
    return await this.client.keys('*');
  }
}

/**
 * Exports the VectorStoreRedis class.
 */
module.exports = { VectorStoreRedis };