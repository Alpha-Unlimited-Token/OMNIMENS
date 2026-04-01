/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_34
 * Name: contextReconstructionEnhancer
 * Purpose: Improves long-term token window fidelity by reconstructing context using learned embeddings.
 * Description: Enhances long-term context fidelity via embedding-based reconstruction and hierarchical summarization.
 * Migrated: 2026-04-01T22:23:20.242Z
 */

// contextReconstructionEnhancer.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash-based unique identifier for a given input string.
 * Useful for caching and identifying reconstructed contexts.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Computes a cosine similarity score between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity score in the range [-1, 1].
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Hierarchically summarizes a large context into smaller, manageable chunks.
 * @param {string[]} contextChunks - Array of context strings.
 * @param {number} maxChunks - Maximum number of chunks to retain.
 * @returns {string[]} - Summarized context chunks.
 */
export function hierarchicalSummarization(contextChunks, maxChunks) {
  if (contextChunks.length <= maxChunks) {
    return contextChunks;
  }

  const summarizedChunks = [];

  for (let i = 0; i < contextChunks.length; i += 2) {
    const chunkA = contextChunks[i];
    const chunkB = contextChunks[i + 1] || '';
    summarizedChunks.push(`${chunkA} ${chunkB}`.trim());
  }

  return hierarchicalSummarization(summarizedChunks, maxChunks);
}

/**
 * Reconstructs context using embeddings and similarity scoring.
 * @param {string[]} contextChunks - Array of context strings.
 * @param {number[][]} embeddings - Array of embedding vectors corresponding to contextChunks.
 * @param {number[]} queryEmbedding - Embedding vector for the query.
 * @param {number} threshold - Similarity threshold for context inclusion.
 * @returns {string[]} - Reconstructed context chunks.
 */
export function reconstructContext(contextChunks, embeddings, queryEmbedding, threshold = 0.5) {
  if (contextChunks.length !== embeddings.length) {
    throw new Error('Context chunks and embeddings must have the same length');
  }

  return contextChunks.filter((_, i) => cosineSimilarity(embeddings[i], queryEmbedding) >= threshold);
}

/**
 * Combines hierarchical summarization and embedding-based reconstruction.
 * @param {string[]} contextChunks - Array of context strings.
 * @param {number[][]} embeddings - Array of embedding vectors corresponding to contextChunks.
 * @param {number[]} queryEmbedding - Embedding vector for the query.
 * @param {number} maxChunks - Maximum number of chunks to retain after summarization.
 * @param {number} threshold - Similarity threshold for context inclusion.
 * @returns {string[]} - Enhanced reconstructed context.
 */
export function enhanceContext(contextChunks, embeddings, queryEmbedding, maxChunks, threshold = 0.5) {
  const reconstructed = reconstructContext(contextChunks, embeddings, queryEmbedding, threshold);
  return hierarchicalSummarization(reconstructed, maxChunks);
}

/**
 * Utility to normalize a vector to unit length.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  return magnitude === 0 ? vector : vector.map(val => val / magnitude);
}
