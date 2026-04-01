/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompressionEngine
 * Written: 2026-04-01T22:13:58.347Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextCompressionEngine.mjs

import { createHash } from 'crypto';

/**
 * Hashes a string to create a deterministic, compact representation.
 * @param {string} input - The input string to hash.
 * @returns {string} - A 32-character hexadecimal hash of the input.
 */
export function hashString(input) {
  const hash = createHash('sha256');
  hash.update(input, 'utf8');
  return hash.digest('hex').slice(0, 32);
}

/**
 * Splits a large text into smaller chunks of a specified size.
 * @param {string} text - The input text to split.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {string[]} - An array of text chunks.
 */
export function splitIntoChunks(text, chunkSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Computes a weighted average embedding from multiple embeddings.
 * @param {number[][]} embeddings - An array of embeddings (arrays of numbers).
 * @param {number[]} weights - An array of weights corresponding to each embedding.
 * @returns {number[]} - A single averaged embedding.
 */
export function weightedAverageEmbedding(embeddings, weights) {
  if (embeddings.length !== weights.length) {
    throw new Error('Embeddings and weights must have the same length.');
  }

  const dimension = embeddings[0].length;
  const result = Array(dimension).fill(0);
  let totalWeight = 0;

  for (let i = 0; i < embeddings.length; i++) {
    const weight = weights[i];
    totalWeight += weight;
    for (let j = 0; j < dimension; j++) {
      result[j] += embeddings[i][j] * weight;
    }
  }

  return result.map(value => value / totalWeight);
}

/**
 * Compresses a conversational context into a compact representation.
 * @param {string[]} context - An array of conversational messages.
 * @returns {object} - An object containing a summary and a hash.
 */
export function compressContext(context) {
  const concatenated = context.join(' ');
  const chunks = splitIntoChunks(concatenated, 256);

  // Generate embeddings as simple character code sums for demonstration purposes.
  const embeddings = chunks.map(chunk =>
    Array.from(chunk).map(char => char.charCodeAt(0)).reduce((a, b) => a + b, 0)
  );

  // Normalize embeddings into vectors.
  const normalizedEmbeddings = embeddings.map(value => [value]);
  const weights = Array(chunks.length).fill(1 / chunks.length);

  const compressedEmbedding = weightedAverageEmbedding(normalizedEmbeddings, weights);
  const summaryHash = hashString(concatenated);

  return {
    summary: compressedEmbedding,
    hash: summaryHash
  };
}

/**
 * Generates a similarity score between two embeddings.
 * @param {number[]} embeddingA - The first embedding.
 * @param {number[]} embeddingB - The second embedding.
 * @returns {number} - A similarity score (cosine similarity).
 */
export function similarityScore(embeddingA, embeddingB) {
  if (embeddingA.length !== embeddingB.length) {
    throw new Error('Embeddings must have the same length.');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < embeddingA.length; i++) {
    dotProduct += embeddingA[i] * embeddingB[i];
    magnitudeA += embeddingA[i] ** 2;
    magnitudeB += embeddingB[i] ** 2;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

/**
 * Example utility to compress and compare two contexts.
 * @param {string[]} contextA - First context array.
 * @param {string[]} contextB - Second context array.
 * @returns {number} - Similarity score between the two contexts.
 */
export function compareContexts(contextA, contextB) {
  const compressedA = compressContext(contextA);
  const compressedB = compressContext(contextB);
  return similarityScore(compressedA.summary, compressedB.summary);
}