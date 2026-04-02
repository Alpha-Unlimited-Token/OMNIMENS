/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: longRunningTaskScheduler
 * Written: 2026-04-02T15:16:42.382Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
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
    status: 'pending'
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
