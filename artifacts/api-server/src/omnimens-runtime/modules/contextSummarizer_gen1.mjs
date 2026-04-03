/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextSummarizer
 * Written: 2026-04-03T04:58:54.296Z
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
 * Compiled targets: javascript: OK (1 IR steps) | python: OK (1 IR steps) | c: OK (1 IR steps) | x86_64: OK (1 IR steps) | arm64: OK (1 IR steps) | avr: OK (1 IR steps)
 * Translation map version: 22
 */
// contextSummarizer.mjs

import { createHash } from 'crypto';

/**
 * Extracts key phrases from text using a simple attention-based algorithm.
 * @param {string} text - The input text to analyze.
 * @param {number} [maxPhrases=5] - Maximum number of key phrases to extract.
 * @returns {string[]} - Array of key phrases.
 */
export function extractKeyPhrases(text, maxPhrases = 5) {
  const words = text.split(/\s+/);
  const wordFrequency = {};

  // Calculate word frequency
  for (const word of words) {
    const normalizedWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedWord) {
      wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
    }
  }

  // Sort words by frequency and importance
  const sortedWords = Object.entries(wordFrequency)
    .sort(([, freqA], [, freqB]) => freqB - freqA)
    .map(([word]) => word);

  return sortedWords.slice(0, maxPhrases);
}

/**
 * Summarizes text by distilling key ideas into a compressed format.
 * @param {string} text - The input text to summarize.
 * @param {number} [maxLength=200] - Maximum length of the summary.
 * @returns {string} - Summarized text.
 */
export function summarizeText(text, maxLength = 200) {
  const keyPhrases = extractKeyPhrases(text, 10);
  const summary = keyPhrases.join(', ');

  return summary.length > maxLength ? summary.slice(0, maxLength) + '...' : summary;
}

/**
 * Compresses earlier conversation context into a distilled summary.
 * @param {Array<{text, timestamp}>} context - Array of conversation snippets.
 * @param {number} [maxLength=500] - Maximum length of the compressed context.
 * @returns {string} - Compressed conversation context.
 */
export function compressContext(context, maxLength = 500) {
  const combinedText = context
    .sort((a, b) => a.timestamp - b.timestamp) // Sort by timestamp
    .map(item => item.text)
    .join(' ');

  return summarizeText(combinedText, maxLength);
}

/**
 * Generates a hash for a given text input to ensure unique identification.
 * @param {string} text - The input text to hash.
 * @returns {string} - SHA-256 hash of the input text.
 */
export function generateTextHash(text) {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * Utility function to normalize text by removing special characters and extra spaces.
 * @param {string} text - The input text to normalize.
 * @returns {string} - Normalized text.
 */
export function normalizeText(text) {
  return text.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}
