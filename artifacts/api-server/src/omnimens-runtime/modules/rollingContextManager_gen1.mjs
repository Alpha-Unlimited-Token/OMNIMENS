/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: rollingContextManager
 * Written: 2026-04-01T22:16:17.280Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// rollingContextManager.mjs

import { createHash } from 'crypto';

/**
 * Summarizes and compresses text context while retaining essential information.
 * Useful for managing long conversations or large text data.
 */

/**
 * Generates a hash for a given string to ensure uniqueness and quick lookups.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Extracts key sentences from a block of text using a basic TextRank-inspired algorithm.
 * @param {string} text - The input text to summarize.
 * @param {number} sentenceCount - Number of key sentences to extract.
 * @returns {string[]} - An array of key sentences.
 */
export function extractKeySentences(text, sentenceCount = 3) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  const sentenceScores = new Map();

  // Basic scoring: sentence length and word uniqueness
  const wordFrequencies = new Map();
  sentences.forEach((sentence) => {
    const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    words.forEach((word) => {
      wordFrequencies.set(word, (wordFrequencies.get(word) || 0) + 1);
    });
  });

  sentences.forEach((sentence) => {
    const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    const score = words.reduce((sum, word) => sum + (1 / wordFrequencies.get(word)), 0);
    sentenceScores.set(sentence, score);
  });

  return Array.from(sentenceScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, sentenceCount)
    .map(([sentence]) => sentence.trim());
}

/**
 * Compresses older context by summarizing and retaining essential details.
 * @param {string[]} context - An array of text blocks representing conversation history.
 * @param {number} maxTokens - Maximum number of tokens to retain.
 * @returns {string} - A compressed summary of the context.
 */
export function compressContext(context, maxTokens = 500) {
  let compressed = '';

  for (const block of context) {
    const summary = extractKeySentences(block).join(' ');
    compressed += summary + ' ';

    if (compressed.split(/\s+/).length > maxTokens) {
      compressed = compressed.split(/\s+/).slice(0, maxTokens).join(' ');
      break;
    }
  }

  return compressed.trim();
}

/**
 * Attention-based scoring to prioritize important context elements.
 * @param {string[]} context - An array of text blocks.
 * @param {string} query - The current query or focus.
 * @returns {string[]} - Reordered context based on relevance.
 */
export function prioritizeContext(context, query) {
  const queryWords = new Set(query.toLowerCase().match(/\b\w+\b/g) || []);

  return context
    .map((block) => {
      const blockWords = block.toLowerCase().match(/\b\w+\b/g) || [];
      const relevance = blockWords.reduce((score, word) => score + (queryWords.has(word) ? 1 : 0), 0);
      return { block, relevance };
    })
    .sort((a, b) => b.relevance - a.relevance)
    .map(({ block }) => block);
}

/**
 * Manages rolling context by summarizing, compressing, and prioritizing text data.
 * @param {string[]} context - An array of text blocks representing conversation history.
 * @param {string} query - The current query or focus.
 * @param {number} maxTokens - Maximum number of tokens to retain.
 * @returns {string} - A managed and compressed context.
 */
export function manageRollingContext(context, query, maxTokens = 500) {
  const prioritizedContext = prioritizeContext(context, query);
  return compressContext(prioritizedContext, maxTokens);
}
