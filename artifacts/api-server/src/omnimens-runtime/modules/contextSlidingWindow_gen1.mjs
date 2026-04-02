/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextSlidingWindow
 * Written: 2026-04-02T22:07:56.222Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextSlidingWindow.mjs

// Utility to manage conversational coherence using a sliding window mechanism
// with overlapping token segments and summarization.

/**
 * Splits text into overlapping segments based on a sliding window approach.
 * @param {string} text - The input text to segment.
 * @param {number} windowSize - The size of each window (number of tokens/words).
 * @param {number} overlapSize - The size of the overlap between consecutive windows.
 * @returns {Array<string>} - Array of overlapping text segments.
 */
export function createSlidingWindows(text, windowSize, overlapSize) {
  if (typeof text !== 'string' || windowSize <= 0 || overlapSize < 0) {
    throw new Error('Invalid input: text must be a string, windowSize > 0, and overlapSize >= 0.');
  }

  const words = text.split(/\s+/); // Split text into words/tokens
  const segments = [];

  for (let i = 0; i < words.length; i += windowSize - overlapSize) {
    const segment = words.slice(i, i + windowSize).join(' ');
    segments.push(segment);

    if (i + windowSize >= words.length) break; // Stop if end of text is reached
  }

  return segments;
}

/**
 * Summarizes a segment of text using a simple heuristic (e.g., first N words).
 * @param {string} segment - The text segment to summarize.
 * @param {number} summaryLength - Number of words to include in the summary.
 * @returns {string} - The summarized text.
 */
export function summarizeSegment(segment, summaryLength) {
  if (typeof segment !== 'string' || summaryLength <= 0) {
    throw new Error('Invalid input: segment must be a string and summaryLength > 0.');
  }

  const words = segment.split(/\s+/);
  return words.slice(0, summaryLength).join(' ') + (words.length > summaryLength ? '...' : '');
}

/**
 * Maintains conversational coherence by managing a sliding window of context.
 * @param {string} text - The full conversation or document text.
 * @param {number} windowSize - The size of each window (number of tokens/words).
 * @param {number} overlapSize - The size of the overlap between consecutive windows.
 * @param {number} summaryLength - Number of words to include in summaries of prior segments.
 * @returns {Array<{segment, summary}>} - Array of objects with segments and their summaries.
 */
export function manageContextSlidingWindow(text, windowSize, overlapSize, summaryLength) {
  const segments = createSlidingWindows(text, windowSize, overlapSize);
  const result = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const summary = summarizeSegment(segment, summaryLength);
    result.push({ segment, summary });
  }

  return result;
}

/**
 * Combines summaries into a single coherent summary for prior context.
 * @param {Array<string>} summaries - Array of summaries from prior segments.
 * @returns {string} - A combined summary of prior context.
 */
export function combineSummaries(summaries) {
  if (!Array.isArray(summaries) || summaries.some(s => typeof s !== 'string')) {
    throw new Error('Invalid input: summaries must be an array of strings.');
  }

  return summaries.join(' ').trim();
}

/**
 * Utility to tokenize a string into words for advanced processing.
 * @param {string} text - The text to tokenize.
 * @returns {Array<string>} - Array of tokens/words.
 */
export function tokenize(text) {
  if (typeof text !== 'string') {
    throw new Error('Invalid input: text must be a string.');
  }

  return text.split(/\s+/);
}

/**
 * Utility to count the number of tokens/words in a string.
 * @param {string} text - The text to count tokens in.
 * @returns {number} - The number of tokens/words.
 */
export function countTokens(text) {
  return tokenize(text).length;
}