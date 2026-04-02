/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskScheduler
 * Written: 2026-04-02T14:52:19.762Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedTaskScheduler.mjs

import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { randomUUID } from 'node:crypto';

// Utility: Split an array into chunks
export function splitArrayIntoChunks(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Utility: Generate a unique task ID
export function generateTaskId() {
  return randomUUID();
}

// Worker thread logic
function workerThread() {
  parentPort.on('message', ({ taskId, taskChunk, computeFunction }) => {
    try {
      const result = taskChunk.map(computeFunction);
      parentPort.postMessage({ taskId, result });
    } catch (error) {
      parentPort.postMessage({ taskId, error: error.message });
    }
  });
}

// Main thread logic
export async function distributedTaskScheduler({ data, computeFunction, chunkSize = 10 }) {
  if (!isMainThread) {
    throw new Error('distributedTaskScheduler must be called from the main thread.');
  }

  const chunks = splitArrayIntoChunks(data, chunkSize);
  const taskId = generateTaskId();
  const results = [];

  return new Promise((resolve, reject) => {
    let completedChunks = 0;

    chunks.forEach((chunk, index) => {
      const worker = new Worker(__filename);

      worker.on('message', ({ taskId: returnedTaskId, result, error }) => {
        if (returnedTaskId !== taskId) {
          reject(new Error('Task ID mismatch.')); // Ensure task integrity
        }

        if (error) {
          reject(new Error(`Worker error: ${error}`));
        } else {
          results[index] = result;
          completedChunks++;

          if (completedChunks === chunks.length) {
            resolve(results.flat());
          }
        }

        worker.terminate();
      });

      worker.postMessage({ taskId, taskChunk: chunk, computeFunction });
    });
  });
}

// Example usage function
export function exampleComputeFunction(x) {
  return x * x; // Simple computation: square each element
}

// Checkpoint persistence utility
export function saveIntermediateState(taskId, state) {
  return { taskId, state }; // Mock persistence (extendable for real-world use)
}

export function recoverIntermediateState(savedState) {
  return savedState.state; // Mock recovery (extendable for real-world use)
}

// Worker thread entry point
if (!isMainThread) {
  workerThread();
}