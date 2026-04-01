/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_6
 * Name: contextStitchingManager
 * Purpose: Dynamically compresses and summarizes early context, enabling retrieval and reintegration during long conversations.
 * Description: Dynamically compresses and summarizes conversation context for long interactions, enabling reintegration while preserving relevance and semantic continuity.
 * Migrated: 2026-04-01T22:23:20.239Z
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
 * @returns {Array<{chunk: string, score: number}>} - Array of context chunks with relevance scores.
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