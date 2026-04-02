/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeTaskManager
 * Written: 2026-04-02T14:53:08.711Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeTaskManager.mjs

import { createHash } from 'crypto';

// Utility function to generate a unique checkpoint ID based on task state
export function generateCheckpointId(taskState) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(taskState));
  return hash.digest('hex');
}

// Task Queue class to manage stateful tasks with priority scheduling
export class TaskQueue {
  constructor() {
    this.queue = []; // Stores tasks as { id, priority, state, execute }
    this.checkpoints = new Map(); // Stores resumable states by checkpoint ID
  }

  // Add a task to the queue
  addTask(taskId, priority, initialState, executeFunction) {
    if (typeof executeFunction !== 'function') {
      throw new Error('executeFunction must be a valid function');
    }
    this.queue.push({ id: taskId, priority, state: initialState, execute: executeFunction });
    this.queue.sort((a, b) => b.priority - a.priority); // Higher priority first
  }

  // Execute the next task incrementally
  executeNext() {
    if (this.queue.length === 0) {
      return null; // No tasks to execute
    }

    const task = this.queue.shift();
    const checkpointId = generateCheckpointId(task.state);

    try {
      const result = task.execute(task.state);

      if (result.done) {
        return { taskId: task.id, status: 'completed', output: result.output };
      } else {
        task.state = result.nextState;
        this.checkpoints.set(checkpointId, task.state);
        this.queue.push(task);
        this.queue.sort((a, b) => b.priority - a.priority); // Re-sort after re-adding
        return { taskId: task.id, status: 'in-progress', checkpointId }; // Return checkpoint info
      }
    } catch (error) {
      return { taskId: task.id, status: 'error', error: error.message };
    }
  }

  // Resume a task from a checkpoint
  resumeFromCheckpoint(checkpointId) {
    const state = this.checkpoints.get(checkpointId);
    if (!state) {
      throw new Error(`No checkpoint found for ID: ${checkpointId}`);
    }

    const taskIndex = this.queue.findIndex(task => generateCheckpointId(task.state) === checkpointId);
    if (taskIndex === -1) {
      throw new Error(`No matching task found for checkpoint ID: ${checkpointId}`);
    }

    const task = this.queue[taskIndex];
    task.state = state; // Restore state
    return task;
  }

  // Clear completed checkpoints
  clearCheckpoints() {
    this.checkpoints.clear();
  }
}

// Example utility function for incremental computation
export function exampleIncrementalTask(state) {
  const { current, goal } = state;
  const next = current + 1;

  if (next >= goal) {
    return { done: true, output: `Reached goal: ${goal}` };
  } else {
    return { done: false, nextState: { current: next, goal } };
  }
}

// Exported instance for shared use
export const sharedTaskQueue = new TaskQueue();