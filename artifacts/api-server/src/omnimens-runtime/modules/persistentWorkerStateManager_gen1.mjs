/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_49
 * Name: persistentWorkerStateManager
 * Purpose: Maintains persistent REPL state for iterative computations using Web Workers or Node.js Worker Threads.
 * Description: Manages persistent REPL state for iterative computations using Web Workers or Node.js Worker Threads.
 * Migrated: 2026-04-02T15:46:59.462Z
 */

// persistentWorkerStateManager.mjs

import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { randomUUID } from 'node:crypto';

// Shared memory interface for worker state management
const workerStates = new Map();

/**
 * Initializes a worker with a persistent state.
 * @param {string} workerFilePath - Path to the worker script.
 * @param {object} initialState - Initial state for the worker.
 * @returns {object} - Worker instance and state management utilities.
 */
export function createPersistentWorker(workerFilePath, initialState = {}) {
  const workerId = randomUUID();
  workerStates.set(workerId, { state: initialState, worker: null });

  const worker = new Worker(workerFilePath, { workerData: { workerId } });
  workerStates.get(workerId).worker = worker;

  worker.on('message', (message) => {
    if (message.type === 'updateState') {
      const { key, value } = message.payload;
      const currentState = workerStates.get(workerId).state;
      currentState[key] = value;
    }
  });

  worker.on('exit', () => {
    workerStates.delete(workerId);
  });

  return {
    worker,
    updateState: (key, value) => {
      const currentState = workerStates.get(workerId).state;
      currentState[key] = value;
      worker.postMessage({ type: 'updateState', payload: { key, value } });
    },
    getState: () => ({ ...workerStates.get(workerId).state }),
    terminate: () => {
      worker.terminate();
      workerStates.delete(workerId);
    }
  };
}

/**
 * Retrieves the current state of all workers.
 * @returns {object} - Map of worker IDs to their states.
 */
export function getAllWorkerStates() {
  const states = {};
  for (const [workerId, { state }] of workerStates) {
    states[workerId] = { ...state };
  }
  return states;
}

/**
 * Worker-side logic for managing state updates.
 * Should be included in the worker script.
 */
export function workerStateHandler() {
  if (!isMainThread) {
    const { workerId } = require('node:worker_threads').workerData;

    parentPort.on('message', (message) => {
      if (message.type === 'updateState') {
        parentPort.postMessage({
          type: 'updateState',
          payload: message.payload
        });
      }
    });
  }
}

/**
 * Demonstrates seamless resumption of computation.
 * @param {function} computationFunction - Function to execute iteratively.
 * @param {object} stateManager - State manager returned by createPersistentWorker.
 */
export function resumeComputation(computationFunction, stateManager) {
  const state = stateManager.getState();
  const result = computationFunction(state);
  stateManager.updateState('lastResult', result);
}

/**
 * Example computation function for iterative tasks.
 * @param {object} state - Current state.
 * @returns {number} - Incremented result.
 */
export function exampleComputationFunction(state) {
  const currentValue = state.lastResult || 0;
  return currentValue + 1;
}