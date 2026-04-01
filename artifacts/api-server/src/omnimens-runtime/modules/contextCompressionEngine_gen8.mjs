/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompressionEngine
 * Written: 2026-04-01T22:02:46.873Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextCompressionEngine.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash-based unique identifier for a given text input.
 * Useful for deduplication or tracking compressed summaries.
 * @param {string} text - The input text to hash.
 * @returns {string} - A unique hash string.
 */
export function generateTextHash(text) {
  const hash = createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
}

/**
 * Compresses a given text input into a summary using hierarchical reasoning.
 * @param {string} text - The input text to compress.
 * @param {number} maxLength - Maximum length of the compressed summary.
 * @returns {string} - A compressed summary of the input text.
 */
export function compressText(text, maxLength) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('Input text must be a non-empty string.');
  }
  if (typeof maxLength !== 'number' || maxLength <= 0) {
    throw new Error('maxLength must be a positive number.');
  }

  // Split text into sentences for hierarchical processing
  const sentences = text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s+/);

  // Step 1: Prioritize sentences by semantic importance (naive scoring by length)
  const rankedSentences = sentences
    .map((sentence) => ({ sentence, score: sentence.length }))
    .sort((a, b) => b.score - a.score);

  // Step 2: Iteratively add sentences until maxLength is reached
  let compressed = '';
  for (const { sentence } of rankedSentences) {
    if ((compressed + sentence).length <= maxLength) {
      compressed += (compressed ? ' ' : '') + sentence;
    } else {
      break;
    }
  }

  return compressed || sentences[0]; // Fallback to the first sentence if no compression possible
}

/**
 * Encodes text into a latent vector representation using a simple token frequency model.
 * @param {string} text - The input text to encode.
 * @returns {Object} - A frequency map of tokens as the latent representation.
 */
export function encodeToLatentRepresentation(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('Input text must be a non-empty string.');
  }

  const tokens = text.toLowerCase().match(/\b\w+\b/g) || [];
  const frequencyMap = {};

  for (const token of tokens) {
    frequencyMap[token] = (frequencyMap[token] || 0) + 1;
  }

  return frequencyMap;
}

/**
 * Utility to combine multiple latent representations into a single one.
 * Useful for merging context from multiple sources.
 * @param {Array<Object>} latentReps - Array of latent representations to merge.
 * @returns {Object} - A merged latent representation.
 */
export function mergeLatentRepresentations(latentReps) {
  if (!Array.isArray(latentReps) || latentReps.length === 0) {
    throw new Error('latentReps must be a non-empty array of objects.');
  }

  const merged = {};
  for (const rep of latentReps) {
    for (const [token, count] of Object.entries(rep)) {
      merged[token] = (merged[token] || 0) + count;
    }
  }

  return merged;
}

/**
 * Summarizes and encodes a large text input into a compressed latent representation.
 * @param {string} text - The input text to process.
 * @param {number} summaryLength - Maximum length of the summary.
 * @returns {Object} - A latent representation of the compressed summary.
 */
export function summarizeAndEncode(text, summaryLength) {
  const summary = compressText(text, summaryLength);
  return encodeToLatentRepresentation(summary);
}
