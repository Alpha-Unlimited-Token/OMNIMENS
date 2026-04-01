/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextWindowManager
 * Written: 2026-04-01T22:21:43.447Z
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
 * Compiled targets: javascript: OK (4 IR steps) | python: OK (4 IR steps) | c: OK (4 IR steps) | x86_64: OK (4 IR steps) | arm64: OK (4 IR steps) | avr: OK (4 IR steps)
 * Translation map version: 22
 */
// contextWindowManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a string to uniquely identify context segments.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input string.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Extracts key phrases from text using a simple frequency-based attention mechanism.
 * @param {string} text - The input text.
 * @param {number} threshold - Minimum frequency for a word to be considered a key phrase.
 * @returns {Array<string>} - Array of key phrases.
 */
export function extractKeyPhrases(text, threshold = 2) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const frequencyMap = new Map();

  for (const word of words) {
    frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
  }

  return Array.from(frequencyMap.entries())
    .filter(([_, freq]) => freq >= threshold)
    .map(([word]) => word);
}

/**
 * Summarizes a text by extracting key phrases and limiting output length.
 * @param {string} text - The input text to summarize.
 * @param {number} maxLength - Maximum length of the summary.
 * @returns {string} - A summarized version of the text.
 */
export function summarizeText(text, maxLength = 200) {
  const keyPhrases = extractKeyPhrases(text);
  const summary = keyPhrases.join(', ');
  return summary.length > maxLength ? summary.slice(0, maxLength - 3) + '...' : summary;
}

/**
 * Manages context using a sliding window and hierarchical summarization.
 * @param {Array<string>} conversation - Array of conversation segments.
 * @param {number} windowSize - Number of segments to include in the sliding window.
 * @returns {Array<{hash, summary}>} - Array of summarized context segments with hashes.
 */
export function manageContextWindow(conversation, windowSize = 5) {
  const contextSummaries = [];

  for (let i = 0; i < conversation.length; i++) {
    const windowStart = Math.max(0, i - windowSize + 1);
    const windowEnd = i + 1;
    const windowSegments = conversation.slice(windowStart, windowEnd);
    const concatenatedWindow = windowSegments.join(' ');
    const summary = summarizeText(concatenatedWindow);
    const hash = generateHash(concatenatedWindow);

    contextSummaries.push({ hash, summary });
  }

  return contextSummaries;
}

/**
 * Utility to merge multiple context summaries into a hierarchical summary.
 * @param {Array<string>} summaries - Array of summarized strings.
 * @returns {string} - A single hierarchical summary.
 */
export function mergeSummaries(summaries) {
  const concatenatedSummaries = summaries.join(' ');
  return summarizeText(concatenatedSummaries);
}

/**
 * Validates input data for conversation context.
 * @param {Array<string>} conversation - Array of conversation segments.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateConversation(conversation) {
  return Array.isArray(conversation) && conversation.every(segment => typeof segment === 'string');
}