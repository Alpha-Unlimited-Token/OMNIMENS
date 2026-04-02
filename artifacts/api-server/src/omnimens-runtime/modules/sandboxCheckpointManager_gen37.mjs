/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: sandboxCheckpointManager
 * Written: 2026-04-02T15:07:59.909Z
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

// Helper function to generate a hash for state comparison
function generateStateHash(state) {
  return createHash('sha256').update(JSON.stringify(state)).digest('hex');
}

// Checkpoint Manager Class
class CheckpointManager {
  constructor() {
    this.checkpoints = new Map(); // Stores checkpoints with hashes as keys
    this.currentState = null; // Tracks the current state
    this.currentHash = null; // Tracks the hash of the current state
  }

  // Save a checkpoint of the current state
  saveCheckpoint(state) {
    const stateHash = generateStateHash(state);

    if (!this.checkpoints.has(stateHash)) {
      this.checkpoints.set(stateHash, JSON.stringify(state));
    }

    this.currentState = state;
    this.currentHash = stateHash;
    return stateHash;
  }

  // Restore a state from a checkpoint
  restoreCheckpoint(stateHash) {
    if (!this.checkpoints.has(stateHash)) {
      throw new Error('Checkpoint not found.');
    }

    const restoredState = JSON.parse(this.checkpoints.get(stateHash));
    this.currentState = restoredState;
    this.currentHash = stateHash;
    return restoredState;
  }

  // Get the current state
  getCurrentState() {
    return this.currentState;
  }

  // Get the hash of the current state
  getCurrentHash() {
    return this.currentHash;
  }

  // Delete a specific checkpoint
  deleteCheckpoint(stateHash) {
    if (this.checkpoints.has(stateHash)) {
      this.checkpoints.delete(stateHash);
    }
  }

  // Clear all checkpoints
  clearAllCheckpoints() {
    this.checkpoints.clear();
    this.currentState = null;
    this.currentHash = null;
  }

  // Get a list of all checkpoint hashes
  listCheckpoints() {
    return Array.from(this.checkpoints.keys());
  }
}

// Exported functions for utility use
export function createCheckpointManager() {
  return new CheckpointManager();
}

export function calculateStateHash(state) {
  return generateStateHash(state);
}

export const isStateEqual = (state1, state2) => {
  return generateStateHash(state1) === generateStateHash(state2);
};

export const mergeStateDeltas = (baseState, deltaState) => {
  return { ...baseState, ...deltaState };
};

// Example: Exported constants for use in other modules
export const SANDBOX_ERROR_CODES = {
  CHECKPOINT_NOT_FOUND: 'CHECKPOINT_NOT_FOUND',
  INVALID_STATE: 'INVALID_STATE'
};