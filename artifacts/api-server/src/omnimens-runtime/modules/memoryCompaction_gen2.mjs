/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: memoryCompaction
 * Written: 2026-04-01T22:13:32.989Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// memoryCompaction.mjs

import crypto from 'crypto';

/**
 * Summarizes long text into fixed-size embeddings using a simple transformer-inspired algorithm.
 * This module is designed to compact memory for efficient storage and retrieval.
 */

// Utility to hash text into a fixed-size identifier (used for deduplication or indexing)
export function hashText(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

// Tokenization utility: splits text into tokens by whitespace and punctuation
export function tokenize(text) {
  return text.match(/\b\w+\b/g) || [];
}

// Generate a weighted average embedding for a block of text
export function generateEmbedding(text) {
  const tokens = tokenize(text);
  const tokenWeights = tokens.map((token) => token.length); // Weight tokens by length
  const totalWeight = tokenWeights.reduce((sum, weight) => sum + weight, 0);

  // Simple embedding: map each token to a vector based on char codes
  const embedding = Array(16).fill(0); // Fixed-size 16-dimensional embedding
  tokens.forEach((token, index) => {
    const weight = tokenWeights[index] / totalWeight;
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] += weight * (token.charCodeAt(i % token.length) || 0);
    }
  });

  return embedding;
}

// Summarizes long text into a compressed embedding
export function summarizeText(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('Input must be a non-empty string.');
  }

  const embedding = generateEmbedding(text);
  return {
    hash: hashText(text),
    embedding,
    length: text.length,
    tokenCount: tokenize(text).length
  };
}

// Retrieve the similarity score between two embeddings (cosine similarity)
export function calculateSimilarity(embeddingA, embeddingB) {
  if (embeddingA.length !== embeddingB.length) {
    throw new Error('Embeddings must have the same dimensions.');
  }

  const dotProduct = embeddingA.reduce((sum, val, i) => sum + val * embeddingB[i], 0);
  const magnitudeA = Math.sqrt(embeddingA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(embeddingB.reduce((sum, val) => sum + val ** 2, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

// Utility to compact multiple text entries into a single summary embedding
export function compactMemory(entries) {
  if (!Array.isArray(entries) || entries.some(e => typeof e !== 'string')) {
    throw new Error('Input must be an array of non-empty strings.');
  }

  const embeddings = entries.map(generateEmbedding);
  const compacted = Array(16).fill(0);

  embeddings.forEach((embedding) => {
    for (let i = 0; i < compacted.length; i++) {
      compacted[i] += embedding[i];
    }
  });

  const entryCount = entries.length;
  return compacted.map((val) => val / entryCount); // Normalize by number of entries
}

// Example usage function (not exported)
function exampleUsage() {
  const text1 = 'Artificial intelligence is transforming the world.';
  const text2 = 'Machine learning and deep learning are subsets of AI.';
  const summary1 = summarizeText(text1);
  const summary2 = summarizeText(text2);

  console.log('Summary 1:', summary1);
  console.log('Summary 2:', summary2);
  console.log('Similarity:', calculateSimilarity(summary1.embedding, summary2.embedding));

  const compacted = compactMemory([text1, text2]);
  console.log('Compacted Embedding:', compacted);
}

// Uncomment to test the module
// exampleUsage();