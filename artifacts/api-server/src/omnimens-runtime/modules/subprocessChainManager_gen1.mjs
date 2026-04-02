/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_5
 * Name: subprocessChainManager
 * Purpose: Creates a state-preserving chain of subprocesses for iterative and long-running computations.
 * Description: Manages state-preserving subprocess chains for iterative computations with timeout and error handling.
 * Migrated: 2026-04-02T14:50:29.448Z
 */

// subprocessChainManager.mjs

import { EventEmitter } from 'events';
import { setTimeout } from 'timers/promises';

/**
 * Serialize a state object into a JSON string.
 * @param {object} state - The state to serialize.
 * @returns {string} - Serialized state as a JSON string.
 */
export function serializeState(state) {
  return JSON.stringify(state);
}

/**
 * Deserialize a JSON string into a state object.
 * @param {string} serializedState - The serialized state string.
 * @returns {object} - Deserialized state object.
 */
export function deserializeState(serializedState) {
  return JSON.parse(serializedState);
}

/**
 * Create a chain of subprocesses where each subprocess can modify the state.
 * @param {Array<Function>} subprocesses - Array of async functions representing subprocesses.
 * @param {object} initialState - Initial state to pass to the first subprocess.
 * @param {number} timeoutMs - Maximum time (ms) each subprocess can run before timing out.
 * @returns {Promise<object>} - Final state after all subprocesses have executed.
 */
export async function runSubprocessChain(subprocesses, initialState, timeoutMs) {
  let currentState = initialState;

  for (const subprocess of subprocesses) {
    try {
      currentState = await Promise.race([
        subprocess(currentState),
        setTimeout(timeoutMs, { error: new Error('Subprocess timed out') })
      ]);
    } catch (error) {
      throw new Error(`Error in subprocess: ${error.message}`);
    }
  }

  return currentState;
}

/**
 * Event-driven manager for subprocess chains, enabling state preservation and updates.
 */
export class SubprocessChainManager extends EventEmitter {
  constructor() {
    super();
    this.state = {};
    this.chain = [];
  }

  /**
   * Add a subprocess to the chain.
   * @param {Function} subprocess - An async function that modifies the state.
   */
  addSubprocess(subprocess) {
    this.chain.push(subprocess);
  }

  /**
   * Execute the subprocess chain with a given initial state and timeout.
   * @param {object} initialState - Initial state to start the chain.
   * @param {number} timeoutMs - Timeout for each subprocess in the chain.
   * @returns {Promise<object>} - Final state after execution.
   */
  async execute(initialState, timeoutMs) {
    this.state = initialState;
    this.emit('start', this.state);

    try {
      this.state = await runSubprocessChain(this.chain, this.state, timeoutMs);
      this.emit('success', this.state);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }

    return this.state;
  }
}

/**
 * Utility function to create a subprocess that performs a transformation on the state.
 * @param {Function} transformFunction - Function to transform the state.
 * @returns {Function} - Subprocess function.
 */
export function createSubprocess(transformFunction) {
  return async (state) => {
    return transformFunction(state);
  };
}