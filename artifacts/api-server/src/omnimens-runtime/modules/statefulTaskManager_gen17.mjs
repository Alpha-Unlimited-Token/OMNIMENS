/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: statefulTaskManager
 * Written: 2026-04-01T22:03:20.217Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// statefulTaskManager.mjs

import { createHash } from 'crypto';

// Utility: Generate a unique hash for task identifiers
export function generateTaskId(taskName, params) {
  const hash = createHash('sha256');
  hash.update(taskName + JSON.stringify(params));
  return hash.digest('hex');
}

// In-memory storage for task states (fallback if no database is used)
const inMemoryStateStore = new Map();

// Save state to storage (PostgreSQL or in-memory fallback)
export async function saveTaskState(taskId, state, storageMethod = 'memory', dbClient = null) {
  if (storageMethod === 'database' && dbClient) {
    await dbClient.query(
      'INSERT INTO task_states (task_id, state) VALUES ($1, $2) ON CONFLICT (task_id) DO UPDATE SET state = $2',
      [taskId, JSON.stringify(state)]
    );
  } else {
    inMemoryStateStore.set(taskId, state);
  }
}

// Load state from storage
export async function loadTaskState(taskId, storageMethod = 'memory', dbClient = null) {
  if (storageMethod === 'database' && dbClient) {
    const result = await dbClient.query('SELECT state FROM task_states WHERE task_id = $1', [taskId]);
    return result.rows.length > 0 ? JSON.parse(result.rows[0].state) : null;
  } else {
    return inMemoryStateStore.get(taskId) || null;
  }
}

// Perform iterative computation with checkpointing
export async function performTaskWithCheckpointing(taskName, params, computeFunction, storageMethod = 'memory', dbClient = null) {
  const taskId = generateTaskId(taskName, params);
  let state = await loadTaskState(taskId, storageMethod, dbClient);

  if (!state) {
    state = { iteration: 0, result: null }; // Initialize state if not found
  }

  while (!state.completed) {
    state = computeFunction(state); // Perform one iteration of computation
    await saveTaskState(taskId, state, storageMethod, dbClient);
  }

  return state.result;
}

// Example compute function for testing (increments a counter until target is reached)
export function exampleComputeFunction(state) {
  const target = 10; // Example target value
  state.result = (state.result || 0) + 1;
  state.iteration++;
  state.completed = state.result >= target;
  return state;
}

// Utility: Clear in-memory state (for testing or resetting purposes)
export function clearInMemoryState() {
  inMemoryStateStore.clear();
}