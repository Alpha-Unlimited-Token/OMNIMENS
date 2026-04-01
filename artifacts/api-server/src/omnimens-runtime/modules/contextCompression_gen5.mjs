/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompression
 * Written: 2026-04-01T22:21:51.645Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextCompression.mjs

import { createHash } from 'crypto';

/**
 * Generate a hash-based identifier for a given string to ensure unique keys for embeddings.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Summarize a long conversational context using a simple token-based compression algorithm.
 * @param {string} context - The long conversational context to summarize.
 * @param {number} maxTokens - Maximum number of tokens for the summary.
 * @returns {string} - A summarized version of the context.
 */
export function summarizeContext(context, maxTokens = 100) {
  const tokens = context.split(/\s+/);
  if (tokens.length <= maxTokens) return context;
  return tokens.slice(0, maxTokens).join(' ') + '...';
}

/**
 * Project a summarized context into a lower-dimensional embedding space.
 * @param {string} summary - The summarized context.
 * @param {number} dimensions - Number of dimensions for the embedding.
 * @returns {Float64Array} - A vector representation of the summary.
 */
export function projectToEmbedding(summary, dimensions = 128) {
  const embedding = new Float64Array(dimensions);
  const charCodes = Array.from(summary).map(char => char.charCodeAt(0));
  for (let i = 0; i < dimensions; i++) {
    embedding[i] = charCodes.reduce((acc, code) => acc + Math.sin(code * (i + 1)), 0) / charCodes.length;
  }
  return embedding;
}

/**
 * Compress a long context into a compact embedding for storage and retrieval.
 * @param {string} context - The long conversational context.
 * @param {number} maxTokens - Maximum number of tokens for summarization.
 * @param {number} dimensions - Number of dimensions for the embedding.
 * @returns {Object} - An object containing the hash, summary, and embedding.
 */
export function compressContext(context, maxTokens = 100, dimensions = 128) {
  const summary = summarizeContext(context, maxTokens);
  const embedding = projectToEmbedding(summary, dimensions);
  const hash = generateHash(context);
  return { hash, summary, embedding };
}

/**
 * Reconstruct a context from its summary and embedding (approximation).
 * @param {string} summary - The summarized context.
 * @returns {string} - A reconstructed approximation of the original context.
 */
export function reconstructContext(summary) {
  return summary.replace(/\.\.\.$/, ' [reconstructed]');
}

/**
 * Validate the embedding dimensions and ensure proper structure.
 * @param {Float64Array} embedding - The embedding to validate.
 * @param {number} expectedDimensions - Expected number of dimensions.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateEmbedding(embedding, expectedDimensions) {
  return embedding instanceof Float64Array && embedding.length === expectedDimensions;
}

/**
 * Utility function to compare embeddings for similarity.
 * @param {Float64Array} embeddingA - First embedding.
 * @param {Float64Array} embeddingB - Second embedding.
 * @returns {number} - Cosine similarity score between the two embeddings.
 */
export function compareEmbeddings(embeddingA, embeddingB) {
  if (embeddingA.length !== embeddingB.length) throw new Error('Embeddings must have the same dimensions.');
  const dotProduct = embeddingA.reduce((sum, val, i) => sum + val * embeddingB[i], 0);
  const magnitudeA = Math.sqrt(embeddingA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(embeddingB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
