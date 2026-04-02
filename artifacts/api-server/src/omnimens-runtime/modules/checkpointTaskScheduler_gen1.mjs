/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_3
 * Name: checkpointTaskScheduler
 * Purpose: Allows iterative computations to resume from checkpoints within the subprocess sandbox timeout limit.
 * Description: Provides utilities for checkpoint-based iterative task processing to handle large computations within timeout limits.
 * Migrated: 2026-04-02T20:57:44.390Z
 */

// checkpointTaskScheduler.mjs

import crypto from 'crypto';

/**
 * Generates a unique identifier for checkpoint keys.
 * @returns {string} A unique identifier string.
 */
export function generateCheckpointKey() {
  return crypto.randomUUID();
}

/**
 * Divides a task into smaller chunks based on a chunk size.
 * @param {Array} taskData - The data to be processed.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Array<Array>} Array of task chunks.
 */
export function divideTaskIntoChunks(taskData, chunkSize) {
  if (!Array.isArray(taskData) || chunkSize <= 0) {
    throw new Error("Invalid input: taskData must be an array and chunkSize must be greater than zero.");
  }
  const chunks = [];
  for (let i = 0; i < taskData.length; i += chunkSize) {
    chunks.push(taskData.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Saves the state of computation at a checkpoint.
 * @param {Map} checkpointStore - A Map to store checkpoint data.
 * @param {string} checkpointKey - The unique key for the checkpoint.
 * @param {any} state - The state to save.
 */
export function saveCheckpoint(checkpointStore, checkpointKey, state) {
  if (!(checkpointStore instanceof Map)) {
    throw new Error("Invalid input: checkpointStore must be a Map instance.");
  }
  checkpointStore.set(checkpointKey, state);
}

/**
 * Resumes computation from a saved checkpoint.
 * @param {Map} checkpointStore - A Map containing checkpoint data.
 * @param {string} checkpointKey - The unique key for the checkpoint.
 * @returns {any} The saved state, or null if no checkpoint exists.
 */
export function resumeCheckpoint(checkpointStore, checkpointKey) {
  if (!(checkpointStore instanceof Map)) {
    throw new Error("Invalid input: checkpointStore must be a Map instance.");
  }
  return checkpointStore.get(checkpointKey) || null;
}

/**
 * Iteratively processes a task by dividing it into chunks, saving checkpoints, and resuming as needed.
 * @param {Array} taskData - The data to process.
 * @param {number} chunkSize - The size of each chunk.
 * @param {Function} processChunk - A function to process each chunk.
 * @param {Map} checkpointStore - A Map to store checkpoints.
 * @param {string} checkpointKey - The unique key for the checkpoint.
 * @returns {any} The final result of the computation.
 */
export function iterativeTaskProcessor(taskData, chunkSize, processChunk, checkpointStore, checkpointKey) {
  if (!Array.isArray(taskData) || chunkSize <= 0 || typeof processChunk !== 'function') {
    throw new Error("Invalid input: taskData must be an array, chunkSize must be greater than zero, and processChunk must be a function.");
  }

  let startIndex = 0;
  const savedState = resumeCheckpoint(checkpointStore, checkpointKey);

  if (savedState) {
    startIndex = savedState.startIndex;
  }

  const chunks = divideTaskIntoChunks(taskData, chunkSize);

  for (let i = startIndex; i < chunks.length; i++) {
    const result = processChunk(chunks[i]);

    // Save checkpoint after processing each chunk
    saveCheckpoint(checkpointStore, checkpointKey, { startIndex: i + 1, lastResult: result });
  }

  return resumeCheckpoint(checkpointStore, checkpointKey)?.lastResult || null;
}

/**
 * Example processing function for a chunk.
 * @param {Array} chunk - The chunk to process.
 * @returns {number} The sum of the chunk.
 */
export function exampleProcessChunk(chunk) {
  return chunk.reduce((sum, num) => sum + num, 0);
}