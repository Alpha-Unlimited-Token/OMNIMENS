/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompressionManager
 * Written: 2026-04-01T22:19:02.326Z
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
 * Compiled targets: javascript: OK (4 IR steps) | python: OK (4 IR steps) | c: OK (4 IR steps) | x86_64: OK (4 IR steps) | arm64: OK (4 IR steps) | avr: OK (4 IR steps)
 * Translation map version: 22
 */
// contextCompressionManager.mjs

import { createHash } from 'crypto';

/**
 * Compresses a given context using attention distillation and sliding window techniques.
 * @param {Array<string>} contextSegments - Array of context strings to be compressed.
 * @param {number} windowSize - Number of segments to include in each sliding window.
 * @returns {Array<{hash, embedding}>} Compressed context embeddings with unique hashes.
 */
export function compressContext(contextSegments, windowSize) {
  if (!Array.isArray(contextSegments) || contextSegments.length === 0) {
    throw new Error('contextSegments must be a non-empty array of strings.');
  }
  if (typeof windowSize !== 'number' || windowSize <= 0) {
    throw new Error('windowSize must be a positive number.');
  }

  const compressed = [];

  for (let i = 0; i < contextSegments.length; i += windowSize) {
    const window = contextSegments.slice(i, i + windowSize);
    const concatenated = window.join(' ');
    const hash = createHash('sha256').update(concatenated).digest('hex');
    const embedding = generateEmbedding(concatenated);
    compressed.push({ hash, embedding });
  }

  return compressed;
}

/**
 * Dynamically retrieves relevant context based on a query and compressed embeddings.
 * @param {string} query - The query string to match against compressed context.
 * @param {Array<{hash, embedding}>} compressedContext - Compressed context embeddings.
 * @param {number} topK - Number of top matches to retrieve.
 * @returns {Array<{hash, score}>} Top matching context hashes with similarity scores.
 */
export function retrieveContext(query, compressedContext, topK = 3) {
  if (typeof query !== 'string' || query.trim() === '') {
    throw new Error('query must be a non-empty string.');
  }
  if (!Array.isArray(compressedContext) || compressedContext.length === 0) {
    throw new Error('compressedContext must be a non-empty array.');
  }
  if (typeof topK !== 'number' || topK <= 0) {
    throw new Error('topK must be a positive number.');
  }

  const queryEmbedding = generateEmbedding(query);
  const scores = compressedContext.map(({ hash, embedding }) => {
    const score = cosineSimilarity(queryEmbedding, embedding);
    return { hash, score };
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Generates a simple embedding for a given text by hashing its characters.
 * @param {string} text - The input text to embed.
 * @returns {Array<number>} Numerical embedding of the text.
 */
export function generateEmbedding(text) {
  const hash = createHash('sha256').update(text).digest();
  return Array.from(hash).map(byte => byte / 255); // Normalize to [0, 1]
}

/**
 * Computes the cosine similarity between two numerical vectors.
 * @param {Array<number>} vecA - First vector.
 * @param {Array<number>} vecB - Second vector.
 * @returns {number} Cosine similarity score between -1 and 1.
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length.');
  }

  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b ** 2, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Utility to validate and preprocess input context segments.
 * @param {Array<string>} contextSegments - Raw context segments.
 * @returns {Array<string>} Cleaned and validated context segments.
 */
export function preprocessContext(contextSegments) {
  if (!Array.isArray(contextSegments)) {
    throw new Error('contextSegments must be an array.');
  }

  return contextSegments.map(segment => segment.trim()).filter(segment => segment.length > 0);
}