/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: deltaStatePersistence
 * Written: 2026-04-01T22:23:08.154Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// deltaStatePersistence.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given object to track changes.
 * @param {Object} obj - The object to hash.
 * @returns {string} - A hash representing the object's state.
 */
export function generateHash(obj) {
  const jsonString = JSON.stringify(obj, Object.keys(obj).sort());
  return createHash('sha256').update(jsonString).digest('hex');
}

/**
 * Computes the difference between two objects.
 * @param {Object} oldState - The original state.
 * @param {Object} newState - The updated state.
 * @returns {Object} - A diff object containing only the changes.
 */
export function computeDiff(oldState, newState) {
  const diff = {};
  for (const key of new Set([...Object.keys(oldState), ...Object.keys(newState)])) {
    if (JSON.stringify(oldState[key]) !== JSON.stringify(newState[key])) {
      diff[key] = newState[key];
    }
  }
  return diff;
}

/**
 * Applies a diff to an existing state to reconstruct the updated state.
 * @param {Object} baseState - The original state.
 * @param {Object} diff - The diff object containing changes.
 * @returns {Object} - The reconstructed updated state.
 */
export function applyDiff(baseState, diff) {
  return { ...baseState, ...diff };
}

/**
 * Serializes a state object to a JSON string.
 * @param {Object} state - The state object to serialize.
 * @returns {string} - The serialized JSON string.
 */
export function serializeState(state) {
  return JSON.stringify(state);
}

/**
 * Deserializes a JSON string back into a state object.
 * @param {string} serializedState - The serialized JSON string.
 * @returns {Object} - The deserialized state object.
 */
export function deserializeState(serializedState) {
  return JSON.parse(serializedState);
}

/**
 * Tracks state changes incrementally and stores only diffs.
 * @param {Object} initialState - The initial state of the module.
 * @returns {Object} - An object containing methods for state management.
 */
export function createStateTracker(initialState = {}) {
  let currentState = { ...initialState };
  let stateHistory = [];

  return {
    /**
     * Updates the current state and records the diff.
     * @param {Object} newState - The new state to update to.
     */
    updateState(newState) {
      const diff = computeDiff(currentState, newState);
      stateHistory.push(diff);
      currentState = applyDiff(currentState, diff);
    },

    /**
     * Retrieves the current state.
     * @returns {Object} - The current state.
     */
    getCurrentState() {
      return { ...currentState };
    },

    /**
     * Retrieves the state history (list of diffs).
     * @returns {Array<Object>} - The history of state changes.
     */
    getStateHistory() {
      return [...stateHistory];
    },

    /**
     * Reconstructs the state from the history of diffs.
     * @returns {Object} - The reconstructed state.
     */
    reconstructState() {
      return stateHistory.reduce((state, diff) => applyDiff(state, diff), {});
    }
  };
}
