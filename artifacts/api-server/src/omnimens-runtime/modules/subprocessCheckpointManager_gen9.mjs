/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointManager
 * Written: 2026-04-02T14:10:50.944Z
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
import { writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';

// Utility to generate a unique checkpoint ID based on input state
export function generateCheckpointId(state) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(state));
  return hash.digest('hex');
}

// Save the intermediate state to a checkpoint file
export async function saveCheckpoint(checkpointId, state) {
  const filePath = `./checkpoint_${checkpointId}.json`;
  await writeFile(filePath, JSON.stringify(state, null, 2), 'utf-8');
}

// Load a checkpoint state if it exists
export async function loadCheckpoint(checkpointId) {
  const filePath = `./checkpoint_${checkpointId}.json`;
  try {
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // Checkpoint file does not exist
    }
    throw error; // Propagate other errors
  }
}

// Resume computation from a checkpoint or start fresh
export async function resumeOrStart(computationFunction, initialState, checkpointId) {
  const checkpointState = await loadCheckpoint(checkpointId);
  const state = checkpointState || initialState;

  const result = await computationFunction(state, async (intermediateState) => {
    const intermediateCheckpointId = generateCheckpointId(intermediateState);
    await saveCheckpoint(intermediateCheckpointId, intermediateState);
  });

  return result;
}

// Example computation function for testing
export async function exampleComputation(state, saveIntermediate) {
  for (let i = state.start; i <= state.end; i++) {
    state.current = i;
    await saveIntermediate(state);
  }
  return state;
}