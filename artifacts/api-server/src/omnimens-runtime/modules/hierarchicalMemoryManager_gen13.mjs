/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-01T22:03:24.158Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemoryManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given input string.
 * Useful for deduplication and efficient chunk tracking.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Splits a large text into manageable chunks of a specified size.
 * Handles edge cases like empty input or chunk size larger than input.
 * @param {string} text - The input text to chunk.
 * @param {number} chunkSize - The desired size of each chunk.
 * @returns {string[]} - An array of text chunks.
 */
export function chunkText(text, chunkSize) {
  if (!text || chunkSize <= 0) return [];
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Summarizes a single chunk of text using a simple frequency-based approach.
 * This is a placeholder for more advanced summarization algorithms.
 * @param {string} chunk - A chunk of text to summarize.
 * @returns {string} - A summarized version of the chunk.
 */
export function summarizeChunk(chunk) {
  if (!chunk) return '';
  const wordCounts = {};
  const words = chunk.split(/\s+/);

  for (const word of words) {
    const normalizedWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedWord) {
      wordCounts[normalizedWord] = (wordCounts[normalizedWord] || 0) + 1;
    }
  }

  const sortedWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  return sortedWords.join(' ');
}

/**
 * Recursively summarizes chunks to build a hierarchical memory structure.
 * Each level compresses information further until a single summary remains.
 * @param {string[]} chunks - An array of text chunks.
 * @returns {string} - A single summarized string representing the input.
 */
export function recursiveSummarization(chunks) {
  if (!chunks || chunks.length === 0) return '';
  if (chunks.length === 1) return summarizeChunk(chunks[0]);

  const summaries = chunks.map(summarizeChunk);
  return recursiveSummarization(chunkText(summaries.join(' '), Math.ceil(summaries.join(' ').length / 2)));
}

/**
 * Main function to process large text input into a hierarchical memory summary.
 * Combines chunking, summarization, and recursive compression.
 * @param {string} text - The input text to process.
 * @param {number} chunkSize - The size of each chunk for initial splitting.
 * @returns {string} - A final summarized representation of the input text.
 */
export function processTextToMemory(text, chunkSize = 1024) {
  const chunks = chunkText(text, chunkSize);
  return recursiveSummarization(chunks);
}

/**
 * Utility to calculate the embedding-like representation of a text.
 * Uses hashing to generate a fixed-length representation for deduplication.
 * @param {string} text - The input text to process.
 * @returns {string} - A hash-based embedding representation.
 */
export function generateEmbedding(text) {
  return generateHash(text);
}

// Example usage (commented out for production):
// const largeText = "..."; // Some large text input
// const summary = processTextToMemory(largeText, 1024);
// console.log(summary);