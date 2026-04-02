/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: asyncTaskResumer
 * Written: 2026-04-02T14:10:42.296Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// asyncTaskResumer.mjs

import { createHash } from 'crypto';

// Utility to serialize and hash computation state
export function serializeState(state) {
  const serialized = JSON.stringify(state);
  const hash = createHash('sha256').update(serialized).digest('hex');
  return { serialized, hash };
}

// Utility to checkpoint state at regular intervals
export function checkpointState(state, intervalMs, callback) {
  let lastCheckpoint = Date.now();

  return function periodicCheckpoint() {
    const now = Date.now();
    if (now - lastCheckpoint >= intervalMs) {
      const { serialized, hash } = serializeState(state);
      callback(serialized, hash);
      lastCheckpoint = now;
    }
  };
}

// Restore computation state from serialized data
export function restoreState(serializedState) {
  try {
    return JSON.parse(serializedState);
  } catch (error) {
    throw new Error('Failed to restore state: Invalid serialized data');
  }
}

// Resumable computation executor
export async function resumableComputation(initialState, computeFunction, checkpointCallback, intervalMs = 1000) {
  let state = initialState;
  const checkpoint = checkpointState(state, intervalMs, checkpointCallback);

  for await (const result of computeFunction(state)) {
    state = result;
    checkpoint();
  }

  return state;
}

// Example generic utility: Create a range generator for computations
export function* rangeGenerator(start, end, step = 1) {
  for (let i = start; i <= end; i += step) {
    yield i;
  }
}

// Example generic utility: Compute Fibonacci sequence
export function* fibonacciGenerator(limit) {
  let [a, b] = [0, 1];
  while (a <= limit) {
    yield a;
    [a, b] = [b, a + b];
  }
}