// vectorStoreRedis.js

/**
 * @module vectorStoreRedis
 * @description This module provides efficient similarity search and dynamic embedding updates using Redis with vector indexing.
 */

const net = require('net');

/**
 * Sends a command to the Redis server and returns the response.
 * @param {string} command - The Redis command to execute.
 * @returns {Promise<string>} - The response from the Redis server.
 */
async function sendRedisCommand(command) {
  return new Promise((resolve, reject) => {
    const client = net.createConnection({ host: '127.0.0.1', port: 6379 }, () => {
      client.write(`${command}\r\n`);
    });

    let response = '';
    client.on('data', (data) => {
      response += data.toString();
      if (response.includes('\r\n')) {
        client.end();
      }
    });

    client.on('end', () => resolve(response.trim()));
    client.on('error', (err) => reject(err));
  });
}

/**
 * Adds or updates a vector in the Redis vector store.
 * @param {string} key - The key for the vector.
 * @param {number[]} vector - The embedding vector.
 * @returns {Promise<void>} - Resolves when the operation is complete.
 */
async function addOrUpdateVector(key, vector) {
  const vectorString = vector.join(' ');
  await sendRedisCommand(`HSET ${key} vector "${vectorString}"`);
}

/**
 * Searches for the nearest neighbors of a given vector in the Redis vector store.
 * @param {number[]} queryVector - The query vector.
 * @param {number} k - The number of nearest neighbors to retrieve.
 * @returns {Promise<Object[]>} - The nearest neighbors and their similarity scores.
 */
async function searchNearestNeighbors(queryVector, k) {
  const queryString = queryVector.join(' ');
  const response = await sendRedisCommand(`FT.SEARCH my_vector_index "[${queryString}]=>[KNN ${k}]"`);

  // Parse response (basic parsing for demonstration purposes)
  const results = response.split('\n').slice(1).map((line) => {
    const [key, score] = line.split(' ');
    return { key, score: parseFloat(score) };
  });

  return results;
}

/**
 * Creates a vector index in Redis for efficient similarity search.
 * @param {string} indexName - The name of the index.
 * @returns {Promise<void>} - Resolves when the index is created.
 */
async function createVectorIndex(indexName) {
  await sendRedisCommand(`FT.CREATE ${indexName} ON HASH PREFIX 1 vector SCHEMA vector VECTOR FLAT 6 DIM 128 DISTANCE COSINE`);
}

/**
 * Deletes a vector from the Redis vector store.
 * @param {string} key - The key for the vector to delete.
 * @returns {Promise<void>} - Resolves when the vector is deleted.
 */
async function deleteVector(key) {
  await sendRedisCommand(`DEL ${key}`);
}

module.exports = {
  addOrUpdateVector,
  searchNearestNeighbors,
  createVectorIndex,
  deleteVector
};