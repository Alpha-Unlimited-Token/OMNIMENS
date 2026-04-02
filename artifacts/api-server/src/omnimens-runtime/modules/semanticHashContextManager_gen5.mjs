/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticHashContextManager
 * Written: 2026-04-02T21:23:43.318Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticHashContextManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a semantic hash for a given input string.
 * @param {string} input - The input string to hash.
 * @returns {string} - A compact semantic hash of the input.
 */
export function generateSemanticHash(input) {
  const normalizedInput = input.trim().toLowerCase();
  const hash = createHash('sha256');
  hash.update(normalizedInput);
  return hash.digest('hex').slice(0, 16); // Compact representation
}

/**
 * Scores the importance of a given input based on its semantic richness.
 * @param {string} input - The input string to score.
 * @returns {number} - A score between 0 and 1 indicating importance.
 */
export function scoreImportance(input) {
  const length = input.length;
  const uniqueChars = new Set(input).size;
  const richness = uniqueChars / length;
  return Math.min(1, richness); // Normalize score to [0, 1]
}

/**
 * Compresses context by retaining semantically rich and high-utility segments.
 * @param {Array<string>} contextArray - Array of context strings.
 * @param {number} threshold - Minimum importance score to retain a segment.
 * @returns {Array<{hash, content}>} - Array of retained segments with hashes.
 */
export function compressContext(contextArray, threshold = 0.5) {
  return contextArray
    .map(content => ({
      content,
      score: scoreImportance(content),
      hash: generateSemanticHash(content)
    }))
    .filter(segment => segment.score >= threshold)
    .map(({ hash, content }) => ({ hash, content }));
}

/**
 * Utility function to extract and compress context from search results.
 * @param {Array<{source, content}>} searchResults - Array of search result objects.
 * @param {number} threshold - Minimum importance score to retain a segment.
 * @returns {Array<{hash, content}>} - Array of retained segments with hashes.
 */
export function processSearchResults(searchResults, threshold = 0.5) {
  const contextArray = searchResults.map(result => result.content);
  return compressContext(contextArray, threshold);
}

/**
 * Generic utility to hash and score any input data.
 * @param {Array<string>} inputArray - Array of strings to process.
 * @param {number} threshold - Minimum importance score to retain a segment.
 * @returns {Array<{hash, content}>} - Array of retained segments with hashes.
 */
export function processGenericData(inputArray, threshold = 0.5) {
  return compressContext(inputArray, threshold);
}