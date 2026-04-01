/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_8
 * Name: contextSummarizationSlidingWindow
 * Purpose: Retain long-term context in conversations by compressing earlier context into summarized embeddings.
 * Description: A utility module for summarizing long-term context into fixed-size embeddings using a sliding window and hierarchical attention mechanism.
 * Migrated: 2026-04-01T22:23:20.235Z
 */

// contextSummarizationSlidingWindow.mjs

import { createHash } from 'crypto';

/**
 * Generates a fixed-size hash-based embedding for a given string.
 * This is used to compress older context into a smaller representation.
 * @param {string} input - The input string to hash.
 * @param {number} size - The desired size of the embedding in bytes.
 * @returns {Uint8Array} - A fixed-size embedding.
 */
export function generateFixedSizeEmbedding(input, size) {
  const hash = createHash('sha256');
  hash.update(input);
  const fullHash = hash.digest();
  return fullHash.slice(0, size);
}

/**
 * Summarizes a batch of context strings into a single embedding.
 * Uses a simple weighted average mechanism to combine embeddings.
 * @param {Array<{ text: string, weight: number }>} contextBatch - Array of context objects with text and weight.
 * @param {number} embeddingSize - Size of the fixed embedding.
 * @returns {Uint8Array} - Summarized embedding.
 */
export function summarizeContextBatch(contextBatch, embeddingSize) {
  const combinedEmbedding = new Uint8Array(embeddingSize).fill(0);
  let totalWeight = 0;

  for (const { text, weight } of contextBatch) {
    const embedding = generateFixedSizeEmbedding(text, embeddingSize);
    for (let i = 0; i < embeddingSize; i++) {
      combinedEmbedding[i] += embedding[i] * weight;
    }
    totalWeight += weight;
  }

  if (totalWeight > 0) {
    for (let i = 0; i < embeddingSize; i++) {
      combinedEmbedding[i] = Math.round(combinedEmbedding[i] / totalWeight);
    }
  }

  return combinedEmbedding;
}

/**
 * Implements a sliding window mechanism to manage long-term context.
 * Periodically summarizes older context into fixed-size embeddings.
 * @param {Array<string>} context - Array of strings representing the conversation history.
 * @param {number} windowSize - Number of recent tokens to retain before summarizing.
 * @param {number} embeddingSize - Size of the summarized embeddings.
 * @returns {Array<Uint8Array>} - Array of summarized embeddings.
 */
export function slidingWindowSummarization(context, windowSize, embeddingSize) {
  const summarizedEmbeddings = [];
  let currentBatch = [];

  for (let i = 0; i < context.length; i++) {
    currentBatch.push({ text: context[i], weight: 1 });

    if (currentBatch.length === windowSize || i === context.length - 1) {
      const summary = summarizeContextBatch(currentBatch, embeddingSize);
      summarizedEmbeddings.push(summary);
      currentBatch = [];
    }
  }

  return summarizedEmbeddings;
}

/**
 * Computes similarity between two embeddings using cosine similarity.
 * @param {Uint8Array} embedding1 - First embedding.
 * @param {Uint8Array} embedding2 - Second embedding.
 * @returns {number} - Cosine similarity score between -1 and 1.
 */
export function cosineSimilarity(embedding1, embedding2) {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] ** 2;
    norm2 += embedding2[i] ** 2;
  }

  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);

  return norm1 > 0 && norm2 > 0 ? dotProduct / (norm1 * norm2) : 0;
}

/**
 * Utility function to convert Uint8Array embeddings to hex strings for storage or comparison.
 * @param {Uint8Array} embedding - The embedding to convert.
 * @returns {string} - Hexadecimal string representation of the embedding.
 */
export function embeddingToHex(embedding) {
  return Array.from(embedding).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Utility function to convert hex strings back to Uint8Array embeddings.
 * @param {string} hex - Hexadecimal string representation of the embedding.
 * @returns {Uint8Array} - The reconstructed embedding.
 */
export function hexToEmbedding(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}