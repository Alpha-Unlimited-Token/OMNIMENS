/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedSubprocessScheduler
 * Written: 2026-04-02T13:31:19.593Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedSubprocessScheduler.mjs

import { Worker, isMainThread, parentPort } from 'worker_threads';
import { randomUUID } from 'crypto';

const sharedState = new Map(); // Shared memory store for task states

export function scheduleTask(taskFunction, taskData, chunkSize, onComplete) {
  if (typeof taskFunction !== 'function') {
    throw new Error('taskFunction must be a function');
  }
  const taskId = randomUUID();
  sharedState.set(taskId, { taskData, progress: 0 });

  function processChunk() {
    const state = sharedState.get(taskId);
    if (!state) return;

    const { taskData, progress } = state;
    const chunk = taskData.slice(progress, progress + chunkSize);
    if (chunk.length === 0) {
      sharedState.delete(taskId);
      if (onComplete) onComplete(taskId);
      return;
    }

    try {
      taskFunction(chunk, progress);
      sharedState.set(taskId, { taskData, progress: progress + chunkSize });
      setImmediate(processChunk); // Schedule the next chunk
    } catch (error) {
      sharedState.delete(taskId);
      throw error;
    }
  }

  processChunk();
  return taskId;
}

export function getTaskState(taskId) {
  return sharedState.get(taskId) || null;
}

export function cancelTask(taskId) {
  return sharedState.delete(taskId);
}

if (!isMainThread) {
  parentPort.on('message', ({ taskFunction, taskData, chunkSize }) => {
    const taskId = scheduleTask(taskFunction, taskData, chunkSize, () => {
      parentPort.postMessage({ taskId, status: 'complete' });
    });
    parentPort.postMessage({ taskId, status: 'started' });
  });
}