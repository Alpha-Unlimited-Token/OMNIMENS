/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointManager
 * Written: 2026-04-02T14:11:56.697Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// subprocessCheckpointManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given state object.
 * @param {Object} state - The state object to hash.
 * @returns {string} - A unique hash string.
 */
export function generateStateHash(state) {
  const stateString = JSON.stringify(state);
  return createHash('sha256').update(stateString).digest('hex');
}

/**
 * Manages subprocess checkpoints with in-memory snapshots and TTL-based persistence.
 */
export const subprocessCheckpointManager = {
  _checkpoints: new Map(),

  /**
   * Saves a checkpoint.
   * @param {string} id - Unique identifier for the subprocess.
   * @param {Object} state - The state object to save.
   * @param {number} ttl - Time-to-live in milliseconds.
   */
  saveCheckpoint(id, state, ttl) {
    const hash = generateStateHash(state);
    const expiration = Date.now() + ttl;
    this._checkpoints.set(id, { state, hash, expiration });
  },

  /**
   * Restores a checkpoint.
   * @param {string} id - Unique identifier for the subprocess.
   * @returns {Object|null} - The restored state or null if expired/not found.
   */
  restoreCheckpoint(id) {
    const checkpoint = this._checkpoints.get(id);
    if (!checkpoint || checkpoint.expiration < Date.now()) {
      this._checkpoints.delete(id);
      return null;
    }
    return checkpoint.state;
  },

  /**
   * Validates the integrity of a state against its hash.
   * @param {Object} state - The state object to validate.
   * @param {string} hash - The hash to compare against.
   * @returns {boolean} - True if the state matches the hash, false otherwise.
   */
  validateStateIntegrity(state, hash) {
    return generateStateHash(state) === hash;
  },

  /**
   * Purges expired checkpoints.
   */
  purgeExpiredCheckpoints() {
    const now = Date.now();
    for (const [id, checkpoint] of this._checkpoints.entries()) {
      if (checkpoint.expiration < now) {
        this._checkpoints.delete(id);
      }
    }
  }
};

/**
 * Utility function to periodically purge expired checkpoints.
 * @param {number} interval - Interval in milliseconds for purging.
 */
export function startPurgeScheduler(interval) {
  setInterval(() => subprocessCheckpointManager.purgeExpiredCheckpoints(), interval);
}

/**
 * Utility function to stop all active intervals (for cleanup in tests or shutdown).
 * @param {NodeJS.Timeout} intervalId - The interval ID to clear.
 */
export function stopPurgeScheduler(intervalId) {
  clearInterval(intervalId);
}
