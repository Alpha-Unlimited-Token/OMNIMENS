/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveSummarizationManager
 * Written: 2026-04-03T01:19:29.007Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// recursiveSummarizationManager.mjs

import crypto from 'crypto';

/**
 * Generates a hash for a given string (used for tracking summaries).
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash of the input.
 */
export function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Summarizes a given text by extracting key sentences.
 * @param {string} text - The input text to summarize.
 * @param {number} maxSentences - Maximum number of sentences in the summary.
 * @returns {string} - A summarized version of the text.
 */
export function summarizeText(text, maxSentences = 3) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  return sentences.slice(0, maxSentences).join(' ').trim();
}

/**
 * Recursively summarizes text until it fits within a target length.
 * @param {string} text - The input text to compress.
 * @param {number} targetLength - Desired maximum length of the final summary.
 * @returns {string} - The recursively compressed summary.
 */
export function recursiveSummarize(text, targetLength) {
  let currentText = text;
  while (currentText.length > targetLength) {
    currentText = summarizeText(currentText);
  }
  return currentText;
}

/**
 * Expands a summary into a detailed representation using a context map.
 * @param {string} summary - The summarized text to expand.
 * @param {Object} contextMap - A mapping of keywords to detailed explanations.
 * @returns {string} - The expanded detailed representation.
 */
export function expandSummary(summary, contextMap) {
  return summary.split(' ').map(word => contextMap[word] || word).join(' ');
}

/**
 * Manages hierarchical summarization and expansion of text.
 * @param {string} text - The input text to process.
 * @param {Object} contextMap - A mapping of keywords to detailed explanations.
 * @param {number} targetLength - Desired maximum length of the summary.
 * @returns {Object} - An object containing the summary and expanded text.
 */
export function manageRecursiveSummarization(text, contextMap, targetLength) {
  const summary = recursiveSummarize(text, targetLength);
  const expanded = expandSummary(summary, contextMap);
  return { summary, expanded };
}

/**
 * Utility to tokenize text into words for broader use cases.
 * @param {string} text - The input text to tokenize.
 * @returns {string[]} - An array of words from the text.
 */
export function tokenizeText(text) {
  return text.split(/\s+/).filter(Boolean);
}

/**
 * Utility to count the frequency of words in a given text.
 * @param {string} text - The input text to analyze.
 * @returns {Object} - A frequency map of words in the text.
 */
export function wordFrequency(text) {
  const tokens = tokenizeText(text);
  return tokens.reduce((freqMap, word) => {
    freqMap[word] = (freqMap[word] || 0) + 1;
    return freqMap;
  }, {});
}

/**
 * Utility to calculate the similarity between two texts using Jaccard similarity.
 * @param {string} text1 - The first text.
 * @param {string} text2 - The second text.
 * @returns {number} - The Jaccard similarity score (0 to 1).
 */
export function jaccardSimilarity(text1, text2) {
  const set1 = new Set(tokenizeText(text1));
  const set2 = new Set(tokenizeText(text2));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}