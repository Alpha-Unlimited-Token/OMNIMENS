/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_59
 * Name: checkpointedTaskExecutor
 * Purpose: Allows iterative, long-running computations by checkpointing intermediate states and restoring them for continuation.
 * Description: Provides checkpointing and state restoration for long-running tasks, enabling resumable computations with intermediate state persistence.
 * Migrated: 2026-04-02T14:50:29.437Z
 */

// checkpointedTaskExecutor.mjs

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';

/**
 * Serialize a JavaScript object to a JSON string with deterministic ordering.
 * Ensures consistent checkpointing.
 * @param {object} state - The state object to serialize.
 * @returns {string} - Serialized JSON string.
 */
export function serializeState(state) {
  return JSON.stringify(state, Object.keys(state).sort());
}

/**
 * Deserialize a JSON string back to a JavaScript object.
 * @param {string} serializedState - The JSON string to deserialize.
 * @returns {object} - The deserialized state object.
 */
export function deserializeState(serializedState) {
  return JSON.parse(serializedState);
}

/**
 * Generate a unique hash for a given state object.
 * Used to identify checkpoints.
 * @param {object} state - The state object to hash.
 * @returns {string} - A unique hash string.
 */
export function generateStateHash(state) {
  const hash = createHash('sha256');
  hash.update(serializeState(state));
  return hash.digest('hex');
}

/**
 * Save a checkpoint to disk.
 * @param {string} checkpointDir - Directory to save the checkpoint.
 * @param {object} state - The state object to checkpoint.
 */
export function saveCheckpoint(checkpointDir, state) {
  const hash = generateStateHash(state);
  const filePath = resolve(checkpointDir, `${hash}.json`);
  writeFileSync(filePath, serializeState(state), 'utf-8');
}

/**
 * Load a checkpoint from disk if it exists.
 * @param {string} checkpointDir - Directory to load the checkpoint from.
 * @param {string} stateHash - The hash of the state to load.
 * @returns {object|null} - The loaded state object, or null if not found.
 */
export function loadCheckpoint(checkpointDir, stateHash) {
  const filePath = resolve(checkpointDir, `${stateHash}.json`);
  if (!existsSync(filePath)) return null;
  const serializedState = readFileSync(filePath, 'utf-8');
  return deserializeState(serializedState);
}

/**
 * Execute a long-running task with checkpointing support.
 * Automatically resumes from the last checkpoint if available.
 * @param {string} checkpointDir - Directory to store checkpoints.
 * @param {object} initialState - The initial state of the task.
 * @param {function} taskFunction - Function to execute the task. Receives (state) and must return updated state.
 * @param {number} checkpointInterval - Number of iterations between checkpoints.
 * @returns {object} - Final state after task completion.
 */
export async function checkpointedTaskExecutor(checkpointDir, initialState, taskFunction, checkpointInterval = 10) {
  let state = initialState;
  let iteration = state.iteration || 0;

  while (!state.completed) {
    const stateHash = generateStateHash(state);
    const checkpoint = loadCheckpoint(checkpointDir, stateHash);

    if (checkpoint) {
      state = checkpoint;
      iteration = state.iteration;
    } else {
      state = await taskFunction(state);
      state.iteration = ++iteration;

      if (iteration % checkpointInterval === 0) {
        saveCheckpoint(checkpointDir, state);
      }
    }
  }

  return state;
}

/**
 * Example task function for demonstration purposes.
 * Simulates a long-running computation.
 * @param {object} state - Current state of the task.
 * @returns {object} - Updated state.
 */
export async function exampleTaskFunction(state) {
  state.progress = (state.progress || 0) + 1;
  state.completed = state.progress >= 100;
  return new Promise(resolve => setTimeout(() => resolve(state), 100));
}