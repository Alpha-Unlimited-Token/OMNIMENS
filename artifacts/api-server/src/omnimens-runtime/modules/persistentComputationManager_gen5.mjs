/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: persistentComputationManager
 * Written: 2026-04-03T14:22:54.120Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// persistentComputationManager.mjs

import { serialize, deserialize } from 'v8';
import { randomUUID } from 'crypto';

const stateStore = new Map();

/**
 * Save a state snapshot to an in-memory store.
 * @param {string} key - Unique identifier for the state.
 * @param {object} state - The state object to serialize and store.
 */
export function saveState(key, state) {
  if (typeof key !== 'string' || !key.trim()) {
    throw new Error('Invalid key: must be a non-empty string.');
  }
  stateStore.set(key, serialize(state));
}

/**
 * Load a state snapshot from the in-memory store.
 * @param {string} key - Unique identifier for the state.
 * @returns {object} - The deserialized state object.
 */
export function loadState(key) {
  if (!stateStore.has(key)) {
    throw new Error(`State not found for key: ${key}`);
  }
  return deserialize(stateStore.get(key));
}

/**
 * Execute a computation with persistent state management.
 * @param {string} key - Unique identifier for the state.
 * @param {function} computation - Function that performs the computation.
 * @returns {object} - Updated state after computation.
 */
export function executeWithState(key, computation) {
  if (typeof computation !== 'function') {
    throw new Error('Invalid computation: must be a function.');
  }

  const currentState = stateStore.has(key) ? loadState(key) : {};
  const updatedState = computation(currentState);
  saveState(key, updatedState);

  return updatedState;
}

/**
 * Generate a unique key for state management.
 * @returns {string} - A unique identifier string.
 */
export function generateUniqueKey() {
  return randomUUID();
}

/**
 * Clear a state snapshot from the in-memory store.
 * @param {string} key - Unique identifier for the state.
 */
export function clearState(key) {
  if (!stateStore.has(key)) {
    throw new Error(`State not found for key: ${key}`);
  }
  stateStore.delete(key);
}

/**
 * List all currently stored state keys.
 * @returns {string[]} - Array of state keys.
 */
export function listStateKeys() {
  return Array.from(stateStore.keys());
}