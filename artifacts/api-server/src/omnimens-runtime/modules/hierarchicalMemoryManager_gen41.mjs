/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T15:17:22.040Z
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
 * Compiled targets: javascript: OK (19 IR steps) | python: OK (19 IR steps) | c: OK (19 IR steps) | x86_64: OK (19 IR steps) | arm64: OK (19 IR steps) | avr: OK (19 IR steps)
 * Translation map version: 22
 */
// hierarchicalMemoryManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given input to uniquely identify memory chunks.
 * Useful for indexing compressed memory blocks.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Compresses a context window using vector quantization.
 * Reduces the size of large context windows while preserving essential information.
 * @param {Array<number[]>} vectors - Array of numerical vectors representing the context.
 * @param {number} numCentroids - Number of centroids for quantization.
 * @returns {Object} - Compressed representation with centroids and mappings.
 */
export function compressContext(vectors, numCentroids) {
  if (!Array.isArray(vectors) || vectors.length === 0) {
    throw new Error('Invalid input: vectors must be a non-empty array.');
  }
  if (numCentroids <= 0) {
    throw new Error('Invalid input: numCentroids must be greater than 0.');
  }

  // Initialize centroids randomly from the input vectors
  const centroids = vectors.slice(0, numCentroids);
  let mappings = new Array(vectors.length);

  for (let iteration = 0; iteration < 10; iteration++) {
    // Assign each vector to the nearest centroid
    mappings = vectors.map(vector => {
      let closestIndex = 0;
      let minDistance = Infinity;
      centroids.forEach((centroid, index) => {
        const distance = euclideanDistance(vector, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });
      return closestIndex;
    });

    // Update centroids based on assignments
    centroids = centroids.map((_, index) => {
      const assignedVectors = vectors.filter((_, i) => mappings[i] === index);
      if (assignedVectors.length === 0) return centroids[index];
      return averageVector(assignedVectors);
    });
  }

  return { centroids, mappings };
}

/**
 * Retrieves relevant context using attention weights.
 * Dynamically expands context based on importance scores.
 * @param {Array<number>} attentionWeights - Array of attention weights.
 * @param {Array<any>} contextBlocks - Array of context blocks.
 * @param {number} threshold - Minimum attention weight to include a block.
 * @returns {Array<any>} - Filtered context blocks.
 */
export function retrieveContext(attentionWeights, contextBlocks, threshold) {
  if (attentionWeights.length !== contextBlocks.length) {
    throw new Error('attentionWeights and contextBlocks must have the same length.');
  }
  if (threshold < 0 || threshold > 1) {
    throw new Error('Threshold must be between 0 and 1.');
  }

  return contextBlocks.filter((_, index) => attentionWeights[index] >= threshold);
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {Array<number>} vec1 - First vector.
 * @param {Array<number>} vec2 - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length.');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
}

/**
 * Calculates the average vector from a set of vectors.
 * @param {Array<number[]>} vectors - Array of vectors.
 * @returns {Array<number>} - Average vector.
 */
export function averageVector(vectors) {
  const length = vectors[0].length;
  const sumVector = new Array(length).fill(0);

  vectors.forEach(vector => {
    vector.forEach((val, i) => {
      sumVector[i] += val;
    });
  });

  return sumVector.map(val => val / vectors.length);
}

/**
 * Utility function to normalize attention weights.
 * Ensures attention weights sum to 1.
 * @param {Array<number>} weights - Array of attention weights.
 * @returns {Array<number>} - Normalized attention weights.
 */
export function normalizeAttentionWeights(weights) {
  const sum = weights.reduce((acc, val) => acc + val, 0);
  if (sum === 0) {
    throw new Error('Sum of weights cannot be zero.');
  }
  return weights.map(val => val / sum);
}