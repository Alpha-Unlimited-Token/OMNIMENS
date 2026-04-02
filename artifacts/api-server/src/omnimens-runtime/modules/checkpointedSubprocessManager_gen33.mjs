/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: checkpointedSubprocessManager
 * Written: 2026-04-02T14:25:40.781Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// checkpointedSubprocessManager.mjs

import crypto from 'crypto';

// Utility to serialize and deserialize state
export function serializeState(stateObj) {
  return JSON.stringify(stateObj);
}

export function deserializeState(serializedState) {
  try {
    return JSON.parse(serializedState);
  } catch (error) {
    throw new Error('Failed to deserialize state: ' + error.message);
  }
}

// Generate a unique checkpoint ID
export function generateCheckpointId() {
  return crypto.randomUUID();
}

// TTL-based state persistence
const stateStore = new Map();

export function saveCheckpoint(checkpointId, state, ttlMs) {
  const expirationTime = Date.now() + ttlMs;
  stateStore.set(checkpointId, { state, expirationTime });
}

export function restoreCheckpoint(checkpointId) {
  const checkpoint = stateStore.get(checkpointId);
  if (!checkpoint) {
    throw new Error('Checkpoint not found: ' + checkpointId);
  }

  if (Date.now() > checkpoint.expirationTime) {
    stateStore.delete(checkpointId);
    throw new Error('Checkpoint expired: ' + checkpointId);
  }

  return checkpoint.state;
}

// Clean up expired checkpoints
export function cleanupExpiredCheckpoints() {
  const now = Date.now();
  for (const [key, value] of stateStore.entries()) {
    if (value.expirationTime <= now) {
      stateStore.delete(key);
    }
  }
}

// Example of sandboxed execution
export function executeWithCheckpointedState(checkpointId, stateInitializer, computationFunction) {
  let state;

  try {
    state = restoreCheckpoint(checkpointId);
  } catch {
    state = stateInitializer();
  }

  const updatedState = computationFunction(state);
  saveCheckpoint(checkpointId, updatedState, 60000); // Default TTL of 60 seconds

  return updatedState;
}

// Generic utility functions for cross-agent use
export function deepCloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}

export function calculateTTLRemaining(checkpointId) {
  const checkpoint = stateStore.get(checkpointId);
  if (!checkpoint) {
    return 0;
  }

  const remainingTime = checkpoint.expirationTime - Date.now();
  return remainingTime > 0 ? remainingTime : 0;
}