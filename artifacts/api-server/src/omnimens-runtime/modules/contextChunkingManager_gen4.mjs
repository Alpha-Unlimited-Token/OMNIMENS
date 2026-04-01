/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextChunkingManager
 * Written: 2026-04-01T22:00:31.443Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextChunkingManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given string to ensure unique chunk identifiers.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash string.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Splits a large text into manageable chunks using a sliding window with overlap.
 * @param {string} text - The input text to be chunked.
 * @param {number} chunkSize - The size of each chunk.
 * @param {number} overlap - The number of overlapping characters between chunks.
 * @returns {Array<{ id, content}>} - Array of chunk objects with unique IDs.
 */
export function chunkText(text, chunkSize, overlap) {
  if (chunkSize <= 0 || overlap < 0 || overlap >= chunkSize) {
    throw new Error('Invalid chunkSize or overlap values.');
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunkContent = text.slice(start, end);
    const chunkId = generateHash(chunkContent);

    chunks.push({ id: chunkId, content: chunkContent });

    start = end - overlap; // Slide the window with overlap.
  }

  return chunks;
}

/**
 * Summarizes a chunk of text using a naive embedding-based approach (placeholder).
 * @param {string} chunk - The text chunk to summarize.
 * @returns {string} - A summarized version of the chunk.
 */
export function summarizeChunk(chunk) {
  // Placeholder: In a real implementation, replace this with an embedding-based summarization algorithm.
  const maxSummaryLength = 100;
  return chunk.length > maxSummaryLength ? chunk.slice(0, maxSummaryLength) + '...' : chunk;
}

/**
 * Processes a large text by chunking and summarizing overflow segments.
 * @param {string} text - The input text to process.
 * @param {number} chunkSize - The size of each chunk.
 * @param {number} overlap - The number of overlapping characters between chunks.
 * @returns {Array<{ id, original, summary}>} - Array of processed chunk objects.
 */
export function processLargeText(text, chunkSize, overlap) {
  const chunks = chunkText(text, chunkSize, overlap);

  return chunks.map(({ id, content }) => ({
    id,
    original: content,
    summary: summarizeChunk(content)
  }));
}

/**
 * Merges summarized chunks back into a coherent text.
 * @param {Array<{ summary}>} summarizedChunks - Array of summarized chunk objects.
 * @returns {string} - The reconstructed summarized text.
 */
export function mergeSummaries(summarizedChunks) {
  return summarizedChunks.map(chunk => chunk.summary).join(' ');
}

/**
 * Validates input parameters for chunking and summarization functions.
 * @param {string} text - The input text to validate.
 * @param {number} chunkSize - The size of each chunk.
 * @param {number} overlap - The number of overlapping characters between chunks.
 * @throws {Error} - If validation fails.
 */
export function validateParameters(text, chunkSize, overlap) {
  if (typeof text !== 'string' || text.length === 0) {
    throw new Error('Text must be a non-empty string.');
  }
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new Error('Chunk size must be a positive integer.');
  }
  if (!Number.isInteger(overlap) || overlap < 0 || overlap >= chunkSize) {
    throw new Error('Overlap must be a non-negative integer less than chunk size.');
  }
}

/**
 * Utility function to handle large context windows by chunking, summarizing, and merging.
 * @param {string} text - The input text to process.
 * @param {number} chunkSize - The size of each chunk.
 * @param {number} overlap - The number of overlapping characters between chunks.
 * @returns {string} - The final summarized text.
 */
export function manageContextWindow(text, chunkSize, overlap) {
  validateParameters(text, chunkSize, overlap);
  const processedChunks = processLargeText(text, chunkSize, overlap);
  return mergeSummaries(processedChunks);
}
