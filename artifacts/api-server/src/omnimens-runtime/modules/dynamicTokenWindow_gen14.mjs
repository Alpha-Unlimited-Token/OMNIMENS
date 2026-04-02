/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: dynamicTokenWindow
 * Written: 2026-04-02T15:13:35.700Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * TRANSLATION STATUS:
 * Novel constructs: attention
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (5 IR steps) | python: OK (5 IR steps) | c: OK (5 IR steps) | x86_64: OK (5 IR steps) | arm64: OK (5 IR steps) | avr: OK (5 IR steps)
 * Translation map version: 22
 */
// Complete ES module code here

// Utility functions for token management and prioritization

/**
 * Calculates importance scores for tokens based on semantic prioritization, recency, and hierarchical summarization.
 * @param {Array<string>} tokens - Array of tokens to score.
 * @param {Array<number>} attentionWeights - Array of attention weights corresponding to tokens.
 * @param {number} recencyWeight - Weight factor for recency.
 * @returns {Array<{ token, score}>} - Array of tokens with their importance scores.
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
 * @param {Array<{ token, score}>} scoredTokens - Array of tokens with importance scores.
 * @param {number} maxWindowSize - Maximum size of the sliding window.
 * @returns {Array<string>} - Array of tokens within the sliding window.
 */
export function createSlidingWindow(scoredTokens, maxWindowSize) {
  return scoredTokens.slice(0, maxWindowSize).map(item => item.token);
}

/**
 * Summarizes tokens hierarchically based on importance scores.
 * @param {Array<{ token, score}>} scoredTokens - Array of tokens with importance scores.
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
 * @returns {{ slidingWindow, summary}} - Object containing sliding window and summary.
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
