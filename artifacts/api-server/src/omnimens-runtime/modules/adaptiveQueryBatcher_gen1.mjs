/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveQueryBatcher
 * Written: 2026-03-24T22:58:11.256Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveQueryBatcher.mjs
import { createHash } from 'crypto';

// Utility function: Calculate a weighted score for a query
export function calculateQueryScore({ complexity = 1, urgency = 1, utility = 1 }) {
  if (complexity <= 0 || urgency <= 0 || utility <= 0) {
    throw new Error('All input values must be positive numbers.');
  }
  return (urgency * utility) / complexity;
}

// Utility function: Generate a unique ID for a query
export function generateQueryId(query) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(query));
  return hash.digest('hex');
}

// Adaptive Query Batcher class
export class AdaptiveQueryBatcher {
  constructor(maxBatchSize = 10) {
    if (maxBatchSize <= 0) {
      throw new Error('maxBatchSize must be a positive integer.');
    }
    this.maxBatchSize = maxBatchSize;
    this.priorityQueue = [];
  }

  // Add a query to the priority queue
  addQuery(query, metadata) {
    const score = calculateQueryScore(metadata);
    const queryId = generateQueryId(query);
    this.priorityQueue.push({ query, score, queryId });
    this.priorityQueue.sort((a, b) => b.score - a.score); // Sort by descending score
  }

  // Retrieve the next batch of queries
  getNextBatch() {
    const batch = this.priorityQueue.slice(0, this.maxBatchSize);
    this.priorityQueue = this.priorityQueue.slice(this.maxBatchSize);
    return batch.map(item => item.query);
  }

  // Check the current size of the queue
  getQueueSize() {
    return this.priorityQueue.length;
  }

  // Clear the queue
  clearQueue() {
    this.priorityQueue = [];
  }
}

// Utility function: Batch process queries with a custom handler
export async function processQueryBatches(batcher, handlerFunction) {
  if (typeof handlerFunction !== 'function') {
    throw new Error('handlerFunction must be a valid function.');
  }

  while (batcher.getQueueSize() > 0) {
    const batch = batcher.getNextBatch();
    await handlerFunction(batch);
  }
}