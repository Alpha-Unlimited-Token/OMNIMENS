/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_2
 * Name: checkpointPersistenceManager
 * Purpose: Serializes intermediate computation states to disk for pseudo-persistent background processing.
 * Description: Serializes intermediate computation states to disk with TTL-based expiration and auto-compaction.
 * Migrated: 2026-03-25T22:49:34.140Z
 */

// checkpointPersistenceManager.mjs

import { writeFile, readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const DEFAULT_TTL = 3600; // Default Time-To-Live in seconds
const CHECKPOINT_DIR = resolve('./checkpoints');

/**
 * Serialize a computation state to disk with TTL.
 * @param {string} key - Unique identifier for the state.
 * @param {object} state - The computation state to persist.
 * @param {number} ttl - Time-to-live in seconds.
 * @returns {Promise<void>} Resolves when the state is saved.
 */
export async function saveCheckpoint(key, state, ttl = DEFAULT_TTL) {
  const expirationTime = Date.now() + ttl * 1000;
  const data = { state, expirationTime };
  const filePath = resolve(CHECKPOINT_DIR, generateHash(key));
  await writeFile(filePath, JSON.stringify(data), 'utf8');
}

/**
 * Retrieve a computation state from disk.
 * @param {string} key - Unique identifier for the state.
 * @returns {Promise<object|null>} The saved state or null if expired/not found.
 */
export async function loadCheckpoint(key) {
  const filePath = resolve(CHECKPOINT_DIR, generateHash(key));
  try {
    const fileData = await readFile(filePath, 'utf8');
    const { state, expirationTime } = JSON.parse(fileData);
    if (Date.now() > expirationTime) {
      return null; // State expired
    }
    return state;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // File not found
    }
    throw error; // Unexpected error
  }
}

/**
 * Periodically compact expired states.
 * @param {number} interval - Interval in milliseconds for compaction.
 * @returns {void} Starts the compaction process.
 */
export function startAutoCompaction(interval = 60000) {
  setInterval(async () => {
    try {
      const files = await stat(CHECKPOINT_DIR);
      for (const file of files) {
        const filePath = resolve(CHECKPOINT_DIR, file);
        const fileData = await readFile(filePath, 'utf8');
        const { expirationTime } = JSON.parse(fileData);
        if (Date.now() > expirationTime) {
          await unlink(filePath); // Remove expired file
        }
      }
    } catch (error) {
      console.error('Error during auto-compaction:', error);
    }
  }, interval);
}

/**
 * Generate a hash for a given key.
 * @param {string} key - Input key.
 * @returns {string} Hashed key.
 */
function generateHash(key) {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Exported utility functions for cross-agent use.
 */
export const utils = {
  generateHash,
  DEFAULT_TTL
};