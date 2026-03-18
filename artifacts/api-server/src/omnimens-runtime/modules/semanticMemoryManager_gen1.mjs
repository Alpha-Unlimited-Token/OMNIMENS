/**
 * @module semanticMemoryManager
 * @description Provides fast semantic search and retrieval using Redis-based vector stores for approximate nearest neighbor search.
 */

const { createClient } = require('redis');
const crypto = require('crypto');

/**
 * @class SemanticMemoryManager
 * @description Class to manage semantic memory using Redis and vector-based search.
 */
class SemanticMemoryManager {
  /**
   * @constructor
   * @param {Object} config - Configuration object.
   * @param {string} config.redisHost - Redis server hostname.
   * @param {number} config.redisPort - Redis server port.
   */
  constructor({ redisHost = '127.0.0.1', redisPort = 6379 } = {}) {
    this.redisClient = createClient({ socket: { host: redisHost, port: redisPort } });
    this.namespace = 'semanticMemory';
  }

  /**
   * Connects to the Redis server.
   * @returns {Promise<void>} Resolves when connection is established.
   */
  async connect() {
    await this.redisClient.connect();
  }

  /**
   * Disconnects from the Redis server.
   * @returns {Promise<void>} Resolves when connection is closed.
   */
  async disconnect() {
    await this.redisClient.disconnect();
  }

  /**
   * Stores a vector embedding and its associated metadata in Redis.
   * @param {string} key - Unique identifier for the embedding.
   * @param {Array<number>} embedding - Vector embedding to store.
   * @param {Object} metadata - Associated metadata.
   * @returns {Promise<void>} Resolves when the embedding is stored.
   */
  async storeEmbedding(key, embedding, metadata = {}) {
    const vectorKey = `${this.namespace}:vector:${key}`;
    const metaKey = `${this.namespace}:meta:${key}`;

    await this.redisClient.hSet(vectorKey, 'vector', JSON.stringify(embedding));
    await this.redisClient.hSet(metaKey, metadata);
  }

  /**
   * Performs an approximate nearest neighbor search.
   * @param {Array<number>} queryVector - The query vector.
   * @param {number} topK - Number of nearest neighbors to return.
   * @returns {Promise<Array<{ key: string, score: number, metadata: Object }>>} List of nearest neighbors.
   */
  async search(queryVector, topK = 5) {
    const keys = await this.redisClient.keys(`${this.namespace}:vector:*`);
    const results = [];

    for (const key of keys) {
      const vectorString = await this.redisClient.hGet(key, 'vector');
      const vector = JSON.parse(vectorString);
      const score = this._cosineSimilarity(queryVector, vector);
      results.push({ key: key.replace(`${this.namespace}:vector:`, ''), score });
    }

    results.sort((a, b) => b.score - a.score);

    const topResults = results.slice(0, topK);
    for (const result of topResults) {
      const metaKey = `${this.namespace}:meta:${result.key}`;
      result.metadata = await this.redisClient.hGetAll(metaKey);
    }

    return topResults;
  }

  /**
   * Calculates the cosine similarity between two vectors.
   * @private
   * @param {Array<number>} vectorA - First vector.
   * @param {Array<number>} vectorB - Second vector.
   * @returns {number} Cosine similarity score.
   */
  _cosineSimilarity(vectorA, vectorB) {
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

module.exports = SemanticMemoryManager;