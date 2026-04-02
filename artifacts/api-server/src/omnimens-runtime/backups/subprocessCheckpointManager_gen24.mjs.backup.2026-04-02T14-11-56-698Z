/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointManager
 * Written: 2026-04-02T13:31:23.426Z
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

import { serialize, deserialize } from 'v8';

/**
 * Saves the state of a computation subprocess for later restoration.
 * @param {Object} state - The in-memory state to serialize.
 * @returns {Buffer} - Serialized state snapshot.
 */
export function saveState(state) {
  if (typeof state !== 'object' || state === null) {
    throw new Error('State must be a non-null object.');
  }
  return serialize(state);
}

/**
 * Restores a previously saved computation subprocess state.
 * @param {Buffer} snapshot - Serialized state snapshot.
 * @returns {Object} - Deserialized state object.
 */
export function restoreState(snapshot) {
  if (!Buffer.isBuffer(snapshot)) {
    throw new Error('Snapshot must be a Buffer.');
  }
  return deserialize(snapshot);
}

/**
 * Finite State Machine (FSM) to manage iterative computations with checkpoints.
 * @param {Object} fsmConfig - Configuration with states and transitions.
 * @param {string} initialState - The starting state of the FSM.
 * @param {function} onTimeout - Callback to handle timeout scenarios.
 * @returns {Promise<Object>} - Final state after FSM execution.
 */
export async function runFSM(fsmConfig, initialState, onTimeout) {
  if (typeof fsmConfig !== 'object' || fsmConfig === null) {
    throw new Error('FSM configuration must be a non-null object.');
  }
  if (typeof initialState !== 'string' || !(initialState in fsmConfig)) {
    throw new Error('Initial state must be a valid state in the FSM configuration.');
  }
  if (typeof onTimeout !== 'function') {
    throw new Error('onTimeout must be a function.');
  }

  let currentState = initialState;
  let stateData = {};

  while (currentState) {
    const stateHandler = fsmConfig[currentState];

    if (typeof stateHandler !== 'function') {
      throw new Error(`State handler for '${currentState}' must be a function.`);
    }

    try {
      const { nextState, data } = await stateHandler(stateData);

      if (nextState && !(nextState in fsmConfig)) {
        throw new Error(`Next state '${nextState}' is not defined in FSM configuration.`);
      }

      stateData = data || {};
      currentState = nextState;
    } catch (error) {
      await onTimeout(error, currentState, stateData);
      break;
    }
  }

  return stateData;
}

/**
 * Example FSM state handler for demonstration purposes.
 * @param {Object} data - Input data for the state.
 * @returns {Promise<Object>} - Next state and updated data.
 */
export async function exampleStateHandler(data) {
  // Simulate some computation
  const updatedData = { ...data, counter: (data.counter || 0) + 1 };
  const nextState = updatedData.counter < 5 ? 'exampleState' : null;

  return { nextState, data: updatedData };
}

/**
 * Utility function to create a timeout-safe FSM configuration.
 * @param {Object} fsmConfig - Original FSM configuration.
 * @param {number} timeoutMs - Timeout in milliseconds for each state handler.
 * @returns {Object} - Wrapped FSM configuration with timeout handling.
 */
export function createTimeoutSafeFSM(fsmConfig, timeoutMs) {
  if (typeof timeoutMs !== 'number' || timeoutMs <= 0) {
    throw new Error('Timeout must be a positive number.');
  }

  const wrappedConfig = {};

  for (const [state, handler] of Object.entries(fsmConfig)) {
    if (typeof handler !== 'function') {
      throw new Error(`State handler for '${state}' must be a function.`);
    }

    wrappedConfig[state] = async (data) => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`State '${state}' timed out.`)), timeoutMs);
      });

      return Promise.race([handler(data), timeoutPromise]);
    };
  }

  return wrappedConfig;
}
