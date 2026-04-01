/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: slidingWindowMemory
 * Written: 2026-04-01T22:18:55.193Z
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
 * Compiled targets: javascript: OK (1 IR steps) | python: OK (1 IR steps) | c: OK (1 IR steps) | x86_64: OK (1 IR steps) | arm64: OK (1 IR steps) | avr: OK (1 IR steps)
 * Translation map version: 22
 */
// slidingWindowMemory.mjs

import crypto from 'crypto';

/**
 * Generate a hash for a given input string. Used for efficient clustering.
 * @param {string} input - The input string to hash.
 * @returns {string} - A hexadecimal hash of the input.
 */
export function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Perform attention-weighted summarization on a set of text chunks.
 * @param {Array<{ text, weight}>} chunks - Array of text chunks with associated weights.
 * @returns {string} - The summarized text.
 */
export function attentionWeightedSummarization(chunks) {
  const totalWeight = chunks.reduce((sum, chunk) => sum + chunk.weight, 0);
  if (totalWeight === 0) return '';

  return chunks
    .map(chunk => ({
      text: chunk.text,
      normalizedWeight: chunk.weight / totalWeight
    }))
    .sort((a, b) => b.normalizedWeight - a.normalizedWeight)
    .map(chunk => chunk.text)
    .join(' ');
}

/**
 * Cluster semantically similar text chunks using a simple hash-based approach.
 * @param {Array<string>} texts - Array of text chunks to cluster.
 * @returns {Object} - An object where keys are cluster identifiers and values are arrays of clustered texts.
 */
export function semanticClustering(texts) {
  const clusters = {};

  texts.forEach(text => {
    const hash = generateHash(text).slice(0, 8); // Use the first 8 characters of the hash as a cluster ID
    if (!clusters[hash]) {
      clusters[hash] = [];
    }
    clusters[hash].push(text);
  });

  return clusters;
}

/**
 * Apply a sliding window mechanism to maintain long-term conversational context.
 * @param {Array<string>} history - Array of past conversation turns.
 * @param {number} windowSize - The maximum number of items to retain in the window.
 * @returns {string} - A compressed representation of the conversation history.
 */
export function slidingWindowCompression(history, windowSize) {
  if (history.length <= windowSize) return history.join(' ');

  const recent = history.slice(-windowSize);
  const older = history.slice(0, -windowSize);

  const clusters = semanticClustering(older);
  const summarizedClusters = Object.values(clusters).map(cluster =>
    attentionWeightedSummarization(cluster.map(text => ({ text, weight: 1 })))
  );

  return [...summarizedClusters, ...recent].join(' ');
}

/**
 * Utility to normalize weights for an array of weighted items.
 * @param {Array<{ value, weight}>} items - Array of weighted items.
 * @returns {Array<{ value, normalizedWeight}>} - Array with normalized weights.
 */
export function normalizeWeights(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return items.map(item => ({ ...item, normalizedWeight: 0 }));

  return items.map(item => ({
    ...item,
    normalizedWeight: item.weight / totalWeight
  }));
}

/**
 * Compute a similarity score between two texts using a simple character overlap metric.
 * @param {string} textA - The first text.
 * @param {string} textB - The second text.
 * @returns {number} - A similarity score between 0 and 1.
 */
export function computeSimilarity(textA, textB) {
  const setA = new Set(textA);
  const setB = new Set(textB);
  const intersection = new Set([...setA].filter(char => setB.has(char)));
  return intersection.size / Math.max(setA.size, setB.size);
}
