/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T13:36:20.505Z
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
 * Generates a hash for a given string to ensure unique topic identifiers.
 * @param {string} input - The input string to hash.
 * @returns {string} - The hashed string.
 */
export function generateTopicHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Calculates cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Creates a dynamic hierarchical memory structure for context preservation.
 * @returns {object} - Memory manager instance.
 */
export function createMemoryManager() {
  const memory = new Map();

  /**
   * Adds or updates a memory entry based on topic relevance.
   * @param {string} topic - Topic identifier.
   * @param {string} content - Context information.
   * @param {number[]} vector - Numerical representation of the content.
   */
  function addMemory(topic, content, vector) {
    const topicHash = generateTopicHash(topic);
    const existing = memory.get(topicHash);

    if (existing) {
      const similarity = cosineSimilarity(existing.vector, vector);
      if (similarity > 0.8) {
        existing.content.push(content);
        existing.recency = Date.now();
      } else {
        memory.set(topicHash, {
          content: [content],
          vector,
          recency: Date.now()
        });
      }
    } else {
      memory.set(topicHash, {
        content: [content],
        vector,
        recency: Date.now()
      });
    }
  }

  /**
   * Retrieves the most relevant memory entries for a given topic.
   * @param {string} topic - Topic identifier.
   * @param {number[]} vector - Numerical representation of the query.
   * @returns {Array} - Sorted list of relevant memory entries.
   */
  function retrieveMemory(topic, vector) {
    const topicHash = generateTopicHash(topic);
    const entries = Array.from(memory.values());

    return entries
      .map(entry => ({
        content: entry.content,
        score: cosineSimilarity(entry.vector, vector),
        recency: entry.recency
      }))
      .filter(entry => entry.score > 0.5)
      .sort((a, b) => b.score - a.score || b.recency - a.recency);
  }

  /**
   * Clears memory entries older than a given threshold.
   * @param {number} ageThreshold - Maximum age in milliseconds.
   */
  function clearOldMemory(ageThreshold) {
    const now = Date.now();
    for (const [key, entry] of memory.entries()) {
      if (now - entry.recency > ageThreshold) {
        memory.delete(key);
      }
    }
  }

  return {
    addMemory,
    retrieveMemory,
    clearOldMemory
  };
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude ? vector.map(val => val / magnitude) : vector;
}

/**
 * Utility function to create a random vector for testing purposes.
 * @param {number} length - Length of the vector.
 * @returns {number[]} - Random vector.
 */
export function createRandomVector(length) {
  return Array.from({ length }, () => Math.random());
}

/**
 * Example usage of the hierarchicalMemoryManager module.
 */
export function exampleUsage() {
  const manager = createMemoryManager();

  const topic = "neural networks";
  const content = "Transformers are powerful architectures for AI.";
  const vector = normalizeVector([0.9, 0.1, 0.4, 0.7]);

  manager.addMemory(topic, content, vector);

  const queryVector = normalizeVector([0.8, 0.2, 0.5, 0.6]);
  const results = manager.retrieveMemory(topic, queryVector);

  console.log("Relevant memories:", results);
}

exampleUsage();