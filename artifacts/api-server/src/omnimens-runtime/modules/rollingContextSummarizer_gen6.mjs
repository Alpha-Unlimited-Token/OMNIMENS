/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: rollingContextSummarizer
 * Written: 2026-04-01T22:18:56.229Z
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
 * Compiled targets: javascript: OK (2 IR steps) | python: OK (2 IR steps) | c: OK (2 IR steps) | x86_64: OK (2 IR steps) | arm64: OK (2 IR steps) | avr: OK (2 IR steps)
 * Translation map version: 22
 */
// rollingContextSummarizer.mjs
import { createHash } from 'crypto';

/**
 * Generates a hash-based unique identifier for a given input string.
 * Useful for deduplication or tracking summarized contexts.
 * @param {string} input - The input string to hash.
 * @returns {string} - A 12-character hash.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex').slice(0, 12);
}

/**
 * Calculates a weighted moving average of numerical values.
 * Useful for temporal attention mechanisms.
 * @param {number[]} values - Array of numerical values.
 * @param {number[]} weights - Array of weights corresponding to values.
 * @returns {number} - Weighted average.
 */
export function weightedAverage(values, weights) {
  if (values.length !== weights.length || values.length === 0) {
    throw new Error('Values and weights must be non-empty arrays of the same length.');
  }
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) {
    throw new Error('Total weight cannot be zero.');
  }
  return values.reduce((sum, v, i) => sum + v * weights[i], 0) / totalWeight;
}

/**
 * Encodes a text input into a normalized vector representation.
 * Useful for summarizing and comparing text contexts.
 * @param {string} text - The input text to encode.
 * @returns {number[]} - A fixed-length normalized vector.
 */
export function encodeTextToVector(text) {
  const charCodes = Array.from(text).map(char => char.charCodeAt(0));
  const sum = charCodes.reduce((acc, code) => acc + code, 0);
  const normalized = charCodes.map(code => code / sum);
  return normalized.slice(0, 128).concat(Array(128 - normalized.length).fill(0));
}

/**
 * Summarizes a sequence of text inputs into a compact embedding.
 * Uses temporal attention to prioritize recent and significant inputs.
 * @param {string[]} texts - Array of text inputs to summarize.
 * @param {number[]} weights - Array of weights for each text input.
 * @returns {number[]} - A single summarized vector embedding.
 */
export function summarizeContext(texts, weights) {
  if (texts.length !== weights.length || texts.length === 0) {
    throw new Error('Texts and weights must be non-empty arrays of the same length.');
  }
  const vectors = texts.map(encodeTextToVector);
  const dimension = vectors[0].length;
  const weightedSum = Array(dimension).fill(0);

  vectors.forEach((vector, i) => {
    vector.forEach((value, j) => {
      weightedSum[j] += value * weights[i];
    });
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  return weightedSum.map(value => value / totalWeight);
}

/**
 * Calculates cosine similarity between two vectors.
 * Useful for comparing embeddings or contexts.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity score between -1 and 1.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }
  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));
  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Vector magnitude cannot be zero.');
  }
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Maintains a rolling context by summarizing and compressing history.
 * @param {Array<{ text, weight}>} history - Array of text and weight pairs.
 * @returns {{ summary, hash}} - Summarized embedding and unique hash.
 */
export function rollingContextSummarizer(history) {
  if (!Array.isArray(history) || history.length === 0) {
    throw new Error('History must be a non-empty array.');
  }
  const texts = history.map(entry => entry.text);
  const weights = history.map(entry => entry.weight);
  const summary = summarizeContext(texts, weights);
  const hash = generateHash(JSON.stringify(history));
  return { summary, hash };
}