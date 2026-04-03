/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeTaskManager
 * Written: 2026-04-03T08:37:32.153Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeTaskManager.mjs

import { createHash } from 'crypto';

/**
 * Hashes a string to create a unique task identifier.
 * Useful for checkpointing task states in a database or other storage.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input string.
 */
export function generateTaskId(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Splits a long-running computation into smaller chunks for iterative processing.
 * @param {Array} data - The dataset to process in chunks.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Array<Array>} - An array of data chunks.
 */
export function chunkData(data, chunkSize) {
  if (!Array.isArray(data)) throw new TypeError('Data must be an array.');
  if (chunkSize <= 0) throw new RangeError('Chunk size must be greater than 0.');

  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Processes a single chunk of data and updates the state.
 * @param {Array} chunk - The data chunk to process.
 * @param {Function} taskFunction - The function to apply to each item in the chunk.
 * @param {Object} state - The persistent state object to update.
 * @returns {Object} - The updated state after processing the chunk.
 */
export function processChunk(chunk, taskFunction, state) {
  if (!Array.isArray(chunk)) throw new TypeError('Chunk must be an array.');
  if (typeof taskFunction !== 'function') throw new TypeError('Task function must be a function.');
  if (typeof state !== 'object' || state === null) throw new TypeError('State must be a non-null object.');

  for (const item of chunk) {
    const result = taskFunction(item);
    state.results.push(result);
  }
  state.processedChunks += 1;
  return state;
}

/**
 * Resumes a long-running computation from a saved state.
 * @param {Array} data - The full dataset to process.
 * @param {Object} state - The saved state object.
 * @param {Function} taskFunction - The function to apply to each item in the dataset.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Object} - The final state after completing the computation.
 */
export function resumeComputation(data, state, taskFunction, chunkSize) {
  if (!Array.isArray(data)) throw new TypeError('Data must be an array.');
  if (typeof state !== 'object' || state === null) throw new TypeError('State must be a non-null object.');
  if (typeof taskFunction !== 'function') throw new TypeError('Task function must be a function.');
  if (chunkSize <= 0) throw new RangeError('Chunk size must be greater than 0.');

  const chunks = chunkData(data, chunkSize);
  for (let i = state.processedChunks; i < chunks.length; i++) {
    processChunk(chunks[i], taskFunction, state);
  }
  return state;
}

/**
 * Initializes a new state object for a long-running computation.
 * @returns {Object} - A new state object with default values.
 */
export function initializeState() {
  return {
    processedChunks: 0,
    results: []
  };
}

/**
 * Example task function for processing data items.
 * Replace this with a domain-specific function as needed.
 * @param {any} item - The data item to process.
 * @returns {any} - The processed result.
 */
export function exampleTaskFunction(item) {
  // Example: Square a number
  if (typeof item !== 'number') throw new TypeError('Item must be a number.');
  return item * item;
} 
