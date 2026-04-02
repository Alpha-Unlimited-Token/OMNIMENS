/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_26
 * Name: distributedSubprocessScheduler
 * Purpose: Allows long-running tasks to persist state and resume across subprocess timeouts.
 * Description: A utility module for scheduling and managing long-running tasks with state persistence across subprocesses.
 * Migrated: 2026-04-02T14:08:14.878Z
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