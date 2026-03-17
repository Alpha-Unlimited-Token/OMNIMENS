/**
 * @module contextCompression
 * @description Summarizes and compresses conversation history into semantic embeddings for extended memory capabilities.
 */

const crypto = require('crypto');

/**
 * Generate a semantic embedding for a given text input.
 * Uses SHA-256 hashing as a placeholder for embedding generation.
 *
 * @param {string} text - The input text to embed.
 * @returns {string} - A fixed-length hash representing the semantic embedding.
 */
function generateEmbedding(text) {
  if (typeof text !== 'string' || text.length === 0) {
    throw new Error('Input text must be a non-empty string.');
  }

  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Summarizes an array of conversation messages into a single concise summary.
 *
 * @param {string[]} messages - Array of conversation messages in chronological order.
 * @returns {string} - A summarized version of the conversation.
 */
function summarizeMessages(messages) {
  if (!Array.isArray(messages) || messages.some(msg => typeof msg !== 'string')) {
    throw new Error('Messages must be an array of strings.');
  }

  const summary = messages.slice(-5).join(' '); // Naive summarization: last 5 messages concatenated.
  return summary.length > 500 ? summary.slice(0, 500) + '...' : summary;
}

/**
 * Compresses conversation history into semantic embeddings for retrieval.
 *
 * @param {string[]} conversationHistory - Array of conversation messages in chronological order.
 * @returns {Object} - An object containing the summary and its semantic embedding.
 */
function compressContext(conversationHistory) {
  const summary = summarizeMessages(conversationHistory);
  const embedding = generateEmbedding(summary);

  return {
    summary,
    embedding
  };
}

/**
 * Retrieves the most relevant conversation context given a query.
 * Uses semantic similarity (placeholder: hash comparison) to find the best match.
 *
 * @param {string} query - The query to match against stored embeddings.
 * @param {Object[]} storedContexts - Array of stored contexts with `summary` and `embedding` properties.
 * @returns {Object|null} - The most relevant context or null if no match is found.
 */
function retrieveContext(query, storedContexts) {
  if (typeof query !== 'string' || !Array.isArray(storedContexts)) {
    throw new Error('Invalid input: query must be a string and storedContexts must be an array.');
  }

  const queryEmbedding = generateEmbedding(query);
  let bestMatch = null;
  let bestScore = Infinity;

  for (const context of storedContexts) {
    const score = levenshteinDistance(queryEmbedding, context.embedding);
    if (score < bestScore) {
      bestScore = score;
      bestMatch = context;
    }
  }

  return bestMatch;
}

/**
 * Calculates the Levenshtein distance between two strings.
 *
 * @param {string} a - The first string.
 * @param {string} b - The second string.
 * @returns {number} - The Levenshtein distance between the two strings.
 */
function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Deletion
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

module.exports = {
  generateEmbedding,
  summarizeMessages,
  compressContext,
  retrieveContext
};