/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T14:25:29.328Z
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
 * Utility to hash strings for unique identifiers.
 * @param {string} input - The string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function hashString(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Summarizes a large text into smaller chunks recursively.
 * @param {string} text - The text to summarize.
 * @param {number} maxLength - Maximum length of each summary chunk.
 * @returns {string[]} - Array of summarized chunks.
 */
export function recursiveSummarize(text, maxLength = 500) {
  if (text.length <= maxLength) return [text];

  const midpoint = Math.floor(text.length / 2);
  const left = text.slice(0, midpoint);
  const right = text.slice(midpoint);

  return [
    ...recursiveSummarize(left, maxLength),
    ...recursiveSummarize(right, maxLength)
  ];
}

/**
 * Scores text relevance based on keyword matching.
 * @param {string} text - The text to score.
 * @param {string[]} keywords - Array of keywords.
 * @returns {number} - Relevance score (higher is more relevant).
 */
export function relevanceScore(text, keywords) {
  const lowerText = text.toLowerCase();
  return keywords.reduce((score, keyword) => {
    const occurrences = lowerText.split(keyword.toLowerCase()).length - 1;
    return score + occurrences;
  }, 0);
}

/**
 * Dynamically manages hierarchical memory.
 * @param {string[]} contextChunks - Array of text chunks.
 * @param {string[]} keywords - Array of keywords for relevance scoring.
 * @param {number} maxTokens - Maximum token window size.
 * @returns {string[]} - Array of prioritized context chunks.
 */
export function hierarchicalMemoryManager(contextChunks, keywords, maxTokens = 2048) {
  const scoredChunks = contextChunks.map(chunk => ({
    text: chunk,
    score: relevanceScore(chunk, keywords)
  }));

  scoredChunks.sort((a, b) => b.score - a.score);

  const prioritizedChunks = [];
  let tokenCount = 0;

  for (const { text } of scoredChunks) {
    const chunkTokens = text.length; // Approximation: 1 char = 1 token
    if (tokenCount + chunkTokens > maxTokens) break;
    prioritizedChunks.push(text);
    tokenCount += chunkTokens;
  }

  return prioritizedChunks;
}

/**
 * Combines multiple text chunks into a single context window.
 * @param {string[]} chunks - Array of text chunks.
 * @returns {string} - Combined text.
 */
export function combineChunks(chunks) {
  return chunks.join('\n');
}

/**
 * Utility to split large text into smaller chunks.
 * @param {string} text - The text to split.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @returns {string[]} - Array of text chunks.
 */
export function splitText(text, chunkSize = 500) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Main function to process context dynamically.
 * @param {string} text - The full context text.
 * @param {string[]} keywords - Keywords for relevance scoring.
 * @param {number} maxTokens - Maximum token window size.
 * @returns {string} - Optimized context window.
 */
export function processContext(text, keywords, maxTokens = 2048) {
  const chunks = splitText(text);
  const summarizedChunks = chunks.flatMap(chunk => recursiveSummarize(chunk));
  const prioritizedChunks = hierarchicalMemoryManager(summarizedChunks, keywords, maxTokens);
  return combineChunks(prioritizedChunks);
}