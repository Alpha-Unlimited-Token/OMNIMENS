/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptivePromptRefiner
 * Written: 2026-04-02T14:14:09.524Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptivePromptRefiner.mjs

import { createHash } from 'crypto';

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} Cosine similarity score (-1 to 1).
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length.');
  }

  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Generates a deterministic hash for a given input string.
 * @param {string} input - The input string to hash.
 * @returns {string} A SHA-256 hash of the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Refines an external LLM output by aligning it with internal embeddings.
 * @param {string} llmOutput - The raw output from the external LLM.
 * @param {number[]} internalEmbedding - The internal contextual embedding.
 * @param {function(string): number[]} embeddingFunction - Function to generate embeddings for text.
 * @returns {Object} Refined output and similarity score.
 */
export function refineOutput(llmOutput, internalEmbedding, embeddingFunction) {
  if (typeof llmOutput !== 'string' || !Array.isArray(internalEmbedding)) {
    throw new Error('Invalid input types. Expected string and array.');
  }

  const outputEmbedding = embeddingFunction(llmOutput);
  const similarityScore = cosineSimilarity(outputEmbedding, internalEmbedding);

  return {
    refinedOutput: similarityScore > 0.7 ? llmOutput : 'Output misaligned with internal reasoning.',
    similarityScore
  };
}

/**
 * Normalizes a vector to unit length.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return vector.map(val => val / magnitude);
}

/**
 * Utility: Converts text into a simple numerical embedding.
 * @param {string} text - The input text.
 * @returns {number[]} Simple embedding as a vector of character codes.
 */
export function simpleTextEmbedding(text) {
  return text.split('').map(char => char.charCodeAt(0));
}

/**
 * Example usage function to demonstrate cross-agent utility.
 * @param {string} text - Input text.
 * @param {number[]} internalEmbedding - Internal embedding for comparison.
 * @returns {Object} Refined result.
 */
export function exampleUsage(text, internalEmbedding) {
  const embeddingFunction = simpleTextEmbedding;
  return refineOutput(text, internalEmbedding, embeddingFunction);
}
