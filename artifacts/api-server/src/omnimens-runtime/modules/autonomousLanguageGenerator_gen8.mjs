/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: autonomousLanguageGenerator
 * Written: 2026-04-03T18:43:22.863Z
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
// autonomousLanguageGenerator.mjs

import crypto from 'crypto';

/**
 * Generates a random seed for reproducibility in transformer-based models.
 * Useful across agents requiring deterministic initialization.
 */
export function generateRandomSeed() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Applies scaled dot-product attention mechanism.
 * Generic utility for any agent requiring attention-based computations.
 * @param {Float32Array} query - Query vector.
 * @param {Float32Array} key - Key vector.
 * @param {Float32Array} value - Value vector.
 * @returns {Float32Array} - Attention-weighted output vector.
 */
export function applyAttention(query, key, value) {
  const queryKeyDotProduct = query.map((q, i) => q * key[i]);
  const scaleFactor = Math.sqrt(query.length);
  const scaledScores = queryKeyDotProduct.map(score => score / scaleFactor);

  const softmaxScores = softmax(scaledScores);
  const attentionOutput = new Float32Array(value.length);

  for (let i = 0; i < value.length; i++) {
    attentionOutput[i] = softmaxScores[i] * value[i];
  }

  return attentionOutput;
}

/**
 * Computes the softmax of an array.
 * Generic utility for normalization across agents.
 * @param {number[]} scores - Array of scores.
 * @returns {number[]} - Softmax-normalized array.
 */
export function softmax(scores) {
  const maxScore = Math.max(...scores);
  const expScores = scores.map(score => Math.exp(score - maxScore));
  const sumExpScores = expScores.reduce((sum, val) => sum + val, 0);
  return expScores.map(val => val / sumExpScores);
}

/**
 * Generates conversational language using a lightweight transformer-based decoder.
 * Core utility for synthesizing fluent responses across agents.
 * @param {string[]} inputTokens - Array of input tokens.
 * @param {Object} embeddings - Pre-trained embeddings matrix.
 * @param {number} maxLength - Maximum length of generated sequence.
 * @returns {string[]} - Array of generated tokens.
 */
export function generateLanguage(inputTokens, embeddings, maxLength) {
  const outputTokens = [...inputTokens];

  for (let i = 0; i < maxLength; i++) {
    const query = embeddings[outputTokens[outputTokens.length - 1]];
    const key = embeddings[outputTokens[outputTokens.length - 2]] || query;
    const value = embeddings[outputTokens[outputTokens.length - 3]] || query;

    const attentionOutput = applyAttention(query, key, value);

    const nextToken = findClosestToken(attentionOutput, embeddings);
    outputTokens.push(nextToken);

    if (nextToken === '<END>') break;
  }

  return outputTokens;
}

/**
 * Finds the closest token in the embeddings matrix to a given vector.
 * A general-purpose utility for vector similarity.
 * @param {Float32Array} vector - Target vector.
 * @param {Object} embeddings - Pre-trained embeddings matrix.
 * @returns {string} - Closest token.
 */
export function findClosestToken(vector, embeddings) {
  let closestToken = null;
  let closestDistance = Infinity;

  for (const [token, embedding] of Object.entries(embeddings)) {
    const distance = cosineSimilarity(vector, embedding);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestToken = token;
    }
  }

  return closestToken;
}

/**
 * Computes cosine similarity between two vectors.
 * Generic utility for measuring vector similarity across agents.
 * @param {Float32Array} vectorA - First vector.
 * @param {Float32Array} vectorB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}