/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_14
 * Name: dynamicTokenWindow
 * Purpose: Manages token context dynamically with a sliding window and semantic prioritization to handle larger documents.
 * Description: Manages token context dynamically with sliding window, semantic prioritization, and hierarchical summarization for larger documents.
 * Migrated: 2026-04-02T15:46:59.469Z
 */

// Complete ES module code here

// Utility functions for token management and prioritization

/**
 * Calculates importance scores for tokens based on semantic prioritization, recency, and hierarchical summarization.
 * @param {Array<string>} tokens - Array of tokens to score.
 * @param {Array<number>} attentionWeights - Array of attention weights corresponding to tokens.
 * @param {number} recencyWeight - Weight factor for recency.
 * @returns {Array<{ token: string, score: number }>} - Array of tokens with their importance scores.
 */
export function calculateImportanceScores(tokens, attentionWeights, recencyWeight = 0.5) {
  if (tokens.length !== attentionWeights.length) {
    throw new Error("Tokens and attentionWeights arrays must have the same length.");
  }

  const scores = tokens.map((token, index) => {
    const recencyFactor = Math.exp(-recencyWeight * (tokens.length - index));
    const score = attentionWeights[index] * recencyFactor;
    return { token, score };
  });

  return scores.sort((a, b) => b.score - a.score); // Sort by descending importance
}

/**
 * Creates a sliding window of tokens based on importance scores.
 * @param {Array<{ token: string, score: number }>} scoredTokens - Array of tokens with importance scores.
 * @param {number} maxWindowSize - Maximum size of the sliding window.
 * @returns {Array<string>} - Array of tokens within the sliding window.
 */
export function createSlidingWindow(scoredTokens, maxWindowSize) {
  return scoredTokens.slice(0, maxWindowSize).map(item => item.token);
}

/**
 * Summarizes tokens hierarchically based on importance scores.
 * @param {Array<{ token: string, score: number }>} scoredTokens - Array of tokens with importance scores.
 * @param {number} summarySize - Number of tokens to include in the summary.
 * @returns {string} - Hierarchical summary of tokens.
 */
export function hierarchicalSummarization(scoredTokens, summarySize) {
  const topTokens = scoredTokens.slice(0, summarySize).map(item => item.token);
  return topTokens.join(" ");
}

/**
 * Dynamically manages token context by combining sliding window and summarization.
 * @param {Array<string>} tokens - Array of tokens to manage.
 * @param {Array<number>} attentionWeights - Array of attention weights corresponding to tokens.
 * @param {number} maxWindowSize - Maximum size of the sliding window.
 * @param {number} summarySize - Number of tokens to include in the summary.
 * @param {number} recencyWeight - Weight factor for recency.
 * @returns {{ slidingWindow: Array<string>, summary: string }} - Object containing sliding window and summary.
 */
export function dynamicTokenContext(tokens, attentionWeights, maxWindowSize, summarySize, recencyWeight = 0.5) {
  const scoredTokens = calculateImportanceScores(tokens, attentionWeights, recencyWeight);
  const slidingWindow = createSlidingWindow(scoredTokens, maxWindowSize);
  const summary = hierarchicalSummarization(scoredTokens, summarySize);

  return { slidingWindow, summary };
}

/**
 * Utility to normalize attention weights.
 * @param {Array<number>} weights - Array of raw attention weights.
 * @returns {Array<number>} - Array of normalized attention weights.
 */
export function normalizeAttentionWeights(weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total === 0) {
    throw new Error("Total attention weight cannot be zero.");
  }
  return weights.map(weight => weight / total);
}
