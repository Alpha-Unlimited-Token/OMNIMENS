/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveDataStreamSimulator
 * Written: 2026-03-24T04:38:36.062Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveDataStreamSimulator.mjs

import { setTimeout } from 'timers/promises';
import { createHash } from 'crypto';

/**
 * Generates a hash for caching API responses.
 * @param {string} input - The string to hash.
 * @returns {string} - The resulting hash.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Calculates a relevance score based on recency and priority.
 * @param {number} timestamp - The timestamp of the data.
 * @param {number} priority - The priority of the data (higher is more important).
 * @returns {number} - The calculated relevance score.
 */
export function calculateRelevanceScore(timestamp, priority) {
  const age = Date.now() - timestamp;
  return priority / (1 + age / 1000);
}

/**
 * Adaptive polling function to fetch and cache data from APIs.
 * @param {string} url - The API endpoint to poll.
 * @param {number} interval - The polling interval in milliseconds.
 * @param {number} priority - The priority of this data stream.
 * @param {Map} cache - A shared cache object for storing results.
 * @returns {Promise<void>} - Resolves when polling is complete.
 */
export async function adaptivePoll(url, interval, priority, cache) {
  while (true) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      const timestamp = Date.now();
      const hash = generateHash(url);

      cache.set(hash, { data, timestamp, priority });

      // Adjust interval based on relevance score
      const relevance = calculateRelevanceScore(timestamp, priority);
      const adjustedInterval = Math.max(interval / relevance, 1000);
      await setTimeout(adjustedInterval);
    } catch (error) {
      console.error(`Error polling ${url}:`, error);
      await setTimeout(interval); // Retry after the original interval
    }
  }
}

/**
 * Retrieves cached data, sorted by relevance score.
 * @param {Map} cache - The shared cache object.
 * @returns {Array} - An array of cached data sorted by relevance.
 */
export function getSortedCachedData(cache) {
  const dataArray = Array.from(cache.values());
  return dataArray.sort((a, b) => calculateRelevanceScore(b.timestamp, b.priority) - calculateRelevanceScore(a.timestamp, a.priority));
}

/**
 * Initializes the adaptive data stream simulator.
 * @param {Array} streams - An array of stream configurations { url, interval, priority }.
 * @returns {Map} - The shared cache object.
 */
export function initializeSimulator(streams) {
  const cache = new Map();
  streams.forEach(({ url, interval, priority }) => {
    adaptivePoll(url, interval, priority, cache);
  });
  return cache;
}

/**
 * Exports a utility function to clear the cache.
 * @param {Map} cache - The shared cache object.
 */
export function clearCache(cache) {
  cache.clear();
}
