/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_3
 * Name: contextWindowManager
 * Purpose: Manages long conversations by summarizing earlier context and maintaining coherence.
 * Description: Manages long conversations by summarizing earlier context using sliding window and hierarchical summarization.
 * Migrated: 2026-04-01T22:23:20.232Z
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
 * @returns {Array<{hash: string, summary: string}>} - Array of summarized context segments with hashes.
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