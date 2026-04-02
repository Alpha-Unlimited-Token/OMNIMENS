/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextSummarizer
 * Written: 2026-04-02T20:36:21.342Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextSummarizer.mjs

import crypto from 'crypto';

/**
 * Summarizes and compresses conversational context using a transformer-inspired algorithm.
 * Provides utility functions for dialogue compression and context preservation.
 */

/**
 * Tokenizes input text into sentences for processing.
 * @param {string} text - The input text to tokenize.
 * @returns {string[]} - Array of tokenized sentences.
 */
export function tokenizeText(text) {
  return text.match(/[^.!?]+[.!?]?/g) || [];
}

/**
 * Generates a hash-based identifier for a text snippet.
 * @param {string} text - The input text.
 * @returns {string} - A unique hash identifier.
 */
export function generateTextHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Scores sentences based on relevance using a simple heuristic.
 * @param {string[]} sentences - Array of sentences to score.
 * @returns {Object[]} - Array of objects with sentence and score.
 */
export function scoreSentences(sentences) {
  return sentences.map(sentence => {
    const wordCount = sentence.split(' ').length;
    const punctuationCount = (sentence.match(/[.,!?]/g) || []).length;
    const score = wordCount + punctuationCount * 2;
    return { sentence, score };
  });
}

/**
 * Selects top sentences based on their scores to preserve key context.
 * @param {Object[]} scoredSentences - Array of scored sentences.
 * @param {number} compressionRatio - Ratio of sentences to retain (0-1).
 * @returns {string[]} - Array of summarized sentences.
 */
export function selectTopSentences(scoredSentences, compressionRatio = 0.3) {
  const sorted = scoredSentences.sort((a, b) => b.score - a.score);
  const topCount = Math.max(1, Math.floor(sorted.length * compressionRatio));
  return sorted.slice(0, topCount).map(item => item.sentence);
}

/**
 * Summarizes conversational context.
 * @param {string} text - The input text to summarize.
 * @param {number} compressionRatio - Ratio of sentences to retain (0-1).
 * @returns {string} - Summarized text.
 */
export function summarizeContext(text, compressionRatio = 0.3) {
  const sentences = tokenizeText(text);
  const scoredSentences = scoreSentences(sentences);
  const topSentences = selectTopSentences(scoredSentences, compressionRatio);
  return topSentences.join(' ');
}

/**
 * Utility function for multi-agent systems to compress and preserve context.
 * @param {string[]} texts - Array of text inputs from multiple sources.
 * @param {number} compressionRatio - Ratio of sentences to retain (0-1).
 * @returns {Object} - Object mapping text hashes to summarized texts.
 */
export function compressMultipleContexts(texts, compressionRatio = 0.3) {
  const result = {};
  for (const text of texts) {
    const hash = generateTextHash(text);
    result[hash] = summarizeContext(text, compressionRatio);
  }
  return result;
}

/**
 * Example usage:
 * const summary = summarizeContext("This is a long conversation with many details.", 0.5);
 * console.log(summary);
 */