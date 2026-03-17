/**
 * @module semanticMemoryManager
 * @description Manages long-term conversational context by compressing text using summarization and semantic hashing.
 */

const crypto = require('crypto');

/**
 * Compresses a given text into a semantic hash using SHA-256.
 * @param {string} text - The input text to hash.
 * @returns {string} - A semantic hash of the input text.
 */
function generateSemanticHash(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('Input text must be a non-empty string.');
  }
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Summarizes a given text by extracting key sentences based on length and relevance.
 * @param {string} text - The input text to summarize.
 * @param {number} maxSentences - Maximum number of sentences to include in the summary.
 * @returns {string} - A summarized version of the input text.
 */
function summarizeText(text, maxSentences = 3) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('Input text must be a non-empty string.');
  }
  if (typeof maxSentences !== 'number' || maxSentences <= 0) {
    throw new Error('maxSentences must be a positive integer.');
  }

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length <= maxSentences) {
    return text;
  }

  // Simple heuristic: prioritize longer sentences as potentially more meaningful.
  const sortedSentences = sentences.sort((a, b) => b.length - a.length);
  return sortedSentences.slice(0, maxSentences).join(' ').trim();
}

/**
 * Compresses and stores conversational context using summarization and semantic hashing.
 * @param {string[]} contextArray - Array of conversational context strings.
 * @param {number} maxSummarySentences - Maximum sentences for each summarized context.
 * @returns {Object[]} - Array of objects containing summarized context and semantic hashes.
 */
function manageSemanticContext(contextArray, maxSummarySentences = 3) {
  if (!Array.isArray(contextArray)) {
    throw new Error('contextArray must be an array of strings.');
  }

  return contextArray.map((context) => {
    if (typeof context !== 'string' || context.trim() === '') {
      throw new Error('Each context in contextArray must be a non-empty string.');
    }

    const summary = summarizeText(context, maxSummarySentences);
    const hash = generateSemanticHash(summary);

    return {
      original: context,
      summary,
      hash
    };
  });
}

module.exports = {
  generateSemanticHash,
  summarizeText,
  manageSemanticContext
};