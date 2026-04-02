/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: sandboxCheckpointManager
 * Written: 2026-04-02T15:05:53.057Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// sandboxCheckpointManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for checkpoint keys.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateCheckpointKey(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Serializes a state object into a JSON string.
 * @param {object} state - The state object to serialize.
 * @returns {string} - Serialized state as JSON string.
 */
export function serializeState(state) {
  try {
    return JSON.stringify(state);
  } catch (error) {
    throw new Error('Failed to serialize state: ' + error.message);
  }
}

/**
 * Deserializes a JSON string back into a state object.
 * @param {string} serializedState - The JSON string to deserialize.
 * @returns {object} - Deserialized state object.
 */
export function deserializeState(serializedState) {
  try {
    return JSON.parse(serializedState);
  } catch (error) {
    throw new Error('Failed to deserialize state: ' + error.message);
  }
}

/**
 * Manages checkpoints with TTL expiration.
 */
export const sandboxCheckpointManager = (() => {
  const checkpoints = new Map();

  /**
   * Saves a checkpoint state with a TTL.
   * @param {string} key - Unique checkpoint identifier.
   * @param {object} state - State object to save.
   * @param {number} ttl - Time-to-live in milliseconds.
   */
  function saveCheckpoint(key, state, ttl) {
    const expirationTime = Date.now() + ttl;
    const serializedState = serializeState(state);
    checkpoints.set(key, { serializedState, expirationTime });
  }

  /**
   * Resumes a checkpoint state if it has not expired.
   * @param {string} key - Unique checkpoint identifier.
   * @returns {object|null} - Deserialized state object or null if expired/not found.
   */
  function resumeCheckpoint(key) {
    const checkpoint = checkpoints.get(key);
    if (!checkpoint) return null;

    const { serializedState, expirationTime } = checkpoint;
    if (Date.now() > expirationTime) {
      checkpoints.delete(key);
      return null;
    }

    return deserializeState(serializedState);
  }

  /**
   * Cleans up expired checkpoints.
   */
  function cleanupExpiredCheckpoints() {
    const now = Date.now();
    for (const [key, { expirationTime }] of checkpoints.entries()) {
      if (now > expirationTime) {
        checkpoints.delete(key);
      }
    }
  }

  return {
    saveCheckpoint,
    resumeCheckpoint,
    cleanupExpiredCheckpoints
  };
})();

/**
 * Utility function to compute TTL expiration.
 * @param {number} seconds - Number of seconds for TTL.
 * @returns {number} - TTL in milliseconds.
 */
export function computeTTL(seconds) {
  return seconds * 1000;
}