/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_22
 * Name: customNLGEngine
 * Purpose: Generate natural language output directly using OMNIMENS' neural cognition engine without external LLMs.
 * Description: A transformer-inspired natural language generation engine with attention, embedding composition, and utility functions for multi-agent systems.
 * Migrated: 2026-04-02T14:21:19.470Z
 */

// Complete ES module code here

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given input string using SHA-256.
 * Useful for creating unique identifiers across agents.
 * @param {string} input - The input string to hash.
 * @returns {string} - The resulting SHA-256 hash as a hexadecimal string.
 */
export function generateHash(input) {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string');
  }
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Applies a transformer-inspired attention mechanism to a set of embeddings.
 * @param {Array<Array<number>>} embeddings - A 2D array of embeddings (rows are vectors).
 * @param {Array<number>} query - A 1D array representing the query vector.
 * @returns {Array<number>} - A weighted sum of the embeddings based on attention scores.
 */
export function attentionMechanism(embeddings, query) {
  if (!Array.isArray(embeddings) || !Array.isArray(query)) {
    throw new TypeError('Embeddings and query must be arrays');
  }
  if (embeddings.some(row => !Array.isArray(row) || row.length !== query.length)) {
    throw new Error('Each embedding must be an array of the same length as the query');
  }

  const dotProduct = (vec1, vec2) => vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const softmax = (scores) => {
    const expScores = scores.map(Math.exp);
    const sumExp = expScores.reduce((sum, val) => sum + val, 0);
    return expScores.map(val => val / sumExp);
  };

  const scores = embeddings.map(embedding => dotProduct(embedding, query));
  const attentionWeights = softmax(scores);

  return embeddings[0].map((_, colIndex) => {
    return embeddings.reduce((sum, embedding, rowIndex) => sum + embedding[colIndex] * attentionWeights[rowIndex], 0);
  });
}

/**
 * Combines multiple embeddings into a single compositional vector.
 * @param {Array<Array<number>>} embeddings - A 2D array of embeddings to combine.
 * @returns {Array<number>} - A single vector representing the combined embeddings.
 */
export function combineEmbeddings(embeddings) {
  if (!Array.isArray(embeddings) || embeddings.some(row => !Array.isArray(row))) {
    throw new TypeError('Embeddings must be a 2D array');
  }
  const vectorLength = embeddings[0].length;
  if (embeddings.some(row => row.length !== vectorLength)) {
    throw new Error('All embeddings must have the same length');
  }

  return embeddings[0].map((_, colIndex) => {
    return embeddings.reduce((sum, embedding) => sum + embedding[colIndex], 0) / embeddings.length;
  });
}

/**
 * Generates a natural language output based on embeddings and a query.
 * @param {Array<Array<number>>} embeddings - A 2D array of embeddings representing context.
 * @param {Array<number>} query - A 1D array representing the query vector.
 * @param {Array<string>} vocabulary - A list of words corresponding to the embeddings.
 * @returns {string} - The generated natural language output.
 */
export function generateText(embeddings, query, vocabulary) {
  if (!Array.isArray(vocabulary) || !Array.isArray(embeddings) || !Array.isArray(query)) {
    throw new TypeError('Embeddings, query, and vocabulary must be arrays');
  }
  if (embeddings.length !== vocabulary.length) {
    throw new Error('Embeddings and vocabulary must have the same length');
  }

  const attentionResult = attentionMechanism(embeddings, query);
  const bestMatchIndex = attentionResult.indexOf(Math.max(...attentionResult));
  return vocabulary[bestMatchIndex] || '';
}

/**
 * Calculates cosine similarity between two vectors.
 * @param {Array<number>} vec1 - First vector.
 * @param {Array<number>} vec2 - Second vector.
 * @returns {number} - Cosine similarity score between -1 and 1.
 */
export function cosineSimilarity(vec1, vec2) {
  if (!Array.isArray(vec1) || !Array.isArray(vec2) || vec1.length !== vec2.length) {
    throw new TypeError('Vectors must be arrays of the same length');
  }

  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

  return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
}
