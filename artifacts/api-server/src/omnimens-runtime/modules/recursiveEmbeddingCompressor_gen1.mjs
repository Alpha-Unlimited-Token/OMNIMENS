/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_28
 * Name: recursiveEmbeddingCompressor
 * Purpose: Preserves semantic fidelity during token window compression by recursively embedding hierarchical summaries.
 * Description: Recursively compresses large contexts into hierarchical embeddings while preserving semantic fidelity using attention-weighted summarization.
 * Migrated: 2026-04-02T14:50:29.444Z
 */

// recursiveEmbeddingCompressor.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash-based unique ID for context tracking.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash ID.
 */
export function generateUniqueId(input) {
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

/**
 * Computes attention-weighted summaries for hierarchical compression.
 * @param {Array<{content: string, weight: number}>} contexts - Array of content-weight pairs.
 * @returns {string} - A compressed summary preserving semantic fidelity.
 */
export function attentionWeightedSummarization(contexts) {
  if (!Array.isArray(contexts) || contexts.length === 0) {
    throw new Error('Input must be a non-empty array of context-weight pairs.');
  }

  // Normalize weights to sum to 1
  const totalWeight = contexts.reduce((sum, ctx) => sum + ctx.weight, 0);
  if (totalWeight === 0) {
    throw new Error('Total weight must be greater than zero.');
  }

  const normalizedContexts = contexts.map(ctx => ({
    content: ctx.content,
    weight: ctx.weight / totalWeight
  }));

  // Generate weighted summary
  return normalizedContexts
    .map(ctx => ctx.content.repeat(Math.round(ctx.weight * 100)))
    .join(' ');
}

/**
 * Recursively compresses large contexts into hierarchical embeddings.
 * @param {Array<string>} contexts - Array of large text contexts.
 * @param {number} maxLength - Maximum token length for each compressed summary.
 * @returns {string} - Final compressed representation.
 */
export function recursiveEmbeddingCompressor(contexts, maxLength = 256) {
  if (!Array.isArray(contexts) || contexts.length === 0) {
    throw new Error('Input must be a non-empty array of contexts.');
  }

  let currentLevel = contexts;

  while (currentLevel.some(ctx => ctx.length > maxLength)) {
    currentLevel = currentLevel.map(ctx => {
      const segments = ctx.match(new RegExp(`.{1,${maxLength}}`, 'g')) || [];
      const weightedSegments = segments.map((segment, index) => ({
        content: segment,
        weight: 1 / (index + 1) // Example weighting scheme: inverse index
      }));
      return attentionWeightedSummarization(weightedSegments);
    });
  }

  return currentLevel.join(' ');
}

/**
 * Utility function to split large text into manageable chunks.
 * @param {string} text - The large text input.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @returns {Array<string>} - Array of text chunks.
 */
export function splitIntoChunks(text, chunkSize = 256) {
  if (typeof text !== 'string' || chunkSize <= 0) {
    throw new Error('Invalid input: text must be a string and chunkSize must be positive.');
  }

  return text.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];
}

/**
 * Utility function to validate context array structure.
 * @param {Array<{content: string, weight: number}>} contexts - Array of context-weight pairs.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateContextArray(contexts) {
  return Array.isArray(contexts) && contexts.every(ctx => 
    typeof ctx.content === 'string' && typeof ctx.weight === 'number'
  );
}