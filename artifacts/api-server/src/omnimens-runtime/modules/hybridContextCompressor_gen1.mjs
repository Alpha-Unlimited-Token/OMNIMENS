/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_23
 * Name: hybridContextCompressor
 * Purpose: Combines hierarchical summarization with selective high-entropy extraction for optimal long-context compression.
 * Description: Combines hierarchical summarization and entropy-based extraction for optimal long-context compression across multi-agent systems.
 * Migrated: 2026-04-02T14:50:29.445Z
 */

// hybridContextCompressor.mjs

import { createHash } from 'crypto';

/**
 * Utility function to calculate entropy of a given text.
 * Higher entropy indicates more unpredictable and information-rich content.
 * @param {string} text - The input text.
 * @returns {number} - The calculated entropy value.
 */
export function calculateEntropy(text) {
  const frequency = {};
  for (const char of text) {
    frequency[char] = (frequency[char] || 0) + 1;
  }
  const totalChars = text.length;
  return Object.values(frequency).reduce((entropy, count) => {
    const probability = count / totalChars;
    return entropy - probability * Math.log2(probability);
  }, 0);
}

/**
 * Summarizes a given text by recursively compressing it into hierarchical layers.
 * @param {string} text - The input text to summarize.
 * @param {number} depth - The number of recursive layers to summarize.
 * @returns {string} - The summarized text.
 */
export function recursiveSummarize(text, depth = 2) {
  if (depth <= 0 || text.length < 50) return text;

  const sentences = text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s/);
  const compressed = sentences.map(sentence => {
    const words = sentence.split(' ');
    const midpoint = Math.floor(words.length / 2);
    return words.slice(0, midpoint).join(' ') + ' ...';
  });

  return recursiveSummarize(compressed.join(' '), depth - 1);
}

/**
 * Extracts high-entropy segments from the text based on a threshold.
 * @param {string} text - The input text.
 * @param {number} threshold - The entropy threshold for extraction.
 * @returns {string[]} - Array of high-entropy segments.
 */
export function extractHighEntropySegments(text, threshold = 4.0) {
  const sentences = text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s/);
  return sentences.filter(sentence => calculateEntropy(sentence) > threshold);
}

/**
 * Combines hierarchical summarization and high-entropy extraction for optimal compression.
 * @param {string} text - The input text.
 * @param {number} summarizationDepth - Depth of recursive summarization.
 * @param {number} entropyThreshold - Threshold for high-entropy extraction.
 * @returns {object} - An object containing compressed summary and high-entropy segments.
 */
export function hybridContextCompressor(text, summarizationDepth = 2, entropyThreshold = 4.0) {
  const summary = recursiveSummarize(text, summarizationDepth);
  const highEntropySegments = extractHighEntropySegments(text, entropyThreshold);

  return {
    summary,
    highEntropySegments
  };
}

/**
 * Generates a hash for deduplication or content tracking purposes.
 * @param {string} text - The input text.
 * @returns {string} - A SHA-256 hash of the text.
 */
export function generateContentHash(text) {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * Utility function to preserve recency-weighted content.
 * Ensures recent content is prioritized in compression.
 * @param {string[]} segments - Array of text segments.
 * @param {number} weightFactor - Weight for recency prioritization.
 * @returns {string[]} - Recency-weighted prioritized segments.
 */
export function preserveRecency(segments, weightFactor = 1.5) {
  return segments.map((segment, index) => ({
    segment,
    weight: Math.pow(weightFactor, segments.length - index - 1)
  }))
    .sort((a, b) => b.weight - a.weight)
    .map(item => item.segment);
}

/**
 * Main entry point for cross-agent utility.
 * Compresses, extracts, hashes, and prioritizes context for multi-agent use.
 */
export const hybridContextUtility = {
  calculateEntropy,
  recursiveSummarize,
  extractHighEntropySegments,
  hybridContextCompressor,
  generateContentHash,
  preserveRecency
};