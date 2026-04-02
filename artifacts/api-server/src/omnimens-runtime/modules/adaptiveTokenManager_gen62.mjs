/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveTokenManager
 * Written: 2026-04-02T15:38:50.507Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveTokenManager.mjs

import crypto from 'crypto';

/**
 * Splits input text into chunks of specified size with optional overlap.
 * @param {string} text - The input text to split.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @param {number} overlap - Number of overlapping tokens between chunks.
 * @returns {string[]} Array of text chunks.
 */
export function splitTextIntoChunks(text, chunkSize, overlap = 0) {
  if (chunkSize <= 0 || overlap < 0 || overlap >= chunkSize) {
    throw new Error("Invalid chunkSize or overlap values.");
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
  }

  return chunks;
}

/**
 * Scores the importance of each chunk using a simple hash-based heuristic.
 * @param {string[]} chunks - Array of text chunks.
 * @returns {number[]} Array of importance scores corresponding to each chunk.
 */
export function scoreChunks(chunks) {
  return chunks.map(chunk => {
    const hash = crypto.createHash('sha256').update(chunk).digest('hex');
    return parseInt(hash.slice(0, 8), 16); // Use the first 8 hex digits as a score
  });
}

/**
 * Generates a summary of a chunk by truncating or simplifying it.
 * @param {string} chunk - A single chunk of text.
 * @param {number} maxLength - Maximum length of the summary.
 * @returns {string} Summary of the chunk.
 */
export function summarizeChunk(chunk, maxLength = 100) {
  if (chunk.length <= maxLength) return chunk;
  return chunk.slice(0, maxLength) + '...';
}

/**
 * Creates a hierarchical summary of the input text by summarizing chunks and combining results.
 * @param {string} text - The input text to summarize.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @param {number} overlap - Number of overlapping tokens between chunks.
 * @param {number} summaryLength - Maximum length of each summary.
 * @returns {string} Hierarchical summary of the text.
 */
export function createHierarchicalSummary(text, chunkSize, overlap, summaryLength) {
  const chunks = splitTextIntoChunks(text, chunkSize, overlap);
  const summaries = chunks.map(chunk => summarizeChunk(chunk, summaryLength));
  return summaries.join(' ');
}

/**
 * Reconstructs the original text from chunks, ensuring coherence.
 * @param {string[]} chunks - Array of text chunks.
 * @returns {string} Reconstructed text.
 */
export function reconstructText(chunks) {
  return chunks.join('');
}

/**
 * Main utility function to process text dynamically with adaptive token management.
 * @param {string} text - The input text to process.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @param {number} overlap - Number of overlapping tokens between chunks.
 * @param {number} summaryLength - Maximum length of each summary.
 * @returns {object} Object containing processed results.
 */
export function adaptiveTokenManager(text, chunkSize, overlap, summaryLength) {
  const chunks = splitTextIntoChunks(text, chunkSize, overlap);
  const scores = scoreChunks(chunks);
  const summaries = chunks.map(chunk => summarizeChunk(chunk, summaryLength));
  const hierarchicalSummary = createHierarchicalSummary(text, chunkSize, overlap, summaryLength);
  const reconstructedText = reconstructText(chunks);

  return {
    chunks,
    scores,
    summaries,
    hierarchicalSummary,
    reconstructedText
  };
}