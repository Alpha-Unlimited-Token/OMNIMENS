/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: memoryCacheRedis
 * Purpose: Store and retrieve embeddings and vectorized data in-memory for fast access.
 * Description: Stores and retrieves embeddings in-memory using Redis for fast access, enabling OMNIMENS to perform efficient reasoning and memory augmentation.
 * Migrated: 2026-03-25T22:49:34.243Z
 */

// memoryCacheRedis.js

/**
 * @module memoryCacheRedis
 * @description A utility module for storing and retrieving embeddings and vectorized data in-memory using Redis with TTL-based eviction policies.
 */

import { createClient } from 'redis';

/**
 * Initializes a Redis client for memory caching.
 * @returns {RedisClient} A connected Redis client.
 */
function initializeRedisClient() {
  const client = createClient();
  client.on('error', (err) => console.error('Redis Client Error', err));
  await client.connect();
  return client;
}

/**
 * Stores an embedding in Redis with a specified TTL.
 * @param {RedisClient} client - The Redis client instance.
 * @param {string} key - The key under which the embedding is stored.
 * @param {string} value - The embedding or vectorized data to store.
 * @param {number} ttl - Time-to-live in seconds for the key.
 * @returns {Promise<void>} Resolves when the data is stored.
 */
async function storeEmbedding(client, key, value, ttl) {
  if (!key || !value || ttl <= 0) {
    throw new Error('Invalid arguments: key, value, and ttl must be provided and valid.');
  }
  await client.set(key, value, {
    EX: ttl
  });
}

/**
 * Retrieves an embedding from Redis.
 * @param {RedisClient} client - The Redis client instance.
 * @param {string} key - The key of the embedding to retrieve.
 * @returns {Promise<string|null>} The retrieved embedding or null if not found.
 */
async function retrieveEmbedding(client, key) {
  if (!key) {
    throw new Error('Invalid argument: key must be provided.');
  }
  const value = await client.get(key);
  return value;
}

/**
 * Deletes an embedding from Redis.
 * @param {RedisClient} client - The Redis client instance.
 * @param {string} key - The key of the embedding to delete.
 * @returns {Promise<void>} Resolves when the key is deleted.
 */
async function deleteEmbedding(client, key) {
  if (!key) {
    throw new Error('Invalid argument: key must be provided.');
  }
  await client.del(key);
}

/**
 * Closes the Redis client connection.
 * @param {RedisClient} client - The Redis client instance.
 * @returns {Promise<void>} Resolves when the connection is closed.
 */
async function closeRedisClient(client) {
  await client.quit();
}

export {
  initializeRedisClient,
  storeEmbedding,
  retrieveEmbedding,
  deleteEmbedding,
  closeRedisClient
};