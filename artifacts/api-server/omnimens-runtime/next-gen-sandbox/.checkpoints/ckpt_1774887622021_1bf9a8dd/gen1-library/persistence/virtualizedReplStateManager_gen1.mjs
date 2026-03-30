/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: virtualizedReplStateManager
 * Purpose: Persist REPL state across executions to enable iterative refinement and multi-step computations.
 * Description: A utility module for persisting and managing REPL state across executions using AES-256-GCM encryption with auto-compaction and TTL expiration.
 * Migrated: 2026-03-25T22:49:34.119Z
 */

// Complete ES module code here

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ALGORITHM = 'aes-256-gcm';
const KEY = randomBytes(32); // Replace with securely stored key in production
const IV_LENGTH = 12; // Recommended length for GCM IV
const SNAPSHOT_FILE = resolve('./repl_state_snapshot.json');

/**
 * Encrypts data using AES-256-GCM.
 * @param {Buffer} key - The encryption key.
 * @param {Object} data - The data to encrypt.
 * @returns {Object} - The encrypted payload with ciphertext, IV, and auth tag.
 */
export function encryptState(key, data) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const serializedData = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(serializedData, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return { ciphertext: encrypted.toString('hex'), iv: iv.toString('hex'), authTag: authTag.toString('hex') };
}

/**
 * Decrypts data using AES-256-GCM.
 * @param {Buffer} key - The decryption key.
 * @param {Object} encryptedPayload - The encrypted payload with ciphertext, IV, and auth tag.
 * @returns {Object} - The decrypted data.
 */
export function decryptState(key, encryptedPayload) {
  const { ciphertext, iv, authTag } = encryptedPayload;
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'hex')),
    decipher.final()
  ]);

  return JSON.parse(decrypted.toString('utf8'));
}

/**
 * Saves the current REPL state to a file.
 * @param {Object} state - The state to persist.
 */
export function saveState(state) {
  const encryptedState = encryptState(KEY, state);
  writeFileSync(SNAPSHOT_FILE, JSON.stringify(encryptedState, null, 2), 'utf8');
}

/**
 * Loads the persisted REPL state from a file.
 * @returns {Object} - The decrypted state, or an empty object if no state exists.
 */
export function loadState() {
  if (!existsSync(SNAPSHOT_FILE)) return {};

  const encryptedState = JSON.parse(readFileSync(SNAPSHOT_FILE, 'utf8'));
  return decryptState(KEY, encryptedState);
}

/**
 * Clears expired or unnecessary state data based on TTL.
 * @param {Object} state - The current state.
 * @param {number} ttl - Time-to-live in milliseconds.
 * @returns {Object} - The compacted state.
 */
export function compactState(state, ttl) {
  const now = Date.now();
  const compactedState = {};

  for (const [key, { value, timestamp }] of Object.entries(state)) {
    if (now - timestamp <= ttl) {
      compactedState[key] = { value, timestamp };
    }
  }

  return compactedState;
}

/**
 * Periodically compacts the state and saves it.
 * @param {number} ttl - Time-to-live in milliseconds.
 * @param {number} interval - Compaction interval in milliseconds.
 */
export function startAutoCompaction(ttl, interval) {
  setInterval(() => {
    const state = loadState();
    const compactedState = compactState(state, ttl);
    saveState(compactedState);
  }, interval);
}

/**
 * Updates the state with new data and timestamps.
 * @param {Object} state - The current state.
 * @param {string} key - The key to update.
 * @param {any} value - The value to store.
 * @returns {Object} - The updated state.
 */
export function updateState(state, key, value) {
  const timestamp = Date.now();
  state[key] = { value, timestamp };
  return state;
}

// Example Usage:
// const state = loadState();
// const updatedState = updateState(state, 'exampleKey', 'exampleValue');
// saveState(updatedState);
// startAutoCompaction(60000, 300000);