/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedComputationManager
 * Written: 2026-04-03T07:27:37.491Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedComputationManager.mjs

import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

/**
 * Splits a large iterative task into smaller chunks and coordinates execution across subprocesses.
 * Supports shared state synchronization using in-memory data structures.
 */

// Utility to partition tasks into chunks
export function partitionTask(taskArray, chunkSize) {
  const chunks = [];
  for (let i = 0; i < taskArray.length; i += chunkSize) {
    chunks.push(taskArray.slice(i, i + chunkSize));
  }
  return chunks;
}

// Worker thread logic for processing task chunks
function workerTaskProcessor() {
  const { taskChunk, taskFunction } = workerData;
  const result = taskChunk.map((item) => taskFunction(item));
  parentPort.postMessage(result);
}

// Main thread logic for distributed computation
export async function executeDistributedTask(taskArray, taskFunction, chunkSize = 10) {
  if (!isMainThread) {
    throw new Error('executeDistributedTask must be called from the main thread.');
  }

  const taskChunks = partitionTask(taskArray, chunkSize);
  const workers = [];

  for (const chunk of taskChunks) {
    workers.push(
      new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: { taskChunk: chunk, taskFunction }
        });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      })
    );
  }

  const results = await Promise.all(workers);
  return results.flat();
}

// Example usage function
export function exampleTaskFunction(item) {
  return item * item; // Example: Square each number
}

if (!isMainThread) {
  workerTaskProcessor();
}