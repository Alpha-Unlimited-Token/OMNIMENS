/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_12
 * Name: taskQueuingSystem
 * Purpose: Enable long-running computations by breaking them into smaller tasks that can persist across subprocess executions.
 * Description: A modular task queuing system with checkpointing and state restoration for long-running computations.
 * Migrated: 2026-04-01T22:23:20.234Z
 */

// taskQueuingSystem.mjs

import { createHash } from 'crypto';

// Utility to create unique task IDs
export function generateTaskId(taskName, params) {
  const hash = createHash('sha256');
  hash.update(taskName + JSON.stringify(params));
  return hash.digest('hex');
}

// In-memory storage for tasks (can be swapped with PostgreSQL)
const taskStorage = new Map();

// Save task state (checkpointing)
export function saveTaskState(taskId, state) {
  taskStorage.set(taskId, state);
}

// Restore task state
export function restoreTaskState(taskId) {
  return taskStorage.get(taskId) || null;
}

// Task scheduler to execute long-running computations incrementally
export async function executeTask(taskId, taskFunction, params, checkpointFunction) {
  let state = restoreTaskState(taskId);

  if (!state) {
    state = { progress: 0, result: null };
    saveTaskState(taskId, state);
  }

  while (state.progress < 1) {
    const { partialResult, progress } = await taskFunction(params, state.progress);
    state.result = checkpointFunction(state.result, partialResult);
    state.progress = progress;
    saveTaskState(taskId, state);
  }

  return state.result;
}

// Example checkpoint function (generic reducer)
export function combineResults(existingResult, newResult) {
  if (!existingResult) return newResult;
  return existingResult.concat(newResult);
}

// Example task function (generic computation)
export async function exampleTaskFunction(params, progress) {
  const totalSteps = params.steps || 10;
  const stepSize = 1 / totalSteps;

  const nextProgress = Math.min(progress + stepSize, 1);
  const partialResult = Array.from({ length: Math.ceil(totalSteps * stepSize) }, (_, i) => i + Math.ceil(totalSteps * progress));

  return { partialResult, progress: nextProgress };
}

// Example usage
export async function runExample() {
  const taskId = generateTaskId('exampleTask', { steps: 10 });
  const result = await executeTask(taskId, exampleTaskFunction, { steps: 10 }, combineResults);
  return result;
}