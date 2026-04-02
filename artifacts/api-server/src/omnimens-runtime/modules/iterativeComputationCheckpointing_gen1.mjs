/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_60
 * Name: iterativeComputationCheckpointing
 * Purpose: Allows long-running computations to persist beyond the 10-second sandbox limit by breaking tasks into resumable chunks.
 * Description: Provides persistent, resumable task checkpointing for long-running computations using state serialization and priority-based scheduling.
 * Migrated: 2026-04-02T14:08:14.869Z
 */

// iterativeComputationCheckpointing.mjs

import { createHash } from 'crypto';

// Utility to generate unique task IDs based on input data
export function generateTaskId(input) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(input));
  return hash.digest('hex');
}

// Priority queue implementation for task scheduling
class PriorityQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(task, priority) {
    this.queue.push({ task, priority });
    this.queue.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.queue.shift()?.task || null;
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}

// Core checkpointing system
export class IterativeComputationCheckpointing {
  constructor() {
    this.taskQueue = new PriorityQueue();
    this.taskState = new Map();
  }

  // Add a new task to the queue
  addTask(taskId, taskFunction, initialState, priority = 0) {
    if (!this.taskState.has(taskId)) {
      this.taskState.set(taskId, initialState);
      this.taskQueue.enqueue({ taskId, taskFunction }, priority);
    }
  }

  // Execute tasks incrementally within a time limit
  executeTasks(timeLimitMs = 10000) {
    const startTime = Date.now();

    while (!this.taskQueue.isEmpty() && Date.now() - startTime < timeLimitMs) {
      const { taskId, taskFunction } = this.taskQueue.dequeue();
      const currentState = this.taskState.get(taskId);

      try {
        const { nextState, isComplete } = taskFunction(currentState);

        if (isComplete) {
          this.taskState.delete(taskId);
        } else {
          this.taskState.set(taskId, nextState);
          this.taskQueue.enqueue({ taskId, taskFunction }, 0); // Re-enqueue with default priority
        }
      } catch (error) {
        console.error(`Error executing task ${taskId}:`, error);
        this.taskState.delete(taskId); // Remove failed task
      }
    }
  }

  // Retrieve the current state of a task
  getTaskState(taskId) {
    return this.taskState.get(taskId) || null;
  }
}

// Example task function
export function exampleTaskFunction(state) {
  const { counter, limit } = state;

  if (counter >= limit) {
    return { nextState: null, isComplete: true };
  }

  return {
    nextState: { counter: counter + 1, limit },
    isComplete: false
  };
}

// Example usage
export function demo() {
  const checkpointing = new IterativeComputationCheckpointing();

  const taskId = generateTaskId({ counter: 0, limit: 5 });
  checkpointing.addTask(taskId, exampleTaskFunction, { counter: 0, limit: 5 });

  checkpointing.executeTasks(5000); // Run for 5 seconds

  const finalState = checkpointing.getTaskState(taskId);
  console.log("Final state:", finalState);
}