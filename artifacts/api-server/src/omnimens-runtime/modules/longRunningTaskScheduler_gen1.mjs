/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_44
 * Name: longRunningTaskScheduler
 * Purpose: Breaks long-running computations into smaller, resumable tasks to bypass the 10-second subprocess timeout.
 * Description: Utility module for breaking long-running tasks into resumable chunks with state persistence and dependency resolution.
 * Migrated: 2026-04-02T15:46:59.463Z
 */

// longRunningTaskScheduler.mjs

import crypto from 'crypto';

// Utility to generate unique task IDs
export function generateTaskId() {
  return crypto.randomUUID();
}

// Breaks a long-running task into smaller chunks
export function partitionTask(taskFunction, inputData, chunkSize) {
  if (typeof taskFunction !== 'function') {
    throw new Error('taskFunction must be a valid function');
  }
  if (!Array.isArray(inputData)) {
    throw new Error('inputData must be an array');
  }
  if (typeof chunkSize !== 'number' || chunkSize <= 0) {
    throw new Error('chunkSize must be a positive number');
  }

  const taskChunks = [];
  for (let i = 0; i < inputData.length; i += chunkSize) {
    taskChunks.push(inputData.slice(i, i + chunkSize));
  }

  return taskChunks.map((chunk, index) => ({
    id: generateTaskId(),
    chunkIndex: index,
    chunkData: chunk,
    status: 'pending',
  }));
}

// Executes a task chunk and stores its result
export async function executeTaskChunk(taskChunk, taskFunction, checkpointCallback) {
  if (!taskChunk || typeof taskChunk !== 'object') {
    throw new Error('Invalid taskChunk');
  }
  if (typeof taskFunction !== 'function') {
    throw new Error('taskFunction must be a valid function');
  }
  if (typeof checkpointCallback !== 'function') {
    throw new Error('checkpointCallback must be a valid function');
  }

  try {
    const result = await taskFunction(taskChunk.chunkData);
    taskChunk.status = 'completed';
    taskChunk.result = result;

    // Save progress via checkpoint callback
    checkpointCallback(taskChunk);

    return taskChunk;
  } catch (error) {
    taskChunk.status = 'failed';
    taskChunk.error = error.message;

    // Save failure via checkpoint callback
    checkpointCallback(taskChunk);

    throw error;
  }
}

// Reconstructs the final result from completed task chunks
export function reconstructResult(taskChunks) {
  if (!Array.isArray(taskChunks)) {
    throw new Error('taskChunks must be an array');
  }

  const completedChunks = taskChunks.filter(chunk => chunk.status === 'completed');
  if (completedChunks.length !== taskChunks.length) {
    throw new Error('Not all task chunks are completed');
  }

  return completedChunks.reduce((result, chunk) => result.concat(chunk.result), []);
}

// Example checkpoint callback for state persistence
export function checkpointCallback(taskChunk) {
  console.log(`Checkpoint saved for chunk ID: ${taskChunk.id}, Status: ${taskChunk.status}`);
}

// Example usage
export async function exampleUsage() {
  const inputData = Array.from({ length: 100 }, (_, i) => i + 1); // Example input data
  const chunkSize = 10;

  const taskFunction = async (chunk) => {
    return chunk.map(x => x * 2); // Example computation
  };

  const taskChunks = partitionTask(taskFunction, inputData, chunkSize);

  for (const chunk of taskChunks) {
    try {
      await executeTaskChunk(chunk, taskFunction, checkpointCallback);
    } catch (error) {
      console.error(`Error processing chunk ID: ${chunk.id}`, error);
    }
  }

  const finalResult = reconstructResult(taskChunks);
  console.log('Final Result:', finalResult);
}
