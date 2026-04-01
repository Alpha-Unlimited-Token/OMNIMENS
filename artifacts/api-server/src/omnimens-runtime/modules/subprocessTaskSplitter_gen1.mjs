/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_18
 * Name: subprocessTaskSplitter
 * Purpose: Enable complex iterative computations by splitting tasks into smaller chunks while preserving intermediate state.
 * Description: A utility module for splitting tasks into smaller chunks, processing them iteratively, and preserving intermediate state for resumable computations.
 * Migrated: 2026-04-01T22:23:20.229Z
 */

// subprocessTaskSplitter.mjs

import { createHash } from 'crypto';

// Utility to create unique task IDs based on input data
export function generateTaskId(input) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(input));
  return hash.digest('hex');
}

// Simulated in-memory database for intermediate state (replace with PostgreSQL in production)
const taskStateStore = new Map();

// Save intermediate state for a task
export function saveTaskState(taskId, state) {
  if (typeof taskId !== 'string' || !taskId) {
    throw new Error('Invalid taskId. Must be a non-empty string.');
  }
  taskStateStore.set(taskId, state);
}

// Load intermediate state for a task
export function loadTaskState(taskId) {
  if (typeof taskId !== 'string' || !taskId) {
    throw new Error('Invalid taskId. Must be a non-empty string.');
  }
  return taskStateStore.get(taskId) || null;
}

// Split a large task into smaller chunks and process iteratively
export function splitAndProcessTask(taskId, taskData, processChunkFunction, chunkSize = 10) {
  if (typeof processChunkFunction !== 'function') {
    throw new Error('processChunkFunction must be a valid function.');
  }
  
  // Load existing state or initialize new state
  let state = loadTaskState(taskId) || { completedChunks: 0, results: [] };

  const totalChunks = Math.ceil(taskData.length / chunkSize);

  // Process remaining chunks
  for (let i = state.completedChunks; i < totalChunks; i++) {
    const chunk = taskData.slice(i * chunkSize, (i + 1) * chunkSize);
    const result = processChunkFunction(chunk);

    // Save result and update state
    state.results.push(result);
    state.completedChunks = i + 1;
    saveTaskState(taskId, state);
  }

  return state.results;
}

// Example utility function to process a chunk (can be replaced by any domain-specific logic)
export function exampleProcessChunk(chunk) {
  return chunk.map(x => x * 2); // Example: double each number in the chunk
}

// Clear task state (for cleanup or restarting tasks)
export function clearTaskState(taskId) {
  if (typeof taskId !== 'string' || !taskId) {
    throw new Error('Invalid taskId. Must be a non-empty string.');
  }
  taskStateStore.delete(taskId);
}