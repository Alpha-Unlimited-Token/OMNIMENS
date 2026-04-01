/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: stateCheckpointingSystem
 * Written: 2026-04-01T22:19:32.209Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// stateCheckpointingSystem.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given object to track changes efficiently.
 * @param {object} obj - The object to hash.
 * @returns {string} - The hash of the object.
 */
export function generateObjectHash(obj) {
  const jsonString = JSON.stringify(obj);
  const hash = createHash('sha256');
  hash.update(jsonString);
  return hash.digest('hex');
}

/**
 * Creates a new checkpointing system instance.
 * @returns {object} - The checkpointing system with methods to manage state.
 */
export function createCheckpointingSystem() {
  const snapshots = [];
  const hashes = new Set();

  /**
   * Saves a snapshot of the current state with delta encoding.
   * @param {object} currentState - The current state to checkpoint.
   */
  function saveCheckpoint(currentState) {
    const currentHash = generateObjectHash(currentState);

    if (!hashes.has(currentHash)) {
      snapshots.push(currentState);
      hashes.add(currentHash);
    }
  }

  /**
   * Retrieves the latest checkpointed state.
   * @returns {object|null} - The latest checkpointed state or null if none exists.
   */
  function getLatestCheckpoint() {
    return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  }

  /**
   * Retrieves all checkpointed states.
   * @returns {object[]} - Array of all checkpointed states.
   */
  function getAllCheckpoints() {
    return [...snapshots];
  }

  return {
    saveCheckpoint,
    getLatestCheckpoint,
    getAllCheckpoints
  };
}

/**
 * Compares two states and returns the differences between them.
 * @param {object} stateA - The first state.
 * @param {object} stateB - The second state.
 * @returns {object} - The differences between the two states.
 */
export function computeStateDelta(stateA, stateB) {
  const delta = {};

  for (const key in stateB) {
    if (stateA[key] !== stateB[key]) {
      delta[key] = stateB[key];
    }
  }

  return delta;
}

/**
 * Merges a delta into a base state to reconstruct the full state.
 * @param {object} baseState - The base state.
 * @param {object} delta - The delta to apply.
 * @returns {object} - The reconstructed state.
 */
export function applyDeltaToState(baseState, delta) {
  return { ...baseState, ...delta };
}