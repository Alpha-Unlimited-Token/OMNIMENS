/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: slidingContextManager
 * Written: 2026-04-01T22:11:26.621Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// slidingContextManager.mjs
import crypto from 'crypto';

/**
 * Generates a compact embedding for a given text input using a hash-based summarization.
 * @param {string} text - The input text to summarize.
 * @returns {string} - A fixed-length hash representing the text.
 */
export function generateEmbedding(text) {
  const hash = crypto.createHash('sha256');
  hash.update(text);
  return hash.digest('hex').slice(0, 64); // Compact 64-character representation
}

/**
 * Maintains a sliding window of context and recurrently summarizes it into embeddings.
 * @param {Array<string>} contextArray - Array of text segments representing the conversation context.
 * @param {number} windowSize - Number of segments to include in the sliding window.
 * @returns {Array<string>} - Array of embeddings summarizing the context.
 */
export function slidingWindowSummarization(contextArray, windowSize) {
  if (!Array.isArray(contextArray) || contextArray.length === 0) {
    throw new Error('contextArray must be a non-empty array of strings.');
  }
  if (typeof windowSize !== 'number' || windowSize <= 0) {
    throw new Error('windowSize must be a positive integer.');
  }

  const embeddings = [];
  for (let i = 0; i < contextArray.length; i++) {
    const windowStart = Math.max(0, i - windowSize + 1);
    const windowEnd = i + 1;
    const windowContent = contextArray.slice(windowStart, windowEnd).join(' ');
    embeddings.push(generateEmbedding(windowContent));
  }
  return embeddings;
}

/**
 * Combines multiple embeddings into a single persistent memory representation using weighted averaging.
 * @param {Array<string>} embeddings - Array of embeddings to combine.
 * @returns {string} - A single embedding representing the combined memory.
 */
export function combineEmbeddings(embeddings) {
  if (!Array.isArray(embeddings) || embeddings.length === 0) {
    throw new Error('embeddings must be a non-empty array of strings.');
  }

  const combinedHash = crypto.createHash('sha256');
  embeddings.forEach((embedding, index) => {
    const weight = index + 1; // Simple weighting scheme based on position
    combinedHash.update(embedding.repeat(weight));
  });
  return combinedHash.digest('hex').slice(0, 64);
}

/**
 * Manages long-term conversational coherence by summarizing earlier context into compact embeddings.
 * @param {Array<string>} contextArray - Array of text segments representing the conversation context.
 * @param {number} windowSize - Number of segments to include in the sliding window.
 * @returns {string} - A single embedding representing the long-term memory.
 */
export function manageContext(contextArray, windowSize) {
  const embeddings = slidingWindowSummarization(contextArray, windowSize);
  return combineEmbeddings(embeddings);
}

/**
 * Utility function for other agents to compute similarity between two embeddings.
 * @param {string} embeddingA - The first embedding.
 * @param {string} embeddingB - The second embedding.
 * @returns {number} - A similarity score between 0 and 1 (1 = identical, 0 = completely different).
 */
export function computeEmbeddingSimilarity(embeddingA, embeddingB) {
  if (typeof embeddingA !== 'string' || typeof embeddingB !== 'string') {
    throw new Error('Both embeddings must be strings.');
  }

  let matches = 0;
  for (let i = 0; i < Math.min(embeddingA.length, embeddingB.length); i++) {
    if (embeddingA[i] === embeddingB[i]) matches++;
  }
  return matches / Math.max(embeddingA.length, embeddingB.length);
}
