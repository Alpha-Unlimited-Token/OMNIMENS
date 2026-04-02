/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: asyncTaskManager
 * Written: 2026-04-02T14:12:00.882Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// asyncTaskManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash-based unique ID for task state serialization.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash ID.
 */
export function generateTaskId(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Divides a long-running task into smaller chunks for async processing.
 * @param {Function} taskFunction - The function to execute for each chunk.
 * @param {Array} data - The data to process in chunks.
 * @param {Object} options - Configuration options (e.g., chunkSize).
 * @returns {Promise} - Resolves when all chunks are processed.
 */
export async function processInChunks(taskFunction, data, options = { chunkSize: 10 }) {
  const { chunkSize } = options;
  const totalChunks = Math.ceil(data.length / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const chunk = data.slice(i * chunkSize, (i + 1) * chunkSize);
    await taskFunction(chunk, i, totalChunks);
  }
}

/**
 * Serializes the state of a task for persistence.
 * @param {Object} state - The current state of the task.
 * @returns {string} - Serialized state as a JSON string.
 */
export function serializeState(state) {
  return JSON.stringify(state);
}

/**
 * Deserializes a serialized state string back into an object.
 * @param {string} serializedState - The serialized state string.
 * @returns {Object} - Deserialized state object.
 */
export function deserializeState(serializedState) {
  return JSON.parse(serializedState);
}

/**
 * Manages the execution of a task with checkpoint-based state persistence.
 * @param {Function} taskFunction - The function to execute for each chunk.
 * @param {Array} data - The data to process in chunks.
 * @param {Object} options - Configuration options (e.g., chunkSize, checkpointCallback).
 * @returns {Promise} - Resolves when all chunks are processed.
 */
export async function checkpointTaskManager(taskFunction, data, options = { chunkSize: 10, checkpointCallback: null }) {
  const { chunkSize, checkpointCallback } = options;
  const totalChunks = Math.ceil(data.length / chunkSize);
  let state = { currentChunk: 0, totalChunks, processedData: [] };

  while (state.currentChunk < totalChunks) {
    const chunk = data.slice(state.currentChunk * chunkSize, (state.currentChunk + 1) * chunkSize);
    const result = await taskFunction(chunk, state.currentChunk, totalChunks);

    state.processedData.push(result);
    state.currentChunk++;

    if (checkpointCallback) {
      checkpointCallback(serializeState(state));
    }
  }

  return state.processedData;
}

/**
 * Example utility function for cross-agent use: Computes the sum of an array chunk.
 * @param {Array<number>} chunk - The chunk of numbers to process.
 * @returns {number} - The sum of the chunk.
 */
export function sumChunk(chunk) {
  return chunk.reduce((sum, num) => sum + num, 0);
}

/**
 * Example utility function for cross-agent use: Finds the maximum in an array chunk.
 * @param {Array<number>} chunk - The chunk of numbers to process.
 * @returns {number} - The maximum value in the chunk.
 */
export function maxChunk(chunk) {
  return Math.max(...chunk);
}
