/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextualNuancePreserver
 * Written: 2026-04-03T06:07:47.328Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextualNuancePreserver.mjs

import crypto from 'crypto';

/**
 * Generates a unique hash for a given input string to track compressed contexts.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateContextHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Hierarchically compresses a token window while preserving nuanced details.
 * @param {Array<string>} tokens - Array of tokens to compress.
 * @param {number} maxTokens - Maximum number of tokens allowed in the compressed output.
 * @returns {Array<string>} - Compressed token array with preserved nuances.
 */
export function compressWithNuance(tokens, maxTokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) return [];
  if (maxTokens <= 0) return [];

  const tokenImportance = tokens.map((token, index) => ({
    token,
    importance: calculateTokenImportance(token, index, tokens)
  }));

  tokenImportance.sort((a, b) => b.importance - a.importance);

  const compressedTokens = tokenImportance.slice(0, maxTokens).sort((a, b) => tokens.indexOf(a.token) - tokens.indexOf(b.token));

  return compressedTokens.map(item => item.token);
}

/**
 * Calculates the importance of a token based on its context.
 * @param {string} token - The token to evaluate.
 * @param {number} index - The index of the token in the array.
 * @param {Array<string>} tokens - The complete token array.
 * @returns {number} - A numeric importance score for the token.
 */
export function calculateTokenImportance(token, index, tokens) {
  const contextWindow = 5; // Number of tokens to consider around the current token.
  const start = Math.max(0, index - contextWindow);
  const end = Math.min(tokens.length, index + contextWindow + 1);
  const contextTokens = tokens.slice(start, end);

  const uniqueChars = new Set(token).size;
  const contextDiversity = new Set(contextTokens).size;

  return uniqueChars * Math.log(contextDiversity + 1); // Importance based on token uniqueness and context diversity.
}

/**
 * Reconstructs a compressed context back into a more detailed representation.
 * @param {Array<string>} compressedTokens - Array of compressed tokens.
 * @param {Array<string>} originalTokens - Original token array for reference.
 * @returns {Array<string>} - Reconstructed token array.
 */
export function reconstructContext(compressedTokens, originalTokens) {
  if (!Array.isArray(compressedTokens) || compressedTokens.length === 0) return [];
  if (!Array.isArray(originalTokens) || originalTokens.length === 0) return compressedTokens;

  const reconstructed = new Set(compressedTokens);

  for (const token of originalTokens) {
    if (!reconstructed.has(token) && reconstructed.size < compressedTokens.length * 2) {
      reconstructed.add(token);
    }
  }

  return Array.from(reconstructed).sort((a, b) => originalTokens.indexOf(a) - originalTokens.indexOf(b));
}

/**
 * Splits a large token array into hierarchical chunks for better processing.
 * @param {Array<string>} tokens - Array of tokens to split.
 * @param {number} chunkSize - Size of each chunk.
 * @returns {Array<Array<string>>} - Array of token chunks.
 */
export function splitIntoChunks(tokens, chunkSize) {
  if (!Array.isArray(tokens) || tokens.length === 0) return [];
  if (chunkSize <= 0) return [];

  const chunks = [];
  for (let i = 0; i < tokens.length; i += chunkSize) {
    chunks.push(tokens.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Merges hierarchical chunks back into a single token array.
 * @param {Array<Array<string>>} chunks - Array of token chunks to merge.
 * @returns {Array<string>} - Merged token array.
 */
export function mergeChunks(chunks) {
  if (!Array.isArray(chunks) || chunks.length === 0) return [];

  return chunks.flat();
}
