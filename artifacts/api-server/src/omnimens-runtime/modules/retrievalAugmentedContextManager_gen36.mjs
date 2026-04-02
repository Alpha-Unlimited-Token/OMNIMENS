/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: retrievalAugmentedContextManager
 * Written: 2026-04-02T14:26:10.894Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// retrievalAugmentedContextManager.mjs
import { createHash } from 'crypto';

/**
 * Hashes a string input to create a deterministic key for indexing.
 * Useful for creating unique keys for context storage.
 * @param {string} input - The string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHashKey(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity score between -1 and 1.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Performs approximate k-NN search to find the most relevant context.
 * @param {Array<{id, vector}>} contextVectors - Array of stored context vectors.
 * @param {number[]} queryVector - Query vector for similarity search.
 * @param {number} k - Number of nearest neighbors to retrieve.
 * @returns {Array<{id, similarity}>} - Sorted array of k nearest contexts with similarity scores.
 */
export function approximateKNN(contextVectors, queryVector, k = 5) {
  const scoredContexts = contextVectors.map(({ id, vector }) => ({
    id,
    similarity: cosineSimilarity(vector, queryVector)
  }));

  return scoredContexts
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
}

/**
 * Hierarchically summarizes a large text input into smaller chunks.
 * @param {string} text - The input text to summarize.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @returns {string[]} - Array of summarized text chunks.
 */
export function hierarchicalSummarization(text, chunkSize = 500) {
  const sentences = text.split('. ');
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += sentence + '. ';
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Merges relevant context into working memory based on similarity.
 * @param {string} query - Query text to retrieve relevant context.
 * @param {Array<{id, vector, content}>} contextStore - Stored context with vectors and content.
 * @param {function(string): number[]} vectorizer - Function to convert text into a vector.
 * @param {number} k - Number of relevant contexts to retrieve.
 * @returns {string} - Merged context and query as a single string.
 */
export function mergeRelevantContext(query, contextStore, vectorizer, k = 5) {
  const queryVector = vectorizer(query);
  const nearestContexts = approximateKNN(
    contextStore.map(({ id, vector }) => ({ id, vector })),
    queryVector,
    k
  );

  const relevantContent = nearestContexts
    .map(({ id }) => contextStore.find(ctx => ctx.id === id)?.content)
    .filter(Boolean)
    .join('\n');

  return `${relevantContent}\nQuery:\n${query}`;
}

/**
 * Example vectorizer function (dummy implementation for demonstration).
 * Converts text into a simple vector based on character codes.
 * Replace with a more sophisticated embedding model for real use.
 * @param {string} text - Input text to vectorize.
 * @returns {number[]} - Vector representation of the text.
 */
export function simpleVectorizer(text) {
  return text.split('').map(char => char.charCodeAt(0) % 256);
}
