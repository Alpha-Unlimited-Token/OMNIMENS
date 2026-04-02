/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeComputationManager
 * Written: 2026-04-02T14:54:49.973Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeComputationManager.mjs
import { createHash } from 'crypto';

/**
 * Splits long-running tasks into smaller subprocesses, enabling checkpoint-based continuation beyond timeout limits.
 * This module provides utilities for state serialization, dependency tracking, and iterative task execution.
 */

// Utility to generate a unique hash for task states
export function generateStateHash(state) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(state));
  return hash.digest('hex');
}

// Serialize task state to a JSON string
export function serializeState(state) {
  try {
    return JSON.stringify(state);
  } catch (error) {
    throw new Error('Failed to serialize state: ' + error.message);
  }
}

// Deserialize task state from a JSON string
export function deserializeState(serializedState) {
  try {
    return JSON.parse(serializedState);
  } catch (error) {
    throw new Error('Failed to deserialize state: ' + error.message);
  }
}

// Orchestrates an iterative task by splitting it into smaller steps
export async function iterativeTaskExecutor({
  initialState,
  stepFunction,
  isCompleteFunction,
  maxSteps = 100,
  onCheckpoint = () => {}
}) {
  let currentState = initialState;
  let stepCount = 0;

  while (!isCompleteFunction(currentState) && stepCount < maxSteps) {
    try {
      currentState = await stepFunction(currentState);
      stepCount++;

      // Call the checkpoint callback with the current state
      await onCheckpoint(currentState, stepCount);
    } catch (error) {
      throw new Error(`Error during task execution at step ${stepCount}: ${error.message}`);
    }
  }

  if (!isCompleteFunction(currentState)) {
    throw new Error('Task did not complete within the maximum allowed steps.');
  }

  return currentState;
}

// Example dependency tracking utility for tasks with dependencies
export function resolveDependencies(taskList) {
  const resolved = [];
  const unresolved = new Set();

  function resolve(task) {
    if (resolved.includes(task)) return;
    if (unresolved.has(task)) {
      throw new Error('Circular dependency detected: ' + task);
    }

    unresolved.add(task);

    for (const dependency of task.dependencies || []) {
      resolve(dependency);
    }

    unresolved.delete(task);
    resolved.push(task);
  }

  for (const task of taskList) {
    resolve(task);
  }

  return resolved;
}

// Example utility to check progress of an iterative task
export function calculateProgress(currentStep, totalSteps) {
  if (totalSteps <= 0) {
    throw new Error('Total steps must be greater than zero.');
  }
  return Math.min(100, (currentStep / totalSteps) * 100);
}
