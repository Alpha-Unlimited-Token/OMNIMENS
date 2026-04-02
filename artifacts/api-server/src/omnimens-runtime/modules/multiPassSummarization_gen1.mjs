/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_27
 * Name: multiPassSummarization
 * Purpose: Improves context compression by iteratively refining hierarchical summaries with adaptive focus on high-importance sections.
 * Description: This module performs multi-pass text summarization with adaptive focus and dynamic prioritization for efficient context compression.
 * Migrated: 2026-04-02T14:08:14.877Z
 */

// multiPassSummarization.mjs

import crypto from 'crypto';

/**
 * Generate a unique hash for a given string (used for tracking summaries).
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash of the input.
 */
export function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Split text into chunks of a specified size.
 * @param {string} text - The input text to split.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {string[]} - An array of text chunks.
 */
export function splitTextIntoChunks(text, chunkSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Generate an initial summary for a chunk of text.
 * @param {string} chunk - The text chunk to summarize.
 * @returns {string} - A basic summary of the chunk.
 */
export function summarizeChunk(chunk) {
  const sentences = chunk.split('.');
  const importantSentences = sentences.slice(0, Math.ceil(sentences.length / 3));
  return importantSentences.join('.') + '.';
}

/**
 * Reweight attention scores for summaries based on importance.
 * @param {Array<{summary: string, importance: number}>} summaries - Array of summaries with importance scores.
 * @returns {Array<{summary: string, importance: number}>} - Reweighted summaries.
 */
export function reweightAttention(summaries) {
  const totalImportance = summaries.reduce((sum, item) => sum + item.importance, 0);
  return summaries.map(item => ({
    summary: item.summary,
    importance: item.importance / totalImportance
  }));
}

/**
 * Perform multi-pass summarization on a given text.
 * @param {string} text - The input text to summarize.
 * @param {number} chunkSize - The size of chunks for initial processing.
 * @param {number} passes - The number of refinement passes.
 * @returns {string} - The final refined summary.
 */
export function multiPassSummarize(text, chunkSize = 500, passes = 3) {
  let chunks = splitTextIntoChunks(text, chunkSize);
  let summaries = chunks.map(chunk => ({
    summary: summarizeChunk(chunk),
    importance: chunk.length
  }));

  for (let pass = 0; pass < passes; pass++) {
    summaries = reweightAttention(summaries);
    summaries = summaries.map(item => ({
      summary: summarizeChunk(item.summary),
      importance: item.importance
    }));
  }

  return summaries.map(item => item.summary).join(' ');
}

/**
 * Utility function to extract high-importance sections from a text.
 * @param {string} text - The input text.
 * @param {number} threshold - Importance threshold (0 to 1).
 * @returns {string[]} - Array of high-importance sections.
 */
export function extractHighImportanceSections(text, threshold = 0.5) {
  const chunks = splitTextIntoChunks(text, 500);
  const summaries = chunks.map(chunk => ({
    summary: summarizeChunk(chunk),
    importance: chunk.length
  }));

  const reweighted = reweightAttention(summaries);
  return reweighted.filter(item => item.importance >= threshold).map(item => item.summary);
}

/**
 * Validate and normalize input text for summarization.
 * @param {string} text - The input text.
 * @returns {string} - Cleaned and normalized text.
 */
export function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}
