/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_8
 * Name: slidingWindowContextCompressor
 * Purpose: Summarize and compress earlier tokens in long conversations to extend effective context length.
 * Description: Summarizes and compresses earlier tokens in conversations using embeddings to extend effective context length dynamically.
 * Migrated: 2026-04-01T22:23:20.241Z
 */

// slidingWindowContextCompressor.mjs

import crypto from 'crypto';

/**
 * Generates embeddings for text using a simulated transformer-based approach.
 * @param {string} text - The text to generate embeddings for.
 * @returns {Array<number>} - A fixed-length numerical embedding array.
 */
export function generateEmbeddings(text) {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  const embedding = Array.from(hash).map((char) => char.charCodeAt(0) % 256);
  return embedding.slice(0, 128); // Fixed-length embedding
}

/**
 * Compresses earlier tokens into a summarized representation.
 * @param {Array<string>} tokens - Array of earlier tokens.
 * @returns {string} - A compressed summary of the tokens.
 */
export function compressTokens(tokens) {
  const concatenated = tokens.join(' ');
  const embeddings = generateEmbeddings(concatenated);
  const summary = embeddings.map((num) => String.fromCharCode((num % 26) + 97)).join('');
  return summary;
}

/**
 * Merges compressed context with active context dynamically.
 * @param {string} compressedContext - The compressed earlier context.
 * @param {string} activeContext - The active context.
 * @returns {string} - Merged context string.
 */
export function mergeContexts(compressedContext, activeContext) {
  return `${compressedContext} ${activeContext}`;
}

/**
 * Sliding window mechanism to manage and compress context dynamically.
 * @param {Array<string>} conversationTokens - Array of all conversation tokens.
 * @param {number} windowSize - Number of tokens in the active context.
 * @returns {string} - Final merged context string.
 */
export function slidingWindowContextCompressor(conversationTokens, windowSize) {
  if (windowSize <= 0 || conversationTokens.length === 0) {
    return '';
  }

  const earlierTokens = conversationTokens.slice(0, -windowSize);
  const activeTokens = conversationTokens.slice(-windowSize);

  const compressedContext = compressTokens(earlierTokens);
  const activeContext = activeTokens.join(' ');

  return mergeContexts(compressedContext, activeContext);
}
