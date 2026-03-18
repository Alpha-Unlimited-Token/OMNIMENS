// hierarchicalMemoryManager.js

/**
 * @module hierarchicalMemoryManager
 * @description Compresses and manages long-term conversational context within the token window using hierarchical summarization and attention-based retrieval.
 */

/**
 * Summarizes a list of text chunks hierarchically.
 * Breaks down input into smaller summaries and recursively condenses them.
 * @param {string[]} chunks - Array of text chunks to summarize.
 * @param {number} maxLength - Maximum length of the summarized output.
 * @returns {string} - Hierarchically summarized text.
 */
function hierarchicalSummarize(chunks, maxLength) {
  if (chunks.length === 0) return '';

  // Base case: If the combined length is below maxLength, concatenate and return.
  const combined = chunks.join(' ');
  if (combined.length <= maxLength) return combined;

  // Split into smaller groups for recursive summarization.
  const groupSize = Math.ceil(chunks.length / 2);
  const groupedSummaries = [];

  for (let i = 0; i < chunks.length; i += groupSize) {
    const group = chunks.slice(i, i + groupSize);
    groupedSummaries.push(hierarchicalSummarize(group, maxLength / 2));
  }

  return hierarchicalSummarize(groupedSummaries, maxLength);
}

/**
 * Retrieves the most relevant context based on attention scores.
 * Uses cosine similarity for relevance ranking.
 * @param {string[]} contexts - Array of context strings.
 * @param {string} query - Query to match against.
 * @param {number} topN - Number of top relevant contexts to retrieve.
 * @returns {string[]} - Array of top relevant context strings.
 */
function attentionBasedRetrieval(contexts, query, topN) {
  const scores = contexts.map(context => cosineSimilarity(vectorize(context), vectorize(query)));

  // Pair contexts with scores and sort by relevance.
  const scoredContexts = contexts.map((context, index) => ({ context, score: scores[index] }));
  scoredContexts.sort((a, b) => b.score - a.score);

  return scoredContexts.slice(0, topN).map(item => item.context);
}

/**
 * Converts a string into a vector representation.
 * Simple character-based vectorization for demonstration purposes.
 * @param {string} text - Input text.
 * @returns {number[]} - Vector representation of the text.
 */
function vectorize(text) {
  const vector = new Array(256).fill(0);
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code < 256) vector[code]++;
  }
  return vector;
}

/**
 * Calculates cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Compresses and retrieves relevant conversational context.
 * Combines hierarchical summarization and attention-based retrieval.
 * @param {string[]} contextHistory - Array of past conversational context strings.
 * @param {string} currentQuery - Current query or conversational input.
 * @param {number} tokenLimit - Maximum token limit for compressed context.
 * @returns {string} - Condensed and relevant conversational context.
 */
function manageContext(contextHistory, currentQuery, tokenLimit) {
  const relevantContexts = attentionBasedRetrieval(contextHistory, currentQuery, Math.ceil(contextHistory.length / 2));
  return hierarchicalSummarize(relevantContexts, tokenLimit);
}

// Export functions
export {
  hierarchicalSummarize,
  attentionBasedRetrieval,
  vectorize,
  cosineSimilarity,
  manageContext
};