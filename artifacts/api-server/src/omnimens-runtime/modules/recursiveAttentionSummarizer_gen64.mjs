/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveAttentionSummarizer
 * Written: 2026-04-02T14:40:51.580Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// recursiveAttentionSummarizer.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given input string. Useful for caching summaries or tracking iterations.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Calculates importance scores for sentences based on length and keyword density.
 * @param {string[]} sentences - Array of sentences to score.
 * @param {string[]} keywords - Array of keywords to prioritize.
 * @returns {number[]} - Array of importance scores corresponding to each sentence.
 */
export function calculateImportanceScores(sentences, keywords) {
  return sentences.map(sentence => {
    const lengthScore = sentence.length / 100; // Normalize length score
    const keywordScore = keywords.reduce((score, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      return score + (sentence.match(regex)?.length || 0);
    }, 0);
    return lengthScore + keywordScore;
  });
}

/**
 * Refines a summary iteratively by re-evaluating importance scores and semantic coherence.
 * @param {string} text - The full text to summarize.
 * @param {number} iterations - Number of recursive refinement steps.
 * @param {string[]} keywords - Keywords to prioritize in the summary.
 * @returns {string} - The refined summary.
 */
export function recursiveSummarize(text, iterations, keywords) {
  let sentences = text.split(/(?<=[.!?])\s+/); // Split text into sentences
  let summary = sentences;

  for (let i = 0; i < iterations; i++) {
    const importanceScores = calculateImportanceScores(summary, keywords);
    const threshold = Math.max(...importanceScores) * 0.5; // Dynamic threshold

    // Filter sentences above the threshold
    summary = summary.filter((_, index) => importanceScores[index] >= threshold);

    // Re-sort sentences for semantic coherence (simple heuristic: original order)
    summary.sort((a, b) => sentences.indexOf(a) - sentences.indexOf(b));
  }

  return summary.join(' ');
}

/**
 * Splits text into sentences for processing. Useful for agents needing sentence-level granularity.
 * @param {string} text - The input text to split.
 * @returns {string[]} - Array of sentences.
 */
export function splitIntoSentences(text) {
  return text.split(/(?<=[.!?])\s+/);
}

/**
 * Combines multiple summaries into a single cohesive summary by ranking and merging sentences.
 * @param {string[]} summaries - Array of individual summaries.
 * @param {string[]} keywords - Keywords to prioritize in the combined summary.
 * @returns {string} - The combined summary.
 */
export function combineSummaries(summaries, keywords) {
  const allSentences = summaries.flatMap(summary => splitIntoSentences(summary));
  const uniqueSentences = Array.from(new Set(allSentences)); // Remove duplicates
  const importanceScores = calculateImportanceScores(uniqueSentences, keywords);

  // Sort sentences by importance scores (descending)
  const sortedSentences = uniqueSentences
    .map((sentence, index) => ({ sentence, score: importanceScores[index] }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.sentence);

  return sortedSentences.join(' ');
}

/**
 * Generates a keyword list from the input text by extracting frequently occurring words.
 * @param {string} text - The input text to analyze.
 * @param {number} limit - Maximum number of keywords to extract.
 * @returns {string[]} - Array of extracted keywords.
 */
export function extractKeywords(text, limit = 10) {
  const wordFrequency = {};
  const words = text.toLowerCase().match(/\b[a-z]{3}\b/g) || [];

  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });

  return Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([word]) => word);
}

// Example Usage (commented out for production):
// const text = "Your input text here.";
// const keywords = extractKeywords(text);
// const summary = recursiveSummarize(text, 3, keywords);
// console.log(summary);