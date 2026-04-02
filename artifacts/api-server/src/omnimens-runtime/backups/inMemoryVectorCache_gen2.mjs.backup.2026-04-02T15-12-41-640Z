/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorCache
 * Written: 2026-04-01T22:10:50.413Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// inMemoryVectorCache.mjs

import { createHash } from 'crypto';

// Utility function to calculate cosine similarity between two vectors
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Hash function for unique vector keys
export function generateVectorKey(vector) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(vector));
  return hash.digest('hex');
}

// In-memory vector store
const vectorStore = new Map();

// Add a vector to the store
export function addVector(key, vector) {
  if (!Array.isArray(vector) || vector.some(isNaN)) {
    throw new Error('Vector must be an array of numbers');
  }
  vectorStore.set(key, vector);
}

// Retrieve a vector by key
export function getVector(key) {
  return vectorStore.get(key) || null;
}

// Find the nearest vector(s) to a given query vector
export function findNearestVectors(queryVector, maxResults = 5) {
  if (!Array.isArray(queryVector) || queryVector.some(isNaN)) {
    throw new Error('Query vector must be an array of numbers');
  }
  const similarities = [];
  for (const [key, vector] of vectorStore.entries()) {
    const similarity = cosineSimilarity(queryVector, vector);
    similarities.push({ key, similarity });
  }
  similarities.sort((a, b) => b.similarity - a.similarity);
  return similarities.slice(0, maxResults);
}

// Clear all vectors from the store
export function clearVectorStore() {
  vectorStore.clear();
}

// Exported for introspection or debugging
export function getAllVectors() {
  return Array.from(vectorStore.entries());
}