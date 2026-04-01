/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextStitchingManager
 * Written: 2026-04-01T22:11:38.934Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextStitchingManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given string to uniquely identify context chunks.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateContextHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Recursively summarizes context chunks while preserving semantic continuity.
 * @param {Array<string>} contextChunks - Array of context strings.
 * @param {number} maxLength - Maximum length for the summarized context.
 * @returns {string} - A summarized version of the context.
 */
export function summarizeContext(contextChunks, maxLength) {
  if (contextChunks.length === 0) return '';
  
  let summarized = '';
  for (const chunk of contextChunks) {
    summarized += chunk + ' ';
    if (summarized.length >= maxLength) break;
  }

  return summarized.trim().slice(0, maxLength);
}

/**
 * Calculates relevance scores for context chunks based on keyword matching.
 * @param {Array<string>} contextChunks - Array of context strings.
 * @param {Array<string>} keywords - Keywords to prioritize in relevance scoring.
 * @returns {Array<{chunk, score}>} - Array of context chunks with relevance scores.
 */
export function calculateRelevanceScores(contextChunks, keywords) {
  return contextChunks.map(chunk => {
    let score = 0;
    for (const keyword of keywords) {
      if (chunk.includes(keyword)) score++;
    }
    return { chunk, score };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Dynamically compresses and reintegrates context for long conversations.
 * @param {Array<string>} contextChunks - Array of context strings.
 * @param {Array<string>} keywords - Keywords to prioritize.
 * @param {number} maxLength - Maximum length for the compressed context.
 * @returns {string} - Compressed and reintegrated context.
 */
export function compressAndReintegrateContext(contextChunks, keywords, maxLength) {
  const relevanceScores = calculateRelevanceScores(contextChunks, keywords);
  const sortedChunks = relevanceScores.map(entry => entry.chunk);
  return summarizeContext(sortedChunks, maxLength);
}

/**
 * Utility function to split large context into manageable chunks.
 * @param {string} context - The full context string.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @returns {Array<string>} - Array of context chunks.
 */
export function splitContextIntoChunks(context, chunkSize) {
  const chunks = [];
  for (let i = 0; i < context.length; i += chunkSize) {
    chunks.push(context.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Utility function to stitch context chunks back into a single string.
 * @param {Array<string>} contextChunks - Array of context strings.
 * @returns {string} - Stitched context string.
 */
export function stitchContextChunks(contextChunks) {
  return contextChunks.join(' ').trim();
}

/**
 * Main function to manage context stitching and summarization.
 * @param {string} fullContext - The full conversation context.
 * @param {Array<string>} keywords - Keywords to prioritize.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @param {number} maxLength - Maximum length for the compressed context.
 * @returns {string} - Final compressed and reintegrated context.
 */
export function contextStitchingManager(fullContext, keywords, chunkSize, maxLength) {
  const chunks = splitContextIntoChunks(fullContext, chunkSize);
  return compressAndReintegrateContext(chunks, keywords, maxLength);
}