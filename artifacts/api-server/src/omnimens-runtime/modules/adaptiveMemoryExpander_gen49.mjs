/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveMemoryExpander
 * Written: 2026-04-02T15:17:36.930Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveMemoryExpander.mjs

import crypto from 'crypto';

/**
 * Dynamically chunk large data into manageable pieces.
 * @param {string} data - The input data to chunk.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @returns {string[]} Array of data chunks.
 */
export function chunkData(data, chunkSize) {
  if (typeof data !== 'string' || chunkSize <= 0) {
    throw new Error('Invalid input: data must be a string and chunkSize must be a positive number.');
  }
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Summarizes a chunk of data using a hash-based importance heuristic.
 * @param {string} chunk - The data chunk to summarize.
 * @param {number} maxSummaryLength - Maximum length of the summary.
 * @returns {string} Summary of the chunk.
 */
export function summarizeChunk(chunk, maxSummaryLength) {
  if (typeof chunk !== 'string' || maxSummaryLength <= 0) {
    throw new Error('Invalid input: chunk must be a string and maxSummaryLength must be a positive number.');
  }
  const hash = crypto.createHash('sha256').update(chunk).digest('hex');
  return chunk.slice(0, maxSummaryLength) + ` [${hash.slice(0, 8)}]`;
}

/**
 * Recursively summarizes large data using hierarchical summarization.
 * @param {string[]} chunks - Array of data chunks.
 * @param {number} maxSummaryLength - Maximum length of each summary.
 * @returns {string[]} Array of hierarchical summaries.
 */
export function recursiveSummarization(chunks, maxSummaryLength) {
  if (!Array.isArray(chunks) || maxSummaryLength <= 0) {
    throw new Error('Invalid input: chunks must be an array and maxSummaryLength must be a positive number.');
  }
  let summaries = chunks.map(chunk => summarizeChunk(chunk, maxSummaryLength));
  while (summaries.length > 1) {
    const nextLevelChunks = [];
    for (let i = 0; i < summaries.length; i += 2) {
      const combined = summaries[i] + (summaries[i + 1] || '');
      nextLevelChunks.push(combined);
    }
    summaries = nextLevelChunks.map(chunk => summarizeChunk(chunk, maxSummaryLength));
  }
  return summaries;
}

/**
 * Expands the token window capacity by managing large contexts efficiently.
 * @param {string} data - The input data to process.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @param {number} maxSummaryLength - Maximum length of each summary.
 * @returns {string} Final hierarchical summary.
 */
export function adaptiveMemoryExpansion(data, chunkSize, maxSummaryLength) {
  if (typeof data !== 'string' || chunkSize <= 0 || maxSummaryLength <= 0) {
    throw new Error('Invalid input: data must be a string, chunkSize and maxSummaryLength must be positive numbers.');
  }
  const chunks = chunkData(data, chunkSize);
  const summaries = recursiveSummarization(chunks, maxSummaryLength);
  return summaries[0];
}

/**
 * Utility function to calculate the compression ratio of summarization.
 * @param {string} originalData - The original data.
 * @param {string} summarizedData - The summarized data.
 * @returns {number} Compression ratio as a percentage.
 */
export function calculateCompressionRatio(originalData, summarizedData) {
  if (typeof originalData !== 'string' || typeof summarizedData !== 'string') {
    throw new Error('Invalid input: both originalData and summarizedData must be strings.');
  }
  return ((1 - summarizedData.length / originalData.length) * 100).toFixed(2);
}
