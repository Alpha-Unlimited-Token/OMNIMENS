/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: semanticMemoryManager
 * Purpose: Store and retrieve session-based semantic embeddings for long-term memory.
 * Description: Stores and retrieves semantic embeddings for long-term memory using cosine similarity and a Redis-like vector store, enabling OMNIMENS's self-evolution.
 * Migrated: 2026-03-25T22:49:34.223Z
 */

/**
 * semanticMemoryManager.js
 * 
 * This module provides functionality to store and retrieve session-based semantic embeddings
 * for long-term memory using a Redis-backed vector store and cosine similarity.
 * Designed for Node.js 20+ with no external dependencies.
 */

const { createHash } = require('crypto');

/**
 * In-memory store simulating Redis for vector embeddings.
 * This is a placeholder for actual Redis integration.
 */
const vectorStore = {};

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity value between -1 and 1.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Generates a unique hash key for a given session and input.
 * @param {string} sessionId - Unique identifier for the session.
 * @param {string} input - Semantic input to hash.
 * @returns {string} - Generated hash key.
 */
function generateKey(sessionId, input) {
  const hash = createHash('sha256');
  hash.update(`${sessionId}:${input}`);
  return hash.digest('hex');
}

/**
 * Stores a semantic embedding in the vector store.
 * @param {string} sessionId - Unique identifier for the session.
 * @param {string} input - Semantic input.
 * @param {number[]} embedding - Vector representation of the input.
 */
function storeEmbedding(sessionId, input, embedding) {
  const key = generateKey(sessionId, input);
  vectorStore[key] = { sessionId, input, embedding };
}

/**
 * Searches for the most similar embedding in the vector store.
 * @param {string} sessionId - Unique identifier for the session.
 * @param {number[]} queryEmbedding - Vector representation of the query.
 * @returns {Object|null} - Most similar embedding object or null if no match found.
 */
function searchEmbedding(sessionId, queryEmbedding) {
  let bestMatch = null;
  let highestSimilarity = -Infinity;

  for (const key in vectorStore) {
    const { sessionId: storedSessionId, embedding } = vectorStore[key];
    if (storedSessionId === sessionId) {
      const similarity = cosineSimilarity(queryEmbedding, embedding);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = vectorStore[key];
      }
    }
  }

  return bestMatch;
}

/**
 * Clears all embeddings for a given session.
 * @param {string} sessionId - Unique identifier for the session.
 */
function clearSessionEmbeddings(sessionId) {
  for (const key in vectorStore) {
    if (vectorStore[key].sessionId === sessionId) {
      delete vectorStore[key];
    }
  }
}

module.exports = {
  cosineSimilarity,
  storeEmbedding,
  searchEmbedding,
  clearSessionEmbeddings
};