/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_2
 * Name: longContextSummarizer
 * Purpose: Compress long conversations into embeddings or summaries for efficient retrieval and coherence.
 * Description: Utility module for summarizing long contexts and generating embeddings using sliding window and hierarchical techniques.
 * Migrated: 2026-04-01T22:23:20.235Z
 */

// Complete ES module code here

import { createHash } from 'crypto';

/**
 * Utility to hash text into a fixed-length representation (e.g., for embeddings).
 * @param {string} text - The input text to hash.
 * @param {string} algorithm - Hash algorithm (e.g., 'sha256').
 * @returns {string} - Fixed-length hash of the input text.
 */
export function hashText(text, algorithm = 'sha256') {
  const hash = createHash(algorithm);
  hash.update(text);
  return hash.digest('hex');
}

/**
 * Splits a long text into chunks of a specified size with optional overlap.
 * @param {string} text - The input text to split.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @param {number} overlap - Number of overlapping characters between chunks.
 * @returns {string[]} - Array of text chunks.
 */
export function splitTextIntoChunks(text, chunkSize, overlap = 0) {
  if (chunkSize <= 0 || overlap < 0 || overlap >= chunkSize) {
    throw new Error('Invalid chunkSize or overlap parameters.');
  }

  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Generates a summary of a text chunk using a simple hierarchical approach.
 * @param {string[]} chunks - Array of text chunks.
 * @param {number} summaryLength - Target length of the summary.
 * @returns {string} - Condensed summary of the input text.
 */
export function summarizeChunks(chunks, summaryLength) {
  if (summaryLength <= 0) {
    throw new Error('Summary length must be greater than 0.');
  }

  const summaries = chunks.map(chunk => {
    const words = chunk.split(' ');
    return words.slice(0, Math.min(summaryLength, words.length)).join(' ');
  });

  return summaries.join(' ').slice(0, summaryLength);
}

/**
 * Combines hierarchical summarization with sliding window compression.
 * @param {string} text - Long input text to summarize.
 * @param {number} chunkSize - Size of each chunk for sliding window.
 * @param {number} overlap - Overlap size between chunks.
 * @param {number} summaryLength - Target length of the final summary.
 * @returns {string} - Final summarized text.
 */
export function longContextSummarizer(text, chunkSize, overlap, summaryLength) {
  const chunks = splitTextIntoChunks(text, chunkSize, overlap);
  return summarizeChunks(chunks, summaryLength);
}

/**
 * Converts text into a latent representation (hash-based embedding).
 * @param {string} text - Input text to encode.
 * @param {number} chunkSize - Size of each chunk for processing.
 * @param {number} overlap - Overlap size between chunks.
 * @returns {string[]} - Array of hash embeddings for each chunk.
 */
export function textToEmbeddings(text, chunkSize, overlap) {
  const chunks = splitTextIntoChunks(text, chunkSize, overlap);
  return chunks.map(chunk => hashText(chunk));
}

/**
 * Utility to validate input parameters for summarization and embeddings.
 * @param {string} text - Input text to validate.
 * @param {number} chunkSize - Chunk size to validate.
 * @param {number} overlap - Overlap size to validate.
 * @param {number} summaryLength - Summary length to validate.
 */
export function validateParameters(text, chunkSize, overlap, summaryLength) {
  if (typeof text !== 'string' || text.length === 0) {
    throw new Error('Text must be a non-empty string.');
  }
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new Error('Chunk size must be a positive integer.');
  }
  if (!Number.isInteger(overlap) || overlap < 0) {
    throw new Error('Overlap must be a non-negative integer.');
  }
  if (!Number.isInteger(summaryLength) || summaryLength <= 0) {
    throw new Error('Summary length must be a positive integer.');
  }
}
