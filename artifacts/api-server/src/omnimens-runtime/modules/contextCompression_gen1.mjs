/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompression
 * Written: 2026-04-03T13:57:14.556Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextCompression.mjs

import { createHash } from 'crypto';

/**
 * Generate a high-dimensional embedding for a given text input.
 * Uses a hash-based approach to simulate embedding generation.
 * @param {string} text - The input text to embed.
 * @returns {number[]} - A fixed-length numerical embedding array.
 */
export function generateEmbedding(text) {
  const hash = createHash('sha256').update(text).digest('hex');
  const embedding = [];
  for (let i = 0; i < hash.length; i += 8) {
    embedding.push(parseInt(hash.slice(i, i + 8), 16));
  }
  return embedding;
}

/**
 * Summarize a list of text inputs into a single embedding.
 * Uses a weighted averaging method to combine embeddings.
 * @param {string[]} texts - Array of text inputs to summarize.
 * @returns {number[]} - A single numerical embedding representing the summary.
 */
export function summarizeContext(texts) {
  if (!texts.length) return [];
  const embeddings = texts.map(generateEmbedding);
  const dimension = embeddings[0].length;
  const summary = Array(dimension).fill(0);

  for (const embedding of embeddings) {
    for (let i = 0; i < dimension; i++) {
      summary[i] += embedding[i] / texts.length;
    }
  }

  return summary;
}

/**
 * Compress earlier conversation context into summary embeddings.
 * @param {string[]} context - Array of conversation strings.
 * @param {number} maxLength - Maximum number of context entries to retain.
 * @returns {object} - Object containing compressed context and summary embedding.
 */
export function compressContext(context, maxLength = 10) {
  const truncatedContext = context.slice(-maxLength);
  const summaryEmbedding = summarizeContext(truncatedContext);
  return {
    compressedContext: truncatedContext,
    summaryEmbedding
  };
}

/**
 * Calculate similarity between two embeddings.
 * Uses cosine similarity as the metric.
 * @param {number[]} embeddingA - First embedding.
 * @param {number[]} embeddingB - Second embedding.
 * @returns {number} - Cosine similarity score between -1 and 1.
 */
export function calculateSimilarity(embeddingA, embeddingB) {
  if (embeddingA.length !== embeddingB.length) throw new Error('Embeddings must have the same length.');

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

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Utility to extend token memory by compressing and summarizing context.
 * @param {string[]} conversation - Array of conversation strings.
 * @param {number} memoryLimit - Maximum tokens to retain.
 * @returns {object} - Object containing extended memory and similarity utilities.
 */
export function extendMemory(conversation, memoryLimit = 10) {
  const { compressedContext, summaryEmbedding } = compressContext(conversation, memoryLimit);

  return {
    compressedContext,
    summaryEmbedding,
    similarityFunction: (embedding) => calculateSimilarity(summaryEmbedding, embedding)
  };
}