/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticMemoryIndex
 * Written: 2026-03-23T09:12:54.796Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * @module semanticMemoryIndex
 * @description Implements a semantic memory index for storing and retrieving conversational embeddings using approximate nearest neighbor search.
 * @exports {function} addEmbedding - Adds an embedding to the memory index.
 * @exports {function} queryEmbedding - Queries the memory index for the closest embeddings to a given vector.
 */

/**
 * Memory index to store embeddings and associated metadata.
 * @type {Array<{embedding: number[], metadata: object}>}
 */
const memoryIndex = [];

/**
 * Computes the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Euclidean distance between the vectors.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimensions.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * Adds an embedding to the memory index.
 * @param {number[]} embedding - The embedding vector to store.
 * @param {object} metadata - Metadata associated with the embedding (e.g., conversation context).
 */
export function addEmbedding(embedding, metadata) {
  if (!Array.isArray(embedding) || embedding.some(isNaN)) {
    throw new Error("Embedding must be an array of numbers.");
  }
  memoryIndex.push({ embedding, metadata });
}

/**
 * Queries the memory index for the closest embeddings to a given vector.
 * @param {number[]} queryVector - The vector to search for.
 * @param {number} k - The number of nearest neighbors to retrieve.
 * @returns {Array<{embedding: number[], metadata: object, distance: number}>} - The k nearest neighbors, sorted by distance.
 */
export function queryEmbedding(queryVector, k) {
  if (!Array.isArray(queryVector) || queryVector.some(isNaN)) {
    throw new Error("Query vector must be an array of numbers.");
  }
  if (typeof k !== "number" || k <= 0 || !Number.isInteger(k)) {
    throw new Error("k must be a positive integer.");
  }

  const distances = memoryIndex.map(({ embedding, metadata }) => {
    const distance = euclideanDistance(queryVector, embedding);
    return { embedding, metadata, distance };
  });

  distances.sort((a, b) => a.distance - b.distance);

  return distances.slice(0, k);
}

/**
 * Clears all embeddings from the memory index.
 */
export function clearMemoryIndex() {
  memoryIndex.length = 0;
}

/**
 * Gets the current size of the memory index.
 * @returns {number} - The number of embeddings stored in the index.
 */
export function getMemoryIndexSize() {
  return memoryIndex.length;
}