/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: sandboxStateCheckpointing
 * Written: 2026-04-02T14:22:43.614Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// sandboxStateCheckpointing.mjs

import { createHash } from 'crypto';

/**
 * Saves a serialized state object to memory for checkpointing purposes.
 * @param {Object} state - The computation state to save.
 * @returns {string} A unique state ID for retrieval.
 */
export function saveState(state) {
  if (typeof state !== 'object' || state === null) {
    throw new TypeError('State must be a non-null object.');
  }

  const serializedState = JSON.stringify(state);
  const stateId = createHash('sha256').update(serializedState).digest('hex');

  globalThis.__sandboxStateStore = globalThis.__sandboxStateStore || {};
  globalThis.__sandboxStateStore[stateId] = serializedState;

  return stateId;
}

/**
 * Restores a previously saved state object by its ID.
 * @param {string} stateId - The unique ID of the saved state.
 * @returns {Object|null} The restored state object, or null if not found.
 */
export function restoreState(stateId) {
  if (typeof stateId !== 'string' || stateId.length === 0) {
    throw new TypeError('State ID must be a non-empty string.');
  }

  globalThis.__sandboxStateStore = globalThis.__sandboxStateStore || {};

  const serializedState = globalThis.__sandboxStateStore[stateId];
  return serializedState ? JSON.parse(serializedState) : null;
}

/**
 * Deletes a saved state object by its ID to free up memory.
 * @param {string} stateId - The unique ID of the saved state.
 * @returns {boolean} True if the state was deleted, false if not found.
 */
export function deleteState(stateId) {
  if (typeof stateId !== 'string' || stateId.length === 0) {
    throw new TypeError('State ID must be a non-empty string.');
  }

  globalThis.__sandboxStateStore = globalThis.__sandboxStateStore || {};

  if (stateId in globalThis.__sandboxStateStore) {
    delete globalThis.__sandboxStateStore[stateId];
    return true;
  }

  return false;
}

/**
 * Lists all currently saved state IDs.
 * @returns {string[]} An array of all saved state IDs.
 */
export function listStates() {
  globalThis.__sandboxStateStore = globalThis.__sandboxStateStore || {};
  return Object.keys(globalThis.__sandboxStateStore);
}

/**
 * Clears all saved states from memory.
 */
export function clearAllStates() {
  globalThis.__sandboxStateStore = {};
}