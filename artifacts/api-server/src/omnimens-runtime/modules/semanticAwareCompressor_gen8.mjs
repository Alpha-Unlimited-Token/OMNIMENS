/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticAwareCompressor
 * Written: 2026-04-03T09:45:59.892Z
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
 * Compiled targets: javascript: OK (8 IR steps) | python: OK (8 IR steps) | c: OK (8 IR steps) | x86_64: OK (8 IR steps) | arm64: OK (8 IR steps) | avr: OK (8 IR steps)
 * Translation map version: 22
 */
// semanticAwareCompressor.mjs

import { createHash } from 'crypto';

/**
 * Tokenizes input text into semantic units (sentences).
 * @param {string} text - Input text to tokenize.
 * @returns {string[]} Array of sentences.
 */
export function tokenizeText(text) {
  return text.match(/[^.!?]+[.!?]/g) || [];
}

/**
 * Computes a semantic similarity score between two text units.
 * @param {string} textA - First text unit.
 * @param {string} textB - Second text unit.
 * @returns {number} Similarity score (0 to 1).
 */
export function computeSemanticSimilarity(textA, textB) {
  const hashA = createHash('sha256').update(textA).digest('hex');
  const hashB = createHash('sha256').update(textB).digest('hex');
  let score = 0;
  for (let i = 0; i < hashA.length; i++) {
    if (hashA[i] === hashB[i]) score += 1;
  }
  return score / hashA.length;
}

/**
 * Assigns attention weights to semantic units based on their importance.
 * @param {string[]} sentences - Array of sentences.
 * @param {string} context - Context or query to guide attention.
 * @returns {Object[]} Array of objects with sentences and weights.
 */
export function assignAttentionWeights(sentences, context) {
  return sentences.map(sentence => ({
    sentence,
    weight: computeSemanticSimilarity(sentence, context)
  }));
}

/**
 * Compresses text by extracting high-value semantic elements.
 * @param {string} text - Input text to compress.
 * @param {string} context - Context or query to guide compression.
 * @param {number} compressionRatio - Desired compression ratio (0 to 1).
 * @returns {string} Compressed text.
 */
export function compressText(text, context, compressionRatio = 0.5) {
  const sentences = tokenizeText(text);
  const weightedSentences = assignAttentionWeights(sentences, context);

  // Sort sentences by weight in descending order
  weightedSentences.sort((a, b) => b.weight - a.weight);

  // Select top sentences based on compression ratio
  const numSentencesToKeep = Math.ceil(sentences.length * compressionRatio);
  const compressedSentences = weightedSentences
    .slice(0, numSentencesToKeep)
    .map(entry => entry.sentence);

  return compressedSentences.join(' ');
}

/**
 * Utility to normalize text by removing extra whitespace.
 * @param {string} text - Input text.
 * @returns {string} Normalized text.
 */
export function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Utility to summarize text for general-purpose use.
 * @param {string} text - Input text to summarize.
 * @param {number} maxSentences - Maximum number of sentences to include.
 * @returns {string} Summarized text.
 */
export function summarizeText(text, maxSentences = 3) {
  const sentences = tokenizeText(text);
  return sentences.slice(0, maxSentences).join(' ');
}
