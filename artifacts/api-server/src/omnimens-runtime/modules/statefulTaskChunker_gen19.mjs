/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: statefulTaskChunker
 * Written: 2026-04-02T14:53:34.551Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { createHash } from 'crypto';

/**
 * Utility to chunk long-running tasks into smaller, resumable units with state persistence.
 */

// Generate a unique hash for task state serialization
export function generateStateHash(state) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(state));
  return hash.digest('hex');
}

// Split a task into smaller chunks based on a chunk size
export function chunkTask(taskArray, chunkSize) {
  if (!Array.isArray(taskArray) || chunkSize <= 0) {
    throw new Error('Invalid task array or chunk size');
  }
  const chunks = [];
  for (let i = 0; i < taskArray.length; i += chunkSize) {
    chunks.push(taskArray.slice(i, i + chunkSize));
  }
  return chunks;
}

// Serialize intermediate state for persistence
export function serializeState(state) {
  return JSON.stringify(state);
}

// Deserialize state to resume computation
export function deserializeState(serializedState) {
  try {
    return JSON.parse(serializedState);
  } catch (error) {
    throw new Error('Failed to deserialize state');
  }
}

// Execute a chunked task with checkpointing
export async function executeChunkedTask(taskChunks, processFunction, checkpointCallback) {
  if (!Array.isArray(taskChunks) || typeof processFunction !== 'function') {
    throw new Error('Invalid task chunks or process function');
  }

  const results = [];
  for (let i = 0; i < taskChunks.length; i++) {
    const chunk = taskChunks[i];

    // Process the current chunk
    const chunkResults = await Promise.all(chunk.map(processFunction));
    results.push(...chunkResults);

    // Save checkpoint state after processing each chunk
    const checkpointState = {
      progress: i + 1,
      totalChunks: taskChunks.length,
      results
    };

    if (typeof checkpointCallback === 'function') {
      checkpointCallback(serializeState(checkpointState));
    }
  }

  return results;
}

// Example process function for demonstration purposes
export async function exampleProcessFunction(taskItem) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(taskItem * 2), 10); // Simulate async computation
  });
}

// Example checkpoint callback
export function exampleCheckpointCallback(serializedState) {
  console.log('Checkpoint saved:', serializedState);
}

// Example usage (uncomment for testing)
/*
(async () => {
  const tasks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const chunkSize = 3;
  const taskChunks = chunkTask(tasks, chunkSize);

  const results = await executeChunkedTask(
    taskChunks,
    exampleProcessFunction,
    exampleCheckpointCallback
  );

  console.log('Final results:', results);
})();
*/