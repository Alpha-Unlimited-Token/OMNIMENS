/**
 * @module contextSummarizationManager
 * @description This module manages long-term context by summarizing and chunking older parts of conversations, enabling efficient retrieval of relevant context.
 */

/**
 * Summarizes a given text using a sliding window approach.
 * @param {string} text - The input text to summarize.
 * @param {number} windowSize - The size of the sliding window in characters.
 * @param {number} stepSize - The step size for the sliding window in characters.
 * @returns {string[]} - An array of summarized chunks.
 */
export function summarizeText(text, windowSize = 500, stepSize = 250) {
  if (typeof text !== 'string' || text.length === 0) {
    throw new Error('Input text must be a non-empty string.');
  }
  if (windowSize <= 0 || stepSize <= 0) {
    throw new Error('Window size and step size must be positive integers.');
  }

  const chunks = [];
  for (let i = 0; i < text.length; i += stepSize) {
    const window = text.slice(i, i + windowSize);
    const summary = summarizeChunk(window);
    chunks.push(summary);
  }

  return chunks;
}

/**
 * Summarizes a single chunk of text.
 * @private
 * @param {string} chunk - The chunk of text to summarize.
 * @returns {string} - A summarized version of the chunk.
 */
function summarizeChunk(chunk) {
  // Naive summarization: Take the first and last 100 characters of the chunk.
  const start = chunk.slice(0, 100);
  const end = chunk.slice(-100);
  return `${start} ... ${end}`;
}

/**
 * Computes similarity between two pieces of text using a simple character overlap metric.
 * @param {string} text1 - The first text input.
 * @param {string} text2 - The second text input.
 * @returns {number} - A similarity score between 0 and 1.
 */
export function computeSimilarity(text1, text2) {
  if (typeof text1 !== 'string' || typeof text2 !== 'string') {
    throw new Error('Both inputs must be strings.');
  }

  const set1 = new Set(text1);
  const set2 = new Set(text2);
  const intersection = new Set([...set1].filter(char => set2.has(char)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Retrieves the most relevant summarized chunk based on similarity to a query.
 * @param {string} query - The query text to match against.
 * @param {string[]} summaries - An array of summarized chunks.
 * @returns {string} - The most relevant summarized chunk.
 */
export function retrieveRelevantChunk(query, summaries) {
  if (typeof query !== 'string' || !Array.isArray(summaries)) {
    throw new Error('Invalid input: query must be a string and summaries must be an array of strings.');
  }

  let maxSimilarity = 0;
  let bestMatch = '';

  for (const summary of summaries) {
    const similarity = computeSimilarity(query, summary);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      bestMatch = summary;
    }
  }

  return bestMatch;
}

/**
 * Manages context by summarizing and chunking older parts of a conversation.
 * @param {string} conversation - The full conversation text.
 * @param {string} query - The query to retrieve relevant context for.
 * @param {number} windowSize - The size of the sliding window in characters.
 * @param {number} stepSize - The step size for the sliding window in characters.
 * @returns {string} - The most relevant summarized chunk.
 */
export function manageContext(conversation, query, windowSize = 500, stepSize = 250) {
  const summaries = summarizeText(conversation, windowSize, stepSize);
  return retrieveRelevantChunk(query, summaries);
}