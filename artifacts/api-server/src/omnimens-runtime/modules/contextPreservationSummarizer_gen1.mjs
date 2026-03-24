/**
 * @module contextPreservationSummarizer
 * @description Compresses long conversation history into hierarchical summaries and dense vector embeddings for coherence across token limits.
 */

/**
 * Generates a hierarchical summary of a conversation history.
 * @param {string[]} conversationHistory - Array of conversation strings in chronological order.
 * @param {number} summaryLevels - Number of hierarchical levels for summarization.
 * @returns {string[]} - Array of hierarchical summaries, from most detailed to most abstract.
 */
export function generateHierarchicalSummary(conversationHistory, summaryLevels = 3) {
  if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) {
    throw new Error("conversationHistory must be a non-empty array of strings.");
  }
  if (typeof summaryLevels !== "number" || summaryLevels < 1) {
    throw new Error("summaryLevels must be a positive integer.");
  }

  const summaries = [];
  let currentLevel = conversationHistory;

  for (let level = 0; level < summaryLevels; level++) {
    const nextLevel = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const chunk = currentLevel.slice(i, i + 2);
      const summary = chunk.join(" ").slice(0, 200); // Simple compression logic.
      nextLevel.push(summary);
    }
    summaries.push(nextLevel.join("\n"));
    currentLevel = nextLevel;
  }

  return summaries.reverse();
}

/**
 * Encodes a summary into a dense vector representation.
 * @param {string} summary - The summary string to encode.
 * @returns {number[]} - Dense vector representation of the summary.
 */
export function encodeSummaryToVector(summary) {
  if (typeof summary !== "string" || summary.length === 0) {
    throw new Error("summary must be a non-empty string.");
  }

  const vector = new Array(128).fill(0);
  for (let i = 0; i < summary.length; i++) {
    const charCode = summary.charCodeAt(i);
    vector[i % 128] += charCode;
  }

  return vector.map((value) => value % 256);
}

/**
 * Compresses conversation history into hierarchical summaries and encodes them into dense vectors.
 * @param {string[]} conversationHistory - Array of conversation strings in chronological order.
 * @param {number} summaryLevels - Number of hierarchical levels for summarization.
 * @returns {{ summaries, vectors }} - Object containing hierarchical summaries and their vector encodings.
 */
export function compressConversationHistory(conversationHistory, summaryLevels = 3) {
  const summaries = generateHierarchicalSummary(conversationHistory, summaryLevels);
  const vectors = summaries.map(encodeSummaryToVector);

  return { summaries, vectors };
}

/**
 * Retrieves the most relevant summary vector for a given query.
 * @param {string} query - The query string.
 * @param {number[][]} vectors - Array of dense vector representations.
 * @returns {number[]} - The most relevant vector.
 */
export function retrieveRelevantVector(query, vectors) {
  if (typeof query !== "string" || query.length === 0) {
    throw new Error("query must be a non-empty string.");
  }
  if (!Array.isArray(vectors) || vectors.length === 0 || !Array.isArray(vectors[0])) {
    throw new Error("vectors must be a non-empty array of dense vectors.");
  }

  const queryVector = encodeSummaryToVector(query);

  let bestMatch = null;
  let bestScore = -Infinity;

  for (const vector of vectors) {
    const score = vector.reduce((acc, value, index) => acc + value * queryVector[index], 0);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = vector;
    }
  }

  return bestMatch;
}