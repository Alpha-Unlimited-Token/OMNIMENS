/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveSummarizationEngine
 * Written: 2026-04-03T08:07:45.355Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveSummarizationEngine.mjs

import { createHash } from 'crypto';

/**
 * Tokenizes text into sentences for summarization.
 * @param {string} text - The input text to tokenize.
 * @returns {string[]} - Array of sentences.
 */
export function tokenizeText(text) {
  return text.match(/[^.!?]+[.!?]/g) || [];
}

/**
 * Generates a hash for a given text, useful for deduplication or caching.
 * @param {string} text - The input text.
 * @returns {string} - A SHA256 hash of the text.
 */
export function generateTextHash(text) {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * Scores sentences based on their length and keyword density.
 * @param {string[]} sentences - Array of sentences to score.
 * @param {string[]} keywords - Array of keywords to prioritize.
 * @returns {Array<{ sentence, score}>} - Scored sentences.
 */
export function scoreSentences(sentences, keywords) {
  return sentences.map(sentence => {
    const keywordCount = keywords.reduce((count, keyword) => {
      const regex = new RegExp(`\b${keyword}\b`, 'gi');
      return count + (sentence.match(regex)?.length || 0);
    }, 0);
    const lengthScore = Math.min(sentence.length / 100, 1); // Normalize length score to max 1
    const totalScore = keywordCount * 2 + lengthScore; // Weight keywords more heavily
    return { sentence, score: totalScore };
  });
}

/**
 * Summarizes text by selecting top sentences based on scoring.
 * @param {string} text - The input text to summarize.
 * @param {string[]} keywords - Array of keywords to prioritize.
 * @param {number} maxSentences - Maximum number of sentences to include in the summary.
 * @returns {string} - Summarized text.
 */
export function summarizeText(text, keywords, maxSentences = 3) {
  const sentences = tokenizeText(text);
  const scoredSentences = scoreSentences(sentences, keywords);
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .map(entry => entry.sentence);
  return topSentences.join(' ');
}

/**
 * Extracts keywords from text based on frequency analysis.
 * @param {string} text - The input text.
 * @param {number} maxKeywords - Maximum number of keywords to extract.
 * @returns {string[]} - Array of extracted keywords.
 */
export function extractKeywords(text, maxKeywords = 5) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const frequencyMap = words.reduce((map, word) => {
    map[word] = (map[word] || 0) + 1;
    return map;
  }, {});
  return Object.entries(frequencyMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Adaptive summarization pipeline combining keyword extraction and summarization.
 * @param {string} text - The input text to process.
 * @param {number} maxSentences - Maximum number of sentences in the summary.
 * @param {number} maxKeywords - Maximum number of keywords to extract.
 * @returns {string} - Final summarized text.
 */
export function adaptiveSummarize(text, maxSentences = 3, maxKeywords = 5) {
  const keywords = extractKeywords(text, maxKeywords);
  return summarizeText(text, keywords, maxSentences);
}

/**
 * Utility for cross-agent use: Provides both summarization and keyword extraction.
 * @param {string} text - The input text.
 * @param {number} maxSentences - Maximum number of sentences in the summary.
 * @param {number} maxKeywords - Maximum number of keywords to extract.
 * @returns {{ summary, keywords}} - Summary and extracted keywords.
 */
export function crossAgentUtility(text, maxSentences = 3, maxKeywords = 5) {
  const keywords = extractKeywords(text, maxKeywords);
  const summary = summarizeText(text, keywords, maxSentences);
  return { summary, keywords };
}