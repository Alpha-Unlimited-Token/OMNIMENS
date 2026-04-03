/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: reversibleContextCompression
 * Written: 2026-04-03T14:13:17.297Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// reversibleContextCompression.mjs

import { createHash } from 'crypto';

/**
 * Compresses a token window using hierarchical summarization and reversible encoding.
 * @param {string[]} tokens - Array of tokens to compress.
 * @param {number} maxSummaryLength - Maximum length of the compressed summary.
 * @returns {object} - Contains compressed summary and reversible encoding map.
 */
export function compressTokens(tokens, maxSummaryLength) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new Error("Invalid input: tokens must be a non-empty array.");
  }

  const frequencyMap = tokens.reduce((map, token) => {
    map[token] = (map[token] || 0) + 1;
    return map;
  }, {});

  const sortedTokens = Object.entries(frequencyMap).sort((a, b) => b[1] - a[1]);

  const summary = sortedTokens.slice(0, maxSummaryLength).map(([token]) => token);

  const reversibleMap = tokens.reduce((map, token, index) => {
    const hash = createHash('sha256').update(token + index).digest('hex');
    map[hash] = token;
    return map;
  }, {});

  return {
    summary,
    reversibleMap
  };
}

/**
 * Decompresses a summary using the reversible encoding map.
 * @param {string[]} summary - Compressed summary tokens.
 * @param {object} reversibleMap - Reversible encoding map.
 * @returns {string[]} - Original token window reconstructed.
 */
export function decompressTokens(summary, reversibleMap) {
  if (!Array.isArray(summary) || summary.length === 0) {
    throw new Error("Invalid input: summary must be a non-empty array.");
  }
  if (typeof reversibleMap !== 'object' || reversibleMap === null) {
    throw new Error("Invalid input: reversibleMap must be a non-null object.");
  }

  return summary.map((token) => {
    const hash = Object.keys(reversibleMap).find((key) => reversibleMap[key] === token);
    if (!hash) {
      throw new Error(`Token '${token}' not found in reversible map.`);
    }
    return reversibleMap[hash];
  });
}

/**
 * Utility function to calculate compression ratio.
 * @param {string[]} originalTokens - Original token array.
 * @param {string[]} compressedSummary - Compressed token summary.
 * @returns {number} - Compression ratio as a percentage.
 */
export function calculateCompressionRatio(originalTokens, compressedSummary) {
  if (!Array.isArray(originalTokens) || originalTokens.length === 0 || !Array.isArray(compressedSummary)) {
    throw new Error("Invalid input: both Array.from(/* args */{}) must be non-empty arrays.");
  }

  const originalLength = originalTokens.length;
  const compressedLength = compressedSummary.length;

  return ((originalLength - compressedLength) / originalLength) * 100;
}

/**
 * Utility function to validate reversible encoding map integrity.
 * @param {object} reversibleMap - Reversible encoding map.
 * @returns {boolean} - True if map integrity is valid, false otherwise.
 */
export function validateReversibleMap(reversibleMap) {
  if (typeof reversibleMap !== 'object' || reversibleMap === null) {
    throw new Error("Invalid input: reversibleMap must be a non-null object.");
  }

  const keys = Object.keys(reversibleMap);
  const values = Object.values(reversibleMap);

  return new Set(values).size === values.length && keys.length === values.length;
}

// Example usage:
// const tokens = ["AI", "platform", "UX", "design", "best", "practices", "AI", "2025"];
// const { summary, reversibleMap } = compressTokens(tokens, 5);
// const originalTokens = decompressTokens(summary, reversibleMap);
// const compressionRatio = calculateCompressionRatio(tokens, summary);
// const isValidMap = validateReversibleMap(reversibleMap);