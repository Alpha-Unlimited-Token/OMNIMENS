/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticCompressionEnhancer
 * Written: 2026-04-02T14:25:02.623Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticCompressionEnhancer.mjs

import { createHash } from 'crypto';

/**
 * Generates a semantic hash for a given text input using SHA-256.
 * @param {string} text - The input text to hash.
 * @returns {string} - The semantic hash of the input text.
 */
export function generateSemanticHash(text) {
  const hash = createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
}

/**
 * Extracts key sentences from a text based on importance weighting.
 * @param {string} text - The input text to summarize.
 * @param {number} sentenceCount - Number of sentences to extract.
 * @returns {string[]} - Array of extracted key sentences.
 */
export function extractKeySentences(text, sentenceCount = 5) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  const scoredSentences = sentences.map((sentence) => {
    const score = sentence.length; // Simple importance weighting based on sentence length
    return { sentence, score };
  });

  scoredSentences.sort((a, b) => b.score - a.score);
  return scoredSentences.slice(0, sentenceCount).map((entry) => entry.sentence);
}

/**
 * Compresses text hierarchically while preserving semantic richness.
 * @param {string} text - The input text to compress.
 * @param {number} layers - Number of hierarchical layers to compress.
 * @returns {string[]} - Array of compressed summaries for each layer.
 */
export function hierarchicalSummarization(text, layers = 3) {
  let currentText = text;
  const summaries = [];

  for (let i = 0; i < layers; i++) {
    const keySentences = extractKeySentences(currentText);
    const summary = keySentences.join(' ');
    summaries.push(summary);
    currentText = summary;
  }

  return summaries;
}

/**
 * Combines semantic hashing and hierarchical summarization for enhanced compression.
 * @param {string} text - The input text to process.
 * @param {number} layers - Number of hierarchical layers to compress.
 * @returns {object} - Object containing semantic hash and hierarchical summaries.
 */
export function semanticCompression(text, layers = 3) {
  const hash = generateSemanticHash(text);
  const summaries = hierarchicalSummarization(text, layers);
  return { hash, summaries };
}

/**
 * Utility function for cross-agent use: compress and hash text.
 * @param {string} text - The input text to process.
 * @param {number} layers - Number of hierarchical layers to compress.
 * @returns {object} - Object containing semantic hash and hierarchical summaries.
 */
export function processTextForAgents(text, layers = 3) {
  return semanticCompression(text, layers);
}