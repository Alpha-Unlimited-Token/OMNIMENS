/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_26
 * Name: adaptiveLLMAdapter
 * Purpose: Refines external LLM outputs using OMNIMENS' independent neural cognition.
 * Description: Refines external LLM outputs via cosine similarity and attention mechanisms for adaptive reranking and contextual reweighting.
 * Migrated: 2026-04-02T15:46:59.466Z
 */

// adaptiveLLMAdapter.mjs

import { createHash } from 'crypto';

/**
 * Calculates cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b ** 2, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0; // Handle edge case for zero vectors.
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Generates a hash-based attention weight for contextual reweighting.
 * @param {string} context - Context string.
 * @param {string} candidate - Candidate string.
 * @returns {number} - Attention weight (normalized).
 */
export function attentionWeight(context, candidate) {
  const hashContext = createHash('sha256').update(context).digest('hex');
  const hashCandidate = createHash('sha256').update(candidate).digest('hex');

  let score = 0;
  for (let i = 0; i < hashContext.length; i++) {
    score += hashContext.charCodeAt(i) === hashCandidate.charCodeAt(i) ? 1 : 0;
  }

  return score / hashContext.length; // Normalize score.
}

/**
 * Reranks outputs based on cosine similarity and attention weights.
 * @param {string[]} candidates - Array of candidate strings.
 * @param {string} context - Context string.
 * @returns {string[]} - Reranked candidates.
 */
export function rerankCandidates(candidates, context) {
  const contextVector = context.split('').map(char => char.charCodeAt(0));

  const ranked = candidates.map(candidate => {
    const candidateVector = candidate.split('').map(char => char.charCodeAt(0));
    const similarity = cosineSimilarity(contextVector, candidateVector);
    const attention = attentionWeight(context, candidate);
    const score = similarity * attention;

    return { candidate, score };
  });

  return ranked
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.candidate);
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) return vector.map(() => 0); // Handle zero vector edge case.
  return vector.map(val => val / magnitude);
}

/**
 * Generates a vector representation of a string.
 * @param {string} input - Input string.
 * @returns {number[]} - Vector representation.
 */
export function stringToVector(input) {
  return input.split('').map(char => char.charCodeAt(0));
}

/**
 * Combines multiple vectors into a single averaged vector.
 * @param {number[][]} vectors - Array of vectors.
 * @returns {number[]} - Averaged vector.
 */
export function averageVectors(vectors) {
  const length = vectors[0]?.length || 0;
  if (length === 0) return [];

  const sumVector = Array(length).fill(0);
  vectors.forEach(vector => {
    vector.forEach((val, idx) => {
      sumVector[idx] += val;
    });
  });

  return sumVector.map(val => val / vectors.length);
}
