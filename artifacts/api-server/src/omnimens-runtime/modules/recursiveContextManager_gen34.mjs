/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveContextManager
 * Written: 2026-04-02T13:32:04.936Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// recursiveContextManager.mjs

import crypto from 'crypto';

/**
 * Generates a unique hash for a given context string.
 * @param {string} context - The context string to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateContextHash(context) {
  return crypto.createHash('sha256').update(context).digest('hex');
}

/**
 * Summarizes a given text context by extracting important sentences based on keyword density.
 * @param {string} context - The text to summarize.
 * @param {number} maxSentences - Maximum number of sentences to include in the summary.
 * @returns {string} - The summarized text.
 */
export function summarizeContext(context, maxSentences = 5) {
  const sentences = context.split('.');
  const keywordScores = new Map();

  // Calculate keyword density
  for (const sentence of sentences) {
    const words = sentence.split(/\s+/);
    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanWord.length > 3) {
        keywordScores.set(
          cleanWord,
          (keywordScores.get(cleanWord) || 0) + 1
        );
      }
    }
  }

  // Score sentences by keyword density
  const sentenceScores = sentences.map((sentence) => {
    const words = sentence.split(/\s+/);
    let score = 0;
    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      score += keywordScores.get(cleanWord) || 0;
    }
    return { sentence, score };
  });

  // Sort sentences by score and return the top ones
  const topSentences = sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .map((entry) => entry.sentence.trim());

  return topSentences.join('. ');
}

/**
 * Creates a hierarchical memory checkpoint system for managing large contexts.
 * @param {Array<string>} contexts - Array of context strings to process.
 * @param {number} maxLayers - Maximum number of memory layers to retain.
 * @returns {Array<{layer, summary, hash}>} - Memory layers with summaries and hashes.
 */
export function createMemoryLayers(contexts, maxLayers = 3) {
  const layers = [];

  for (let i = 0; i < contexts.length; i++) {
    const context = contexts[i];
    const summary = summarizeContext(context);
    const hash = generateContextHash(context);

    layers.push({
      layer: i + 1,
      summary,
      hash
    });

    // Prune layers if exceeding maxLayers
    if (layers.length > maxLayers) {
      layers.shift(); // Remove the oldest layer
    }
  }

  return layers;
}

/**
 * Dynamically prunes irrelevant contexts based on similarity thresholds.
 * @param {Array<string>} contexts - Array of context strings to evaluate.
 * @param {number} similarityThreshold - Threshold (0 to 1) for pruning similar contexts.
 * @returns {Array<string>} - Filtered contexts.
 */
export function pruneContexts(contexts, similarityThreshold = 0.8) {
  const uniqueContexts = [];

  for (const context of contexts) {
    const isSimilar = uniqueContexts.some((existingContext) => {
      const hash1 = generateContextHash(context);
      const hash2 = generateContextHash(existingContext);
      return calculateHashSimilarity(hash1, hash2) >= similarityThreshold;
    });

    if (!isSimilar) {
      uniqueContexts.push(context);
    }
  }

  return uniqueContexts;
}

/**
 * Calculates similarity between two hashes using Hamming distance.
 * @param {string} hash1 - First hash string.
 * @param {string} hash2 - Second hash string.
 * @returns {number} - Similarity score (0 to 1).
 */
export function calculateHashSimilarity(hash1, hash2) {
  let matches = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) matches++;
  }
  return matches / hash1.length;
}
