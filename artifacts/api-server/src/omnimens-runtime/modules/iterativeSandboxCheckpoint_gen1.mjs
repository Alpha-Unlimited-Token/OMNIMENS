/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: iterativeSandboxCheckpoint
 * Purpose: Enables iterative computations by saving and restoring subprocess states across timeouts.
 * Description: Enables iterative computations by saving and restoring states with a priority queue for task management.
 * Migrated: 2026-04-02T14:08:14.883Z
 */

// iterativeSandboxCheckpoint.mjs

import { createHash } from 'crypto';

/**
 * Serialize a computation state into a string for storage.
 * @param {any} state - The computation state to serialize.
 * @returns {string} Serialized state.
 */
export function serializeState(state) {
  return JSON.stringify(state);
}

/**
 * Deserialize a string back into a computation state.
 * @param {string} serializedState - The serialized state string.
 * @returns {any} The deserialized state.
 */
export function deserializeState(serializedState) {
  return JSON.parse(serializedState);
}

/**
 * Generate a unique hash for a given computation state.
 * @param {any} state - The computation state to hash.
 * @returns {string} A unique hash string.
 */
export function generateStateHash(state) {
  const serialized = serializeState(state);
  return createHash('sha256').update(serialized).digest('hex');
}

/**
 * Priority queue for managing resumable tasks.
 */
export class PriorityQueue {
  constructor() {
    this.queue = [];
  }

  /**
   * Add a task to the queue with a given priority.
   * @param {any} task - The task to add.
   * @param {number} priority - The priority of the task (lower is higher priority).
   */
  enqueue(task, priority) {
    this.queue.push({ task, priority });
    this.queue.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Remove and return the highest-priority task from the queue.
   * @returns {any|null} The highest-priority task or null if the queue is empty.
   */
  dequeue() {
    return this.queue.length > 0 ? this.queue.shift().task : null;
  }

  /**
   * Check if the queue is empty.
   * @returns {boolean} True if empty, false otherwise.
   */
  isEmpty() {
    return this.queue.length === 0;
  }
}

/**
 * Save the state of a computation for resumption.
 * @param {Map<string, string>} stateStorage - A storage map for states.
 * @param {any} state - The computation state to save.
 * @returns {string} The unique hash of the saved state.
 */
export function saveState(stateStorage, state) {
  const hash = generateStateHash(state);
  stateStorage.set(hash, serializeState(state));
  return hash;
}

/**
 * Restore a previously saved computation state.
 * @param {Map<string, string>} stateStorage - A storage map for states.
 * @param {string} hash - The unique hash of the state to restore.
 * @returns {any|null} The restored state or null if not found.
 */
export function restoreState(stateStorage, hash) {
  const serializedState = stateStorage.get(hash);
  return serializedState ? deserializeState(serializedState) : null;
}

/**
 * Perform iterative computation with timeout handling.
 * @param {function(any): { nextState: any, done: boolean }} computeStep - A function that performs one computation step.
 * @param {any} initialState - The initial state of the computation.
 * @param {number} timeoutMs - The maximum time (ms) to run before saving state.
 * @returns {Promise<string>} A promise resolving to the final state hash.
 */
export async function iterativeComputation(computeStep, initialState, timeoutMs) {
  const stateStorage = new Map();
  let currentState = initialState;
  let startTime = Date.now();

  while (true) {
    const { nextState, done } = computeStep(currentState);
    if (done) {
      return saveState(stateStorage, nextState);
    }

    if (Date.now() - startTime >= timeoutMs) {
      const stateHash = saveState(stateStorage, nextState);
      return stateHash;
    }

    currentState = nextState;
  }
}
