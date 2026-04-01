/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: asyncComputationChunker
 * Written: 2026-04-01T22:21:56.599Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// asyncComputationChunker.mjs

/**
 * Breaks long-running computations into smaller asynchronous tasks to avoid blocking the event loop.
 * Useful for iterative algorithms or tasks requiring high granularity.
 */

/**
 * Processes a long-running computation in chunks, yielding control back to the event loop between iterations.
 * @param {Function} taskFunction - A function to execute for each iteration. Receives the current index and context.
 * @param {number} totalIterations - Total number of iterations to perform.
 * @param {number} chunkSize - Number of iterations to process before yielding back to the event loop.
 * @param {Object} [context={}] - Optional shared context object for maintaining state across iterations.
 * @returns {Promise<void>} Resolves when all iterations are complete.
 */
export async function asyncComputationChunker(taskFunction, totalIterations, chunkSize, context = {}) {
  if (typeof taskFunction !== 'function') {
    throw new TypeError('taskFunction must be a function');
  }
  if (!Number.isInteger(totalIterations) || totalIterations <= 0) {
    throw new RangeError('totalIterations must be a positive integer');
  }
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new RangeError('chunkSize must be a positive integer');
  }

  let currentIndex = 0;

  while (currentIndex < totalIterations) {
    const end = Math.min(currentIndex + chunkSize, totalIterations);

    for (let i = currentIndex; i < end; i++) {
      await taskFunction(i, context);
    }

    currentIndex = end;

    // Yield control back to the event loop
    await new Promise(resolve => setImmediate(resolve));
  }
}

/**
 * Example utility: Computes the sum of an array asynchronously, chunked to avoid blocking.
 * @param {number[]} array - Array of numbers to sum.
 * @param {number} chunkSize - Number of elements to process per chunk.
 * @returns {Promise<number>} Resolves to the sum of the array.
 */
export async function asyncSum(array, chunkSize) {
  if (!Array.isArray(array) || !array.every(Number.isFinite)) {
    throw new TypeError('array must be an array of numbers');
  }
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new RangeError('chunkSize must be a positive integer');
  }

  let sum = 0;

  await asyncComputationChunker(async (index) => {
    sum += array[index];
  }, array.length, chunkSize);

  return sum;
}

/**
 * Example utility: Asynchronously applies a transformation to each element in an array.
 * @param {any[]} array - Array of elements to transform.
 * @param {Function} transformFunction - Function to apply to each element.
 * @param {number} chunkSize - Number of elements to process per chunk.
 * @returns {Promise<any[]>} Resolves to a new array with transformed elements.
 */
export async function asyncMap(array, transformFunction, chunkSize) {
  if (!Array.isArray(array)) {
    throw new TypeError('array must be an array');
  }
  if (typeof transformFunction !== 'function') {
    throw new TypeError('transformFunction must be a function');
  }
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new RangeError('chunkSize must be a positive integer');
  }

  const result = new Array(array.length);

  await asyncComputationChunker(async (index) => {
    result[index] = await transformFunction(array[index], index);
  }, array.length, chunkSize);

  return result;
}

/**
 * Example utility: Asynchronously filters elements in an array based on a predicate.
 * @param {any[]} array - Array of elements to filter.
 * @param {Function} predicateFunction - Function that returns true for elements to keep.
 * @param {number} chunkSize - Number of elements to process per chunk.
 * @returns {Promise<any[]>} Resolves to a new array with filtered elements.
 */
export async function asyncFilter(array, predicateFunction, chunkSize) {
  if (!Array.isArray(array)) {
    throw new TypeError('array must be an array');
  }
  if (typeof predicateFunction !== 'function') {
    throw new TypeError('predicateFunction must be a function');
  }
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new RangeError('chunkSize must be a positive integer');
  }

  const result = [];

  await asyncComputationChunker(async (index) => {
    if (await predicateFunction(array[index], index)) {
      result.push(array[index]);
    }
  }, array.length, chunkSize);

  return result;
}