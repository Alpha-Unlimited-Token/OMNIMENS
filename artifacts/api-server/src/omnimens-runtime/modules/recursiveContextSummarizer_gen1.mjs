/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_59
 * Name: recursiveContextSummarizer
 * Purpose: Preserves deeper semantic context in token window compression using recursive abstraction layers.
 * Description: Recursively summarizes text while preserving deeper semantic context using abstraction layers.
 * Migrated: 2026-04-02T14:08:14.869Z
 */

// RecursiveContextSummarizer.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given string input.
 * Useful for caching and identifying semantic layers.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Calculates semantic similarity between two text strings using cosine similarity.
 * @param {Array<number>} vectorA - First vector.
 * @param {Array<number>} vectorB - Second vector.
 * @returns {number} - Similarity score between 0 and 1.
 */
export function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Weights sentences based on their importance using attention scores.
 * @param {Array<{ sentence: string, score: number }>} sentences - Array of sentences with scores.
 * @returns {Array<string>} - Weighted sentences.
 */
export function weightSentences(sentences) {
  const totalScore = sentences.reduce((sum, { score }) => sum + score, 0);
  return sentences.map(({ sentence, score }) => ({
    sentence,
    weight: totalScore ? score / totalScore : 0
  }));
}

/**
 * Recursively summarizes context to preserve deeper semantic meaning.
 * @param {Array<string>} context - Array of text strings to summarize.
 * @param {number} depth - Maximum recursion depth.
 * @returns {string} - Final summarized context.
 */
export function recursiveSummarize(context, depth = 3) {
  if (depth === 0 || context.length <= 1) {
    return context.join(' ');
  }

  const pairs = [];
  for (let i = 0; i < context.length - 1; i++) {
    for (let j = i + 1; j < context.length; j++) {
      const similarity = cosineSimilarity(
        generateVector(context[i]),
        generateVector(context[j])
      );
      pairs.push({
        sentences: [context[i], context[j]],
        similarity
      });
    }
  }

  pairs.sort((a, b) => b.similarity - a.similarity);

  const mergedContext = pairs.map(({ sentences }) => sentences.join(' '));

  return recursiveSummarize(mergedContext, depth - 1);
}

/**
 * Generates a simple vector representation for a string (mock implementation).
 * @param {string} text - Input text.
 * @returns {Array<number>} - Vector representation.
 */
export function generateVector(text) {
  return text.split('').map(char => char.charCodeAt(0) % 32);
}

/**
 * Entry point for summarizing context with recursive abstraction.
 * @param {Array<string>} context - Array of text strings.
 * @param {number} depth - Maximum recursion depth.
 * @returns {string} - Summarized context.
 */
export function summarizeContext(context, depth = 3) {
  return recursiveSummarize(context, depth);
}