/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: slidingContextSummarizer
 * Written: 2026-04-01T22:11:02.595Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// slidingContextSummarizer.mjs

import { createHash } from 'crypto';

/**
 * Generates a compact embedding by hashing and summarizing older context.
 * @param {string[]} tokens - Array of strings representing older tokens.
 * @param {number} embeddingSize - Desired size of the embedding.
 * @returns {Float32Array} - Compact embedding as a fixed-size array of floats.
 */
export function generateEmbedding(tokens, embeddingSize = 128) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new Error("Tokens must be a non-empty array of strings.");
  }

  if (typeof embeddingSize !== 'number' || embeddingSize <= 0) {
    throw new Error("Embedding size must be a positive number.");
  }

  const hash = createHash('sha256');
  for (const token of tokens) {
    if (typeof token !== 'string') {
      throw new Error("All tokens must be strings.");
    }
    hash.update(token);
  }

  const hashBuffer = hash.digest();
  const embedding = new Float32Array(embeddingSize);

  for (let i = 0; i < embeddingSize; i++) {
    embedding[i] = hashBuffer[i % hashBuffer.length] / 255.0; // Normalize to [0, 1]
  }

  return embedding;
}

/**
 * Summarizes older context into a single string for embedding generation.
 * @param {string[]} tokens - Array of strings representing older tokens.
 * @param {number} maxLength - Maximum length of the summarized string.
 * @returns {string} - Summarized context as a single string.
 */
export function summarizeContext(tokens, maxLength = 512) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new Error("Tokens must be a non-empty array of strings.");
  }

  if (typeof maxLength !== 'number' || maxLength <= 0) {
    throw new Error("Max length must be a positive number.");
  }

  const concatenated = tokens.join(' ');
  return concatenated.length > maxLength
    ? concatenated.slice(0, maxLength)
    : concatenated;
}

/**
 * Main function to process older context and produce a reusable embedding.
 * @param {string[]} tokens - Array of strings representing older tokens.
 * @param {number} embeddingSize - Desired size of the embedding.
 * @param {number} maxLength - Maximum length for context summarization.
 * @returns {Float32Array} - Compact embedding as a fixed-size array of floats.
 */
export function processContext(tokens, embeddingSize = 128, maxLength = 512) {
  const summarizedContext = summarizeContext(tokens, maxLength);
  return generateEmbedding([summarizedContext], embeddingSize);
}

/**
 * Utility function to compare two embeddings using cosine similarity.
 * @param {Float32Array} embeddingA - First embedding.
 * @param {Float32Array} embeddingB - Second embedding.
 * @returns {number} - Cosine similarity between the two embeddings.
 */
export function cosineSimilarity(embeddingA, embeddingB) {
  if (embeddingA.length !== embeddingB.length) {
    throw new Error("Embeddings must have the same length.");
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

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}
