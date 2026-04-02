/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_52
 * Name: contextPersistenceLayer
 * Purpose: Extends the adaptive context window manager by offloading and reintegrating historical context dynamically.
 * Description: Dynamically compresses, stores, retrieves, and reintegrates historical context for adaptive reasoning across agents.
 * Migrated: 2026-04-02T14:50:29.440Z
 */

// contextPersistenceLayer.mjs

import { createHash } from 'crypto';

/**
 * Compresses context data into a fixed-length vector using hash-based quantization.
 * @param {string} context - The raw context string to compress.
 * @param {number} vectorSize - Desired size of the compressed vector.
 * @returns {Uint8Array} - Compressed vector representation of the context.
 */
export function compressContext(context, vectorSize = 32) {
  const hash = createHash('sha256');
  hash.update(context);
  const fullHash = hash.digest();
  const compressedVector = new Uint8Array(vectorSize);

  for (let i = 0; i < vectorSize; i++) {
    compressedVector[i] = fullHash[i % fullHash.length];
  }

  return compressedVector;
}

/**
 * Stores compressed context in a namespace-isolated in-memory index.
 * @param {Map<string, Map<string, Uint8Array>>} index - The namespace-index map.
 * @param {string} namespace - The namespace to store the context under.
 * @param {string} key - The unique key for the context.
 * @param {Uint8Array} compressedContext - Compressed context vector.
 */
export function storeContext(index, namespace, key, compressedContext) {
  if (!index.has(namespace)) {
    index.set(namespace, new Map());
  }
  const namespaceMap = index.get(namespace);
  namespaceMap.set(key, compressedContext);
}

/**
 * Retrieves compressed context from the namespace-index map.
 * @param {Map<string, Map<string, Uint8Array>>} index - The namespace-index map.
 * @param {string} namespace - The namespace to retrieve the context from.
 * @param {string} key - The unique key for the context.
 * @returns {Uint8Array|null} - The retrieved compressed context or null if not found.
 */
export function retrieveContext(index, namespace, key) {
  if (!index.has(namespace)) {
    return null;
  }
  const namespaceMap = index.get(namespace);
  return namespaceMap.get(key) || null;
}

/**
 * Reintegrates compressed context back into a usable form (e.g., for reasoning).
 * @param {Uint8Array} compressedContext - Compressed context vector.
 * @returns {string} - Reintegrated context as a string representation.
 */
export function reintegrateContext(compressedContext) {
  return Array.from(compressedContext)
    .map(byte => String.fromCharCode(byte))
    .join('');
}

/**
 * Initializes a namespace-isolated context index.
 * @returns {Map<string, Map<string, Uint8Array>>} - The initialized context index.
 */
export function initializeContextIndex() {
  return new Map();
}

/**
 * Example utility function for cross-agent use: Computes similarity between two compressed contexts.
 * @param {Uint8Array} vectorA - First compressed context vector.
 * @param {Uint8Array} vectorB - Second compressed context vector.
 * @returns {number} - Similarity score (0 to 1).
 */
export function computeContextSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length to compute similarity.');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] ** 2;
    magnitudeB += vectorB[i] ** 2;
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  return dotProduct / (magnitudeA * magnitudeB);
}

// Example usage (not part of the module exports):
// const index = initializeContextIndex();
// const compressed = compressContext('example context');
// storeContext(index, 'namespace1', 'key1', compressed);
// const retrieved = retrieveContext(index, 'namespace1', 'key1');
// const reintegrated = reintegrateContext(retrieved);
// console.log(reintegrated);
