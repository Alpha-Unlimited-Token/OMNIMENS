/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-02T20:35:11.458Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// inMemoryVectorStore.mjs

import { createHash } from 'crypto';

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length.');
  }

  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero.
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Generates a unique hash key for a vector.
 * @param {number[]} vector - Input vector.
 * @returns {string} - Hash key.
 */
export function generateVectorKey(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * In-memory storage for vector embeddings.
 */
const vectorStore = new Map();

/**
 * Adds a vector to the store.
 * @param {number[]} vector - Vector to store.
 * @param {string} metadata - Metadata associated with the vector.
 */
export function addVector(vector, metadata) {
  const key = generateVectorKey(vector);
  vectorStore.set(key, { vector, metadata });
}

/**
 * Finds the most similar vector in the store to a given query vector.
 * @param {number[]} queryVector - Query vector.
 * @param {number} topK - Number of top results to return.
 * @returns {Array<{vector, metadata, similarity}>} - Top K similar vectors.
 */
export function findNearestNeighbors(queryVector, topK = 1) {
  if (vectorStore.size === 0) {
    throw new Error('Vector store is empty.');
  }

  const similarities = [];

  for (const [key, { vector, metadata }] of vectorStore.entries()) {
    const similarity = cosineSimilarity(queryVector, vector);
    similarities.push({ vector, metadata, similarity });
  }

  similarities.sort((a, b) => b.similarity - a.similarity);

  return similarities.slice(0, topK);
}

/**
 * Clears all vectors from the store.
 */
export function clearVectorStore() {
  vectorStore.clear();
}

/**
 * Returns the current size of the vector store.
 * @returns {number} - Number of vectors in the store.
 */
export function getVectorStoreSize() {
  return vectorStore.size;
}