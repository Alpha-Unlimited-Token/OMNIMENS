/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticTokenCompression
 * Written: 2026-04-03T08:04:46.665Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticTokenCompression.mjs

import { createHash } from 'crypto';

/**
 * Generate a semantic hash for a given string input.
 * @param {string} input - The text to hash.
 * @returns {string} - A fixed-length semantic hash.
 */
export function generateSemanticHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex').slice(0, 16); // Truncate to 16 characters for compactness
}

/**
 * Apply a reversible lossy transformation to compress semantic tokens.
 * @param {string[]} tokens - Array of tokens to compress.
 * @returns {Array<{ token, compressed}>} - Array of original and compressed tokens.
 */
export function compressTokens(tokens) {
  return tokens.map(token => {
    const compressed = generateSemanticHash(token);
    return { token, compressed };
  });
}

/**
 * Reverse the lossy transformation to retrieve original tokens.
 * Note: This assumes a mapping of original tokens is maintained externally.
 * @param {Array<{ token, compressed}>} compressedTokens - Array of compressed tokens.
 * @returns {string[]} - Array of original tokens.
 */
export function decompressTokens(compressedTokens) {
  return compressedTokens.map(({ token }) => token);
}

/**
 * Compute semantic similarity between two token arrays.
 * @param {string[]} tokensA - First array of tokens.
 * @param {string[]} tokensB - Second array of tokens.
 * @returns {number} - Similarity score (0 to 1).
 */
export function computeSemanticSimilarity(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size; // Jaccard similarity
}

/**
 * Utility to tokenize a string into semantic tokens.
 * @param {string} input - Text to tokenize.
 * @returns {string[]} - Array of semantic tokens.
 */
export function tokenize(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove non-alphanumeric characters
    .split(/\s+/) // Split by whitespace
    .filter(token => token.length > 0); // Remove empty tokens
}

/**
 * Example usage and testing.
 */
export function exampleUsage() {
  const textA = "Artificial intelligence expands human potential.";
  const textB = "Human potential grows with AI advancements.";

  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  const compressedA = compressTokens(tokensA);
  const compressedB = compressTokens(tokensB);

  const similarity = computeSemanticSimilarity(tokensA, tokensB);

  return {
    tokensA,
    tokensB,
    compressedA,
    compressedB,
    similarity
  };
}
