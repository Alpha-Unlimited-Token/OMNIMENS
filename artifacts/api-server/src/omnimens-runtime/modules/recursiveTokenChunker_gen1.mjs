/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_2
 * Name: recursiveTokenChunker
 * Purpose: Preserves hierarchical relationships in token window compression for ultra-long contexts.
 * Description: A utility module for hierarchical token chunking, semantic hashing, and summarization to handle ultra-long contexts efficiently.
 * Migrated: 2026-04-03T04:58:03.734Z
 */

// recursiveTokenChunker.mjs

import { createHash } from 'crypto';

/**
 * Generates a semantic hash for a given string using SHA-256.
 * @param {string} input - The input string to hash.
 * @returns {string} - A fixed-length semantic hash.
 */
export function generateSemanticHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex').slice(0, 16); // Return a compact 16-character hash
}

/**
 * Splits a large array of tokens into smaller chunks with hierarchical relationships preserved.
 * @param {Array} tokens - The array of tokens to chunk.
 * @param {number} maxChunkSize - The maximum size of each chunk.
 * @returns {Array} - A nested array of token chunks.
 */
export function recursiveChunk(tokens, maxChunkSize) {
  if (tokens.length <= maxChunkSize) {
    return tokens; // Base case: no further chunking needed
  }

  const midPoint = Math.ceil(tokens.length / 2);
  const leftChunk = recursiveChunk(tokens.slice(0, midPoint), maxChunkSize);
  const rightChunk = recursiveChunk(tokens.slice(midPoint), maxChunkSize);

  return [leftChunk, rightChunk];
}

/**
 * Summarizes a chunk of tokens using a weighted attention mechanism.
 * @param {Array} tokens - The array of tokens to summarize.
 * @returns {string} - A summarized representation of the tokens.
 */
export function attentionWeightedSummarize(tokens) {
  const tokenWeights = tokens.map((token, index) => ({
    token,
    weight: 1 / (index + 1) // Example: inversely weight tokens by position
  }));

  const weightedTokens = tokenWeights.map(({ token, weight }) => token.repeat(Math.ceil(weight * 10)));
  return weightedTokens.join(' ');
}

/**
 * Compresses a large token context while retaining hierarchical and semantic depth.
 * @param {Array} tokens - The array of tokens to compress.
 * @param {number} maxChunkSize - The maximum size of each chunk.
 * @returns {Object} - A compressed representation with hashes and summaries.
 */
export function compressContext(tokens, maxChunkSize) {
  const chunks = recursiveChunk(tokens, maxChunkSize);

  function processChunk(chunk) {
    if (Array.isArray(chunk[0])) {
      return chunk.map(processChunk);
    } else {
      const summary = attentionWeightedSummarize(chunk);
      const hash = generateSemanticHash(summary);
      return { summary, hash };
    }
  }

  return processChunk(chunks);
}

/**
 * Flattens a nested array of chunks into a single-level array.
 * @param {Array} nestedChunks - The nested array of chunks.
 * @returns {Array} - A flattened array.
 */
export function flattenChunks(nestedChunks) {
  return nestedChunks.flat(Infinity);
}

/**
 * Reconstructs a hierarchical structure from flattened chunks.
 * @param {Array} flattenedChunks - The flattened array of chunks.
 * @param {number} maxChunkSize - The maximum size of each chunk.
 * @returns {Array} - The reconstructed hierarchical structure.
 */
export function reconstructHierarchy(flattenedChunks, maxChunkSize) {
  function rebuild(chunks) {
    if (chunks.length <= maxChunkSize) {
      return chunks;
    }

    const midPoint = Math.ceil(chunks.length / 2);
    return [
      rebuild(chunks.slice(0, midPoint)),
      rebuild(chunks.slice(midPoint))
    ];
  }

  return rebuild(flattenedChunks);
}

// Example usage (for testing purposes only, remove or comment out in production):
// const tokens = ['token1', 'token2', 'token3', 'token4', 'token5', 'token6'];
// const compressed = compressContext(tokens, 2);
// console.log(JSON.stringify(compressed, null, 2));