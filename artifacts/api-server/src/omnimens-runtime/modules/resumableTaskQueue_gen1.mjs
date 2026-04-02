/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_35
 * Name: resumableTaskQueue
 * Purpose: Allows complex computations to be split into smaller tasks that can resume after subprocess timeouts.
 * Description: A resumable task queue with state serialization and checkpointing, enabling complex computations to be split and resumed after timeouts.
 * Migrated: 2026-04-02T14:21:19.468Z
 */

// resumableTaskQueue.mjs

import { createHash } from 'crypto';

// Utility function to hash task states for unique identification
export function hashState(state) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(state));
  return hash.digest('hex');
}

// TaskQueue class to manage resumable tasks
export class TaskQueue {
  constructor() {
    this.queue = []; // Priority queue to store tasks
    this.taskMap = new Map(); // Map to store task states by ID
  }

  // Add a task to the queue with a priority
  addTask(taskFunction, initialState, priority = 0) {
    const taskId = hashState(initialState);
    if (!this.taskMap.has(taskId)) {
      this.taskMap.set(taskId, { state: initialState, completed: false });
      this.queue.push({ taskId, taskFunction, priority });
      this.queue.sort((a, b) => b.priority - a.priority); // Higher priority first
    }
    return taskId;
  }

  // Process the next task in the queue
  processNextTask() {
    if (this.queue.length === 0) return null;

    const { taskId, taskFunction } = this.queue.shift();
    const taskState = this.taskMap.get(taskId);

    if (!taskState || taskState.completed) return null;

    try {
      const result = taskFunction(taskState.state);
      if (result.done) {
        taskState.completed = true;
      } else {
        taskState.state = result.state; // Update state for resumption
        this.queue.push({ taskId, taskFunction, priority: 0 }); // Re-enqueue with default priority
      }
    } catch (error) {
      console.error(`Task ${taskId} failed:`, error);
    }

    return taskId;
  }

  // Check if a task is completed
  isTaskCompleted(taskId) {
    const taskState = this.taskMap.get(taskId);
    return taskState ? taskState.completed : false;
  }

  // Get the current state of a task
  getTaskState(taskId) {
    const taskState = this.taskMap.get(taskId);
    return taskState ? taskState.state : null;
  }

  // Get the number of tasks in the queue
  getQueueSize() {
    return this.queue.length;
  }
}

// Example utility function for splitting a computation into smaller tasks
export function createSegmentedTask(computationFunction, segmentSize) {
  return function segmentedTask(state) {
    const { data, index } = state;
    const end = Math.min(index + segmentSize, data.length);
    const segment = data.slice(index, end);
    const result = computationFunction(segment);

    return {
      done: end >= data.length,
      state: { data, index: end, result: (state.result || []).concat(result) },
    };
  };
}

// Example usage (commented out for production)
/*
const queue = new TaskQueue();
const taskId = queue.addTask(
  createSegmentedTask((segment) => segment.map((x) => x * 2), 3),
  { data: [1, 2, 3, 4, 5, 6], index: 0 },
  1
);

while (queue.getQueueSize() > 0) {
  queue.processNextTask();
}

console.log(queue.getTaskState(taskId));
*/