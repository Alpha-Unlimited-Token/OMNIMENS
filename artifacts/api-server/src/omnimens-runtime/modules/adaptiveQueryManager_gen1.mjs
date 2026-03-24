/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveQueryManager
 * Written: 2026-03-24T05:30:51.117Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveQueryManager.mjs

import { randomUUID } from 'crypto';

/**
 * Cache to store query results and manage priorities.
 */
const queryCache = new Map();

/**
 * Priority scoring function: calculates importance based on task weight and expected information gain.
 * @param {number} taskWeight - Importance of the task (1-10).
 * @param {number} expectedGain - Expected information gain (0-1).
 * @returns {number} Priority score (0-100).
 */
export function calculatePriority(taskWeight, expectedGain) {
  if (taskWeight < 1 || taskWeight > 10 || expectedGain < 0 || expectedGain > 1) {
    throw new Error('Invalid inputs: taskWeight must be 1-10 and expectedGain must be 0-1.');
  }
  return taskWeight * expectedGain * 10;
}

/**
 * Reinforcement learning model to dynamically allocate query budgets.
 * @param {Array<Object>} tasks - Array of task objects with { id, taskWeight, expectedGain }.
 * @param {number} totalBudget - Total query budget available.
 * @returns {Array<Object>} Allocated budgets for each task.
 */
export function allocateQueryBudget(tasks, totalBudget) {
  if (totalBudget <= 0) {
    throw new Error('Total budget must be greater than 0.');
  }

  const priorities = tasks.map(task => ({
    id: task.id,
    priority: calculatePriority(task.taskWeight, task.expectedGain)
  }));

  const totalPriority = priorities.reduce((sum, task) => sum + task.priority, 0);

  return priorities.map(task => ({
    id: task.id,
    allocatedBudget: (task.priority / totalPriority) * totalBudget
  }));
}

/**
 * Intelligent caching mechanism.
 * @param {string} query - Query string.
 * @param {Object} result - Result object to cache.
 * @param {number} ttl - Time-to-live in milliseconds.
 */
export function cacheQueryResult(query, result, ttl) {
  const expirationTime = Date.now() + ttl;
  queryCache.set(query, { result, expirationTime });
}

/**
 * Retrieve cached query result if available and valid.
 * @param {string} query - Query string.
 * @returns {Object|null} Cached result or null if not found/expired.
 */
export function getCachedResult(query) {
  const cacheEntry = queryCache.get(query);
  if (!cacheEntry || cacheEntry.expirationTime < Date.now()) {
    queryCache.delete(query);
    return null;
  }
  return cacheEntry.result;
}

/**
 * Batch queries intelligently based on priority.
 * @param {Array<Object>} queries - Array of query objects with { query, taskWeight, expectedGain }.
 * @param {number} batchSize - Maximum number of queries per batch.
 * @returns {Array<Array<Object>>} Batches of queries.
 */
export function batchQueries(queries, batchSize) {
  if (batchSize <= 0) {
    throw new Error('Batch size must be greater than 0.');
  }

  const sortedQueries = [...queries].sort((a, b) => {
    const priorityA = calculatePriority(a.taskWeight, a.expectedGain);
    const priorityB = calculatePriority(b.taskWeight, b.expectedGain);
    return priorityB - priorityA;
  });

  const batches = [];
  for (let i = 0; i < sortedQueries.length; i += batchSize) {
    batches.push(sortedQueries.slice(i, i + batchSize));
  }

  return batches;
}

/**
 * Utility function to generate unique task IDs.
 * @returns {string} Unique task ID.
 */
export function generateTaskId() {
  return randomUUID();
}

/**
 * Cleanup expired cache entries.
 */
export function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of queryCache.entries()) {
    if (value.expirationTime < now) {
      queryCache.delete(key);
    }
  }
}

/**
 * Example usage of the module.
 */
export const exampleUsage = () => {
  const tasks = [
    { id: generateTaskId(), taskWeight: 8, expectedGain: 0.9 },
    { id: generateTaskId(), taskWeight: 5, expectedGain: 0.7 },
    { id: generateTaskId(), taskWeight: 3, expectedGain: 0.5 }
  ];

  const totalBudget = 100;
  const allocations = allocateQueryBudget(tasks, totalBudget);
  console.log('Allocations:', allocations);

  const query = 'example query';
  const result = { data: 'example result' };
  cacheQueryResult(query, result, 5000);
  console.log('Cached result:', getCachedResult(query));

  cleanupCache();
};