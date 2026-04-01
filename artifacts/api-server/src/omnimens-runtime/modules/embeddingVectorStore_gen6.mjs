/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: embeddingVectorStore
 * Written: 2026-04-01T22:08:59.455Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// embeddingVectorStore.mjs

import { createHash } from 'crypto';

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity value.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Vector magnitude cannot be zero.');
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Generates a unique hash key for an embedding vector.
 * @param {number[]} vector - Embedding vector.
 * @returns {string} - Hash key.
 */
export function generateVectorKey(vector) {
  const vectorString = vector.join(',');
  return createHash('sha256').update(vectorString).digest('hex');
}

/**
 * In-memory vector store for embeddings.
 */
export const vectorStore = {
  store: {},

  /**
   * Adds an embedding to the store.
   * @param {number[]} vector - Embedding vector.
   * @param {any} metadata - Associated metadata.
   */
  add(vector, metadata) {
    const key = generateVectorKey(vector);
    this.store[key] = { vector, metadata };
  },

  /**
   * Searches for the most similar embedding in the store.
   * @param {number[]} queryVector - Query embedding vector.
   * @returns {object|null} - Closest embedding and metadata, or null if store is empty.
   */
  search(queryVector) {
    let bestMatch = null;
    let highestSimilarity = -Infinity;

    for (const key in this.store) {
      const { vector, metadata } = this.store[key];
      const similarity = cosineSimilarity(queryVector, vector);

      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = { vector, metadata, similarity };
      }
    }

    return bestMatch;
  },

  /**
   * Clears the vector store.
   */
  clear() {
    this.store = {};
  },

  /**
   * Gets the total number of embeddings in the store.
   * @returns {number} - Count of embeddings.
   */
  count() {
    return Object.keys(this.store).length;
  }
};

/**
 * Normalizes a vector to unit length.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return vector.map(val => val / magnitude);
}