/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveContextManager
 * Written: 2026-04-02T14:31:16.699Z
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
 * Compiled targets: javascript: OK (9 IR steps) | python: OK (9 IR steps) | c: OK (9 IR steps) | x86_64: OK (9 IR steps) | arm64: OK (9 IR steps) | avr: OK (9 IR steps)
 * Translation map version: 22
 */
// recursiveContextManager.mjs

import { createHash } from 'crypto';

/**
 * Summarizes a given context recursively into hierarchical layers.
 * @param {string[]} contextArray - Array of strings representing the context.
 * @param {number} maxLength - Maximum length of each summary layer.
 * @returns {string[]} - Hierarchical summaries from detailed to abstract.
 */
export function recursiveSummarize(contextArray, maxLength) {
  if (!Array.isArray(contextArray) || typeof maxLength !== 'number' || maxLength <= 0) {
    throw new Error('Invalid input: contextArray must be an array and maxLength must be a positive number.');
  }

  const summaries = [];

  let currentLayer = contextArray;
  while (currentLayer.length > 1) {
    const nextLayer = [];

    for (let i = 0; i < currentLayer.length; i += 2) {
      const chunk = currentLayer.slice(i, i + 2).join(' ');
      nextLayer.push(chunk.length > maxLength ? chunk.slice(0, maxLength - 3) + '...' : chunk);
    }

    summaries.unshift(nextLayer.join(' '));
    currentLayer = nextLayer;
  }

  summaries.unshift(currentLayer.join(' '));
  return summaries;
}

/**
 * Expands a compressed summary back into its detailed context using a retrieval function.
 * @param {string} summary - The compressed summary.
 * @param {Map<string, string[]>} contextMap - A map of summary hashes to original context arrays.
 * @returns {string[]} - The expanded detailed context.
 */
export function expandSummary(summary, contextMap) {
  if (typeof summary !== 'string' || !(contextMap instanceof Map)) {
    throw new Error('Invalid input: summary must be a string and contextMap must be a Map.');
  }

  const summaryHash = createHash('sha256').update(summary).digest('hex');
  return contextMap.get(summaryHash) || [];
}

/**
 * Creates a context map for retrieval based on hierarchical summaries.
 * @param {string[]} contextArray - Array of strings representing the context.
 * @param {number} maxLength - Maximum length of each summary layer.
 * @returns {Map<string, string[]>} - Map of summary hashes to original context arrays.
 */
export function createContextMap(contextArray, maxLength) {
  if (!Array.isArray(contextArray) || typeof maxLength !== 'number' || maxLength <= 0) {
    throw new Error('Invalid input: contextArray must be an array and maxLength must be a positive number.');
  }

  const contextMap = new Map();
  const summaries = recursiveSummarize(contextArray, maxLength);

  summaries.forEach((summary, index) => {
    const summaryHash = createHash('sha256').update(summary).digest('hex');
    contextMap.set(summaryHash, index === summaries.length - 1 ? contextArray : summaries[index + 1].split(' '));
  });

  return contextMap;
}

/**
 * Retrieves the most relevant context chunk based on attention weights.
 * @param {string[]} contextArray - Array of strings representing the context.
 * @param {number[]} attentionWeights - Array of weights corresponding to context importance.
 * @returns {string} - The most relevant context chunk.
 */
export function retrieveContextByAttention(contextArray, attentionWeights) {
  if (!Array.isArray(contextArray) || !Array.isArray(attentionWeights) || contextArray.length !== attentionWeights.length) {
    throw new Error('Invalid input: contextArray and attentionWeights must be arrays of the same length.');
  }

  const maxWeightIndex = attentionWeights.indexOf(Math.max(...attentionWeights));
  return contextArray[maxWeightIndex];
}

/**
 * Utility function to normalize attention weights.
 * @param {number[]} weights - Array of raw attention weights.
 * @returns {number[]} - Normalized weights summing to 1.
 */
export function normalizeWeights(weights) {
  if (!Array.isArray(weights) || weights.some(weight => typeof weight !== 'number' || weight < 0)) {
    throw new Error('Invalid input: weights must be an array of non-negative numbers.');
  }

  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return total === 0 ? weights.map(() => 0) : weights.map(weight => weight / total);
}

/**
 * Utility function to hash a string for consistent mapping.
 * @param {string} input - The string to hash.
 * @returns {string} - The SHA-256 hash of the input.
 */
export function hashString(input) {
  if (typeof input !== 'string') {
    throw new Error('Invalid input: input must be a string.');
  }

  return createHash('sha256').update(input).digest('hex');
}