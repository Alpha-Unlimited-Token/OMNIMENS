/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: sandboxCheckpointManager
 * Written: 2026-04-02T14:54:11.280Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// sandboxCheckpointManager.mjs

import { createHash } from 'crypto';

/**
 * Serialize a state object to a JSON string with a hash for integrity.
 * @param {Object} state - The state object to serialize.
 * @returns {string} - Serialized state with integrity hash.
 */
export function serializeState(state) {
  const stateString = JSON.stringify(state);
  const hash = createHash('sha256').update(stateString).digest('hex');
  return JSON.stringify({ state: stateString, hash });
}

/**
 * Deserialize a serialized state string and verify its integrity.
 * @param {string} serialized - The serialized state string.
 * @returns {Object} - The original state object if valid.
 * @throws {Error} - If the hash validation fails.
 */
export function deserializeState(serialized) {
  const { state, hash } = JSON.parse(serialized);
  const recalculatedHash = createHash('sha256').update(state).digest('hex');
  if (recalculatedHash !== hash) {
    throw new Error('State integrity check failed.');
  }
  return JSON.parse(state);
}

/**
 * Task scheduler to manage checkpointed subprocesses.
 * @param {Array<Function>} tasks - Array of async tasks to execute.
 * @param {number} checkpointInterval - Number of tasks between checkpoints.
 * @param {Function} saveCheckpoint - Function to save state at a checkpoint.
 * @param {Function} loadCheckpoint - Function to load state from a checkpoint.
 * @returns {Promise<void>} - Resolves when all tasks are completed.
 */
export async function taskScheduler(tasks, checkpointInterval, saveCheckpoint, loadCheckpoint) {
  let state = { currentIndex: 0 };

  try {
    state = await loadCheckpoint();
  } catch {
    // No valid checkpoint found, start fresh.
  }

  for (let i = state.currentIndex; i < tasks.length; i++) {
    await tasks[i]();
    state.currentIndex = i + 1;

    if (state.currentIndex % checkpointInterval === 0 || state.currentIndex === tasks.length) {
      await saveCheckpoint(state);
    }
  }
}

/**
 * Utility function to create a simple in-memory checkpoint manager.
 * @returns {Object} - An object with saveCheckpoint and loadCheckpoint functions.
 */
export function createInMemoryCheckpointManager() {
  let checkpoint = null;

  return {
    async saveCheckpoint(state) {
      checkpoint = serializeState(state);
    },

    async loadCheckpoint() {
      if (!checkpoint) {
        throw new Error('No checkpoint available.');
      }
      return deserializeState(checkpoint);
    }
  };
}

/**
 * Example utility to create tasks for testing.
 * @param {number} count - Number of tasks to create.
 * @returns {Array<Function>} - Array of async functions simulating tasks.
 */
export function createMockTasks(count) {
  return Array.from({ length: count }, (_, i) => async () => {
    console.log(`Executing task ${i + 1}`);
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
}
