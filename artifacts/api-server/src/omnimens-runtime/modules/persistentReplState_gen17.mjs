/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: persistentReplState
 * Written: 2026-04-02T14:11:40.624Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// persistentReplState.mjs

import { createHash } from 'crypto';

// In-memory store for state snapshots
const stateStore = new Map();

/**
 * Generates a unique hash key for a given state identifier.
 * @param {string} identifier - A unique identifier for the state (e.g., session ID).
 * @returns {string} - A hashed key.
 */
export function generateStateKey(identifier) {
  const hash = createHash('sha256');
  hash.update(identifier);
  return hash.digest('hex');
}

/**
 * Saves the current state as a JSON object in memory.
 * @param {string} key - The unique key for the state.
 * @param {object} state - The state object to persist.
 */
export function saveState(key, state) {
  if (typeof key !== 'string' || !key.trim()) {
    throw new Error('Key must be a non-empty string.');
  }
  if (typeof state !== 'object' || state === null) {
    throw new Error('State must be a non-null object.');
  }
  stateStore.set(key, JSON.stringify(state));
}

/**
 * Retrieves a previously saved state.
 * @param {string} key - The unique key for the state.
 * @returns {object|null} - The deserialized state object, or null if not found.
 */
export function loadState(key) {
  if (typeof key !== 'string' || !key.trim()) {
    throw new Error('Key must be a non-empty string.');
  }
  const serializedState = stateStore.get(key);
  return serializedState ? JSON.parse(serializedState) : null;
}

/**
 * Deletes a state from memory.
 * @param {string} key - The unique key for the state.
 */
export function deleteState(key) {
  if (typeof key !== 'string' || !key.trim()) {
    throw new Error('Key must be a non-empty string.');
  }
  stateStore.delete(key);
}

/**
 * Lists all keys currently stored in memory.
 * @returns {string[]} - An array of all stored keys.
 */
export function listStateKeys() {
  return Array.from(stateStore.keys());
}

/**
 * Clears all stored states from memory.
 */
export function clearAllStates() {
  stateStore.clear();
}

/**
 * Merges new data into an existing state, ensuring immutability.
 * @param {object} currentState - The current state object.
 * @param {object} newData - The new data to merge into the state.
 * @returns {object} - A new state object with merged data.
 */
export function mergeState(currentState, newData) {
  if (typeof currentState !== 'object' || currentState === null) {
    throw new Error('Current state must be a non-null object.');
  }
  if (typeof newData !== 'object' || newData === null) {
    throw new Error('New data must be a non-null object.');
  }
  return { ...currentState, ...newData };
}

/**
 * Validates if a given state matches an expected structure.
 * @param {object} state - The state object to validate.
 * @param {object} schema - An object defining the expected structure (keys and types).
 * @returns {boolean} - True if the state matches the schema, false otherwise.
 */
export function validateState(state, schema) {
  if (typeof state !== 'object' || state === null) {
    throw new Error('State must be a non-null object.');
  }
  if (typeof schema !== 'object' || schema === null) {
    throw new Error('Schema must be a non-null object.');
  }
  return Object.entries(schema).every(([key, type]) => {
    return typeof state[key] === type;
  });
}
