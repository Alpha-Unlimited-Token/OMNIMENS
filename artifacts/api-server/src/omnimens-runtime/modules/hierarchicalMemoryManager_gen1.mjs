/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-03T09:44:29.648Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemoryManager.mjs

import { createHash } from 'crypto';

/**
 * Hashes a string to create a unique, fixed-length identifier.
 * Useful for creating keys for memory segments.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input string.
 */
export function hashString(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Clusters memory entries based on thematic similarity using vector similarity.
 * @param {Array<{ id, vector, data}>} memoryEntries - Array of memory entries with vectors.
 * @param {Array<number>} queryVector - The vector to compare against.
 * @param {number} threshold - Minimum similarity score to consider relevant.
 * @returns {Array<{ id, similarity, data}>} - Sorted array of relevant entries.
 */
export function retrieveRelevantMemory(memoryEntries, queryVector, threshold = 0.7) {
  if (!Array.isArray(memoryEntries) || !Array.isArray(queryVector)) {
    throw new TypeError('Both memoryEntries and queryVector must be arrays.');
  }

  // Normalize a vector to unit length
  const normalize = (vector) => {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
    return vector.map((val) => val / magnitude);
  };

  // Compute cosine similarity between two vectors
  const cosineSimilarity = (vecA, vecB) => {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must be of the same length.');
    }
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a ** 2, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b ** 2, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  };

  const normalizedQuery = normalize(queryVector);

  return memoryEntries
    .map((entry) => {
      const similarity = cosineSimilarity(normalize(entry.vector), normalizedQuery);
      return { id: entry.id, similarity, data: entry.data };
    })
    .filter((entry) => entry.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);
}

/**
 * Segments long-term memory into thematic clusters based on hashed keys.
 * @param {Array<{ id, data}>} rawMemory - Array of raw memory entries.
 * @param {function(string): Array<number>} vectorizer - Function to convert data into a vector representation.
 * @returns {Array<{ id, vector, data}>} - Segmented memory entries with vectors.
 */
export function segmentMemory(rawMemory, vectorizer) {
  if (!Array.isArray(rawMemory)) {
    throw new TypeError('rawMemory must be an array.');
  }
  if (typeof vectorizer !== 'function') {
    throw new TypeError('vectorizer must be a function.');
  }

  return rawMemory.map((entry) => {
    const vector = vectorizer(entry.data);
    if (!Array.isArray(vector)) {
      throw new Error('Vectorizer function must return an array.');
    }
    return {
      id: hashString(entry.id),
      vector,
      data: entry.data
    };
  });
}

/**
 * Utility to dynamically manage hierarchical memory retrieval.
 * Combines segmentation and retrieval for dynamic context management.
 * @param {Array<{ id, data}>} rawMemory - Raw memory entries.
 * @param {function(string): Array<number>} vectorizer - Function to vectorize memory data.
 * @param {Array<number>} queryVector - Query vector for relevance search.
 * @param {number} threshold - Minimum similarity score for relevance.
 * @returns {Array<{ id, similarity, data}>} - Relevant memory entries.
 */
export function manageMemory(rawMemory, vectorizer, queryVector, threshold = 0.7) {
  const segmentedMemory = segmentMemory(rawMemory, vectorizer);
  return retrieveRelevantMemory(segmentedMemory, queryVector, threshold);
}
