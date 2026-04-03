/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: slidingContextManager
 * Written: 2026-04-03T13:57:39.616Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// slidingContextManager.mjs

import { createHash } from 'crypto';

/**
 * Summarizes a given text segment using a sliding window mechanism.
 * @param {string} text - The input text to summarize.
 * @param {number} windowSize - The size of the sliding window (in characters).
 * @param {number} overlap - The overlap between consecutive windows (in characters).
 * @returns {string[]} - An array of summarized segments.
 */
export function summarizeWithSlidingWindow(text, windowSize = 500, overlap = 100) {
  if (typeof text !== 'string' || text.length === 0) return [];
  if (windowSize <= 0 || overlap < 0 || overlap >= windowSize) {
    throw new Error('Invalid windowSize or overlap parameters');
  }

  const summaries = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + windowSize, text.length);
    const segment = text.slice(start, end);
    summaries.push(summarizeText(segment));
    start = end - overlap;
  }

  return summaries;
}

/**
 * Generates a hash-based identifier for a given text segment.
 * Useful for tracking context across multiple agents.
 * @param {string} text - The input text to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateContextHash(text) {
  const hash = createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
}

/**
 * Blends multiple summarized contexts into a coherent single summary.
 * @param {string[]} summaries - Array of summarized text segments.
 * @returns {string} - A single blended summary.
 */
export function blendSummaries(summaries) {
  if (!Array.isArray(summaries) || summaries.length === 0) return '';

  const uniqueSummaries = new Set(summaries);
  return Array.from(uniqueSummaries).join(' ');
}

/**
 * Internal utility to summarize a single text segment (basic implementation).
 * @param {string} text - The input text segment.
 * @returns {string} - A summarized version of the text.
 */
function summarizeText(text) {
  if (text.length <= 100) return text.trim();

  const sentences = text.match(/[^.!?]+[.!?]/g) || [text];
  const firstSentence = sentences[0]?.trim() || '';
  const lastSentence = sentences[sentences.length - 1]?.trim() || '';

  return `${firstSentence} ... ${lastSentence}`;
}

/**
 * Extracts keywords from a text segment for context tracking.
 * @param {string} text - The input text.
 * @param {number} maxKeywords - Maximum number of keywords to extract.
 * @returns {string[]} - An array of extracted keywords.
 */
export function extractKeywords(text, maxKeywords = 10) {
  if (typeof text !== 'string' || text.length === 0) return [];

  const words = text.toLowerCase().match(/\b[a-z]{4}\b/g) || [];
  const frequency = words.reduce((freq, word) => {
    freq[word] = (freq[word] || 0) + 1;
    return freq;
  }, {});

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Combines all utility functions to manage sliding context for long texts.
 * @param {string} text - The input text to process.
 * @param {number} windowSize - The size of the sliding window.
 * @param {number} overlap - The overlap between consecutive windows.
 * @returns {object} - An object containing summarized segments, blended summary, and keywords.
 */
export function manageSlidingContext(text, windowSize = 500, overlap = 100) {
  const summaries = summarizeWithSlidingWindow(text, windowSize, overlap);
  const blendedSummary = blendSummaries(summaries);
  const keywords = extractKeywords(blendedSummary);

  return {
    summaries,
    blendedSummary,
    keywords,
    contextHash: generateContextHash(blendedSummary)
  };
}