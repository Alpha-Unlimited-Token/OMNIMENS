/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveTokenManager
 * Written: 2026-04-02T14:25:40.954Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveTokenManager.mjs

import { createHash } from 'crypto';

/**
 * Hashes input data to generate a unique identifier for context chunks.
 * @param {string} data - The input data to hash.
 * @returns {string} - A 16-character hash of the input data.
 */
export function generateHash(data) {
  return createHash('sha256').update(data).digest('hex').slice(0, 16);
}

/**
 * Summarizes a given text by truncating or extracting key portions.
 * @param {string} text - The input text to summarize.
 * @param {number} maxLength - The maximum length of the summary.
 * @returns {string} - A summarized version of the input text.
 */
export function summarizeText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  const midpoint = Math.floor(maxLength / 2) - 3;
  return text.slice(0, midpoint) + '...' + text.slice(-midpoint);
}

/**
 * Dynamically compresses a context object by summarizing its values.
 * @param {Object} context - The input context object.
 * @param {number} maxSummaryLength - The maximum length for each summarized value.
 * @returns {Object} - A compressed version of the context object.
 */
export function compressContext(context, maxSummaryLength = 100) {
  const compressed = {};
  for (const [key, value] of Object.entries(context)) {
    if (typeof value === 'string') {
      compressed[key] = summarizeText(value, maxSummaryLength);
    } else if (typeof value === 'object' && value !== null) {
      compressed[key] = compressContext(value, maxSummaryLength);
    } else {
      compressed[key] = value;
    }
  }
  return compressed;
}

/**
 * Restores a prioritized context chunk from a distributed memory map.
 * @param {Map<string, Object>} memoryMap - A map of hashed keys to context chunks.
 * @param {string[]} priorityKeys - An array of keys in order of priority.
 * @returns {Object} - The restored context object.
 */
export function restoreContext(memoryMap, priorityKeys) {
  const restored = {};
  for (const key of priorityKeys) {
    if (memoryMap.has(key)) {
      Object.assign(restored, memoryMap.get(key));
    }
  }
  return restored;
}

/**
 * Manages context data by compressing, storing, and restoring dynamically.
 * @param {Object} context - The input context to manage.
 * @param {Map<string, Object>} memoryMap - A map to store compressed context chunks.
 * @param {string[]} priorityKeys - Keys to prioritize during restoration.
 * @param {number} maxSummaryLength - Maximum length for summarizations.
 * @returns {Object} - The restored context object.
 */
export function adaptiveTokenManager(context, memoryMap, priorityKeys, maxSummaryLength = 100) {
  const compressedContext = compressContext(context, maxSummaryLength);
  const hashKey = generateHash(JSON.stringify(compressedContext));
  memoryMap.set(hashKey, compressedContext);
  return restoreContext(memoryMap, priorityKeys);
}

/**
 * Utility to initialize a distributed memory map.
 * @returns {Map<string, Object>} - A new distributed memory map.
 */
export function initializeMemoryMap() {
  return new Map();
}