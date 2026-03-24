/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: persistentReplStateManager
 * Written: 2026-03-24T23:11:48.820Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const algorithm = 'aes-256-gcm';
const key = randomBytes(32); // Replace with a securely stored key
const ivLength = 12; // Recommended length for GCM

/**
 * Encrypts and compresses a JavaScript object into a secure, serialized format.
 * @param {Object} data - The object to encrypt.
 * @returns {string} - Encrypted, base64-encoded string.
 */
export function encryptState(data) {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(algorithm, key, iv);

  const jsonData = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(jsonData, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString('base64'),
    encryptedData: encrypted.toString('base64'),
    authTag: authTag.toString('base64')
  });
}

/**
 * Decrypts and decompresses an encrypted, serialized object.
 * @param {string} encryptedState - The encrypted, base64-encoded string.
 * @returns {Object} - The original object.
 */
export function decryptState(encryptedState) {
  const { iv, encryptedData, authTag } = JSON.parse(encryptedState);

  const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, 'base64')),
    decipher.final()
  ]);

  return JSON.parse(decrypted.toString('utf8'));
}

/**
 * Stores the encrypted state with a TTL (time-to-live) in memory.
 * @param {Map} store - A Map object to hold the states.
 * @param {string} key - The key to associate with the state.
 * @param {Object} state - The REPL state to store.
 * @param {number} ttl - Time-to-live in milliseconds.
 */
export function storeState(store, key, state, ttl) {
  const encryptedState = encryptState(state);
  const expirationTime = Date.now() + ttl;

  store.set(key, { encryptedState, expirationTime });

  // Cleanup expired states
  setTimeout(() => {
    if (store.has(key) && store.get(key).expirationTime <= Date.now()) {
      store.delete(key);
    }
  }, ttl);
}

/**
 * Retrieves and decrypts a stored state if it has not expired.
 * @param {Map} store - A Map object holding the states.
 * @param {string} key - The key associated with the state.
 * @returns {Object|null} - The decrypted state or null if expired/not found.
 */
export function retrieveState(store, key) {
  const entry = store.get(key);

  if (!entry || entry.expirationTime <= Date.now()) {
    store.delete(key);
    return null;
  }

  return decryptState(entry.encryptedState);
}

/**
 * Utility function to clear all expired states from the store.
 * @param {Map} store - A Map object holding the states.
 */
export function clearExpiredStates(store) {
  const now = Date.now();

  for (const [key, { expirationTime }] of store.entries()) {
    if (expirationTime <= now) {
      store.delete(key);
    }
  }
}

// Example usage (not exported):
// const replStore = new Map();
// storeState(replStore, 'session1', { foo: 'bar' }, 60000);
// const state = retrieveState(replStore, 'session1');
