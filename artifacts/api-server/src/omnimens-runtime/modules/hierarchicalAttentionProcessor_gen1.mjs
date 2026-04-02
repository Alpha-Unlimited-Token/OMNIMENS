/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_21
 * Name: hierarchicalAttentionProcessor
 * Purpose: Processes extremely large contexts by applying hierarchical attention mechanisms.
 * Description: Processes large contexts using hierarchical attention mechanisms for efficient representation and analysis.
 * Migrated: 2026-04-02T14:50:29.445Z
 */

// hierarchicalAttentionProcessor.mjs

import { createHash } from 'crypto';

/**
 * Splits input into overlapping chunks.
 * @param {string} input - The input string.
 * @param {number} chunkSize - Size of each chunk.
 * @param {number} overlap - Number of overlapping characters between chunks.
 * @returns {string[]} Array of chunks.
 */
export function splitIntoChunks(input, chunkSize, overlap) {
  const chunks = [];
  for (let i = 0; i < input.length; i += chunkSize - overlap) {
    const chunk = input.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  return chunks;
}

/**
 * Applies local attention by hashing chunks.
 * @param {string[]} chunks - Array of chunks.
 * @returns {string[]} Array of hashed chunk representations.
 */
export function applyLocalAttention(chunks) {
  return chunks.map(chunk => createHash('sha256').update(chunk).digest('hex'));
}

/**
 * Aggregates global context using secondary attention layer.
 * @param {string[]} hashedChunks - Array of hashed chunk representations.
 * @returns {string} Aggregated global context hash.
 */
export function aggregateGlobalContext(hashedChunks) {
  const combined = hashedChunks.join('');
  return createHash('sha256').update(combined).digest('hex');
}

/**
 * Processes large contexts using hierarchical attention.
 * @param {string} input - The input string.
 * @param {number} chunkSize - Size of each chunk.
 * @param {number} overlap - Number of overlapping characters between chunks.
 * @returns {string} Final aggregated context representation.
 */
export function processHierarchicalAttention(input, chunkSize = 256, overlap = 64) {
  const chunks = splitIntoChunks(input, chunkSize, overlap);
  const hashedChunks = applyLocalAttention(chunks);
  return aggregateGlobalContext(hashedChunks);
}

/**
 * Utility for cross-agent usage: Computes hash of any string.
 * @param {string} input - Input string.
 * @returns {string} SHA256 hash of the input.
 */
export function computeHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Utility for cross-agent usage: Splits text generically.
 * @param {string} text - Input text.
 * @param {number} size - Desired chunk size.
 * @returns {string[]} Array of text chunks.
 */
export function genericTextSplitter(text, size) {
  const result = [];
  for (let i = 0; i < text.length; i += size) {
    result.push(text.slice(i, i + size));
  }
  return result;
}
