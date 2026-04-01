/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompactor
 * Written: 2026-04-01T22:02:50.554Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextCompactor.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given string input.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash representing the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Extracts key phrases from a given text using simple heuristics.
 * @param {string} text - The input text.
 * @returns {Array<string>} - An array of key phrases.
 */
export function extractKeyPhrases(text) {
  const words = text.match(/\b\w+\b/g) || [];
  const frequency = {};

  for (const word of words) {
    const lowerWord = word.toLowerCase();
    frequency[lowerWord] = (frequency[lowerWord] || 0) + 1;
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Applies temporal decay to embeddings based on their age.
 * @param {Array<number>} embedding - The embedding vector.
 * @param {number} age - The age of the embedding (e.g., in seconds).
 * @param {number} decayRate - The rate of decay (e.g., 0.01 for 1% per second).
 * @returns {Array<number>} - The decayed embedding vector.
 */
export function applyTemporalDecay(embedding, age, decayRate = 0.01) {
  return embedding.map(value => value * Math.exp(-decayRate * age));
}

/**
 * Combines multiple embeddings into a single condensed embedding using a weighted average.
 * @param {Array<{ embedding, weight}>} embeddings - Array of embeddings with weights.
 * @returns {Array<number>} - The condensed embedding vector.
 */
export function condenseEmbeddings(embeddings) {
  if (embeddings.length === 0) return [];

  const dimension = embeddings[0].embedding.length;
  const combined = new Array(dimension).fill(0);
  let totalWeight = 0;

  for (const { embedding, weight } of embeddings) {
    for (let i = 0; i < dimension; i++) {
      combined[i] += embedding[i] * weight;
    }
    totalWeight += weight;
  }

  return combined.map(value => value / totalWeight);
}

/**
 * Dynamically condenses conversation or document history into embeddings.
 * @param {Array<{ text, timestamp, embedding }>} history - Array of historical data.
 * @param {number} currentTime - The current timestamp.
 * @param {number} decayRate - The rate of temporal decay.
 * @returns {Array<number>} - The condensed embedding vector.
 */
export function contextCompactor(history, currentTime, decayRate = 0.01) {
  const processed = history.map(({ text, timestamp, embedding }) => {
    const age = currentTime - timestamp;
    const decayedEmbedding = applyTemporalDecay(embedding, age, decayRate);
    const keyPhrases = extractKeyPhrases(text);
    const weight = keyPhrases.length; // Use the number of key phrases as a weight.

    return { embedding: decayedEmbedding, weight };
  });

  return condenseEmbeddings(processed);
}

/**
 * Generates a random embedding vector for demonstration purposes.
 * @param {number} dimension - The dimensionality of the embedding.
 * @returns {Array<number>} - A random embedding vector.
 */
export function generateRandomEmbedding(dimension = 128) {
  return Array.from({ length: dimension }, () => Math.random());
}

/**
 * Example usage of the contextCompactor function.
 */
export function exampleUsage() {
  const history = [
    {
      text: "The quick brown fox jumps over the lazy dog.",
      timestamp: 100,
      embedding: generateRandomEmbedding()
    },
    {
      text: "A journey of a thousand miles begins with a single step.",
      timestamp: 200,
      embedding: generateRandomEmbedding()
    }
  ];

  const currentTime = 300;
  const condensedEmbedding = contextCompactor(history, currentTime);

  return condensedEmbedding;
}