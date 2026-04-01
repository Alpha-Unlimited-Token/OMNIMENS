/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: persistentReplState
 * Written: 2026-04-01T21:57:39.638Z
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

// Shared in-memory state object
const sharedState = new Map();

/**
 * Generates a unique hash key for a given REPL session or subprocess context.
 * @param {string} sessionId - A unique identifier for the session.
 * @returns {string} - A hashed key for secure state management.
 */
export function generateStateKey(sessionId) {
  const hash = createHash('sha256');
  hash.update(sessionId);
  return hash.digest('hex');
}

/**
 * Stores or updates the state for a given session.
 * @param {string} sessionKey - The unique key for the session.
 * @param {object} state - The state object to store.
 */
export function setState(sessionKey, state) {
  if (typeof sessionKey !== 'string' || typeof state !== 'object' || state === null) {
    throw new Error('Invalid Array.from(/* args */{}): sessionKey must be a string and state must be a non-null object.');
  }
  sharedState.set(sessionKey, JSON.parse(JSON.stringify(state))); // Deep copy to avoid mutation
}

/**
 * Retrieves the state for a given session.
 * @param {string} sessionKey - The unique key for the session.
 * @returns {object|null} - The stored state object, or null if not found.
 */
export function getState(sessionKey) {
  if (typeof sessionKey !== 'string') {
    throw new Error('Invalid argument: sessionKey must be a string.');
  }
  return sharedState.has(sessionKey) ? JSON.parse(JSON.stringify(sharedState.get(sessionKey))) : null; // Deep copy to ensure immutability
}

/**
 * Clears the state for a given session.
 * @param {string} sessionKey - The unique key for the session.
 */
export function clearState(sessionKey) {
  if (typeof sessionKey !== 'string') {
    throw new Error('Invalid argument: sessionKey must be a string.');
  }
  sharedState.delete(sessionKey);
}

/**
 * Clears all stored states across all sessions. Use with caution.
 */
export function clearAllStates() {
  sharedState.clear();
}

/**
 * Retrieves all session keys currently in memory.
 * @returns {string[]} - An array of all session keys.
 */
export function listSessionKeys() {
  return Array.from(sharedState.keys());
}

/**
 * Merges a partial state update into the existing state for a session.
 * @param {string} sessionKey - The unique key for the session.
 * @param {object} partialState - The partial state object to merge.
 */
export function updateState(sessionKey, partialState) {
  if (typeof sessionKey !== 'string' || typeof partialState !== 'object' || partialState === null) {
    throw new Error('Invalid Array.from(/* args */{}): sessionKey must be a string and partialState must be a non-null object.');
  }
  const currentState = getState(sessionKey) || {};
  const updatedState = { ...currentState, ...partialState };
  setState(sessionKey, updatedState);
}

/**
 * Checks if a state exists for a given session.
 * @param {string} sessionKey - The unique key for the session.
 * @returns {boolean} - True if the state exists, false otherwise.
 */
export function hasState(sessionKey) {
  if (typeof sessionKey !== 'string') {
    throw new Error('Invalid argument: sessionKey must be a string.');
  }
  return sharedState.has(sessionKey);
}
