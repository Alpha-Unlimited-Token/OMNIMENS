/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: sparseAttentionContextManager
 * Written: 2026-04-03T04:59:24.019Z
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
 * Compiled targets: javascript: OK (2 IR steps) | python: OK (2 IR steps) | c: OK (2 IR steps) | x86_64: OK (2 IR steps) | arm64: OK (2 IR steps) | avr: OK (2 IR steps)
 * Translation map version: 22
 */
// sparseAttentionContextManager.mjs

import { createHash } from 'crypto';

/**
 * Computes importance scores for tokens based on recency, frequency, and semantic weight.
 * @param {Array} tokens - Array of token objects with properties { token, timestamp, frequency, semanticWeight}.
 * @returns {Array} - Array of tokens sorted by importance score in descending order.
 */
export function computeImportanceScores(tokens) {
  if (!Array.isArray(tokens)) {
    throw new TypeError('Input must be an array of token objects.');
  }

  return tokens.map(token => {
    const recencyScore = 1 / (Date.now() - token.timestamp + 1); // Recent tokens get higher scores
    const frequencyScore = Math.log(token.frequency + 1); // Logarithmic scaling for frequency
    const semanticScore = token.semanticWeight; // Direct semantic weight

    return {
      ...token,
      importanceScore: recencyScore + frequencyScore + semanticScore
    };
  }).sort((a, b) => b.importanceScore - a.importanceScore); // Sort by descending importance
}

/**
 * Applies sparse attention by selecting the top-N tokens based on importance scores.
 * @param {Array} tokens - Array of token objects with computed importance scores.
 * @param {number} topN - Number of tokens to retain.
 * @returns {Array} - Array of top-N tokens.
 */
export function applySparseAttention(tokens, topN) {
  if (!Array.isArray(tokens)) {
    throw new TypeError('Input must be an array of token objects.');
  }
  if (typeof topN !== 'number' || topN <= 0) {
    throw new RangeError('topN must be a positive integer.');
  }

  return tokens.slice(0, topN); // Select top-N tokens
}

/**
 * Generates a unique hash for a token based on its content.
 * @param {string} token - The token string.
 * @returns {string} - A SHA256 hash of the token.
 */
export function generateTokenHash(token) {
  if (typeof token !== 'string') {
    throw new TypeError('Token must be a string.');
  }

  const hash = createHash('sha256');
  hash.update(token);
  return hash.digest('hex');
}

/**
 * Utility function to normalize semantic weights of tokens to a 0-1 range.
 * @param {Array} tokens - Array of token objects with semanticWeight property.
 * @returns {Array} - Array of tokens with normalized semantic weights.
 */
export function normalizeSemanticWeights(tokens) {
  if (!Array.isArray(tokens)) {
    throw new TypeError('Input must be an array of token objects.');
  }

  const maxWeight = Math.max(...tokens.map(token => token.semanticWeight));
  const minWeight = Math.min(...tokens.map(token => token.semanticWeight));

  return tokens.map(token => ({
    ...token,
    semanticWeight: (token.semanticWeight - minWeight) / (maxWeight - minWeight || 1)
  }));
}

/**
 * Example of how to use the module for sparse attention context management.
 * @param {Array} tokens - Array of raw token objects.
 * @param {number} topN - Number of tokens to retain.
 * @returns {Array} - Array of top-N tokens after processing.
 */
export function manageSparseAttentionContext(tokens, topN) {
  const normalizedTokens = normalizeSemanticWeights(tokens);
  const scoredTokens = computeImportanceScores(normalizedTokens);
  return applySparseAttention(scoredTokens, topN);
}
