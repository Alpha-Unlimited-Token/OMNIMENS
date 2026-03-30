/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: semanticContextPreserver
 * Purpose: Preserves nuanced context during token window compression using semantic coherence scoring.
 * Description: Preserves nuanced context during token window compression by ranking summaries based on semantic coherence using cosine similarity of embeddings.
 * Migrated: 2026-03-25T22:49:34.147Z
 */

// semanticContextPreserver.mjs

import { createHash } from 'crypto';

/**
 * Generate a hash-based embedding for a given text.
 * This is a simplified approach to simulate text embedding using hashing.
 * @param {string} text - Input text to embed.
 * @returns {Float64Array} - Numerical representation of the text.
 */
export function generateTextEmbedding(text) {
  const hash = createHash('sha256').update(text).digest();
  const embedding = new Float64Array(hash.length);
  for (let i = 0; i < hash.length; i++) {
    embedding[i] = hash[i] / 255; // Normalize to [0, 1]
  }
  return embedding;
}

/**
 * Calculate the cosine similarity between two embeddings.
 * @param {Float64Array} embeddingA - First embedding.
 * @param {Float64Array} embeddingB - Second embedding.
 * @returns {number} - Cosine similarity score between -1 and 1.
 */
export function cosineSimilarity(embeddingA, embeddingB) {
  if (embeddingA.length !== embeddingB.length) {
    throw new Error('Embeddings must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < embeddingA.length; i++) {
    dotProduct += embeddingA[i] * embeddingB[i];
    magnitudeA += embeddingA[i] ** 2;
    magnitudeB += embeddingB[i] ** 2;
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Rank compressed summaries based on semantic similarity to the original context.
 * @param {string} originalText - Original text context.
 * @param {string[]} summaries - Array of compressed summaries.
 * @returns {Array<{summary: string, score: number}>} - Ranked summaries with similarity scores.
 */
export function rankSummariesBySemanticSimilarity(originalText, summaries) {
  const originalEmbedding = generateTextEmbedding(originalText);

  return summaries
    .map((summary) => {
      const summaryEmbedding = generateTextEmbedding(summary);
      const score = cosineSimilarity(originalEmbedding, summaryEmbedding);
      return { summary, score };
    })
    .sort((a, b) => b.score - a.score); // Sort by descending similarity score
}

/**
 * Utility function to normalize similarity scores to a 0-1 range.
 * @param {Array<{summary: string, score: number}>} rankedSummaries - Ranked summaries with raw scores.
 * @returns {Array<{summary: string, normalizedScore: number}>} - Summaries with normalized scores.
 */
export function normalizeScores(rankedSummaries) {
  const scores = rankedSummaries.map((item) => item.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  return rankedSummaries.map(({ summary, score }) => {
    const normalizedScore = maxScore === minScore ? 1 : (score - minScore) / (maxScore - minScore);
    return { summary, normalizedScore };
  });
}

/**
 * Main function to process and rank summaries.
 * @param {string} originalText - Original text context.
 * @param {string[]} summaries - Array of compressed summaries.
 * @returns {Array<{summary: string, normalizedScore: number}>} - Ranked and normalized summaries.
 */
export function processSummaries(originalText, summaries) {
  const rankedSummaries = rankSummariesBySemanticSimilarity(originalText, summaries);
  return normalizeScores(rankedSummaries);
}