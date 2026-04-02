/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveEmbeddingAugmentor
 * Written: 2026-04-02T15:13:11.181Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveEmbeddingAugmentor.mjs

import { createHash } from 'crypto';

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity value.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
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
 * Performs weighted averaging of two embeddings.
 * @param {number[]} embeddingA - First embedding.
 * @param {number[]} embeddingB - Second embedding.
 * @param {number} weightA - Weight for first embedding.
 * @param {number} weightB - Weight for second embedding.
 * @returns {number[]} - Blended embedding.
 */
export function weightedAverage(embeddingA, embeddingB, weightA, weightB) {
  if (embeddingA.length !== embeddingB.length) {
    throw new Error('Embeddings must be of the same length');
  }

  const totalWeight = weightA + weightB;
  if (totalWeight === 0) {
    throw new Error('Total weight must be greater than zero');
  }

  return embeddingA.map((val, i) => (val * weightA + embeddingB[i] * weightB) / totalWeight);
}

/**
 * Augments conversational output by blending external embeddings.
 * @param {number[]} internalEmbedding - OMNIMENS's internal embedding.
 * @param {number[]} externalEmbedding - External embedding.
 * @param {number} similarityThreshold - Minimum cosine similarity to blend.
 * @returns {number[]} - Augmented embedding.
 */
export function augmentEmbedding(internalEmbedding, externalEmbedding, similarityThreshold = 0.7) {
  const similarity = cosineSimilarity(internalEmbedding, externalEmbedding);

  if (similarity < similarityThreshold) {
    return internalEmbedding; // Return internal embedding unchanged
  }

  // Blend embeddings with similarity as the weight for external
  return weightedAverage(internalEmbedding, externalEmbedding, 1 - similarity, similarity);
}

/**
 * Generates a deterministic hash for an embedding (useful for caching).
 * @param {number[]} embedding - Input embedding.
 * @returns {string} - Hexadecimal hash string.
 */
export function hashEmbedding(embedding) {
  const hash = createHash('sha256');
  hash.update(embedding.join(','));
  return hash.digest('hex');
}

/**
 * Validates embedding format.
 * @param {number[]} embedding - Input embedding.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateEmbedding(embedding) {
  return Array.isArray(embedding) && embedding.every(val => typeof val === 'number');
}

/**
 * Normalizes an embedding to unit length.
 * @param {number[]} embedding - Input embedding.
 * @returns {number[]} - Normalized embedding.
 */
export function normalizeEmbedding(embedding) {
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }
  return embedding.map(val => val / magnitude);
}