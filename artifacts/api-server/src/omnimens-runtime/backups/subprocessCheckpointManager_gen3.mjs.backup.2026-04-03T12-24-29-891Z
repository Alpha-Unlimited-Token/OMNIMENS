/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointManager
 * Written: 2026-04-02T15:12:48.488Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// subprocessCheckpointManager.mjs

import { createHash } from 'crypto';

// In-memory persistence layer for simplicity (can be replaced with a database like PostgreSQL)
const checkpointStore = new Map();

/**
 * Generates a unique key for a subprocess checkpoint based on its identifier and state.
 * @param {string} processId - Unique identifier for the subprocess.
 * @param {object} state - Current state of the subprocess.
 * @returns {string} - A unique hash key.
 */
export function generateCheckpointKey(processId, state) {
  const hash = createHash('sha256');
  hash.update(processId + JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Saves the current state of a subprocess to the persistence layer.
 * @param {string} processId - Unique identifier for the subprocess.
 * @param {object} state - State object to save.
 * @returns {void}
 */
export function saveCheckpoint(processId, state) {
  const key = generateCheckpointKey(processId, state);
  checkpointStore.set(key, { processId, state, timestamp: Date.now() });
}

/**
 * Retrieves the last saved state of a subprocess from the persistence layer.
 * @param {string} processId - Unique identifier for the subprocess.
 * @returns {object|null} - The last saved state or null if not found.
 */
export function retrieveCheckpoint(processId) {
  const entries = Array.from(checkpointStore.values()).filter(entry => entry.processId === processId);
  if (entries.length === 0) return null;

  // Return the most recent checkpoint
  return entries.reduce((latest, entry) => (entry.timestamp > latest.timestamp ? entry : latest), entries[0]).state;
}

/**
 * Deletes all checkpoints associated with a subprocess.
 * @param {string} processId - Unique identifier for the subprocess.
 * @returns {void}
 */
export function clearCheckpoints(processId) {
  for (const [key, value] of checkpointStore.entries()) {
    if (value.processId === processId) {
      checkpointStore.delete(key);
    }
  }
}

/**
 * Lists all active subprocesses with saved checkpoints.
 * @returns {string[]} - Array of unique process IDs with saved checkpoints.
 */
export function listActiveProcesses() {
  return Array.from(new Set(Array.from(checkpointStore.values()).map(entry => entry.processId)));
}

/**
 * Utility function to resume computation from the last checkpoint or initialize a new state.
 * @param {string} processId - Unique identifier for the subprocess.
 * @param {function} computationFunction - Function to execute computation, taking the current state as input.
 * @param {object} initialState - Initial state to use if no checkpoint exists.
 * @returns {object} - Final state after computation.
 */
export function resumeOrInitialize(processId, computationFunction, initialState) {
  const lastCheckpoint = retrieveCheckpoint(processId);
  const currentState = lastCheckpoint || initialState;
  const newState = computationFunction(currentState);
  saveCheckpoint(processId, newState);
  return newState;
}

// Example usage (to be removed in production):
// const result = resumeOrInitialize('exampleProcess', state => ({ ...state, count: (state.count || 0) + 1 }), { count: 0 });
// console.log(result);