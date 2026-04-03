/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryEmbeddingIndex
 * Written: 2026-04-03T00:28:56.755Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { createHash } from 'crypto';

/**
 * Generates a hash for an embedding to be used in Locality-Sensitive Hashing (LSH).
 * @param {number[]} embedding - Array of numbers representing the embedding.
 * @param {number} numBuckets - Number of buckets for hashing.
 * @returns {string} - Hash string representing the bucket.
 */
export function generateLSHHash(embedding, numBuckets) {
  if (!Array.isArray(embedding) || embedding.some(isNaN)) {
    throw new Error('Embedding must be an array of numbers.');
  }
  if (typeof numBuckets !== 'number' || numBuckets <= 0) {
    throw new Error('numBuckets must be a positive integer.');
  }

  const hashInput = embedding.map((x) => Math.round(x * 10000)).join(',');
  const hash = createHash('sha256').update(hashInput).digest('hex');

  // Map hash to a bucket
  const bucket = parseInt(hash.slice(0, 8), 16) % numBuckets;
  return bucket.toString();
}

/**
 * Computes the cosine similarity between two embeddings.
 * @param {number[]} embeddingA - First embedding.
 * @param {number[]} embeddingB - Second embedding.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(embeddingA, embeddingB) {
  if (
    !Array.isArray(embeddingA) ||
    !Array.isArray(embeddingB) ||
    embeddingA.length !== embeddingB.length ||
    embeddingA.some(isNaN) ||
    embeddingB.some(isNaN)
  ) {
    throw new Error('Both embeddings must be arrays of equal length containing numbers.');
  }

  const dotProduct = embeddingA.reduce((sum, val, i) => sum + val * embeddingB[i], 0);
  const magnitudeA = Math.sqrt(embeddingA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(embeddingB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Builds an in-memory index for fast approximate nearest neighbor search.
 * @param {Array<{ id, embedding}>} data - Array of objects with id and embedding.
 * @param {number} numBuckets - Number of hash buckets.
 * @returns {Object} - Index object for searching.
 */
export function buildEmbeddingIndex(data, numBuckets) {
  if (!Array.isArray(data) || data.some((item) => !item.id || !Array.isArray(item.embedding))) {
    throw new Error('Data must be an array of objects with id and embedding.');
  }

  const index = {};

  for (const { id, embedding } of data) {
    const bucket = generateLSHHash(embedding, numBuckets);
    if (!index[bucket]) {
      index[bucket] = [];
    }
    index[bucket].push({ id, embedding });
  }

  return index;
}

/**
 * Searches for the nearest neighbors of a given embedding in the index.
 * @param {number[]} queryEmbedding - Embedding to search for.
 * @param {Object} index - Index object built by buildEmbeddingIndex.
 * @param {number} numBuckets - Number of hash buckets.
 * @param {number} topK - Number of nearest neighbors to return.
 * @returns {Array<{ id, similarity}>} - Top-K nearest neighbors.
 */
export function searchNearestNeighbors(queryEmbedding, index, numBuckets, topK) {
  if (!Array.isArray(queryEmbedding) || queryEmbedding.some(isNaN)) {
    throw new Error('Query embedding must be an array of numbers.');
  }
  if (typeof topK !== 'number' || topK <= 0) {
    throw new Error('topK must be a positive integer.');
  }

  const bucket = generateLSHHash(queryEmbedding, numBuckets);
  const candidates = index[bucket] || [];

  const similarities = candidates.map(({ id, embedding }) => ({
    id,
    similarity: cosineSimilarity(queryEmbedding, embedding)
  }));

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Example usage:
 * const data = [
 *   { id: '1', embedding: [0.1, 0.2, 0.3] },
 *   { id: '2', embedding: [0.4, 0.5, 0.6] },
 * ];
 * const index = buildEmbeddingIndex(data, 10);
 * const neighbors = searchNearestNeighbors([0.1, 0.2, 0.3], index, 10, 1);
 * console.log(neighbors);
 */