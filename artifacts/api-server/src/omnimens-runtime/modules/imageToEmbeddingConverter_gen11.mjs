/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: imageToEmbeddingConverter
 * Written: 2026-04-02T14:10:22.747Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// imageToEmbeddingConverter.mjs

import { createHash } from 'crypto';

/**
 * Hashes input data to simulate feature extraction (stand-in for CNN feature extraction).
 * @param {Uint8Array} imageData - Raw image data as a byte array.
 * @returns {number[]} - A fixed-length feature vector (512-dim).
 */
export function extractImageFeatures(imageData) {
  const hash = createHash('sha256');
  hash.update(imageData);
  const digest = hash.digest();

  // Map hash output to a 512-dimensional feature vector
  const features = new Array(512).fill(0).map((_, i) => {
    const byteIndex = i % digest.length;
    return digest[byteIndex] / 255; // Normalize to [0, 1]
  });

  return features;
}

/**
 * Applies Principal Component Analysis (PCA) to reduce dimensionality.
 * @param {number[]} features - High-dimensional feature vector.
 * @param {number} targetDim - Target dimensionality (default: 512).
 * @returns {number[]} - Reduced feature vector.
 */
export function applyPCA(features, targetDim = 512) {
  const mean = features.reduce((sum, val) => sum + val, 0) / features.length;
  const centered = features.map(val => val - mean);

  // Simulate PCA by selecting the first `targetDim` components
  return centered.slice(0, targetDim);
}

/**
 * Converts an image into a 512-dimensional embedding.
 * @param {Uint8Array} imageData - Raw image data as a byte array.
 * @returns {number[]} - 512-dimensional embedding.
 */
export function imageToEmbedding(imageData) {
  const features = extractImageFeatures(imageData);
  const embedding = applyPCA(features, 512);
  return embedding;
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  return magnitude === 0 ? vector : vector.map(val => val / magnitude);
}

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
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  return magnitudeA === 0 || magnitudeB === 0 ? 0 : dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Generates a random 512-dimensional embedding for testing purposes.
 * @returns {number[]} - Random 512-dimensional embedding.
 */
export function generateRandomEmbedding() {
  return new Array(512).fill(0).map(() => Math.random());
}
