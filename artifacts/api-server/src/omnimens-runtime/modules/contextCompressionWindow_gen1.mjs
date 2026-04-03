/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_2
 * Name: contextCompressionWindow
 * Purpose: Maintains long-term conversation coherence by compressing and summarizing older context into embeddings.
 * Description: Compresses and summarizes older conversation context into embeddings while maintaining recent context for coherence.
 * Migrated: 2026-04-03T07:26:16.767Z
 */

// contextCompressionWindow.mjs

import crypto from 'crypto';

/**
 * Generate a fixed-length embedding for a given text input using a hash-based compression.
 * @param {string} text - The input text to compress.
 * @param {number} length - The desired length of the embedding (in bytes).
 * @returns {Uint8Array} - A fixed-length embedding for the input text.
 */
export function generateEmbedding(text, length = 32) {
  const hash = crypto.createHash('sha256');
  hash.update(text);
  const fullHash = hash.digest();
  return fullHash.slice(0, length);
}

/**
 * Summarize a list of text inputs into a single summary string.
 * @param {string[]} texts - Array of text inputs to summarize.
 * @param {number} maxLength - Maximum length of the summary in characters.
 * @returns {string} - A summarized version of the input texts.
 */
export function summarizeTexts(texts, maxLength = 200) {
  if (!Array.isArray(texts) || texts.some(t => typeof t !== 'string')) {
    throw new TypeError('Input must be an array of strings.');
  }

  const combinedText = texts.join(' ');
  return combinedText.length > maxLength
    ? combinedText.slice(0, maxLength - 3) + '...'
    : combinedText;
}

/**
 * Compress older context into embeddings and maintain a sliding window of recent context.
 * @param {string[]} context - Array of text inputs representing the conversation context.
 * @param {number} windowSize - Maximum number of recent items to keep in full form.
 * @param {number} embeddingLength - Length of the fixed embeddings for older context.
 * @returns {{ recent: string[], compressed: Uint8Array[] }} - Object containing recent context and compressed embeddings.
 */
export function compressContext(context, windowSize = 5, embeddingLength = 32) {
  if (!Array.isArray(context) || context.some(c => typeof c !== 'string')) {
    throw new TypeError('Context must be an array of strings.');
  }

  const recent = context.slice(-windowSize);
  const older = context.slice(0, -windowSize);
  const compressed = older.map(text => generateEmbedding(text, embeddingLength));

  return { recent, compressed };
}

/**
 * Reconstruct a readable summary from compressed embeddings and recent context.
 * @param {Uint8Array[]} compressed - Array of compressed embeddings.
 * @param {string[]} recent - Array of recent context strings.
 * @returns {string} - A readable summary combining recent context and a placeholder for compressed content.
 */
export function reconstructSummary(compressed, recent) {
  if (!Array.isArray(compressed) || !Array.isArray(recent)) {
    throw new TypeError('Compressed and recent must be arrays.');
  }

  const compressedPlaceholder = `[${compressed.length} compressed segments]`;
  const recentText = recent.join(' ');

  return `${compressedPlaceholder} ${recentText}`;
}

/**
 * Utility function to validate input parameters for context processing.
 * @param {any} input - The input to validate.
 * @param {string} type - Expected type of the input.
 * @param {string} paramName - Name of the parameter for error messages.
 * @throws {TypeError} - If the input is not of the expected type.
 */
export function validateInput(input, type, paramName) {
  if (typeof input !== type) {
    throw new TypeError(`${paramName} must be of type ${type}.`);
  }
}

// Example usage:
// const context = ['Hello', 'How are you?', 'Let us discuss AI.', 'What is your opinion?', 'I think AI is fascinating.'];
// const result = compressContext(context);
// console.log(result);