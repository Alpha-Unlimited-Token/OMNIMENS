// redisVectorStore.js

/**
 * @module redisVectorStore
 * @description In-memory vector storage for fast similarity search and embedding indexing using Redis.
 * This module leverages Redis sorted sets and hash maps to store and query high-dimensional vectors efficiently.
 */

// STUBBED: import { createClient } from "redis";
const createClient = () => ({ connect: async()=>{}, get: async()=>null, set: async()=>{}, del: async()=>{}, quit: async()=>{}, on:()=>{} });

/**
 * Initialize a Redis client.
 * @returns {RedisClientType} Redis client instance.
 */
export async function initializeRedisClient() {
  const client = createClient();
  client.on('error', (err) => console.error('Redis Client Error', err));
  await client.connect();
  return client;
}

/**
 * Add a vector to the Redis store.
 * @param {RedisClientType} client - Redis client instance.
 * @param {string} key - The key for the vector store.
 * @param {string} id - Unique identifier for the vector.
 * @param {number[]} vector - High-dimensional vector.
 */
export async function addVector(client, key, id, vector) {
  const vectorString = JSON.stringify(vector);
  await client.hSet(key, id, vectorString);
  const magnitude = calculateMagnitude(vector);
  await client.zAdd(`${key}:index`, { score: magnitude, value: id });
}

/**
 * Retrieve a vector from the Redis store.
 * @param {RedisClientType} client - Redis client instance.
 * @param {string} key - The key for the vector store.
 * @param {string} id - Unique identifier for the vector.
 * @returns {number[] | null} The vector or null if not found.
 */
export async function getVector(client, key, id) {
  const vectorString = await client.hGet(key, id);
  return vectorString ? JSON.parse(vectorString) : null;
}

/**
 * Perform similarity search for a given query vector.
 * @param {RedisClientType} client - Redis client instance.
 * @param {string} key - The key for the vector store.
 * @param {number[]} queryVector - Query vector for similarity search.
 * @param {number} topN - Number of top similar vectors to retrieve.
 * @returns {Promise<Array<{id: string, similarity: number}>>} List of top N similar vectors.
 */
export async function similaritySearch(client, key, queryVector, topN) {
  const allVectors = await client.hGetAll(key);
  const results = [];

  for (const [id, vectorString] of Object.entries(allVectors)) {
    const vector = JSON.parse(vectorString);
    const similarity = cosineSimilarity(queryVector, vector);
    results.push({ id, similarity });
  }

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topN);
}

/**
 * Calculate the magnitude of a vector.
 * @param {number[]} vector - High-dimensional vector.
 * @returns {number} Magnitude of the vector.
 */
function calculateMagnitude(vector) {
  return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
}

/**
 * Compute cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} Cosine similarity score.
 */
function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = calculateMagnitude(vectorA);
  const magnitudeB = calculateMagnitude(vectorB);
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Remove a vector from the Redis store.
 * @param {RedisClientType} client - Redis client instance.
 * @param {string} key - The key for the vector store.
 * @param {string} id - Unique identifier for the vector.
 */
export async function removeVector(client, key, id) {
  await client.hDel(key, id);
  await client.zRem(`${key}:index`, id);
}

/**
 * Close the Redis client connection.
 * @param {RedisClientType} client - Redis client instance.
 */
export async function closeRedisClient(client) {
  await client.quit();
}

