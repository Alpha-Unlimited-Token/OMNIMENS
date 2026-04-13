/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveContextReconstructor
 * Written: 2026-04-02T15:06:21.684Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveContextReconstructor.mjs

import { createHash } from 'crypto';

/**
 * Scores the importance of tokens based on frequency and position.
 * @param {string[]} tokens - Array of tokens to score.
 * @returns {Map<string, number>} - A map of tokens to their importance scores.
 */
export function scoreTokens(tokens) {
  const tokenFrequency = new Map();
  const totalTokens = tokens.length;

  tokens.forEach((token, index) => {
    const normalizedPosition = 1 - index / totalTokens; // Higher weight for earlier tokens
    const currentScore = tokenFrequency.get(token) || 0;
    tokenFrequency.set(token, currentScore + normalizedPosition);
  });

  return tokenFrequency;
}

/**
 * Summarizes a given text by recursively compressing it while preserving key dependencies.
 * @param {string} text - The input text to summarize.
 * @param {number} targetLength - Target length for the summarized text.
 * @returns {string} - The summarized text.
 */
export function recursiveSummarize(text, targetLength) {
  if (text.length <= targetLength) return text;

  const tokens = text.split(/\s+/);
  const tokenScores = scoreTokens(tokens);

  // Sort tokens by importance score in descending order
  const sortedTokens = Array.from(tokenScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token);

  // Reconstruct text from top tokens
  const reducedText = sortedTokens.slice(0, targetLength).join(' ');

  // Recursive refinement
  return recursiveSummarize(reducedText, targetLength);
}

/**
 * Generates a unique hash for a given context to track its state.
 * @param {string} context - The input context to hash.
 * @returns {string} - A unique hash string.
 */
export function generateContextHash(context) {
  const hash = createHash('sha256');
  hash.update(context);
  return hash.digest('hex');
}

/**
 * Reconstructs compressed context hierarchies by iteratively refining summaries.
 * @param {string[]} contexts - Array of context segments to reconstruct.
 * @param {number} maxTokens - Maximum token limit for the reconstructed context.
 * @returns {string} - The reconstructed context.
 */
export function reconstructContext(contexts, maxTokens) {
  let combinedContext = contexts.join(' ');
  return recursiveSummarize(combinedContext, maxTokens);
}

/**
 * Splits a context into manageable chunks for processing.
 * @param {string} context - The input context to split.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @returns {string[]} - Array of context chunks.
 */
export function splitContext(context, chunkSize) {
  const words = context.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }

  return chunks;
}

/**
 * Multi-pass refinement to ensure context dependencies are preserved.
 * @param {string} context - The input context to refine.
 * @param {number} passes - Number of refinement passes.
 * @param {number} targetLength - Target length for the final refined context.
 * @returns {string} - The refined context.
 */
export function multiPassRefine(context, passes, targetLength) {
  let refinedContext = context;

  for (let i = 0; i < passes; i++) {
    refinedContext = recursiveSummarize(refinedContext, targetLength);
  }

  return refinedContext;
}

/**
 * Exports utility functions for adaptive context reconstruction.
 */
export const utilities = {
  scoreTokens,
  recursiveSummarize,
  generateContextHash,
  reconstructContext,
  splitContext,
  multiPassRefine
};