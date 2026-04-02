/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticContextCompressor
 * Written: 2026-04-02T14:55:03.945Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticContextCompressor.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given string to uniquely identify content chunks.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Splits text into chunks of a specified size while preserving word boundaries.
 * @param {string} text - The input text to split.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {string[]} - An array of text chunks.
 */
export function splitTextIntoChunks(text, chunkSize) {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = '';

  for (const word of words) {
    if ((currentChunk + ' ' + word).trim().length > chunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = word;
    } else {
      currentChunk += ' ' + word;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Scores content importance using a simple heuristic based on word frequency.
 * @param {string} text - The input text to score.
 * @returns {Map<string, number>} - A map of words to their importance scores.
 */
export function scoreContentImportance(text) {
  const wordFrequency = new Map();
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];

  for (const word of words) {
    wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
  }

  return wordFrequency;
}

/**
 * Generates hierarchical summaries of text by recursively compressing content.
 * @param {string[]} chunks - An array of text chunks to summarize.
 * @param {number} depth - The maximum depth of recursion for summarization.
 * @returns {string[]} - A hierarchical summary of the text.
 */
export function generateHierarchicalSummary(chunks, depth = 2) {
  if (depth === 0 || chunks.length <= 1) return chunks;

  const summaries = [];

  for (const chunk of chunks) {
    const importanceScores = scoreContentImportance(chunk);
    const sortedWords = Array.from(importanceScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);

    const summary = sortedWords.slice(0, Math.min(10, sortedWords.length)).join(' ');
    summaries.push(summary);
  }

  return generateHierarchicalSummary(summaries, depth - 1);
}

/**
 * Compresses a large text input while preserving its semantic meaning and structure.
 * @param {string} text - The input text to compress.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @param {number} depth - The depth of hierarchical summarization.
 * @returns {string[]} - A compressed representation of the text.
 */
export function compressSemanticContext(text, chunkSize = 512, depth = 2) {
  const chunks = splitTextIntoChunks(text, chunkSize);
  return generateHierarchicalSummary(chunks, depth);
}

/**
 * Utility function to validate input parameters for compression.
 * @param {string} text - The input text to validate.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @param {number} depth - The depth of hierarchical summarization.
 * @throws {Error} - If validation fails.
 */
export function validateCompressionInput(text, chunkSize, depth) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('Input text must be a non-empty string.');
  }

  if (typeof chunkSize !== 'number' || chunkSize <= 0) {
    throw new Error('Chunk size must be a positive number.');
  }

  if (typeof depth !== 'number' || depth < 0) {
    throw new Error('Depth must be a non-negative number.');
  }
}

/**
 * Main function to compress text context with validation.
 * @param {string} text - The input text to compress.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @param {number} depth - The depth of hierarchical summarization.
 * @returns {string[]} - A compressed representation of the text.
 */
export function semanticContextCompressor(text, chunkSize = 512, depth = 2) {
  validateCompressionInput(text, chunkSize, depth);
  return compressSemanticContext(text, chunkSize, depth);
}