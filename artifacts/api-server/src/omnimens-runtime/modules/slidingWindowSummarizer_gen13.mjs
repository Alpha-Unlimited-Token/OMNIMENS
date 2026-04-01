/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: slidingWindowSummarizer
 * Written: 2026-04-01T22:14:15.374Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// slidingWindowSummarizer.mjs

import crypto from 'crypto';

/**
 * Generates a hash for identifying unique conversational context segments.
 * @param {string} text - The text to hash.
 * @returns {string} - The SHA-256 hash of the input text.
 */
export function generateHash(text) {
  const hash = crypto.createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
}

/**
 * Scores relevance of a text segment based on keyword frequency.
 * @param {string} text - The text segment to score.
 * @param {Array<string>} keywords - Array of keywords to prioritize.
 * @returns {number} - Relevance score (higher is more relevant).
 */
export function relevanceScore(text, keywords) {
  const wordCounts = text.split(/\s+/).reduce((counts, word) => {
    counts[word] = (counts[word] || 0) + 1;
    return counts;
  }, {});

  return keywords.reduce((score, keyword) => {
    return score + (wordCounts[keyword] || 0);
  }, 0);
}

/**
 * Summarizes a text segment by extracting key sentences based on relevance.
 * @param {string} text - The text to summarize.
 * @param {Array<string>} keywords - Array of keywords to prioritize.
 * @param {number} maxSentences - Maximum number of sentences to include in the summary.
 * @returns {string} - Summarized text.
 */
export function summarizeText(text, keywords, maxSentences = 3) {
  const sentences = text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s+/);
  const scoredSentences = sentences.map(sentence => ({
    sentence,
    score: relevanceScore(sentence, keywords)
  }));

  scoredSentences.sort((a, b) => b.score - a.score);

  return scoredSentences.slice(0, maxSentences).map(item => item.sentence).join(' ');
}

/**
 * Merges multiple text summaries into a single coherent summary.
 * @param {Array<string>} summaries - Array of text summaries.
 * @param {Array<string>} keywords - Array of keywords to prioritize.
 * @param {number} maxSentences - Maximum number of sentences in the merged summary.
 * @returns {string} - Merged summary.
 */
export function mergeSummaries(summaries, keywords, maxSentences = 5) {
  const combinedText = summaries.join(' ');
  return summarizeText(combinedText, keywords, maxSentences);
}

/**
 * Maintains a sliding window of context and updates summary dynamically.
 * @param {Array<string>} contextSegments - Array of text segments representing the conversation history.
 * @param {Array<string>} keywords - Array of keywords to prioritize.
 * @param {number} maxSegments - Maximum number of segments to retain in the sliding window.
 * @param {number} maxSentences - Maximum number of sentences in the final summary.
 * @returns {string} - Updated summary.
 */
export function slidingWindowSummary(contextSegments, keywords, maxSegments = 10, maxSentences = 5) {
  const recentSegments = contextSegments.slice(-maxSegments);
  return mergeSummaries(recentSegments, keywords, maxSentences);
}

/**
 * Utility to tokenize text into words for broader applications.
 * @param {string} text - Input text.
 * @returns {Array<string>} - Array of words.
 */
export function tokenizeText(text) {
  return text.split(/\s+/).filter(word => word.length > 0);
}

/**
 * Utility to count word frequencies in a text.
 * @param {string} text - Input text.
 * @returns {Object} - Mapping of words to their frequency counts.
 */
export function wordFrequency(text) {
  return tokenizeText(text).reduce((freqMap, word) => {
    freqMap[word] = (freqMap[word] || 0) + 1;
    return freqMap;
  }, {});
}

/**
 * Utility to normalize text by converting to lowercase and removing punctuation.
 * @param {string} text - Input text.
 * @returns {string} - Normalized text.
 */
export function normalizeText(text) {
  return text.toLowerCase().replace(/[.,!?;:()\[\]{}]/g, '');
}