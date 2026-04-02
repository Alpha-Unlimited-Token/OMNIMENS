/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_5
 * Name: asyncCheckpointScheduler
 * Purpose: Allows prolonged computations by saving intermediate states and resuming after subprocess timeouts.
 * Description: Implements asynchronous checkpointing for prolonged computations with timeout handling and state resumption.
 * Migrated: 2026-04-02T14:21:19.475Z
 */

// asyncCheckpointScheduler.mjs

import { performance } from 'node:perf_hooks';

/**
 * Saves a checkpoint state for prolonged computations.
 * @param {string} key - Unique identifier for the computation.
 * @param {object} state - Current state of the computation.
 * @param {Map} checkpointStore - In-memory store for checkpoints.
 */
export function saveCheckpoint(key, state, checkpointStore) {
  checkpointStore.set(key, {
    state,
    timestamp: performance.now()
  });
}

/**
 * Resumes a computation from the last checkpoint.
 * @param {string} key - Unique identifier for the computation.
 * @param {Map} checkpointStore - In-memory store for checkpoints.
 * @returns {object|null} - The last saved state or null if no checkpoint exists.
 */
export function resumeFromCheckpoint(key, checkpointStore) {
  const checkpoint = checkpointStore.get(key);
  return checkpoint ? checkpoint.state : null;
}

/**
 * Schedules a prolonged computation with periodic checkpointing.
 * @param {string} key - Unique identifier for the computation.
 * @param {Function} computation - The computation function to execute.
 * @param {number} timeout - Timeout in milliseconds for each computation segment.
 * @param {Map} checkpointStore - In-memory store for checkpoints.
 * @returns {Promise} - Resolves when computation completes.
 */
export async function scheduleComputation(key, computation, timeout, checkpointStore) {
  let state = resumeFromCheckpoint(key, checkpointStore) || {};

  while (true) {
    try {
      state = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Timeout')), timeout);
        computation(state, resolve);
        clearTimeout(timer);
      });

      saveCheckpoint(key, state, checkpointStore);

      if (state.done) {
        checkpointStore.delete(key);
        return state.result;
      }
    } catch (error) {
      if (error.message === 'Timeout') {
        console.warn(`Computation for key '${key}' timed out. Resuming from last checkpoint.`);
      } else {
        throw error;
      }
    }
  }
}

/**
 * Creates a new in-memory checkpoint store.
 * @returns {Map} - A new Map instance for storing checkpoints.
 */
export function createCheckpointStore() {
  return new Map();
}

/**
 * Example computation function for testing.
 * @param {object} state - Current state of the computation.
 * @param {Function} resolve - Resolves the computation segment.
 */
export function exampleComputation(state, resolve) {
  state.counter = (state.counter || 0) + 1;
  if (state.counter >= 5) {
    state.done = true;
    state.result = `Completed after ${state.counter} steps.`;
  }
  resolve(state);
}

// Example usage:
// const store = createCheckpointStore();
// scheduleComputation('example', exampleComputation, 1000, store).then(console.log);