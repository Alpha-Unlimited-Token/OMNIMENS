/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T15:04:18.936Z
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

import crypto from 'crypto';

/**
 * Generates a semantic importance score for a given text segment.
 * @param {string} text - The text segment to score.
 * @returns {number} - A score between 0 and 1 representing semantic importance.
 */
export function calculateImportanceScore(text) {
  if (!text || typeof text !== 'string') return 0;

  const lengthFactor = Math.min(text.length / 1000, 1); // Normalize length to a max of 1000 characters
  const entropy = calculateEntropy(text); // Measure information density

  return (lengthFactor + entropy) / 2; // Combine factors for a balanced score
}

/**
 * Calculates the Shannon entropy of a given string.
 * @param {string} text - The input string.
 * @returns {number} - The entropy value (0 to 1).
 */
export function calculateEntropy(text) {
  const frequency = {};
  for (const char of text) {
    frequency[char] = (frequency[char] || 0) + 1;
  }

  const totalChars = text.length;
  let entropy = 0;

  for (const char in frequency) {
    const p = frequency[char] / totalChars;
    entropy -= p * Math.log2(p);
  }

  return entropy / Math.log2(totalChars); // Normalize entropy to [0, 1]
}

/**
 * Segments text into smaller chunks based on semantic boundaries.
 * @param {string} text - The input text to segment.
 * @param {number} chunkSize - Approximate size of each chunk in characters.
 * @returns {string[]} - An array of text chunks.
 */
export function segmentText(text, chunkSize = 500) {
  if (!text || typeof text !== 'string' || chunkSize <= 0) return [];

  const sentences = text.split(/(?<=[.!?])\s+/); // Split by sentence boundaries
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += sentence + ' ';
  }

  if (currentChunk.trim()) chunks.push(currentChunk.trim());

  return chunks;
}

/**
 * Summarizes a collection of text chunks hierarchically.
 * @param {string[]} chunks - An array of text chunks.
 * @param {number} maxDepth - The maximum depth of summarization hierarchy.
 * @returns {string} - A hierarchical summary of the input chunks.
 */
export function hierarchicalSummarization(chunks, maxDepth = 3) {
  if (!Array.isArray(chunks) || chunks.length === 0 || maxDepth <= 0) return '';

  if (chunks.length === 1 || maxDepth === 1) {
    return summarizeChunks(chunks);
  }

  const midPoint = Math.ceil(chunks.length / 2);
  const leftSummary = hierarchicalSummarization(chunks.slice(0, midPoint), maxDepth - 1);
  const rightSummary = hierarchicalSummarization(chunks.slice(midPoint), maxDepth - 1);

  return summarizeChunks([leftSummary, rightSummary]);
}

/**
 * Summarizes an array of text chunks into a single summary.
 * @param {string[]} chunks - An array of text chunks.
 * @returns {string} - A single summary.
 */
export function summarizeChunks(chunks) {
  if (!Array.isArray(chunks) || chunks.length === 0) return '';

  const concatenated = chunks.join(' ');
  const words = concatenated.split(' ');
  const summaryLength = Math.min(Math.floor(words.length / 4), 100); // Summarize to 25% of original length, max 100 words

  return words.slice(0, summaryLength).join(' ') + '...';
}

/**
 * Main function to manage hierarchical memory.
 * @param {string} text - The input text to process.
 * @param {number} chunkSize - Approximate size of each chunk in characters.
 * @param {number} maxDepth - The maximum depth of summarization hierarchy.
 * @returns {object} - An object containing segmented text, importance scores, and hierarchical summary.
 */
export function hierarchicalMemoryManager(text, chunkSize = 500, maxDepth = 3) {
  if (!text || typeof text !== 'string') return { error: 'Invalid input text' };

  const segments = segmentText(text, chunkSize);
  const scores = segments.map(calculateImportanceScore);
  const summary = hierarchicalSummarization(segments, maxDepth);

  return {
    segments,
    scores,
    summary
  };
}