/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: persistentReplStateManager
 * Written: 2026-04-03T09:44:47.259Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// persistentReplStateManager.mjs

import { createHash } from 'crypto';

/**
 * Creates a hash for a given object to track state changes efficiently.
 * @param {object} obj - The object to hash.
 * @returns {string} - The SHA-256 hash of the serialized object.
 */
export function generateObjectHash(obj) {
  const serialized = JSON.stringify(obj);
  return createHash('sha256').update(serialized).digest('hex');
}

/**
 * Merges two state objects with delta-based updates.
 * @param {object} baseState - The original state object.
 * @param {object} deltaState - The delta updates to apply.
 * @returns {object} - The merged state object.
 */
export function mergeState(baseState, deltaState) {
  return { ...baseState, ...deltaState };
}

/**
 * Creates a memory-efficient snapshot of the current state.
 * @param {object} state - The current state object.
 * @param {string[]} keysToSnapshot - Specific keys to include in the snapshot.
 * @returns {object} - A snapshot containing only the specified keys.
 */
export function createSnapshot(state, keysToSnapshot) {
  const snapshot = {};
  for (const key of keysToSnapshot) {
    if (key in state) {
      snapshot[key] = state[key];
    }
  }
  return snapshot;
}

/**
 * Serializes the state object for persistence.
 * @param {object} state - The state object to serialize.
 * @returns {string} - The serialized JSON string.
 */
export function serializeState(state) {
  return JSON.stringify(state);
}

/**
 * Deserializes a JSON string back into a state object.
 * @param {string} serializedState - The JSON string to deserialize.
 * @returns {object} - The deserialized state object.
 */
export function deserializeState(serializedState) {
  try {
    return JSON.parse(serializedState);
  } catch (error) {
    throw new Error('Failed to deserialize state: Invalid JSON format');
  }
}

/**
 * Tracks and manages persistent state across executions.
 */
export const persistentReplStateManager = {
  state: {},

  /**
   * Initializes the state manager with an optional initial state.
   * @param {object} [initialState={}] - The initial state to set.
   */
  initialize(initialState = {}) {
    this.state = initialState;
  },

  /**
   * Updates the current state with a delta.
   * @param {object} delta - The delta updates to apply.
   */
  updateState(delta) {
    this.state = mergeState(this.state, delta);
  },

  /**
   * Retrieves the current state.
   * @returns {object} - The current state object.
   */
  getState() {
    return this.state;
  },

  /**
   * Saves the current state as a serialized string.
   * @returns {string} - The serialized state.
   */
  saveState() {
    return serializeState(this.state);
  },

  /**
   * Restores the state from a serialized string.
   * @param {string} serializedState - The serialized state to restore.
   */
  loadState(serializedState) {
    this.state = deserializeState(serializedState);
  },

  /**
   * Creates a snapshot of the current state for specific keys.
   * @param {string[]} keys - The keys to include in the snapshot.
   * @returns {object} - The snapshot object.
   */
  snapshot(keys) {
    return createSnapshot(this.state, keys);
  },

  /**
   * Generates a hash of the current state for integrity checks.
   * @returns {string} - The hash of the current state.
   */
  getStateHash() {
    return generateObjectHash(this.state);
  }
};