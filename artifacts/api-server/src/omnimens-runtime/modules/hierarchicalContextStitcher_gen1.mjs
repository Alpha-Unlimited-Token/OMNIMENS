/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_17
 * Name: hierarchicalContextStitcher
 * Purpose: Reconstructs fine-grained contextual details from compressed summaries for nuanced reasoning over large token windows.
 * Description: Reconstructs fine-grained contextual details from compressed summaries for nuanced reasoning over large token windows.
 * Migrated: 2026-04-01T22:23:20.232Z
 */

// hierarchicalContextStitcher.mjs
import { createHash } from 'crypto';

/**
 * Generates a hash for a given string to create unique identifiers for context chunks.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash string.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Splits a large text into smaller chunks based on a maximum token size.
 * @param {string} text - The input text to split.
 * @param {number} maxTokens - The maximum number of tokens per chunk.
 * @returns {Array<{chunk: string, id: string}>} - Array of chunks with unique IDs.
 */
export function splitTextIntoChunks(text, maxTokens) {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = [];

  for (const word of words) {
    if (currentChunk.join(' ').length + word.length + 1 > maxTokens) {
      const chunkText = currentChunk.join(' ');
      chunks.push({ chunk: chunkText, id: generateHash(chunkText) });
      currentChunk = [];
    }
    currentChunk.push(word);
  }

  if (currentChunk.length > 0) {
    const chunkText = currentChunk.join(' ');
    chunks.push({ chunk: chunkText, id: generateHash(chunkText) });
  }

  return chunks;
}

/**
 * Extracts key sentences from a text based on importance weighting.
 * @param {string} text - The input text to summarize.
 * @param {number} importanceThreshold - Threshold for sentence importance (0-1).
 * @returns {string[]} - Array of key sentences.
 */
export function extractKeySentences(text, importanceThreshold) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  return sentences.filter((sentence) => {
    const importanceScore = sentence.length / text.length; // Simple heuristic: longer sentences are more important
    return importanceScore >= importanceThreshold;
  });
}

/**
 * Recursively expands a summary by fetching relevant details from original chunks.
 * @param {string} summary - The compressed summary.
 * @param {Array<{chunk: string, id: string}>} chunks - Original text chunks with IDs.
 * @param {number} maxDepth - Maximum recursion depth.
 * @returns {string} - Expanded context.
 */
export function recursiveContextExpansion(summary, chunks, maxDepth) {
  let expandedContext = summary;
  let depth = 0;

  while (depth < maxDepth) {
    const relevantChunks = chunks.filter(({ chunk }) => summary.includes(chunk.slice(0, 10))); // Simple relevance check
    if (relevantChunks.length === 0) break;

    for (const { chunk } of relevantChunks) {
      expandedContext += ` ${chunk}`;
    }

    depth++;
  }

  return expandedContext;
}

/**
 * Combines the above functions to reconstruct fine-grained context.
 * @param {string} inputText - The input text to process.
 * @param {number} maxTokens - Maximum tokens per chunk.
 * @param {number} importanceThreshold - Threshold for key sentence extraction.
 * @param {number} maxDepth - Maximum recursion depth for context expansion.
 * @returns {string} - Reconstructed fine-grained context.
 */
export function reconstructContext(inputText, maxTokens, importanceThreshold, maxDepth) {
  const chunks = splitTextIntoChunks(inputText, maxTokens);
  const summary = extractKeySentences(inputText, importanceThreshold).join(' ');
  return recursiveContextExpansion(summary, chunks, maxDepth);
}

/**
 * Utility function to calculate token length of a string (approximation).
 * @param {string} text - The input text.
 * @returns {number} - Approximate token count.
 */
export function calculateTokenLength(text) {
  return text.split(/\s+/).length;
}
