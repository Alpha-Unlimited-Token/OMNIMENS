/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:21:27.565Z
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

import { createHash } from 'crypto';

/**
 * In-memory vector store for fast embedding retrieval with automatic expiration.
 * Provides a lightweight, efficient cache for embedding vectors.
 */

const store = new Map();
const expirationTimes = new Map();

/**
 * Generates a unique hash key for a given embedding ID.
 * @param {string} id - The embedding ID.
 * @returns {string} - A hashed key.
 */
export function generateKey(id) {
  const hash = createHash('sha256');
  hash.update(id);
  return hash.digest('hex');
}

/**
 * Adds a vector to the in-memory store with an optional expiration time.
 * @param {string} id - The embedding ID.
 * @param {Array<number>} vector - The embedding vector.
 * @param {number} ttl - Time-to-live in milliseconds (default: 60000 ms).
 */
export function setVector(id, vector, ttl = 60000) {
  const key = generateKey(id);
  const expiration = Date.now() + ttl;

  store.set(key, vector);
  expirationTimes.set(key, expiration);

  // Schedule cleanup for expired entries
  setTimeout(() => {
    if (Date.now() >= expiration) {
      store.delete(key);
      expirationTimes.delete(key);
    }
  }, ttl);
}

/**
 * Retrieves a vector from the in-memory store by its embedding ID.
 * @param {string} id - The embedding ID.
 * @returns {Array<number>|null} - The embedding vector or null if not found or expired.
 */
export function getVector(id) {
  const key = generateKey(id);
  const expiration = expirationTimes.get(key);

  if (!expiration || Date.now() > expiration) {
    store.delete(key);
    expirationTimes.delete(key);
    return null;
  }

  return store.get(key) || null;
}

/**
 * Deletes a vector from the in-memory store by its embedding ID.
 * @param {string} id - The embedding ID.
 * @returns {boolean} - True if the vector was deleted, false otherwise.
 */
export function deleteVector(id) {
  const key = generateKey(id);
  const existed = store.delete(key);
  expirationTimes.delete(key);
  return existed;
}

/**
 * Clears all vectors and expiration times from the in-memory store.
 */
export function clearStore() {
  store.clear();
  expirationTimes.clear();
}

/**
 * Retrieves the current size of the in-memory store.
 * @returns {number} - The number of stored vectors.
 */
export function getStoreSize() {
  return store.size;
}

/**
 * Retrieves all keys currently in the store (for debugging or inspection).
 * @returns {Array<string>} - List of all embedding IDs (hashed).
 */
export function getAllKeys() {
  return Array.from(store.keys());
}

/**
 * Calculates the cosine similarity between two vectors.
 * @param {Array<number>} vectorA - The first vector.
 * @param {Array<number>} vectorB - The second vector.
 * @returns {number} - The cosine similarity (range: -1 to 1).
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}
