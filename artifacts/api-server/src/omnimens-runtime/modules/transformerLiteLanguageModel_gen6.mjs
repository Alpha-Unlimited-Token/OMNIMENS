/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: transformerLiteLanguageModel
 * Written: 2026-04-03T16:15:46.527Z
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
 * Compiled targets: javascript: OK (41 IR steps) | python: OK (41 IR steps) | c: OK (41 IR steps) | x86_64: OK (41 IR steps) | arm64: OK (41 IR steps) | avr: OK (41 IR steps)
 * Translation map version: 22
 */
// transformerLiteLanguageModel.mjs

import { createHash } from 'crypto';

/**
 * Computes scaled dot-product attention for lightweight transformer-based language generation.
 * @param {Float32Array} query - Query vector.
 * @param {Float32Array} key - Key vector.
 * @param {Float32Array} value - Value vector.
 * @param {number} scaleFactor - Scaling factor for attention scores.
 * @returns {Float32Array} - Weighted output vector.
 */
export function scaledDotProductAttention(query, key, value, scaleFactor = 1) {
  if (query.length !== key.length || key.length !== value.length) {
    throw new Error('Query, key, and value vectors must have the same length.');
  }

  // Compute dot product between query and key
  let dotProduct = 0;
  for (let i = 0; i < query.length; i++) {
    dotProduct += query[i] * key[i];
  }

  // Scale the dot product
  const scaledScore = dotProduct / scaleFactor;

  // Compute softmax normalization
  const expScore = Math.exp(scaledScore);
  const sumExpScores = expScore; // Single score in this lightweight version
  const attentionWeight = expScore / sumExpScores;

  // Compute weighted output
  const output = new Float32Array(value.length);
  for (let i = 0; i < value.length; i++) {
    output[i] = attentionWeight * value[i];
  }

  return output;
}

/**
 * Generates a hash-based token for lightweight embedding similarity checks.
 * @param {string} text - Input text.
 * @returns {string} - Hash token representing the text.
 */
export function generateTextHash(text) {
  const hash = createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
}

/**
 * Computes cosine similarity between two vectors.
 * @param {Float32Array} vectorA - First vector.
 * @param {Float32Array} vectorB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length.');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] ** 2;
    magnitudeB += vectorB[i] ** 2;
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Generates a lightweight transformer-based response given input embeddings.
 * @param {Float32Array} inputEmbedding - Input vector embedding.
 * @param {Array<Float32Array>} candidateEmbeddings - Array of candidate embeddings.
 * @param {Array<string>} candidateTexts - Array of candidate texts corresponding to embeddings.
 * @returns {string} - Most similar text response.
 */
export function generateResponse(inputEmbedding, candidateEmbeddings, candidateTexts) {
  if (candidateEmbeddings.length !== candidateTexts.length) {
    throw new Error('Candidate embeddings and texts must have the same length.');
  }

  let bestScore = -Infinity;
  let bestResponse = '';

  for (let i = 0; i < candidateEmbeddings.length; i++) {
    const similarity = cosineSimilarity(inputEmbedding, candidateEmbeddings[i]);
    if (similarity > bestScore) {
      bestScore = similarity;
      bestResponse = candidateTexts[i];
    }
  }

  return bestResponse;
}

/**
 * Normalizes a vector to unit length.
 * @param {Float32Array} vector - Input vector.
 * @returns {Float32Array} - Normalized vector.
 */
export function normalizeVector(vector) {
  let magnitude = 0;

  for (let i = 0; i < vector.length; i++) {
    magnitude += vector[i] ** 2;
  }

  magnitude = Math.sqrt(magnitude);

  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }

  const normalized = new Float32Array(vector.length);
  for (let i = 0; i < vector.length; i++) {
    normalized[i] = vector[i] / magnitude;
  }

  return normalized;
}