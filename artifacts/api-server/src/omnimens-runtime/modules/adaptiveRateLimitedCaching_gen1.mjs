/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveRateLimitedCaching
 * Written: 2026-03-25T01:15:55.538Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveRateLimitedCaching.mjs

import { createHash } from 'crypto';

// Utility function to hash query strings for consistent cache keys
export function hashQuery(query) {
  const hash = createHash('sha256');
  hash.update(query);
  return hash.digest('hex');
}

// LRU Cache implementation
export class LRUCache {
  constructor(limit) {
    this.limit = limit;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.limit) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }
}

// Predictive query modeling using a simple Markov chain
export class MarkovPredictor {
  constructor() {
    this.transitionMatrix = new Map();
  }

  train(querySequence) {
    for (let i = 0; i < querySequence.length - 1; i++) {
      const currentQuery = querySequence[i];
      const nextQuery = querySequence[i + 1];

      if (!this.transitionMatrix.has(currentQuery)) {
        this.transitionMatrix.set(currentQuery, new Map());
      }

      const transitions = this.transitionMatrix.get(currentQuery);
      transitions.set(nextQuery, (transitions.get(nextQuery) || 0) + 1);
    }
  }

  predict(nextQueryCandidates, currentQuery) {
    if (!this.transitionMatrix.has(currentQuery)) return null;

    const transitions = this.transitionMatrix.get(currentQuery);
    let bestCandidate = null;
    let highestProbability = 0;

    for (const candidate of nextQueryCandidates) {
      const probability = transitions.get(candidate) || 0;
      if (probability > highestProbability) {
        highestProbability = probability;
        bestCandidate = candidate;
      }
    }

    return bestCandidate;
  }
}

// Adaptive rate-limited caching system
export class AdaptiveRateLimitedCaching {
  constructor(cacheLimit, rateLimit) {
    this.cache = new LRUCache(cacheLimit);
    this.rateLimit = rateLimit; // Max API calls per time window
    this.lastCallTimestamps = []; // Track API call timestamps
    this.predictor = new MarkovPredictor();
  }

  canMakeAPICall() {
    const now = Date.now();
    this.lastCallTimestamps = this.lastCallTimestamps.filter(
      (timestamp) => now - timestamp <= this.rateLimit
    );
    return this.lastCallTimestamps.length < this.rateLimit;
  }

  async fetch(query, fetchFunction) {
    const queryHash = hashQuery(query);

    // Check cache first
    if (this.cache.has(queryHash)) {
      return this.cache.get(queryHash);
    }

    // Check rate limit
    if (!this.canMakeAPICall()) {
      throw new Error('Rate limit exceeded');
    }

    // Fetch from API
    const result = await fetchFunction(query);

    // Cache the result
    this.cache.set(queryHash, result);

    // Record API call
    this.lastCallTimestamps.push(Date.now());

    return result;
  }

  trainPredictor(querySequence) {
    this.predictor.train(querySequence);
  }

  predictNextQuery(currentQuery, nextQueryCandidates) {
    return this.predictor.predict(nextQueryCandidates, currentQuery);
  }
}

// Example usage:
// const cacheSystem = new AdaptiveRateLimitedCaching(100, 60000); // 100 items, 1 minute rate limit
// cacheSystem.trainPredictor(['query1', 'query2', 'query3']);
// const predictedNext = cacheSystem.predictNextQuery('query2', ['query3', 'query4']);