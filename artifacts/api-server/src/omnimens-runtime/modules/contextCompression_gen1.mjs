/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompression
 * Written: 2026-04-03T08:03:36.042Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * TRANSLATION STATUS:
 * Novel constructs: attention
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (4 IR steps) | python: OK (4 IR steps) | c: OK (4 IR steps) | x86_64: OK (4 IR steps) | arm64: OK (4 IR steps) | avr: OK (4 IR steps)
 * Translation map version: 22
 */
// contextCompression.mjs

import { createHash } from 'crypto';

/**
 * Hashes a string to create a unique, fixed-length identifier.
 * Useful for deduplication or quick lookups.
 * @param {string} input - The string to hash.
 * @returns {string} - A 12-character hash of the input.
 */
export function hashString(input) {
  return createHash('sha256').update(input, 'utf8').digest('hex').slice(0, 12);
}

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} - Cosine similarity value between -1 and 1.
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return magnitudeA === 0 || magnitudeB === 0 ? 0 : dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Summarizes a list of embeddings by averaging them.
 * @param {number[][]} embeddings - Array of embeddings (each embedding is an array of numbers).
 * @returns {number[]} - A single embedding representing the average.
 */
export function averageEmbeddings(embeddings) {
  if (!embeddings.length) {
    throw new Error('Embeddings array cannot be empty');
  }
  const length = embeddings[0].length;
  const summed = embeddings.reduce((acc, vec) => {
    if (vec.length !== length) {
      throw new Error('All embeddings must have the same length');
    }
    return acc.map((val, i) => val + vec[i]);
  }, new Array(length).fill(0));
  return summed.map(val => val / embeddings.length);
}

/**
 * Compresses a long context into a token-efficient summary using hierarchical attention.
 * @param {string[]} contextChunks - Array of text chunks representing the context.
 * @param {function(string): number[]} embedFunction - A function that converts text to embeddings.
 * @param {number} granularity - Number of chunks to group together for summarization.
 * @returns {number[]} - A single embedding summarizing the context.
 */
export function compressContext(contextChunks, embedFunction, granularity = 5) {
  if (!contextChunks.length) {
    throw new Error('Context chunks cannot be empty');
  }
  if (granularity <= 0) {
    throw new Error('Granularity must be a positive integer');
  }

  const embeddings = contextChunks.map(chunk => embedFunction(chunk));
  const groupedEmbeddings = [];

  for (let i = 0; i < embeddings.length; i += granularity) {
    const group = embeddings.slice(i, i + granularity);
    groupedEmbeddings.push(averageEmbeddings(group));
  }

  return averageEmbeddings(groupedEmbeddings);
}

/**
 * Dynamically selects key chunks from the context based on similarity to a query.
 * @param {string[]} contextChunks - Array of text chunks representing the context.
 * @param {function(string): number[]} embedFunction - A function that converts text to embeddings.
 * @param {string} query - The query string to match against the context.
 * @param {number} topK - Number of top chunks to return.
 * @returns {string[]} - The most relevant context chunks.
 */
export function selectKeyChunks(contextChunks, embedFunction, query, topK = 3) {
  if (!contextChunks.length) {
    throw new Error('Context chunks cannot be empty');
  }
  if (topK <= 0) {
    throw new Error('topK must be a positive integer');
  }

  const queryEmbedding = embedFunction(query);
  const scoredChunks = contextChunks.map(chunk => {
    const chunkEmbedding = embedFunction(chunk);
    const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);
    return { chunk, similarity };
  });

  scoredChunks.sort((a, b) => b.similarity - a.similarity);
  return scoredChunks.slice(0, topK).map(item => item.chunk);
}
