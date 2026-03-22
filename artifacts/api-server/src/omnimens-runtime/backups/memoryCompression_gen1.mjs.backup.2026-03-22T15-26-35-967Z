/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: memoryCompression
 * Written: 2026-03-21T20:12:58.972Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// memoryCompression.js

/**
 * @module memoryCompression
 * @description A utility module for summarizing and encoding long-term conversation context using token-based summarization and embedding compression.
 */

/**
 * Compresses a long-form text into a summarized representation using token frequency analysis and embedding techniques.
 * @param {string} text - The input text to compress.
 * @param {number} maxTokens - The maximum number of tokens to retain in the summary.
 * @returns {Object} A compressed memory object containing the summary and token embeddings.
 */
export function compressMemory(text, maxTokens = 50) {
  if (typeof text !== 'string' || text.length === 0) {
    throw new Error('Input text must be a non-empty string.');
  }
  if (typeof maxTokens !== 'number' || maxTokens <= 0) {
    throw new Error('maxTokens must be a positive number.');
  }

  const tokenFrequency = {};
  const tokens = text.split(/\s+/);

  // Token frequency analysis
  tokens.forEach(token => {
    const normalizedToken = token.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedToken) {
      tokenFrequency[normalizedToken] = (tokenFrequency[normalizedToken] || 0) + 1;
    }
  });

  // Sort tokens by frequency and truncate
  const sortedTokens = Object.entries(tokenFrequency)
    .sort(([, freqA], [, freqB]) => freqB - freqA)
    .slice(0, maxTokens)
    .map(([token]) => token);

  // Generate embeddings (simple hash-based encoding for demonstration)
  const embeddings = sortedTokens.map(token => hashToken(token));

  return {
    summary: sortedTokens.join(' '),
    embeddings
  };
}

/**
 * Generates a hash-based embedding for a token.
 * @param {string} token - The token to hash.
 * @returns {string} A hexadecimal string representing the token embedding.
 */
function hashToken(token) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Expands a compressed memory object back into its original context approximation.
 * @param {Object} compressedMemory - The compressed memory object.
 * @returns {string} The expanded context approximation.
 */
export function expandMemory(compressedMemory) {
  if (!compressedMemory || typeof compressedMemory !== 'object') {
    throw new Error('Compressed memory must be a valid object.');
  }
  const { summary } = compressedMemory;
  if (typeof summary !== 'string') {
    throw new Error('Compressed memory must contain a valid summary string.');
  }

  // For demonstration, expansion is simply returning the summary
  return summary;
}

/**
 * Merges two compressed memory objects into a unified representation.
 * @param {Object} memoryA - The first compressed memory object.
 * @param {Object} memoryB - The second compressed memory object.
 * @param {number} maxTokens - The maximum number of tokens for the merged summary.
 * @returns {Object} A new compressed memory object combining both inputs.
 */
export function mergeMemories(memoryA, memoryB, maxTokens = 50) {
  if (!memoryA || !memoryB || typeof memoryA !== 'object' || typeof memoryB !== 'object') {
    throw new Error('Both inputs must be valid compressed memory objects.');
  }
  const combinedSummary = `${memoryA.summary} ${memoryB.summary}`;
  return compressMemory(combinedSummary, maxTokens);
}

/**
 * Validates a compressed memory object.
 * @param {Object} compressedMemory - The compressed memory object to validate.
 * @returns {boolean} True if the object is valid, false otherwise.
 */
export function validateMemory(compressedMemory) {
  if (!compressedMemory || typeof compressedMemory !== 'object') {
    return false;
  }
  const { summary, embeddings } = compressedMemory;
  return typeof summary === 'string' && Array.isArray(embeddings) && embeddings.every(e => typeof e === 'string');
}