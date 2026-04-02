/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: virtualReplStateManager
 * Written: 2026-04-02T13:29:59.144Z
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

import { createHash } from 'crypto';

/**
 * Serialize the computation state into a compact JSON format.
 * @param {Object} state - The computation state object to serialize.
 * @returns {string} - Serialized JSON string of the state.
 */
export function serializeState(state) {
  if (typeof state !== 'object' || state === null) {
    throw new TypeError('State must be a non-null object.');
  }
  return JSON.stringify(state);
}

/**
 * Deserialize a JSON string back into a computation state object.
 * @param {string} serializedState - The JSON string to deserialize.
 * @returns {Object} - The deserialized computation state object.
 */
export function deserializeState(serializedState) {
  if (typeof serializedState !== 'string') {
    throw new TypeError('Serialized state must be a string.');
  }
  try {
    return JSON.parse(serializedState);
  } catch (error) {
    throw new Error('Failed to parse serialized state: ' + error.message);
  }
}

/**
 * Generate a hash for a given computation state to ensure integrity.
 * @param {Object} state - The computation state object.
 * @returns {string} - A SHA-256 hash of the serialized state.
 */
export function generateStateHash(state) {
  const serializedState = serializeState(state);
  const hash = createHash('sha256');
  hash.update(serializedState);
  return hash.digest('hex');
}

/**
 * Validate the integrity of a computation state using a hash.
 * @param {Object} state - The computation state object.
 * @param {string} expectedHash - The expected SHA-256 hash.
 * @returns {boolean} - True if the hash matches, false otherwise.
 */
export function validateStateIntegrity(state, expectedHash) {
  const actualHash = generateStateHash(state);
  return actualHash === expectedHash;
}

/**
 * Restore a computation state with integrity validation.
 * @param {string} serializedState - The serialized JSON string of the state.
 * @param {string} expectedHash - The expected SHA-256 hash of the state.
 * @returns {Object} - The restored computation state object.
 */
export function restoreState(serializedState, expectedHash) {
  const state = deserializeState(serializedState);
  if (!validateStateIntegrity(state, expectedHash)) {
    throw new Error('State integrity validation failed.');
  }
  return state;
}

/**
 * Save the computation state for iterative workflows.
 * @param {Object} state - The computation state object.
 * @returns {Object} - An object containing the serialized state and its hash.
 */
export function saveState(state) {
  const serializedState = serializeState(state);
  const stateHash = generateStateHash(state);
  return { serializedState, stateHash };
}

/**
 * Utility function for cross-agent workflows to manage computation states.
 * @param {Object} state - The computation state object.
 * @param {string} serializedState - The serialized JSON string of the state.
 * @param {string} expectedHash - The expected SHA-256 hash.
 * @returns {Object} - The restored state if valid, or the saved state if new.
 */
export function manageState(state, serializedState, expectedHash) {
  try {
    return restoreState(serializedState, expectedHash);
  } catch {
    return saveState(state);
  }
}