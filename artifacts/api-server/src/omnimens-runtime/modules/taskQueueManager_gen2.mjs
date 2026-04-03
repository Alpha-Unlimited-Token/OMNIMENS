/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: taskQueueManager
 * Written: 2026-04-03T06:06:16.712Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// taskQueueManager.mjs

// Utility to manage and execute long-running tasks in smaller chunks

export class TaskQueueManager {
  constructor() {
    this.queue = [];
    this.taskStates = new Map();
  }

  // Add a new task to the queue
  addTask(taskId, taskFunction, initialState) {
    if (!taskId || typeof taskFunction !== 'function') {
      throw new Error('Invalid taskId or taskFunction');
    }
    this.queue.push(taskId);
    this.taskStates.set(taskId, { state: initialState, function: taskFunction });
  }

  // Execute a single step of the next task in the queue
  executeNextStep() {
    if (this.queue.length === 0) return null;

    const taskId = this.queue.shift();
    const taskData = this.taskStates.get(taskId);

    if (!taskData) throw new Error(`Task ${taskId} not found`);

    const { state, function: taskFunction } = taskData;
    const { nextState, isComplete } = taskFunction(state);

    if (!isComplete) {
      this.queue.push(taskId); // Re-add to queue for further processing
      this.taskStates.set(taskId, { state: nextState, function: taskFunction });
    } else {
      this.taskStates.delete(taskId); // Remove completed task
    }

    return { taskId, isComplete, nextState };
  }

  // Get the current state of a task
  getTaskState(taskId) {
    const taskData = this.taskStates.get(taskId);
    if (!taskData) return null;
    return taskData.state;
  }

  // Check if all tasks are completed
  areAllTasksComplete() {
    return this.queue.length === 0;
  }
}

// Define a task function that performs computation in steps
export function exampleTaskFunction(state) {
  const nextState = state + 1; // Increment state
  const isComplete = nextState >= 10; // Task completes when state reaches 10
  return { nextState, isComplete };
}

// Create a new instance of TaskQueueManager
export function createTaskQueueManager() {
  return new TaskQueueManager();
}