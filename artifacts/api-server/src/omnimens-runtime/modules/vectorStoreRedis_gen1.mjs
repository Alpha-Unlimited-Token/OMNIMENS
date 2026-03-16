// vectorStoreRedis.js

/**
 * Module for storing and retrieving embeddings using Redis for semantic search and reasoning.
 * Implements approximate nearest neighbor search for efficient queries.
 */

const { createClient } = require('redis');

/**
 * Redis client instance.
 * @type {RedisClientType}
 */
let redisClient;

/**
 * Initializes the Redis client.
 * @param {string} url - Redis connection string (e.g., 'redis://localhost:6379').
 * @returns {Promise<void>} Resolves when the client is ready.
 */
export async function initializeRedis(url) {
  redisClient = createClient({ url });
  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  await redisClient.connect();
}

/**
 * Stores an embedding in Redis.
 * @param {string} key - Unique identifier for the embedding.
 * @param {number[]} embedding - Array representing the embedding vector.
 * @returns {Promise<void>} Resolves when the embedding is stored.
 */
export async function storeEmbedding(key, embedding) {
  if (!redisClient) throw new Error('Redis client not initialized. Call initializeRedis first.');
  if (!Array.isArray(embedding) || embedding.some(isNaN)) {
    throw new Error('Invalid embedding: Must be an array of numbers.');
  }
  await redisClient.hSet('embeddings', key, JSON.stringify(embedding));
}

/**
 * Retrieves an embedding from Redis.
 * @param {string} key - Unique identifier for the embedding.
 * @returns {Promise<number[]>} Resolves with the embedding vector, or null if not found.
 */
export async function retrieveEmbedding(key) {
  if (!redisClient) throw new Error('Redis client not initialized. Call initializeRedis first.');
  const result = await redisClient.hGet('embeddings', key);
  return result ? JSON.parse(result) : null;
}

/**
 * Finds the nearest neighbors to a given query embedding.
 * @param {number[]} queryEmbedding - The embedding vector to search for.
 * @param {number} k - Number of nearest neighbors to retrieve.
 * @returns {Promise<Array<{ key: string, distance: number }>>} Resolves with an array of nearest neighbors.
 */
export async function findNearestNeighbors(queryEmbedding, k) {
  if (!redisClient) throw new Error('Redis client not initialized. Call initializeRedis first.');
  if (!Array.isArray(queryEmbedding) || queryEmbedding.some(isNaN)) {
    throw new Error('Invalid query embedding: Must be an array of numbers.');
  }
  if (k <= 0) throw new Error('Invalid k: Must be a positive integer.');

  const embeddings = await redisClient.hGetAll('embeddings');
  const parsedEmbeddings = Object.entries(embeddings).map(([key, value]) => ({
    key,
    embedding: JSON.parse(value)
  }));

  const distances = parsedEmbeddings.map(({ key, embedding }) => ({
    key,
    distance: cosineSimilarity(queryEmbedding, embedding)
  }));

  distances.sort((a, b) => a.distance - b.distance);
  return distances.slice(0, k);
}

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} Cosine similarity score.
 */
function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Closes the Redis client connection.
 * @returns {Promise<void>} Resolves when the client is closed.
 */
export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}