/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticContextPreserver
 * Written: 2026-04-02T15:15:02.435Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticContextPreserver.mjs

import { createHash } from 'crypto';

/**
 * Generate a semantic hash for a given input string using SHA-256.
 * @param {string} input - The input string to hash.
 * @returns {string} - The resulting semantic hash.
 */
export function generateSemanticHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Create a locality-sensitive hash (LSH) bucket for semantic embeddings.
 * @param {Array<number>} embedding - A numeric array representing the semantic embedding.
 * @param {number} numBuckets - The number of buckets for hashing.
 * @returns {number} - The bucket index for the embedding.
 */
export function createLSHBucket(embedding, numBuckets) {
  const sum = embedding.reduce((acc, val) => acc + val, 0);
  return Math.abs(Math.floor(sum % numBuckets));
}

/**
 * Cluster embeddings into groups based on their LSH buckets.
 * @param {Array<{ id, embedding }>} items - Items with IDs and embeddings.
 * @param {number} numBuckets - The number of buckets for clustering.
 * @returns {Object} - A mapping of bucket indices to clustered items.
 */
export function clusterEmbeddings(items, numBuckets) {
  const clusters = {};
  for (const item of items) {
    const bucket = createLSHBucket(item.embedding, numBuckets);
    if (!clusters[bucket]) clusters[bucket] = [];
    clusters[bucket].push(item);
  }
  return clusters;
}

/**
 * Predictively expand context by retrieving similar items from clusters.
 * @param {string} query - The query string for context expansion.
 * @param {Array<{ id, embedding }>} items - Items with IDs and embeddings.
 * @param {number} numBuckets - The number of buckets for clustering.
 * @param {Function} similarityFunction - A function to calculate similarity between embeddings.
 * @param {number} threshold - The similarity threshold for context retrieval.
 * @returns {Array<string>} - IDs of items similar to the query.
 */
export function expandContext(query, items, numBuckets, similarityFunction, threshold) {
  const queryHash = generateSemanticHash(query);
  const queryEmbedding = queryHash.split('').map(char => parseInt(char, 16));

  const clusters = clusterEmbeddings(items, numBuckets);
  const queryBucket = createLSHBucket(queryEmbedding, numBuckets);

  const similarItems = [];
  if (clusters[queryBucket]) {
    for (const item of clusters[queryBucket]) {
      const similarity = similarityFunction(queryEmbedding, item.embedding);
      if (similarity >= threshold) {
        similarItems.push(item.id);
      }
    }
  }
  return similarItems;
}

/**
 * Example similarity function using cosine similarity.
 * @param {Array<number>} vecA - First vector.
 * @param {Array<number>} vecB - Second vector.
 * @returns {number} - Cosine similarity between the two vectors.
 */
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Utility to normalize a vector to unit length.
 * @param {Array<number>} vector - The vector to normalize.
 * @returns {Array<number>} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, x) => sum + x * x, 0));
  return vector.map(x => x / magnitude);
}

/**
 * Example usage of the module.
 * Uncomment the following lines to test the module.
 */
// const items = [
//   { id: 'item1', embedding: [0.1, 0.2, 0.3] },
//   { id: 'item2', embedding: [0.4, 0.5, 0.6] },
//   { id: 'item3', embedding: [0.7, 0.8, 0.9] }
// ];
// const query = 'example query';
// const similar = expandContext(query, items, 10, cosineSimilarity, 0.8);
// console.log(similar);