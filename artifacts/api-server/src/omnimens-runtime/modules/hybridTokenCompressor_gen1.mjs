/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_3
 * Name: hybridTokenCompressor
 * Purpose: Combines lossy and lossless compression to improve long-context reasoning and memory coherence.
 * Description: Combines hierarchical summarization and critical detail preservation for improved long-context reasoning and memory coherence.
 * Migrated: 2026-04-02T15:02:53.828Z
 */

// hybridTokenCompressor.mjs

import { createHash } from 'crypto';

/**
 * Hashes a string using SHA-256 for lossless compression of critical details.
 * @param {string} input - The input string to hash.
 * @returns {string} - The SHA-256 hash of the input.
 */
export function hashString(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Summarizes text hierarchically by breaking it into chunks and summarizing each chunk.
 * @param {string} text - The input text to summarize.
 * @param {number} chunkSize - Number of characters per chunk.
 * @returns {string} - A hierarchical summary of the input text.
 */
export function hierarchicalSummarization(text, chunkSize = 256) {
  if (chunkSize <= 0) throw new Error('Chunk size must be greater than 0');
  const chunks = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push(summarizeChunk(chunk));
  }

  return summarizeChunk(chunks.join(' '));
}

/**
 * Preserves critical details by identifying key phrases using selective attention.
 * @param {string} text - The input text.
 * @param {Array<string>} keywords - List of keywords to prioritize.
 * @returns {string} - Text containing only critical details.
 */
export function preserveCriticalDetails(text, keywords = []) {
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  const sentences = text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s/);

  return sentences
    .filter(sentence => lowerKeywords.some(keyword => sentence.toLowerCase().includes(keyword)))
    .join(' ');
}

/**
 * Combines hierarchical summarization and critical detail preservation.
 * @param {string} text - The input text.
 * @param {number} chunkSize - Number of characters per chunk for summarization.
 * @param {Array<string>} keywords - List of keywords to prioritize.
 * @returns {string} - A compressed representation of the input text.
 */
export function hybridTokenCompressor(text, chunkSize = 256, keywords = []) {
  const summarized = hierarchicalSummarization(text, chunkSize);
  const criticalDetails = preserveCriticalDetails(text, keywords);

  return `${summarized}\n\nCritical Details:\n${criticalDetails}`;
}

/**
 * Summarizes a single chunk of text (helper function).
 * @param {string} chunk - The chunk of text to summarize.
 * @returns {string} - A simple summary of the chunk.
 */
function summarizeChunk(chunk) {
  const words = chunk.split(' ');
  const mid = Math.floor(words.length / 2);

  return `${words.slice(0, 3).join(' ')} ... ${words.slice(mid, mid + 3).join(' ')} ... ${words.slice(-3).join(' ')}`;
}
