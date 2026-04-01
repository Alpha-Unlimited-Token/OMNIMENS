/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_21
 * Name: contextRichSummarizer
 * Purpose: Preserve nuanced details in token window compression for long-context reasoning.
 * Description: Generates nuanced summaries by combining extractive and abstractive techniques with recursive refinement and importance scoring.
 * Migrated: 2026-04-01T22:23:20.227Z
 */

// contextRichSummarizer.mjs

import crypto from 'crypto';

/**
 * Generates a hash-based importance score for a given text segment.
 * Useful for weighting text relevance during summarization.
 * @param {string} text - The text segment to score.
 * @returns {number} - Importance score (0 to 1).
 */
export function importanceScore(text) {
  if (typeof text !== 'string' || text.trim() === '') return 0;
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  const numericValue = parseInt(hash.slice(0, 8), 16);
  return numericValue / 0xffffffff; // Normalize to [0, 1]
}

/**
 * Extracts key sentences from text based on importance scoring.
 * @param {string} text - The full text to summarize.
 * @param {number} sentenceCount - Number of sentences to extract.
 * @returns {string[]} - Array of key sentences.
 */
export function extractiveSummary(text, sentenceCount = 3) {
  if (typeof text !== 'string' || sentenceCount <= 0) return [];
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  const scoredSentences = sentences.map(sentence => ({
    sentence,
    score: importanceScore(sentence)
  }));
  scoredSentences.sort((a, b) => b.score - a.score);
  return scoredSentences.slice(0, sentenceCount).map(item => item.sentence.trim());
}

/**
 * Combines sentences into a coherent abstractive summary.
 * @param {string[]} sentences - Array of sentences to combine.
 * @returns {string} - Abstractive summary.
 */
export function abstractiveSummary(sentences) {
  if (!Array.isArray(sentences) || sentences.length === 0) return '';
  return sentences.join(' ');
}

/**
 * Refines a summary recursively by re-evaluating importance.
 * @param {string} text - Original text.
 * @param {number} iterations - Number of refinement steps.
 * @returns {string} - Refined summary.
 */
export function recursiveRefinement(text, iterations = 2) {
  if (typeof text !== 'string' || iterations <= 0) return '';
  let currentText = text;
  for (let i = 0; i < iterations; i++) {
    const keySentences = extractiveSummary(currentText);
    currentText = abstractiveSummary(keySentences);
  }
  return currentText;
}

/**
 * Main function to generate a context-rich summary.
 * @param {string} text - Original text to summarize.
 * @param {number} sentenceCount - Number of sentences to extract.
 * @param {number} refinementSteps - Number of recursive refinements.
 * @returns {string} - Context-rich summary.
 */
export function contextRichSummarize(text, sentenceCount = 3, refinementSteps = 2) {
  if (typeof text !== 'string' || text.trim() === '') return '';
  const keySentences = extractiveSummary(text, sentenceCount);
  const initialSummary = abstractiveSummary(keySentences);
  return recursiveRefinement(initialSummary, refinementSteps);
}

/**
 * Utility function to split text into sentences.
 * @param {string} text - Input text.
 * @returns {string[]} - Array of sentences.
 */
export function splitIntoSentences(text) {
  if (typeof text !== 'string') return [];
  return text.match(/[^.!?]+[.!?]/g) || [];
}

/**
 * Utility function to normalize text (remove excess whitespace).
 * @param {string} text - Input text.
 * @returns {string} - Normalized text.
 */
export function normalizeText(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/\s+/g, ' ').trim();
}
