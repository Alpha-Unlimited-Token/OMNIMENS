/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_17
 * Name: contextStitcher
 * Purpose: Processes large contexts by dynamically retrieving and integrating relevant chunks across multiple passes.
 * Description: Processes large contexts by splitting, scoring, and integrating relevant chunks using hierarchical attention.
 * Migrated: 2026-04-02T14:08:14.879Z
 */

// contextStitcher.mjs
import { createHash } from 'crypto';

/**
 * Utility function to hash a string for efficient chunk identification.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash of the input.
 */
export function hashString(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Splits a large context into manageable chunks of specified size.
 * @param {string} context - The large context to split.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {Array<string>} - An array of context chunks.
 */
export function splitContext(context, chunkSize) {
  if (chunkSize <= 0) throw new Error('Chunk size must be greater than 0');
  const chunks = [];
  for (let i = 0; i < context.length; i += chunkSize) {
    chunks.push(context.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Scores context chunks based on relevance using a simple keyword matching algorithm.
 * @param {Array<string>} chunks - The context chunks to score.
 * @param {Array<string>} keywords - The keywords to match against.
 * @returns {Array<{ chunk: string, score: number }>} - Scored chunks sorted by relevance.
 */
export function scoreChunks(chunks, keywords) {
  if (!Array.isArray(chunks) || !Array.isArray(keywords)) {
    throw new Error('Chunks and keywords must be arrays');
  }

  return chunks
    .map((chunk) => {
      const score = keywords.reduce((acc, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        return acc + (chunk.match(regex)?.length || 0);
      }, 0);
      return { chunk, score };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Dynamically integrates top-scoring chunks into a coherent reasoning stream.
 * @param {Array<{ chunk: string, score: number }>} scoredChunks - The scored context chunks.
 * @param {number} maxChunks - The maximum number of chunks to integrate.
 * @returns {string} - The integrated reasoning stream.
 */
export function integrateChunks(scoredChunks, maxChunks) {
  if (maxChunks <= 0) throw new Error('Max chunks must be greater than 0');
  return scoredChunks
    .slice(0, maxChunks)
    .map(({ chunk }) => chunk)
    .join(' ');
}

/**
 * Main function to process a large context using hierarchical attention.
 * @param {string} context - The large context to process.
 * @param {Array<string>} keywords - Keywords to guide relevance scoring.
 * @param {number} chunkSize - The size of each chunk.
 * @param {number} maxChunks - The maximum number of chunks to integrate.
 * @returns {string} - The final reasoning stream.
 */
export function processContext(context, keywords, chunkSize, maxChunks) {
  const chunks = splitContext(context, chunkSize);
  const scoredChunks = scoreChunks(chunks, keywords);
  return integrateChunks(scoredChunks, maxChunks);
}

/**
 * Utility to validate inputs for context processing.
 * @param {string} context - The context to validate.
 * @param {Array<string>} keywords - The keywords to validate.
 * @param {number} chunkSize - The chunk size to validate.
 * @param {number} maxChunks - The max chunks to validate.
 */
export function validateInputs(context, keywords, chunkSize, maxChunks) {
  if (typeof context !== 'string' || context.length === 0) {
    throw new Error('Context must be a non-empty string');
  }
  if (!Array.isArray(keywords) || keywords.some((kw) => typeof kw !== 'string')) {
    throw new Error('Keywords must be an array of strings');
  }
  if (typeof chunkSize !== 'number' || chunkSize <= 0) {
    throw new Error('Chunk size must be a positive number');
  }
  if (typeof maxChunks !== 'number' || maxChunks <= 0) {
    throw new Error('Max chunks must be a positive number');
  }
}

// Example usage (can be removed in production):
// const context = "...large text...";
// const keywords = ["emerging", "programming", "paradigms"];
// const result = processContext(context, keywords, 100, 5);
// console.log(result);