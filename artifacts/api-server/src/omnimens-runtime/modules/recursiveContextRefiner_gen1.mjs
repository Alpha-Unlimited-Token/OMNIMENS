/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_10
 * Name: recursiveContextRefiner
 * Purpose: Processes large contexts by splitting them into smaller chunks, summarizing each, and recursively refining the output.
 * Description: Processes large text contexts by splitting, summarizing, and recursively refining them into a concise hierarchical summary.
 * Migrated: 2026-04-02T14:21:19.474Z
 */

// recursiveContextRefiner.mjs

import crypto from 'crypto';

/**
 * Splits a large text context into smaller chunks of specified size.
 * @param {string} context - The large text context to split.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @returns {string[]} Array of text chunks.
 */
export function splitContext(context, chunkSize) {
  if (typeof context !== 'string' || chunkSize <= 0) {
    throw new Error('Invalid input: context must be a string and chunkSize must be positive.');
  }
  const chunks = [];
  for (let i = 0; i < context.length; i += chunkSize) {
    chunks.push(context.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Summarizes a single chunk using a naive algorithm (e.g., extracting key sentences).
 * @param {string} chunk - The text chunk to summarize.
 * @returns {string} Summary of the chunk.
 */
export function summarizeChunk(chunk) {
  if (typeof chunk !== 'string') {
    throw new Error('Invalid input: chunk must be a string.');
  }
  // Naive summarization: Extract the first sentence as the summary.
  const sentences = chunk.match(/[^.!?]+[.!?]/g);
  return sentences ? sentences[0].trim() : chunk.trim();
}

/**
 * Recursively refines summaries into a hierarchical structure.
 * @param {string[]} chunks - Array of text chunks.
 * @returns {string} Final refined summary.
 */
export function recursiveRefine(chunks) {
  if (!Array.isArray(chunks) || chunks.some(chunk => typeof chunk !== 'string')) {
    throw new Error('Invalid input: chunks must be an array of strings.');
  }
  let summaries = chunks.map(summarizeChunk);

  while (summaries.length > 1) {
    const refinedChunks = [];
    for (let i = 0; i < summaries.length; i += 2) {
      const combined = summaries.slice(i, i + 2).join(' ');
      refinedChunks.push(summarizeChunk(combined));
    }
    summaries = refinedChunks;
  }

  return summaries[0];
}

/**
 * Generates a hash for a given text, useful for tracking context integrity.
 * @param {string} text - The text to hash.
 * @returns {string} SHA-256 hash of the text.
 */
export function generateHash(text) {
  if (typeof text !== 'string') {
    throw new Error('Invalid input: text must be a string.');
  }
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Main function to process and refine a large context.
 * @param {string} context - The large text context to process.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @returns {Object} Refined summary and its hash.
 */
export function processContext(context, chunkSize = 500) {
  const chunks = splitContext(context, chunkSize);
  const refinedSummary = recursiveRefine(chunks);
  const summaryHash = generateHash(refinedSummary);

  return {
    refinedSummary,
    summaryHash
  };
}