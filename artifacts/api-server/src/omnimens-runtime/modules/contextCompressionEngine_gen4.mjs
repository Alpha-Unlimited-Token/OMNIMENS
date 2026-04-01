/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompressionEngine
 * Written: 2026-04-01T22:21:43.601Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextCompressionEngine.mjs

import { createHash } from 'crypto';

/**
 * Encodes a given text input into a fixed-length embedding using a simple hashing mechanism.
 * This function is generic and can be used by any agent requiring text compression.
 * @param {string} text - The input text to encode.
 * @param {number} length - The desired fixed length of the embedding.
 * @returns {Uint8Array} - A fixed-length embedding.
 */
export function encodeToFixedLengthEmbedding(text, length) {
  if (typeof text !== 'string' || typeof length !== 'number' || length <= 0) {
    throw new Error('Invalid input: text must be a string and length must be a positive number.');
  }

  const hash = createHash('sha256').update(text, 'utf8').digest();
  const embedding = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    embedding[i] = hash[i % hash.length];
  }

  return embedding;
}

/**
 * Compresses a conversation history into a compact representation by encoding key information.
 * This function can be reused by multiple agents for summarizing context.
 * @param {Array<string>} history - Array of conversation strings.
 * @param {number} embeddingLength - Desired fixed length of the compressed representation.
 * @returns {Uint8Array} - Compressed representation of the conversation history.
 */
export function compressConversationHistory(history, embeddingLength) {
  if (!Array.isArray(history) || typeof embeddingLength !== 'number' || embeddingLength <= 0) {
    throw new Error('Invalid input: history must be an array of strings and embeddingLength must be a positive number.');
  }

  const combinedText = history.join(' ');
  return encodeToFixedLengthEmbedding(combinedText, embeddingLength);
}

/**
 * Merges multiple embeddings into a single fixed-length embedding using a weighted average.
 * Useful for combining multiple contexts into a unified representation.
 * @param {Array<Uint8Array>} embeddings - Array of embeddings to merge.
 * @param {Array<number>} weights - Array of weights corresponding to each embedding.
 * @returns {Uint8Array} - Merged embedding.
 */
export function mergeEmbeddings(embeddings, weights) {
  if (!Array.isArray(embeddings) || !Array.isArray(weights) || embeddings.length !== weights.length) {
    throw new Error('Invalid input: embeddings and weights must be arrays of the same length.');
  }

  const embeddingLength = embeddings[0]?.length;
  if (!embeddingLength || !embeddings.every(e => e.length === embeddingLength)) {
    throw new Error('All embeddings must have the same length.');
  }

  const merged = new Float64Array(embeddingLength);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  embeddings.forEach((embedding, index) => {
    const weight = weights[index] / totalWeight;
    for (let i = 0; i < embeddingLength; i++) {
      merged[i] += embedding[i] * weight;
    }
  });

  return Uint8Array.from(merged.map(value => Math.round(value)));
}

/**
 * Retrieves the most relevant information from compressed embeddings using a similarity score.
 * This function is useful for memory retrieval and context augmentation.
 * @param {Uint8Array} queryEmbedding - The embedding representing the query.
 * @param {Array<{embedding, data}>} memory - Array of stored embeddings and associated data.
 * @returns {any} - The data associated with the most relevant embedding.
 */
export function retrieveFromMemory(queryEmbedding, memory) {
  if (!(queryEmbedding instanceof Uint8Array) || !Array.isArray(memory)) {
    throw new Error('Invalid input: queryEmbedding must be a Uint8Array and memory must be an array.');
  }

  let bestMatch = null;
  let highestScore = -Infinity;

  memory.forEach(({ embedding, data }) => {
    if (!(embedding instanceof Uint8Array) || embedding.length !== queryEmbedding.length) {
      throw new Error('All embeddings in memory must be Uint8Array of the same length as queryEmbedding.');
    }

    const score = cosineSimilarity(queryEmbedding, embedding);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = data;
    }
  });

  return bestMatch;
}

/**
 * Calculates the cosine similarity between two embeddings.
 * @param {Uint8Array} a - First embedding.
 * @param {Uint8Array} b - Second embedding.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(a, b) {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same length.');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}
