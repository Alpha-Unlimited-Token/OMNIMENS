/**
 * OMNIMENS Self-Authored Module
 * Source: evolution_engine
 * Title: Evolution Module: contextCompression
 * Written: 2026-03-20T18:38:05.582Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

// contextCompression.js

/**
 * @module contextCompression
 * @description Provides functions to compress and summarize conversation context using hierarchical summarization and embedding-based encoding.
 */

/**
 * Compresses a list of conversation entries into a summarized form.
 * Uses hierarchical summarization to iteratively reduce the size of the input.
 *
 * @param {string[]} contextEntries - Array of conversation entries to compress.
 * @param {number} maxLength - Maximum length of the compressed output in characters.
 * @returns {string} - Compressed and summarized context.
 */
export function compressContext(contextEntries, maxLength) {
  if (!Array.isArray(contextEntries) || contextEntries.some(entry => typeof entry !== 'string')) {
    throw new TypeError('contextEntries must be an array of strings.');
  }
  if (typeof maxLength !== 'number' || maxLength <= 0) {
    throw new TypeError('maxLength must be a positive number.');
  }

  // Step 1: Initial summarization of each entry
  const summarizedEntries = contextEntries.map(entry => summarizeText(entry, Math.floor(maxLength / contextEntries.length)));

  // Step 2: Hierarchical summarization
  let combinedSummary = summarizedEntries.join(' ');
  while (combinedSummary.length > maxLength) {
    combinedSummary = summarizeText(combinedSummary, maxLength);
  }

  return combinedSummary;
}

/**
 * Generates a basic summary of a given text by truncating and retaining key sentences.
 *
 * @param {string} text - The text to summarize.
 * @param {number} targetLength - Target maximum length of the summary.
 * @returns {string} - Summarized text.
 */
function summarizeText(text, targetLength) {
  if (text.length <= targetLength) return text;

  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]/g) || [text];

  // Sort sentences by importance (naive approach: by length)
  const sortedSentences = sentences.sort((a, b) => b.length - a.length);

  // Iteratively add sentences until target length is reached
  let summary = '';
  for (const sentence of sortedSentences) {
    if ((summary + sentence).length > targetLength) break;
    summary += sentence;
  }

  return summary.trim();
}

/**
 * Encodes a given text into a simple numerical embedding for comparison purposes.
 *
 * @param {string} text - The text to encode.
 * @returns {number[]} - Numerical embedding representing the text.
 */
export function encodeTextToEmbedding(text) {
  if (typeof text !== 'string') {
    throw new TypeError('text must be a string.');
  }

  // Simple embedding: character code sum and length normalization
  const charCodes = Array.from(text).map(char => char.charCodeAt(0));
  const sum = charCodes.reduce((acc, code) => acc + code, 0);
  const mean = sum / charCodes.length;

  return [sum, mean, charCodes.length];
}

/**
 * Compares two texts based on their embeddings.
 *
 * @param {string} textA - First text to compare.
 * @param {string} textB - Second text to compare.
 * @returns {number} - Similarity score (higher means more similar).
 */
export function compareTextSimilarity(textA, textB) {
  const embeddingA = encodeTextToEmbedding(textA);
  const embeddingB = encodeTextToEmbedding(textB);

  // Simple similarity: inverse of Euclidean distance
  const distance = Math.sqrt(
    embeddingA.reduce((sum, value, index) => sum + Math.pow(value - embeddingB[index], 2), 0)
  );

  return 1 / (1 + distance); // Normalize similarity to [0, 1]
}
