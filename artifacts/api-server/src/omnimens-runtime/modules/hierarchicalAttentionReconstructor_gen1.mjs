/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_24
 * Name: hierarchicalAttentionReconstructor
 * Purpose: Reconstructs nuanced interdependencies lost during token window compression.
 * Description: Reconstructs nuanced interdependencies in compressed embeddings using hierarchical attention and recursive refinement.
 * Migrated: 2026-04-02T14:21:19.471Z
 */

// hierarchicalAttentionReconstructor.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash-based unique ID for embeddings to ensure consistent tracking.
 * Useful across agents to identify and manage embeddings.
 */
export function generateEmbeddingId(embedding) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(embedding));
  return hash.digest('hex');
}

/**
 * Calculates attention weights for embeddings based on their importance.
 * @param {Array<number>} embedding - The input embedding vector.
 * @param {Array<number>} importanceWeights - The weights corresponding to each dimension.
 * @returns {Array<number>} - The weighted embedding.
 */
export function applyAttentionWeights(embedding, importanceWeights) {
  if (embedding.length !== importanceWeights.length) {
    throw new Error('Embedding and importance weights must have the same length.');
  }
  return embedding.map((value, index) => value * importanceWeights[index]);
}

/**
 * Recursively reconstructs hierarchical interdependencies in compressed embeddings.
 * @param {Array<Array<number>>} compressedEmbeddings - Array of compressed embedding vectors.
 * @param {number} recursionDepth - The depth of recursive reconstruction.
 * @returns {Array<number>} - The reconstructed embedding.
 */
export function reconstructEmbedding(compressedEmbeddings, recursionDepth) {
  if (recursionDepth <= 0 || compressedEmbeddings.length === 1) {
    return compressedEmbeddings[0];
  }

  const mergedEmbedding = compressedEmbeddings.reduce((acc, embedding) => {
    return acc.map((value, index) => value + embedding[index]);
  });

  const normalizedEmbedding = mergedEmbedding.map(value => value / compressedEmbeddings.length);

  return reconstructEmbedding([normalizedEmbedding], recursionDepth - 1);
}

/**
 * Normalizes an embedding vector to unit length.
 * @param {Array<number>} embedding - The input embedding vector.
 * @returns {Array<number>} - The normalized embedding.
 */
export function normalizeEmbedding(embedding) {
  const magnitude = Math.sqrt(embedding.reduce((sum, value) => sum + value ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero-magnitude embedding.');
  }
  return embedding.map(value => value / magnitude);
}

/**
 * Combines multiple embeddings into a single hierarchical representation.
 * @param {Array<Array<number>>} embeddings - Array of embedding vectors.
 * @param {Array<number>} importanceWeights - Importance weights for each embedding.
 * @returns {Array<number>} - The combined hierarchical embedding.
 */
export function combineEmbeddings(embeddings, importanceWeights) {
  if (embeddings.length !== importanceWeights.length) {
    throw new Error('Number of embeddings must match the number of importance weights.');
  }

  const weightedEmbeddings = embeddings.map((embedding, index) => 
    applyAttentionWeights(embedding, Array(embedding.length).fill(importanceWeights[index]))
  );

  const combinedEmbedding = weightedEmbeddings.reduce((acc, embedding) => {
    return acc.map((value, index) => value + embedding[index]);
  });

  return normalizeEmbedding(combinedEmbedding);
}

/**
 * Validates an embedding to ensure it is a valid numeric vector.
 * @param {Array<number>} embedding - The embedding to validate.
 * @returns {boolean} - True if valid, otherwise throws an error.
 */
export function validateEmbedding(embedding) {
  if (!Array.isArray(embedding) || !embedding.every(Number.isFinite)) {
    throw new Error('Embedding must be an array of finite numbers.');
  }
  return true;
}

/**
 * Utility function for multi-agent systems to reconstruct and refine embeddings.
 * @param {Array<Array<number>>} embeddings - Array of embedding vectors.
 * @param {Array<number>} importanceWeights - Importance weights for each embedding.
 * @param {number} recursionDepth - Depth of hierarchical reconstruction.
 * @returns {Array<number>} - The refined hierarchical embedding.
 */
export function refineHierarchicalEmbedding(embeddings, importanceWeights, recursionDepth) {
  embeddings.forEach(validateEmbedding);
  const combined = combineEmbeddings(embeddings, importanceWeights);
  return reconstructEmbedding([combined], recursionDepth);
}