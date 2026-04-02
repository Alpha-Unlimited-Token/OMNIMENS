/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: virtualReplPersistence
 * Written: 2026-04-02T13:46:26.521Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Provides persistent state snapshots for iterative computations across subprocess calls
import { createHash } from 'crypto';

/**
 * Serialize state into JSON and compute a hash for change detection.
 * Useful for saving and comparing state snapshots.
 */
export function serializeState(state) {
  if (typeof state !== 'object' || state === null) {
    throw new TypeError('State must be a non-null object');
  }
  const jsonString = JSON.stringify(state);
  const hash = createHash('sha256').update(jsonString).digest('hex');
  return { jsonString, hash };
}

/**
 * Compute JSON diff between two states.
 * Returns keys that have changed or are new.
 */
export function computeStateDiff(oldState, newState) {
  if (typeof oldState !== 'object' || oldState === null || typeof newState !== 'object' || newState === null) {
    throw new TypeError('Both states must be non-null objects');
  }
  const diff = {};
  for (const key of Object.keys(newState)) {
    if (!Object.is(oldState[key], newState[key])) {
      diff[key] = newState[key];
    }
  }
  return diff;
}

/**
 * Restore state from a JSON string.
 * Useful for checkpoint restoration.
 */
export function restoreState(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Invalid JSON string provided for restoration');
  }
}

/**
 * Create a checkpoint system for iterative computations.
 * Stores snapshots and provides restoration capability.
 */
export const createCheckpointSystem = () => {
  const checkpoints = new Map();

  return {
    /**
     * Save a checkpoint with a unique identifier.
     */
    saveCheckpoint(id, state) {
      if (typeof id !== 'string') {
        throw new TypeError('Checkpoint ID must be a string');
      }
      const { jsonString, hash } = serializeState(state);
      checkpoints.set(id, { jsonString, hash });
    },

    /**
     * Restore a checkpoint by its identifier.
     */
    restoreCheckpoint(id) {
      if (!checkpoints.has(id)) {
        throw new Error(`Checkpoint with ID '${id}' does not exist`);
      }
      const { jsonString } = checkpoints.get(id);
      return restoreState(jsonString);
    },

    /**
     * List all saved checkpoint IDs.
     */
    listCheckpoints() {
      return Array.from(checkpoints.keys());
    },

    /**
     * Compare two checkpoints by their IDs and return the diff.
     */
    compareCheckpoints(id1, id2) {
      if (!checkpoints.has(id1) || !checkpoints.has(id2)) {
        throw new Error('One or both checkpoint IDs do not exist');
      }
      const state1 = restoreState(checkpoints.get(id1).jsonString);
      const state2 = restoreState(checkpoints.get(id2).jsonString);
      return computeStateDiff(state1, state2);
    }
  };
};