/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: slidingContextManager
 * Written: 2026-04-01T22:21:38.450Z
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

import { createHash } from 'crypto';

/**
 * Generates a fixed-size embedding for a given text using a simple hash-based approach.
 * @param {string} text - The input text to be embedded.
 * @param {number} size - The desired size of the embedding.
 * @returns {Float32Array} - The fixed-size embedding.
 */
export function generateEmbedding(text, size = 128) {
  const hash = createHash('sha256').update(text).digest();
  const embedding = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    embedding[i] = hash[i % hash.length] / 255;
  }
  return embedding;
}

/**
 * Calculates the cosine similarity between two embeddings.
 * @param {Float32Array} embeddingA - The first embedding.
 * @param {Float32Array} embeddingB - The second embedding.
 * @returns {number} - The cosine similarity (range: -1 to 1).
 */
export function cosineSimilarity(embeddingA, embeddingB) {
  if (embeddingA.length !== embeddingB.length) {
    throw new Error('Embeddings must be of the same length.');
  }
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < embeddingA.length; i++) {
    dotProduct += embeddingA[i] * embeddingB[i];
    magnitudeA += embeddingA[i] ** 2;
    magnitudeB += embeddingB[i] ** 2;
  }
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  return dotProduct / (magnitudeA * magnitudeB || 1);
}

/**
 * Summarizes older tokens into a single embedding while prioritizing recent and relevant tokens.
 * @param {Array<{ text, relevance}>} tokens - Array of tokens with relevance scores.
 * @param {number} embeddingSize - The size of the output embedding.
 * @returns {Float32Array} - The summarized embedding.
 */
export function summarizeContext(tokens, embeddingSize = 128) {
  const weightedEmbeddings = tokens.map(({ text, relevance }) => {
    const embedding = generateEmbedding(text, embeddingSize);
    return embedding.map(value => value * relevance);
  });

  const summaryEmbedding = new Float32Array(embeddingSize);
  for (const embedding of weightedEmbeddings) {
    for (let i = 0; i < embeddingSize; i++) {
      summaryEmbedding[i] += embedding[i];
    }
  }

  const magnitude = Math.sqrt(summaryEmbedding.reduce((sum, value) => sum + value ** 2, 0));
  return summaryEmbedding.map(value => value / (magnitude || 1));
}

/**
 * Manages a sliding window of context by summarizing older tokens into embeddings.
 * @param {Array<string>} context - The full conversation context as an array of strings.
 * @param {number} maxTokens - The maximum number of tokens to retain verbatim.
 * @param {number} embeddingSize - The size of the summarized embedding for older tokens.
 * @returns {{ recent, summary}} - The managed context.
 */
export function slidingContextManager(context, maxTokens = 50, embeddingSize = 128) {
  if (context.length <= maxTokens) {
    return { recent: context, summary: new Float32Array(embeddingSize) };
  }

  const recent = context.slice(-maxTokens);
  const olderTokens = context.slice(0, -maxTokens).map(text => ({ text, relevance: 1 }));
  const summary = summarizeContext(olderTokens, embeddingSize);

  return { recent, summary };
}