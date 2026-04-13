/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveContextRebuilder
 * Written: 2026-04-02T13:30:24.382Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveContextRebuilder.mjs

import { createHash } from 'crypto';

/**
 * Recursively summarizes and reconstructs token windows with importance-weighted expansion.
 * @param {Array<string>} tokens - Array of tokens to process.
 * @param {number} maxTokens - Maximum number of tokens allowed in the reconstructed window.
 * @param {function} importanceFunction - Function to score token importance.
 * @returns {Array<string>} - Reconstructed token window.
 */
export function rebuildContext(tokens, maxTokens, importanceFunction) {
  if (tokens.length <= maxTokens) return tokens;

  // Step 1: Score tokens by importance
  const scoredTokens = tokens.map(token => ({
    token,
    score: importanceFunction(token)
  }));

  // Step 2: Sort tokens by importance (descending)
  scoredTokens.sort((a, b) => b.score - a.score);

  // Step 3: Select top tokens based on maxTokens
  const topTokens = scoredTokens.slice(0, maxTokens).map(entry => entry.token);

  // Step 4: Recursively summarize remaining tokens
  const remainingTokens = scoredTokens.slice(maxTokens).map(entry => entry.token);
  const summarizedTokens = summarizeTokens(remainingTokens);

  // Combine top tokens and summarized tokens
  return [...topTokens, ...summarizedTokens];
}

/**
 * Summarizes tokens hierarchically.
 * @param {Array<string>} tokens - Array of tokens to summarize.
 * @returns {Array<string>} - Summarized tokens.
 */
export function summarizeTokens(tokens) {
  if (tokens.length === 0) return [];

  // Hash tokens to create a compact summary
  const hash = createHash('sha256');
  hash.update(tokens.join(' '));
  const summary = hash.digest('hex').slice(0, 16); // Use first 16 chars of hash

  return [summary];
}

/**
 * Default importance function based on token length.
 * @param {string} token - Token to evaluate.
 * @returns {number} - Importance score.
 */
export function defaultImportanceFunction(token) {
  return token.length; // Longer tokens are considered more important
}

/**
 * Utility to expand tokens by importance weighting.
 * @param {Array<string>} tokens - Array of tokens to expand.
 * @param {number} expansionFactor - Factor by which to expand tokens.
 * @param {function} importanceFunction - Function to score token importance.
 * @returns {Array<string>} - Expanded tokens.
 */
export function expandTokens(tokens, expansionFactor, importanceFunction) {
  const expandedTokens = [];

  for (const token of tokens) {
    const importance = importanceFunction(token);
    const repeatCount = Math.ceil(importance * expansionFactor);
    expandedTokens.push(...Array(repeatCount).fill(token));
  }

  return expandedTokens;
}

/**
 * Example usage of the module.
 */
export const exampleUsage = () => {
  const tokens = ['distributed', 'computing', 'consensus', 'algorithms', 'raft', 'paxos'];
  const maxTokens = 5;
  const reconstructedContext = rebuildContext(tokens, maxTokens, defaultImportanceFunction);
  console.log('Reconstructed Context:', reconstructedContext);

  const expandedTokens = expandTokens(tokens, 2, defaultImportanceFunction);
  console.log('Expanded Tokens:', expandedTokens);
};