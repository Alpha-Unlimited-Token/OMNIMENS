/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: nativeLanguageModel
 * Written: 2026-04-03T03:21:26.514Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// nativeLanguageModel.mjs

import { createHash } from 'crypto';

/**
 * Generate a hash-based unique identifier for strings, useful for indexing and memory operations.
 * @param {string} input - The string to hash.
 * @returns {string} - A hex-encoded hash of the input.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Normalize a vector to unit length.
 * @param {number[]} vector - The input vector.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) return vector.map(() => 0);
  return vector.map(val => val / magnitude);
}

/**
 * Compute cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The cosine similarity score.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }
  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Generate conversational embeddings for a given input string using a simple token-based approach.
 * @param {string} input - The input string.
 * @returns {number[]} - A vector representation of the input.
 */
export function generateEmbeddings(input) {
  const tokens = input.split(/\s+/);
  const embeddings = tokens.map(token => {
    const hash = generateHash(token);
    return parseInt(hash.slice(0, 8), 16) % 512; // Map hash to a 512-dim space
  });
  return normalizeVector(embeddings);
}

/**
 * Find the most similar string from a list of candidates based on cosine similarity.
 * @param {string} query - The input string to compare.
 * @param {string[]} candidates - A list of candidate strings.
 * @returns {string} - The most similar string.
 */
export function findMostSimilar(query, candidates) {
  const queryEmbedding = generateEmbeddings(query);
  let bestMatch = null;
  let highestSimilarity = -Infinity;

  for (const candidate of candidates) {
    const candidateEmbedding = generateEmbeddings(candidate);
    const similarity = cosineSimilarity(queryEmbedding, candidateEmbedding);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = candidate;
    }
  }

  return bestMatch;
}

/**
 * Generate conversational output by selecting the best response from a predefined set.
 * @param {string} input - The user input string.
 * @param {string[]} responses - A list of predefined responses.
 * @returns {string} - The selected response.
 */
export function generateResponse(input, responses) {
  return findMostSimilar(input, responses);
}
