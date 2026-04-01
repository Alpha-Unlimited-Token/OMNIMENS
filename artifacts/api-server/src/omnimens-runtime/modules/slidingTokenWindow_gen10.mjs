/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: slidingTokenWindow
 * Written: 2026-04-01T21:58:15.741Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// slidingTokenWindow.mjs

export function splitIntoSlidingWindows(input, windowSize, overlapSize) {
  if (typeof input !== 'string') throw new Error('Input must be a string.');
  if (windowSize <= 0 || overlapSize < 0 || overlapSize >= windowSize) {
    throw new Error('Invalid windowSize or overlapSize values.');
  }

  const chunks = [];
  let start = 0;

  while (start < input.length) {
    const end = Math.min(start + windowSize, input.length);
    const chunk = input.slice(start, end);
    chunks.push(chunk);
    start += windowSize - overlapSize;
  }

  return chunks;
}

export function processWithContext(input, windowSize, overlapSize, processFunction) {
  if (typeof processFunction !== 'function') {
    throw new Error('processFunction must be a valid function.');
  }

  const chunks = splitIntoSlidingWindows(input, windowSize, overlapSize);
  const results = [];
  let previousContext = '';

  for (const chunk of chunks) {
    const augmentedInput = previousContext + chunk;
    const result = processFunction(augmentedInput);
    results.push(result);
    previousContext = chunk.slice(-overlapSize); // Maintain context continuity
  }

  return results;
}

export function combineResults(results, joiner = '') {
  if (!Array.isArray(results)) {
    throw new Error('Results must be an array.');
  }

  return results.join(joiner);
}

export function slidingTokenWindow(input, windowSize, overlapSize, processFunction, joiner = '') {
  const processedChunks = processWithContext(input, windowSize, overlapSize, processFunction);
  return combineResults(processedChunks, joiner);
}

export const exampleProcessFunction = (chunk) => {
  // Example function that simply returns the chunk in uppercase.
  return chunk.toUpperCase();
};