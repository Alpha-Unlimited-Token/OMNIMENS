/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextPersistenceHandler
 * Written: 2026-04-02T15:04:00.200Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextPersistenceHandler.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given string to uniquely identify context segments.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Summarizes a given text segment using a simple heuristic (word frequency-based).
 * @param {string} text - The text to summarize.
 * @param {number} maxWords - Maximum number of words in the summary.
 * @returns {string} - A summarized version of the text.
 */
export function summarizeText(text, maxWords = 50) {
  const wordFrequency = {};
  const words = text.split(/\s+/);

  words.forEach(word => {
    const sanitizedWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (sanitizedWord) {
      wordFrequency[sanitizedWord] = (wordFrequency[sanitizedWord] || 0) + 1;
    }
  });

  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxWords)
    .map(([word]) => word);

  return sortedWords.join(' ');
}

/**
 * Embeds context segments into a sliding window with overlap.
 * @param {Array<string>} segments - Array of context segments.
 * @param {number} windowSize - Number of segments in each window.
 * @param {number} overlap - Number of overlapping segments between windows.
 * @returns {Array<Array<string>>} - Array of context windows.
 */
export function createSlidingWindows(segments, windowSize = 5, overlap = 2) {
  const windows = [];

  for (let i = 0; i < segments.length; i += windowSize - overlap) {
    const window = segments.slice(i, i + windowSize);
    windows.push(window);
  }

  return windows;
}

/**
 * Dynamically reinserts summarized context into active conversation.
 * @param {Array<string>} pastSegments - Array of past context segments.
 * @param {string} currentSegment - Current segment of conversation.
 * @param {number} maxSummaryWords - Maximum words in the summary.
 * @returns {string} - Combined context including summarized past segments.
 */
export function reintegrateContext(pastSegments, currentSegment, maxSummaryWords = 50) {
  const summarizedPast = pastSegments.map(segment => summarizeText(segment, maxSummaryWords));
  return summarizedPast.join(' ') + ' ' + currentSegment;
}

/**
 * Maintains conversation context by updating the sliding window and embedding summaries.
 * @param {Array<string>} contextHistory - Array of all past conversation segments.
 * @param {string} newSegment - New segment to add to the context.
 * @param {number} windowSize - Sliding window size.
 * @param {number} overlap - Overlap size.
 * @param {number} maxSummaryWords - Maximum words in summaries.
 * @returns {Array<string>} - Updated context history.
 */
export function updateContextHistory(contextHistory, newSegment, windowSize = 5, overlap = 2, maxSummaryWords = 50) {
  const updatedHistory = [...contextHistory, newSegment];
  const windows = createSlidingWindows(updatedHistory, windowSize, overlap);

  return windows.map(window => {
    const summarizedWindow = window.map(segment => summarizeText(segment, maxSummaryWords));
    return summarizedWindow.join(' ');
  });
}

/**
 * Utility function to check edge cases for empty or invalid inputs.
 * @param {*} input - Input to validate.
 * @returns {boolean} - True if input is valid, false otherwise.
 */
export function isValidInput(input) {
  return Array.isArray(input) || typeof input === 'string';
}
