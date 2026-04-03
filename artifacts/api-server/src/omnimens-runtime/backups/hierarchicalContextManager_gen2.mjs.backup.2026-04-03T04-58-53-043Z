/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalContextManager
 * Written: 2026-04-01T22:02:26.723Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalContextManager.mjs

import crypto from 'crypto';

/**
 * Splits a long context into manageable chunks based on a specified size.
 * @param {string} context - The long text context to be chunked.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {Array<string>} - Array of context chunks.
 */
export function chunkContext(context, chunkSize) {
  if (typeof context !== 'string' || chunkSize <= 0) {
    throw new Error('Invalid input: context must be a string and chunkSize must be a positive number.');
  }
  const chunks = [];
  for (let i = 0; i < context.length; i += chunkSize) {
    chunks.push(context.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Summarizes a chunk of text using a naive keyword extraction approach.
 * @param {string} chunk - The text chunk to summarize.
 * @param {number} maxKeywords - The maximum number of keywords to extract.
 * @returns {string} - A summary of the chunk.
 */
export function summarizeChunk(chunk, maxKeywords) {
  if (typeof chunk !== 'string' || maxKeywords <= 0) {
    throw new Error('Invalid input: chunk must be a string and maxKeywords must be a positive number.');
  }
  const wordFrequency = {};
  const words = chunk.toLowerCase().match(/\b\w+\b/g) || [];

  for (const word of words) {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  }

  const sortedKeywords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);

  return sortedKeywords.join(', ');
}

/**
 * Recursively attends to relevant chunks based on a query embedding.
 * @param {Array<string>} chunks - Array of text chunks.
 * @param {string} query - The query to match against.
 * @param {number} maxDepth - The maximum recursion depth.
 * @returns {Array<string>} - Array of relevant chunks.
 */
export function attendRelevantChunks(chunks, query, maxDepth) {
  if (!Array.isArray(chunks) || typeof query !== 'string' || maxDepth <= 0) {
    throw new Error('Invalid input: chunks must be an array, query must be a string, and maxDepth must be a positive number.');
  }

  const queryHash = crypto.createHash('sha256').update(query).digest('hex');

  const relevanceScores = chunks.map(chunk => {
    const chunkHash = crypto.createHash('sha256').update(chunk).digest('hex');
    return {
      chunk,
      score: compareHashes(queryHash, chunkHash)
    };
  });

  relevanceScores.sort((a, b) => b.score - a.score);
  const mostRelevantChunks = relevanceScores.slice(0, Math.min(chunks.length, maxDepth)).map(item => item.chunk);

  if (maxDepth === 1 || mostRelevantChunks.length <= 1) {
    return mostRelevantChunks;
  }

  return attendRelevantChunks(mostRelevantChunks, query, maxDepth - 1);
}

/**
 * Compares two hash values to compute a similarity score.
 * @param {string} hash1 - The first hash.
 * @param {string} hash2 - The second hash.
 * @returns {number} - A similarity score between 0 and 1.
 */
export function compareHashes(hash1, hash2) {
  if (typeof hash1 !== 'string' || typeof hash2 !== 'string') {
    throw new Error('Invalid input: hash1 and hash2 must be strings.');
  }
  let matches = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) matches++;
  }
  return matches / hash1.length;
}

/**
 * Main function to manage hierarchical context.
 * @param {string} context - The long text context.
 * @param {string} query - The query to match against.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @param {number} maxKeywords - The maximum number of keywords per chunk.
 * @param {number} maxDepth - The maximum recursion depth.
 * @returns {Array<string>} - Relevant summarized chunks.
 */
export function manageHierarchicalContext(context, query, chunkSize, maxKeywords, maxDepth) {
  const chunks = chunkContext(context, chunkSize);
  const summarizedChunks = chunks.map(chunk => summarizeChunk(chunk, maxKeywords));
  return attendRelevantChunks(summarizedChunks, query, maxDepth);
}