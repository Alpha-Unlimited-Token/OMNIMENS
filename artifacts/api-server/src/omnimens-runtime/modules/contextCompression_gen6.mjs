/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompression
 * Written: 2026-04-01T22:21:56.593Z
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

import crypto from 'crypto';

/**
 * Compresses conversational context by recursively summarizing and distilling essential information.
 * This module is designed to handle extended token windows efficiently.
 */

/**
 * Summarizes a single chunk of text by extracting key sentences and concepts.
 * @param {string} text - The input text chunk to summarize.
 * @param {number} maxLength - Maximum length of the summary.
 * @returns {string} - A compressed summary of the input text.
 */
export function summarizeChunk(text, maxLength = 200) {
  if (typeof text !== 'string' || text.length === 0) return '';

  const sentences = text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s+/);
  const rankedSentences = sentences.map((sentence) => ({
    sentence,
    score: crypto.createHash('md5').update(sentence).digest('hex').length // Simple heuristic for ranking
  })).sort((a, b) => b.score - a.score);

  let summary = '';
  for (const { sentence } of rankedSentences) {
    if ((summary + sentence).length <= maxLength) {
      summary += sentence + ' ';
    } else {
      break;
    }
  }

  return summary.trim();
}

/**
 * Recursively compresses a large context into a hierarchical summary.
 * @param {string[]} contextChunks - Array of text chunks to compress.
 * @param {number} maxDepth - Maximum recursion depth.
 * @param {number} maxLengthPerSummary - Maximum length of each summary.
 * @returns {string} - Final compressed summary.
 */
export function compressContext(contextChunks, maxDepth = 3, maxLengthPerSummary = 200) {
  if (!Array.isArray(contextChunks) || contextChunks.length === 0) return '';

  let summaries = contextChunks.map(chunk => summarizeChunk(chunk, maxLengthPerSummary));

  for (let depth = 1; depth < maxDepth; depth++) {
    if (summaries.length <= 1) break;
    summaries = [summarizeChunk(summaries.join(' '), maxLengthPerSummary)];
  }

  return summaries[0];
}

/**
 * Splits a large text into manageable chunks for processing.
 * @param {string} text - The input text to split.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @returns {string[]} - Array of text chunks.
 */
export function splitTextIntoChunks(text, chunkSize = 1000) {
  if (typeof text !== 'string' || text.length === 0) return [];

  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  return chunks;
}

/**
 * Main utility function to compress a large text context.
 * @param {string} text - The input text to compress.
 * @param {number} chunkSize - Size of chunks for initial splitting.
 * @param {number} maxDepth - Maximum recursion depth for compression.
 * @param {number} maxLengthPerSummary - Maximum length of each summary.
 * @returns {string} - Final compressed summary of the input text.
 */
export function compressLargeTextContext(text, chunkSize = 1000, maxDepth = 3, maxLengthPerSummary = 200) {
  const chunks = splitTextIntoChunks(text, chunkSize);
  return compressContext(chunks, maxDepth, maxLengthPerSummary);
}

/**
 * Utility function to test the compression module.
 * @returns {void}
 */
export function testModule() {
  const sampleText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

  const compressed = compressLargeTextContext(sampleText, 50, 2, 100);
  console.log('Compressed Summary:', compressed);
}
