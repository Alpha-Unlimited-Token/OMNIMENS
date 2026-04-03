/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: virtualizedReplStateManager
 * Written: 2026-04-03T01:08:27.685Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { serialize, deserialize } from 'v8';

/**
 * Serializes the REPL state into a compact buffer for storage or transfer.
 * @param {object} state - The current REPL state to serialize.
 * @returns {Buffer} - Serialized state as a buffer.
 */
export function saveReplState(state) {
  if (typeof state !== 'object' || state === null) {
    throw new TypeError('State must be a non-null object.');
  }
  return serialize(state);
}

/**
 * Restores the REPL state from a serialized buffer.
 * @param {Buffer} buffer - The buffer containing the serialized state.
 * @returns {object} - The deserialized REPL state.
 */
export function loadReplState(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError('Input must be a Buffer.');
  }
  return deserialize(buffer);
}

/**
 * Merges two REPL states, with the second state overwriting conflicting keys in the first.
 * @param {object} baseState - The base REPL state.
 * @param {object} newState - The new REPL state to merge.
 * @returns {object} - The merged REPL state.
 */
export function mergeReplStates(baseState, newState) {
  if (typeof baseState !== 'object' || baseState === null ||
      typeof newState !== 'object' || newState === null) {
    throw new TypeError('Both states must be non-null objects.');
  }
  return { ...baseState, ...newState };
}

/**
 * Validates the integrity of a REPL state by checking for required keys.
 * @param {object} state - The REPL state to validate.
 * @param {string[]} requiredKeys - An array of keys that must exist in the state.
 * @returns {boolean} - True if the state is valid, false otherwise.
 */
export function validateReplState(state, requiredKeys) {
  if (typeof state !== 'object' || state === null) {
    throw new TypeError('State must be a non-null object.');
  }
  if (!Array.isArray(requiredKeys)) {
    throw new TypeError('Required keys must be an array of strings.');
  }
  return requiredKeys.every(key => Object.prototype.hasOwnProperty.call(state, key));
}

/**
 * Creates a deep clone of a REPL state to ensure immutability.
 * @param {object} state - The REPL state to clone.
 * @returns {object} - A deep clone of the REPL state.
 */
export function cloneReplState(state) {
  if (typeof state !== 'object' || state === null) {
    throw new TypeError('State must be a non-null object.');
  }
  return deserialize(serialize(state));
}

/**
 * Safely updates a REPL state with a callback function, ensuring immutability.
 * @param {object} state - The current REPL state.
 * @param {function} updateFunction - A function that takes the state and returns an updated state.
 * @returns {object} - The updated REPL state.
 */
export function updateReplState(state, updateFunction) {
  if (typeof state !== 'object' || state === null) {
    throw new TypeError('State must be a non-null object.');
  }
  if (typeof updateFunction !== 'function') {
    throw new TypeError('Update function must be a valid function.');
  }
  const clonedState = cloneReplState(state);
  return updateFunction(clonedState);
}
