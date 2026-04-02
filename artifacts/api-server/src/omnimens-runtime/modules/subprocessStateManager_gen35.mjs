/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessStateManager
 * Written: 2026-04-02T15:07:34.632Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// subprocessStateManager.mjs

import { createHash } from 'crypto';
import { writeFile, readFile } from 'fs/promises';

/**
 * Generates a unique identifier for a given state object.
 * @param {object} state - The state object to hash.
 * @returns {string} - A unique hash string.
 */
export function generateStateId(state) {
  const stateString = JSON.stringify(state);
  return createHash('sha256').update(stateString).digest('hex');
}

/**
 * Saves a checkpoint of the state in memory and optionally to a file.
 * @param {object} state - The state object to save.
 * @param {Map} memoryStore - An in-memory store for state persistence.
 * @param {string} [filePath] - Optional file path for saving the state.
 * @returns {Promise<void>} - Resolves when the state is saved.
 */
export async function saveCheckpoint(state, memoryStore, filePath = null) {
  const stateId = generateStateId(state);
  memoryStore.set(stateId, state);

  if (filePath) {
    const serializedState = JSON.stringify(state);
    await writeFile(filePath, serializedState);
  }
}

/**
 * Restores a state from memory or file.
 * @param {string} stateId - The unique identifier of the state.
 * @param {Map} memoryStore - An in-memory store for state persistence.
 * @param {string} [filePath] - Optional file path for restoring the state.
 * @returns {Promise<object|null>} - Resolves with the restored state object or null if not found.
 */
export async function restoreCheckpoint(stateId, memoryStore, filePath = null) {
  if (memoryStore.has(stateId)) {
    return memoryStore.get(stateId);
  }

  if (filePath) {
    try {
      const serializedState = await readFile(filePath, 'utf-8');
      const state = JSON.parse(serializedState);
      return state;
    } catch (error) {
      return null;
    }
  }

  return null;
}

/**
 * Merges incremental updates into an existing state object.
 * @param {object} baseState - The original state object.
 * @param {object} updates - The incremental updates to merge.
 * @returns {object} - The merged state object.
 */
export function mergeState(baseState, updates) {
  return { ...baseState, ...updates };
}

/**
 * Validates a state object to ensure it conforms to expected structure.
 * @param {object} state - The state object to validate.
 * @param {Array<string>} requiredKeys - Keys that must exist in the state.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateState(state, requiredKeys) {
  return requiredKeys.every(key => key in state);
}

/**
 * Creates a memory store for managing state persistence.
 * @returns {Map} - A new in-memory store.
 */
export function createMemoryStore() {
  return new Map();
}

/**
 * Utility function for deep cloning state objects.
 * @param {object} state - The state object to clone.
 * @returns {object} - A deep clone of the state object.
 */
export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}