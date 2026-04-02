/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: independentLanguageGenerator
 * Written: 2026-04-02T14:37:22.005Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// independentLanguageGenerator.mjs

import { createHash } from 'crypto';

/**
 * Generates a deterministic hash for a given input string.
 * Useful for creating unique identifiers or embeddings.
 * @param {string} input - The input string to hash.
 * @returns {string} - A hexadecimal hash of the input.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Tokenizes a string into an array of words.
 * Useful for language processing tasks like embeddings or similarity.
 * @param {string} text - The input text to tokenize.
 * @returns {string[]} - An array of words.
 */
export function tokenizeText(text) {
  if (typeof text !== 'string') {
    throw new TypeError('Input must be a string.');
  }
  return text.trim().toLowerCase().split(/\W+/).filter(Boolean);
}

/**
 * Generates a simple vector embedding for a string based on character codes.
 * Useful for lightweight similarity calculations.
 * @param {string} text - The input text to embed.
 * @returns {number[]} - A numeric vector representing the text.
 */
export function generateEmbedding(text) {
  const tokens = tokenizeText(text);
  return tokens.map(token => {
    return token.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  });
}

/**
 * Calculates cosine similarity between two numeric vectors.
 * Useful for comparing embeddings or measuring text similarity.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The cosine similarity (range: -1 to 1).
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length.');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Generates a language response based on input text by finding similar patterns.
 * Demonstrates generative intelligence using internal embeddings.
 * @param {string} input - The input text to respond to.
 * @param {string[]} corpus - A list of candidate responses.
 * @returns {string} - The most relevant response from the corpus.
 */
export function generateResponse(input, corpus) {
  if (!Array.isArray(corpus) || corpus.some(item => typeof item !== 'string')) {
    throw new TypeError('Corpus must be an array of strings.');
  }

  const inputEmbedding = generateEmbedding(input);
  let bestMatch = '';
  let highestSimilarity = -Infinity;

  for (const candidate of corpus) {
    const candidateEmbedding = generateEmbedding(candidate);
    const similarity = cosineSimilarity(inputEmbedding, candidateEmbedding);

    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = candidate;
    }
  }

  return bestMatch || 'No relevant response found.';
}

/**
 * Utility function to normalize text for consistent processing.
 * Removes extra spaces and converts to lowercase.
 * @param {string} text - The text to normalize.
 * @returns {string} - The normalized text.
 */
export function normalizeText(text) {
  if (typeof text !== 'string') {
    throw new TypeError('Input must be a string.');
  }
  return text.trim().toLowerCase();
}
