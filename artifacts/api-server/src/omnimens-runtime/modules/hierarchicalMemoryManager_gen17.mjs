/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T14:11:25.230Z
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
 * Compiled targets: javascript: OK (1 IR steps) | python: OK (1 IR steps) | c: OK (1 IR steps) | x86_64: OK (1 IR steps) | arm64: OK (1 IR steps) | avr: OK (1 IR steps)
 * Translation map version: 22
 */
// hierarchicalMemoryManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given input string (used for memory keys).
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Calculates cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Retrieves the top-k most similar vectors from memory.
 * @param {Object} memory - The memory object containing vector keys and their associated data.
 * @param {number[]} queryVector - The query vector to compare against.
 * @param {number} k - Number of top results to retrieve.
 * @returns {Array} - Array of the top-k memory entries sorted by similarity.
 */
export function retrieveTopK(memory, queryVector, k) {
  const similarities = Object.entries(memory).map(([key, { vector }]) => ({
    key,
    similarity: cosineSimilarity(queryVector, vector)
  }));

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k)
    .map(({ key }) => ({ key, ...memory[key] }));
}

/**
 * Compresses a sequence of vectors into a single summary vector.
 * @param {number[][]} vectors - Array of vectors to compress.
 * @returns {number[]} - Compressed summary vector.
 */
export function compressVectors(vectors) {
  const length = vectors[0].length;
  const sumVector = Array(length).fill(0);

  vectors.forEach(vec => {
    vec.forEach((value, i) => {
      sumVector[i] += value;
    });
  });

  return sumVector.map(value => value / vectors.length);
}

/**
 * Expands a compressed summary vector into detailed information using a transformer-like mechanism.
 * @param {number[]} summaryVector - The compressed summary vector.
 * @param {Function} expansionFunction - A user-defined function to expand the vector.
 * @returns {Object} - Expanded detailed information.
 */
export function expandSummary(summaryVector, expansionFunction) {
  return expansionFunction(summaryVector);
}

/**
 * Hierarchical memory manager class.
 * Combines vector-based retrieval with hierarchical attention over compressed states.
 */
export class HierarchicalMemoryManager {
  constructor() {
    this.memory = {}; // Stores memory entries with keys, vectors, and data.
  }

  /**
   * Adds a new memory entry.
   * @param {string} key - Unique identifier for the memory entry.
   * @param {number[]} vector - Vector representation of the memory entry.
   * @param {Object} data - Associated data for the memory entry.
   */
  addMemory(key, vector, data) {
    this.memory[key] = { vector, data };
  }

  /**
   * Retrieves relevant memories based on a query vector.
   * @param {number[]} queryVector - The query vector to compare.
   * @param {number} k - Number of top results to retrieve.
   * @returns {Array} - Array of relevant memory entries.
   */
  retrieveRelevantMemories(queryVector, k) {
    return retrieveTopK(this.memory, queryVector, k);
  }

  /**
   * Compresses and stores a sequence of memories.
   * @param {Array} keys - Array of memory keys to compress.
   * @param {string} summaryKey - Key for the compressed memory.
   */
  compressMemories(keys, summaryKey) {
    const vectors = keys.map(key => this.memory[key]?.vector).filter(Boolean);
    if (vectors.length > 0) {
      const summaryVector = compressVectors(vectors);
      this.addMemory(summaryKey, summaryVector, { compressedKeys: keys });
    }
  }

  /**
   * Expands a compressed memory into detailed information.
   * @param {string} key - Key of the compressed memory to expand.
   * @param {Function} expansionFunction - A user-defined function to expand the vector.
   * @returns {Object} - Expanded detailed information.
   */
  expandCompressedMemory(key, expansionFunction) {
    const memory = this.memory[key];
    if (memory) {
      return expandSummary(memory.vector, expansionFunction);
    }
    return null;
  }
}

export const hierarchicalMemoryManager = new HierarchicalMemoryManager();