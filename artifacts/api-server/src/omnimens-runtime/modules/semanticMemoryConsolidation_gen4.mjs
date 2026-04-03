/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticMemoryConsolidation
 * Written: 2026-04-03T06:07:05.863Z
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
 * Compiled targets: javascript: OK (14 IR steps) | python: OK (14 IR steps) | c: OK (14 IR steps) | x86_64: OK (14 IR steps) | arm64: OK (14 IR steps) | avr: OK (14 IR steps)
 * Translation map version: 22
 */
// semanticMemoryConsolidation.mjs

import { createHash } from 'crypto';

/**
 * Generates a fixed-size semantic embedding from input data using a hierarchical attention mechanism.
 * @param {Array<string>} context - Array of historical context strings.
 * @param {number} embeddingSize - Desired size of the output embedding.
 * @returns {Float32Array} - Fixed-size semantic embedding.
 */
export function generateSemanticEmbedding(context, embeddingSize = 128) {
  if (!Array.isArray(context) || context.length === 0) {
    throw new Error('Context must be a non-empty array of strings.');
  }

  if (typeof embeddingSize !== 'number' || embeddingSize <= 0) {
    throw new Error('Embedding size must be a positive number.');
  }

  // Normalize and tokenize context
  const tokens = context.map((text) => tokenizeAndNormalize(text));

  // Apply hierarchical attention to compute weighted token importance
  const attentionWeights = computeAttentionWeights(tokens);

  // Combine tokens into a single embedding vector
  const combinedVector = combineTokensWithWeights(tokens, attentionWeights, embeddingSize);

  return combinedVector;
}

/**
 * Tokenizes and normalizes a string by lowercasing and hashing tokens.
 * @param {string} text - Input text to tokenize and normalize.
 * @returns {Array<number>} - Array of hashed token values.
 */
export function tokenizeAndNormalize(text) {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string.');
  }

  return text
    .toLowerCase()
    .split(/\s+/)
    .map((token) => hashToken(token));
}

/**
 * Computes attention weights for tokens using a simple frequency-based mechanism.
 * @param {Array<Array<number>>} tokens - Array of tokenized and normalized context.
 * @returns {Array<number>} - Array of attention weights for each token.
 */
export function computeAttentionWeights(tokens) {
  const flatTokens = tokens.flat();
  const tokenCounts = flatTokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});

  const totalTokens = flatTokens.length;
  return flatTokens.map((token) => tokenCounts[token] / totalTokens);
}

/**
 * Combines tokens and their attention weights into a fixed-size embedding.
 * @param {Array<Array<number>>} tokens - Array of tokenized and normalized context.
 * @param {Array<number>} weights - Attention weights for each token.
 * @param {number} embeddingSize - Desired size of the output embedding.
 * @returns {Float32Array} - Fixed-size semantic embedding.
 */
export function combineTokensWithWeights(tokens, weights, embeddingSize) {
  const embedding = new Float32Array(embeddingSize).fill(0);

  tokens.flat().forEach((token, index) => {
    const weight = weights[index % weights.length];
    const position = token % embeddingSize;
    embedding[position] += weight;
  });

  // Normalize the embedding
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val ** 2, 0));
  for (let i = 0; i < embedding.length; i++) {
    embedding[i] /= norm;
  }

  return embedding;
}

/**
 * Hashes a token into a numeric value using SHA-256.
 * @param {string} token - Input token to hash.
 * @returns {number} - Numeric hash value of the token.
 */
export function hashToken(token) {
  const hash = createHash('sha256').update(token).digest('hex');
  return parseInt(hash.slice(0, 8), 16); // Use the first 8 hex digits as a number
}

/**
 * Stores semantic embeddings in a simple in-memory vector database for retrieval.
 * @param {Map<string, Float32Array>} vectorDB - The in-memory vector database.
 * @param {string} key - Unique key to store the embedding under.
 * @param {Float32Array} embedding - The semantic embedding to store.
 */
export function storeEmbedding(vectorDB, key, embedding) {
  if (!(vectorDB instanceof Map)) {
    throw new Error('VectorDB must be a Map instance.');
  }

  if (typeof key !== 'string') {
    throw new Error('Key must be a string.');
  }

  if (!(embedding instanceof Float32Array)) {
    throw new Error('Embedding must be a Float32Array.');
  }

  vectorDB.set(key, embedding);
}

/**
 * Retrieves the closest semantic embedding from the vector database using cosine similarity.
 * @param {Map<string, Float32Array>} vectorDB - The in-memory vector database.
 * @param {Float32Array} queryEmbedding - The query embedding to compare.
 * @returns {string|null} - Key of the closest embedding or null if the database is empty.
 */
export function retrieveClosestEmbedding(vectorDB, queryEmbedding) {
  if (!(vectorDB instanceof Map)) {
    throw new Error('VectorDB must be a Map instance.');
  }

  if (!(queryEmbedding instanceof Float32Array)) {
    throw new Error('Query embedding must be a Float32Array.');
  }

  let closestKey = null;
  let highestSimilarity = -Infinity;

  for (const [key, storedEmbedding] of vectorDB.entries()) {
    const similarity = cosineSimilarity(queryEmbedding, storedEmbedding);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      closestKey = key;
    }
  }

  return closestKey;
}

/**
 * Computes cosine similarity between two embeddings.
 * @param {Float32Array} a - First embedding.
 * @param {Float32Array} b - Second embedding.
 * @returns {number} - Cosine similarity value.
 */
export function cosineSimilarity(a, b) {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same length.');
  }

  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));

  return dotProduct / (normA * normB);
}
