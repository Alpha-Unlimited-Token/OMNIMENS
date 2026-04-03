/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompressionEngine
 * Written: 2026-04-03T15:46:33.729Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextCompressionEngine.mjs

import crypto from 'crypto';

/**
 * Dynamically scores the importance of input chunks based on keyword frequency and length.
 * @param {string[]} chunks - Array of text chunks to score.
 * @returns {number[]} - Array of scores corresponding to input chunks.
 */
export function calculateImportanceScores(chunks) {
  const keywordFrequency = {};

  // Tokenize and count keyword frequency across all chunks
  chunks.forEach(chunk => {
    chunk.split(/\W+/).forEach(word => {
      const lowerWord = word.toLowerCase();
      if (lowerWord.length > 3) {
        keywordFrequency[lowerWord] = (keywordFrequency[lowerWord] || 0) + 1;
      }
    });
  });

  // Score each chunk based on keyword frequency and length
  return chunks.map(chunk => {
    const words = chunk.split(/\W+/);
    const score = words.reduce((acc, word) => {
      const lowerWord = word.toLowerCase();
      return acc + (keywordFrequency[lowerWord] || 0);
    }, 0);
    return score / Math.sqrt(words.length || 1); // Normalize by chunk length
  });
}

/**
 * Hierarchically summarizes a long input into a compressed representation.
 * @param {string} input - The full text input to summarize.
 * @param {number} targetChunkCount - Desired number of summary chunks.
 * @returns {string[]} - Array of summarized chunks.
 */
export function hierarchicalSummarization(input, targetChunkCount) {
  const sentences = input.match(/[^.!?]+[.!?]/g) || [input]; // Split into sentences

  // Initial chunking by sentence groups
  const chunkSize = Math.ceil(sentences.length / targetChunkCount);
  let chunks = [];
  for (let i = 0; i < sentences.length; i += chunkSize) {
    chunks.push(sentences.slice(i, i + chunkSize).join(' '));
  }

  // Iteratively reduce chunks until target count is reached
  while (chunks.length > targetChunkCount) {
    const scores = calculateImportanceScores(chunks);
    const minScoreIndex = scores.indexOf(Math.min(...scores));

    // Merge the lowest-scoring chunk with its neighbor
    if (minScoreIndex === 0) {
      chunks[1] = chunks[0] + ' ' + chunks[1];
    } else {
      chunks[minScoreIndex - 1] += ' ' + chunks[minScoreIndex];
    }
    chunks.splice(minScoreIndex, 1);
  }

  return chunks;
}

/**
 * Compresses input text to fit within a specified token limit.
 * @param {string} input - The full text input to compress.
 * @param {number} tokenLimit - Maximum number of tokens allowed.
 * @returns {string} - Compressed text fitting within the token limit.
 */
export function compressToTokenLimit(input, tokenLimit) {
  const words = input.split(/\s+/);
  if (words.length <= tokenLimit) return input;

  const chunks = hierarchicalSummarization(input, Math.ceil(tokenLimit / 50)); // Approx. 50 tokens per chunk
  return chunks.join(' ').split(/\s+/).slice(0, tokenLimit).join(' ');
}

/**
 * Generates a unique hash for a given text input (useful for caching summaries).
 * @param {string} input - The text input to hash.
 * @returns {string} - A unique hash string.
 */
export function generateTextHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Splits a long text into manageable chunks without breaking sentences.
 * @param {string} input - The full text input to split.
 * @param {number} maxChunkSize - Maximum size of each chunk (in characters).
 * @returns {string[]} - Array of text chunks.
 */
export function splitIntoChunks(input, maxChunkSize) {
  const sentences = input.match(/[^.!?]+[.!?]/g) || [input];
  const chunks = [];
  let currentChunk = '';

  sentences.forEach(sentence => {
    if ((currentChunk + sentence).length > maxChunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += sentence + ' ';
  });

  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks;
}
