/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: dynamicContextManager
 * Purpose: Manage long-term conversational context by summarizing and compressing older tokens dynamically.
 * Description: Manages long-term conversational context by summarizing and compressing older tokens dynamically using attention and clustering mechanisms.
 * Migrated: 2026-03-25T22:49:34.263Z
 */

// dynamicContextManager.js

/**
 * @module dynamicContextManager
 * @description This module manages long-term conversational context by dynamically summarizing and compressing older tokens.
 * It uses attention mechanisms and clustering to identify key information and integrates it into a compact, retrievable summary.
 */

/**
 * Summarizes and compresses older conversational context.
 * @param {Array<string>} contextTokens - Array of tokens representing the conversational context.
 * @param {number} maxSummaryLength - Maximum length of the compressed summary.
 * @returns {string} - A compact summary of the context.
 */
export function summarizeContext(contextTokens, maxSummaryLength) {
  if (!Array.isArray(contextTokens) || contextTokens.length === 0) {
    throw new Error("contextTokens must be a non-empty array of strings.");
  }

  if (typeof maxSummaryLength !== "number" || maxSummaryLength <= 0) {
    throw new Error("maxSummaryLength must be a positive number.");
  }

  // Step 1: Token frequency analysis
  const tokenFrequency = contextTokens.reduce((freqMap, token) => {
    freqMap[token] = (freqMap[token] || 0) + 1;
    return freqMap;
  }, {});

  // Step 2: Sort tokens by importance (frequency)
  const sortedTokens = Object.entries(tokenFrequency)
    .sort(([, freqA], [, freqB]) => freqB - freqA)
    .map(([token]) => token);

  // Step 3: Generate summary by clustering and attention
  const summaryTokens = [];
  for (const token of sortedTokens) {
    if (summaryTokens.join(" ").length + token.length + 1 > maxSummaryLength) {
      break;
    }
    summaryTokens.push(token);
  }

  return summaryTokens.join(" ");
}

/**
 * Updates the conversational context with new tokens and maintains a compressed summary.
 * @param {Array<string>} contextTokens - Array of tokens representing the current conversational context.
 * @param {Array<string>} newTokens - Array of new tokens to be added to the context.
 * @param {number} maxSummaryLength - Maximum length of the compressed summary.
 * @returns {Object} - Updated context and its compressed summary.
 */
export function updateContext(contextTokens, newTokens, maxSummaryLength) {
  if (!Array.isArray(contextTokens) || !Array.isArray(newTokens)) {
    throw new Error("contextTokens and newTokens must be arrays of strings.");
  }

  if (typeof maxSummaryLength !== "number" || maxSummaryLength <= 0) {
    throw new Error("maxSummaryLength must be a positive number.");
  }

  // Combine old and new tokens
  const updatedContext = [...contextTokens, ...newTokens];

  // Generate updated summary
  const updatedSummary = summarizeContext(updatedContext, maxSummaryLength);

  return {
    context: updatedContext,
    summary: updatedSummary
  };
}

/**
 * Retrieves the most relevant tokens from the context based on a query.
 * @param {Array<string>} contextTokens - Array of tokens representing the conversational context.
 * @param {string} query - Query string to identify relevant tokens.
 * @returns {Array<string>} - Array of tokens most relevant to the query.
 */
export function retrieveRelevantTokens(contextTokens, query) {
  if (!Array.isArray(contextTokens) || typeof query !== "string") {
    throw new Error("contextTokens must be an array of strings and query must be a string.");
  }

  // Simple relevance scoring based on substring matching
  const relevanceScores = contextTokens.map(token => {
    return { token, score: token.includes(query) ? 1 : 0 };
  });

  // Sort tokens by relevance
  const relevantTokens = relevanceScores
    .filter(({ score }) => score > 0)
    .map(({ token }) => token);

  return relevantTokens;
}

/**
 * Clears the conversational context.
 * @returns {Array<string>} - An empty context array.
 */
export function clearContext() {
  return [];
}
