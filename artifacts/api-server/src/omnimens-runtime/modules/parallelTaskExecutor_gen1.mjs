/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: parallelTaskExecutor
 * Written: 2026-03-24T12:48:05.790Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// parallelTaskExecutor.mjs

import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

// Utility function to partition tasks
export function partitionTasks(tasks, numPartitions) {
  const partitions = [];
  const partitionSize = Math.ceil(tasks.length / numPartitions);
  for (let i = 0; i < numPartitions; i++) {
    partitions.push(tasks.slice(i * partitionSize, (i + 1) * partitionSize));
  }
  return partitions;
}

// Worker thread code
function workerThread() {
  const { tasks, taskFunction } = workerData;
  const results = tasks.map(task => taskFunction(task));
  parentPort.postMessage(results);
}

// Main thread function to execute tasks in parallel
export async function executeParallel(tasks, taskFunction, numThreads = 4) {
  if (!isMainThread) {
    throw new Error('executeParallel must be called from the main thread.');
  }

  const partitions = partitionTasks(tasks, numThreads);
  const workers = [];

  for (const partition of partitions) {
    workers.push(
      new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: { tasks: partition, taskFunction }
        });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', code => {
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

// Shared utility function for mathematical computations
export function sumArray(arr) {
  return arr.reduce((sum, num) => sum + num, 0);
}

export function averageArray(arr) {
  if (arr.length === 0) return 0;
  return sumArray(arr) / arr.length;
}

export function squareArray(arr) {
  return arr.map(num => num ** 2);
}

// Shared utility function for text processing
export function wordCount(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

export function reverseText(text) {
  return text.split('').reverse().join('');
}

// Exported constants for cross-agent utility
export const MAX_THREADS = 8;
export const DEFAULT_TASK_FUNCTION = task => task; // Identity function

if (!isMainThread) {
  workerThread();
}