/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_2
 * Name: semanticReconstructionCompressor
 * Purpose: Reduces token window compression loss by reconstructing semantic hierarchies.
 * Description: A utility module for semantic compression and reconstruction using multi-pass summarization, embedding alignment, and context reinforcement.
 * Migrated: 2026-04-02T21:22:24.994Z
 */

// semanticReconstructionCompressor.mjs

import { createHash } from 'crypto';

/**
 * Generates a semantic hash for a given input string using SHA-256.
 * Useful for identifying similar semantic content across agents.
 * @param {string} input - The input string to hash.
 * @returns {string} - The SHA-256 hash of the input.
 */
export function generateSemanticHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Aligns semantic embeddings by averaging vectors.
 * Useful for multi-agent systems to find common semantic ground.
 * @param {Array<Array<number>>} embeddings - Array of semantic embeddings (arrays of numbers).
 * @returns {Array<number>} - The averaged embedding vector.
 */
export function alignSemanticEmbeddings(embeddings) {
  if (!embeddings.length) return [];

  const dimension = embeddings[0].length;
  const result = new Array(dimension).fill(0);

  for (const embedding of embeddings) {
    if (embedding.length !== dimension) {
      throw new Error('All embeddings must have the same dimension.');
    }
    for (let i = 0; i < dimension; i++) {
      result[i] += embedding[i];
    }
  }

  return result.map(value => value / embeddings.length);
}

/**
 * Performs multi-pass summarization to reconstruct semantic hierarchies.
 * Useful for compressing large token windows while retaining meaning.
 * @param {Array<string>} texts - Array of text segments to summarize.
 * @param {number} passes - Number of summarization passes to perform.
 * @returns {string} - The reconstructed summary.
 */
export function multiPassSummarization(texts, passes = 3) {
  if (!Array.isArray(texts) || passes < 1) {
    throw new Error('Invalid input: texts must be an array and passes must be >= 1.');
  }

  let currentTexts = texts;

  for (let pass = 0; pass < passes; pass++) {
    const summaries = [];

    for (const text of currentTexts) {
      // Simple summarization by extracting key sentences (placeholder logic).
      const sentences = text.split('.').map(s => s.trim()).filter(Boolean);
      const keySentences = sentences.slice(0, Math.max(1, Math.floor(sentences.length / 2)));
      summaries.push(keySentences.join('. '));
    }

    currentTexts = summaries;
  }

  return currentTexts.join(' ');
}

/**
 * Reinforces context by combining a base text with additional context.
 * Useful for maintaining coherence in compressed token windows.
 * @param {string} baseText - The base text.
 * @param {Array<string>} contextTexts - Array of context texts to integrate.
 * @returns {string} - The contextually reinforced text.
 */
export function reinforceContext(baseText, contextTexts) {
  if (typeof baseText !== 'string' || !Array.isArray(contextTexts)) {
    throw new Error('Invalid input: baseText must be a string and contextTexts must be an array.');
  }

  const combinedText = [baseText, ...contextTexts].join(' ');

  // Simple context reinforcement by re-summarizing combined text.
  return multiPassSummarization([combinedText], 1);
}

/**
 * Utility to normalize text by removing extra whitespace and converting to lowercase.
 * Useful for pre-processing text across agents.
 * @param {string} text - The input text to normalize.
 * @returns {string} - The normalized text.
 */
export function normalizeText(text) {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string.');
  }

  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}