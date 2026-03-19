/**
 * @module vectorStore_redis
 * @description Provides an in-memory vector store for embedding retrieval and similarity search using Redis.
 */

const { createClient } = require('redis');

/**
 * Initializes a Redis client for vector storage.
 * @returns {Promise<RedisClient>} A connected Redis client instance.
 */
async function initializeRedisClient() {
  const client = createClient();

  client.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  await client.connect();
  return client;
}

/**
 * Stores a vector embedding in Redis.
 * @param {RedisClient} client - The Redis client instance.
 * @param {string} key - The unique key for the vector.
 * @param {number[]} vector - The vector embedding to store.
 * @returns {Promise<void>} Resolves when the vector is stored.
 */
async function storeVector(client, key, vector) {
  if (!Array.isArray(vector) || vector.some(isNaN)) {
    throw new Error('Vector must be an array of numbers.');
  }

  const vectorString = JSON.stringify(vector);
  await client.set(key, vectorString);
}

/**
 * Retrieves a vector embedding from Redis.
 * @param {RedisClient} client - The Redis client instance.
 * @param {string} key - The unique key for the vector.
 * @returns {Promise<number[]>} The retrieved vector embedding.
 */
async function getVector(client, key) {
  const vectorString = await client.get(key);
  if (!vectorString) {
    throw new Error(`Vector with key '${key}' not found.`);
  }

  return JSON.parse(vectorString);
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The cosine similarity score.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Vectors must not be zero vectors.');
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Finds the nearest neighbor to a query vector in Redis.
 * @param {RedisClient} client - The Redis client instance.
 * @param {number[]} queryVector - The query vector.
 * @param {string[]} keys - The keys of the stored vectors to search.
 * @returns {Promise<{ key: string, similarity: number }>} The nearest neighbor and its similarity score.
 */
async function findNearestNeighbor(client, queryVector, keys) {
  let nearestNeighbor = null;
  let highestSimilarity = -Infinity;

  for (const key of keys) {
    const storedVector = await getVector(client, key);
    const similarity = cosineSimilarity(queryVector, storedVector);

    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      nearestNeighbor = key;
    }
  }

  return { key: nearestNeighbor, similarity: highestSimilarity };
}

/**
 * Closes the Redis client connection.
 * @param {RedisClient} client - The Redis client instance.
 * @returns {Promise<void>} Resolves when the connection is closed.
 */
async function closeRedisClient(client) {
  await client.disconnect();
}

module.exports = {
  initializeRedisClient,
  storeVector,
  getVector,
  cosineSimilarity,
  findNearestNeighbor,
  closeRedisClient
};