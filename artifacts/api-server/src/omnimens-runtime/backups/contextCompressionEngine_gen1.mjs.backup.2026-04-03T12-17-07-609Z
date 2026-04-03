/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_7
 * Name: contextCompressionEngine
 * Purpose: Summarizes and embeds extended conversational context into a compact representation to persist beyond token window limits.
 * Description: Summarizes and embeds extended conversational context into compact memory vectors for persistence and multi-agent utility.
 * Migrated: 2026-04-01T22:23:20.231Z
 */

// contextCompressionEngine.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash-based identifier for context chunks to ensure uniqueness.
 * @param {string} input - The input string to hash.
 * @returns {string} - A compact hash representation.
 */
export function generateContextHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex').slice(0, 16); // Compact representation
}

/**
 * Computes sentence-level embeddings using a simple token frequency vector.
 * @param {string} sentence - A single sentence.
 * @returns {Map<string, number>} - Token frequency vector.
 */
export function computeSentenceEmbedding(sentence) {
  const tokens = sentence.toLowerCase().split(/\W+/).filter(Boolean);
  const embedding = new Map();
  for (const token of tokens) {
    embedding.set(token, (embedding.get(token) || 0) + 1);
  }
  return embedding;
}

/**
 * Merges multiple embeddings into a single hierarchical representation.
 * @param {Array<Map<string, number>>} embeddings - Array of sentence embeddings.
 * @returns {Map<string, number>} - Hierarchical attention-weighted embedding.
 */
export function mergeEmbeddings(embeddings) {
  const merged = new Map();
  for (const embedding of embeddings) {
    for (const [token, weight] of embedding.entries()) {
      merged.set(token, (merged.get(token) || 0) + weight);
    }
  }
  return merged;
}

/**
 * Compresses extended conversational context into a compact representation.
 * @param {Array<string>} context - Array of sentences representing the conversation.
 * @returns {Object} - Compressed memory vector with hash and embedding.
 */
export function compressContext(context) {
  const embeddings = context.map(computeSentenceEmbedding);
  const compressedEmbedding = mergeEmbeddings(embeddings);
  const contextHash = generateContextHash(context.join(' '));
  return { hash: contextHash, embedding: compressedEmbedding };
}

/**
 * Converts an embedding map into a JSON-compatible object.
 * @param {Map<string, number>} embedding - The embedding map.
 * @returns {Object} - JSON-compatible object representation.
 */
export function serializeEmbedding(embedding) {
  const serialized = {};
  for (const [key, value] of embedding.entries()) {
    serialized[key] = value;
  }
  return serialized;
}

/**
 * Restores an embedding map from a serialized JSON-compatible object.
 * @param {Object} serialized - JSON-compatible object representation.
 * @returns {Map<string, number>} - Restored embedding map.
 */
export function deserializeEmbedding(serialized) {
  const embedding = new Map();
  for (const key in serialized) {
    embedding.set(key, serialized[key]);
  }
  return embedding;
}

/**
 * Example utility function to compute similarity between two embeddings.
 * @param {Map<string, number>} embeddingA - First embedding.
 * @param {Map<string, number>} embeddingB - Second embedding.
 * @returns {number} - Cosine similarity score.
 */
export function computeEmbeddingSimilarity(embeddingA, embeddingB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [token, weightA] of embeddingA.entries()) {
    const weightB = embeddingB.get(token) || 0;
    dotProduct += weightA * weightB;
    normA += weightA ** 2;
  }

  for (const weightB of embeddingB.values()) {
    normB += weightB ** 2;
  }

  if (normA === 0 || normB === 0) return 0; // Handle edge case: zero vector

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Example usage:
 * const context = ["AI is transforming industries.", "Neural networks are powerful tools."];
 * const compressed = compressContext(context);
 * console.log(compressed);
 */